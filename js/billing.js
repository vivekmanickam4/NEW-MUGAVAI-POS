import { db } from "./firebase.js";
import { collection, addDoc, getDocs } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let items = [];

/* AUTO GENERATE INVOICE NUMBER */
document.getElementById("invNo").innerText = "INV-" + Date.now();

/* BARCODE SCAN */
document.getElementById("barcodeInput").addEventListener("change", async function(){

  const code = this.value;
  this.value = "";

  const snap = await getDocs(collection(db,"products"));

  snap.forEach(d=>{
    let p = d.data();

    if(p.barcode == code){
      addProduct(p);
    }
  });
});

/* ADD PRODUCT WITH QTY MERGE */
function addProduct(product){

  let existing = items.find(i => i.name === product.name);

  if(existing){
    existing.qty += 1;
    existing.total = existing.qty * existing.price;
  } else {
    items.push({
      name: product.name,
      price: product.price,
      gst: product.gst,
      qty: 1,
      total: product.price
    });
  }

  render();
}

/* RENDER TABLE */
function render(){

  const table = document.getElementById("billTable");

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Qty</th>
      <th>Price</th>
      <th>GST</th>
      <th>Total</th>
      <th>Action</th>
    </tr>
  `;

  let grand = 0;

  items.forEach((i,index)=>{

    grand += i.total;

    table.innerHTML += `
      <tr>
        <td>${i.name}</td>

        <td>
          <button onclick="dec(${index})">-</button>
          ${i.qty}
          <button onclick="inc(${index})">+</button>
        </td>

        <td>${i.price}</td>
        <td>${i.gst}%</td>
        <td>${i.total.toFixed(2)}</td>

        <td>
          <button onclick="removeItem(${index})">🗑</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("total").innerText = grand.toFixed(2);
}

/* BUTTON FUNCTIONS */
window.inc = function(i){
  items[i].qty++;
  items[i].total = items[i].qty * items[i].price;
  render();
};

window.dec = function(i){
  if(items[i].qty > 1){
    items[i].qty--;
    items[i].total = items[i].qty * items[i].price;
  } else {
    items.splice(i,1);
  }
  render();
};

window.removeItem = function(i){
  items.splice(i,1);
  render();
};

/* SAVE BILL */
window.saveBill = async function(){

  const customer = document.getElementById("customerName").value;

  if(items.length === 0){
    alert("No items added!");
    return;
  }

  const total = items.reduce((s,i)=>s+i.total,0);

  const invoiceNo = document.getElementById("invNo").innerText;

  await addDoc(collection(db,"bills"),{
    invoiceNo,
    customerName: customer,
    items,
    total
  });

  alert("Bill Saved!");
  location.reload();
};

/* PRINT ONLY INVOICE */
window.printInvoice = function(){

  const content = document.getElementById("invoice").innerHTML;

  let win = window.open();
  win.document.write(`
    <html>
    <body onload="window.print()">
      ${content}
    </body>
    </html>
  `);
};
