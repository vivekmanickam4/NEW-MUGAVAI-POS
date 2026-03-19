import { db } from "./firebase.js";
import { collection, getDocs, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function load(){
  let snap = await getDocs(collection(db,"bills"));

  snap.forEach(d=>{
    let b = d.data();

    historyTable.innerHTML += `
      <tr>
        <td>${b.invoiceNo}</td>
        <td>${b.customerName}</td>
        <td>₹${b.total}</td>
        <td>
          ${localStorage.getItem("role")==="admin" ? `<button onclick="delBill('${d.id}')">Delete</button>`:""}
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
}

load();