# Power Up 2 cloud setup

Final production architecture:

```text
play.<domain> / teacher.<domain>
        ↓ HTTPS
Yandex Object Storage (two static websites)
        ↓ API requests
Yandex API Gateway → Cloud Function → YDB Serverless
```

The student app saves locally first and keeps a retry queue in IndexedDB. The cloud receives the latest game snapshot plus individual answer events. The teacher dashboard can only read students belonging to the teacher's group.

## 1. Create YDB

Create a Serverless YDB database in Yandex Cloud. In its query editor, run `schema.yql` once. Keep the database endpoint and database path.

## 2. Create the Cloud Function

Create a Python 3.12 Cloud Function with entry point `index.handler`. Upload `power-up-2-function.zip` or the files `index.py` and `requirements.txt`.

Attach a service account that can access only this YDB database. Add these environment variables:

```text
YDB_ENDPOINT=grpcs://ydb.serverless.yandexcloud.net:2135
YDB_DATABASE=/ru-central1/.../...
AUTH_SECRET=<at least 32 random bytes>
BOOTSTRAP_SECRET=<a different long random value>
ALLOWED_ORIGINS=https://<student-bucket>.website.yandexcloud.net,https://<teacher-bucket>.website.yandexcloud.net
```

List both exact website origins in `ALLOWED_ORIGINS`, separated by a comma and without a trailing slash. Never put `AUTH_SECRET`, `BOOTSTRAP_SECRET`, passwords, or service-account keys into Vite variables or GitHub files.

## 3. Create API Gateway

Replace `<FUNCTION_ID>` and `<SERVICE_ACCOUNT_ID>` in `openapi.yaml`, then create API Gateway from that specification. Test:

```bash
curl https://<gateway-domain>/health
```

Expected response: `{"ok": true, "service": "power-up-2"}`.

## 4. Bootstrap the teacher and first group

Set the five `POWER_UP_*` environment variables listed in `scripts/bootstrap-teacher.sh`, then run it once. After success, replace `BOOTSTRAP_SECRET` in the function with a new disabled random value.

## 5. Create two website buckets

Create one public-read bucket for students and one for the teacher dashboard. Enable static website hosting with `index.html` as the home page and error page. The initial URLs will be:

```text
https://<student-bucket>.website.yandexcloud.net
https://<teacher-bucket>.website.yandexcloud.net
```

Custom domains and CDN can be added after the pilot.

## 6. Deploy from GitHub

Create a private GitHub repository and add these Actions secrets:

- `YANDEX_API_URL`
- `YC_ACCESS_KEY_ID`
- `YC_SECRET_ACCESS_KEY`
- `YC_STUDENT_BUCKET`
- `YC_TEACHER_BUCKET`

The workflow in `.github/workflows/deploy-yandex.yml` builds and uploads both applications whenever `main` is updated.

Only `WebAssets` and the three canonical Specialist Nova PNGs need to be in the repository. The original PNG library remains the canonical private source archive and is intentionally excluded from Git.
