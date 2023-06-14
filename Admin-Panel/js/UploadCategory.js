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


const image = document.querySelector("#dropzone-file2");
const cName = document.querySelector("#Category-name");
const imageAddress = document.querySelector("#image-address");
const save = document.getElementById("save");
const progressBar = document.getElementById("ProgressBar");
let b = false;

save.addEventListener("click", onClick);

function setError(e) {
    e.classList.replace("dark:focus:ring-gray-900", "dark:focus:ring-red-600");
    e.classList.replace("focus:ring-indigo-600", "focus:ring-red-600");
    e.classList.replace("ring-gray-300", "ring-red-600");
    e.focus();
    if (b) e.onchange = null;
    else e.onchange = function () {
        e.classList.replace("dark:focus:ring-red-600", "dark:focus:ring-gray-900");
        e.classList.replace("focus:ring-red-600", "focus:ring-indigo-600");
        e.classList.replace("ring-red-600", "ring-gray-300");
    }
}

function setFileError(e) {
    const div = e.parentNode;
    div.classList.replace("border-gray-300", "border-red-600");
    div.classList.replace("dark:border-white", "dark:border-red-600");
    e.onchange = function (event) {
        div.classList.replace("border-red-600", "border-gray-300");
        div.classList.replace("dark:border-red-600", "dark:border-white");
    }
}

function onClick() {
    if (!b) {
        if (image.files.length == 0) {
            setFileError(image);
            return;
        }
        if (cName.value == "" || cName.value == " " || cName.value == 0) {
            setError(cName);
            return;
        }
        startUploading();

    } else location.reload();
}

async function saveInfo() {
    const name = cName.value;
    const imgAddress = imageAddress.value;
    const docRef = await addDoc(collection(db, "list"), {
        name: name,
        imageAddress: imgAddress,
        isCategory: true
    });
}

function startUploading() {
    save.setAttribute("disabled", "");
    const div = document.getElementById("progress-div");
    div.classList.remove("hidden");
    let storageRef = ref(storage, "images/category-images/" + cName.value + ". " + image.files[0].name.split(".").pop());
    let uploadTask = uploadBytesResumable(storageRef, image.files[0]);
    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(1);
            progressBar.style.width = progress.toString() + "%";
            progressBar.innerHTML = progress.toString() + "%";
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        },
        (error) => {
            console.log(error);
            progressBar.style.width = "100%";
            progressBar.innerHTML = "Failed";
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                imageAddress.value = downloadURL;
                progressBar.innerHTML = "Completed";
                save.innerHTML = "Reset"
                b = true;
                imageAddress.value = downloadURL;
                save.removeAttribute("disabled");
                console.log('File available at', downloadURL);
                saveInfo().then(r => console.log("Complete"))

            });
        }
    );

}

image.addEventListener('change', function (e) {
    const clickFile = this.files[0];
    if (clickFile) {
        updateThumbnail(clickFile);
    }
});
