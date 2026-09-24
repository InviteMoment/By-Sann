// @ts-nocheck

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


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   FIREBASE COLLECTIONS
========================================================= */

const rsvpRef = collection(db, "rsvps");
const momentRef = collection(db, "moments");
const wishRef = collection(db, "wishes");


/* =========================================================
   CONFIG
========================================================= */

let CONFIG = {

    bride: "Nur Atikah",
    groom: "Mohammad Hafiezul",

    day: "Ahad",
    date: "08 November 2026",

    time: "11:00 AM",
    endTime: "2:00 PM",

    weddingDate: "2026-11-08",

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


/* =========================================================
   STATE
========================================================= */

let momentsData = [];

let currentMomentPage = 0;

let lightboxImages = [];

let lightboxIndex = 0;

let musicPlaying = false;

let toastTimer;


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


/* =========================================================
   LOAD SETTINGS
========================================================= */

async function loadSettings() {

    try {

        const snap = await getDoc(
            doc(db, "settings", "config")
        );

        if (snap.exists()) {

            const data = snap.data();

            CONFIG = {
                ...CONFIG,
                ...data,

                bride:
                    data.brideName ||
                    CONFIG.bride,

                groom:
                    data.groomName ||
                    CONFIG.groom,

                date:
                    data.displayDate ||
                    CONFIG.date,

                time:
                    data.weddingTime ||
                    CONFIG.time,

                weddingDate:
                    data.weddingDate ||
                    CONFIG.weddingDate,

                address:
                    data.address ||
                    CONFIG.address,

                maps:
                    data.maps ||
                    CONFIG.maps,

                waze:
                    data.waze ||
                    CONFIG.waze,

                phone:
                    data.phone ||
                    CONFIG.phone,

                music:
                    data.music ||
                    CONFIG.music
            };
        }

    } catch (error) {

        console.error(
            "Settings error:",
            error
        );
    }

    setMusicSource();

    startCountdown();
}


/* =========================================================
   MUSIC
========================================================= */

const music = $("music");

const musicBtn = $("musicBtn");


function setMusicSource() {

    if (!music) return;

    const source =
        music.querySelector("source");

    const path =
        CONFIG.music ||
        "music/song.m4a";

    if (source) {

        source.src = path;

    } else {

        music.src = path;
    }

    music.loop = true;

    music.volume = 1;

    music.muted = false;

    try {

        music.load();

    } catch (error) {

        console.warn(error);
    }
}


async function playMusic() {

    if (!music) return;

    try {

        if (
            !music.currentSrc &&
            !music.querySelector("source")
        ) {

            setMusicSource();
        }

        music.muted = false;

        music.volume = 1;

        const promise =
            music.play();

        if (
            promise !== undefined
        ) {

            await promise;
        }

        musicPlaying = true;

        if (musicBtn) {

            musicBtn.classList.add(
                "playing"
            );

            musicBtn.innerHTML =
                '<i class="fa-solid fa-music"></i>';
        }

    } catch (error) {

        console.warn(
            "Music blocked:",
            error
        );

        musicPlaying = false;

        showToast(
            "Tekan butang 🎵 sekali untuk memainkan muzik."
        );
    }
}


function pauseMusic() {

    if (!music) return;

    music.pause();

    musicPlaying = false;

    if (musicBtn) {

        musicBtn.classList.remove(
            "playing"
        );

        musicBtn.innerHTML =
            '<i class="fa-solid fa-music"></i>';
    }
}


async function toggleMusic() {

    if (musicPlaying) {

        pauseMusic();

    } else {

        await playMusic();
    }
}


if (musicBtn) {

    musicBtn.addEventListener(
        "click",
        toggleMusic
    );
}


/* =========================================================
   OPEN INVITATION
========================================================= */

const coverOpenBtn =
    $("coverOpenBtn");


async function openInvitation() {

    /*
       Buka cover dahulu supaya website tidak tersangkut
       jika browser menyekat autoplay muzik.
    */

    const cover =
        $("cover");

    if (cover) {

        cover.classList.add(
            "hidden"
        );
    }

    const nav =
        $("bottomNav");

    if (nav) {

        nav.classList.remove(
            "hidden"
        );
    }

    document.body.style.overflowX =
        "hidden";

    revealSections();

    /*
       Cuba mainkan muzik selepas cover dibuka.
       Jika autoplay disekat, website tetap boleh digunakan.
    */

    playMusic().catch(
        (error) => {

            console.warn(
                "Music start failed:",
                error
            );
        }
    );
}


if (coverOpenBtn) {

    coverOpenBtn.addEventListener(
        "click",
        openInvitation
    );
}


/* =========================================================
   COUNTDOWN
========================================================= */

function parseWeddingDate() {

    const dateString =
        CONFIG.weddingDate ||
        "2026-11-08";

    const timeString =
        CONFIG.time ||
        "11:00 AM";

    let hours = 11;

    let minutes = 0;

    const match =
        timeString
            .trim()
            .match(
                /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
            );

    if (match) {

        hours =
            Number(match[1]);

        minutes =
            Number(match[2]);

        const period =
            (
                match[3] || ""
            ).toUpperCase();

        if (
            period === "PM" &&
            hours !== 12
        ) {

            hours += 12;
        }

        if (
            period === "AM" &&
            hours === 12
        ) {

            hours = 0;
        }
    }

    const parts =
        dateString
            .split("-")
            .map(Number);

    const year =
        parts[0];

    const month =
        parts[1];

    const day =
        parts[2];

    return new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
        0
    );
}


let countdownTimer;


function startCountdown() {

    clearInterval(
        countdownTimer
    );

    updateCountdown();

    countdownTimer =
        setInterval(
            updateCountdown,
            1000
        );
}


function updateCountdown() {

    const target =
        parseWeddingDate();

    const now =
        new Date();

    let difference =
        target.getTime() -
        now.getTime();

    if (difference < 0) {

        difference = 0;
    }

    const totalSeconds =
        Math.floor(
            difference / 1000
        );

    const days =
        Math.floor(
            totalSeconds / 86400
        );

    const hours =
        Math.floor(
            (totalSeconds % 86400) /
            3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) /
            60
        );

    const seconds =
        totalSeconds % 60;


    if ($("days")) {

        $("days").textContent =
            String(days)
                .padStart(2, "0");
    }

    if ($("hours")) {

        $("hours").textContent =
            String(hours)
                .padStart(2, "0");
    }

    if ($("minutes")) {

        $("minutes").textContent =
            String(minutes)
                .padStart(2, "0");
    }

    if ($("seconds")) {

        $("seconds").textContent =
            String(seconds)
                .padStart(2, "0");
    }
}


/* =========================================================
   BOTTOM SHEET
========================================================= */

const sheetOverlay =
    $("sheetOverlay");

const bottomSheet =
    $("bottomSheet");

const sheetContent =
    $("sheetContent");

const bottomNav =
    $("bottomNav");


function openSheet(content) {

    if (!bottomSheet) return;

    if (sheetContent) {

        sheetContent.innerHTML =
            content;
    }

    if (sheetOverlay) {

        sheetOverlay.classList.add(
            "show"
        );
    }

    bottomSheet.classList.add(
        "show"
    );

    if (bottomNav) {

        bottomNav.classList.add(
            "hidden"
        );
    }

    if (musicBtn) {

        musicBtn.style.opacity =
            "0";

        musicBtn.style.pointerEvents =
            "none";
    }
}


function closeSheet() {

    if (sheetOverlay) {

        sheetOverlay.classList.remove(
            "show"
        );
    }

    if (bottomSheet) {

        bottomSheet.classList.remove(
            "show"
        );
    }

    if (bottomNav) {

        bottomNav.classList.remove(
            "hidden"
        );
    }

    if (musicBtn) {

        musicBtn.style.opacity =
            "";

        musicBtn.style.pointerEvents =
            "";
    }
}


if (sheetOverlay) {

    sheetOverlay.addEventListener(
        "click",
        closeSheet
    );
}


/* =========================================================
   DATE SHEET
========================================================= */

function openDate() {

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>
            Tarikh Majlis
        </h2>

        <p>
            <strong>
                ${escapeHTML(CONFIG.day)}
            </strong>
        </p>

        <p>
            ${escapeHTML(CONFIG.date)}
        </p>

        <p>
            ${escapeHTML(CONFIG.time)}
            -
            ${escapeHTML(CONFIG.endTime)}
        </p>

    `);
}


/* =========================================================
   LOCATION SHEET
========================================================= */

function openLocation() {

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>
            Lokasi Majlis
        </h2>

        <p>
            ${escapeHTML(CONFIG.address)}
        </p>

        <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
        ">

            <a
                href="${CONFIG.maps}"
                target="_blank"
                rel="noopener"
                style="
                    flex:1;
                    min-width:140px;
                    padding:13px;
                    background:#294c9b;
                    color:white;
                    border-radius:12px;
                    text-align:center;
                    text-decoration:none;
                "
            >

                <i class="
                    fa-solid
                    fa-map-location-dot
                "></i>

                Google Maps

            </a>


            <a
                href="${CONFIG.waze}"
                target="_blank"
                rel="noopener"
                style="
                    flex:1;
                    min-width:140px;
                    padding:13px;
                    background:#294c9b;
                    color:white;
                    border-radius:12px;
                    text-align:center;
                    text-decoration:none;
                "
            >

                <i class="
                    fa-solid
                    fa-location-arrow
                "></i>

                Waze

            </a>

        </div>

    `);
}


/* =========================================================
   CONTACT SHEET
========================================================= */

function openContact() {

    const phone =
        String(CONFIG.phone)
            .replace(/\D/g, "");

    const whatsappNumber =
        phone.startsWith("6")
            ? phone
            : "6" + phone;

    const whatsapp =
        `https://wa.me/${whatsappNumber}`;


    openSheet(`

        <div class="sheetHandle"></div>

        <h2>
            Hubungi
        </h2>

        <p>
            <strong>
                ${escapeHTML(
                    CONFIG.contactName
                )}
            </strong>
        </p>

        <p>
            ${escapeHTML(
                CONFIG.contactRole
            )}
        </p>

        <p>
            ${escapeHTML(
                CONFIG.phone
            )}
        </p>

        <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
        ">

            <a
                href="${whatsapp}"
                target="_blank"
                rel="noopener"
                style="
                    flex:1;
                    padding:13px;
                    background:#294c9b;
                    color:white;
                    border-radius:12px;
                    text-align:center;
                    text-decoration:none;
                "
            >
                WhatsApp
            </a>

            <a
                href="tel:${CONFIG.phone}"
                style="
                    flex:1;
                    padding:13px;
                    background:#294c9b;
                    color:white;
                    border-radius:12px;
                    text-align:center;
                    text-decoration:none;
                "
            >
                Telefon
            </a>

        </div>

    `);
}

/* =========================================================
   RSVP FORM
========================================================= */

function openRSVP() {

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>
            RSVP
        </h2>

        <form id="rsvpForm">

            <input
                id="rsvpName"
                required
                placeholder="Nama"
                style="
                    width:100%;
                    padding:13px;
                    margin-bottom:10px;
                    border:1px solid #ddd;
                    border-radius:10px;
                "
            >


            <input
                id="rsvpPhone"
                placeholder="No. Telefon"
                style="
                    width:100%;
                    padding:13px;
                    margin-bottom:10px;
                    border:1px solid #ddd;
                    border-radius:10px;
                "
            >


            <select
                id="rsvpAttendance"
                required
                style="
                    width:100%;
                    padding:13px;
                    margin-bottom:10px;
                    border:1px solid #ddd;
                    border-radius:10px;
                "
            >

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
                id="rsvpGuests"
                type="number"
                min="1"
                value="1"
                placeholder="Bilangan tetamu"
                style="
                    width:100%;
                    padding:13px;
                    margin-bottom:12px;
                    border:1px solid #ddd;
                    border-radius:10px;
                "
            >


            <button
                type="submit"
                style="
                    width:100%;
                    padding:14px;
                    background:#294c9b;
                    color:white;
                    border-radius:12px;
                "
            >
                Hantar RSVP
            </button>

        </form>

    `);


    const form =
        $("rsvpForm");

    if (form) {

        form.addEventListener(
            "submit",
            submitRSVP
        );
    }
}


async function submitRSVP(event) {

    event.preventDefault();

    const name =
        $("rsvpName")
            ?.value
            .trim();

    const phone =
        $("rsvpPhone")
            ?.value
            .trim();

    const attendance =
        $("rsvpAttendance")
            ?.value;

    const guests =
        Number(
            $("rsvpGuests")
                ?.value || 1
        );


    if (!name) {

        showToast(
            "Sila masukkan nama."
        );

        return;
    }


    if (!attendance) {

        showToast(
            "Sila pilih kehadiran."
        );

        return;
    }


    try {

        await addDoc(
            rsvpRef,
            {
                name,

                phone,

                attendance,

                guests,

                createdAt:
                    serverTimestamp()
            }
        );


        showToast(
            "RSVP berjaya dihantar ❤️"
        );

        closeSheet();

    } catch (error) {

        console.error(
            "RSVP error:",
            error
        );

        showToast(
            "RSVP tidak berjaya dihantar."
        );
    }
}


/* =========================================================
   RSVP LIVE LIST
========================================================= */

function listenRSVP() {

    const list =
        $("rsvpList");

    if (!list) return;


    const q =
        query(
            rsvpRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(
        q,
        (snapshot) => {

            list.innerHTML = "";


            snapshot.forEach(
                (item) => {

                    const data =
                        item.data();


                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "rsvpCard";


                    card.innerHTML = `

                        <div class="rsvpName">

                            ${escapeHTML(
                                data.name ||
                                ""
                            )}

                        </div>


                        <div class="rsvpInfo">

                            ${escapeHTML(
                                data.attendance ||
                                ""
                            )}

                            ·

                            ${Number(
                                data.guests || 1
                            )}

                            tetamu

                        </div>

                    `;


                    list.appendChild(
                        card
                    );
                }
            );

        },

        (error) => {

            console.error(
                "RSVP listener:",
                error
            );
        }
    );
}


/* =========================================================
   MOMEN - SHEET
========================================================= */

function openGallery() {

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>
            Momen
        </h2>

        <p>
            Kongsi gambar bersama
            pengantin ❤️
        </p>


        <div class="momentUploadBox">

            <input
                id="momentUploader"
                placeholder="Nama anda"
                style="
                    width:100%;
                    padding:12px;
                    margin-bottom:10px;
                    border:1px solid #ddd;
                    border-radius:10px;
                "
            >


            <input
                id="momentFileUpload"
                type="file"
                accept="image/*"
                multiple
                style="
                    width:100%;
                    margin-bottom:10px;
                "
            >


            <button
                id="uploadMomentBtn"
                type="button"
                style="
                    width:100%;
                    padding:12px;
                    background:#294c9b;
                    color:white;
                    border-radius:10px;
                "
            >
                Upload Momen
            </button>

        </div>


        <div id="sheetMomentGallery"></div>

    `);


    renderMomentCarousel(
        $("sheetMomentGallery")
    );


    const uploadBtn =
        $("uploadMomentBtn");


    if (uploadBtn) {

        uploadBtn.addEventListener(
            "click",
            uploadMoments
        );
    }
}


/* =========================================================
   CLOUDINARY UPLOAD
========================================================= */

async function uploadMoments() {

    const nameInput =
        $("momentUploader");

    const fileInput =
        $("momentFileUpload");


    if (
        !fileInput ||
        !fileInput.files ||
        !fileInput.files.length
    ) {

        showToast(
            "Pilih sekurang-kurangnya satu gambar."
        );

        return;
    }


    const uploader =
        nameInput?.value.trim() ||
        "Tetamu";


    const files =
        Array.from(
            fileInput.files
        );


    showToast(
        `Sedang upload ${files.length} gambar...`
    );


    try {

        for (const file of files) {

            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            formData.append(
                "upload_preset",
                "bysann_gallery"
            );


            const response =
                await fetch(
                    "https://api.cloudinary.com/v1_1/onarqwtu/image/upload",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Cloudinary upload gagal."
                );
            }


            const result =
                await response.json();


            await addDoc(
                momentRef,
                {
                    imageUrl:
                        result.secure_url,

                    publicId:
                        result.public_id,

                    uploader,

                    likes: 0,

                    createdAt:
                        serverTimestamp()
                }
            );
        }


        fileInput.value = "";


        showToast(
            "Momen berjaya dimuat naik ❤️"
        );


    } catch (error) {

        console.error(
            "Upload error:",
            error
        );

        showToast(
            "Gagal upload gambar."
        );
    }
}


/* =========================================================
   MOMEN LIVE
========================================================= */

function listenMoments() {

    const q =
        query(
            momentRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(
        q,
        (snapshot) => {

            momentsData = [];


            snapshot.forEach(
                (item) => {

                    momentsData.push({
                        id: item.id,
                        ...item.data()
                    });
                }
            );


            currentMomentPage = 0;


            renderMomentGallery();
        },

        (error) => {

            console.error(
                "Moments listener:",
                error
            );
        }
    );
}


/* =========================================================
   MOMEN GALLERY
========================================================= */

function renderMomentGallery() {

    const gallery =
        $("momentGallery");

    if (!gallery) return;


    renderMomentCarousel(
        gallery
    );
}


function renderMomentCarousel(
    container
) {

    if (!container) return;


    if (!momentsData.length) {

        container.innerHTML = `

            <div
                style="
                    width:100%;
                    padding:20px;
                    text-align:center;
                    color:#173d72;
                    background:rgba(255,255,255,.9);
                    border-radius:15px;
                "
            >

                Belum ada momen lagi ❤️

            </div>

        `;

        return;
    }


    const chunks = [];


    for (
        let i = 0;
        i < momentsData.length;
        i += 4
    ) {

        chunks.push(
            momentsData.slice(
                i,
                i + 4
            )
        );
    }


    const totalPages =
        chunks.length;


    let html = `

        <div
            class="momentTrack"
            id="momentTrack"
        >

    `;


    chunks.forEach(
        (chunk, pageIndex) => {

            html += `

                <div
                    class="momentSlide"
                    data-page="${pageIndex}"
                >

            `;


            chunk.forEach(
                (item) => {

                    html += createMomentCard(
                        item
                    );
                }
            );


            for (
                let i = chunk.length;
                i < 4;
                i++
            ) {

                html += `
                    <div
                        class="momentCard"
                        style="
                            visibility:hidden;
                        "
                    ></div>
                `;
            }


            html += `
                </div>
            `;
        }
    );


    html += `
        </div>

        <div
            class="momentPageIndicator"
            id="momentPageIndicator"
        >
            ${currentMomentPage + 1}
            /
            ${totalPages}
        </div>
    `;


    container.innerHTML =
        html;


    const track =
        container.querySelector(
            "#momentTrack"
        );


    setupMomentSwipe(
        container,
        track,
        totalPages
    );


    updateMomentPosition(
        track,
        totalPages
    );
}


/* =========================================================
   MOMENT CARD
========================================================= */

function createMomentCard(
    item
) {

    const index =
        momentsData.findIndex(
            (x) =>
                x.id === item.id
        );


    const date =
        formatDateTime(
            item.createdAt
        );


    return `

        <article
            class="momentCard"
        >

            <div
                class="momentImageWrap"
            >

                <img
                    class="momentImage"
                    src="${escapeHTML(
                        item.imageUrl || ""
                    )}"
                    alt="Momen"
                    loading="lazy"
                    data-index="${index}"
                >

            </div>


            <div
                class="momentInfo"
            >

                <div
                    class="momentUploader"
                >
                    ${escapeHTML(
                        item.uploader ||
                        "Tetamu"
                    )}
                </div>


                <div
                    class="momentDate"
                >
                    ${escapeHTML(
                        date
                    )}
                </div>

            </div>


            <div
                class="momentActions"
            >

                <button
                    type="button"
                    class="momentLike"
                    data-id="${item.id}"
                >

                    ❤️
                    ${Number(
                        item.likes || 0
                    )}

                </button>


                <a
                    class="momentDownload"
                    href="${escapeHTML(
                        item.imageUrl || "#"
                    )}"
                    target="_blank"
                    rel="noopener"
                    download
                >

                    ⬇️

                </a>

            </div>

        </article>

    `;
}

/* =========================================================
   MOMENT SWIPE
========================================================= */

function setupMomentSwipe(
    container,
    track,
    totalPages
) {

    if (!container || !track)
        return;


    let startX = 0;

    let endX = 0;


    container.addEventListener(
        "touchstart",
        (event) => {

            if (
                event.touches &&
                event.touches.length
            ) {

                startX =
                    event.touches[0]
                        .clientX;
            }
        },
        {
            passive: true
        }
    );


    container.addEventListener(
        "touchend",
        (event) => {

            if (
                event.changedTouches &&
                event.changedTouches.length
            ) {

                endX =
                    event.changedTouches[0]
                        .clientX;
            }


            const distance =
                endX - startX;


            if (
                Math.abs(distance) <
                40
            ) {

                return;
            }


            if (distance < 0) {

                nextMomentPage(
                    totalPages
                );

            } else {

                previousMomentPage(
                    totalPages
                );
            }

        },
        {
            passive: true
        }
    );
}


function updateMomentPosition(
    track,
    totalPages
) {

    if (!track) return;


    track.style.transform =
        `translateX(-${
            currentMomentPage * 100
        }%)`;


    const indicator =
        document.querySelector(
            "#momentPageIndicator"
        );


    if (indicator) {

        indicator.textContent =
            `${currentMomentPage + 1} / ${totalPages}`;
    }
}


function nextMomentPage(
    totalPages
) {

    if (
        currentMomentPage >=
        totalPages - 1
    ) {

        return;
    }


    currentMomentPage++;


    const track =
        document.querySelector(
            "#momentTrack"
        );


    updateMomentPosition(
        track,
        totalPages
    );
}


function previousMomentPage(
    totalPages
) {

    if (
        currentMomentPage <= 0
    ) {

        return;
    }


    currentMomentPage--;


    const track =
        document.querySelector(
            "#momentTrack"
        );


    updateMomentPosition(
        track,
        totalPages
    );
}


/* =========================================================
   MOMENT CLICK EVENTS
========================================================= */

document.addEventListener(
    "click",
    async (event) => {

        const image =
            event.target.closest(
                ".momentImage"
            );


        if (image) {

            const index =
                Number(
                    image.dataset.index
                );

            openLightbox(
                index
            );

            return;
        }


        const like =
            event.target.closest(
                ".momentLike"
            );


        if (like) {

            const id =
                like.dataset.id;

            await likeMoment(
                id
            );
        }
    }
);


/* =========================================================
   LIKE MOMENT
========================================================= */

async function likeMoment(id) {

    if (!id) return;


    try {

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

    } catch (error) {

        console.error(
            "Like moment error:",
            error
        );

        showToast(
            "Like gagal."
        );
    }
}


/* =========================================================
   UCAPAN - OPEN
========================================================= */

function openWishes() {

    openSheet(`

        <div class="sheetHandle"></div>

        <h2>
            Ucapan
        </h2>

        <form id="wishForm">

            <input
                id="wishName"
                required
                maxlength="80"
                placeholder="Nama"
                style="
                    width:100%;
                    padding:13px;
                    margin-bottom:10px;
                    border:1px solid #ddd;
                    border-radius:10px;
                "
            >


            <textarea
                id="wishMessage"
                required
                rows="5"
                maxlength="1000"
                placeholder="Tulis ucapan anda..."
                style="
                    width:100%;
                    padding:13px;
                    margin-bottom:10px;
                    border:1px solid #ddd;
                    border-radius:10px;
                    resize:vertical;
                "
            ></textarea>


            <button
                type="submit"
                style="
                    width:100%;
                    padding:14px;
                    background:#294c9b;
                    color:white;
                    border-radius:12px;
                "
            >
                Hantar Ucapan
            </button>

        </form>

    `);


    const form =
        $("wishForm");


    if (form) {

        form.addEventListener(
            "submit",
            submitWish
        );
    }
}


/* =========================================================
   SUBMIT WISH
========================================================= */

async function submitWish(
    event
) {

    event.preventDefault();


    const name =
        $("wishName")
            ?.value
            .trim();

    const message =
        $("wishMessage")
            ?.value
            .trim();


    if (!name || !message) {

        showToast(
            "Sila lengkapkan nama dan ucapan."
        );

        return;
    }


    try {

        await addDoc(
            wishRef,
            {
                name,

                message,

                likes: 0,

                createdAt:
                    serverTimestamp()
            }
        );


        showToast(
            "Ucapan berjaya dihantar ❤️"
        );


        closeSheet();

    } catch (error) {

        console.error(
            "Wish error:",
            error
        );

        showToast(
            "Ucapan tidak berjaya dihantar."
        );
    }
}


/* =========================================================
   UCAPAN LIVE
========================================================= */

function listenWishes() {

    const list =
        $("wishList");

    if (!list) return;


    const q =
        query(
            wishRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(
        q,
        (snapshot) => {

            list.innerHTML = "";


            snapshot.forEach(
                (item) => {

                    const data =
                        item.data();


                    list.appendChild(
                        createWishCard(
                            item.id,
                            data
                        )
                    );
                }
            );

        },

        (error) => {

            console.error(
                "Wishes listener:",
                error
            );
        }
    );
}


/* =========================================================
   WISH CARD
========================================================= */

function createWishCard(
    id,
    data
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "wishCard";


    card.innerHTML = `

        <div
            class="wishHeader"
        >

            <div
                class="wishName"
            >
                ${escapeHTML(
                    data.name ||
                    "Tetamu"
                )}
            </div>


            <div
                class="wishDate"
            >
                ${escapeHTML(
                    formatDateTime(
                        data.createdAt
                    )
                )}
            </div>

        </div>


        <p
            class="wishMessage"
        >
            ${escapeHTML(
                data.message ||
                ""
            )}
        </p>


        <div
            class="wishActions"
        >

            <button
                type="button"
                class="wishLike"
                data-id="${id}"
            >

                ❤️
                ${Number(
                    data.likes || 0
                )}

            </button>

        </div>

    `;


    return card;
}


/* =========================================================
   LIKE WISH
========================================================= */

document.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                ".wishLike"
            );


        if (!button) return;


        const id =
            button.dataset.id;


        try {

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

        } catch (error) {

            console.error(
                "Wish like error:",
                error
            );

            showToast(
                "Like gagal."
            );
        }
    }
);


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDateTime(
    timestamp
) {

    if (!timestamp) {

        return "Baru sahaja";
    }


    let date;


    try {

        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            date =
                timestamp.toDate();

        } else if (
            timestamp.seconds
        ) {

            date =
                new Date(
                    timestamp.seconds *
                    1000
                );

        } else {

            date =
                new Date(timestamp);
        }

    } catch (error) {

        return "Baru sahaja";
    }


    if (
        !date ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Baru sahaja";
    }


    return new Intl.DateTimeFormat(
        "ms-MY",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}


/* =========================================================
   LIGHTBOX
========================================================= */

const lightbox =
    $("lightbox");

const lightboxImage =
    $("lightboxImage");

const lightboxClose =
    $("lightboxClose");

const lightboxPrev =
    $("lightboxPrev");

const lightboxNext =
    $("lightboxNext");


function openLightbox(
    index
) {

    lightboxImages =
        momentsData
            .map(
                (item) =>
                    item.imageUrl
            )
            .filter(Boolean);


    if (
        !lightboxImages.length
    ) {

        return;
    }


    lightboxIndex =
        Math.max(
            0,
            Math.min(
                index,
                lightboxImages.length - 1
            )
        );


    updateLightbox();


    if (lightbox) {

        lightbox.classList.add(
            "show"
        );

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );
    }
}


function updateLightbox() {

    if (!lightboxImage) return;


    lightboxImage.src =
        lightboxImages[
            lightboxIndex
        ] || "";
}


function closeLightbox() {

    if (!lightbox) return;


    lightbox.classList.remove(
        "show"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );
}


function previousLightbox() {

    if (!lightboxImages.length)
        return;


    lightboxIndex--;

    if (
        lightboxIndex < 0
    ) {

        lightboxIndex =
            lightboxImages.length - 1;
    }


    updateLightbox();
}


function nextLightbox() {

    if (!lightboxImages.length)
        return;


    lightboxIndex++;


    if (
        lightboxIndex >=
        lightboxImages.length
    ) {

        lightboxIndex = 0;
    }


    updateLightbox();
}

/* =========================================================
   LIGHTBOX EVENTS
========================================================= */

if (lightboxClose) {

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );
}


if (lightboxPrev) {

    lightboxPrev.addEventListener(
        "click",
        previousLightbox
    );
}


if (lightboxNext) {

    lightboxNext.addEventListener(
        "click",
        nextLightbox
    );
}


if (lightbox) {

    lightbox.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                lightbox
            ) {

                closeLightbox();
            }
        }
    );
}


/* =========================================================
   KEYBOARD LIGHTBOX
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            !lightbox ||
            !lightbox.classList.contains(
                "show"
            )
        ) {

            return;
        }


        if (
            event.key ===
            "Escape"
        ) {

            closeLightbox();
        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousLightbox();
        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextLightbox();
        }
    }
);


/* =========================================================
   BOTTOM NAV BUTTONS
========================================================= */

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


if (dateBtn) {

    dateBtn.addEventListener(
        "click",
        openDate
    );
}


if (locationBtn) {

    locationBtn.addEventListener(
        "click",
        openLocation
    );
}


if (contactBtn) {

    contactBtn.addEventListener(
        "click",
        openContact
    );
}


if (rsvpBtn) {

    rsvpBtn.addEventListener(
        "click",
        openRSVP
    );
}


if (galleryBtn) {

    galleryBtn.addEventListener(
        "click",
        openGallery
    );
}


if (wishBtn) {

    wishBtn.addEventListener(
        "click",
        openWishes
    );
}


/* =========================================================
   REVEAL SECTIONS
========================================================= */

function revealSections() {

    const sections =
        document.querySelectorAll(
            ".fade-section"
        );


    sections.forEach(
        (section) => {

            section.classList.add(
                "visible"
            );
        }
    );
}


/* =========================================================
   INTERSECTION OBSERVER
========================================================= */

function setupRevealObserver() {

    const sections =
        document.querySelectorAll(
            ".fade-section"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        revealSections();

        return;
    }


    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target
                                .classList
                                .add(
                                    "visible"
                                );
                        }
                    }
                );
            },
            {
                threshold: 0.08
            }
        );


    sections.forEach(
        (section) => {

            observer.observe(
                section
            );
        }
    );
}


/* =========================================================
   INIT
========================================================= */

async function init() {

    setMusicSource();

    startCountdown();

    setupRevealObserver();

    listenRSVP();

    listenMoments();

    listenWishes();

    await loadSettings();
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once: true
        }
    );

} else {

    init();
}