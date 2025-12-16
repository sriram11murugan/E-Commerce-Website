fetch("http://localhost:5000/api/products")
  .then(res => res.json())
  .then(data => {
    console.log(data); // You will see all products from database
  });

// Price helpers
function priceToNumber(price) {
  var i;
  var numStr = "";

  if (price == null) {
    return 0;
  }

  price = price + "";

  for (i = 0; i < price.length; i++) {
    if (price[i] >= "0" && price[i] <= "9") {
      numStr = numStr + price[i];
    }
  }

  if (numStr == "") {
    return 0;
  }
  return parseInt(numStr, 10);
}

function numberToPrice(num) {
  var str;
  var result = "";
  var count = 0;
  var i;

  if (num == null) {
    return "₹0";
  }
  str = num + "";
  for (i = str.length - 1; i >= 0; i--) {
    result = str[i] + result;
    count++;

    if (count == 3 && i != 0) {
      result = "," + result;
      count = 0;
    }
  }

  return "₹" + result;
}

// Cart Storage
var cart = JSON.parse(localStorage.getItem("cart") || "[]");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  var el = document.getElementById("cart-count");
  if (!el) return;

  var totalQty = 0;
  for (var i = 0; i < cart.length; i++) {
    totalQty += cart[i].qty || 0;
  }

  el.textContent = totalQty;
}

function clearCart() {
  next = "Clear Products";
  cart = [];
  saveCart();

  alert(next);
}


// Collect Products
var PRODUCT_DATA = (function () {

  var nodeList = document.querySelectorAll("#product-grid .card");
  var nodes = Array.prototype.slice.call(nodeList);

  var products = [];

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];

    var id = node.getAttribute("data-id") || String(Math.random()).substring(2);
    var titleEl = node.querySelector(".title");
    var descEl = node.querySelector(".desc");
    var priceEl = node.querySelector(".price");
    var imgEl = node.querySelector("img");

    var title = titleEl ? titleEl.textContent.trim() : "";
    var desc = descEl ? descEl.textContent.trim() : "";
    var priceText = priceEl ? priceEl.textContent.trim() : "₹0";
    var price = priceToNumber(priceText);
    var img = imgEl ? imgEl.getAttribute("src") : "";
    var category = node.getAttribute("data-category") || "";

    products.push({
      id: id,
      title: title,
      desc: desc,
      priceText: priceText,
      price: price,
      img: img,
      category: category
    });
  }

  return products;
})();


// Render Product List
function renderAllProducts(list) {
  if (!list) list = PRODUCT_DATA;

  var container = document.getElementById("product-grid-all");
  if (!container) return;

  container.innerHTML = "";

  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var div = document.createElement("div");
    div.className = "card";
    div.setAttribute("data-id", p.id);
    div.setAttribute("data-category", p.category);

    div.innerHTML =
      '<img src="' + p.img + '" alt="' + escapeHtml(p.title) + '">' +
      '<div class="card-body">' +
      '<h3 class="title">' + escapeHtml(p.title) + '</h3>' +
      '<p class="desc">' + escapeHtml(p.desc) + '</p>' +
      '<p class="price">' + p.priceText + '</p>' +
      '<button class="add-btn">Add to Cart</button>' +
      '<button class="details-btn">View</button>' +
      '</div>';

    container.appendChild(div);
  }
}


// Escape unsafe HTML
function escapeHtml(s) {
  var result = "";
  var i = 0;

  while (i < s.length) {
    var ch = s[i];

    if (ch == "&") {
      result = result + "&amp;";
    } else if (ch == "<") {
      result = result + "&lt;";
    } else if (ch == ">") {
      result = result + "&gt;";
    } else if (ch == '"') {
      result = result + "&quot;";
    } else if (ch == "'") {
      result = result + "&#39;";
    } else {
      result = result + ch;
    }
    i = i + 1;
  }
  return result;
}



// Event Delegation
document.addEventListener("click", function (e) {
  var target = e.target;

  if (target.className === "nav-link") {
    e.preventDefault();
    var id = target.getAttribute("data-target");
    if (id) showPage(id);
    return;
  }

  if (target.id === "shop-now") {
    e.preventDefault();
    showPage("products");
    renderAllProducts();
    return;
  }

  if (target.className === "add-btn") {
    var card = target.closest(".card");
    if (card) addProductToCartFromCard(card);
    return;
  }

  if (target.className === "details-btn") {
    var card2 = target.closest(".card");
    if (card2) openModalWithCard(card2);
    return;
  }

  if (target.className === "modal-close") {
    closeModal();
    return;
  }

  if (target.className.indexOf("qty-inc") !== -1) {
    changeQty(target.getAttribute("data-id"), 1);
    return;
  }

  if (target.className.indexOf("qty-dec") !== -1) {
    changeQty(target.getAttribute("data-id"), -1);
    return;
  }

  if (target.className.indexOf("remove-item") !== -1) {
    var id2 = target.getAttribute("data-id");
    var updated = [];
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id !== id2) updated.push(cart[i]);
    }
    cart = updated;
    saveCart();
    return;
  }
});


// Add Product to Cart
function addProductToCartFromCard(card) {

  var id = card.getAttribute("data-id");
  var title = card.querySelector(".title").textContent.trim();
  var priceText = card.querySelector(".price").textContent.trim();
  var price = priceToNumber(priceText);
  var img = card.querySelector("img").getAttribute("src");

  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].qty++;
      found = true;
    }
  }

  if (!found) {
    cart.push({ id: id, title: title, price: price, priceText: priceText, img: img, qty: 1 });
  }

  saveCart();
  showToast(title + " added to cart");
}


// Change Quantity
function changeQty(id, delta) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].qty += delta;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      break;
    }
  }
  saveCart();
}


// Render Shopping Cart
function renderCart() {
  var container = document.getElementById("cart-items");
  var subtotalEl = document.getElementById("subtotal");

  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    subtotalEl.textContent = numberToPrice(0);
    updateCartCount();
    return;
  }

  var subtotal = 0;

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    subtotal += item.price * item.qty;

    var row = document.createElement("div");
    row.className = "cart-row";

    row.innerHTML =
      '<img src="' + escapeHtml(item.img) + '">' +
      '<div class="info">' +
      '<h4>' + escapeHtml(item.title) + '</h4>' +
      '<p>' + escapeHtml(item.priceText) + '</p>' +
      '<div class="qty-controls">' +
      '<button class="qty-dec" data-id="' + item.id + '">-</button>' +
      '<span class="qty">' + item.qty + '</span>' +
      '<button class="qty-inc" data-id="' + item.id + '">+</button>' +
      '<button class="remove-item" data-id="' + item.id + '">Remove</button>' +
      '</div></div>' +
      '<div class="line-total"><strong>' + numberToPrice(item.price * item.qty) + '</strong></div>';

    container.appendChild(row);
  }

  subtotalEl.textContent = numberToPrice(subtotal);
  updateCartCount();
}


// Modal Handling 

var modal = document.getElementById("product-modal");
var modalTitle = document.getElementById("modal-title");
var modalDesc = document.getElementById("modal-desc");
var modalPrice = document.getElementById("modal-price");
var modalImg = document.querySelector(".modal-image img");
var modalAddBtn = document.getElementById("modal-add");
var modalCurrentCard = null;

function openModalWithCard(card) {
  modalCurrentCard = card;

  modalTitle.textContent = card.querySelector(".title").textContent.trim();
  modalDesc.textContent = card.querySelector(".desc").textContent.trim();
  modalPrice.textContent = card.querySelector(".price").textContent.trim();
  modalImg.src = card.querySelector("img").src;

  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}

modal.addEventListener("click", function (e) {
  if (e.target === modal) closeModal();
});

if (modalAddBtn) {
  modalAddBtn.addEventListener("click", function () {
    addProductToCartFromCard(modalCurrentCard);
    closeModal();
  });
}


// Search & Sort 

var searchBox = document.getElementById("searchBox");
var sortBox = document.getElementById("sortBox");

function applyFiltersAndRenderHomeGrid() {
  var list = PRODUCT_DATA.slice();
  var q = searchBox.value.toLowerCase();

  if (q) {
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
      if ((list[i].title + " " + list[i].desc).toLowerCase().indexOf(q) !== -1) {
        filtered.push(list[i]);
      }
    }
    list = filtered;
  }

  var sortVal = sortBox.value;
  if (sortVal === "low-high") list.sort(function (a, b) { return a.price - b.price; });
  if (sortVal === "high-low") list.sort(function (a, b) { return b.price - a.price; });

  renderAllProducts(list);

  var homeCards = document.querySelectorAll("#product-grid .card");
  for (var j = 0; j < homeCards.length; j++) {
    var id = homeCards[j].getAttribute("data-id");
    var visible = false;
    for (var k = 0; k < list.length; k++) {
      if (String(list[k].id) === String(id)) visible = true;
    }
    homeCards[j].style.display = visible ? "" : "none";
  }
}

if (searchBox) searchBox.oninput = applyFiltersAndRenderHomeGrid;
if (sortBox) sortBox.onchange = applyFiltersAndRenderHomeGrid;


// Navigation 

function showPage(id) {
  var pages = document.querySelectorAll(".page");
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove("page-active");
  }

  var target = document.getElementById(id);
  if (target) target.classList.add("page-active");

  if (id === "products") renderAllProducts();
  if (id === "cart") renderCart();
}


// Toast

function showToast(text) {
  var t = document.createElement("div");
  t.className = "toast";
  t.textContent = text;

  t.style.position = "fixed";
  t.style.top = "20px";
  t.style.right = "20px";
  t.style.padding = "8px 12px";
  t.style.background = "#16a34a";
  t.style.color = "#fff";
  t.style.borderRadius = "8px";
  t.style.zIndex = "9999";

  document.body.appendChild(t);

  setTimeout(function () {
    t.parentNode.removeChild(t);
  }, 1600);
}


// Cart Buttons 

var clearBtn = document.getElementById("clear-cart");
if (clearBtn) {
  clearBtn.onclick = function () {
    if (confirm("Clear your cart?")) clearCart();
  };
}

var checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.onclick = function () {
    if (cart.length === 0) alert("Your cart is empty.");
    else alert("Checkout not implemented.");
  };
}


// Initial Load 
renderAllProducts();
updateCartCount();
renderCart();
showPage("home");
applyFiltersAndRenderHomeGrid();