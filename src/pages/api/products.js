export async function onRequestGet({ env }){
  const raw = await env.PRODUCTS.get('list');
  if(!raw){
    const sample = [
      { id:'1', name:'Demo Laptop', price_cents:99900, desc:'Lightweight test laptop' },
      { id:'2', name:'Demo Keyboard', price_cents:4900, desc:'Mechanical feel' },
      { id:'3', name:'Demo Mouse', price_cents:1999, desc:'Optical mouse' }
    ];
    return new Response(JSON.stringify({ products: sample }), { headers:{'Content-Type':'application/json'}});
  }
  return new Response(raw, { headers:{'Content-Type':'application/json'}});
}
