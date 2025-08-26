addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const PACKAGE_NAME = 'com.aixpertlab.aiautoinvoicing'
const PLAY_STORE_BASE = 'https://play.google.com/store/apps/details'

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname || '/'

  // Match /ref/<code>
  const m = path.match(/^\/ref\/([^\/?#/]+)$/)

  // If not a valid referral link, redirect directly to Play Store
  if (!m) {
    const fallbackPlayUrl = `${PLAY_STORE_BASE}?id=${PACKAGE_NAME}`
    return Response.redirect(fallbackPlayUrl, 302)
  }

  const code = m[1]
  const playUrl = `${PLAY_STORE_BASE}?id=${PACKAGE_NAME}&referrer=${encodeURIComponent('ref=' + code)}`

  // Android intent URL
  const intentUrl = `intent://ref/${encodeURIComponent(code)}#Intent;scheme=aiaa;package=${PACKAGE_NAME};S.browser_fallback_url=${encodeURIComponent(playUrl)};end`

  // Simple HTML page to open app or fallback to Play Store
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Open App</title>
  <style>body{font-family:system-ui,Roboto,Segoe UI,Arial;padding:20px;text-align:center}</style>
</head>
<body>
  <p>Opening app…</p>
  <script>
    var ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) {
      window.location = ${JSON.stringify(intentUrl)};
      setTimeout(function() { window.location = ${JSON.stringify(playUrl)}; }, 1200);
    } else {
      // fallback just to Play Store for non-Android
      window.location = ${JSON.stringify(playUrl)};
    }
  </script>
  <p>If nothing happens, <a href="${playUrl}">install from Play Store</a></p>
</body>
</html>`

  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' }})
}
