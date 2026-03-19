import { db } from "./firebase.js";
import {
  collection, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

async function load() {

  const table = document.getElementById("historyTable");

  const snap = await getDocs(collection(db, "bills"));

  table.innerHTML = `
    <tr>
      <th>Invoice</th>
      <th>Customer</th>
      <th>Total</th>
      <th>Action</th>
    </tr>
  `;

  snap.forEach(d => {
    let b = d.data();

    table.innerHTML += `
      <tr>
        <td>${b.invoiceNo}</td>
        <td>${b.customerName}</td>
        <td>₹${b.total}</td>
        <td>
          <button onclick="printBill('${b.invoiceNo}')">Print</button>
          <button onclick="downloadBill('${b.invoiceNo}')">PDF</button>
          ${
            localStorage.getItem("role")==="admin"
            ? `<button onclick="delBill('${d.id}')">Delete</button>`
            : ""
          }
        </td>
      </tr>
    `;
  });
}

window.delBill = async function(id){
  if(localStorage.getItem("role") !== "admin"){
    alert("Admin only");
    return;
  }

  await deleteDoc(doc(db,"bills",id));
  location.reload();
};

// PRINT
window.printBill = function(inv){
  alert("Open invoice: " + inv + " (you can enhance later)");
  window.print();
};

// PDF
window.downloadBill = function(inv){
  alert("PDF for: " + inv);
};

load();
