#!/bin/sh
set -e

if [ -d /opt/static-seed ] && [ -z "$(find static -mindepth 1 -maxdepth 1 -print -quit)" ]; then
  cp -R /opt/static-seed/. static/
fi

alembic upgrade head

exec uvicorn src.main:app --host 0.0.0.0 --port 8000