export async function onRequestPost(){ 
  const cookie = `session=deleted; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
  return new Response(JSON.stringify({ ok:true }), { headers:{ 'Set-Cookie': cookie, 'Content-Type':'application/json' }});
}
