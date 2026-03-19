const API_BASE = localStorage.getItem("API_BASE") || "http://localhost:8000/api";
const CART_KEY = "CART_V1";

function formatVnd(n) {
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  } catch {
    return `${n} đ`;
  }
}

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of children) e.append(c);
  return e;
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data.data;
}

function showError(msg) {
  const box = document.getElementById("error");
  if (!box) return;
  box.textContent = msg;
  box.classList.remove("hidden");
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function cartCount() {
  return getCart().reduce((sum, it) => sum + Number(it.quantity || 0), 0);
}

function updateCartBadge() {
  const n = cartCount();
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  if (n > 0) {
    badge.textContent = String(n);
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function addToCart(product, quantity = 1) {
  const items = getCart();
  const idx = items.findIndex((x) => Number(x.product_id) === Number(product.id));
  if (idx >= 0) items[idx].quantity = Number(items[idx].quantity || 0) + quantity;
  else {
    items.push({
      product_id: Number(product.id),
      name: product.name,
      price: Number(product.price || 0),
      image_url: product.image_url || "",
      quantity,
    });
  }
  saveCart(items);
  updateCartBadge();
}

function setCartQty(productId, quantity) {
  const items = getCart();
  const idx = items.findIndex((x) => Number(x.product_id) === Number(productId));
  if (idx < 0) return;
  if (quantity <= 0) items.splice(idx, 1);
  else items[idx].quantity = quantity;
  saveCart(items);
  updateCartBadge();
}

function cartTotal() {
  return getCart().reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);
}

window.App = {
  API_BASE,
  formatVnd,
  el,
  apiGet,
  showError,
  getCart,
  addToCart,
  setCartQty,
  cartTotal,
  updateCartBadge,
};

