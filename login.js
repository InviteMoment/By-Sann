import{

auth,

signInWithEmailAndPassword

}

from "./firebase.js";

const email =
document.getElementById("email");

const password =
document.getElementById("password");

const loginBtn =
document.getElementById("loginBtn");

const loginError =
document.getElementById("loginError");

loginBtn.addEventListener(
    "click",
    async()=>{

        alert("Button berfungsi");

        try{

            await signInWithEmailAndPassword(
                auth,
                email.value,
                password.value
            );

            location.href="admin.html";

        }catch{

            loginError.textContent =
            "Email atau Password salah.";

        }

    }
);