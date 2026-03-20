// IMPORTS
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// GLOBAL STATE
let items = [];
let productCache = [];

// LOAD PRODUCTS (CACHE - FAST)
async function loadProducts() {
  const snap = await getDocs(collection(db, "products"));
  productCache = [];

  snap.forEach(doc => {
    productCache.push(doc.data());
  });
}

// CALL ON PAGE LOAD
loadProducts();

// AUTO GENERATE INVOICE NUMBER
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

// BARCODE SCAN (FAST)
document
  .getElementById("barcodeInput")
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

// ADD PRODUCT (MERGE QTY IF EXISTS)
function addProduct(product) {
  let existing = items.find(i => i.name === product.name);

  if (existing) {
    existing.qty++;

    const gstAmount = (existing.price * existing.gst) / 100;
    existing.total =
      existing.qty * (existing.price + gstAmount);
  } else {
    const gstAmount = (product.price * product.gst) / 100;

    items.push({
      name: product.name,
      price: product.price,
      gst: product.gst,
      qty: 1,
      total: product.price + gstAmount
    });
  }

  render();
}

// RENDER TABLE
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

  let grand = 0;

  items.forEach((item, index) => {
    grand += item.total;

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>
          <button onclick="dec(${index})">-</button>
          ${item.qty}
          <button onclick="inc(${index})">+</button>
        </td>
        <td>${item.price}</td>
        <td>${item.gst}%</td>
        <td>${item.total.toFixed(2)}</td>
        <td>
          <button onclick="removeItem(${index})">🗑</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("total").innerText =
    grand.toFixed(2);
}

// INCREMENT
window.inc = function (i) {
  items[i].qty++;

  const gstAmount = (items[i].price * items[i].gst) / 100;
  items[i].total =
    items[i].qty * (items[i].price + gstAmount);

  render();
};

// DECREMENT
window.dec = function (i) {
  if (items[i].qty > 1) {
    items[i].qty--;

    const gstAmount = (items[i].price * items[i].gst) / 100;
    items[i].total =
      items[i].qty * (items[i].price + gstAmount);
  } else {
    items.splice(i, 1);
  }

  render();
};

// REMOVE ITEM
window.removeItem = function (i) {
  items.splice(i, 1);
  render();
};

// SAVE BILL
window.saveBill = async function () {
  const customer = document.getElementById("customerName").value;

  if (!customer) {
    alert("Enter customer name");
    return;
  }

  if (items.length === 0) {
    alert("No items added!");
    return;
  }

  const total = items.reduce((sum, item) => sum + item.total, 0);
  const invoiceNo = document.getElementById("invNo").innerText;

  await addDoc(collection(db, "bills"), {
    invoiceNo,
    customerName: customer,
    items,
    total,
    createdAt: new Date()
  });

  alert("Bill Saved!");
  location.reload();
};

// PRINT INVOICE
window.printInvoice = function () {
  const content = document.getElementById("invoice").innerHTML;

  let win = window.open();

  win.document.write(`
    <html>
      <body onload="window.print()">
        ${content}
      </body>
    </html>
  `);
};

/* BACK BUTTON */
window.goBack = function () {
  window.history.back();
};
