export async function onRequest({ env }){
  // called by bot generator client many times — increment bot_hits
  try{
    const cur = Number(await env.STATS.get('bot_hits') || '0') + 1;
    await env.STATS.put('bot_hits', String(cur));
    // also record history
    const histRaw = await env.STATS.get('history'); const hist = histRaw?JSON.parse(histRaw):[];
    hist.push({ t: Date.now(), k: 'bot_hits', v: cur }); while(hist.length>200) hist.shift();
    await env.STATS.put('history', JSON.stringify(hist));
  }catch(e){}
  return new Response(JSON.stringify({ ok:true, time: Date.now() }), { headers:{ 'Content-Type':'application/json' }});
}
