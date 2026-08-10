/* ==========================================================
   BY-SANN V3 STABLE
   ADMIN.JS
========================================================== */

/* ==========================================================
   FIREBASE
========================================================== */

import {

    auth,
    db,

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

    signOut,
    onAuthStateChanged

} from "./firebase.js";


/* ==========================================================
   AUTH
========================================================== */

onAuthStateChanged(auth,(user)=>{

    if(!user){

        location.href="login.html";

    }

});


/* ==========================================================
   PAGE
========================================================== */

let currentPage="dashboard";

let editId="";

let rsvpData=[];

let momentData=[];

let wishData=[];


/* ==========================================================
   ELEMENT
========================================================== */

const menuButtons=document.querySelectorAll(".menuBtn");

const pageTitle=document.getElementById("pageTitle");

const pages=document.querySelectorAll(".pageContent");

const logoutBtn=document.getElementById("logoutBtn");


/* Dashboard */

const totalRsvp=document.getElementById("totalRsvp");

const totalMoment=document.getElementById("totalMoment");

const totalWish=document.getElementById("totalWish");


/* RSVP */

const searchRsvp=document.getElementById("searchRsvp");

const exportExcelBtn=document.getElementById("exportExcelBtn");

const rsvpList=document.getElementById("rsvpList");


/* Moment */

const searchMoment=document.getElementById("searchMoment");

const momentList=document.getElementById("momentList");


/* Wish */

const searchWish=document.getElementById("searchWish");

const wishList=document.getElementById("wishList");


/* Settings */

const groomName=document.getElementById("groomName");

const brideName=document.getElementById("brideName");

const weddingDate=document.getElementById("weddingDate");

const weddingTime=document.getElementById("weddingTime");

const address=document.getElementById("address");

const phone=document.getElementById("phone");

const whatsapp=document.getElementById("whatsapp");

const maps=document.getElementById("maps");

const waze=document.getElementById("waze");

const music=document.getElementById("music");

const rsvpOpen=document.getElementById("rsvpOpen");

const momentOpen=document.getElementById("momentOpen");

const wishOpen=document.getElementById("wishOpen");

const saveSettings=document.getElementById("saveSettings");


/* Media */

const coverUpload=document.getElementById("coverUpload");

const coverPreview=document.getElementById("coverPreview");

const uploadCover=document.getElementById("uploadCover");

const pageMediaList=document.getElementById("pageMediaList");


/* Modal */

const imageModal=document.getElementById("imageModal");

const previewImage=document.getElementById("previewImage");

const closeImageModal=document.getElementById("closeImageModal");

const editModal=document.getElementById("editModal");

const editName=document.getElementById("editName");

const editPhone=document.getElementById("editPhone");

const editAttendance=document.getElementById("editAttendance");

const editGuest=document.getElementById("editGuest");

const saveEditBtn=document.getElementById("saveEditBtn");


/* ==========================================================
   COLLECTION
========================================================== */

const rsvpRef=collection(db,"rsvps");

const momentRef=collection(db,"moments");

const wishRef=collection(db,"wishes");

const settingsRef=doc(db,"website","settings");


/* ==========================================================
   START
========================================================== */

console.log("✅ ADMIN V3 STABLE LOADED");

/* ==========================================================
   PAGE ENGINE
========================================================== */

const PAGE_MAP={

    dashboard:"dashboardPage",

    rsvp:"rsvpPage",

    moments:"momentsPage",

    wishes:"wishesPage",

    settings:"settingsPage",

    media:"mediaPage"

};

function openPage(page){

    currentPage=page;

    pages.forEach(section=>{

        section.classList.add("hidden");

    });

    menuButtons.forEach(btn=>{

        btn.classList.remove("active");

    });

    const target=document.getElementById(PAGE_MAP[page]);

    if(target){

        target.classList.remove("hidden");

    }

    const active=document.querySelector(

        `[data-page="${page}"]`

    );

    if(active){

        active.classList.add("active");

        pageTitle.textContent=

        active.textContent.trim();

    }

}


/* ==========================================================
   SIDEBAR
========================================================== */

menuButtons.forEach(button=>{

    if(!button.dataset.page) return;

    button.onclick=()=>{

        openPage(

            button.dataset.page

        );

    };

});

openPage("dashboard");


/* ==========================================================
   DASHBOARD
========================================================== */

onSnapshot(

    rsvpRef,

    snap=>{

        rsvpData=[];

        snap.forEach(doc=>{

            rsvpData.push({

                id:doc.id,

                ...doc.data()

            });

        });

        totalRsvp.textContent=rsvpData.length;

    }

);


onSnapshot(

    momentRef,

    snap=>{

        momentData=[];

        snap.forEach(doc=>{

            momentData.push({

                id:doc.id,

                ...doc.data()

            });

        });

        totalMoment.textContent=momentData.length;

    }

);


onSnapshot(

    wishRef,

    snap=>{

        wishData=[];

        snap.forEach(doc=>{

            wishData.push({

                id:doc.id,

                ...doc.data()

            });

        });

        totalWish.textContent=wishData.length;

    }

);


/* ==========================================================
   LOGOUT
========================================================== */

logoutBtn.onclick=async()=>{

    await signOut(auth);

    location.href="login.html";

};

console.log("✅ Navigation Ready");

