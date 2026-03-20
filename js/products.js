import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const table = document.getElementById("productTable");

/* ADD PRODUCT */
window.addProduct = async function () {
  const name = document.getElementById("name").value;
  const price = parseFloat(document.getElementById("price").value);
  const gst = parseFloat(document.getElementById("gst").value);
  const barcode = document.getElementById("barcode").value;

  if (!name || !price || !gst || !barcode) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "products"), {
    name,
    price,
    gst,
    barcode
  });

  alert("Added!");
  location.reload();
};

/* LOAD PRODUCTS */
async function load() {
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

  snap.forEach(d => {
    const p = d.data();

    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.gst}%</td>
        <td>${p.barcode}</td>
        <td>
          ${
            localStorage.getItem("role") === "admin"
              ? `<button onclick="delProduct('${d.id}')">Delete</button>`
              : ""
          }
        </td>
      </tr>
    `;
  });
}

/* DELETE */
window.delProduct = async function (id) {
  if (!confirm("Delete product?")) return;

  await deleteDoc(doc(db, "products", id));
  alert("Deleted!");
  load();
};

/* BACK BUTTON */
window.goBack = function () {
  window.history.back();
};

load();
