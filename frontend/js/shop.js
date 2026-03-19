const { API_BASE, apiGet, el, formatVnd, showError, addToCart, getCart, setCartQty, cartTotal, updateCartBadge } =
  window.App;

function bySort(items, sort) {
  const arr = [...items];
  if (sort === "price_asc") arr.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  else if (sort === "price_desc") arr.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  return arr;
}

function renderGrid(items) {
  const root = document.getElementById("grid");
  root.innerHTML = "";

  for (const p of items) {
    const img = el("img", {
      class: "pc__img",
      src: p.image_url || "https://via.placeholder.com/900x500?text=No+Image",
      alt: p.name,
      loading: "lazy",
      referrerpolicy: "no-referrer",
    });

    const name = el("div", { class: "pc__name" }, [p.name]);
    const price = el("div", { class: "pc__price" }, [formatVnd(Number(p.price || 0))]);
    const view = el("a", { class: "btn btn--sm", href: `./product.html?id=${encodeURIComponent(p.id)}` }, ["Xem"]);
    const add = el(
      "button",
      {
        class: "btn btn--primary btn--sm",
        type: "button",
        onclick: () => {
          addToCart(p, 1);
          renderCartMini();
        },
      },
      ["Thêm vào giỏ"]
    );

    const actions = el("div", { class: "pc__actions" }, [view, add]);
    const body = el("div", { class: "pc__body" }, [name, price, actions]);
    root.append(el("article", { class: "pc" }, [img, body]));
  }
}

function renderCartMini() {
  updateCartBadge();
  const root = document.getElementById("cartMini");
  const items = getCart();
  root.innerHTML = "";

  if (!items.length) {
    root.append(el("div", { class: "muted small" }, ["Giỏ hàng trống."]));
  } else {
    for (const it of items) {
      const row = el("div", { class: "cartMini__row" }, [
        el("div", { class: "cartMini__name" }, [it.name]),
        el("div", { class: "cartMini__meta" }, [
          el("button", { class: "miniBtn", type: "button", onclick: () => (setCartQty(it.product_id, Math.max(0, Number(it.quantity || 0) - 1)), renderCartMini()) }, ["-"]),
          el("div", { class: "cartMini__qty" }, [String(it.quantity || 0)]),
          el("button", { class: "miniBtn", type: "button", onclick: () => (setCartQty(it.product_id, Number(it.quantity || 0) + 1), renderCartMini()) }, ["+"]),
        ]),
      ]);
      root.append(row);
    }
  }

  document.getElementById("cartTotal").textContent = formatVnd(cartTotal());
}

async function main() {
  document.getElementById("apiBaseLabel").textContent = API_BASE;
  document.querySelector(".shopHead__title").textContent = "Phụ kiện máy tính";

  renderCartMini();

  const items = await apiGet("/products");
  const sortEl = document.getElementById("sort");
  const render = () => renderGrid(bySort(items, sortEl.value));
  sortEl.addEventListener("change", render);
  render();

  document.getElementById("btnCheckout").addEventListener("click", () => {
    alert("Demo UI: bước tiếp theo sẽ làm đăng nhập + gọi API tạo đơn hàng.");
  });
}

main().catch((e) => showError(`${e.message || String(e)} (vào "Cài đặt" để đổi API)`));

