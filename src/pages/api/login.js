async function b64ToU8(b64){return Uint8Array.from(atob(b64), c=>c.charCodeAt(0));}
async function importAesKey(b64){
  const raw = await b64ToU8(b64);
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
}
async function decryptAes(key, iv_b64, ct_b64){
  const iv = await b64ToU8(iv_b64);
  const ct = await b64ToU8(ct_b64);
  const plainBuf = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
  return new TextDecoder().decode(plainBuf);
}
async function sha256B64(str){
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return btoa(String.fromCharCode(...new Uint8Array(h)));
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(()=>({}));
  const { email, ciphertext, iv } = body;
  if(!email || !ciphertext || !iv) return new Response(JSON.stringify({ error:'bad' }), { status:400 });

  const storedRaw = await env.USERS.get(email);
  if(!storedRaw) return new Response(JSON.stringify({ error:'invalid' }), { status:401 });
  const stored = JSON.parse(storedRaw);
  // import AES key from Pages secret AES_KEY_B64 bound into env
  const key_b64 = env.AES_KEY_B64;
  if(!key_b64) return new Response(JSON.stringify({ error:'server_missing_key' }), { status:500 });
  const key = await importAesKey(key_b64);
  let passwordPlain;
  try { passwordPlain = await decryptAes(key, iv, ciphertext); }
  catch(e){ return new Response(JSON.stringify({ error:'decrypt_failed' }), { status:401 }); }

  const hash = await sha256B64(passwordPlain);
  if(hash !== stored.password_hash) return new Response(JSON.stringify({ error:'invalid' }), { status:401 });

  const token = crypto.randomUUID();
  await env.SESSIONS.put(token, email, { expirationTtl: 60*60*24*7 });
  const cookie = `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60*60*24*7}`;
  // increment stats
  await incrementStat(env,'logins');
  return new Response(JSON.stringify({ ok:true }), { headers:{ 'Set-Cookie': cookie, 'Content-Type':'application/json' }});
}

// helper: increment counter in STATS kv under key name, and record recent history
async function incrementStat(env, key){
  try {
    const cur = Number(await env.STATS.get(key) || '0');
    await env.STATS.put(key, String(cur+1));
    // store history: a ring of last 20 values under 'history'
    const histRaw = await env.STATS.get('history');
    const hist = histRaw ? JSON.parse(histRaw) : [];
    const ts = Date.now();
    hist.push({ t: ts, k: key, v: cur+1 });
    while(hist.length>50) hist.shift();
    await env.STATS.put('history', JSON.stringify(hist));
  } catch(e){}
}
