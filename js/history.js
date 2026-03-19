import { db } from "./firebase.js";
import {
  collection, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

async function load() {

  const table = document.getElementById("historyTable");

  table.innerHTML = `
    <tr>
      <th>Invoice</th>
      <th>Customer</th>
      <th>Total</th>
      <th>Preview</th>
      <th>Action</th>
    </tr>
  `;

  const snap = await getDocs(collection(db, "bills"));

  snap.forEach(d => {
    let b = d.data();

    table.innerHTML += `
      <tr>
        <td>${b.invoiceNo}</td>
        <td>${b.customerName}</td>
        <td>₹${b.total}</td>

        <td>
          <button onclick='previewBill(${JSON.stringify(b.items)})'>
            View
          </button>
        </td>

        <td>
          <button onclick="printBill()">Print</button>
          <button onclick="downloadBill('${b.invoiceNo}', ${b.total})">PDF</button>
          ${
            localStorage.getItem("role") === "admin"
            ? `<button onclick="delBill('${d.id}')">Delete</button>`
            : ""
          }
        </td>
      </tr>
    `;
  });
}

/* PREVIEW */
window.previewBill = function(items){
  let html = "<h3>Bill Preview</h3><table border='1' style='width:100%;text-align:center'>";

  html += "<tr><th>Name</th><th>Price</th><th>GST</th><th>Total</th></tr>";

  items.forEach(i=>{
    html += `<tr>
      <td>${i.name}</td>
      <td>${i.price}</td>
      <td>${i.gst}%</td>
      <td>${i.total}</td>
    </tr>`;
  });

  html += "</table>";

  let win = window.open();
  win.document.write(html);
};

/* DELETE */
window.delBill = async function (id) {
  await deleteDoc(doc(db, "bills", id));
  location.reload();
};

window.printBill = function () {
  window.print();
};

load();
