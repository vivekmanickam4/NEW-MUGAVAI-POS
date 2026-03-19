// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, addDoc, collection, getDocs, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

    if (email === "admin@gmail.com") {
      localStorage.setItem("role", "admin");
    } else {
      localStorage.setItem("role", "cashier");
    }

    alert("Login success ✅");
    window.location.href = "dashboard.html";

  } catch (error) {
    alert(error.message);
  }
};
// ADD PRODUCT
window.addProduct = async function () {
  const barcode = document.getElementById("barcode").value;
  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;
  const gst = document.getElementById("gst").value;

  if (!barcode || !name || !price || !gst) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "products"), {
    barcode,
    name,
    price: Number(price),
    gst: Number(gst)
  });

  alert("Product added ✅");

  // clear fields
  document.getElementById("barcode").value = "";
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("gst").value = "";

  loadProducts();
};

// SEARCH / SCAN PRODUCT
window.onload = function(){

  // invoice
  if(document.getElementById("invNo")){
    document.getElementById("invNo").innerText = generateInvoiceNo();
  }

  // search box
  const search = document.getElementById("searchProduct");

  if(search){
    search.addEventListener("keypress", function(e){
      if(e.key === "Enter"){
        const value = search.value.toLowerCase();

        const items = document.querySelectorAll("#productList li");

        items.forEach(li=>{
          if(li.innerText.toLowerCase().includes(value)){
            li.style.background = "yellow";
          }
        });

        search.value="";
      }
    });
  }
};

// LOAD PRODUCTS
import { onSnapshot } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

window.loadProducts = function () {
  const list = document.getElementById("productList");

  onSnapshot(collection(db, "products"), (snapshot) => {
    list.innerHTML = "";

    snapshot.forEach((docItem) => {
      const data = docItem.data();

      const li = document.createElement("li");
      li.innerHTML = `
        ${data.name} | ₹${data.price} | GST: ${data.gst}%
        ${localStorage.getItem("role") === "admin" 
          ? `<button onclick="deleteProduct('${docItem.id}')">Delete</button>` 
          : ""}
        <button onclick="addToBill('${data.name}',${data.price},${data.gst})">Add</button>
      `;

      list.appendChild(li);
    });
  });
};

// DELETE PRODUCT
window.deleteProduct = async function (id) {
  if (localStorage.getItem("role") !== "admin") {
    alert("Only admin can delete products");
    return;
  }
  await deleteDoc(doc(db, "products", id));
  alert("Deleted");
  loadProducts();
};

// BILLING
let total = 0;
let billItems = [];

window.addToBill = function (name, price, gst) {

  const table = document.getElementById("billTable");

  const gstAmount = (price * gst) / 100;
  const finalPrice = price + gstAmount;

  total += finalPrice;

  billItems.push({
    name,
    price,
    gst,
    total: finalPrice
  });

  const row = `
    <tr>
      <td>${name}</td>
      <td>₹${price}</td>
      <td>${gst}%</td>
      <td>₹${finalPrice.toFixed(2)}</td>
    </tr>
  `;

  table.innerHTML += row;

  document.getElementById("total").innerText = total.toFixed(2);
};

//INVOICE NUMBER
function generateInvoiceNo() {
  return "INV-" + Date.now();
}

window.onload = function(){
  if(document.getElementById("invNo")){
    document.getElementById("invNo").innerText = generateInvoiceNo();
  }
};

//SAVE BILL TO HISTORY

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

  // RESET BILL
  document.getElementById("billTable").innerHTML = `
    <tr>
      <th>Product</th>
      <th>Price ₹</th>
      <th>GST %</th>
      <th>Total ₹</th>
    </tr>
  `;
  total = 0;
  billItems = [];
  document.getElementById("total").innerText = "0";
};

//PRINT BUTTON
window.printInvoice = function () {
  const content = document.getElementById("invoice").innerHTML;
  const win = window.open();
  win.document.write(content);
  win.print();
};

//PDF DOWNLOAD
window.downloadPDF = async function () {
  const { jsPDF } = window.jspdf;

  const invoice = document.getElementById("invoice");

  const canvas = await html2canvas(invoice);
  const img = canvas.toDataURL("image/png");

  const pdf = new jsPDF();
  pdf.addImage(img, "PNG", 10, 10);
  pdf.save("invoice.pdf");
};

//ADD BARCODE LOGIC

let productCache = [];

async function loadProductsForScan() {
  const snap = await getDocs(collection(db, "products"));
  productCache = [];

  snap.forEach(doc => {
    productCache.push(doc.data());
  });
}

// CALL ON LOAD
window.addEventListener("load", loadProductsForScan); 

//BARCODE SCAN SYSTEM

window.addEventListener("load", () => {

  const input = document.getElementById("barcodeInput");

  if (!input) return;

  input.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

      const code = input.value.trim();

      const product = productCache.find(p => p.barcode === code);

      if (!product) {
        alert("Product not found ❌");
        input.value = "";
        return;
      }

      addProductToBill(product);
      input.value = "";
    }
  });

});

//ADD PRODUCT TO BILL

function addProductToBill(p) {

  const table = document.getElementById("billTable");

  const gstAmount = (p.price * p.gst) / 100;
  const finalPrice = p.price + gstAmount;

  total += finalPrice;

  const row = `
    <tr>
      <td>${p.name}</td>
      <td>₹${p.price}</td>
      <td>${p.gst}%</td>
      <td>₹${finalPrice.toFixed(2)}</td>
    </tr>
  `;

  table.innerHTML += row;

  document.getElementById("total").innerText = total.toFixed(2);
}
