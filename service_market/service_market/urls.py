from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from django.http import JsonResponse, HttpResponse
import os

# Ta fonction de vue pour la racine
def api_root(request):
    html = f"""
    <!doctype html>
    <html lang=\"fr\">
    <head>
      <meta charset=\"utf-8\" />
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
      <title>Service Market - Backend</title>
      <style>
        :root {{
          --bg: #0b1220;
          --card: #0f1b33;
          --text: #e6edf7;
          --muted: #a8b3cf;
          --primary: #22c55e;
          --primary2: #16a34a;
          --border: rgba(255,255,255,.10);
        }}
        body {{
          margin: 0;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          background: radial-gradient(1200px 600px at 20% 0%, rgba(34,197,94,.18), transparent 55%),
                      radial-gradient(900px 500px at 100% 10%, rgba(59,130,246,.16), transparent 50%),
                      var(--bg);
          color: var(--text);
        }}
        .wrap {{ max-width: 920px; margin: 0 auto; padding: 40px 16px; }}
        .card {{
          background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 26px;
          box-shadow: 0 20px 60px rgba(0,0,0,.35);
        }}
        .top {{ display:flex; gap: 16px; align-items:center; flex-wrap: wrap; }}
        .badge {{
          display:inline-flex; align-items:center; gap:10px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(34,197,94,.12);
          border: 1px solid rgba(34,197,94,.28);
          color: #bbf7d0;
          font-weight: 700;
          letter-spacing: .2px;
        }}
        .dot {{ width: 10px; height: 10px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 0 6px rgba(34,197,94,.12); }}
        h1 {{ font-size: 26px; margin: 0; }}
        p {{ color: var(--muted); margin: 12px 0 0; line-height: 1.6; }}
        .grid {{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; margin-top: 22px; }}
        @media (max-width: 720px) {{ .grid {{ grid-template-columns: 1fr; }} }}
        .btn {{
          display:flex; align-items:center; justify-content:center;
          padding: 14px 16px; border-radius: 12px;
          background: rgba(255,255,255,.03);
          border: 1px solid var(--border);
          color: var(--text);
          text-decoration:none;
          font-weight: 650;
          transition: transform .06s ease, border-color .2s ease, background .2s ease;
        }}
        .btn:hover {{ transform: translateY(-1px); border-color: rgba(255,255,255,.22); background: rgba(255,255,255,.05); }}
        .btn.primary {{
          background: linear-gradient(180deg, rgba(34,197,94,.22), rgba(22,163,74,.10));
          border-color: rgba(34,197,94,.35);
        }}
        .foot {{ margin-top: 18px; font-size: 12px; color: rgba(168,179,207,.9); }}
      </style>
    </head>
    <body>
      <div class=\"wrap\">
        <div class=\"card\">
          <div class=\"top\">
            <div style=\"flex: 1; min-width: 260px;\">
              <div class=\"badge\"><span class=\"dot\"></span> BACKEND OPÉRATIONNEL</div>
              <h1 style=\"margin-top: 12px;\">Service Market</h1>
              <p>API disponible. Vous pouvez consulter les endpoints et tester rapidement l’application.</p>
            </div>
          </div>

          <div class=\"grid\">
            <a class=\"btn primary\" href=\"/api/\">Voir l’API (/api/)</a>
            <a class=\"btn\" href=\"/admin/\">Admin (/admin/)</a>
          </div>

          <div class=\"foot\">
            Status: online · {request.build_absolute_uri('/')}
          </div>
        </div>
      </div>
    </body>
    </html>
    """.strip()
    return HttpResponse(html)

# Serve React SPA for any non-API route (prevents "Not Found" after errors/refresh)
# Note: /api/* is handled above, so this catch-all should only serve index.html
def spa_index(request, *args, **kwargs):
    try:
        index_path = os.path.join(settings.REACT_BUILD_DIR, 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read())
    except Exception:
        return api_root(request)

urlpatterns = [

    path('admin/', admin.site.urls),
    path('api/', include('service.urls')),

    # Route pour les fichiers médias (photos de profil, etc.)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),

    # React: root
    path('', api_root),

    # React: SPA catch-all (client-side routing)
    re_path(r'^(?!api/).*$' , spa_index),
]


if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)