import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let products = [];
let selectedIndex = -1;

/* LOAD PRODUCTS */
async function load() {

  const table = document.getElementById("table");

  if (!table) {
    console.error("Table not found!");
    return;
  }

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>GST</th>
      <th>Barcode</th>
      <th>Action</th>
    </tr>
  `;

  const snap = await getDocs(collection(db, "products"));

  products = [];

  snap.forEach(d => {
    const p = { id: d.id, ...d.data() };
    products.push(p);

    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.gst}%</td>
        <td>${p.barcode}</td>
        <td>
          ${
            localStorage.getItem("role") === "admin"
              ? `<button onclick="delProduct('${p.id}')">Delete</button>`
              : ""
          }
        </td>
      </tr>
    `;
  });
}

/* ADD PRODUCT */
window.addProduct = async function () {

  const name = document.getElementById("productName")?.value;
  const price = document.getElementById("productPrice")?.value;
  const gst = document.getElementById("gst")?.value;
  const barcode = document.getElementById("barcode")?.value;

  if (!name || !price || !gst || !barcode) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "products"), {
    name,
    price: parseFloat(price),
    gst: parseFloat(gst),
    barcode
  });

  alert("Product Added ✅");

  // clear inputs
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("gst").value = "";
  document.getElementById("barcode").value = "";

  load();
};

/* DELETE */
window.delProduct = async function (id) {
  if (!confirm("Delete product?")) return;
  await deleteDoc(doc(db, "products", id));
  load();
};

/* 🔍 SEARCH */
const search = document.getElementById("search");
const dropdown = document.getElementById("dropdown");

search.addEventListener("input", () => {

  const val = search.value.toLowerCase();
  dropdown.innerHTML = "";
  selectedIndex = -1;

  if (!val) return;

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(val) ||
    p.barcode.includes(val)
  );

  filtered.forEach((p, i) => {

    const div = document.createElement("div");
    div.innerText = `${p.name} (₹${p.price})`;

   div.onclick = () => {

  search.value = p.name;
  dropdown.innerHTML = "";

  const confirmAdd = confirm(`Do you want to add "${p.name}" to billing?`);

  if (!confirmAdd) return;

  // Save selected product
  localStorage.setItem("selectedProduct", JSON.stringify(p));

  // Go to billing page
  window.location.href = "billing.html";
};

    dropdown.appendChild(div);
  });
});

/* ⌨ KEYBOARD NAV */
search.addEventListener("keydown", (e) => {

  const items = dropdown.querySelectorAll("div");

  if (e.key === "ArrowDown") {
    selectedIndex++;
    update(items);
  }

  if (e.key === "ArrowUp") {
    selectedIndex--;
    update(items);
  }

  if (e.key === "Enter") {
    if (items[selectedIndex]) {
      items[selectedIndex].click();
    }
  }
});

function update(items) {
  items.forEach(i => i.classList.remove("active"));

  if (selectedIndex >= items.length) selectedIndex = 0;
  if (selectedIndex < 0) selectedIndex = items.length - 1;

  if (items[selectedIndex]) {
    items[selectedIndex].classList.add("active");
  }
}

/* BACK */
window.goBack = function () {
  window.history.back();
};

/* LOAD ON START */
load();
