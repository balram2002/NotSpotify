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


const homeData = new Array();
let playList = new Array();
let searchSongData = new Array();
let track_index = 0;
const uid = sessionStorage.getItem("uid");
const uEmail = sessionStorage.getItem("email");


if (uid != null) {
    document.querySelector('.navBtns').style = 'display: none;';
    document.querySelector('.navUName>h3').textContent = uEmail;
} else {
    document.querySelector('.navUName').style = 'display: none';
}
;

document.querySelector(".logout").addEventListener("click", () => {
    sessionStorage.removeItem("uid");
    sessionStorage.removeItem("email");
    location.href = "index.html";
    /* alert('logout'); */
});


/* Session uid & email */
console.log("uid: " + uid + ", Email: " + uEmail);
document.body.onload = () => {
    route('shimmer');
    loadData().then(r => setTimeout(route('home', homeData), 1000));
}

/*document.querySelectorAll('.playPauseBtn').forEach((btn) => {
    btn.addEventListener('click', function () {
        togglePPIcon(this.querySelector("Img").id);
    });
});*/

document.querySelectorAll('.navItem, .navItem2').forEach((btn) => {
    btn.addEventListener('click', function () {
        if (uid != null || this.id === "search" || this.id === "home") {
            const current = document.getElementsByClassName("sideBarActive");
            current[0].className = current[0].className.replace(" sideBarActive", "");
            this.className += " sideBarActive";
            route(this.id);
        } else location.href = "signin.html";
    });
});

document.getElementById("SvgMenu").onclick = () => {
    const x = document.getElementById("navMenuLinks");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
}


function random_bg_color() {
    let red = Math.floor(Math.random() * 176) + 10
    let green = Math.floor(Math.random() * 176) + 10;
    let blue = Math.floor(Math.random() * 176) + 10;
    return "rgb(" + red + ", " + green + ", " + blue + ")";
}

function route(id, i = null) {
    const xhttp = new XMLHttpRequest();
    //const sbr = document.querySelector('.searchbar > input');

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("content").innerHTML = this.responseText;
        }
    };
    xhttp.onload = async function () {
        if (id === 'search') {
            document.querySelector('.searchbar').style = "display: flex;";
            document.querySelectorAll('.catCard').forEach((card) => {
                card.style.backgroundColor = random_bg_color();
            });
        } else document.querySelector('.searchbar').style = "display: none;";

        if (id === 'library') {
            document.querySelectorAll(".musiclistbutton")[0].addEventListener('click', () => {
                document.querySelector(".availListCtnr").style = "display: block;";
                document.querySelector(".noListCtnr").style = "display: none;";
            });
        }
        if (id === 'home') {
            const cards = document.querySelectorAll(".spotify-playlist > .list .item");
            homeData.forEach((item, idx) => {
                const e = cards[idx].querySelector("h4");
                e.textContent = item.title;
                e.id = item.id;
                cards[idx].querySelector("p").textContent = item.subtitle;
                cards[idx].querySelector("img").src = item.img;
                cards[idx].addEventListener("click", function () {
                    route('playlist', {id: item.id, title: item.title, subtitle: item.subtitle, img: item.img});
                });
            });
        }
        if (id === 'playlist' && i != null) {


            if (playList.length !== 0) playList = [];
            console.log("getDocs " + i.id);
            const snapshot1 = await getDocs(collection(db, "songs"));
            const songs = [];
            snapshot1.forEach(doc => {
                const data = doc.data();
                songs.push({
                    id: doc.id,
                    title: data.name,
                    path: data.songAddress,
                    sImgPath: data.imageAddress,
                    artist: data.artist,
                    duration: data.duration,
                    cid: data.category,
                    sadded: undefined
                });
            });
            const docRef = doc(db, "list/" + i.id);
            const colRef = collection(docRef, "songs");
            const snapshot = await getDocs(colRef);
            snapshot.forEach(doc => {
                const obj = songs.find(o => o.id == doc.data().sid);
                const tStamp = doc.data().timestamp.toMillis();
                const date = new Date(tStamp);
                obj["sadded"] = date.toLocaleDateString("en-US");
                console.log(obj.sImgPath);
                playList.push(obj)
            })


            /*obj.forEach(element => {

            });*/


            document.querySelector(".tophead>.ctnr .title").textContent = i.title;
            document.querySelector(".tophead>.ctnr .subtitle").textContent = i.subtitle;
            document.querySelector(".parent>.tophead").style.backgroundImage = "url(" + i.img + ")";
            const sList = document.querySelector('.tableList').getElementsByTagName('tbody')[0];
            playList.forEach((e, i) => {
                let row = sList.insertRow();
                row.addEventListener("click", function () {
                    track_index = i;
                    loadTrack(i, playList)
                });
                let cell1 = row.insertCell(0);
                let cell3 = row.insertCell(1);
                let cell4 = row.insertCell(2);

                cell1.innerHTML = "<div class='title'>\n" +
                    "                            <p class='number'> " + (i + 1) + " </p><img src='" + e.sImgPath + "' alt='cover'\n" +
                    "                                class='img'>\n" +
                    "                            <div class='songdetails'>\n" +
                    "                                <p class='songname' value='" + i + "' >" + e.title + "</p>\n" +
                    "                                <p class='artistname'>" + e.artist + "</p>\n" +
                    "                            </div>\n" +
                    "                        </div>";

                cell3.innerHTML = "<div>\n" +
                    "                            <p class='dateadded'>" + e.sadded + "</p>\n" +
                    "                        </div>";
                cell4.innerHTML = "<div>\n" +
                    "                            <p class='time'>" + e.duration.replace("00:", "") + "</p>\n" +
                    "                        </div>";
            });


        }
    }
    xhttp.open("GET", "pages/" + id + ".txt", false);
    xhttp.send();
}

async function loadData() {
    const snapshot = await getDocs(query(collection(db, "list"), where("isPlaylist", "==", true)));
    snapshot.forEach(doc => {
        const data = doc.data();
        homeData.push({
            id: doc.id,
            title: data["name"],
            subtitle: data["description"],
            img: data["imageAddress"]
        });
    });
}

const sbr = document.getElementById("sbr");
sbr.addEventListener("input", () => {
    getSongs(sbr.value).then(r => {
    });
});

async function getSongs(s) {
    const catCtnr = document.querySelector('.categoryCtnr');
    const parCtnr = document.querySelector('.parentCtnr');
    if (s.length != 0) {
        parCtnr.style = 'display: flex';
        catCtnr.style = 'display: none';
    } else {
        catCtnr.style = 'display: block';
        parCtnr.style = 'display: none';
    }

    const snapshot = await getDocs(query(collection(db, "songs"), where("name", ">=", s)));
    console.log();
    const sDiv = document.querySelector('.songCtnr');
    sDiv.innerHTML = '<h2/>Songs</h2>';
    if (Object.keys(snapshot).length > 0) {
        console.log(snapshot.docs[0].data());
        document.querySelector(".topResultCtnr > .cardCtnr").style = 'display: block;';
        document.querySelector(".topResultCtnr > .cardCtnr > img").src = snapshot.docs[0].data().imageAddress;
        document.querySelector(".topResultCtnr > .cardCtnr > h1").textContent = snapshot.docs[0].data().name;
        document.querySelector(".topResultCtnr > .cardCtnr > div > h4").textContent = snapshot.docs[0].data().artist;
    } else document.querySelector(".topResultCtnr > .cardCtnr").style = 'display: none;';
    snapshot.forEach((doc) => {
        const data = doc.data();
        let imgPath = data.imageAddress;
        searchSongData.push({
            sId: doc.id,
            sName: data.name,
            sArtist: data.artist,
            sDuration: data.duration,
            sPath: data.songAddress,
            sImg: data.imageAddress
        });
        const ele = document.createElement("div");
        ele.innerHTML = "<div class='songItem'>" +
            "<div class='imgCtnr'>" +
            "<img src='" + imgPath + "'>" +
            "</div>" +
            "<div class='textCtnr'>" +
            "<div class='left'>" +
            "<h3>" + data.name + "</h3>" +
            "<p>" + data.artist + "</p>" +
            "</div>" +
            "<div class='right'>" +
            "<h4>" + data.duration + "</h4>" +
            "</div>" +
            "</div>" +
            "</div>";
        sDiv.appendChild(ele);
    });
}