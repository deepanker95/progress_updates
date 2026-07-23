export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/kv') {
      if (request.method === 'GET') {
        const key = url.searchParams.get('key');
        if (!key) {
          return new Response(JSON.stringify({ error: 'missing "key" query param' }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
          });
        }
        const value = await env.my_kv.get(key);
        return new Response(JSON.stringify({ key, value }), {
          headers: { 'content-type': 'application/json' }
        });
      }

      if (request.method === 'POST') {
        let body;
        try { body = await request.json(); } catch (e) { body = null; }
        if (!body || !body.key || typeof body.value !== 'string') {
          return new Response(JSON.stringify({ error: '"key" and a string "value" are required' }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
          });
        }
        await env.my_kv.put(body.key, body.value);
        return new Response(JSON.stringify({ key: body.key, value: body.value }), {
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    // Everything else: serve the static site (index.html, etc.)
    return env.ASSETS.fetch(request);
  }
};
