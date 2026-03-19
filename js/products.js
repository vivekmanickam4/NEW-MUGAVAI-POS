import { db } from "./firebase.js";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

if(localStorage.getItem("role") !== "admin"){
  document.getElementById("adminPanel").style.display="none";
}

const col = collection(db,"products");

window.add = async function(){
  await addDoc(col,{
    name:name.value,
    price:parseFloat(price.value),
    gst:parseFloat(gst.value),
    barcode:barcode.value
  });
}

window.del = async function(id){
  await deleteDoc(doc(db,"products",id));
}

onSnapshot(col, snap=>{
  table.innerHTML="<tr><th>Name</th><th>Price</th><th>GST</th><th>Action</th></tr>";

  snap.forEach(d=>{
    let p=d.data();

    table.innerHTML+=`<tr>
      <td>${p.name}</td>
      <td>₹${p.price}</td>
      <td>${p.gst}%</td>
      <td>
        ${localStorage.getItem("role")==="admin" ? `<button onclick="del('${d.id}')">Delete</button>` : ""}
      </td>
    </tr>`;
  });
});
