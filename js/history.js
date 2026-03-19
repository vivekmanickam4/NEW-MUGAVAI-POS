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
      <th>Action</th>
    </tr>
  `;

  const snap = await getDocs(collection(db, "bills"));

  if (snap.empty) {
    table.innerHTML += `<tr><td colspan="4">No Bills Found</td></tr>`;
    return;
  }

  snap.forEach(d => {
    let b = d.data();

    table.innerHTML += `
      <tr>
        <td>${b.invoiceNo}</td>
        <td>${b.customerName}</td>
        <td>₹${b.total}</td>
        <td>
          <button onclick="printBill()">Print</button>
          <button onclick="downloadBill()">PDF</button>
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

// DELETE
window.delBill = async function (id) {
  await deleteDoc(doc(db, "bills", id));
  alert("Deleted");
  location.reload();
};

// PRINT
window.printBill = function () {
  window.print();
};

// PDF (basic)
window.downloadBill = function () {
  alert("PDF feature coming next upgrade");
};

load();