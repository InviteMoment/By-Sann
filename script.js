/* =====================================================
   BY-SANN V4
   SCRIPT
===================================================== */

// @ts-nocheck

import {
    db,
    collection,
    addDoc,
    setDoc,
    updateDoc,
    doc,
    getDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    increment
} from "./firebase.js";


/* =====================================================
   ELEMENT
===================================================== */

const $ = id =>
    document.getElementById(id);


const cover =
    $("cover");

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


const toast =
    $("toast");


const momentFile =
    $("momentFile");


const lightbox =
    $("lightbox");

const lightboxImage =
    $("lightboxImage");

const closeLightbox =
    $("closeLightbox");

const prevImage =
    $("prevImage");

const nextImage =
    $("nextImage");


/* =====================================================
   FIREBASE COLLECTIONS
===================================================== */

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


/* =====================================================
   CONFIG
===================================================== */

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


/* =====================================================
   GLOBAL
===================================================== */

let musicPlaying =
    false;

let targetDate =
    0;

let countdownTimer =
    null;

let toastTimer =
    null;

let latestRsvpId =
    null;

let latestMomentId =
    null;

let latestWishId =
    null;

let momentImages =
    [];

let currentMomentIndex =
    0;


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
    value = ""
) {

    return String(
        value
    ).replace(
        /[&<>'"]/g,

        char => ({

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

        }[char])

    );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
) {

    toast.textContent =
        message;

    toast.className =
        "show";


    if (
        type ===
        "error"
    ) {

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


/* =====================================================
   ACTIVE NAV BUTTON
===================================================== */

function setActiveButton(
    activeButton
) {

    document
        .querySelectorAll(
            "#bottomNav button"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    if (
        activeButton
    ) {

        activeButton.classList.add(
            "active"
        );

    }

}


/* =====================================================
   SCROLL
===================================================== */

function scrollToPage(
    id
) {

    const page =
        $(id);

    if (!page)
        return;


    page.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


/* =====================================================
   FIREBASE SETTINGS
===================================================== */

async function loadSettings() {

    try {

        const snap =
            await getDoc(
                doc(
                    db,
                    "settings",
                    "config"
                )
            );


        if (
            !snap.exists()
        ) {

            prepareCountdown();

            return;

        }


        const data =
            snap.data();


        CONFIG = {

            ...CONFIG,

            bride:
                data.brideName ??
                CONFIG.bride,

            groom:
                data.groomName ??
                CONFIG.groom,

            day:
                data.day ??
                CONFIG.day,

            date:
                data.displayDate ??
                CONFIG.date,

            time:
                data.weddingTime ??
                CONFIG.time,

            endTime:
                data.endTime ??
                CONFIG.endTime,

            weddingDate:
                data.weddingDate ??
                CONFIG.weddingDate,

            address:
                data.address ??
                CONFIG.address,

            maps:
                data.maps ??
                CONFIG.maps,

            waze:
                data.waze ??
                CONFIG.waze,

            phone:
                data.phone ??
                CONFIG.phone,

            music:
                data.music ||
                CONFIG.music

        };


        /* COVER */

        if (
            data.coverImage
        ) {

            $("envelope").src =
                data.coverImage;

        }


        /* PAGE IMAGES */

        const pages =
            data.pageImages ||
            {};


        for (
            let i = 1;
            i <= 10;
            i++
        ) {

            const image =
                $(
                    `page${i}Image`
                );


            if (
                image &&
                pages[
                    `page${i}`
                ]
            ) {

                image.src =
                    pages[
                        `page${i}`
                    ];

            }

        }


        /* OPEN / HIDE FEATURES */

        if (
            data.rsvpOpen === false
        ) {

            rsvpBtn.style.display =
                "none";

        }


        if (
            data.momentOpen === false
        ) {

            galleryBtn.style.display =
                "none";

        }


        if (
            data.wishOpen === false
        ) {

            wishBtn.style.display =
                "none";

        }


        prepareCountdown();

    }

    catch (error) {

        console.warn(
            "Firebase settings:",
            error
        );

        prepareCountdown();

    }

}


/* =====================================================
   TIME PARSER
===================================================== */

function parseTime(
    value
) {

    const match =
        String(
            value ||
            "11:00 AM"
        )
        .trim()
        .match(
            /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
        );


    if (!match) {

        return "11:00:00";

    }


    let hour =
        Number(
            match[1]
        );


    const minute =
        match[2];


    const period =
        (
            match[3] ||
            ""
        ).toUpperCase();


    if (
        period === "PM" &&
        hour < 12
    ) {

        hour += 12;

    }


    if (
        period === "AM" &&
        hour === 12
    ) {

        hour = 0;

    }


    return `${
        String(hour)
            .padStart(2, "0")
    }:${minute}:00`;

}


/* =====================================================
   COUNTDOWN
===================================================== */

function prepareCountdown() {

    const time =
        parseTime(
            CONFIG.time
        );


    const date =
        new Date(
            `${CONFIG.weddingDate}T${time}`
        );


    if (
        !Number.isNaN(
            date.getTime()
        )
    ) {

        targetDate =
            date.getTime();

    }


    updateCountdown();


    clearInterval(
        countdownTimer
    );


    countdownTimer =
        setInterval(
            updateCountdown,
            1000
        );

}


function updateCountdown() {

    if (!targetDate)
        return;


    let distance =
        targetDate -
        Date.now();


    if (
        distance < 0
    ) {

        distance = 0;

    }


    const days =
        Math.floor(
            distance /
            86400000
        );


    const hours =
        Math.floor(
            (
                distance %
                86400000
            ) /
            3600000
        );


    const minutes =
        Math.floor(
            (
                distance %
                3600000
            ) /
            60000
        );


    const seconds =
        Math.floor(
            (
                distance %
                60000
            ) /
            1000
        );


    $("days").textContent =
        String(days)
            .padStart(2, "0");


    $("hours").textContent =
        String(hours)
            .padStart(2, "0");


    $("minutes").textContent =
        String(minutes)
            .padStart(2, "0");


    $("seconds").textContent =
        String(seconds)
            .padStart(2, "0");

}


/* =====================================================
   MUSIC
===================================================== */

function setMusicSource() {

    const source =
        new URL(
            CONFIG.music ||
            "music/song.m4a",

            document.baseURI
        ).href;


    if (
        music.src !==
        source
    ) {

        music.src =
            source;

        music.load();

    }

}


async function playMusic() {

    setMusicSource();


    try {

        await music.play();


        musicPlaying =
            true;


        musicBtn.classList.add(
            "playing"
        );

    }

    catch (error) {

        console.warn(
            "Music:",
            error
        );


        musicPlaying =
            false;


        musicBtn.classList.remove(
            "playing"
        );


        showToast(
            "Tekan ikon 🎵 untuk memainkan muzik.",
            "error"
        );

    }

}


function pauseMusic() {

    music.pause();

    musicPlaying =
        false;

    musicBtn.classList.remove(
        "playing"
    );

}


musicBtn.addEventListener(
    "click",
    () => {

        if (
            musicPlaying
        ) {

            pauseMusic();

        }

        else {

            playMusic();

        }

    }
);


/* =====================================================
   OPEN INVITATION
===================================================== */

function openInvitation() {

    /*
       playMusic dipanggil
       dalam click event supaya
       browser benarkan autoplay.
    */

    playMusic();


    website.style.display =
        "block";


    bottomNav.style.display =
        "grid";


    musicBtn.style.display =
        "flex";


    requestAnimationFrame(
        () => {

            cover.classList.add(
                "hidden"
            );

        }
    );


    setTimeout(
        () => {

            cover.style.display =
                "none";

            revealSections();

        },

        600
    );

}


coverOpenBtn.addEventListener(
    "click",
    openInvitation
);


/* =====================================================
   BOTTOM SHEET
===================================================== */

function openSheet(
    html
) {

    sheetContent.innerHTML =
        html;


    sheetOverlay.classList.add(
        "show"
    );


    bottomSheet.classList.add(
        "show"
    );


    bottomNav.style.display =
        "none";


    musicBtn.style.display =
        "none";


    document.body.style.overflow =
        "hidden";

}


function closeSheet() {

    sheetOverlay.classList.remove(
        "show"
    );


    bottomSheet.classList.remove(
        "show"
    );


    bottomNav.style.display =
        "grid";


    musicBtn.style.display =
        "flex";


    document.body.style.overflow =
        "";

}


sheetOverlay.addEventListener(
    "click",
    closeSheet
);


/* =====================================================
   TARIKH
===================================================== */

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

                    <br>

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


/* =====================================================
   LOKASI
===================================================== */

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

            <div class="sheetCard">

                <h3>
                    Lokasi
                </h3>

                <p>

                    ${escapeHtml(
                        CONFIG.address
                    )}

                </p>

                <div class="locationButtons">

                    <button
                        id="googleMapBtn"
                        class="sheetBtn"
                        type="button">

                        Google Maps

                    </button>

                    <button
                        id="wazeBtn"
                        class="sheetBtn"
                        type="button">

                        Waze

                    </button>

                </div>

            </div>

        `);


        $("googleMapBtn")
            .addEventListener(
                "click",
                () => {

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

                    window.open(
                        CONFIG.waze,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }
            );

    }
);


/* =====================================================
   HUBUNGI
===================================================== */

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
                    class="sheetBtn"
                    type="button">

                    WhatsApp

                </button>

                <button
                    id="callBtn"
                    class="sheetBtn"
                    type="button">

                    Telefon

                </button>

            </div>

        `);


        $("waBtn")
            .addEventListener(
                "click",
                () => {

                    const number =
                        String(
                            CONFIG.phone
                        ).replace(
                            /\D/g,
                            ""
                        );


                    window.open(
                        `https://wa.me/6${
                            number.replace(
                                /^6/,
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

                    window.location.href =
                        `tel:${CONFIG.phone}`;

                }
            );

    }
);


/* =====================================================
   RSVP
===================================================== */

rsvpBtn.addEventListener(
    "click",
    openRsvp
);


function openRsvp() {

    setActiveButton(
        rsvpBtn
    );


    openSheet(`

        <div class="sheetHandle"></div>

        <h2 class="sheetTitle">
            📝 RSVP
        </h2>

        <p class="sheetDesc">

            Sila lengkapkan
            maklumat kehadiran anda.

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
            class="sheetBtn"
            type="button">

            Hantar RSVP

        </button>

    `);


    $("submitRsvp")
        .addEventListener(
            "click",
            submitRsvp
        );

}


async function submitRsvp() {

    const button =
        $("submitRsvp");


    const name =
        $("rsvpName")
            .value
            .trim();


    const phone =
        $("rsvpPhone")
            .value
            .trim();


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


    if (
        !name ||
        !phone ||
        !attendance
    ) {

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


    try {

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
            `rsvp-${ref.id}`;


        closeSheet();


        showToast(
            "RSVP berjaya dihantar."
        );


        scrollToPage(
            "page7"
        );

    }

    catch (error) {

        console.error(
            error
        );


        button.disabled =
            false;


        button.textContent =
            "Hantar RSVP";


        showToast(
            "RSVP gagal dihantar.",
            "error"
        );

    }

}


/* =====================================================
   RSVP LIVE
===================================================== */

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
            "RSVP:",
            error
        );

    }

);


function renderRsvp(
    snapshot
) {

    const list =
        $("rsvpList");


    if (!list)
        return;


    list.innerHTML =
        "";


    snapshot.forEach(
        item => {

            const data =
                item.data();


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "rsvpCard";


            card.id =
                `rsvp-${item.id}`;


            card.innerHTML = `

                <div>

                    <div class="rsvpName">

                        ${escapeHtml(
                            data.name ||
                            ""
                        )}

                    </div>

                    <div class="${
                        data.attendance ===
                        "Hadir"

                            ? "badgeHadir"

                            : "badgeTidakHadir"
                    }">

                        ${escapeHtml(
                            data.attendance ||
                            ""
                        )}

                    </div>

                </div>


                <div class="rsvpMiddle">

                    👥 ${
                        Number(
                            data.guest ||
                            1
                        )
                    }
                    Tetamu

                </div>


                <div class="rsvpBottom">

                    ${formatDateTime(
                        data.createdAt
                    )}

                </div>

            `;


            list.appendChild(
                card
            );

        }
    );


    if (
        latestRsvpId
    ) {

        const latest =
            $(latestRsvpId);


        if (latest) {

            latest.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center"
            });

        }


        latestRsvpId =
            null;

    }

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDateTime(
    value
) {

    if (!value)
        return "Baru sahaja";


    const date =
        typeof value?.toDate ===
        "function"

            ? value.toDate()

            : new Date(
                value
            );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Baru sahaja";

    }


    return date.toLocaleString(
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


/* =====================================================
   GALERI
===================================================== */

galleryBtn.addEventListener(
    "click",
    openGallery
);


function openGallery() {

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
            class="sheetBtn"
            type="button">

            Pilih Gambar & Muat Naik

        </button>


        <button
            id="viewGallery"
            class="sheetBtn secondary"
            type="button">

            Lihat Galeri

        </button>


        <p class="uploadNote">

            Setiap gambar akan memaparkan
            nama uploader, tarikh, masa,
            jumlah like dan butang simpan.

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


                if (!name) {

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


/* =====================================================
   MOMENT UPLOAD
===================================================== */

momentFile.addEventListener(
    "change",
    uploadMoments
);


async function uploadMoments(
    event
) {

    const files =
        [
            ...event.target.files
        ];


    if (
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


    try {

        for (
            const file of files
        ) {

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

    catch (error) {

        console.error(
            error
        );


        showToast(
            "Upload gagal. Semak Cloudinary.",
            "error"
        );

    }

}


async function uploadSingleMoment(
    file,
    uploader
) {

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            "Fail bukan gambar."
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


    if (
        !response.ok ||
        !result.secure_url
    ) {

        throw new Error(
            result.error?.message ||
            "Cloudinary upload gagal."
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
        `moment-${ref.id}`;

}


/* =====================================================
   MOMENT LIVE
===================================================== */

onSnapshot(

    query(
        momentRef,
        orderBy(
            "createdAt",
            "desc"
        )
    ),

    snapshot => {

        renderMoments(
            snapshot
        );

    },

    error => {

        console.warn(
            "Moments:",
            error
        );

    }

);


function renderMoments(
    snapshot
) {

    const gallery =
        $("momentGallery");


    if (!gallery)
        return;


    gallery.innerHTML =
        "";


    momentImages =
        [];


    snapshot.forEach(
        item => {

            const data =
                item.data();


            if (
                !data.imageUrl
            )
                return;


            const index =
                momentImages.length;


            momentImages.push(
                data.imageUrl
            );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "momentCard";


            card.id =
                `moment-${item.id}`;


            card.innerHTML = `

                <img
                    src="${escapeHtml(
                        data.imageUrl
                    )}"
                    alt="Momen oleh ${
                        escapeHtml(
                            data.uploader ||
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
                                    data.uploader ||
                                    "Tetamu"
                                )
                            }

                        </span>


                        <span>

                            📅 ${
                                formatDateTime(
                                    data.createdAt
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
                                    data.likes ||
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


            card.querySelector(
                "img"
            ).addEventListener(
                "click",
                () =>
                    openLightbox(
                        index
                    )
            );


            card.querySelector(
                ".like"
            ).addEventListener(
                "click",
                () =>
                    likeMoment(
                        item.id
                    )
            );


            card.querySelector(
                ".download"
            ).addEventListener(
                "click",
                () =>
                    downloadMoment(
                        data.imageUrl,
                        data.publicId ||
                        "momen"
                    )
            );


            gallery.appendChild(
                card
            );

        }
    );


    if (
        latestMomentId
    ) {

        const latest =
            $(latestMomentId);


        if (latest) {

            latest.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center"
            });

        }


        latestMomentId =
            null;

    }

}


/* =====================================================
   LIKE MOMENT
===================================================== */

async function likeMoment(
    id
) {

    try {

        await updateDoc(

            doc(
                db,
                "moments",
                id
            ),

            {

                likes:
                    increment(
                        1
                    )

            }

        );

    }

    catch (error) {

        console.error(
            error
        );


        showToast(
            "Like gagal.",
            "error"
        );

    }

}


/* =====================================================
   DOWNLOAD MOMENT
===================================================== */

async function downloadMoment(
    url,
    publicId
) {

    try {

        const response =
            await fetch(
                url,
                {
                    mode:
                        "cors"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Download gagal."
            );

        }


        const blob =
            await response.blob();


        const objectUrl =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            objectUrl;


        link.download =
            `${
                (
                    publicId ||
                    "momen"
                )
                .split("/")
                .pop()
            }.jpg`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    objectUrl
                );

            },

            1000
        );

    }

    catch (error) {

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );


        showToast(
            "Gambar dibuka. Tekan Simpan pada pelayar."
        );

    }

}


/* =====================================================
   LIGHTBOX
===================================================== */

function openLightbox(
    index
) {

    if (
        !momentImages.length
    )
        return;


    currentMomentIndex =
        index;


    lightboxImage.src =
        momentImages[
            currentMomentIndex
        ];


    lightbox.classList.add(
        "show"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeLightboxModal() {

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


function showCurrentMoment() {

    if (
        !momentImages.length
    )
        return;


    lightboxImage.src =
        momentImages[
            currentMomentIndex
        ];

}


function nextMoment() {

    if (
        !momentImages.length
    )
        return;


    currentMomentIndex =
        (
            currentMomentIndex +
            1
        ) %
        momentImages.length;


    showCurrentMoment();

}


function prevMoment() {

    if (
        !momentImages.length
    )
        return;


    currentMomentIndex =
        (
            currentMomentIndex -
            1 +
            momentImages.length
        ) %
        momentImages.length;


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
    event => {

        if (
            event.target ===
            lightbox
        ) {

            closeLightboxModal();

        }

    }
);


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeLightboxModal();

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextMoment();

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            prevMoment();

        }

    }
);


/* =====================================================
   UCAPAN
===================================================== */

wishBtn.addEventListener(
    "click",
    openWish
);


function openWish() {

    setActiveButton(
        wishBtn
    );


    openSheet(`

        <div class="sheetHandle"></div>

        <h2 class="sheetTitle">
            ❤️ Ucapan
        </h2>

        <p class="sheetDesc">

            Tinggalkan ucapan
            buat pasangan pengantin.

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
            placeholder="Ucapan..."></textarea>


        <button
            id="submitWish"
            class="sheetBtn"
            type="button">

            Hantar Ucapan

        </button>

    `);


    $("submitWish")
        .addEventListener(
            "click",
            submitWish
        );

}


async function submitWish() {

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


    if (
        !name ||
        !message
    ) {

        showToast(
            "Sila lengkapkan nama dan ucapan.",
            "error"
        );

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Menghantar...";


    try {

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
            `wish-${ref.id}`;


        closeSheet();


        showToast(
            "Terima kasih atas ucapan anda."
        );


        scrollToPage(
            "page9"
        );

    }

    catch (error) {

        console.error(
            error
        );


        button.disabled =
            false;


        button.textContent =
            "Hantar Ucapan";


        showToast(
            "Ucapan gagal dihantar.",
            "error"
        );

    }

}


/* =====================================================
   UCAPAN LIVE
===================================================== */

onSnapshot(

    query(
        wishRef,
        orderBy(
            "createdAt",
            "desc"
        )
    ),

    snapshot => {

        renderWishes(
            snapshot
        );

    },

    error => {

        console.warn(
            "Wishes:",
            error
        );

    }

);


function renderWishes(
    snapshot
) {

    const list =
        $("wishList");


    if (!list)
        return;


    list.innerHTML =
        "";


    snapshot.forEach(
        item => {

            const data =
                item.data();


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "wishCard";


            card.id =
                `wish-${item.id}`;


            card.innerHTML = `

                <div class="wishHeader">

                    <h3>

                        ${escapeHtml(
                            data.name ||
                            ""
                        )}

                    </h3>


                    <span class="wishDate">

                        ${formatDateTime(
                            data.createdAt
                        )}

                    </span>

                </div>


                <p class="wishMessage">

                    ${escapeHtml(
                        data.message ||
                        ""
                    )}

                </p>


                <button
                    class="likeWish"
                    type="button">

                    ❤️ ${
                        Number(
                            data.likes ||
                            0
                        )
                    }

                </button>

            `;


            card.querySelector(
                ".likeWish"
            ).addEventListener(
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


    if (
        latestWishId
    ) {

        const latest =
            $(latestWishId);


        if (latest) {

            latest.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center"
            });

        }


        latestWishId =
            null;

    }

}


/* =====================================================
   LIKE UCAPAN
===================================================== */

async function likeWish(
    id
) {

    try {

        await updateDoc(

            doc(
                db,
                "wishes",
                id
            ),

            {

                likes:
                    increment(
                        1
                    )

            }

        );

    }

    catch (error) {

        console.error(
            error
        );


        showToast(
            "Like gagal.",
            "error"
        );

    }

}


/* =====================================================
   REVEAL
===================================================== */

function revealSections() {

    document
        .querySelectorAll(
            ".fade-section"
        )
        .forEach(
            section => {

                section.classList.add(
                    "show"
                );

            }
        );

}


window.addEventListener(
    "scroll",
    revealSections,
    {
        passive:
            true
    }
);


/* =====================================================
   DISABLE DOUBLE TAP ZOOM
===================================================== */

let lastTouchEnd =
    0;


document.addEventListener(
    "touchend",

    event => {

        const now =
            Date.now();


        if (
            now -
            lastTouchEnd <=
            300
        ) {

            event.preventDefault();

        }


        lastTouchEnd =
            now;

    },

    {
        passive:
            false
    }
);


/* =====================================================
   START
===================================================== */

loadSettings();


window.addEventListener(
    "beforeunload",
    () => {

        clearInterval(
            countdownTimer
        );

    }
);