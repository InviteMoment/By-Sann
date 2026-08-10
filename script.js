/* ==========================================================
   BY-SANN V3 FINAL
========================================================== */

import {

    db,

    collection,

    addDoc,

    updateDoc,

    deleteDoc,

    doc,
  
    getDoc, 

    increment,

    serverTimestamp,

    onSnapshot,

    query,

    orderBy

}

from "./firebase.js";

/* ==========================================================
   ELEMENT
========================================================== */

const cover = document.getElementById("cover");
const envelope = document.getElementById("envelope");

const pageImages = {};

for(let i=1;i<=10;i++){

    pageImages[i] =
    document.getElementById(`page${i}Image`);

    if(pageImages[i]){

        pageImages[i].loading = "lazy";

        pageImages[i].decoding = "async";

        pageImages[i].fetchPriority =
            i===1 ? "high" : "low";

    }

}

const website = document.getElementById("website");

const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");

const bottomNav = document.getElementById("bottomNav");

const sheetOverlay = document.getElementById("sheetOverlay");
const bottomSheet = document.getElementById("bottomSheet");
const sheetContent = document.getElementById("sheetContent");

const dateBtn = document.getElementById("dateBtn");
const locationBtn = document.getElementById("locationBtn");
const contactBtn = document.getElementById("contactBtn");
const rsvpBtn = document.getElementById("rsvpBtn");
const galleryBtn = document.getElementById("galleryBtn");
const wishBtn = document.getElementById("wishBtn");

const toast = document.getElementById("toast");

const totalAttend =
    document.getElementById("totalAttend");

const totalAbsent =
    document.getElementById("totalAbsent");

const totalGuest =
    document.getElementById("totalGuest");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");
const prevImage = document.getElementById("prevImage");
const nextImage = document.getElementById("nextImage");

/* ==========================================================
   GLOBAL
========================================================== */

let musicPlaying = false;

let currentSheet = "";

let currentGalleryIndex = 0;

/* ---------- Moment Lightbox ---------- */
let momentImages = [];
let currentMomentIndex = 0;

const galleryImages = [];

/* ==========================================================
   CONFIG
========================================================== */

let CONFIG = {

    /* ----------------------------------
       BRAND
    ---------------------------------- */

    brand: "By-Sann",

    theme: "Royal Blue",

    copyright:
        "Made with ❤️ by By-Sann",

    /* ----------------------------------
       PENGANTIN
    ---------------------------------- */

    bride: "Nur Atikah",

    groom: "Mohammad Hafiezul",

    /* ----------------------------------
       MAJLIS
    ---------------------------------- */

    day: "Ahad",

    date: "08 November 2026",

    time: "11:00 AM",

    endTime: "2:00 PM",

   address:
        "Ayu Heritage Bungalow, Tambun, Perak",

    /* ----------------------------------
       LOKASI
    ---------------------------------- */

    maps:
        "https://maps.app.goo.gl/GsPCpoPkVa11SCqz5?g_st=ac",

    waze:
        "https://waze.com/ul/hw0zfjx5wb",

    /* ----------------------------------
       HUBUNGI
    ---------------------------------- */

contacts: [

    {

contactName:"Yana",

contactRole:"Wakil Pengantin",

phone:"+60123456789",

    }

    // Tambah contact kedua di sini nanti

],

music: "music/song.m4a"

};

/* ==========================================================
   LOAD SETTINGS
========================================================== */

async function loadSettings(){

    try{

        const snap = await getDoc(
            doc(db,"settings","config")
        );

        if(!snap.exists()) return;

CONFIG = {

    ...CONFIG,

    bride: snap.data().brideName,

    groom: snap.data().groomName,

    day: snap.data().day,

    date: snap.data().displayDate,

    time: snap.data().weddingTime,

    endTime: snap.data().endTime,

    address: snap.data().address,

    maps: snap.data().maps,

    waze: snap.data().waze,

    music: snap.data().music,

    contacts:[
        {
            contactName:"Yana",
            contactRole:"Wakil Pengantin",
            phone:snap.data().phone
        }
    ]

};

        music.src = CONFIG.music;

if(snap.data().coverImage){

    envelope.src = snap.data().coverImage;

}

const pages = snap.data().pageImages || {};

for(let i=1;i<=10;i++){

    if(

        pages[`page${i}`] &&
        pageImages[i]

    ){

        pageImages[i].src =
        pages[`page${i}`];

    }

}

targetDate = new Date(
    `${snap.data().weddingDate}T${snap.data().weddingTime}`
).getTime();

        updateCountdown();

        // RSVP
if(!snap.data().rsvpOpen){

    rsvpBtn.style.display = "none";

    const pageBtn =
    document.getElementById("openRsvpSheet");

    if(pageBtn){

        pageBtn.style.display = "none";

    }

}

// Momen
if(!snap.data().momentOpen){

    galleryBtn.style.display = "none";

    const pageBtn =
    document.getElementById("openMomentPicker");

    if(pageBtn){

        pageBtn.style.display = "none";

    }

}

// Ucapan
if(!snap.data().wishOpen){

    wishBtn.style.display = "none";

    const pageBtn =
    document.getElementById("openWishSheet");

    if(pageBtn){

        pageBtn.style.display = "none";

    }

}

    }catch(error){

        console.log(error);

    }

}

loadSettings();

/* ==========================================================
   COVER ENGINE
========================================================== */

function openInvitation(){

    envelope.style.pointerEvents = "none";

    cover.style.transition = ".8s ease";

    website.style.display = "block";

    website.style.opacity = "0";

    setTimeout(()=>{

        cover.style.opacity = "0";

    },100);

    setTimeout(()=>{

        cover.style.display = "none";

        bottomNav.style.display = "grid";

        musicBtn.style.display = "flex";

        website.style.transition = ".6s ease";

        website.style.opacity = "1";

        playMusic();

        revealSection();

    },800);

}

envelope.addEventListener("click", openInvitation);

/* ==========================================================
   MUSIC ENGINE
========================================================== */

function playMusic(){
  
    music.preload="auto";

    music.play()

        .then(()=>{

            musicPlaying = true;

            musicBtn.classList.add("playing");

        })

        .catch(err=>{

            console.warn(err);

        });

}

function pauseMusic(){

    music.pause();

    musicPlaying = false;

    musicBtn.classList.remove("playing");

}

musicBtn.addEventListener("click",()=>{

    if(musicPlaying){

        pauseMusic();

    }else{

        playMusic();

    }

});

/* ==========================================================
   SCROLL REVEAL
========================================================== */

const fadeSection = document.querySelectorAll(".fade-section");

function revealSection(){

    const trigger = window.innerHeight * .85;

    fadeSection.forEach(section=>{

        const top = section.getBoundingClientRect().top;

        if(top < trigger){

            section.classList.add("show");

        }

    });

}

let revealTick=false;

window.addEventListener("scroll",()=>{

    if(revealTick) return;

    revealTick=true;

    requestAnimationFrame(()=>{

        revealSection();

        revealTick=false;

    });

},{
    passive:true
});

let resizeTimer;

window.addEventListener("resize",()=>{

    clearTimeout(resizeTimer);

    resizeTimer=setTimeout(()=>{

        revealSection();

    },150);

},{
    passive:true
});

/* ==========================================================
   COUNTDOWN ENGINE
========================================================== */

let targetDate = 0;

const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");

function updateCountdown(){

    const now = new Date().getTime();

    const distance = targetDate - now;

    if(distance <= 0){

        days.textContent = "00";
        hours.textContent = "00";
        minutes.textContent = "00";
        seconds.textContent = "00";

        return;

    }

    const d = Math.floor(distance/(1000*60*60*24));

    const h = Math.floor(
        (distance%(1000*60*60*24))
        /(1000*60*60)
    );

    const m = Math.floor(
        (distance%(1000*60*60))
        /(1000*60)
    );

    const s = Math.floor(
        (distance%(1000*60))
        /1000
    );

    days.textContent = String(d).padStart(2,"0");
    hours.textContent = String(h).padStart(2,"0");
    minutes.textContent = String(m).padStart(2,"0");
    seconds.textContent = String(s).padStart(2,"0");

}

updateCountdown();

let countdownInterval;

function startCountdown(){

    if(countdownInterval) return;

    countdownInterval=setInterval(updateCountdown,1000);

}

function stopCountdown(){

    clearInterval(countdownInterval);

    countdownInterval=null;

}

document.addEventListener("visibilitychange",()=>{

    if(document.hidden){

        stopCountdown();

    }else{

        updateCountdown();

        startCountdown();

    }

});

startCountdown();

/* ==========================================================
   BOTTOM SHEET
========================================================== */

function openSheet(html){

    currentSheet = html;

    sheetContent.innerHTML = html;

    sheetOverlay.classList.add("show");

    bottomSheet.classList.add("show");

    document.body.style.overflow = "hidden";

}

function closeSheet(){

    sheetOverlay.classList.remove("show");

    bottomSheet.classList.remove("show");

    document.body.style.overflow = "";

}

sheetOverlay.addEventListener("click",closeSheet);

/* ==========================================================
   DRAG TO CLOSE
========================================================== */

let startY = 0;

let currentY = 0;

let dragging = false;

bottomSheet.addEventListener("touchstart",(e)=>{

    startY = e.touches[0].clientY;

    dragging = true;

});

bottomSheet.addEventListener("touchmove",(e)=>{

    if(!dragging) return;

    currentY = e.touches[0].clientY;

    const move = currentY - startY;

    if(move > 0){

        bottomSheet.style.transform =
            `translateY(${move}px)`;

    }

});

bottomSheet.addEventListener("touchend",()=>{

    dragging = false;

    const move = currentY - startY;

    if(move > 150){

        closeSheet();

    }

    bottomSheet.style.transform = "";

});

/* ==========================================================
   ACTIVE BUTTON
========================================================== */

function setActiveButton(button){

    document
        .querySelectorAll("#bottomNav button")
        .forEach(btn=>{

            btn.classList.remove("active");

        });

    button.classList.add("active");

}

/* ==========================================================
   TARIKH
========================================================== */

dateBtn.addEventListener("click",()=>{

    setActiveButton(dateBtn);

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>📅 Tarikh Majlis</h2>

        <div class="sheetCard">

            <h3>Walimatul Urus</h3>

            <p>

 ${CONFIG.day}

<br><br>

${CONFIG.date}

<br><br>

${CONFIG.time}

<br>

hingga

${CONFIG.endTime}

            </p>

        </div>

    `);

});

/* ==========================================================
   LOKASI
========================================================== */

locationBtn.addEventListener("click",()=>{

    setActiveButton(locationBtn);

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>📍 Lokasi Majlis</h2>

       <div class="locationPreview">

    <img
        src="images/maps.jpg"
        alt="Lokasi Majlis"
        id="locationPreview">

</div>

<div class="sheetCard">

    <h3>Dewan Majlis</h3>

    <p class="locationAddress">

        ${CONFIG.address}

    </p>

    <div class="locationButtons">

        <button
            id="googleMapBtn"
            class="sheetBtn">

            Google Maps

        </button>

        <button
            id="wazeBtn"
            class="sheetBtn">

            Waze

        </button>

    </div>

</div>

`);

    setTimeout(()=>{

        document
         .getElementById("locationPreview")
.addEventListener("click",()=>{

             window.open(
        CONFIG.maps,
        "_blank"
    );

});

        document
            .getElementById("googleMapBtn")
            .addEventListener("click",()=>{

                window.open(
                    CONFIG.maps,
                    "_blank"
                );

            });

        document
            .getElementById("wazeBtn")
            .addEventListener("click",()=>{

                window.open(
                    CONFIG.waze,
                    "_blank"
                );

            });

    },100);

});

/* ==========================================================
   HUBUNGI
========================================================== */

contactBtn.addEventListener("click",()=>{

    setActiveButton(contactBtn);

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>☎ Hubungi</h2>

        <div class="contactCard">

            <div class="contactAvatar">

                👤

            </div>

            <div class="contactInfo">

<h3>${CONFIG.contacts[0].contactName}</h3>

<p>${CONFIG.contacts[0].contactRole}</p>

<h4>${CONFIG.contacts[0].phone}</h4>

            </div>

        </div>

        <div class="contactButtons">

            <button
                id="waBtn"
                class="sheetBtn">

                WhatsApp

            </button>

            <button
                id="callBtn"
                class="sheetBtn">

                Telefon

            </button>

        </div>

    `);

    setTimeout(()=>{

        document
        .getElementById("waBtn")
        .addEventListener("click",()=>{

            window.open(
    `https://wa.me/${CONFIG.contacts[0].phone.replace(/\D/g,"")}`,
    "_blank"
);

        });

        document
        .getElementById("callBtn")
        .addEventListener("click",()=>{

            window.location.href =
    `tel:${CONFIG.contacts[0].phone}`;

        });

    },100);

});

/* ==========================================================
   COLLECTION
========================================================== */

const rsvpRef = collection(db, "rsvps");

const momentRef = collection(db, "moments");

const wishRef = collection(db, "wishes");

/* ==========================================================
   HELPER
========================================================== */

let toastTimer;

function showToast(message, type = "success") {

    toast.textContent = message;

    toast.className = "";

    toast.classList.add(type);

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

/* ==========================================================
SCROLL TO PAGE
========================================================== */

function scrollToPage(id) {

    const page = document.getElementById(id);

    if (!page) return;

    page.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}

/* ==========================
   PAGE BUTTON
========================== */

document
    .getElementById("openRsvpSheet")
    ?.addEventListener(
        "click",
        openRsvpSheet
    );

document
    .getElementById("openMomentPicker")
    ?.addEventListener(
        "click",
        openMomentPicker
    );

document
    .getElementById("openWishSheet")
    ?.addEventListener(
        "click",
        openWishSheet
    );

/* ==========================================================
   HIGHLIGHT
========================================================== */

function highlightCard(element) {

    if (!element) return;

    element.style.transition = ".4s";

    element.style.boxShadow =
        "0 0 0 4px rgba(59,130,246,.35)";

    element.style.transform = "scale(1.02)";

    setTimeout(() => {

        element.style.boxShadow = "";

        element.style.transform = "";

    }, 1200);

}

/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDate(timestamp) {

    if (!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleString("ms-MY", {

        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}

/* ==========================================================
   FORMAT PHONE
========================================================== */

function formatPhone(phone) {

    return phone.replace(/\D/g, "");

}

/* ==========================================================
   BUTTON LOADING
========================================================== */

function setButtonLoading(button, loading) {

    if (!button) return;

    if (loading) {

        button.disabled = true;

        button.dataset.originalText = button.innerHTML;

        button.innerHTML = "Menghantar...";

    } else {

        button.disabled = false;

        button.innerHTML =

            button.dataset.originalText;

    }

}

/* ==========================================================
   CLOSE SHEET
========================================================== */

function closeCurrentSheet() {

    closeSheet();

}

/* ==========================================================
   OPEN RSVP SHEET
========================================================== */

rsvpBtn.addEventListener("click",()=>{

    setActiveButton(rsvpBtn);

    openRsvpSheet();

});

/* ==========================================================
   RSVP ENGINE
========================================================== */

function openRsvpSheet() {

    setActiveButton(rsvpBtn);

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>📝 RSVP</h2>

        <p>

            Sila lengkapkan maklumat
            kehadiran anda.

        </p>

        <input
            id="rsvpName"
            class="sheetInput"
            type="text"
            placeholder="Nama">

        <input
            id="rsvpPhone"
            class="sheetInput"
            type="tel"
            placeholder="No Telefon">

        <select
            id="rsvpAttendance"
            class="sheetSelect">

            <option value="">

                Kehadiran

            </option>

            <option value="Hadir">

                Hadir

            </option>

            <option value="Tidak Hadir">

                Tidak Hadir

            </option>

        </select>

        <input
            id="rsvpGuest"
            class="sheetInput"
            type="number"
            min="1"
            value="1"
            placeholder="Bilangan Tetamu">

        <button
            id="submitRsvp"
            class="sheetBtn">

            Hantar RSVP

        </button>

    `);

    setTimeout(bindRsvpEvents,100);

}

/* ==========================================================
   RSVP EVENT
========================================================== */

function bindRsvpEvents(){

    const button =

        document.getElementById("submitRsvp");

    button.addEventListener(

        "click",

        submitRsvp

    );

}

/* ==========================================================
   SUBMIT RSVP
========================================================== */

async function submitRsvp(){

    const button =

        document.getElementById("submitRsvp");

    const name =

        document
        .getElementById("rsvpName")
        .value
        .trim();

    const phone =

        formatPhone(

            document
            .getElementById("rsvpPhone")
            .value

        );

    const attendance =

        document
        .getElementById("rsvpAttendance")
        .value;

    const guest =

        Number(

            document
            .getElementById("rsvpGuest")
            .value

        );

/* ==========================
   VALIDATION
========================== */

if(

    !name ||

    !phone ||

    !attendance

){

    showToast(

        "Sila lengkapkan semua maklumat.",

        "error"

    );

    return;

}

if(

    attendance==="Hadir"

    &&

    guest<1

){

    showToast(

        "Bilangan tetamu tidak sah.",

        "error"

    );

    return;

}

try{

    setButtonLoading(

        button,

        true

    );

    const newDoc =

    await addDoc(

        rsvpRef,

        {

            name,

            phone,

            attendance,

            guest,

            createdAt:

            serverTimestamp()

        }

    );

    latestRsvpId =

    "rsvp-"+newDoc.id;

    closeCurrentSheet();

    showToast(

        "RSVP berjaya dihantar."

    );

    scrollToPage(

        "page7"

    );

}

catch(error){

    console.error(error);

    showToast(

        "RSVP gagal dihantar.",

        "error"

    );

}

finally{

    setButtonLoading(

        button,

        false

    );

}

}

/* ==========================================================
   RSVP REALTIME
========================================================== */

const rsvpQuery = query(

    rsvpRef,

    orderBy(

        "createdAt",

        "desc"

    )

);

let latestRsvpId = null;

onSnapshot(
    rsvpQuery,
    (snapshot)=>{

        renderRsvp(snapshot);

    }
);

/* ==========================================================
   RENDER RSVP
========================================================== */

function renderRsvp(snapshot){

    const list =

        document.getElementById("rsvpList");

    if(!list) return;

    list.innerHTML="";

    let attend=0;

    let absent=0;

    let guest=0;

    snapshot.forEach(docItem=>{

        const data =

            docItem.data();

        if(data.attendance==="Hadir"){

            attend++;

            guest +=

            Number(

                data.guest || 1

            );

        }else{

            absent++;

        }

        const card =

        document.createElement("div");

        card.style.contentVisibility = "auto";

        card.style.contain = "layout paint";

        card.className = "rsvpCard";

        card.id=

        "rsvp-"+docItem.id;

card.innerHTML = `

<div class="rsvpLeft">

    <div class="rsvpName">

        ${data.name}

    </div>

    <div class="${
        data.attendance==="Hadir"
        ? "badgeHadir"
        : "badgeTidakHadir"
    }">

        ${data.attendance}

    </div>

</div>

<div class="rsvpMiddle">

    👥 ${data.guest || 1} Tetamu

</div>

<div class="rsvpBottom">

    ${formatDate(data.createdAt)}

</div>

`;

        list.appendChild(card);

    });

    totalAttend.textContent=

        attend;

    totalAbsent.textContent=

        absent;

    totalGuest.textContent=

        guest;

    if(

        latestRsvpId

    ){

        const latest =

        document.getElementById(

            latestRsvpId

        );

        highlightCard(latest);

        latestRsvpId=null;

    }

}

/* ==========================================================
MOMENT ENGINE
========================================================== */

galleryBtn.addEventListener("click",()=>{

    setActiveButton(galleryBtn);

    openMomentPicker();

});

function openMomentPicker(){

    setActiveButton(galleryBtn);

    const input = document.getElementById("momentFile");

    input.value = "";

    input.click();

}

document
    .getElementById("momentFile")
    .addEventListener(
        "change",
        uploadMoments
    );

/* ==========================================================
   UPLOAD MOMENTS
========================================================== */

async function uploadMoments(event){

    const files =

        [...event.target.files];

    if(!files.length) return;

    try{

        showToast(

            "Sedang memuat naik..."

        );

        for(

            const file of files

        ){

            await uploadSingleMoment(

                file

            );

        }

        showToast(

            "Momen berjaya dikongsi."

        );

        scrollToPage(

            "page8"

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Upload gagal.",

            "error"

        );

    }

}

/* ==========================================================
   UPLOAD SINGLE MOMENT
========================================================== */

async function uploadSingleMoment(file){

    const formData = new FormData();

    formData.append("file",file);

    formData.append(

        "upload_preset",

        "bysann_gallery"

    );

    const response = await fetch(

        "https://api.cloudinary.com/v1_1/onarqwtu/image/upload",

        {

            method:"POST",

            body:formData

        }

    );

    const result = await response.json();

    const newDoc =

    await addDoc(

        momentRef,

        {

            imageUrl:

                result.secure_url,

            publicId:

                result.public_id,

            likes:0,

            createdAt:

                serverTimestamp()

        }

    );

    latestMomentId =

    "moment-" + newDoc.id;

}

/* ==========================================================
   MOMENT REALTIME
========================================================== */

const momentQuery = query(

    momentRef,

    orderBy(

        "createdAt",

        "desc"

    )

);

let latestMomentId = null;

onSnapshot(

    momentQuery,

    (snapshot)=>{

        renderMoments(snapshot);

    }

);

/* ==========================================================
   RENDER MOMENTS
========================================================== */

function renderMoments(snapshot){

    const gallery = document.getElementById("momentGallery");

    if(!gallery) return;

    gallery.innerHTML = "";
  
    momentImages = [];

    const docs = snapshot.docs;

    for(let i = 0; i < docs.length; i += 2){

        const column = document.createElement("div");

        column.className = "momentColumn";

        docs.slice(i, i + 2).forEach(docItem=>{

const data = docItem.data();

momentImages.push(data.imageUrl);

const card = document.createElement("div");

card.style.contentVisibility = "auto";

card.style.contain = "layout paint";

card.className = "momentCard";

            card.id = "moment-" + docItem.id;

            card.innerHTML = `

    <img
        src="${data.imageUrl}"
        loading="lazy"
        decoding="async"
        fetchpriority="low">

    <div class="momentFooter">

        <span class="momentLike">
            ❤️ ${data.likes || 0}
        </span>

        <span class="momentDate">
            📅 ${formatDate(data.createdAt)}
        </span>

    </div>

`;

            card.querySelector("img")
            .addEventListener("click",()=>{

                openLightbox(data.imageUrl);

            });

            card.querySelector(".momentLike")
            .addEventListener("click",()=>{

                likeMoment(docItem.id);

            });

            column.appendChild(card);

        });

        gallery.appendChild(column);

    }

    if(latestMomentId){

        const latest = document.getElementById(latestMomentId);

        highlightCard(latest);

        latestMomentId = null;

    }

}

/* ==========================================================
   LIKE MOMENT
========================================================== */

async function likeMoment(id){

    await updateDoc(

        doc(

            db,

            "moments",

            id

        ),

        {

            likes:

            increment(1)

        }

    );

}

/* ==========================================================
   LIGHTBOX ENGINE
========================================================== */

function openLightbox(imageUrl){

    currentMomentIndex = momentImages.indexOf(imageUrl);

    if(currentMomentIndex < 0){
        currentMomentIndex = 0;
    }

    lightboxImage.src = momentImages[currentMomentIndex];

    lightbox.classList.add("show");

}

function closeLightboxModal(){

    lightbox.classList.remove("show");

    lightboxImage.src = "";

}

function showCurrentMoment(){

    if(momentImages.length===0) return;

    lightboxImage.src = momentImages[currentMomentIndex];

}

function nextMoment(){

    if(momentImages.length===0) return;

    currentMomentIndex++;

    if(currentMomentIndex >= momentImages.length){

        currentMomentIndex = 0;

    }

    showCurrentMoment();

}

function prevMoment(){

    if(momentImages.length===0) return;

    currentMomentIndex--;

    if(currentMomentIndex < 0){

        currentMomentIndex = momentImages.length - 1;

    }

    showCurrentMoment();

}

closeLightbox.addEventListener(
    "click",
    closeLightboxModal
);

prevImage.addEventListener(
    "click",
    prevMoment
);

nextImage.addEventListener(
    "click",
    nextMoment
);

lightbox.addEventListener(
    "click",
    (event)=>{
        if(event.target===lightbox){
            closeLightboxModal();
        }
    }
);

/* ==========================================================
   LIGHTBOX KEYBOARD
========================================================== */

document.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="Escape"){

            closeLightboxModal();

        }

        if(event.key==="ArrowRight"){

            nextMoment();

        }

        if(event.key==="ArrowLeft"){

            prevMoment();

        }

    }

);

/* ==========================================================
   WISH ENGINE
========================================================== */

wishBtn.addEventListener("click",()=>{

    setActiveButton(wishBtn);

    openWishSheet();

});

function openWishSheet(){

    setActiveButton(

        wishBtn

    );

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>❤️ Ucapan</h2>

        <p>

            Tinggalkan ucapan buat
            pasangan pengantin.

        </p>

        <input

            id="wishName"

            class="sheetInput"

            type="text"

            placeholder="Nama">

        <textarea

            id="wishMessage"

            class="sheetTextarea"

            placeholder="Ucapan...">

        </textarea>

        <button

            id="submitWish"

            class="sheetBtn">

            Hantar Ucapan

        </button>

    `);

    setTimeout(

        bindWish,

        100

    );

}

/* ==========================================================
   BIND WISH
========================================================== */

function bindWish(){

    document

    .getElementById(

        "submitWish"

    )

    .addEventListener(

        "click",

        submitWish

    );

}

/* ==========================================================
   SUBMIT WISH
========================================================== */

async function submitWish(){

    const button =

        document.getElementById(

            "submitWish"

        );

    const name =

        document

        .getElementById(

            "wishName"

        )

        .value

        .trim();

    const message =

        document

        .getElementById(

            "wishMessage"

        )

        .value

        .trim();

    if(

        !name ||

        !message

    ){

        showToast(

            "Sila lengkapkan maklumat.",

            "error"

        );

        return;

    }

    try{

        setButtonLoading(

            button,

            true

        );

        const newDoc =

        await addDoc(

            wishRef,

            {

                name,

                message,

                likes:0,

                createdAt:

                serverTimestamp()

            }

        );

        latestWishId =

        "wish-"+newDoc.id;

        closeCurrentSheet();

        showToast(

            "Terima kasih atas ucapan anda."

        );

        scrollToPage(

            "page9"

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Ucapan gagal dihantar.",

            "error"

        );

    }

    finally{

        setButtonLoading(

            button,

            false

        );

    }

}

/* ==========================================================
   WISH REALTIME
========================================================== */

const wishQuery =

query(

    wishRef,

    orderBy(

        "createdAt",

        "desc"

    )

);

let latestWishId = null;

onSnapshot(
    wishQuery,
    snapshot=>{

        console.log("Wish:", snapshot.size);

        renderWish(snapshot);

    }
);

/* ==========================================================
   RENDER WISH
========================================================== */

function renderWish(snapshot){

    const list =

        document.getElementById(

            "wishList"

        );

    if(!list) return;

    list.innerHTML = "";

    snapshot.forEach(docItem=>{

        const data =

            docItem.data();

        const card =

        document.createElement("div");

        card.style.contentVisibility = "auto";

        card.style.contain = "layout paint";

        card.className =

            "wishCard";

        card.id =

            "wish-"+docItem.id;

        card.innerHTML = `

            <div class="wishHeader">

                <h3>

                    ${data.name}

                </h3>

<span class="wishDate">
    ${formatDate(data.createdAt)}
</span>

            </div>

            <p class="wishMessage">

                ${data.message}

            </p>

            <div class="wishBottom">

                <button

                    class="likeWish">

                    ❤️ ${data.likes}

                </button>

            </div>

        `;

        card

        .querySelector(

            ".likeWish"

        )

        .addEventListener(

            "click",

            ()=>{

                likeWish(

                    docItem.id

                );

            }

        );

        list.appendChild(

            card

        );

    });

    if(

        latestWishId

    ){

        highlightCard(

            document.getElementById(

                latestWishId

            )

        );

        latestWishId = null;

    }

}

/* ==========================================================
   LIKE WISH
========================================================== */

async function likeWish(id){

    await updateDoc(

        doc(

            db,

            "wishes",

            id

        ),

        {

            likes:

            increment(1)

        }

    );

}