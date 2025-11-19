export async function onRequestPost({ request, env }){
  const body = await request.json().catch(()=>({}));
  if(!body || !Array.isArray(body.cart)) return new Response(JSON.stringify({ error:'bad' }), { status:400 });
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/session=([^;]+)/);
  const token = m ? m[1] : null;
  if(!token) return new Response(JSON.stringify({ error:'not_authenticated' }), { status:401 });
  const email = await env.SESSIONS.get(token);
  if(!email) return new Response(JSON.stringify({ error:'not_authenticated' }), { status:401 });
  await env.CARTS.put(`cart:${email}`, JSON.stringify(body.cart));
  await incrementStat(env, 'orders');
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} });
}

export async function onRequestGet({ request, env }){
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/session=([^;]+)/);
  const token = m ? m[1] : null;
  if(!token) return new Response(JSON.stringify({ error:'not_authenticated' }), { status:401 });
  const email = await env.SESSIONS.get(token);
  const raw = await env.CARTS.get(`cart:${email}`);
  return new Response(JSON.stringify({ cart: raw?JSON.parse(raw):[] }), { headers:{'Content-Type':'application/json'}});
}

// reuse incrementStat impl (or copy from login.js)
async function incrementStat(env, key){
  try {
    const cur = Number(await env.STATS.get(key) || '0');
    await env.STATS.put(key, String(cur+1));
    const histRaw = await env.STATS.get('history'); const hist = histRaw?JSON.parse(histRaw):[];
    hist.push({ t: Date.now(), k: key, v: cur+1 }); while(hist.length>50) hist.shift();
    await env.STATS.put('history', JSON.stringify(hist));
  } catch(e){}
}
