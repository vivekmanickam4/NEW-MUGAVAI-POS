import { db } from "./firebase.js";
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

async function load(){

  let snap = await getDocs(collection(db,"bills"));

  let today = 0;
  let month = 0;

  let now = new Date();

  snap.forEach(d=>{
    let b = d.data();
    if (!b.createdAt) return;

let date = b.createdAt.seconds
  ? new Date(b.createdAt.seconds * 1000)
  : new Date(b.createdAt);

    // TODAY
    if(date.toDateString() === now.toDateString()){
      today += b.total;
    }

    // MONTH
    if(date.getMonth() === now.getMonth()){
      month += b.total;
    }
  });

  document.body.innerHTML += `
    <h2>Today's Sales ₹${today.toFixed(2)}</h2>
    <h2>Monthly Sales ₹${month.toFixed(2)}</h2>
  `;
}

/* BACK BUTTON */
window.goBack = function () {
  window.history.back();
};

load();
