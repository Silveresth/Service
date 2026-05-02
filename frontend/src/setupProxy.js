const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy HTTP pour l'API REST
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );

  // Proxy WebSocket pour le chat et les notifications
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      ws: true, // ← active le proxy WebSocket
    })
  );
};
