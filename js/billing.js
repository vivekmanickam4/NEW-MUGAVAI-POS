import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let products=[], total=0;

async function load(){
  let snap = await getDocs(collection(db,"products"));
  snap.forEach(d=>products.push(d.data()));
}

window.addItem=function(){
  let p=products.find(x=>x.barcode==code.value);

  if(p){
    let price=p.price+(p.price*p.gst/100);
    total+=price;

    bill.innerHTML+=`<tr>
      <td>${p.name}</td>
      <td>₹${price.toFixed(2)}</td>
    </tr>`;

    update();
  }
}

function update(){
  let d=parseFloat(discount.value||0);
  let final=total-(total*d/100);
  totalSpan.innerText=final.toFixed(2);
}

window.printBill=function(){
  window.print();
}

discount.onchange=update;

load();