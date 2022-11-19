import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js'
import {firebaseConfig} from "./firebase-config.js";
import {
    getAuth, signInWithRedirect, getRedirectResult, signInWithPopup, createUserWithEmailAndPassword,
    GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, sendEmailVerification, updateProfile
}
    from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
var user;
console.log("Auth.js");

function getData(elements) {
    const obj = {};
    elements.forEach((e) => obj[e.name] = e.value);
    return obj;
}

const setError = (element) => element.style.borderColor = "red";


function validation(elements) {
    let c = null;
    elements.forEach((e) => {
        switch (e.name) {
            case "email" :
                if (e.value === "") setError(c = e);
                break;
            case "cEmail" :
                if (e.value === "" || e.value !== elements.at(0).value) setError(c = e);
                break;
            case "userName" :
                if (e.value === "") setError(c = e);
                break;
            case "password" :
                if (e.value.length < 8) setError(c = e);
                break;
            case "DOB" :
                if (e.value === "") setError(c = e);
                break;
        }
    });
    if (c == null) return getData(elements);
    else return null;

}

/* Login & Signup Using Firebase Email Verification */

document.querySelector(".btnDiv>.btn").onclick =
    function emailPassword_singIn() {
        const elements = document.querySelectorAll(".inputCtnr");
        const ele = [];
        elements.forEach((element) => ele.push(element.getElementsByTagName("input")[0]));
        let inputFieldsData = validation(ele);
        let gen = null;
        document.querySelectorAll('input[name="gender"]').forEach(g => {
            if (g.checked) gen = g.value;
        });
        if (gen == null) {
            setError(document.querySelector(".genderCtnr"));
            return;
        } else inputFieldsData["gender"] = gen;
        createUserWithEmailAndPassword(auth, inputFieldsData.email, inputFieldsData.password)
            .then((userCredential) => {
                user = userCredential.user;
                updateProfile(user, {
                    displayName: inputFieldsData.name, photoURL: ""
                }).then(() => {

                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode + "errorCode");
                    console.log(errorMessage + "errorMessage");
                });
                sendEmailVerification(user)
                    .then(() => {
                        console.log("Email Sent");
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode + "errorCode");
                console.log(errorMessage + "errorMessage");
            });

        $.post("http://musify.42web.io/Api%27s/signUpUser.php",
            inputFieldsData,
            function(data, status){
                    console.log(data+" : "+status);
        });
    }


/*





/*
//Email & Password Authentication
document.getElementById("btn3").onclick = function atts() {
var email = document.getElementById("e").value;
var pass = document.getElementById("p").value;
console.log("SignUp" + email.toString() + pass.toString());
signInWithEmailAndPassword(auth, email, pass)
.then((userCredential) => {
 // Signed in
 const user = userCredential.user;
 console.log(user);
 console.log(user.uid);
 // ...
})
.catch((error) => {
 const errorCode = error.code;
 const errorMessage = error.message;
 console.log(errorCode + "errorCode");
 console.log(errorMessage + "errorMessage");
});
}
*/