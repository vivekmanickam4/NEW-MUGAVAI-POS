import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

async function loadProducts() {
  const table = document.getElementById("table");

  const snap = await getDocs(collection(db, "products"));

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>GST</th>
    </tr>
  `;

  snap.forEach(d => {
    let p = d.data();

    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.gst}%</td>
      </tr>
    `;
  });
}

loadProducts();
