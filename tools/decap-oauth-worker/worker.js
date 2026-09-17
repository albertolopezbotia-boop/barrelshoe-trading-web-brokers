// Puente de OAuth para Decap CMS (backend "github").
// Implementa el intercambio de código por token que Decap espera:
// GET  /auth              -> redirige a GitHub para autorizar
// GET  /callback?code=... -> intercambia el code por un token y lo
//                            devuelve a la ventana del CMS vía postMessage

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const state = crypto.randomUUID();
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: 'repo,user',
        state,
      });
      const headers = new Headers();
      headers.set('Location', `https://github.com/login/oauth/authorize?${params}`);
      headers.append('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`);
      return new Response(null, { status: 302, headers });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Falta el parámetro code', { status: 400 });

      const returnedState = url.searchParams.get('state');
      const cookieHeader = request.headers.get('Cookie') || '';
      const cookieState = cookieHeader.match(/oauth_state=([^;]+)/)?.[1];
      if (!returnedState || !cookieState || returnedState !== cookieState) {
        return new Response('Estado OAuth inválido o ausente (posible CSRF); vuelve a intentar el login desde /admin.', { status: 400 });
      }

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
      const responseHeaders = new Headers({ 'Content-Type': 'text/html' });
      responseHeaders.append('Set-Cookie', 'oauth_state=; Max-Age=0; Path=/');
      return new Response(html, { headers: responseHeaders });
    }

    return new Response('Puente de OAuth de Barrelshoe Trading. Rutas: /auth, /callback', { status: 200 });
  },
};
