const { API_BASE, showError, updateCartBadge } = window.App;

function normalizeApiBase(v) {
  const s = String(v || "").trim().replace(/\/+$/, "");
  if (!s) return "";
  try {
    const u = new URL(s);
    return u.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function main() {
  updateCartBadge();
  const input = document.getElementById("apiBase");
  const current = document.getElementById("current");
  const save = document.getElementById("save");
  const reset = document.getElementById("reset");

  input.value = API_BASE;
  current.textContent = API_BASE;

  save.addEventListener("click", () => {
    const norm = normalizeApiBase(input.value);
    if (!norm) return showError("URL không hợp lệ. Ví dụ: https://your-domain.com/api");
    localStorage.setItem("API_BASE", norm);
    location.href = "./index.html";
  });

  reset.addEventListener("click", () => {
    localStorage.setItem("API_BASE", "http://localhost:8000/api");
    location.reload();
  });
}

main();

