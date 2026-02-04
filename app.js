const CART_KEY = "careCart";

const formatPrice = (value) => `CHF ${value.toFixed(2)}`;

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const updateCartCount = () => {
  const countEl = document.querySelector("[data-cart-count]");
  if (!countEl) return;
  const cart = loadCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  countEl.textContent = total;
};

const addToCart = (product) => {
  const cart = loadCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
};

const bindAddToCartButtons = () => {
  document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        description: button.dataset.description,
        price: Number(button.dataset.price),
      };
      addToCart(product);
      button.textContent = "Added";
      setTimeout(() => {
        button.textContent = "Add to Cart";
      }, 1000);
    });
  });
};

const renderCart = () => {
  const tableBody = document.querySelector("[data-cart-table]");
  const summaryEl = document.querySelector("[data-cart-summary]");
  if (!tableBody || !summaryEl) return;

  const cart = loadCart();
  tableBody.innerHTML = "";

  if (cart.length === 0) {
    tableBody.innerHTML = "<tr><td colspan=\"4\">Your cart is empty.</td></tr>";
    summaryEl.innerHTML = "<p>Start by adding essentials from the shop.</p>";
    updateCartCount();
    return;
  }

  let subtotal = 0;
  cart.forEach((item) => {
    const row = document.createElement("tr");
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <input type="number" min="1" value="${item.quantity}" data-qty="${item.id}" />
      </td>
      <td>${formatPrice(item.price)}</td>
      <td>${formatPrice(itemTotal)}</td>
    `;
    tableBody.appendChild(row);
  });

  const delivery = subtotal > 0 ? 6.5 : 0;
  const total = subtotal + delivery;

  summaryEl.innerHTML = `
    <p><strong>Subtotal:</strong> ${formatPrice(subtotal)}</p>
    <p><strong>Delivery:</strong> ${formatPrice(delivery)}</p>
    <p><strong>Total:</strong> ${formatPrice(total)}</p>
  `;

  tableBody.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const value = Math.max(1, Number(event.target.value));
      const id = event.target.dataset.qty;
      const nextCart = loadCart().map((item) =>
        item.id === id ? { ...item, quantity: value } : item
      );
      saveCart(nextCart);
      renderCart();
    });
  });

  updateCartCount();
};

const renderOrderSummary = () => {
  const listEl = document.querySelector("[data-order-list]");
  const totalEl = document.querySelector("[data-order-total]");
  if (!listEl || !totalEl) return;

  const cart = loadCart();
  if (cart.length === 0) {
    listEl.innerHTML = "<li>No items yet.</li>";
    totalEl.textContent = "CHF 0.00";
    return;
  }

  let subtotal = 0;
  listEl.innerHTML = "";
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    const li = document.createElement("li");
    li.textContent = `${item.name} × ${item.quantity}`;
    listEl.appendChild(li);
  });

  const total = subtotal + 6.5;
  totalEl.textContent = formatPrice(total);
};

const completeOrder = () => {
  const button = document.querySelector("[data-complete-order]");
  if (!button) return;
  button.addEventListener("click", () => {
    saveCart([]);
    updateCartCount();
    window.location.href = "order-confirmation.html";
  });
};

const init = () => {
  updateCartCount();
  bindAddToCartButtons();
  renderCart();
  renderOrderSummary();
  completeOrder();
};

document.addEventListener("DOMContentLoaded", init);
