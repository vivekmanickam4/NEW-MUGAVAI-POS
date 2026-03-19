// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  getFirestore, addDoc, collection, getDocs,
  deleteDoc, doc, setDoc, onSnapshot
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

/* LOGIN */
window.login = async function () {
  const email = email.value;
  const password = password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    localStorage.setItem("role",
      email === "admin@gmail.com" ? "admin" : "cashier"
    );

    location.href = "dashboard.html";
  } catch (e) {
    alert(e.message);
  }
};

/* ADD PRODUCT */
window.addProduct = async function () {
  const barcode = barcode.value.trim();
  const name = productName.value.trim();
  const price = productPrice.value.trim();
  const gst = gst.value.trim();

  if (!barcode || !name || !price || !gst) return alert("Fill all");

  await setDoc(doc(db, "products", barcode), {
    barcode,
    name,
    price: Number(price),
    gst: Number(gst)
  });

  alert("Added ✅");
};

/* LOAD PRODUCTS */
window.loadProducts = function () {
  const list = document.getElementById("productList");
  if (!list) return;

  onSnapshot(collection(db, "products"), snap => {
    list.innerHTML = "";

    snap.forEach(d => {
      let p = d.data();

      list.innerHTML += `
        <p>${p.name} ₹${p.price}</p>
      `;
    });
  });
};

/* BILLING */
let total = 0;
let billItems = [];

function addProductToBill(p) {
  const table = document.getElementById("billTable");

  const gstAmount = (p.price * p.gst) / 100;
  const final = p.price + gstAmount;

  total += final;

  const index = billItems.length;

  billItems.push({ ...p, total: final });

  table.innerHTML += `
    <tr id="row-${index}">
      <td>${p.name}</td>
      <td>${p.price}</td>
      <td>${p.gst}%</td>
      <td>${final.toFixed(2)}</td>
      <td><button onclick="removeItem(${index}, ${final})">X</button></td>
    </tr>
  `;

  document.getElementById("total").innerText = total.toFixed(2);
}

/* REMOVE */
window.removeItem = function (i, price) {
  document.getElementById(`row-${i}`).remove();
  total -= price;
  total = Math.max(total, 0);
  document.getElementById("total").innerText = total.toFixed(2);
};

/* INVOICE */
function generateInvoiceNo() {
  return "INV-" + Date.now();
}

/* SAVE BILL */
window.saveBill = async function () {
  const customerName = document.getElementById("customerName").value;

  if (!customerName) return alert("Enter name");

  await addDoc(collection(db, "bills"), {
    invoiceNo: invNo.innerText,
    customerName,
    items: billItems,
    total,
    createdAt: new Date()
  });

  alert("Saved ✅");

  billTable.innerHTML = `
    <tr>
      <th>Name</th><th>Price</th><th>GST</th><th>Total</th><th>Action</th>
    </tr>
  `;

  total = 0;
  billItems = [];

  document.getElementById("total").innerText = "0";
  document.getElementById("invNo").innerText = generateInvoiceNo();
};

/* PRINT */
window.printInvoice = function () {
  window.print();
};

/* BARCODE */
let productCache = [];

async function loadProductsForScan() {
  const snap = await getDocs(collection(db, "products"));
  productCache = [];
  snap.forEach(d => productCache.push(d.data()));
}

/* INIT */
window.addEventListener("DOMContentLoaded", async () => {

  if (document.getElementById("productList")) loadProducts();

  if (document.getElementById("invNo"))
    document.getElementById("invNo").innerText = generateInvoiceNo();

  await loadProductsForScan();

  const input = document.getElementById("barcodeInput");

  if (input) {
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        const code = input.value.trim();
        const product = productCache.find(p => p.barcode === code);

        if (!product) return alert("Not found");

        addProductToBill(product);
        input.value = "";
      }
    });
  }
});

export { db };
