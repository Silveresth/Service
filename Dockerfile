# ── Étape 1 : Build React ──────────────────────────────
FROM node:20-slim AS frontend-build
WORKDIR /frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
ENV CI=false
RUN npm run build

# ── Étape 2 : Django + fichiers React ─────────────────
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY service_market/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY service_market/ .
COPY --from=frontend-build /frontend/build ./build

RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && daphne -b 0.0.0.0 -p ${PORT:-8000} service_market.asgi:application"]
