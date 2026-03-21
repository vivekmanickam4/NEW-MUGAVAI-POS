import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getInvoiceHTML } from "./printTemplate.js";
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
    const gstAmount = (p.price * p.gst) / 100;

    items.push({
      name: p.name,
      price: p.price,
      gst: p.gst,
      qty: p.qty,
      total: p.qty * (p.price + gstAmount)
    });
  });

  render(); // ✅ IMPORTANT

  // ✅ INVOICE
  document.getElementById("invNo").innerText = generateInvoice();
});

/* INVOICE FORMAT */
function generateInvoice() {
  const now = new Date();

  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();

  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  return `INV-${dd}-${mm}-${yyyy}-${hh}:${min}`; // ✅ better format
}

/*GST TOGGLE*/
document.getElementById("gstToggle")
.addEventListener("change", render);

/* BARCODE SCAN */
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
  } else {
    items.push({
      name: product.name,
      price: product.price,
      gst: product.gst,
      qty: 1
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

  let subtotal = 0;
  let gstTotal = 0;

  const gstEnabled = document.getElementById("gstToggle").checked;

  items.forEach((item, i) => {

    let itemSubtotal = item.price * item.qty;
    let itemGST = gstEnabled ? (itemSubtotal * item.gst) / 100 : 0;

    let itemTotal = itemSubtotal + itemGST;

    subtotal += itemSubtotal;
    gstTotal += itemGST;

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>
          <button onclick="dec(${i})">-</button>
          ${item.qty}
          <button onclick="inc(${i})">+</button>
        </td>
        <td>${item.price}</td>
        <td>${gstEnabled ? item.gst + "%" : "0%"}</td>
        <td>${itemTotal.toFixed(2)}</td>
        <td><button onclick="removeItem(${i})">🗑</button></td>
      </tr>
    `;
  });

  let total = subtotal + gstTotal;

  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("gstTotal").innerText = gstTotal.toFixed(2);
  document.getElementById("total").innerText = total.toFixed(2);

  // ✅ HIDE GST ROW
  document.getElementById("gstRow").style.display =
    gstEnabled ? "block" : "none";
}

/* CONTROLS */
window.inc = (i) => {
  items[i].qty++;
  saveCart();
  render();
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

/* CLEAR BILL */
window.clearBill = () => {
  if (!confirm("Clear all items?")) return;

  items = [];
  localStorage.removeItem("cart");
  render();
};

/* SAVE BILL */
window.saveBill = async function () {

  const customer = document.getElementById("customerName").value;
  const gstEnabled = document.getElementById("gstToggle").checked;

  if (!customer) return alert("Enter customer name");
  if (items.length === 0) return alert("No items");

  let subtotal = 0;
  let gstTotal = 0;

  items.forEach(i => {
    let sub = i.price * i.qty;
    let gst = gstEnabled ? (sub * i.gst) / 100 : 0;

    subtotal += sub;
    gstTotal += gst;
  });

  let total = subtotal + gstTotal;

  await addDoc(collection(db, "bills"), {
    invoiceNo: document.getElementById("invNo").innerText,
    customerName: customer,
    items,
    subtotal,
    gst: gstTotal,
    gstEnabled,
    total,
    createdAt: new Date()
  });

  alert("Saved ✅");
  clearBill();
};
/* PRINT */
window.printInvoice = () => {

  const customer = document.getElementById("customerName").value;

  const gstEnabled = document.getElementById("gstToggle").checked;

  let subtotal = 0;
  let gstTotal = 0;

  items.forEach(i => {
    let sub = i.price * i.qty;
    let gst = gstEnabled ? (sub * i.gst) / 100 : 0;

    subtotal += sub;
    gstTotal += gst;
  });

  let total = subtotal + gstTotal;

  const bill = {
    invoiceNo: document.getElementById("invNo").innerText,
    customerName: customer,
    items,
    total,
    gstEnabled,
    createdAt: new Date()
  };

  const html = getInvoiceHTML(bill, false); // normal invoice

  let win = window.open("", "", "width=800,height=600");
  win.document.write(`<body onload="window.print()">${html}</body>`);
};

window.goBack = () => window.history.back();
