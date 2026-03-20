import { db } from "./firebase.js";
import {
  collection, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

/* LOAD TABLE */
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
        <td>₹${b.total.toFixed(2)}</td>

        <td>
          <button onclick="previewBill('${d.id}')">View</button>
        </td>

        <td>
          <button onclick="printInvoice('${d.id}')">Print</button>
          <button onclick="downloadBill('${d.id}')">PDF</button>
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
window.previewBill = async function(id){

  const snap = await getDocs(collection(db,"bills"));

  let bill = null;

  snap.forEach(d=>{
    if(d.id === id) bill = d.data();
  });

  if(!bill) return;

  let html = `
    <h2>INVOICE</h2>
    <p>Invoice: ${bill.invoiceNo}</p>
    <p>Customer: ${bill.customerName}</p>

    <table border="1" style="width:100%; text-align:center">
      <tr>
       <th>Name</th>
<th>Qty</th>
<th>Price</th>
<th>GST</th>
<th>Total</th>
      </tr>
  `;

  bill.items.forEach(i=>{
    html += `
      <tr>
        <td>${i.name}</td>
        <td>${i.qty || 1}</td>
<td>${i.price}</td>
<td>${i.gst}%</td>
<td>${i.total}</td>
      </tr>
    `;
  });

  html += `
    </table>
    <h3>Total ₹${bill.total}</h3>
  `;

  let win = window.open();
  win.document.write(html);
};

/* PRINT */
window.printInvoice = async function(id){

  const snap = await getDocs(collection(db,"bills"));

  let bill = null;

  snap.forEach(d=>{
    if(d.id === id) bill = d.data();
  });

  let html = `
  <html>
  <body onload="window.print()">
    <h2>INVOICE</h2>
    <p>Invoice: ${bill.invoiceNo}</p>
    <p>Customer: ${bill.customerName}</p>

    <table border="1" width="100%" style="text-align:center">
      <tr>
  <th>Name</th>
  <th>Qty</th>
  <th>Price</th>
  <th>GST</th>
  <th>Total</th>
      </tr>
  `;

  bill.items.forEach(i=>{
    html += `
      <tr>
        <td>${i.name}</td>
        <td>${i.qty || 1}</td>
<td>${i.price}</td>
<td>${i.gst}%</td>
<td>${i.total}</td>
      </tr>
    `;
  });

  html += `
    </table>
    <h3>Total ₹${bill.total}</h3>
  </body>
  </html>
  `;

  let win = window.open();
  win.document.write(html);
};

/* PDF */
window.downloadBill = async function(id){

  const { jsPDF } = window.jspdf;

  const snap = await getDocs(collection(db,"bills"));

  let bill = null;

  snap.forEach(d=>{
    if(d.id === id) bill = d.data();
  });

  const doc = new jsPDF();

  doc.text("INVOICE", 90, 20);
  doc.text("Invoice: " + bill.invoiceNo, 20, 40);
  doc.text("Customer: " + bill.customerName, 20, 50);

  let y = 70;

  bill.items.forEach(i=>{
    doc.text(`${i.name} x${i.qty || 1} - ₹${i.total}`, 20, y);
    y += 10;
  });

  doc.text("Total: ₹" + bill.total, 20, y+10);

  doc.save(bill.invoiceNo + ".pdf");
};

/* EXPORT ALL */
window.exportAll = async function(){

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const snap = await getDocs(collection(db,"bills"));

  let y = 20;

  doc.text("ALL BILL REPORT", 70, 10);

  snap.forEach(d=>{
    let b = d.data();
    doc.text(`${b.invoiceNo} | ${b.customerName} | ₹${b.total}`, 10, y);
    y += 10;
  });

  doc.save("All_Bills.pdf");
};

/* DELETE */
window.delBill = async function (id) {
  await deleteDoc(doc(db, "bills", id));
  location.reload();
};

load();
