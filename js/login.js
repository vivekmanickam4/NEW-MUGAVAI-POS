import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.login = async function(){

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try{
    await signInWithEmailAndPassword(auth, email, password);
    
    alert("Login Successful");
    window.location.href = "dashboard.html";

  }catch(err){
    alert(err.message);
  }
};