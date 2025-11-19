export async function onRequestGet({ request, env }){
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/session=([^;]+)/);
  const token = m ? m[1] : null;
  if(!token) return new Response(JSON.stringify({}), { status:200, headers:{'Content-Type':'application/json'}});
  const email = await env.SESSIONS.get(token);
  return new Response(JSON.stringify({ email }), { headers:{'Content-Type':'application/json'}});
}
