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
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful");
      window.location.href = "./dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
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

// LOAD PRODUCTS
window.loadProducts = async function () {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "products"));

  querySnapshot.forEach((docItem) => {
    const data = docItem.data();

    const li = document.createElement("li");
    li.innerHTML = `
      ${data.name} | ₹${data.price} | GST: ${data.gst}%
      <button onclick="deleteProduct('${docItem.id}')">Delete</button>
      <button onclick="addToBill('${docItem.id}','${data.name}',${data.price},${data.gst})">Add</button>
    `;

    list.appendChild(li);
  });
};

// DELETE PRODUCT
window.deleteProduct = async function (id) {
  await deleteDoc(doc(db, "products", id));
  alert("Deleted");
  loadProducts();
};

// BILLING
let total = 0;

window.addToBill = function (id, name, price, gst) {
  const billList = document.getElementById("billList");

  const gstAmount = (price * gst) / 100;
  const finalPrice = price + gstAmount;

  total += finalPrice;

  const li = document.createElement("li");
  li.innerHTML = `${name} - ₹${finalPrice.toFixed(2)}`;

  billList.appendChild(li);

  document.getElementById("total").innerText = total.toFixed(2);
};
