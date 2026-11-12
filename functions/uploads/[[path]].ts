interface Env { API_ORIGIN: string }
export const onRequest: PagesFunction<Env> = async (context) => {
  const origin = context.env.API_ORIGIN;
  if (!origin) return new Response('API backend is not configured', { status: 503 });
  let backend: URL;
  try { backend = new URL(origin); } catch { return new Response('Invalid API backend configuration', { status: 503 }); }
  if (backend.protocol !== 'https:') return new Response('API backend must use HTTPS', { status: 503 });
  const incoming = new URL(context.request.url);
  backend.pathname = incoming.pathname;
  backend.search = incoming.search;
  const headers = new Headers(context.request.headers);
  headers.delete('host');
  const request = new Request(backend.toString(), { method: context.request.method, headers, body: ['GET','HEAD'].includes(context.request.method) ? undefined : context.request.body, redirect: 'manual', duplex: 'half' } as RequestInit);
  return fetch(request);
};
