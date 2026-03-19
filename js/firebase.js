// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  getFirestore, addDoc, collection, getDocs,
  deleteDoc, doc, onSnapshot,setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyDU-_8EWlVyfmjjMS3hr2s2Wbs7Cmpa0ZY",
  authDomain: "fir-console-55101.firebaseapp.com",
  projectId: "fir-console-55101",
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    localStorage.setItem("role",
      email === "admin@gmail.com" ? "admin" : "cashier"
    );

    alert("Login success ✅");
    window.location.href = "dashboard.html";

  } catch (error) {
    alert(error.message);
  }
};

// ADD PRODUCT
window.addProduct = async function () {
  const barcode = document.getElementById("barcode").value.trim();
  const name = document.getElementById("productName").value.trim();
  const price = document.getElementById("productPrice").value.trim();
  const gst = document.getElementById("gst").value.trim();

  if (!barcode || !name || !price || !gst) {
    alert("Fill all fields");
    return;
  }

  // 🔥 CHECK DUPLICATE IN FIRESTORE
  const existing = await getDocs(collection(db, "products"));

let found = false;
existing.forEach(d => {
  if (d.id === barcode) found = true;
});

if (found) {
  alert("❌ Product already exists!");
  return;
}

  // ✅ ADD PRODUCT
await setDoc(doc(db, "products", barcode), {
  barcode,
  name,
  price: Number(price),
  gst: Number(gst)
});
  
  alert("Product added ✅");

  // Clear inputs
  document.getElementById("barcode").value = "";
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("gst").value = "";
};

// LOAD PRODUCTS
window.loadProducts = function () {
  const list = document.getElementById("productList");
  if (!list) return;

  onSnapshot(collection(db, "products"), (snapshot) => {

    list.innerHTML = `
      <table border="1" width="100%" style="border-collapse:collapse; text-align:center;">
        <tr>
          <th>Barcode</th>
          <th>Name</th>
          <th>Price</th>
          <th>GST</th>
          <th>Action</th>
        </tr>
      </table>
    `;

    const table = list.querySelector("table");

    snapshot.forEach((docItem) => {
      const data = docItem.data();

      table.innerHTML += `
        <tr>
          <td>${data.barcode}</td>
          <td>${data.name}</td>
          <td>₹${data.price}</td>
          <td>${data.gst}%</td>
          <td>
            ${localStorage.getItem("role") === "admin"
              ? `<button onclick="deleteProduct('${docItem.id}')">Delete</button>`
              : ""}
          </td>
        </tr>
      `;
    });
  });
};

// DELETE PRODUCT
window.deleteProduct = async function (id) {
  if (localStorage.getItem("role") !== "admin") {
    alert("Only admin can delete");
    return;
  }
  await deleteDoc(doc(db, "products", id));
};

// BILLING
let total = 0;
let billItems = [];

function addProductToBill(p) {
  const table = document.getElementById("billTable");

  const gstAmount = (p.price * p.gst) / 100;
  const finalPrice = p.price + gstAmount;

  total += finalPrice;

  const index = billItems.length;

  billItems.push({
    name: p.name,
    price: p.price,
    gst: p.gst,
    total: finalPrice
  });

  table.innerHTML += `
    <tr id="row-${index}">
      <td>${p.name}</td>
      <td>₹${p.price}</td>
      <td>${p.gst}%</td>
      <td>₹${finalPrice.toFixed(2)}</td>
      <td><button onclick="removeItem(${index}, ${finalPrice})">Remove</button></td>
    </tr>
  `;

  document.getElementById("total").innerText = total.toFixed(2);
}

// REMOVE ITEM
window.removeItem = function (index, price) {
  document.getElementById(`row-${index}`).remove();
  total -= price;
  document.getElementById("total").innerText = total.toFixed(2);
};

// INVOICE
function generateInvoiceNo() {
  return "INV-" + Date.now();
}

// SAVE BILL
window.saveBill = async function () {
  const customerName = document.getElementById("customerName").value;

  if (!customerName) {
    alert("Enter customer name");
    return;
  }

  await addDoc(collection(db, "bills"), {
    invoiceNo: document.getElementById("invNo").innerText,
    customerName,
    items: billItems,
    total,
    createdAt: new Date()
  });

  alert("Bill Saved ✅");

  document.getElementById("billTable").innerHTML = `
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>GST</th>
      <th>Total</th>
      <th>Action</th>
    </tr>
  `;

  total = 0;
  billItems = [];
  document.getElementById("total").innerText = "0";
  document.getElementById("invNo").innerText = generateInvoiceNo();
};

// PRINT
window.printInvoice = function () {
  const content = document.getElementById("invoice").innerHTML;
  const win = window.open();
  win.document.write(content);
  win.print();
};

// BARCODE CACHE
let productCache = [];

async function loadProductsForScan() {
  const snap = await getDocs(collection(db, "products"));
  productCache = [];
  snap.forEach(doc => productCache.push(doc.data()));
}

// MAIN LOAD (ONLY ONE)
window.addEventListener("DOMContentLoaded", () => {

  if (document.getElementById("productList")) {
    loadProducts();
  }

  const inv = document.getElementById("invNo");
  if (inv) inv.innerText = generateInvoiceNo();

  const input = document.getElementById("barcodeInput");
  if (input) {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const code = input.value.trim();
        const product = productCache.find(p => p.barcode === code);

        if (!product) {
          alert("Not found");
          input.value = "";
          return;
        }

        addProductToBill(product);
        input.value = "";
      }
    });
  }

  loadProductsForScan();
});

export { db };
