import { db } from "./firebase.js";
import { collection, addDoc } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let items = [];

/* ADD PRODUCT (simulate barcode input) */
window.addByBarcode = function(product){

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
};

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
        <td>${i.total}</td>

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
    alert("No items!");
    return;
  }

  const total = items.reduce((s,i)=>s+i.total,0);

  const invoiceNo = "INV-" + Date.now();

  await addDoc(collection(db,"bills"),{
    invoiceNo,
    customerName: customer,
    items,
    total
  });

  alert("Saved!");
  location.reload();
};

/* PRINT CURRENT BILL */
window.printInvoice = function(){
  let html = document.getElementById("invoice").innerHTML;

  let win = window.open();
  win.document.write(`
    <html>
    <body onload="window.print()">
      ${html}
    </body>
    </html>
  `);
};