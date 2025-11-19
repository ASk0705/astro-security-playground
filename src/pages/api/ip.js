export async function onRequest({ request }){
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  return new Response(JSON.stringify({ ip }), { headers:{ 'Content-Type':'application/json' }});
}
