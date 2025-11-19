export async function onRequestPost({ request, env }){
  const body = await request.json().catch(()=>({}));
  const team = body.team || 'TEAM';
  // token format: TOK0001
  const counter = Number(await env.TOKENS.get('counter') || '0') + 1;
  await env.TOKENS.put('counter', String(counter));
  const token = 'TOK' + String(counter).padStart(4,'0');
  const rec = { token, team, created_at: new Date().toISOString(), done:false };
  await env.TOKENS.put('token:'+token, JSON.stringify(rec));
  // maintain index
  const idxRaw = await env.TOKENS.get('index'); const idx = idxRaw?JSON.parse(idxRaw):[];
  idx.unshift(token); if(idx.length>200) idx.pop();
  await env.TOKENS.put('index', JSON.stringify(idx));
  return new Response(JSON.stringify({ token }), { headers:{'Content-Type':'application/json'}});
}

export async function onRequestGet({ env }){
  const idxRaw = await env.TOKENS.get('index'); const idx = idxRaw?JSON.parse(idxRaw):[];
  const tokens = [];
  for(const t of idx.slice(0,50)){ const raw = await env.TOKENS.get('token:'+t); if(raw) tokens.push(JSON.parse(raw)); }
  return new Response(JSON.stringify({ tokens }), { headers:{'Content-Type':'application/json'}});
}

export async function onRequestPut({ request, env }){
  const body = await request.json().catch(()=>({}));
  const tok = body.token;
  const raw = await env.TOKENS.get('token:'+tok);
  if(!raw) return new Response(JSON.stringify({ error:'not_found' }), { status:404 });
  const rec = JSON.parse(raw);
  rec.done = true; rec.done_at = new Date().toISOString();
  await env.TOKENS.put('token:'+tok, JSON.stringify(rec));
  return new Response(JSON.stringify({ ok:true }));
}
