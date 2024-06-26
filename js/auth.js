import {app, db, storage, auth} from "../../js/firebase-config.mjs";
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
    getStorage,
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import {
    getFirestore,
    getDocs,
    doc,
    setDoc,
    collection,
    where,
    query,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


function getData(elements) {
    const obj = {userId: null};
    elements.forEach((e) => obj[e.name] = e.value);
    return obj;
}

const setError = (element) => element.style.borderColor = "red";

function validation(elements) {
    let c = null;
    elements.forEach((e) => {
        const reg = /^((([a-z]|\d|[!#\$%&'*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
        switch (e.name) {
            case "email":
                if (e.value === "" || !reg.test(e.value)) setError(c = e);
                break;
            case "cEmail":
                if (e.value === "" || e.value !== elements.at(0).value) setError(c = e);
                break;
            case "userName":
                if (e.value === "") setError(c = e);
                break;
            case "password":
                if (e.value.length < 8) setError(c = e);
                break;
            case "DOB":
                if (e.value === "") setError(c = e);
                break;
        }
    });
    if (c == null) return getData(elements);
    else return null;

}

async function saveInfo(inputFieldsData) {
    await setDoc(doc(db, "user", inputFieldsData.userId), {
        name: inputFieldsData.userName,
        email: inputFieldsData.email,
        password: inputFieldsData.password,
        gender: inputFieldsData.gender,
        DOB: inputFieldsData.DOB
    });
}

/* Signup Using Firebase Email Verification & MySql */
if (document.title === "Signup - Musify") {
    const btn = document.querySelector(".btnDiv>.btn");
    btn.onclick =
        function emailPassword_singUp() {
            const elements = document.querySelectorAll("form>.inputCtnr");
            const ele = [];
            elements.forEach((element) => ele.push(element.getElementsByTagName("input")[0]));
            let inputFieldsData = validation(ele);
            let gen = null;
            document.querySelectorAll('input[name="gender"]').forEach(g => {
                if (g.checked) gen = g.value;
            });
            if (gen == null || gen == undefined) {
                setError(document.querySelector(".genderCtnr"));
                return;
            } else inputFieldsData["gender"] = gen;
            if (inputFieldsData != null) {
                btn.disabled = true;
                btn.lastElementChild.innerHTML = "Please Wait";
                createUserWithEmailAndPassword(auth, inputFieldsData.email, inputFieldsData.password)
                    .then((userCredential) => {
                        let user = userCredential.user;
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
                                alert("Email Verification Link Sent on your Email Address");
                            });
                        inputFieldsData.userId = user.uid;
                        console.log(inputFieldsData);
                        saveInfo(inputFieldsData).then(r => console.log("Complete"));
                    })
                    .catch((error) => {
                        if (error.code === "auth/email-already-in-use") alert("Email Already in use, \nPlease choose another Email");
                        btn.disabled = false;
                        btn.lastElementChild.innerHTML = "Sign Up";
                        console.log(error.errorCode + " errorCode");
                        console.log(error.code + " errorCode");
                        console.log(error.message + " errorMessage");
                    });
            }
        }
}

/* Login Using Firebase Email Verification & MySql */
if (document.title === "Login - Musify") {
    const btn = document.querySelector(".btnLogin");
    btn.addEventListener("click", emailPassword_singIn);

    function emailPassword_singIn() {
        const elements = document.querySelectorAll(".login>.inputCtnr");
        const ele = [];
        elements.forEach((element) => ele.push(element.getElementsByTagName("input")[0]));
        let inputFieldsData = validation(ele);
        console.log(inputFieldsData);
        if (inputFieldsData != null) {
            btn.disabled = true;
            btn.lastElementChild.innerHTML = "Please Wait";
            signInWithEmailAndPassword(auth, inputFieldsData.email, inputFieldsData.password)
                .then((userCredential) => {
                    if (userCredential.user.emailVerified) {
                        sessionStorage.setItem("uid", userCredential.uid);
                        sessionStorage.setItem("email", inputFieldsData.email);
                        location.href = "index.html";
                    } else alert("Please Verify Your Email")
                })
                .catch((error) => {
                    if (error.code === "auth/wrong-password") {
                        alert("Invalid Email & Password");
                        btn.disabled = false;
                        btn.lastElementChild.innerHTML = "LOG IN";
                    } else alert("Login Failed Try Again");
                    btn.disabled = false;
                    btn.lastElementChild.innerHTML = "LOG IN";
                    console.log(error);
                    console.log(error.code + " errorCode");
                    console.log(error.message + " errorMessage");
                });
        }
    }
}