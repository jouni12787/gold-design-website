// --- config ---
const CART_KEY = 'hcj-cart';
const SHIPPING_FLAT = 4; // USD
const CURRENCY = 'USD';

// --- storage helpers ---
function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch{return []} }
function saveCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartBadge(); renderMiniCart(); }
function clearCart(){ localStorage.removeItem(CART_KEY); updateCartBadge(); renderMiniCart(); }

// --- cart math ---
function subtotal(items){ return (items||loadCart()).reduce((s,it)=>s + (Number(it.price)||0)*(Number(it.qty)||1), 0); }
function total(items){ return subtotal(items) + SHIPPING_FLAT; }
function itemCount(items){ return (items||loadCart()).reduce((s,it)=>s + (Number(it.qty)||1), 0); }

// --- public api ---
window.addToCart = function addToCart(item){
  const it = Object.assign({title:'',sku:'',qty:1,price:0,img:'/icon/icon-512.png'}, item||{});
  const items = loadCart();
  // simple merge by title+sku
  const idx = items.findIndex(x => (x.title||'')===it.title && (x.sku||'')===it.sku);
  if(idx>-1){ items[idx].qty = Number(items[idx].qty||1) + Number(it.qty||1); }
  else { items.push(it); }
  saveCart(items);
  openMiniCart();
};

window.cartAPI = {
  load: loadCart, save: saveCart, clear: clearCart,
  subtotal: ()=>subtotal(), total: ()=>total(), count: ()=>itemCount()
};

// --- UI bootstrap ---
const style = document.createElement('style');
style.textContent = `
  .cart-btn{position:relative; display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid rgba(212,175,55,.35); border-radius:12px; background:linear-gradient(120deg,rgba(212,175,55,.16),rgba(184,138,26,.16)); color:#fff7e6; cursor:pointer; font-weight:700}
  .cart-badge{position:absolute; top:-6px; right:-6px; background:#eab308; color:#1a160c; font:12px/1.1 system-ui; border-radius:999px; padding:2px 6px}
  .drawer{position:fixed; inset:0; display:none; z-index:9999}
  .drawer.open{display:block}
  .drawer-bg{position:absolute; inset:0; background:rgba(0,0,0,.55)}
  .drawer-panel{position:absolute; right:0; top:0; bottom:0; width:360px; max-width:90vw; background:#211a0e; border-left:1px solid rgba(212,175,55,.25); box-shadow:-20px 0 40px rgba(0,0,0,.5); padding:16px; overflow:auto}
  .row{display:grid; grid-template-columns:56px 1fr auto; gap:10px; align-items:center; border:1px solid rgba(212,175,55,.18); border-radius:12px; padding:8px; margin-bottom:8px}
  .row img{width:56px; height:56px; object-fit:cover; border-radius:10px}
  .qty{display:inline-flex; border:1px solid rgba(212,175,55,.25); border-radius:10px; overflow:hidden}
  .qty button{background:transparent; color:#e8d9b3; border:0; width:28px; height:28px; cursor:pointer}
  .qty input{width:36px; text-align:center; background:transparent; border:0; color:#fff7e6}
  .sum{display:grid; gap:6px; margin-top:8px}
  .sum div{display:flex; justify-content:space-between}
  .checkout-btn{width:100%; margin-top:10px; padding:12px; border-radius:12px; border:1px solid rgba(212,175,55,.35); background:linear-gradient(120deg,rgba(212,175,55,.16),rgba(184,138,26,.16)); color:#fff7e6; font-weight:800; cursor:pointer}
`;
document.head.appendChild(style);

// cart button mount
function mountCartButton(){
  // Try to mount into a placeholder if present; else pin to top-right
  let host = document.getElementById('cart-root');
  if(!host){
    host = document.createElement('div');
    host.style.position='fixed'; host.style.top='14px'; host.style.right='14px'; host.style.zIndex='9998';
    document.body.appendChild(host);
  }
  host.innerHTML = `
    <button class="cart-btn" id="cart-btn">
      <span>Cart</span>
      <span class="cart-badge" id="cart-badge">0</span>
    </button>`;
  document.getElementById('cart-btn').onclick = openMiniCart;
  updateCartBadge();
}
function updateCartBadge(){ const b = document.getElementById('cart-badge'); if(b) b.textContent = itemCount(); }

// drawer
let drawer;
function ensureDrawer(){
  if(drawer) return;
  drawer = document.createElement('div');
  drawer.className='drawer';
  drawer.innerHTML = `
    <div class="drawer-bg"></div>
    <aside class="drawer-panel">
      <h3 style="margin-top:0">Your cart</h3>
      <div id="mini-items"></div>
      <div class="sum">
        <div><span>Subtotal</span><strong id="mini-sub"></strong></div>
        <div><span>Shipping</span><strong>$${SHIPPING_FLAT.toFixed(2)} ${CURRENCY}</strong></div>
        <div><span>Total</span><strong id="mini-total"></strong></div>
      </div>
      <button class="checkout-btn" onclick="location.href='/checkout/'">Go to checkout</button>
    </aside>`;
  drawer.querySelector('.drawer-bg').onclick = () => drawer.classList.remove('open');
  document.body.appendChild(drawer);
}
function renderMiniCart(){
  ensureDrawer();
  const items = loadCart();
  const box = document.getElementById('mini-items'); if(!box) return;
  box.innerHTML = '';
  items.forEach((it,i)=>{
    const row = document.createElement('div');
    row.className='row';
    row.innerHTML = `
      <img src="${it.img||'/icon/icon-512.png'}" alt="">
      <div>
        <strong>${it.title||''}</strong>
        <div style="opacity:.75;font-size:.9em">SKU: ${it.sku||'-'}</div>
        <div class="qty">
          <button aria-label="dec">−</button>
          <input value="${Number(it.qty||1)}">
          <button aria-label="inc">+</button>
        </div>
        <button style="margin-top:6px;color:#eab308;background:transparent;border:0;cursor:pointer">Remove</button>
      </div>
      <div><strong>${Number(it.price||0).toLocaleString()} ${CURRENCY}</strong></div>`;
    const [dec,inp,inc] = row.querySelectorAll('.qty *');
    dec.onclick = ()=>{ const n=Math.max(1, Number(inp.value)-1); inp.value=n; items[i].qty=n; saveCart(items); };
    inc.onclick = ()=>{ const n=Number(inp.value)+1; inp.value=n; items[i].qty=n; saveCart(items); };
    row.querySelector('button:not(.qty button)').onclick = ()=>{ items.splice(i,1); saveCart(items); };
    box.appendChild(row);
  });
  const s = subtotal(items);
  document.getElementById('mini-sub').textContent = `${Math.round(s).toLocaleString()} ${CURRENCY}`;
  document.getElementById('mini-total').textContent = `${Math.round(s+SHIPPING_FLAT).toLocaleString()} ${CURRENCY}`;
  updateCartBadge();
}
function openMiniCart(){ ensureDrawer(); renderMiniCart(); drawer.classList.add('open'); }

document.addEventListener('DOMContentLoaded', ()=>{ mountCartButton(); ensureDrawer(); });
