#!/usr/bin/env python3
"""Apply the Power Up 2 table schema with a short-lived Yandex IAM token."""

import os
from pathlib import Path

import ydb


endpoint = os.environ.get("YDB_ENDPOINT", "grpcs://ydb.serverless.yandexcloud.net:2135")
database = os.environ["YDB_DATABASE"]
token = os.environ["YDB_TOKEN"]
schema_path = Path(os.environ.get("YDB_SCHEMA", "cloud/yandex/schema.yql"))
statements = [statement.strip() for statement in schema_path.read_text().split(";") if statement.strip()]

driver = ydb.Driver(endpoint=endpoint, database=database, credentials=ydb.AccessTokenCredentials(token))
driver.wait(timeout=15, fail_fast=True)
pool = ydb.SessionPool(driver, size=2)

try:
    for statement in statements:
        pool.retry_operation_sync(lambda session, query=statement: session.execute_scheme(f"{query};"))
finally:
    pool.stop()
    driver.stop()

print(f"Applied {len(statements)} Power Up 2 schema statements.")
