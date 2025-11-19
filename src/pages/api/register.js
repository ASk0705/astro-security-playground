export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(()=>({}));
  const { email, password_hash } = body;
  if(!email||!password_hash) return new Response(JSON.stringify({ error:'missing' }), { status:400 });
  const ex = await env.USERS.get(email);
  if(ex) return new Response(JSON.stringify({ error:'exists' }), { status:409 });
  const user = { email, password_hash, created_at: new Date().toISOString() };
  await env.USERS.put(email, JSON.stringify(user));
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} });
}
