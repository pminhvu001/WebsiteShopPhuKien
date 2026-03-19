const { API_BASE, formatVnd, el, apiGet, showError, addToCart, updateCartBadge } = window.App;

function renderProducts(items) {
  const root = document.getElementById("products");
  root.innerHTML = "";
  for (const p of items) {
    const img = el("img", {
      class: "p__img",
      src: p.image_url || "https://via.placeholder.com/900x500?text=No+Image",
      alt: p.name,
      loading: "lazy",
      referrerpolicy: "no-referrer",
    });
    const name = el("h3", { class: "p__name" }, [p.name]);
    const desc = el("p", { class: "p__desc" }, [p.short_desc || ""]);
    const price = el("div", { class: "p__price" }, [formatVnd(Number(p.price || 0))]);
    const view = el(
      "a",
      { class: "btn", href: `./product.html?id=${encodeURIComponent(p.id)}` },
      ["Xem"]
    );
    const add = el(
      "button",
      {
        class: "btn btn--primary",
        type: "button",
        onclick: () => {
          addToCart(p, 1);
        },
      },
      ["+ Giỏ"]
    );
    const row = el("div", { class: "p__row" }, [price, el("div", { class: "btnrow" }, [view, add])]);
    const body = el("div", { class: "p__body" }, [name, desc, row]);
    root.append(el("article", { class: "p" }, [img, body]));
  }
}

async function main() {
  const lbl = document.getElementById("apiBaseLabel");
  if (lbl) lbl.textContent = API_BASE;
  updateCartBadge();
  const items = await apiGet("/products");
  renderProducts(items);
}

main().catch((e) => {
  showError(`${e.message || String(e)} (vào "Cài đặt" để đổi API)`);
});

