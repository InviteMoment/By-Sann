/* ==========================================================
   FIREBASE
========================================================== */

import { initializeApp }

from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {

    getAuth,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

/* ==========================================================
   CONFIG
========================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCaXifbahAVak49AhamdGwh2yqrcjNcIvI",
  authDomain: "by-sann-v3.firebaseapp.com",
  projectId: "by-sann-v3",
  storageBucket: "by-sann-v3.firebasestorage.app",
  messagingSenderId: "293896964689",
  appId: "1:293896964689:web:138fdaceb84ef059148670"
};

/* ==========================================================
   INIT
========================================================== */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

/* ==========================================================
   EXPORT
========================================================== */

export {

    db,

    auth,

    collection,

    addDoc,
  
    setDoc,
  
    updateDoc,

    deleteDoc,

    doc,
  
    getDoc,

    query,

    orderBy,

    onSnapshot,

    serverTimestamp,

    increment,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged

};