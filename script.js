"use strict";
/* =============================================================
   yellowrecent script.js
   ① 데이터 (상품 · 분류 · 회원 등급 · 운영 정책)  ← 다음 주 DB 테이블로 옮길 부분
   ② 저장소 (지금은 브라우저 localStorage 사용)
   ③ 공통 함수
   ④ 화면 이동 (주소 # 뒤를 보고 화면 전환)
   ⑤ 화면별 기능 (홈 · 목록 · 상세 · 장바구니 · 주문 · 회원)
   ============================================================= */

/* ---------- ① 데이터 ---------- */

// 상품 분류 (key 는 주소에 쓰는 영문 이름)
const CATEGORIES = [
  { key: "musk",   name: "머스크향", desc: "포근하고 깨끗한 살냄새 향" },
  { key: "flower", name: "플라워향", desc: "밝고 산뜻한 꽃 향" },
  { key: "woody",  name: "우디향",   desc: "차분하고 깊은 나무 향" }
];

// 상품 (상품 테이블)
const PRODUCTS = [
  { id: 1, name: "화이트 머스크 오 드 퍼퓸 50ml", category: "머스크향", type: "향수",     price: 39000, stock: 30, image: "img/product1.jpg",
    notes: "알데하이드 · 코튼 플라워 · 화이트 머스크", description: "갓 세탁한 하얀 셔츠처럼 깨끗하고 포근한 향이에요. 데일리로 부담 없이 뿌리기 좋은 yellowrecent의 대표 향수입니다." },
  { id: 2, name: "클린 머스크 핸드크림 50ml",     category: "머스크향", type: "핸드크림", price: 12000, stock: 50, image: "img/product2.jpg",
    notes: "베르가못 · 은방울꽃 · 머스크", description: "시어버터를 넣어 끈적임 없이 촉촉해요. 손을 씻은 뒤에도 은은한 머스크 향이 남습니다." },
  { id: 3, name: "선샤인 머스크 오 드 퍼퓸 30ml", category: "머스크향", type: "향수",     price: 29000, stock: 25, image: "img/product3.jpg",
    notes: "만다린 · 오렌지 블라썸 · 앰버 머스크", description: "햇살에 말린 이불 같은 따뜻한 머스크에 상큼한 만다린을 더했어요. 가방에 넣기 좋은 30ml 크기입니다." },
  { id: 4, name: "프리지아 블룸 오 드 퍼퓸 50ml", category: "플라워향", type: "향수",     price: 42000, stock: 20, image: "img/product4.jpg",
    notes: "배 · 프리지아 · 화이트 우드", description: "노란 프리지아 꽃다발을 품에 안은 듯 맑고 산뜻한 향이에요. 졸업식, 첫 출근 같은 새 출발에 어울립니다." },
  { id: 5, name: "로즈 가든 핸드크림 50ml",       category: "플라워향", type: "핸드크림", price: 13000, stock: 40, image: "img/product5.jpg",
    notes: "리치 · 장미 · 피오니", description: "이슬 맺힌 장미 정원의 향을 담은 핸드크림이에요. 작은 크기라 선물용으로도 좋아요." },
  { id: 6, name: "미모사 레터 오 드 퍼퓸 30ml",   category: "플라워향", type: "향수",     price: 32000, stock: 15, image: "img/product6.jpg",
    notes: "레몬 · 미모사 · 허니", description: "봄 편지에 동봉한 노란 미모사 꽃처럼 달콤하고 보송한 향이에요." },
  { id: 7, name: "샌달우드 노트 오 드 퍼퓸 50ml", category: "우디향",   type: "향수",     price: 45000, stock: 18, image: "img/product7.jpg",
    notes: "카다멈 · 샌달우드 · 바닐라", description: "크리미한 샌달우드에 바닐라를 살짝 더해 차분하고 따뜻해요. 저녁 약속이나 가을 · 겨울에 잘 어울립니다." },
  { id: 8, name: "시더 포레스트 핸드크림 50ml",   category: "우디향",   type: "핸드크림", price: 14000, stock: 35, image: "img/product8.jpg",
    notes: "유칼립투스 · 시더우드 · 베티버", description: "비 온 뒤 숲길을 걷는 듯한 상쾌한 나무 향 핸드크림이에요. 남녀 모두 쓰기 좋아요." }
];

// 회원 등급 (등급 테이블) — minAmount: 누적 구매금액 기준, rate: 적립률
const GRADES = [
  { level: 1, name: "옐로우",  minAmount: 0,      rate: 0.01 },
  { level: 2, name: "선샤인",  minAmount: 100000, rate: 0.03 },
  { level: 3, name: "골드",    minAmount: 300000, rate: 0.05 },
  { level: 4, name: "로열",    minAmount: 600000, rate: 0.07 }
];

// 운영 정책
const POLICY = {
  signupPoint: 3000,       // 가입 포인트
  shippingFee: 3000,       // 배송비
  freeShippingMin: 30000   // 이 금액 이상이면 무료배송
};

/* ---------- ② 저장소 (localStorage) ---------- */
const KEY = {
  users: "yr_users",       // 회원 목록
  session: "yr_session",   // 로그인한 회원 이메일
  cart: "yr_cart",         // 장바구니
  orders: "yr_orders",     // 주문 내역
  stock: "yr_stock"        // 주문 후 바뀐 재고
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 불가 환경 */ }
}

/* ---------- ③ 공통 함수 ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const won = (n) => n.toLocaleString("ko-KR") + "원";
const pt = (n) => n.toLocaleString("ko-KR") + "P";

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function formatDate(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

let toastTimer;
function toast(message) {
  const box = $("#toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("show"), 2400);
}

// 상품 · 재고
const findProduct = (id) => PRODUCTS.find((p) => p.id === Number(id));
const categoryByKey = (key) => CATEGORIES.find((c) => c.key === key);
const categoryByName = (name) => CATEGORIES.find((c) => c.name === name);
function getStock(id) {
  const changed = load(KEY.stock, {});
  return changed[id] !== undefined ? changed[id] : findProduct(id).stock;
}
function setStock(id, value) {
  const changed = load(KEY.stock, {});
  changed[id] = value;
  save(KEY.stock, changed);
}

// 회원 · 등급
const getUsers = () => load(KEY.users, []);
function currentUser() {
  const email = load(KEY.session, null);
  return email ? getUsers().find((u) => u.email === email) || null : null;
}
function saveUser(user) {
  const users = getUsers();
  const i = users.findIndex((u) => u.email === user.email);
  if (i >= 0) users[i] = user; else users.push(user);
  save(KEY.users, users);
}
function getGrade(totalAmount) {
  let grade = GRADES[0];
  GRADES.forEach((g) => { if (totalAmount >= g.minAmount) grade = g; });
  return grade;
}
const getNextGrade = (grade) => GRADES.find((g) => g.level === grade.level + 1) || null;

// 장바구니
const getCart = () => load(KEY.cart, []);
function saveCart(cart) {
  save(KEY.cart, cart);
  updateHeader();
}
function cartLines() {
  return getCart()
    .map((item) => ({ ...item, product: findProduct(item.productId) }))
    .filter((line) => line.product);
}
function calcTotals(lines, usedPoint = 0) {
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= POLICY.freeShippingMin ? 0 : POLICY.shippingFee;
  const productPay = subtotal - usedPoint;          // 적립 · 누적 기준 금액
  return { subtotal, shipping, usedPoint, productPay, total: productPay + shipping };
}
function addToCart(productId, qty = 1) {
  const product = findProduct(productId);
  const stock = getStock(productId);
  if (!product || stock <= 0) { toast("품절된 상품이에요."); return false; }
  const cart = getCart();
  const item = cart.find((c) => c.productId === product.id);
  const already = item ? item.qty : 0;
  if (already + qty > stock) {
    toast(`재고가 ${stock}개 남아 있어 더 담을 수 없어요.`);
    return false;
  }
  if (item) item.qty += qty; else cart.push({ productId: product.id, qty });
  saveCart(cart);
  toast(`장바구니에 담았어요: ${product.name}`);
  return true;
}

// 머리글 (로그인 상태 · 장바구니 개수)
function updateHeader() {
  const count = getCart().reduce((sum, c) => sum + c.qty, 0);
  $("#cartCount").textContent = count;
  const user = currentUser();
  const link = $("#accountLink");
  link.textContent = user ? "마이페이지" : "로그인";
  link.setAttribute("href", user ? "#/mypage" : "#/login");
}

// 상품 카드 HTML
function productCard(p) {
  const soldOut = getStock(p.id) <= 0;
  return `
    <article class="card">
      <a href="#/product/${p.id}" class="card-img">
        <img src="${p.image}" alt="${esc(p.name)}" loading="lazy" width="800" height="800">
        ${soldOut ? '<span class="soldout">품절</span>' : ""}
      </a>
      <div class="card-body">
        <p class="card-tag">${p.category} · ${p.type}</p>
        <h3 class="card-title"><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
        <p class="card-price">${won(p.price)}</p>
        <button type="button" class="btn btn-yellow btn-sm" data-add="${p.id}" ${soldOut ? "disabled" : ""}>
          ${soldOut ? "품절" : "장바구니 담기"}
        </button>
      </div>
    </article>`;
}

/* ---------- ④ 화면 이동 ---------- */
const VIEWS = ["home", "shop", "detail", "cart", "checkout", "complete", "login", "signup", "mypage", "benefit"];
const NEED_LOGIN = ["checkout", "mypage", "complete"];

function parseHash() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  let view = parts[0] || "home";
  if (view === "product") view = "detail";
  if (!VIEWS.includes(view)) view = "home";
  return { view, param: parts[1] || "" };
}

function route() {
  const { view, param } = parseHash();
  const user = currentUser();

  if (NEED_LOGIN.includes(view) && !user) {
    sessionStorage.setItem("yr_return", location.hash);
    toast("로그인이 필요해요.");
    location.replace("#/login");
    return;
  }
  if ((view === "login" || view === "signup") && user) {
    location.replace("#/mypage");
    return;
  }

  $$(".view").forEach((v) => { v.hidden = v.dataset.view !== view; });

  // 메뉴 표시
  const navKey = view === "shop" ? "shop-" + (categoryByKey(param) ? param : "all") : view;
  $$(".nav-list a").forEach((a) => a.classList.toggle("active", a.dataset.nav === navKey));

  if (view === "home") renderHome();
  if (view === "shop") renderShop(param);
  if (view === "detail") renderDetail(param);
  if (view === "cart") renderCart();
  if (view === "checkout") renderCheckout();
  if (view === "complete") renderComplete(param);
  if (view === "mypage") renderMypage();
  if (view === "benefit") renderBenefit();
  if (view === "login") $("#loginError").textContent = "";
  if (view === "signup") $("#signupError").textContent = "";

  updateHeader();
  window.scrollTo(0, 0);
}

function goAfterLogin() {
  const back = sessionStorage.getItem("yr_return");
  sessionStorage.removeItem("yr_return");
  location.hash = back || "#/mypage";
}

/* ---------- ⑤ 화면별 기능 ---------- */

/* 홈 : 슬라이드 (사진 4장, 6초마다 교차) */
const slider = { index: 0, timer: null, slides: [], dots: [] };
function initSlider() {
  slider.slides = $$("#slider .slide");
  const dotsBox = $("#slideDots");
  dotsBox.innerHTML = slider.slides
    .map((_, i) => `<button type="button" aria-label="${i + 1}번째 사진 보기"></button>`)
    .join("");
  slider.dots = $$("button", dotsBox);
  slider.dots.forEach((dot, i) => dot.addEventListener("click", () => { showSlide(i); restartSlider(); }));
  $("#slidePrev").addEventListener("click", () => { showSlide(slider.index - 1); restartSlider(); });
  $("#slideNext").addEventListener("click", () => { showSlide(slider.index + 1); restartSlider(); });
  showSlide(0);
  restartSlider();
}
function showSlide(i) {
  const n = slider.slides.length;
  slider.index = (i + n) % n;
  slider.slides.forEach((s, k) => {
    s.classList.toggle("is-active", k === slider.index);
    s.setAttribute("aria-hidden", k === slider.index ? "false" : "true");
    $$("a", s).forEach((a) => { a.tabIndex = k === slider.index ? 0 : -1; });
  });
  slider.dots.forEach((d, k) => d.classList.toggle("active", k === slider.index));
}
function restartSlider() {
  clearInterval(slider.timer);
  slider.timer = setInterval(() => showSlide(slider.index + 1), 6000);
}

function renderHome() {
  $("#categoryCards").innerHTML = CATEGORIES.map((c) => {
    const sample = PRODUCTS.find((p) => p.category === c.name);
    const count = PRODUCTS.filter((p) => p.category === c.name).length;
    return `
      <a href="#/shop/${c.key}" class="category-card">
        <img src="${sample.image}" alt="" loading="lazy" width="800" height="800">
        <span class="category-info"><strong>${c.name}</strong><span>${c.desc} · ${count}개</span></span>
      </a>`;
  }).join("");
  const picks = [1, 4, 7, 2]; // 추천 상품 id
  $("#homeProducts").innerHTML = picks.map((id) => productCard(findProduct(id))).join("");
}

/* 상품 목록 : 검색 · 분류 · 종류 · 정렬 */
const shopState = { cat: "all", q: "", type: "all", sort: "recommend" };

function renderShop(catKey) {
  const cat = categoryByKey(catKey);
  shopState.cat = cat ? cat.name : "all";
  $("#shopTitle").textContent = cat ? cat.name : "전체상품";
  $("#shopDesc").textContent = cat ? `${cat.desc}을 모았어요.` : "yellowrecent의 향수와 핸드크림을 모두 만나보세요.";
  $("#searchInput").value = shopState.q;
  $("#typeSelect").value = shopState.type;
  $("#sortSelect").value = shopState.sort;

  const chips = [{ key: "", name: "전체" }, ...CATEGORIES];
  $("#categoryChips").innerHTML = chips.map((c) => {
    const on = (c.key === "" && shopState.cat === "all") || c.name === shopState.cat;
    return `<a href="#/shop${c.key ? "/" + c.key : ""}" class="chip ${on ? "active" : ""}" ${on ? 'aria-current="true"' : ""}>${c.name}</a>`;
  }).join("");
  renderShopList();
}

function renderShopList() {
  const q = shopState.q.trim().toLowerCase().replace(/\s+/g, "");
  let list = PRODUCTS.filter((p) => {
    if (shopState.cat !== "all" && p.category !== shopState.cat) return false;
    if (shopState.type !== "all" && p.type !== shopState.type) return false;
    if (!q) return true;
    const text = (p.name + p.category + p.type + p.notes).toLowerCase().replace(/\s+/g, "");
    return text.includes(q);
  });
  if (shopState.sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (shopState.sort === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (shopState.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ko"));

  $("#resultCount").textContent = `상품 ${list.length}개`;
  $("#shopProducts").innerHTML = list.length
    ? list.map(productCard).join("")
    : `<div class="empty"><p>찾는 상품이 없어요.</p><p class="muted">다른 단어로 검색하거나 분류를 바꿔 보세요.</p></div>`;
}

function initShopControls() {
  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    shopState.q = $("#searchInput").value;
    renderShopList();
  });
  $("#searchInput").addEventListener("input", (e) => {
    shopState.q = e.target.value;
    renderShopList();
  });
  $("#typeSelect").addEventListener("change", (e) => { shopState.type = e.target.value; renderShopList(); });
  $("#sortSelect").addEventListener("change", (e) => { shopState.sort = e.target.value; renderShopList(); });
}

/* 상품 상세 */
function renderDetail(id) {
  const p = findProduct(id);
  const box = $("#detailBox");
  if (!p) {
    box.innerHTML = `<div class="empty"><p>상품을 찾을 수 없어요.</p><a href="#/shop" class="btn btn-yellow">상품 목록으로</a></div>`;
    return;
  }
  const stock = getStock(p.id);
  const user = currentUser();
  const grade = user ? getGrade(user.totalAmount) : null;
  const cat = categoryByName(p.category);
  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id);

  box.innerHTML = `
    <nav class="breadcrumb" aria-label="현재 위치">
      <a href="#/">홈</a> <span>›</span> <a href="#/shop/${cat.key}">${p.category}</a> <span>›</span> <span>${esc(p.name)}</span>
    </nav>
    <div class="detail">
      <div class="detail-img"><img src="${p.image}" alt="${esc(p.name)}" width="800" height="800"></div>
      <div class="detail-info">
        <p class="card-tag">${p.category} · ${p.type}</p>
        <h1>${esc(p.name)}</h1>
        <p class="detail-price">${won(p.price)}</p>
        <p class="detail-desc">${esc(p.description)}</p>
        <dl class="detail-meta">
          <div><dt>향 노트</dt><dd>${esc(p.notes)}</dd></div>
          <div><dt>배송비</dt><dd>${won(POLICY.shippingFee)} (${won(POLICY.freeShippingMin)} 이상 무료)</dd></div>
          <div><dt>재고</dt><dd>${stock > 0 ? `${stock}개 남음` : "품절"}</dd></div>
          <div><dt>적립</dt><dd>${grade
            ? `${grade.name} 등급 ${Math.round(grade.rate * 100)}% 적립`
            : `회원 등급에 따라 1~7% 적립 (<a href="#/login">로그인</a>)`}</dd></div>
        </dl>
        ${stock > 0 ? `
        <div class="qty-row">
          <span class="qty-label">수량</span>
          <div class="qty" data-max="${stock}">
            <button type="button" data-step="-1" aria-label="수량 줄이기">−</button>
            <input type="number" id="detailQty" value="1" min="1" max="${stock}" aria-label="수량">
            <button type="button" data-step="1" aria-label="수량 늘리기">+</button>
          </div>
        </div>
        <div class="detail-total">
          <span>총 상품금액</span>
          <strong id="detailTotal">${won(p.price)}</strong>
        </div>
        <p class="detail-point" id="detailPoint"></p>
        <div class="detail-actions">
          <button type="button" class="btn btn-line" id="detailCart">장바구니 담기</button>
          <button type="button" class="btn btn-yellow" id="detailBuy">바로 구매</button>
        </div>` : `<p class="empty-inline">지금은 품절이에요.</p>`}
      </div>
    </div>
    ${related.length ? `
    <section class="block">
      <div class="block-head"><h2>같은 ${p.category} 상품</h2></div>
      <div class="product-grid">${related.map(productCard).join("")}</div>
    </section>` : ""}`;

  if (stock <= 0) return;
  const qtyInput = $("#detailQty");
  const refresh = () => {
    let q = parseInt(qtyInput.value, 10);
    if (isNaN(q) || q < 1) q = 1;
    if (q > stock) { q = stock; toast(`최대 ${stock}개까지 살 수 있어요.`); }
    qtyInput.value = q;
    $("#detailTotal").textContent = won(p.price * q);
    $("#detailPoint").textContent = grade
      ? `구매 시 ${pt(Math.floor(p.price * q * grade.rate))} 적립 예정`
      : `옐로우 등급 기준 ${pt(Math.floor(p.price * q * GRADES[0].rate))} 적립 예정`;
  };
  $$(".qty button", box).forEach((b) => b.addEventListener("click", () => {
    qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + Number(b.dataset.step);
    refresh();
  }));
  qtyInput.addEventListener("change", refresh);
  refresh();

  $("#detailCart").addEventListener("click", () => addToCart(p.id, Number(qtyInput.value)));
  $("#detailBuy").addEventListener("click", () => {
    const cart = getCart();
    const inCart = cart.find((c) => c.productId === p.id);
    const qty = Number(qtyInput.value);
    if (inCart) inCart.qty = qty; else cart.push({ productId: p.id, qty });
    saveCart(cart);
    location.hash = "#/checkout";
  });
}

/* 장바구니 : 수량 바꾸기 · 삭제 · 합계 */
function renderCart() {
  const lines = cartLines();
  const box = $("#cartBox");
  if (!lines.length) {
    box.innerHTML = `
      <div class="empty">
        <p>장바구니가 비어 있어요.</p>
        <a href="#/shop" class="btn btn-yellow">상품 보러 가기</a>
      </div>`;
    return;
  }
  const user = currentUser();
  const rate = user ? getGrade(user.totalAmount).rate : GRADES[0].rate;
  const t = calcTotals(lines);
  const left = POLICY.freeShippingMin - t.subtotal;

  box.innerHTML = `
    <div class="cart-layout">
      <ul class="cart-list">
        ${lines.map((l) => `
        <li class="cart-item" data-id="${l.product.id}">
          <a href="#/product/${l.product.id}" class="cart-thumb"><img src="${l.product.image}" alt="" width="800" height="800"></a>
          <div class="cart-info">
            <p class="card-tag">${l.product.category} · ${l.product.type}</p>
            <a href="#/product/${l.product.id}" class="cart-name">${esc(l.product.name)}</a>
            <p class="muted">${won(l.product.price)}</p>
          </div>
          <div class="cart-controls">
            <div class="qty qty-sm">
              <button type="button" data-cart-step="-1" aria-label="수량 줄이기">−</button>
              <input type="number" value="${l.qty}" min="1" max="${getStock(l.product.id)}" aria-label="${esc(l.product.name)} 수량" data-cart-qty>
              <button type="button" data-cart-step="1" aria-label="수량 늘리기">+</button>
            </div>
            <strong class="cart-line-total">${won(l.product.price * l.qty)}</strong>
            <button type="button" class="link-btn" data-cart-remove>삭제</button>
          </div>
        </li>`).join("")}
      </ul>
      <aside class="summary" aria-label="결제 예정 금액">
        <h2>결제 예정 금액</h2>
        <dl>
          <div><dt>상품금액</dt><dd>${won(t.subtotal)}</dd></div>
          <div><dt>배송비</dt><dd>${t.shipping ? won(t.shipping) : "무료"}</dd></div>
          <div class="sum-total"><dt>합계</dt><dd>${won(t.total)}</dd></div>
        </dl>
        <p class="summary-note">${left > 0 ? `${won(left)} 더 담으면 무료배송이에요.` : "무료배송이 적용됐어요."}</p>
        <p class="summary-note">예상 적립 ${pt(Math.floor(t.subtotal * rate))} ${user ? "" : "(옐로우 등급 기준)"}</p>
        <a href="#/checkout" class="btn btn-yellow btn-block">주문하기</a>
        <a href="#/shop" class="btn btn-line btn-block">계속 쇼핑하기</a>
      </aside>
    </div>`;
}

function initCartEvents() {
  $("#cartBox").addEventListener("click", (e) => {
    const item = e.target.closest(".cart-item");
    if (!item) return;
    const id = Number(item.dataset.id);
    const cart = getCart();
    const line = cart.find((c) => c.productId === id);
    if (!line) return;

    if (e.target.matches("[data-cart-remove]")) {
      saveCart(cart.filter((c) => c.productId !== id));
      toast("상품을 장바구니에서 뺐어요.");
      renderCart();
      return;
    }
    if (e.target.matches("[data-cart-step]")) {
      changeCartQty(id, line.qty + Number(e.target.dataset.cartStep));
    }
  });
  $("#cartBox").addEventListener("change", (e) => {
    if (!e.target.matches("[data-cart-qty]")) return;
    const id = Number(e.target.closest(".cart-item").dataset.id);
    changeCartQty(id, parseInt(e.target.value, 10));
  });
}

function changeCartQty(id, qty) {
  const cart = getCart();
  const line = cart.find((c) => c.productId === id);
  const stock = getStock(id);
  if (isNaN(qty) || qty < 1) qty = 1;
  if (qty > stock) { qty = stock; toast(`재고가 ${stock}개라 ${stock}개까지만 담을 수 있어요.`); }
  line.qty = qty;
  saveCart(cart);
  renderCart();
}

/* 주문 · 체험 결제 */
function renderCheckout() {
  const lines = cartLines();
  const box = $("#checkoutBox");
  if (!lines.length) {
    box.innerHTML = `<div class="empty"><p>주문할 상품이 없어요.</p><a href="#/shop" class="btn btn-yellow">상품 보러 가기</a></div>`;
    return;
  }
  const user = currentUser();
  const grade = getGrade(user.totalAmount);
  const base = calcTotals(lines);
  const maxPoint = Math.min(user.points, base.subtotal);

  box.innerHTML = `
    <form class="checkout-layout" id="checkoutForm" novalidate>
      <div class="checkout-main">
        <fieldset class="panel">
          <legend>주문 상품 (${lines.length}종)</legend>
          <ul class="mini-list">
            ${lines.map((l) => `
            <li><img src="${l.product.image}" alt="" width="800" height="800">
              <span class="mini-name">${esc(l.product.name)}<small>${won(l.product.price)} × ${l.qty}개</small></span>
              <strong>${won(l.product.price * l.qty)}</strong></li>`).join("")}
          </ul>
        </fieldset>

        <fieldset class="panel">
          <legend>받는 분</legend>
          <div class="field"><label for="coName">이름</label><input id="coName" value="${esc(user.name)}" maxlength="20" required></div>
          <div class="field"><label for="coPhone">휴대폰 번호</label><input id="coPhone" type="tel" value="${esc(user.phone)}" maxlength="13" required></div>
          <div class="field"><label for="coAddr">주소</label><input id="coAddr" placeholder="예) 충남 천안시 동남구 ○○로 00" value="${esc(user.address || "")}" required></div>
        </fieldset>

        <fieldset class="panel">
          <legend>포인트 사용</legend>
          <p class="muted">보유 ${pt(user.points)} · 최대 ${pt(maxPoint)} 사용 가능</p>
          <div class="point-row">
            <label class="sr-only" for="coPoint">사용할 포인트</label>
            <input id="coPoint" type="number" min="0" max="${maxPoint}" step="1" value="0">
            <button type="button" class="btn btn-line btn-sm" id="coPointAll">모두 사용</button>
          </div>
        </fieldset>

        <fieldset class="panel">
          <legend>결제 수단 (체험)</legend>
          <div class="pay-methods">
            <label><input type="radio" name="pay" value="신용카드" checked> 신용카드</label>
            <label><input type="radio" name="pay" value="계좌이체"> 계좌이체</label>
            <label><input type="radio" name="pay" value="간편결제"> 간편결제</label>
          </div>
          <p class="muted">체험 결제라서 카드 번호를 입력하지 않으며 실제 돈이 나가지 않아요.</p>
        </fieldset>
      </div>

      <aside class="summary" aria-label="최종 결제 금액">
        <h2>최종 결제 금액</h2>
        <dl>
          <div><dt>상품금액</dt><dd id="sumSubtotal">${won(base.subtotal)}</dd></div>
          <div><dt>포인트 사용</dt><dd id="sumPoint">−0P</dd></div>
          <div><dt>배송비</dt><dd>${base.shipping ? won(base.shipping) : "무료"}</dd></div>
          <div class="sum-total"><dt>결제 금액</dt><dd id="sumTotal">${won(base.total)}</dd></div>
        </dl>
        <p class="summary-note"><strong>${grade.name}</strong> 등급 ${Math.round(grade.rate * 100)}% 적립 → <strong id="sumEarn">${pt(Math.floor(base.subtotal * grade.rate))}</strong></p>
        <p class="form-error" id="checkoutError" role="alert"></p>
        <button type="submit" class="btn btn-yellow btn-block" id="payBtn">체험 결제하기</button>
      </aside>
    </form>`;

  const pointInput = $("#coPoint");
  const readPoint = () => {
    let v = parseInt(pointInput.value, 10);
    if (isNaN(v) || v < 0) v = 0;
    if (v > maxPoint) v = maxPoint;
    return v;
  };
  const refresh = () => {
    const used = readPoint();
    const t = calcTotals(lines, used);
    $("#sumPoint").textContent = "−" + pt(used);
    $("#sumTotal").textContent = won(t.total);
    $("#sumEarn").textContent = pt(Math.floor(t.productPay * grade.rate));
  };
  pointInput.addEventListener("input", refresh);
  pointInput.addEventListener("change", () => { pointInput.value = readPoint(); refresh(); });
  $("#coPointAll").addEventListener("click", () => { pointInput.value = maxPoint; refresh(); });

  $("#checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#checkoutError");
    const name = $("#coName").value.trim();
    const phone = $("#coPhone").value.trim();
    const address = $("#coAddr").value.trim();
    if (!name || !phone || !address) { err.textContent = "받는 분 이름 · 휴대폰 번호 · 주소를 모두 입력해 주세요."; return; }
    if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone)) { err.textContent = "휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요."; return; }
    const lack = lines.find((l) => l.qty > getStock(l.product.id));
    if (lack) { err.textContent = `${lack.product.name}의 재고가 부족해요. 장바구니에서 수량을 줄여 주세요.`; return; }
    err.textContent = "";

    const btn = $("#payBtn");
    btn.disabled = true;
    btn.textContent = "결제 처리 중…";
    setTimeout(() => {
      const order = placeOrder(lines, readPoint(), { name, phone, address },
        document.querySelector('input[name="pay"]:checked').value);
      location.hash = "#/complete/" + order.orderNo;
    }, 700);
  });
}

function placeOrder(lines, usedPoint, receiver, payMethod) {
  const user = currentUser();
  const gradeBefore = getGrade(user.totalAmount);
  const t = calcTotals(lines, usedPoint);
  const earned = Math.floor(t.productPay * gradeBefore.rate);
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const orderNo = `YR${ymd}-${String(now.getTime()).slice(-6)}`;

  const order = {
    orderNo,
    userEmail: user.email,
    orderedAt: now.toISOString(),
    items: lines.map((l) => ({ productId: l.product.id, name: l.product.name, price: l.product.price, qty: l.qty })),
    subtotal: t.subtotal,
    usedPoint,
    shipping: t.shipping,
    payAmount: t.total,
    earnedPoint: earned,
    gradeName: gradeBefore.name,
    payMethod,
    receiver,
    status: "주문완료 (체험결제)"
  };

  // 재고 줄이기
  lines.forEach((l) => setStock(l.product.id, getStock(l.product.id) - l.qty));

  // 주문 저장
  const orders = load(KEY.orders, []);
  orders.push(order);
  save(KEY.orders, orders);

  // 회원 포인트 · 누적금액 · 배송지 갱신
  user.points = user.points - usedPoint + earned;
  user.totalAmount += t.productPay;
  user.address = receiver.address;
  user.pointHistory = user.pointHistory || [];
  if (usedPoint > 0) user.pointHistory.push({ date: order.orderedAt, desc: `주문 ${orderNo} 사용`, amount: -usedPoint });
  if (earned > 0) user.pointHistory.push({ date: order.orderedAt, desc: `주문 ${orderNo} 적립 (${gradeBefore.name} ${Math.round(gradeBefore.rate * 100)}%)`, amount: earned });
  saveUser(user);

  const gradeAfter = getGrade(user.totalAmount);
  if (gradeAfter.level > gradeBefore.level) sessionStorage.setItem("yr_gradeup", gradeAfter.name);

  saveCart([]);
  return order;
}

/* 주문 완료 */
function renderComplete(orderNo) {
  const user = currentUser();
  const order = load(KEY.orders, []).find((o) => o.orderNo === orderNo && o.userEmail === user.email);
  const box = $("#completeBox");
  if (!order) {
    box.innerHTML = `<div class="empty"><p>주문 정보를 찾을 수 없어요.</p><a href="#/mypage" class="btn btn-yellow">주문 내역 보기</a></div>`;
    return;
  }
  const gradeUp = sessionStorage.getItem("yr_gradeup");
  sessionStorage.removeItem("yr_gradeup");
  box.innerHTML = `
    <div class="complete">
      <div class="complete-icon" aria-hidden="true">✓</div>
      <h1>주문이 완료되었어요</h1>
      <p class="muted">체험 결제라 실제 결제는 되지 않았고, 주문 내역만 저장됐어요.</p>
      ${gradeUp ? `<p class="gradeup">축하해요! <strong>${esc(gradeUp)}</strong> 등급으로 올라갔어요.</p>` : ""}
      <dl class="complete-info">
        <div><dt>주문번호</dt><dd>${order.orderNo}</dd></div>
        <div><dt>주문일시</dt><dd>${formatDate(order.orderedAt)}</dd></div>
        <div><dt>결제 수단</dt><dd>${order.payMethod} (체험)</dd></div>
        <div><dt>결제 금액</dt><dd>${won(order.payAmount)}</dd></div>
        <div><dt>사용 포인트</dt><dd>${pt(order.usedPoint)}</dd></div>
        <div><dt>적립 포인트</dt><dd>${pt(order.earnedPoint)}</dd></div>
        <div><dt>보유 포인트</dt><dd>${pt(user.points)}</dd></div>
      </dl>
      <div class="complete-actions">
        <a href="#/mypage" class="btn btn-yellow">주문 내역 보기</a>
        <a href="#/shop" class="btn btn-line">쇼핑 계속하기</a>
      </div>
    </div>`;
}

/* 회원가입 · 로그인 */
function initAuthForms() {
  $("#signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#signupError");
    const email = $("#suEmail").value.trim().toLowerCase();
    const pw = $("#suPw").value;
    const pw2 = $("#suPw2").value;
    const name = $("#suName").value.trim();
    const phone = $("#suPhone").value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "이메일 형식을 확인해 주세요."; return; }
    if (getUsers().some((u) => u.email === email)) { err.textContent = "이미 가입된 이메일이에요."; return; }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw)) { err.textContent = "비밀번호는 영문과 숫자를 포함해 8자 이상이어야 해요."; return; }
    if (pw !== pw2) { err.textContent = "비밀번호 확인이 일치하지 않아요."; return; }
    if (!name) { err.textContent = "이름을 입력해 주세요."; return; }
    if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone)) { err.textContent = "휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요."; return; }
    if (!$("#suAgree").checked) { err.textContent = "필수 약관에 동의해 주세요."; return; }

    const now = new Date().toISOString();
    saveUser({
      email,
      password: pw,                 // 실습용: 다음 주 DB 연결 때 암호화해서 저장
      name,
      phone,
      address: "",
      points: POLICY.signupPoint,
      totalAmount: 0,
      joinedAt: now,
      pointHistory: [{ date: now, desc: "회원가입 축하 포인트", amount: POLICY.signupPoint }]
    });
    save(KEY.session, email);
    e.target.reset();
    toast(`${name}님, 가입을 축하해요! ${pt(POLICY.signupPoint)}를 드렸어요.`);
    updateHeader();
    goAfterLogin();
  });

  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#loginEmail").value.trim().toLowerCase();
    const pw = $("#loginPw").value;
    const user = getUsers().find((u) => u.email === email && u.password === pw);
    if (!user) { $("#loginError").textContent = "이메일 또는 비밀번호가 맞지 않아요."; return; }
    save(KEY.session, email);
    e.target.reset();
    toast(`${user.name}님, 반가워요!`);
    updateHeader();
    goAfterLogin();
  });
}

/* 마이페이지 */
let mypageTab = "orders";
function renderMypage() {
  const user = currentUser();
  const grade = getGrade(user.totalAmount);
  const next = getNextGrade(grade);
  const progress = next ? Math.min(100, Math.round(((user.totalAmount - grade.minAmount) / (next.minAmount - grade.minAmount)) * 100)) : 100;
  const orders = load(KEY.orders, []).filter((o) => o.userEmail === user.email).reverse();
  const history = (user.pointHistory || []).slice().reverse();

  $("#mypageBox").innerHTML = `
    <div class="my-top">
      <div class="my-card my-hello">
        <p class="muted">반가워요</p>
        <h2>${esc(user.name)}님</h2>
        <p class="muted">${esc(user.email)}</p>
        <button type="button" class="btn btn-line btn-sm" id="logoutBtn">로그아웃</button>
      </div>
      <div class="my-card my-grade">
        <p class="muted">회원 등급</p>
        <p class="grade-name">${grade.name} <span>${Math.round(grade.rate * 100)}% 적립</span></p>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
        <p class="muted small">${next
          ? `${next.name} 등급까지 ${won(next.minAmount - user.totalAmount)} 남았어요`
          : "최고 등급이에요"} · 누적 ${won(user.totalAmount)}</p>
      </div>
      <div class="my-card my-point">
        <p class="muted">보유 포인트</p>
        <p class="point-big">${pt(user.points)}</p>
        <p class="muted small">주문 ${orders.length}건</p>
      </div>
    </div>

    <div class="tabs" role="tablist">
      <button type="button" role="tab" data-tab="orders" aria-selected="${mypageTab === "orders"}">주문 내역</button>
      <button type="button" role="tab" data-tab="points" aria-selected="${mypageTab === "points"}">포인트 내역</button>
      <button type="button" role="tab" data-tab="info" aria-selected="${mypageTab === "info"}">회원 정보</button>
    </div>

    <div class="tab-panel" ${mypageTab === "orders" ? "" : "hidden"}>
      ${orders.length ? orders.map((o) => `
      <article class="order-card">
        <header class="order-head">
          <span><strong>${formatDate(o.orderedAt)}</strong> · ${o.orderNo}</span>
          <span class="status">${o.status}</span>
        </header>
        <ul class="order-items">
          ${o.items.map((it) => `<li><span>${esc(it.name)} × ${it.qty}</span><span>${won(it.price * it.qty)}</span></li>`).join("")}
        </ul>
        <p class="order-foot">결제 ${won(o.payAmount)} · 사용 ${pt(o.usedPoint)} · 적립 ${pt(o.earnedPoint)} · ${o.payMethod}</p>
      </article>`).join("") : `<div class="empty"><p>아직 주문 내역이 없어요.</p><a href="#/shop" class="btn btn-yellow">쇼핑하러 가기</a></div>`}
    </div>

    <div class="tab-panel" ${mypageTab === "points" ? "" : "hidden"}>
      <ul class="point-list">
        ${history.map((h) => `
        <li><span><strong>${esc(h.desc)}</strong><small>${formatDate(h.date)}</small></span>
          <span class="${h.amount > 0 ? "plus" : "minus"}">${h.amount > 0 ? "+" : ""}${pt(h.amount)}</span></li>`).join("")}
      </ul>
    </div>

    <div class="tab-panel" ${mypageTab === "info" ? "" : "hidden"}>
      <form class="panel info-form" id="infoForm" novalidate>
        <div class="field"><label for="infoEmail">이메일</label><input id="infoEmail" value="${esc(user.email)}" disabled></div>
        <div class="field"><label for="infoName">이름</label><input id="infoName" value="${esc(user.name)}" maxlength="20"></div>
        <div class="field"><label for="infoPhone">휴대폰 번호</label><input id="infoPhone" type="tel" value="${esc(user.phone)}" maxlength="13"></div>
        <div class="field"><label for="infoAddr">기본 배송지</label><input id="infoAddr" value="${esc(user.address || "")}"></div>
        <p class="muted small">가입일 ${formatDate(user.joinedAt)}</p>
        <p class="form-error" id="infoError" role="alert"></p>
        <button type="submit" class="btn btn-yellow">정보 저장</button>
      </form>
    </div>`;

  $$(".tabs button").forEach((b) => b.addEventListener("click", () => { mypageTab = b.dataset.tab; renderMypage(); }));
  $("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(KEY.session);
    mypageTab = "orders";
    toast("로그아웃했어요.");
    location.hash = "#/";
  });
  $("#infoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#infoName").value.trim();
    const phone = $("#infoPhone").value.trim();
    if (!name) { $("#infoError").textContent = "이름을 입력해 주세요."; return; }
    if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone)) { $("#infoError").textContent = "휴대폰 번호 형식을 확인해 주세요."; return; }
    const u = currentUser();
    u.name = name;
    u.phone = phone;
    u.address = $("#infoAddr").value.trim();
    saveUser(u);
    toast("회원 정보를 저장했어요.");
    renderMypage();
  });
}

/* 등급 혜택 */
function renderBenefit() {
  const user = currentUser();
  const mine = user ? getGrade(user.totalAmount).level : 0;
  $("#gradeCards").innerHTML = GRADES.map((g) => {
    const next = getNextGrade(g);
    const range = next ? `누적 ${won(g.minAmount)} 이상 ~ ${won(next.minAmount)} 미만` : `누적 ${won(g.minAmount)} 이상`;
    return `
      <article class="grade-card lv${g.level} ${g.level === mine ? "mine" : ""}">
        <p class="grade-level">LEVEL ${g.level}</p>
        <h2>${g.name}</h2>
        <p class="grade-rate">${Math.round(g.rate * 100)}%<span> 적립</span></p>
        <p class="muted small">${range}</p>
        ${g.level === mine ? '<span class="mine-tag">나의 등급</span>' : ""}
      </article>`;
  }).join("");
  $("#shipInfo").textContent = `배송비는 ${won(POLICY.shippingFee)}이며, 상품금액 ${won(POLICY.freeShippingMin)} 이상이면 무료입니다.`;
}

/* ---------- 시작 ---------- */
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) addToCart(Number(addBtn.dataset.add), 1);
});

window.addEventListener("hashchange", route);
window.addEventListener("storage", updateHeader);

initSlider();
initShopControls();
initCartEvents();
initAuthForms();
route();
