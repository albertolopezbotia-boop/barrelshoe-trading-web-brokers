// Puente de OAuth para Decap CMS (backend "github").
// Implementa el intercambio de código por token que Decap espera:
// GET  /auth              -> redirige a GitHub para autorizar
// GET  /callback?code=... -> intercambia el code por un token y lo
//                            devuelve a la ventana del CMS vía postMessage

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: 'repo,user',
        state: crypto.randomUUID(),
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`,
        302,
      );
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Falta el parámetro code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenJson = await tokenRes.json();

      if (tokenJson.error) {
        return new Response(`Error de GitHub: ${tokenJson.error_description ?? tokenJson.error}`, { status: 400 });
      }

      const payload = JSON.stringify({ token: tokenJson.access_token, provider: 'github' });
      const html = `<!DOCTYPE html><html><body><script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:${payload}',
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('Puente de OAuth de Barrelshoe Trading. Rutas: /auth, /callback', { status: 200 });
  },
};
