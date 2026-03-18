// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

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

// ✅ ADD PRODUCT FUNCTION
window.addProduct = async function () {
  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;

  if (!name || !price) {
    alert("Enter all fields");
    return;
  }

  try {
    await addDoc(collection(db, "products"), {
      name: name,
      price: Number(price)
    });

    alert("Product added successfully");

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
