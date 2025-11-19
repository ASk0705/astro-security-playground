export async function onRequest({ request }){
  const headers = {};
  for(const [k,v] of request.headers) headers[k]=v;
  return new Response(JSON.stringify({ headers }), { headers:{ 'Content-Type':'application/json' }});
}
