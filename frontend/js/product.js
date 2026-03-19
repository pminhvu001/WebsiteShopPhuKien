const { apiGet, el, formatVnd, showError, addToCart, updateCartBadge } = window.App;

function getId() {
  const qs = new URLSearchParams(location.search);
  const raw = qs.get("id");
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function renderDetail(p) {
  const root = document.getElementById("detail");
  root.classList.remove("hidden");

  const img = el("img", {
    class: "detail__img",
    src: p.image_url || "https://via.placeholder.com/900x500?text=No+Image",
    alt: p.name,
    referrerpolicy: "no-referrer",
  });

  const name = el("h2", { class: "detail__name" }, [p.name]);
  const price = el("div", { class: "detail__price" }, [formatVnd(Number(p.price || 0))]);
  const shortDesc = el("p", { class: "muted" }, [p.short_desc || ""]);
  const desc = el("div", { class: "detail__desc" }, [p.description || ""]);

  const qty = el("input", { class: "input", type: "number", min: "1", value: "1" });
  const add = el(
    "button",
    {
      class: "btn btn--primary",
      type: "button",
      onclick: () => {
        const n = Math.max(1, Number(qty.value || 1));
        addToCart(p, n);
        add.textContent = "Đã thêm!";
        setTimeout(() => (add.textContent = "Thêm vào giỏ"), 900);
      },
    },
    ["Thêm vào giỏ"]
  );

  const actions = el("div", { class: "detail__actions" }, [
    el("div", { class: "field" }, [el("div", { class: "small" }, ["Số lượng"]), qty]),
    add,
    el("a", { class: "btn", href: "./cart.html" }, ["Xem giỏ"]),
  ]);

  const right = el("div", { class: "detail__right" }, [name, price, shortDesc, actions, desc]);
  root.append(img, right);
  document.getElementById("title").textContent = p.name;
}

async function main() {
  updateCartBadge();
  const id = getId();
  if (!id) throw new Error("Thiếu tham số id.");
  const p = await apiGet(`/products/${id}`);
  renderDetail(p);
}

main().catch((e) => showError(e.message || String(e)));

