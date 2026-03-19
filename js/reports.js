import { db } from "./firebase.js";
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function load(){
  let snap = await getDocs(collection(db,"bills"));

  let total = 0;

  snap.forEach(d=>{
    total += d.data().total;
  });

  sales.innerText = total.toFixed(2);
}

load();