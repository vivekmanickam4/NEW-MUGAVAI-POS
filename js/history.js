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
        
// VIEW BUTTON for bill
        <td>
  <button onclick="previewBill('${d.id}')">View</button>
</td>
window.previewBill = async function(id){

  const snap = await getDocs(collection(db,"bills"));

  let bill = null;

  snap.forEach(d=>{
    if(d.id === id){
      bill = d.data();
    }
  });

  if(!bill) return;

  let html = `
  <div id="printArea">
    <h2>INVOICE</h2>
    <p>Invoice: ${bill.invoiceNo}</p>
    <p>Customer: ${bill.customerName}</p>

    <table border="1" style="width:100%;text-align:center">
      <tr>
        <th>Name</th>
        <th>Price</th>
        <th>GST</th>
        <th>Total</th>
      </tr>
  `;

  bill.items.forEach(i=>{
    html += `
      <tr>
        <td>${i.name}</td>
        <td>${i.price}</td>
        <td>${i.gst}%</td>
        <td>${i.total}</td>
      </tr>
    `;
  });

  html += `</table>
  <h3>Total ₹${bill.total}</h3>
  </div>`;

  let win = window.open();
  win.document.write(html);
};

        <td>
          <button onclick="printInvoice('${d.id}')">Print</button>
          window.printInvoice = async function(id){

  const snap = await getDocs(collection(db,"bills"));

  let bill = null;

  snap.forEach(d=>{
    if(d.id === id){
      bill = d.data();
    }
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
        <th>Price</th>
        <th>GST</th>
        <th>Total</th>
      </tr>
  `;

  bill.items.forEach(i=>{
    html += `
    <tr>
      <td>${i.name}</td>
      <td>${i.price}</td>
      <td>${i.gst}%</td>
      <td>${i.total}</td>
    </tr>`;
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

window.downloadBill = async function(id){

  const { jsPDF } = window.jspdf;

  const snap = await getDocs(collection(db,"bills"));

  let bill = null;

  snap.forEach(d=>{
    if(d.id === id){
      bill = d.data();
    }
  });

  const doc = new jsPDF();

  doc.text("INVOICE", 90, 20);
  doc.text("Invoice: " + bill.invoiceNo, 20, 40);
  doc.text("Customer: " + bill.customerName, 20, 50);

  let y = 70;

  bill.items.forEach(i=>{
    doc.text(`${i.name} - ₹${i.total}`, 20, y);
    y += 10;
  });

  doc.text("Total: ₹" + bill.total, 20, y+10);

  doc.save(bill.invoiceNo + ".pdf");
};

load();
