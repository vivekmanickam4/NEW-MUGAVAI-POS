// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyDU-_8EWlVyfmjjMS3hr2s2Wbs7Cmpa0ZY",
  authDomain: "fir-console-55101.firebaseapp.com",
  projectId: "fir-console-55101",
  storageBucket: "fir-console-55101.firebasestorage.app",
  messagingSenderId: "344044870689",
  appId: "1:344044870689:web:b69e6822e3deecc07fd760",
  measurementId: "G-2CMNXN1T9R"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// LOGIN
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful");
      window.location.href = "./dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};

// ADD PRODUCT
import { getFirestore, addDoc, collection, getDocs, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// ADD PRODUCT
window.addProduct = async function () {
  const barcode = document.getElementById("barcode").value;
  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;
  const gst = document.getElementById("gst").value;

  if (!barcode || !name || !price || !gst) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "products"), {
    barcode,
    name,
    price: Number(price),
    gst: Number(gst)
  });

  alert("Product added ✅");
  loadProducts();
};
    // clear fields
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";

  } catch (error) {
    alert(error.message);
  }
};

// Login function
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful");
      console.log("Redirecting now..."); 
      window.location.href = "./dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};
