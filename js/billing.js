import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let items = [];
let productCache = [];

/* LOAD PRODUCTS CACHE */
async function loadProducts() {
  const snap = await getDocs(collection(db, "products"));
  productCache = [];

  snap.forEach(doc => {
    productCache.push(doc.data());
  });
}
loadProducts();

/* LOAD CART */
window.addEventListener("load", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.forEach(p => {
    items.push(p);
  });

  render();
});

/* INVOICE */
function generateInvoice() {
  const now = new Date();

  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();

  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  return `INV-${dd}${mm}${yyyy}-${hh}${min}`;
}
document.getElementById("invNo").innerText = generateInvoice();

/* BARCODE */
document.getElementById("barcodeInput")
.addEventListener("change", function () {

  const code = this.value;
  this.value = "";

  const product = productCache.find(p => p.barcode == code);

  if (!product) {
    alert("Product not found");
    return;
  }

  addProduct(product);
});

/* ADD PRODUCT */
function addProduct(product) {

  let existing = items.find(i => i.name === product.name);

  if (existing) {
    existing.qty++;

    const gst = (existing.price * existing.gst) / 100;
    existing.total = existing.qty * (existing.price + gst);

  } else {
    const gst = (product.price * product.gst) / 100;

    items.push({
      name: product.name,
      price: product.price,
      gst: product.gst,
      qty: 1,
      total: product.price + gst
    });
  }

  saveCart();
  render();
}

/* SAVE CART */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(items));
}

/* RENDER */
function render() {

  const table = document.getElementById("billTable");

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Qty</th>
      <th>Price</th>
      <th>GST</th>
      <th>Total</th>
      <th>Action</th>
    </tr>
  `;

  let total = 0;

  items.forEach((item, i) => {
    total += item.total;

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>
          <button onclick="dec(${i})">-</button>
          ${item.qty}
          <button onclick="inc(${i})">+</button>
        </td>
        <td>${item.price}</td>
        <td>${item.gst}%</td>
        <td>${item.total.toFixed(2)}</td>
        <td><button onclick="removeItem(${i})">🗑</button></td>
      </tr>
    `;
  });

  document.getElementById("total").innerText = total.toFixed(2);
}

/* CONTROLS */
window.inc = (i) => {
  items[i].qty++;
  addProduct(items[i]);
};

window.dec = (i) => {
  if (items[i].qty > 1) {
    items[i].qty--;
  } else {
    items.splice(i, 1);
  }
  saveCart();
  render();
};

window.removeItem = (i) => {
  items.splice(i, 1);
  saveCart();
  render();
};

/* CLEAR */
window.clearBill = () => {
  if (!confirm("Clear all items?")) return;

  items = [];
  localStorage.removeItem("cart");
  render();
};

/* SAVE BILL */
window.saveBill = async function () {
  const customer = document.getElementById("customerName").value;

  if (!customer) return alert("Enter customer name");
  if (items.length === 0) return alert("No items");

  const total = items.reduce((s, i) => s + i.total, 0);

  await addDoc(collection(db, "bills"), {
    invoiceNo: document.getElementById("invNo").innerText,
    customerName: customer,
    items,
    total,
    createdAt: new Date()
  });

  alert("Saved ✅");
  clearBill();
};

/* PRINT */
window.printInvoice = () => {
  const content = document.getElementById("invoice").innerHTML;
  let win = window.open();
  win.document.write(`<body onload="window.print()">${content}</body>`);
};

window.goBack = () => window.history.back();
