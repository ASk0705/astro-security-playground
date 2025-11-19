export async function onRequestGet({ env }){
  const keys = ['logins','orders','bot_hits'];
  const out = {};
  for(const k of keys){ out[k] = Number(await env.STATS.get(k) || '0'); }
  const historyRaw = await env.STATS.get('history');
  out.history = historyRaw ? JSON.parse(historyRaw).map(x=>x.v) : [];
  return new Response(JSON.stringify(out), { headers:{'Content-Type':'application/json'}});
}
