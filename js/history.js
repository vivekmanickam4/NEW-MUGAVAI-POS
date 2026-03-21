import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import { getInvoiceHTML } from "./printTemplate.js";

/* LOAD TABLE */
async function load() {
  const table = document.getElementById("historyTable");

  table.innerHTML = `
    <tr>
      <th>Invoice</th>
      <th>Customer</th>
      <th>Total</th>
      <th>Preview</th>
      <th>Actions</th>
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
          <button onclick="previewBill('${d.id}')">👁 View</button>
        </td>

        <td>
          <button onclick="printInvoice('${d.id}')">🖨 Print</button>
          <button onclick="printThermal('${d.id}')">🧾 Thermal</button>
          <button onclick="downloadBill('${d.id}')">📄 PDF</button>
          ${
            localStorage.getItem("role") === "admin"
              ? `<button onclick="delBill('${d.id}')">🗑 Delete</button>`
              : ""
          }
        </td>
      </tr>
    `;
  });
}

/* GET BILL */
async function getBill(id) {
  const ref = doc(db, "bills", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Bill not found");
    return null;
  }

  return snap.data();
}

/* 👁 PREVIEW (SAME DESIGN) */
window.previewBill = async function (id) {
  const bill = await getBill(id);
  if (!bill) return;

  const html = getInvoiceHTML(bill, false);

  let win = window.open("", "", "width=800,height=600");
  win.document.write(html);
};

/* 🖨 PRINT (STANDARD INVOICE) */
window.printInvoice = async function (id) {
  const bill = await getBill(id);
  if (!bill) return;

  const html = getInvoiceHTML(bill, false);

  let win = window.open("", "", "width=800,height=600");
  win.document.write(`<body onload="window.print()">${html}</body>`);
};

/* 🧾 THERMAL PRINT */
window.printThermal = async function (id) {
  const bill = await getBill(id);
  if (!bill) return;

  const html = getInvoiceHTML(bill, true);

  let win = window.open("", "", "width=300,height=600");
  win.document.write(`<body onload="window.print()">${html}</body>`);
};

/* 📄 PROPER PDF (formatted) */
window.downloadBill = async function (id) {
  const bill = await getBill(id);
  if (!bill) return;

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF();

  let y = 20;

  pdf.setFontSize(16);
  pdf.text("INVOICE", 90, y);

  y += 10;
  pdf.setFontSize(10);

  pdf.text("Invoice: " + bill.invoiceNo, 10, y);
  y += 8;

  pdf.text("Customer: " + bill.customerName, 10, y);
  y += 8;

  pdf.text("Date: " + new Date(bill.createdAt).toLocaleString(), 10, y);
  y += 10;

  pdf.text("Item | Qty | Price | GST | Total", 10, y);
  y += 8;

  bill.items.forEach(i => {
    pdf.text(
      `${i.name} | ${i.qty} | ${i.price} | ${i.gst}% | ${i.total}`,
      10,
      y
    );
    y += 8;
  });

  y += 10;
  pdf.text("Total: ₹" + bill.total, 10, y);

  pdf.save(bill.invoiceNo + ".pdf");
};

/* 📦 EXPORT ALL */
window.exportAll = async function () {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const snap = await getDocs(collection(db, "bills"));

  let y = 20;

  pdf.text("ALL BILL REPORT", 70, 10);

  snap.forEach(d => {
    let b = d.data();
    pdf.text(`${b.invoiceNo} | ${b.customerName} | ₹${b.total}`, 10, y);
    y += 10;
  });

  pdf.save("All_Bills.pdf");
};

/* 🗑 DELETE */
window.delBill = async function (id) {
  if (!confirm("Delete this bill?")) return;

  await deleteDoc(doc(db, "bills", id));
  alert("Deleted!");
  load();
};

/* 🔙 BACK */
window.goBack = () => window.history.back();

/* INIT */
load();
