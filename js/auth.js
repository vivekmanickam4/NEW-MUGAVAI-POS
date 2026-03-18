import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.login = function(){
  signInWithEmailAndPassword(auth, email.value, pass.value)
    .then(res=>{
      let user = res.user.email;

      if(user === "admin@gmail.com"){
        localStorage.setItem("role","admin");
      }else{
        localStorage.setItem("role","cashier");
      }

      location.href="dashboard.html";
    })
    .catch(e=>alert(e.message));
}