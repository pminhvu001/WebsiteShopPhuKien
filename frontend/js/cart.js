const { el, formatVnd, getCart, setCartQty, cartTotal, updateCartBadge } = window.App;

function render() {
  updateCartBadge();
  const items = getCart();
  const empty = document.getElementById("cartEmpty");
  const table = document.getElementById("cartTable");

  if (!items.length) {
    empty.classList.remove("hidden");
    table.classList.add("hidden");
    return;
  }
  empty.classList.add("hidden");
  table.classList.remove("hidden");
  table.innerHTML = "";

  const head = el("div", { class: "cart__head" }, [
    el("div", { class: "cart__col cart__col--product" }, ["Sản phẩm"]),
    el("div", { class: "cart__col" }, ["Đơn giá"]),
    el("div", { class: "cart__col" }, ["Số lượng"]),
    el("div", { class: "cart__col cart__col--right" }, ["Thành tiền"]),
  ]);

  const rows = el("div", { class: "cart__rows" });
  for (const it of items) {
    const img = el("img", {
      class: "cart__img",
      src: it.image_url || "https://via.placeholder.com/200x120?text=No+Image",
      alt: it.name,
      referrerpolicy: "no-referrer",
    });
    const name = el("div", { class: "cart__name" }, [it.name]);
    const product = el("div", { class: "cart__product" }, [img, name]);

    const price = el("div", { class: "cart__col" }, [formatVnd(Number(it.price || 0))]);

    const qty = el("input", {
      class: "input input--qty",
      type: "number",
      min: "0",
      value: String(it.quantity || 1),
      onchange: () => {
        const n = Math.max(0, Number(qty.value || 0));
        setCartQty(it.product_id, n);
        render();
      },
    });

    const line = Number(it.price || 0) * Number(it.quantity || 0);
    const total = el("div", { class: "cart__col cart__col--right" }, [formatVnd(line)]);

    rows.append(
      el("div", { class: "cart__row" }, [
        el("div", { class: "cart__col cart__col--product" }, [product]),
        price,
        el("div", { class: "cart__col" }, [qty]),
        total,
      ])
    );
  }

  const sum = el("div", { class: "cart__sum" }, [
    el("div", { class: "muted" }, ["Tổng cộng"]),
    el("div", { class: "cart__sumValue" }, [formatVnd(cartTotal())]),
  ]);

  table.append(head, rows, sum);
}

render();

