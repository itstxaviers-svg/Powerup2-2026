import base64
import contextvars
import hashlib
import hmac
import json
import os
import re
import secrets
import time
import traceback
import uuid
from datetime import datetime, timezone

import ydb
import ydb.iam

_driver = None
_pool = None
PIN_ITERATIONS = 180_000
SYNC_TYPES = {"game.snapshot", "attempt.recorded"}
_request_origin = contextvars.ContextVar("request_origin", default="")


def _cors_headers():
    configured = os.environ.get("ALLOWED_ORIGINS") or os.environ.get("ALLOWED_ORIGIN") or "*"
    allowed = [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]
    requested = _request_origin.get().rstrip("/")
    allow_origin = "*" if "*" in allowed else (requested if requested in allowed else (allowed[0] if allowed else "null"))
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Bootstrap-Secret",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Vary": "Origin",
    }


def _response(status, body):
    return {"statusCode": status, "headers": _cors_headers(), "body": json.dumps(body, ensure_ascii=False)}


def _body(event):
    raw = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode("utf-8")
    try:
        value = json.loads(raw)
        return value if isinstance(value, dict) else {}
    except (ValueError, TypeError):
        return {}


def _path(event):
    context = event.get("requestContext") or {}
    return (((context.get("http") or {}).get("path")) or event.get("url") or event.get("path") or "/").rstrip("/") or "/"


def _method(event):
    context = event.get("requestContext") or {}
    return (((context.get("http") or {}).get("method")) or event.get("httpMethod") or "GET").upper()


def _db():
    global _driver, _pool
    if _pool is not None:
        return _pool
    _driver = ydb.Driver(endpoint=os.environ["YDB_ENDPOINT"], database=os.environ["YDB_DATABASE"], credentials=ydb.iam.MetadataUrlCredentials())
    _driver.wait(timeout=10, fail_fast=True)
    _pool = ydb.SessionPool(_driver, size=5)
    return _pool


def _typed(value):
    if isinstance(value, datetime):
        utc = value.astimezone(timezone.utc) if value.tzinfo else value.replace(tzinfo=timezone.utc)
        elapsed = utc - datetime(1970, 1, 1, tzinfo=timezone.utc)
        return ((elapsed.days * 86400 + elapsed.seconds) * 1_000_000) + elapsed.microseconds
    return value if isinstance(value, (bool, int, float)) else str(value)


def _query(text, **values):
    parameters = {f"${key}": _typed(value) for key, value in values.items()}

    def execute(session):
        return session.transaction().execute(session.prepare(text), parameters, commit_tx=True)

    return _db().retry_operation_sync(execute)


def _rows(result):
    return list(result[0].rows) if result else []


def _value(row, key):
    try:
        return row[key]
    except (KeyError, TypeError):
        return getattr(row, key)


def _utcnow():
    return datetime.now(timezone.utc)


def _timestamp_iso(value):
    if isinstance(value, datetime):
        return value.isoformat().replace("+00:00", "Z")
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value / 1_000_000, timezone.utc).isoformat().replace("+00:00", "Z")
    return str(value)


def _hash_secret(value):
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", value.encode(), salt, PIN_ITERATIONS)
    return f"{PIN_ITERATIONS}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def _verify_secret(value, stored):
    try:
        iterations, salt, expected = stored.split("$", 2)
        actual = hashlib.pbkdf2_hmac("sha256", value.encode(), base64.urlsafe_b64decode(salt), int(iterations))
        return hmac.compare_digest(actual, base64.urlsafe_b64decode(expected))
    except (ValueError, TypeError):
        return False


def _b64(value):
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def _unb64(value):
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _issue_token(role, subject_id, extra=None):
    lifetime_days = 90 if role == "teacher" else 30
    expires = int(time.time()) + 86400 * lifetime_days
    payload = {"role": role, "sub": subject_id, "exp": expires, **(extra or {})}
    encoded = _b64(json.dumps(payload, separators=(",", ":")).encode())
    signature = _b64(hmac.new(os.environ["AUTH_SECRET"].encode(), encoded.encode(), hashlib.sha256).digest())
    public = {key: value for key, value in (extra or {}).items() if key in {"studentCode", "joinCode"}}
    return {"token": f"{encoded}.{signature}", "role": role, "subjectId": subject_id, "expiresAt": datetime.fromtimestamp(expires, timezone.utc).isoformat().replace("+00:00", "Z"), **public}


def _authenticate(event, role=None):
    headers = {str(key).lower(): value for key, value in (event.get("headers") or {}).items()}
    authorization = headers.get("authorization", "")
    if not authorization.startswith("Bearer "):
        return None
    try:
        encoded, signature = authorization[7:].split(".", 1)
        expected = _b64(hmac.new(os.environ["AUTH_SECRET"].encode(), encoded.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            return None
        payload = json.loads(_unb64(encoded))
        if int(payload.get("exp", 0)) <= int(time.time()) or (role and payload.get("role") != role):
            return None
        return payload
    except (ValueError, TypeError, json.JSONDecodeError):
        return None


def _find_student(student_code):
    rows = _rows(_query("""
        DECLARE $student_code AS Utf8;
        SELECT student_code, student_id, display_name, group_id, group_display_name, join_code, avatar_id, pin_hash, created_at
        FROM students WHERE student_code = $student_code;
    """, student_code=student_code))
    return rows[0] if rows else None


def _student_for_identity(identity):
    if not identity:
        return None
    student = _find_student(str(identity.get("studentCode", "")))
    return student if student and _value(student, "student_id") == identity.get("sub") else None


def _profile(row):
    created_iso = _timestamp_iso(_value(row, "created_at"))
    created_ms = int(datetime.fromisoformat(created_iso.replace("Z", "+00:00")).timestamp() * 1000)
    return {
        "playerId": _value(row, "student_id"),
        "studentCode": _value(row, "student_code"),
        "name": _value(row, "display_name"),
        "group": _value(row, "group_display_name"),
        "joinCode": _value(row, "join_code"),
        "avatarId": int(_value(row, "avatar_id")),
        "createdAt": created_ms,
    }


def _game_for_student(student_id):
    rows = _rows(_query("""
        DECLARE $student_id AS Utf8;
        SELECT payload FROM game_snapshots WHERE student_id = $student_id;
    """, student_id=student_id))
    return json.loads(_value(rows[0], "payload")) if rows else None


def _register_student(data):
    name = str(data.get("displayName", "")).strip()[:32]
    join_code = str(data.get("joinCode", "")).strip().upper()[:24]
    pin = str(data.get("pin", ""))
    try:
        avatar_id = int(data.get("avatarId", 1))
    except (ValueError, TypeError):
        avatar_id = 0
    if not name or not re.fullmatch(r"\d{6}", pin) or not 1 <= avatar_id <= 10:
        return _response(400, {"message": "Check the name, avatar, and 6-digit PIN."})
    groups = _rows(_query("""
        DECLARE $join_code AS Utf8;
        SELECT group_id, display_name FROM groups WHERE join_code = $join_code;
    """, join_code=join_code))
    if not groups:
        return _response(404, {"message": "Group not found. Check the code with your teacher."})
    stem = re.sub(r"[^A-Z0-9]", "", name.upper())[:8] or "PLAYER"
    student_code = None
    for _ in range(10):
        candidate = f"{stem}-{secrets.randbelow(900) + 100}"
        if _find_student(candidate) is None:
            student_code = candidate
            break
    if not student_code:
        return _response(503, {"message": "Could not create an ID. Try again."})
    student_id, now = str(uuid.uuid4()), _utcnow()
    group_id, group_name = _value(groups[0], "group_id"), _value(groups[0], "display_name")
    _query("""
        DECLARE $student_code AS Utf8; DECLARE $student_id AS Utf8; DECLARE $name AS Utf8;
        DECLARE $group_id AS Utf8; DECLARE $group_name AS Utf8; DECLARE $join_code AS Utf8;
        DECLARE $avatar_id AS Utf8; DECLARE $pin_hash AS Utf8; DECLARE $now AS Timestamp;
        UPSERT INTO students (student_code, student_id, display_name, group_id, group_display_name, join_code, avatar_id, pin_hash, created_at, updated_at)
        VALUES ($student_code, $student_id, $name, $group_id, $group_name, $join_code, $avatar_id, $pin_hash, $now, $now);
        UPSERT INTO group_members (group_id, student_id, student_code) VALUES ($group_id, $student_id, $student_code);
    """, student_code=student_code, student_id=student_id, name=name, group_id=group_id, group_name=group_name, join_code=join_code, avatar_id=avatar_id, pin_hash=_hash_secret(pin), now=now)
    student = _find_student(student_code)
    return _response(201, {"session": _issue_token("student", student_id, {"studentCode": student_code}), "profile": _profile(student), "game": None})


def _login_student(data):
    student_code = str(data.get("studentCode", "")).strip().upper()[:40]
    student = _find_student(student_code)
    if not student or not _verify_secret(str(data.get("pin", "")), _value(student, "pin_hash")):
        return _response(401, {"message": "Explorer ID or PIN is not correct."})
    student_id = _value(student, "student_id")
    return _response(200, {"session": _issue_token("student", student_id, {"studentCode": student_code}), "profile": _profile(student), "game": _game_for_student(student_id)})


def _bootstrap_teacher(event, data):
    headers = {str(key).lower(): value for key, value in (event.get("headers") or {}).items()}
    supplied = str(headers.get("x-bootstrap-secret", ""))
    if not supplied or not hmac.compare_digest(supplied, os.environ.get("BOOTSTRAP_SECRET", "disabled")):
        return _response(403, {"message": "Bootstrap access denied."})
    email = str(data.get("email", "")).strip().lower()[:120]
    password = str(data.get("password", ""))
    display_name = str(data.get("displayName", "Teacher")).strip()[:60]
    group_name = str(data.get("groupName", "Power Up 2")).strip()[:80]
    join_code = str(data.get("joinCode", "")).strip().upper()[:24]
    if "@" not in email or len(password) < 10 or not re.fullmatch(r"[A-Z0-9-]{4,24}", join_code):
        return _response(400, {"message": "Use a valid email, password of 10+ characters, and join code."})
    teacher_id, group_id, now = str(uuid.uuid4()), str(uuid.uuid4()), _utcnow()
    _query("""
        DECLARE $email AS Utf8; DECLARE $teacher_id AS Utf8; DECLARE $display_name AS Utf8;
        DECLARE $password_hash AS Utf8; DECLARE $join_code AS Utf8; DECLARE $group_id AS Utf8;
        DECLARE $group_name AS Utf8; DECLARE $now AS Timestamp;
        UPSERT INTO teachers (email, teacher_id, display_name, password_hash, join_code, created_at)
        VALUES ($email, $teacher_id, $display_name, $password_hash, $join_code, $now);
        UPSERT INTO groups (join_code, group_id, teacher_id, display_name, created_at)
        VALUES ($join_code, $group_id, $teacher_id, $group_name, $now);
    """, email=email, teacher_id=teacher_id, display_name=display_name, password_hash=_hash_secret(password), join_code=join_code, group_id=group_id, group_name=group_name, now=now)
    return _response(201, {"ok": True, "joinCode": join_code})


def _login_teacher(data):
    email = str(data.get("email", "")).strip().lower()[:120]
    rows = _rows(_query("""
        DECLARE $email AS Utf8;
        SELECT teacher_id, password_hash, join_code FROM teachers WHERE email = $email;
    """, email=email))
    teacher = rows[0] if rows else None
    if not teacher or not _verify_secret(str(data.get("password", "")), _value(teacher, "password_hash")):
        return _response(401, {"message": "Email or password is not correct."})
    token = _issue_token("teacher", _value(teacher, "teacher_id"), {"joinCode": _value(teacher, "join_code")})
    return _response(200, {"session": token})


def _sync_events(event, data):
    identity = _authenticate(event, "student")
    if not _student_for_identity(identity):
        return _response(401, {"message": "Please sign in again."})
    events = data.get("events")
    if not isinstance(events, list) or len(events) > 50:
        return _response(400, {"message": "Send up to 50 sync events."})
    acknowledged, student_id = [], identity["sub"]
    for item in events:
        if not isinstance(item, dict) or item.get("studentId") != student_id or item.get("type") not in SYNC_TYPES:
            continue
        event_id, payload = str(item.get("id", ""))[:80], item.get("payload")
        if not event_id or not isinstance(payload, dict):
            continue
        duplicate = _rows(_query("""
            DECLARE $student_id AS Utf8; DECLARE $event_id AS Utf8;
            SELECT event_id FROM sync_events WHERE student_id = $student_id AND event_id = $event_id;
        """, student_id=student_id, event_id=event_id))
        if duplicate:
            acknowledged.append(event_id)
            continue
        payload_json, now = json.dumps(payload, ensure_ascii=False, separators=(",", ":")), _utcnow()
        if item["type"] == "game.snapshot":
            if str((payload.get("profile") or {}).get("playerId", "")) != student_id:
                continue
            _query("""
                DECLARE $student_id AS Utf8; DECLARE $payload AS Json; DECLARE $now AS Timestamp;
                UPSERT INTO game_snapshots (student_id, payload, updated_at) VALUES ($student_id, $payload, $now);
            """, student_id=student_id, payload=payload_json, now=now)
        else:
            occurred_at = datetime.fromisoformat(str(item.get("occurredAt", now.isoformat())).replace("Z", "+00:00"))
            _query("""
                DECLARE $student_id AS Utf8; DECLARE $occurred_at AS Timestamp; DECLARE $event_id AS Utf8; DECLARE $payload AS Json;
                UPSERT INTO attempt_events (student_id, occurred_at, event_id, payload) VALUES ($student_id, $occurred_at, $event_id, $payload);
            """, student_id=student_id, occurred_at=occurred_at, event_id=event_id, payload=payload_json)
        _query("""
            DECLARE $student_id AS Utf8; DECLARE $event_id AS Utf8; DECLARE $now AS Timestamp;
            UPSERT INTO sync_events (student_id, event_id, received_at) VALUES ($student_id, $event_id, $now);
        """, student_id=student_id, event_id=event_id, now=now)
        acknowledged.append(event_id)
    return _response(200, {"acknowledgedIds": acknowledged})


def _teacher_group(identity):
    rows = _rows(_query("""
        DECLARE $join_code AS Utf8;
        SELECT group_id, display_name FROM groups WHERE join_code = $join_code;
    """, join_code=identity.get("joinCode", "")))
    return rows[0] if rows else None


def _teacher_dashboard(event):
    identity = _authenticate(event, "teacher")
    if not identity:
        return _response(401, {"message": "Teacher login required."})
    group = _teacher_group(identity)
    if not group:
        return _response(404, {"message": "Teacher group not found."})
    members = _rows(_query("""
        DECLARE $group_id AS Utf8;
        SELECT student_id, student_code FROM group_members WHERE group_id = $group_id;
    """, group_id=_value(group, "group_id")))
    students = []
    for member in members:
        student_id = _value(member, "student_id")
        student = _find_student(_value(member, "student_code"))
        if not student:
            continue
        attempts = _rows(_query("""
            DECLARE $student_id AS Utf8;
            SELECT event_id, occurred_at, payload FROM attempt_events
            WHERE student_id = $student_id ORDER BY occurred_at DESC LIMIT 80;
        """, student_id=student_id))
        recent = [{"id": _value(row, "event_id"), "occurredAt": _timestamp_iso(_value(row, "occurred_at")), "payload": json.loads(_value(row, "payload"))} for row in attempts]
        students.append({"profile": _profile(student), "game": _game_for_student(student_id), "recentAttempts": recent})
    group_payload = {"joinCode": identity.get("joinCode", ""), "displayName": _value(group, "display_name")}
    return _response(200, {"group": group_payload, "students": students})


def _teacher_student(event, data, action):
    identity = _authenticate(event, "teacher")
    if not identity:
        return _response(401, {"message": "Teacher login required."})
    student_code = str(data.get("studentCode", "")).strip().upper()[:40]
    group, student = _teacher_group(identity), _find_student(student_code)
    if not group or not student or _value(student, "group_id") != _value(group, "group_id"):
        return _response(404, {"message": "Student not found in this group."})
    if action == "reset":
        pin = f"{secrets.randbelow(1_000_000):06d}"
        _query("""
            DECLARE $student_code AS Utf8; DECLARE $pin_hash AS Utf8; DECLARE $now AS Timestamp;
            UPDATE students SET pin_hash = $pin_hash, updated_at = $now WHERE student_code = $student_code;
        """, student_code=student_code, pin_hash=_hash_secret(pin), now=_utcnow())
        return _response(200, {"ok": True, "temporaryPin": pin})
    student_id, group_id = _value(student, "student_id"), _value(group, "group_id")
    _query("""
        DECLARE $student_id AS Utf8; DECLARE $student_code AS Utf8; DECLARE $group_id AS Utf8;
        DELETE FROM game_snapshots WHERE student_id = $student_id;
        DELETE FROM attempt_events WHERE student_id = $student_id;
        DELETE FROM sync_events WHERE student_id = $student_id;
        DELETE FROM group_members WHERE group_id = $group_id AND student_id = $student_id;
        DELETE FROM students WHERE student_code = $student_code;
    """, student_id=student_id, student_code=student_code, group_id=group_id)
    return _response(200, {"ok": True})


def handler(event, context):
    del context
    try:
        headers = event.get("headers") or {}
        _request_origin.set(str(headers.get("origin") or headers.get("Origin") or ""))
        method, path, data = _method(event), _path(event), _body(event)
        if method == "OPTIONS":
            return _response(204, {})
        routes = {
            ("GET", "/health"): lambda: _response(200, {"ok": True, "service": "power-up-2"}),
            ("POST", "/student/register"): lambda: _register_student(data),
            ("POST", "/student/login"): lambda: _login_student(data),
            ("POST", "/setup/teacher"): lambda: _bootstrap_teacher(event, data),
            ("POST", "/teacher/login"): lambda: _login_teacher(data),
            ("POST", "/sync/events"): lambda: _sync_events(event, data),
            ("GET", "/teacher/dashboard"): lambda: _teacher_dashboard(event),
            ("POST", "/teacher/students/reset-pin"): lambda: _teacher_student(event, data, "reset"),
            ("POST", "/teacher/students/delete"): lambda: _teacher_student(event, data, "delete"),
        }
        route = routes.get((method, path))
        return route() if route else _response(404, {"message": "Route not found."})
    except Exception:
        traceback.print_exc()
        return _response(500, {"message": "Cloud error. Progress is still safe on the device."})
