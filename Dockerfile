# ── Étape 1 : Build React ──────────────────────────────
FROM node:20-slim AS frontend-build
WORKDIR /frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
ENV CI=false
ENV REACT_APP_API_URL=https://service-market.up.railway.app
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
COPY --from=frontend-build /frontend/build ./frontend/build
RUN mkdir -p ./staticfiles && cp ./service_market/frontend/build/leaflet.css ./service_market/frontend/build/leaflet.js ./staticfiles/ 2>/dev/null || true
RUN cp -f ./service_market/frontend/build/SM.jpg ./staticfiles/SM.jpg 2>/dev/null || true
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && daphne -b 0.0.0.0 -p ${PORT:-8000} service_market.asgi:application"]
RUN mkdir -p ./staticfiles && cp ./build/leaflet.css ./build/leaflet.js ./staticfiles/ 2>/dev/null || true
