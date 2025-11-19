export async function onRequestGet({ env }) {
  // AES key must be set in Pages secret variable AES_KEY_B64 and bound to env.AES_KEY_B64
  const b64 = env.AES_KEY_B64 || '';
  return new Response(JSON.stringify({ key_b64: b64 }), { headers:{'Content-Type':'application/json'}});
}
