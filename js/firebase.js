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

// Login function
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful");
    })
    .catch((error) => {
      alert(error.message);
    });
};
