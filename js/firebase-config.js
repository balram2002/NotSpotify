import {initializeApp} from "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {getStorage} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDObnvYDI9bwWyRta3vDBLSTxOhtdgQ5dQ",
    authDomain: "notspotify-d281f.firebaseapp.com",
    projectId: "notspotify-d281f",
    storageBucket: "notspotify-d281f.appspot.com",
    messagingSenderId: "331732154949",
    appId: "1:331732154949:web:51a069621d3b814d2ec12c",
    measurementId: "G-NKRWQLD1EX"
};
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

module.exports = app;
