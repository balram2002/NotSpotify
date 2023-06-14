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

const dropZone = document.querySelectorAll('.dropzone');
const img = document.querySelectorAll('.image');
let p1 = document.querySelectorAll('.p1');
let p2 = document.querySelectorAll('.p2');
const svg = dropZone[1].querySelector("svg");
const song = document.querySelector("#dropzone-file");
const image = document.querySelector("#dropzone-file2");
const sName = document.querySelector("#song-name");
const aName = document.querySelector("#artist-name");
const categoryList = document.querySelector("#category");
const playlistList = document.querySelector("#playlist");
const sAddress = document.querySelector("#song-address");
const imageAddress = document.querySelector("#image-address");
const save = document.getElementById("save");
const elementList = [song, image, sName, aName, categoryList];
const progressBar = document.getElementById("ProgressBar");
let category = [];
let playlist = [];
let duration;
let b = true;
let f = false;

getCategory().then(r => {
    let options = "<option value=\"0\">Select Category</option>";
    category.forEach(obj => {
        options += "<option value=" + obj["id"] + ">" + obj["name"] + "</option>";
    });
    categoryList.innerHTML = options;
});
getPlaylist().then(r => {
    let options = "<option value=\"0\">Select Playlist</option>";
    playlist.forEach(obj => {
        options += "<option value=" + obj["id"] + ">" + obj["name"] + "</option>";
    });
    playlistList.innerHTML = options;
});
getDuration();
save.addEventListener("click", onClick);


function setError(e) {
    e.classList.replace("dark:focus:ring-gray-900", "dark:focus:ring-red-600");
    e.classList.replace("focus:ring-indigo-600", "focus:ring-red-600");
    e.classList.replace("ring-gray-300", "ring-red-600");
    e.focus();
    b = false;
    if (b) e.onchange = null;
    else e.onchange = function () {
        e.classList.replace("dark:focus:ring-red-600", "dark:focus:ring-gray-900");
        e.classList.replace("focus:ring-red-600", "focus:ring-indigo-600");
        e.classList.replace("ring-red-600", "ring-gray-300");
        b = true;
    }
}

function setFileError(e) {
    const div = e.parentNode;
    div.classList.replace("border-gray-300", "border-red-600");
    div.classList.replace("dark:border-white", "dark:border-red-600");
    b = false;
    if (f) e.onchange = null;
    else e.onchange = function (event) {
        div.classList.replace("border-red-600", "border-gray-300");
        div.classList.replace("dark:border-red-600", "dark:border-white");
        b = true;
    }
}


function onClick() {
    if (!f) {
        elementList.forEach(e => {
            if (e.type == "file") {
                if (e.files.length == 0) {
                    setFileError(e);
                }
            } else if (e.value == "" || e.value == " " || e.value == 0) {
                setError(e);
            }
        });
        if (b) {
            startUploading();
        }
    } else location.reload();
}

async function saveInfo() {
    const name = sName.value;
    const artist = aName.value;
    const cat = categoryList.value;
    const plist = playlistList.value;
    const songAddress = sAddress.value;
    const imgAddress = imageAddress.value;
    const ref = await addDoc(collection(db,"songs"), {
        name: name,
        artist: artist,
        category: cat,
        duration: duration,
        songAddress: songAddress,
        imageAddress: imgAddress
    });
    const docRef = doc(db, "list/" + plist);
    const colRef = collection(docRef, "songs");
    await addDoc(colRef, {sid: ref.id, name: name, timestamp: serverTimestamp()});
}

function getDuration() {
    song.onchange = function (event) {
        const audio = new Audio();
        const target = event.currentTarget;
        const file = target.files[0];
        let reader = new FileReader();
        if (target.files && file) {
            reader = new FileReader();

            reader.onload = function (e) {
                audio.src = e.target.result;
                audio.addEventListener('loadedmetadata', function () {
                    const d = audio.duration;
                    const h = convertNumber(Number.parseInt((d.valueOf() / 60 / 60).toString()));
                    const m = convertNumber(Number.parseInt((d.valueOf() / 60).toString()));
                    const s = convertNumber(Number.parseInt((d.valueOf() % 60).toString()));
                    duration = h + "-" + m + "-" + s;
                }, false);
            };

            reader.readAsDataURL(file);
        }
    }
}

function convertNumber(e) {
    if (e != 0) if (e < 10) return ((e / 10).toString().replace(".", "")); else return (e);
    else return ("00");
}

async function getCategory() {
    const q = query(collection(db, "list"), where("isCategory", "==", true));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        category.push({
            id: doc.id,
            name: doc.data()["name"],
            imageAddress: doc.data()["imageAddress"]
        });
    });
}

async function getPlaylist() {
    const q = query(collection(db, "list"), where("isPlaylist", "==", true));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        playlist.push({
            id: doc.id,
            name: doc.data()["name"],
            imageAddress: doc.data()["imageAddress"]
        });
    });
}

function startUploading() {
    save.setAttribute("disabled", "");
    const div = document.getElementById("progress-div");
    div.classList.remove("hidden");
    let storageRef = ref(storage, "songs/" + sName.value + ". " + song.files[0].name.split(".").pop());
    let uploadTask = uploadBytesResumable(storageRef, song.files[0]);
    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(1);
            progressBar.style.width = progress.toString() / 2 + "%";
            progressBar.innerHTML = progress.toString() / 2 + "%";
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
                sAddress.value = downloadURL;
                storageRef = ref(storage, "images/song-images/" + image.files[0].name);
                uploadTask = uploadBytesResumable(storageRef, image.files[0]);
                const width = Number.parseInt(progressBar.style.width);
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(1);
                        progressBar.style.width = width + (Number.parseInt(progress) / 2) + "%";
                        progressBar.innerHTML = width + progress.toString() / 2 + "%";
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
                        saveInfo().then(r => {
                            progressBar.innerHTML = "Completed";
                            save.innerHTML = "Reset"
                            save.removeAttribute("disabled");
                        });
                        f = true;
                    });
                    });
            });
        }
    );

}
[song, image].forEach((ele, i) => ele.addEventListener('change', function (e) {
    const clickFile = this.files[0];
    if (clickFile) {
        if (i != 0) updateThumbnail(clickFile, svg, i);
        else updateThumbnail2(clickFile);
    }
}));
dropZone.forEach(ele => ele.addEventListener('dragover', (e) => {
    e.preventDefault();
}));
dropZone.forEach((ele, i) => ele.addEventListener('drop', (e) => {
    console.log("onDrop");
    let file = e.dataTransfer.files[0];
    e.preventDefault();
    if (i != 0) {
        image.files = e.dataTransfer.files;
        updateThumbnail(file, ele.querySelector("svg"), i);
    } else {
        song.files = e.dataTransfer.files;
        updateThumbnail2(file);
    }
}));

function updateThumbnail(file, svg, i) {
    svg.classList.add("hidden");
    img[i].style = "display:block;";
    img[i].height = 100;
    img[i].width = 100;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
        p1[i].style = 'display: none';
        p2[i].innerHTML = file.name;
        let src = this.result;
        img[i].src = src;
        img[i].alt = file.name
    }
}

function updateThumbnail2(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
        p1[0].style = 'display: none';
        p2[0].innerHTML = file.name;

    }
}

