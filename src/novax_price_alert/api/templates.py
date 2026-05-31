# ruff: noqa: E501

TWA_SHELL_HTML = """
<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <title>Novax قیمت بازار ایران</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    :root{color-scheme:dark;--bg:#070b16;--card:#111827;--muted:#9ca3af;--text:#f9fafb;--accent:#38bdf8;--danger:#fb7185;--ok:#34d399}
    *{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#08111f,#020617);font-family:Tahoma,Arial,sans-serif;color:var(--text)}
    main{max-width:520px;margin:0 auto;padding:18px 14px 90px}.hero{padding:18px 0}.hero h1{margin:0 0 8px;font-size:24px}.hero p{margin:0;color:var(--muted);line-height:1.8}
    .grid{display:grid;gap:12px}.card{background:rgb(17 24 39/.88);border:1px solid rgb(148 163 184/.18);border-radius:18px;padding:14px;box-shadow:0 16px 40px rgb(0 0 0/.22)}
    .row{display:flex;align-items:center;justify-content:space-between;gap:12px}.name{font-weight:700}.price{font-size:20px;font-weight:800;direction:ltr}.meta{font-size:12px;color:var(--muted);margin-top:8px}
    button{border:0;border-radius:14px;background:var(--accent);color:#00111f;font-weight:800;padding:12px 14px;width:100%;font-size:15px}
    select,input{width:100%;border:1px solid rgb(148 163 184/.25);background:#0b1220;color:var(--text);border-radius:14px;padding:12px;margin-top:8px;font-size:15px}
    .actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ghost{background:#1f2937;color:var(--text)}.danger{color:var(--danger)}.ok{color:var(--ok)}
    .notice{font-size:12px;color:var(--muted);line-height:1.8}.hidden{display:none}
  </style>
</head>
<body>
<main>
  <section class="hero">
    <h1>Novax</h1>
    <p>قیمت‌های بازار ایران و هشدار هوشمند در تلگرام</p>
  </section>
  <section id="auth" class="card notice hidden">برای ساخت هشدار، این صفحه را داخل تلگرام باز کنید.</section>
  <section class="grid" id="prices"></section>
  <section class="card" style="margin-top:12px">
    <div class="name">ساخت هشدار</div>
    <select id="asset"></select>
    <select id="condition"><option value="below">خرید: قیمت کمتر یا مساوی</option><option value="above">فروش: قیمت بیشتر یا مساوی</option></select>
    <input id="target" inputmode="numeric" placeholder="قیمت هدف به تومان" />
    <button id="create">ثبت هشدار</button>
    <p class="notice">برای کاهش فشار روی منابع رایگان، قیمت‌ها با کش و برچسب زمان بروزرسانی نمایش داده می‌شوند.</p>
  </section>
  <section class="grid" id="alerts" style="margin-top:12px"></section>
</main>
<script>
const tg = window.Telegram?.WebApp; tg?.ready(); tg?.expand();
const initData = tg?.initData || "";
const headers = initData ? {"X-Telegram-Init-Data": initData, "Content-Type": "application/json"} : {"Content-Type":"application/json"};
const fmt = new Intl.NumberFormat("fa-IR");
let latest = [];
function assetLabel(code){return latest.find(x=>x.asset_code===code)?.asset_name || code}
async function api(path, opts={}){const r=await fetch(path,{...opts,headers:{...headers,...(opts.headers||{})}}); if(!r.ok) throw new Error(await r.text()); return r.json()}
async function loadPrices(){
  const data = await api("/api/v1/prices/latest"); latest = data.items || [];
  prices.innerHTML = latest.map(x=>`<article class="card"><div class="row"><div><div class="name">${x.asset_name}</div><div class="meta">${x.asset_code} · ${x.is_stale?"قدیمی":"به‌روز"}</div></div><div class="price">${fmt.format(Number(x.price_value))}</div></div><div class="meta">آخرین بروزرسانی: ${new Date(x.fetched_at).toLocaleString("fa-IR")}</div></article>`).join("");
  asset.innerHTML = latest.map(x=>`<option value="${x.asset_code}">${x.asset_name}</option>`).join("");
}
async function loadAlerts(){
  if(!initData){auth.classList.remove("hidden"); return}
  const data = await api("/api/v1/alerts");
  alerts.innerHTML = (data.items||[]).map(a=>`<article class="card"><div class="row"><div><div class="name">${assetLabel(a.asset_id)}</div><div class="meta">${a.condition_type==="above"?"بالای":"زیر"} ${fmt.format(Number(a.target_price))}</div></div><span class="${a.is_active?"ok":"danger"}">${a.is_active?"فعال":"خاموش"}</span></div><button class="ghost" onclick="removeAlert('${a.id}')">غیرفعال کردن</button></article>`).join("");
}
async function removeAlert(id){await api(`/api/v1/alerts/${id}`,{method:"DELETE"}); await loadAlerts()}
create.onclick = async ()=>{ if(!initData){auth.classList.remove("hidden"); return} await api("/api/v1/alerts",{method:"POST",body:JSON.stringify({asset_code:asset.value,condition_type:condition.value,target_price:target.value,cooldown_minutes:60})}); target.value=""; await loadAlerts(); };
loadPrices().then(loadAlerts).catch(e=>{prices.innerHTML=`<article class="card danger">خطا در دریافت داده: ${e.message}</article>`});
setInterval(loadPrices, 60000);
</script>
</body>
</html>
"""
