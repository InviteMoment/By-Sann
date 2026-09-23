import {

  db,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,

  query,
  orderBy,
  onSnapshot,

  serverTimestamp,
  increment

} from "./firebase.js";


/* ==========================================================
   HELPER
========================================================== */

const $ = id =>
  document.getElementById(id);


/* ==========================================================
   ELEMENT
========================================================== */

const cover =
  $("cover");

const envelope =
  $("envelope");

const coverOpenBtn =
  $("coverOpenBtn");

const website =
  $("website");


const music =
  $("music");

const musicBtn =
  $("musicBtn");


const bottomNav =
  $("bottomNav");

const sheetOverlay =
  $("sheetOverlay");

const bottomSheet =
  $("bottomSheet");

const sheetContent =
  $("sheetContent");

const toast =
  $("toast");


const lightbox =
  $("lightbox");

const lightboxImage =
  $("lightboxImage");


const dateBtn =
  $("dateBtn");

const locationBtn =
  $("locationBtn");

const contactBtn =
  $("contactBtn");

const rsvpBtn =
  $("rsvpBtn");

const galleryBtn =
  $("galleryBtn");

const wishBtn =
  $("wishBtn");


const momentFile =
  $("momentFile");


/* ==========================================================
   FIREBASE COLLECTION
========================================================== */

const rsvpRef =
  collection(
    db,
    "rsvps"
  );

const momentRef =
  collection(
    db,
    "moments"
  );

const wishRef =
  collection(
    db,
    "wishes"
  );


/* ==========================================================
   GLOBAL
========================================================== */

let musicPlaying = false;

let targetDate = 0;

let countdownTimer = null;

let toastTimer = null;


let momentDocs = [];

let momentImages = [];

let currentMomentIndex = 0;


let latestRsvpId = null;

let latestMomentId = null;

let latestWishId = null;


/* ==========================================================
   CONFIG
========================================================== */

let CONFIG = {

  bride:
    "Nur Atikah",

  groom:
    "Mohammad Hafiezul",

  day:
    "Ahad",

  date:
    "08 November 2026",

  time:
    "11:00 AM",

  endTime:
    "2:00 PM",

  weddingDate:
    "2026-11-08",


  address:
    "Ayu Heritage Bungalow, Tambun, Perak",


  maps:
    "https://maps.app.goo.gl/GsPCpoPkVa11SCqz5?g_st=ac",

  waze:
    "https://waze.com/ul/hw0zfjx5wb",


  phone:
    "0125465720",

  contactName:
    "Yana",

  contactRole:
    "Wakil Pengantin",


  music:
    "music/song.m4a"

};


/* ==========================================================
   PAGE IMAGES
========================================================== */

const pageImages = {};

for(let i = 1; i <= 10; i++){

  pageImages[i] =
    $("page" + i + "Image");

}


/* ==========================================================
   SECURITY / HTML
========================================================== */

function escapeHtml(
  value = ""
){

  return String(value)
    .replace(
      /[&<>'"]/g,

      c => ({

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        "'":
          "&#39;",

        '"':
          "&quot;"

      }[c])

    );

}


/* ==========================================================
   DATE FORMAT
========================================================== */

function formatDateTime(
  value
){

  if(!value){

    return "Baru sahaja";

  }


  const d =
    typeof value.toDate === "function"

      ? value.toDate()

      : new Date(value);


  if(
    Number.isNaN(
      d.getTime()
    )
  ){

    return "Baru sahaja";

  }


  return d.toLocaleString(
    "ms-MY",
    {

      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit"

    }

  );

}


/* ==========================================================
   ACTIVE BUTTON
========================================================== */

function setActiveButton(
  button
){

  document
    .querySelectorAll(
      "#bottomNav button"
    )
    .forEach(
      b =>
        b.classList.remove(
          "active"
        )
    );


  if(button){

    button.classList.add(
      "active"
    );

  }

}


/* ==========================================================
   SCROLL
========================================================== */

function scrollToPage(
  id
){

  const page =
    $(id);

  if(!page) return;


  page.scrollIntoView({

    behavior:
      "smooth",

    block:
      "start"

  });

}


/* ==========================================================
   TOAST
========================================================== */

function showToast(
  message,
  type = "success"
){

  if(!toast) return;


  toast.textContent =
    message;


  toast.className =
    "show";


  if(type === "error"){

    toast.classList.add(
      "error"
    );

  }


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(

      () => {

        toast.className =
          "";

      },

      2800

    );

}


/* ==========================================================
   BOTTOM SHEET
========================================================== */

function closeSheet(){

  sheetOverlay
    .classList
    .remove("show");


  bottomSheet
    .classList
    .remove("show");


  document.body.style.overflow =
    "";


  bottomNav.style.display =
    "grid";

}


function openSheet(
  html
){

  sheetContent.innerHTML =
    html;


  sheetOverlay
    .classList
    .add("show");


  bottomSheet
    .classList
    .add("show");


  bottomNav.style.display =
    "none";


  document.body.style.overflow =
    "hidden";

}


sheetOverlay
  .addEventListener(
    "click",
    closeSheet
  );


/* ==========================================================
   MUSIC
========================================================== */

function syncMusicSource(){

  const desired =
    CONFIG.music ||
    "music/song.m4a";


  const current =
    music.getAttribute(
      "src"
    );


  if(
    current !== desired
  ){

    music.src =
      desired;

    music.load();

  }

}


function playMusic(){

  syncMusicSource();


  music.volume =
    1;


  const promise =
    music.play();


  if(
    promise?.then
  ){

    promise.then(

      () => {

        musicPlaying =
          true;


        musicBtn
          .classList
          .add(
            "playing"
          );

      }

    )

    .catch(

      error => {

        console.warn(
          "Music gagal dimainkan:",
          error
        );


        musicPlaying =
          false;


        musicBtn
          .classList
          .remove(
            "playing"
          );


        showToast(
          "Muzik tidak dapat dimainkan. Pastikan music/song.m4a ada dalam GitHub.",
          "error"
        );

      }

    );

  }

}


function pauseMusic(){

  music.pause();


  musicPlaying =
    false;


  musicBtn
    .classList
    .remove(
      "playing"
    );

}


music.addEventListener(
  "error",

  () => {

    showToast(
      "Fail muzik tidak ditemui: music/song.m4a",
      "error"
    );

  }

);


musicBtn.addEventListener(

  "click",

  () => {

    if(
      musicPlaying
    ){

      pauseMusic();

    }else{

      playMusic();

    }

  }

);


/* ==========================================================
   OPEN INVITATION
========================================================== */

function openInvitation(){

  envelope.style.pointerEvents =
    "none";


  /*
     PENTING:
     playMusic() dipanggil terus
     daripada tap pengguna.
     Ini lebih sesuai untuk iPhone/Safari.
  */

  playMusic();


  website.style.display =
    "block";

  website.style.opacity =
    "0";


  cover.style.transition =
    ".55s ease";


  setTimeout(

    () => {

      cover.style.opacity =
        "0";

    },

    40

  );


  setTimeout(

    () => {

      cover.style.display =
        "none";


      website.style.opacity =
        "1";


      bottomNav.style.display =
        "grid";


      musicBtn.style.display =
        "flex";


      revealSection();

    },

    550

  );

}


envelope
  .addEventListener(
    "click",
    openInvitation
  );


if(coverOpenBtn){

  coverOpenBtn
    .addEventListener(
      "click",
      openInvitation
    );

}


/* ==========================================================
   LOAD FIREBASE SETTINGS
========================================================== */

async function loadSettings(){

  try{

    const snap =
      await getDoc(

        doc(
          db,
          "settings",
          "config"
        )

      );


    if(
      snap.exists()
    ){

      const d =
        snap.data();


      CONFIG = {

        ...CONFIG,


        bride:
          d.brideName ??
          CONFIG.bride,


        groom:
          d.groomName ??
          CONFIG.groom,


        day:
          d.day ??
          CONFIG.day,


        date:
          d.displayDate ??
          CONFIG.date,


        time:
          d.weddingTime ??
          CONFIG.time,


        endTime:
          d.endTime ??
          CONFIG.endTime,


        weddingDate:
          d.weddingDate ??
          CONFIG.weddingDate,


        address:
          d.address ??
          CONFIG.address,


        maps:
          d.maps ??
          CONFIG.maps,


        waze:
          d.waze ??
          CONFIG.waze,


        phone:
          d.phone ??
          CONFIG.phone,


        music:
          d.music ??
          CONFIG.music

      };


      if(
        d.coverImage
      ){

        envelope.src =
          d.coverImage;

      }


      const pages =
        d.pageImages ||
        {};


      for(
        let i = 1;
        i <= 10;
        i++
      ){

        if(

          pages[
            `page${i}`
          ]

          &&

          pageImages[i]

        ){

          pageImages[i].src =
            pages[
              `page${i}`
            ];

        }

      }


      if(
        d.rsvpOpen === false
      ){

        rsvpBtn.style.display =
          "none";

      }


      if(
        d.momentOpen === false
      ){

        galleryBtn.style.display =
          "none";

      }


      if(
        d.wishOpen === false
      ){

        wishBtn.style.display =
          "none";

      }

    }


    const dt =
      new Date(

        `${CONFIG.weddingDate}T${
          normaliseTime(
            CONFIG.time
          )
        }`

      );


    if(
      !Number.isNaN(
        dt.getTime()
      )
    ){

      targetDate =
        dt.getTime();

    }


    syncMusicSource();


    updateCountdown();


  }

  catch(error){

    console.warn(
      "Firebase settings tidak dapat dimuat:",
      error
    );


    syncMusicSource();

  }

}


function normaliseTime(
  value
){

  const s =
    String(
      value ||
      "11:00 AM"
    ).trim();


  const m =
    s.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );


  if(!m){

    return "11:00";

  }


  let h =
    Number(
      m[1]
    );


  const min =
    m[2];


  const ap =
    (
      m[3] ||
      ""
    ).toUpperCase();


  if(
    ap === "PM" &&
    h < 12
  ){

    h += 12;

  }


  if(
    ap === "AM" &&
    h === 12
  ){

    h = 0;

  }


  return `${String(h).padStart(2,"0")}:${min}`;

}


loadSettings();


/* ==========================================================
   SCROLL REVEAL
========================================================== */

const fadeSections =
  document.querySelectorAll(
    ".fade-section"
  );


function revealSection(){

  const trigger =
    window.innerHeight *
    .9;


  fadeSections.forEach(

    section => {

      if(
        section
          .getBoundingClientRect()
          .top < trigger
      ){

        section
          .classList
          .add(
            "show"
          );

      }

    }

  );

}


window.addEventListener(

  "scroll",

  () => {

    requestAnimationFrame(
      revealSection
    );

  },

  {
    passive:true
  }

);


/* ==========================================================
   COUNTDOWN
========================================================== */

function updateCountdown(){

  if(!targetDate)
    return;


  let distance =
    targetDate -
    Date.now();


  if(
    distance < 0
  ){

    distance = 0;

  }


  $("days").textContent =
    String(

      Math.floor(
        distance /
        86400000
      )

    ).padStart(
      2,
      "0"
    );


  $("hours").textContent =
    String(

      Math.floor(

        (
          distance %
          86400000
        ) /
        3600000

      )

    ).padStart(
      2,
      "0"
    );


  $("minutes").textContent =
    String(

      Math.floor(

        (
          distance %
          3600000
        ) /
        60000

      )

    ).padStart(
      2,
      "0"
    );


  $("seconds").textContent =
    String(

      Math.floor(

        (
          distance %
          60000
        ) /
        1000

      )

    ).padStart(
      2,
      "0"
    );

}


countdownTimer =
  setInterval(
    updateCountdown,
    1000
  );


/* ==========================================================
   TARIKH
========================================================== */

dateBtn.addEventListener(

  "click",

  () => {

    setActiveButton(
      dateBtn
    );


    openSheet(`

      <div class="sheetHandle"></div>

      <h2 class="sheetTitle">
        📅 Tarikh Majlis
      </h2>

      <div class="sheetCard">

        <h3>
          Walimatul Urus
        </h3>

        <p>

          ${escapeHtml(
            CONFIG.day
          )}

          <br><br>

          ${escapeHtml(
            CONFIG.date
          )}

          <br><br>

          ${escapeHtml(
            CONFIG.time
          )}

          hingga

          ${escapeHtml(
            CONFIG.endTime
          )}

        </p>

      </div>

    `);

  }

);


/* ==========================================================
   LOKASI
========================================================== */

locationBtn.addEventListener(

  "click",

  () => {

    setActiveButton(
      locationBtn
    );


    openSheet(`

      <div class="sheetHandle"></div>

      <h2 class="sheetTitle">
        📍 Lokasi Majlis
      </h2>

      <div class="locationPreview">

        <img
          src="images/maps.jpg"
          alt="Lokasi Majlis">

      </div>

      <div class="sheetCard">

        <h3>
          Dewan Majlis
        </h3>

        <p>
          ${escapeHtml(
            CONFIG.address
          )}
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


    $("googleMapBtn")
      .addEventListener(

        "click",

        () => {

          closeSheet();

          window.open(
            CONFIG.maps,
            "_blank",
            "noopener,noreferrer"
          );

        }

      );


    $("wazeBtn")
      .addEventListener(

        "click",

        () => {

          closeSheet();

          window.open(
            CONFIG.waze,
            "_blank",
            "noopener,noreferrer"
          );

        }

      );

  }

);


/* ==========================================================
   HUBUNGI
========================================================== */

contactBtn.addEventListener(

  "click",

  () => {

    setActiveButton(
      contactBtn
    );


    openSheet(`

      <div class="sheetHandle"></div>

      <h2 class="sheetTitle">
        ☎ Hubungi
      </h2>

      <div class="contactCard">

        <div class="contactAvatar">
          👤
        </div>

        <div class="contactInfo">

          <h3>
            ${escapeHtml(
              CONFIG.contactName
            )}
          </h3>

          <p>
            ${escapeHtml(
              CONFIG.contactRole
            )}
          </p>

          <h4>
            ${escapeHtml(
              CONFIG.phone
            )}
          </h4>

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


    $("waBtn")
      .addEventListener(

        "click",

        () => {

          closeSheet();


          window.open(

            `https://wa.me/${
              String(
                CONFIG.phone
              ).replace(
                /\D/g,
                ""
              )
            }`,

            "_blank",

            "noopener,noreferrer"

          );

        }

      );


    $("callBtn")
      .addEventListener(

        "click",

        () => {

          closeSheet();

          window.location.href =
            `tel:${CONFIG.phone}`;

        }

      );

  }

);


/* ==========================================================
   RSVP
========================================================== */

rsvpBtn.addEventListener(
  "click",
  openRsvpSheet
);


function openRsvpSheet(){

  setActiveButton(
    rsvpBtn
  );


  openSheet(`

    <div class="sheetHandle"></div>

    <h2 class="sheetTitle">
      📝 RSVP
    </h2>

    <p class="sheetDesc">
      Sila lengkapkan maklumat
      kehadiran anda.
    </p>


    <input
      id="rsvpName"
      class="sheetInput"
      type="text"
      placeholder="Nama"
      autocomplete="name">


    <input
      id="rsvpPhone"
      class="sheetInput"
      type="tel"
      placeholder="No Telefon"
      autocomplete="tel">


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


  $("submitRsvp")
    .addEventListener(
      "click",
      submitRsvp
    );

}


async function submitRsvp(){

  const button =
    $("submitRsvp");


  const name =
    $("rsvpName")
      .value
      .trim();


  const phone =
    String(
      $("rsvpPhone")
        .value
    ).replace(
      /\D/g,
      ""
    );


  const attendance =
    $("rsvpAttendance")
      .value;


  const guest =
    Math.max(

      1,

      Number(
        $("rsvpGuest")
          .value ||
        1
      )

    );


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


  button.disabled =
    true;


  button.textContent =
    "Menghantar...";


  try{

    const ref =
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
      "rsvp-" +
      ref.id;


    closeSheet();


    showToast(
      "RSVP berjaya dihantar."
    );


    scrollToPage(
      "page7"
    );


  }

  catch(error){

    console.error(
      error
    );


    showToast(
      "RSVP gagal dihantar.",
      "error"
    );


    button.disabled =
      false;


    button.textContent =
      "Hantar RSVP";

  }

}


/* ==========================================================
   RSVP REALTIME
========================================================== */

onSnapshot(

  query(
    rsvpRef,
    orderBy(
      "createdAt",
      "desc"
    )
  ),

  snapshot => {

    renderRsvp(
      snapshot
    );

  },

  error => {

    console.warn(
      "RSVP listener:",
      error
    );

  }

);


function renderRsvp(
  snapshot
){

  const list =
    $("rsvpList");


  if(!list)
    return;


  list.innerHTML =
    "";


  snapshot.forEach(

    item => {

      const d =
        item.data();


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "rsvpCard";


      card.id =
        "rsvp-" +
        item.id;


      card.innerHTML = `

        <div>

          <div class="rsvpName">

            ${escapeHtml(
              d.name
            )}

          </div>

          <div class="${
            d.attendance === "Hadir"
              ? "badgeHadir"
              : "badgeTidakHadir"
          }">

            ${escapeHtml(
              d.attendance ||
              ""
            )}

          </div>

        </div>


        <div class="rsvpMiddle">

          👥 ${
            Number(
              d.guest ||
              1
            )
          } Tetamu

        </div>


        <div class="rsvpBottom">

          ${
            formatDateTime(
              d.createdAt
            )
          }

        </div>

      `;


      list.appendChild(
        card
      );

    }

  );


  if(latestRsvpId){

    const el =
      $(latestRsvpId);


    if(el){

      el.scrollIntoView({

        behavior:
          "smooth",

        block:
          "center"

      });


      el.animate(

        [

          {
            transform:
              "scale(.96)"
          },

          {
            transform:
              "scale(1.02)"
          },

          {
            transform:
              "scale(1)"
          }

        ],

        {

          duration:
            700

        }

      );

    }


    latestRsvpId =
      null;

  }

}


/* ==========================================================
   GALLERY
========================================================== */

galleryBtn.addEventListener(

  "click",

  openGallerySheet

);


function openGallerySheet(){

  setActiveButton(
    galleryBtn
  );


  openSheet(`

    <div class="sheetHandle"></div>

    <h2 class="sheetTitle">
      📷 Momen Kita
    </h2>

    <p class="sheetDesc">

      Lihat momen tetamu
      dan kongsikan gambar anda.

    </p>


    <input
      id="uploaderName"
      class="sheetInput"
      type="text"
      placeholder="Nama anda"
      autocomplete="name">


    <button
      id="chooseMoment"
      class="sheetBtn">

      Pilih Gambar & Muat Naik

    </button>


    <button
      id="viewGallery"
      class="sheetBtn secondary">

      Lihat Galeri

    </button>


    <p class="uploadNote">

      Nama, tarikh & masa akan
      dipaparkan pada gambar
      yang dimuat naik.

    </p>

  `);


  $("chooseMoment")
    .addEventListener(

      "click",

      () => {

        const name =
          $("uploaderName")
            .value
            .trim();


        if(!name){

          showToast(
            "Masukkan nama dahulu.",
            "error"
          );

          return;

        }


        sessionStorage.setItem(
          "momentUploader",
          name
        );


        closeSheet();


        momentFile.value =
          "";


        momentFile.click();

      }

    );


  $("viewGallery")
    .addEventListener(

      "click",

      () => {

        closeSheet();

        scrollToPage(
          "page8"
        );

      }

    );

}


momentFile.addEventListener(
  "change",
  uploadMoments
);


async function uploadMoments(
  event
){

  const files =
    [
      ...event.target.files
    ];


  if(
    !files.length
  )
    return;


  const uploader =
    sessionStorage.getItem(
      "momentUploader"
    ) ||
    "Tetamu";


  showToast(
    "Sedang memuat naik..."
  );


  try{

    for(
      const file of files
    ){

      await uploadSingleMoment(
        file,
        uploader
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

    console.error(
      error
    );


    showToast(
      "Upload gagal. Semak Cloudinary upload preset.",
      "error"
    );

  }

}


async function uploadSingleMoment(
  file,
  uploader
){

  if(
    !file.type.startsWith(
      "image/"
    )
  ){

    throw new Error(
      "Bukan gambar"
    );

  }


  const form =
    new FormData();


  form.append(
    "file",
    file
  );


  form.append(
    "upload_preset",
    "bysann_gallery"
  );


  const response =
    await fetch(

      "https://api.cloudinary.com/v1_1/onarqwtu/image/upload",

      {

        method:
          "POST",

        body:
          form

      }

    );


  const result =
    await response.json();


  if(
    !response.ok ||
    !result.secure_url
  ){

    throw new Error(
      result.error?.message ||
      "Cloudinary upload gagal"
    );

  }


  const ref =
    await addDoc(

      momentRef,

      {

        imageUrl:
          result.secure_url,

        publicId:
          result.public_id ||
          "",

        uploader,

        likes:
          0,

        createdAt:
          serverTimestamp()

      }

    );


  latestMomentId =
    "moment-" +
    ref.id;

}


/* ==========================================================
   MOMENT REALTIME
========================================================== */

onSnapshot(

  query(
    momentRef,
    orderBy(
      "createdAt",
      "desc"
    )
  ),

  snapshot => {

    momentDocs =
      snapshot.docs;


    renderMoments(
      snapshot
    );

  },

  error => {

    console.warn(
      "Moment listener:",
      error
    );

  }

);


/* ==========================================================
   RENDER MOMENTS
========================================================== */

function renderMoments(
  snapshot
){

  const gallery =
    $("momentGallery");


  if(!gallery)
    return;


  gallery.innerHTML =
    "";


  momentImages =
    [];


  snapshot.forEach(

    item => {

      const d =
        item.data();


      if(
        !d.imageUrl
      )
        return;


      const index =
        momentImages.length;


      momentImages.push(
        d.imageUrl
      );


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "momentCard";


      card.id =
        "moment-" +
        item.id;


      card.innerHTML = `

        <img
          src="${escapeHtml(
            d.imageUrl
          )}"
          alt="Momen oleh ${
            escapeHtml(
              d.uploader ||
              "Tetamu"
            )
          }"
          loading="lazy"
          decoding="async">


        <div class="momentInfo">

          <div class="momentMeta">

            <span>

              👤 ${
                escapeHtml(
                  d.uploader ||
                  "Tetamu"
                )
              }

            </span>


            <span>

              🕒 ${
                formatDateTime(
                  d.createdAt
                )
              }

            </span>

          </div>


          <div class="momentActions">

            <button
              class="momentAction like"
              type="button">

              ❤️ ${
                Number(
                  d.likes ||
                  0
                )
              }

            </button>


            <button
              class="momentAction download"
              type="button">

              ⬇️ Simpan

            </button>

          </div>

        </div>

      `;


      card
        .querySelector(
          "img"
        )
        .addEventListener(

          "click",

          () =>
            openLightbox(
              index
            )

        );


      card
        .querySelector(
          ".like"
        )
        .addEventListener(

          "click",

          () =>
            likeMoment(
              item.id
            )

        );


      card
        .querySelector(
          ".download"
        )
        .addEventListener(

          "click",

          () =>
            downloadMoment(
              d.imageUrl,
              d.publicId ||
              "moment"
            )

        );


      gallery.appendChild(
        card
      );

    }

  );


  if(
    latestMomentId
  ){

    const el =
      $(latestMomentId);


    if(el){

      el.scrollIntoView({

        behavior:
          "smooth",

        block:
          "center"

      });


      el.animate(

        [

          {
            transform:
              "scale(.96)"
          },

          {
            transform:
              "scale(1.02)"
          },

          {
            transform:
              "scale(1)"
          }

        ],

        {

          duration:
            700

        }

      );

    }


    latestMomentId =
      null;

  }

}


/* ==========================================================
   LIKE MOMENT
========================================================== */

async function likeMoment(
  id
){

  try{

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

  catch(error){

    console.error(
      error
    );


    showToast(
      "Like gagal.",
      "error"
    );

  }

}


/* ==========================================================
   DOWNLOAD MOMENT
========================================================== */

async function downloadMoment(
  url,
  publicId
){

  try{

    const response =
      await fetch(

        url,

        {
          mode:
            "cors"
        }

      );


    if(
      !response.ok
    ){

      throw new Error(
        "download"
      );

    }


    const blob =
      await response.blob();


    const objectUrl =
      URL.createObjectURL(
        blob
      );


    const a =
      document.createElement(
        "a"
      );


    a.href =
      objectUrl;


    a.download =
      (
        publicId ||
        "momen"
      )
      .split("/")
      .pop() +
      ".jpg";


    document.body.appendChild(
      a
    );


    a.click();


    a.remove();


    setTimeout(

      () => {

        URL.revokeObjectURL(
          objectUrl
        );

      },

      1000

    );

  }

  catch(error){

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );


    showToast(
      "Gambar dibuka. Tekan Simpan pada pelayar untuk muat turun."
    );

  }

}


/* ==========================================================
   LIGHTBOX
========================================================== */

function openLightbox(
  index
){

  if(
    !momentImages.length
  )
    return;


  currentMomentIndex =
    index;


  lightboxImage.src =
    momentImages[index];


  lightbox.classList.add(
    "show"
  );


  lightbox.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeLightbox(){

  lightbox.classList.remove(
    "show"
  );


  lightbox.setAttribute(
    "aria-hidden",
    "true"
  );


  lightboxImage.src =
    "";

}


function nextMoment(){

  if(
    !momentImages.length
  )
    return;


  currentMomentIndex =
    (
      currentMomentIndex +
      1
    )
    %
    momentImages.length;


  lightboxImage.src =
    momentImages[
      currentMomentIndex
    ];

}


function prevMoment(){

  if(
    !momentImages.length
  )
    return;


  currentMomentIndex =
    (
      currentMomentIndex -
      1 +
      momentImages.length
    )
    %
    momentImages.length;


  lightboxImage.src =
    momentImages[
      currentMomentIndex
    ];

}


$("closeLightbox")
  .addEventListener(
    "click",
    closeLightbox
  );


$("prevImage")
  .addEventListener(
    "click",
    prevMoment
  );


$("nextImage")
  .addEventListener(
    "click",
    nextMoment
  );


lightbox.addEventListener(

  "click",

  event => {

    if(
      event.target ===
      lightbox
    ){

      closeLightbox();

    }

  }

);


document.addEventListener(

  "keydown",

  event => {

    if(
      event.key ===
      "Escape"
    ){

      closeLightbox();

    }


    if(
      event.key ===
      "ArrowRight"
    ){

      nextMoment();

    }


    if(
      event.key ===
      "ArrowLeft"
    ){

      prevMoment();

    }

  }

);


/* ==========================================================
   UCAPAN
========================================================== */

wishBtn.addEventListener(
  "click",
  openWishSheet
);


function openWishSheet(){

  setActiveButton(
    wishBtn
  );


  openSheet(`

    <div class="sheetHandle"></div>

    <h2 class="sheetTitle">
      ❤️ Ucapan
    </h2>

    <p class="sheetDesc">

      Tinggalkan ucapan buat
      pasangan pengantin.

    </p>


    <input
      id="wishName"
      class="sheetInput"
      type="text"
      placeholder="Nama"
      autocomplete="name">


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


  $("submitWish")
    .addEventListener(
      "click",
      submitWish
    );

}


async function submitWish(){

  const button =
    $("submitWish");


  const name =
    $("wishName")
      .value
      .trim();


  const message =
    $("wishMessage")
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


  button.disabled =
    true;


  button.textContent =
    "Menghantar...";


  try{

    const ref =
      await addDoc(

        wishRef,

        {

          name,

          message,

          likes:
            0,

          createdAt:
            serverTimestamp()

        }

      );


    latestWishId =
      "wish-" +
      ref.id;


    closeSheet();


    showToast(
      "Terima kasih atas ucapan anda."
    );


    scrollToPage(
      "page9"
    );

  }

  catch(error){

    console.error(
      error
    );


    showToast(
      "Ucapan gagal dihantar.",
      "error"
    );


    button.disabled =
      false;


    button.textContent =
      "Hantar Ucapan";

  }

}


/* ==========================================================
   WISH REALTIME
========================================================== */

onSnapshot(

  query(
    wishRef,
    orderBy(
      "createdAt",
      "desc"
    )
  ),

  snapshot => {

    renderWish(
      snapshot
    );

  },

  error => {

    console.warn(
      "Wish listener:",
      error
    );

  }

);


function renderWish(
  snapshot
){

  const list =
    $("wishList");


  if(!list)
    return;


  list.innerHTML =
    "";


  snapshot.forEach(

    item => {

      const d =
        item.data();


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "wishCard";


      card.id =
        "wish-" +
        item.id;


      card.innerHTML = `

        <div class="wishHeader">

          <h3>

            ${escapeHtml(
              d.name
            )}

          </h3>


          <span class="wishDate">

            ${
              formatDateTime(
                d.createdAt
              )
            }

          </span>

        </div>


        <p class="wishMessage">

          ${escapeHtml(
            d.message
          )}

        </p>


        <div class="wishBottom">

          <button
            class="likeWish"
            type="button">

            ❤️ ${
              Number(
                d.likes ||
                0
              )
            }

          </button>

        </div>

      `;


      card
        .querySelector(
          ".likeWish"
        )
        .addEventListener(

          "click",

          () =>
            likeWish(
              item.id
            )

        );


      list.appendChild(
        card
      );

    }

  );


  if(
    latestWishId
  ){

    const el =
      $(latestWishId);


    if(el){

      el.scrollIntoView({

        behavior:
          "smooth",

        block:
          "center"

      });


      el.animate(

        [

          {
            transform:
              "scale(.96)"
          },

          {
            transform:
              "scale(1.02)"
          },

          {
            transform:
              "scale(1)"
          }

        ],

        {

          duration:
            700

        }

      );

    }


    latestWishId =
      null;

  }

}


/* ==========================================================
   LIKE WISH
========================================================== */

async function likeWish(
  id
){

  try{

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

  catch(error){

    console.error(
      error
    );


    showToast(
      "Like gagal.",
      "error"
    );

  }

}


/* ==========================================================
   DOUBLE TAP ZOOM
========================================================== */

let lastTouchEnd =
  0;


document.addEventListener(

  "touchend",

  event => {

    const now =
      Date.now();


    if(
      now -
      lastTouchEnd <=
      300
    ){

      event.preventDefault();

    }


    lastTouchEnd =
      now;

  },

  {
    passive:false
  }

);


/* ==========================================================
   SHEET SWIPE DOWN
========================================================== */

let sheetStartY =
  0;


bottomSheet.addEventListener(

  "touchstart",

  event => {

    sheetStartY =
      event.touches[0].clientY;

  },

  {
    passive:true
  }

);


bottomSheet.addEventListener(

  "touchend",

  event => {

    const move =
      event.changedTouches[0].clientY -
      sheetStartY;


    if(
      move > 100
    ){

      closeSheet();

    }

  },

  {
    passive:true
  }

);


/* ==========================================================
   CLEANUP
========================================================== */

window.addEventListener(

  "beforeunload",

  () => {

    clearInterval(
      countdownTimer
    );

  }

);