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

    address: "Ayu Heritage Bungalow, Tambun, Perak",

    maps: "https://maps.app.goo.gl/GsPCpoPkVa11SCqz5?g_st=ac",

    waze: "https://waze.com/ul/hw0zfjx5wb",

    phone: "0125465720",

    contactName: "Yana",
    contactRole: "Wakil Pengantin",

    music: "music/song.m4a"
};

/* =========================================================
   STATE
   ========================================================= */

let momentsData = [];
let currentMomentPage = 0;

let lightboxImages = [];
let lightboxIndex = 0;

let musicPlaying = false;

/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;

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
   SETTINGS
   ========================================================= */

async function loadSettings() {

    try {

        const snap = await getDoc(doc(db, "settings", "config"));

        if (snap.exists()) {

            const data = snap.data();

            CONFIG = {
                ...CONFIG,
                ...data,

                bride: data.brideName || CONFIG.bride,
                groom: data.groomName || CONFIG.groom,

                date: data.displayDate || CONFIG.date,
                time: data.weddingTime || CONFIG.time,

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

        console.error("Settings error:", error);
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

    const source = music.querySelector("source");

    const musicPath =
        CONFIG.music ||
        "music/song.m4a";

    if (source) {
        source.src = musicPath;
    } else {
        music.src = musicPath;
    }

    music.loop = true;
    music.volume = 1;
    music.muted = false;
}

/*
   Penting untuk iPhone:
   play() mesti dipanggil terus daripada user gesture.
*/

async function playMusic() {

    if (!music) return;

    try {

        music.muted = false;
        music.volume = 1;

        const promise = music.play();

        if (promise !== undefined) {
            await promise;
        }

        musicPlaying = true;

        if (musicBtn) {
            musicBtn.classList.add("playing");

            musicBtn.innerHTML =
                '<i class="fa-solid fa-music"></i>';
        }

    } catch (error) {

        console.warn("Music blocked:", error);

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
        musicBtn.classList.remove("playing");

        musicBtn.innerHTML =
            '<i class="fa-solid fa-music"></i>';
    }
}

async function toggleMusic() {

    if (!musicPlaying) {
        await playMusic();
    } else {
        pauseMusic();
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

const coverOpenBtn = $("coverOpenBtn");

async function openInvitation() {

    /*
       Ini mesti berlaku dalam click event.
       Jangan gunakan setTimeout sebelum play().
    */

    await playMusic();

    const cover = $("cover");

    if (cover) {
        cover.classList.add("hidden");
    }

    document.body.style.overflowX = "hidden";

    const nav = $("bottomNav");

    if (nav) {
        nav.classList.remove("hidden");
    }

    revealSections();
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

    let timeString =
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

        hours = Number(match[1]);
        minutes = Number(match[2]);

        const period =
            (match[3] || "")
                .toUpperCase();

        if (period === "PM" && hours !== 12) {
            hours += 12;
        }

        if (period === "AM" && hours === 12) {
            hours = 0;
        }
    }

    const [year, month, day] =
        dateString.split("-").map(Number);

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

    clearInterval(countdownTimer);

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

    if ($("days"))
        $("days").textContent =
            String(days).padStart(2, "0");

    if ($("hours"))
        $("hours").textContent =
            String(hours).padStart(2, "0");

    if ($("minutes"))
        $("minutes").textContent =
            String(minutes).padStart(2, "0");

    if ($("seconds"))
        $("seconds").textContent =
            String(seconds).padStart(2, "0");
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

function openSheet(html) {

    if (!bottomSheet || !sheetOverlay)
        return;

    if (sheetContent) {
        sheetContent.innerHTML = html;
    }

    sheetOverlay.classList.add("show");
    bottomSheet.classList.add("show");

    if (bottomNav) {
        bottomNav.classList.add("hidden");
    }

    if (musicBtn) {
        musicBtn.style.opacity = "0";
        musicBtn.style.pointerEvents = "none";
    }

    document.body.style.overflow = "hidden";
}

function closeSheet() {

    if (!bottomSheet || !sheetOverlay)
        return;

    bottomSheet.classList.remove("show");
    sheetOverlay.classList.remove("show");

    if (bottomNav) {
        bottomNav.classList.remove("hidden");
    }

    if (musicBtn) {
        musicBtn.style.opacity = "";
        musicBtn.style.pointerEvents = "";
    }

    document.body.style.overflow = "";
}

if (sheetOverlay) {

    sheetOverlay.addEventListener(
        "click",
        closeSheet
    );
}

/* =========================================================
   DATE
   ========================================================= */

function openDate() {

    openSheet(`
        <h2>Tarikh Majlis</h2>

        <p>
            <strong>${CONFIG.day}</strong>
        </p>

        <p>${CONFIG.date}</p>

        <p>
            ${CONFIG.time}
            -
            ${CONFIG.endTime}
        </p>
    `);
}

/* =========================================================
   LOCATION
   ========================================================= */

function openLocation() {

    openSheet(`
        <h2>Lokasi Majlis</h2>

        <p>${CONFIG.address}</p>

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
                <i class="fa-solid fa-map-location-dot"></i>
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
                <i class="fa-solid fa-location-arrow"></i>
                Waze
            </a>

        </div>
    `);
}

/* =========================================================
   CONTACT
   ========================================================= */

function openContact() {

    const number =
        String(CONFIG.phone)
            .replace(/\D/g, "");

    const whatsapp =
        `https://wa.me/6${number.replace(/^6/, "")}`;

    openSheet(`
        <h2>Hubungi</h2>

        <p>
            <strong>${CONFIG.contactName}</strong>
        </p>

        <p>${CONFIG.contactRole}</p>

        <p>${CONFIG.phone}</p>

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
   RSVP
   ========================================================= */

function openRSVP() {

    openSheet(`
        <h2>RSVP</h2>

        <form id="rsvpForm">

            <input
                id="rsvpName"
                required
                placeholder="Nama"
                style="
                    width:100%;
                    padding:13px;
                    margin-bottom:10px;
                "
            >

            <input
                id="rsvpPhone"
                placeholder="No. Telefon"
                style="
                    width:100%;
                    padding:13px;
                    margin-bottom:10px;
                "
            >

            <select
                id="rsvpAttendance"
                required
                style="
                    width:100%;
                    padding:13px;
                    margin-bottom:10px;
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

    try {

        await addDoc(
            rsvpRef,
            {
                name: $("rsvpName").value.trim(),

                phone:
                    $("rsvpPhone").value.trim(),

                attendance:
                    $("rsvpAttendance").value,

                guests:
                    Number(
                        $("rsvpGuests").value
                    ),

                createdAt:
                    serverTimestamp()
            }
        );

        showToast(
            "RSVP berjaya dihantar ❤️"
        );

        closeSheet();

    } catch (error) {

        console.error(error);

        showToast(
            "RSVP tidak berjaya dihantar."
        );
    }
}

/* =========================================================
   RSVP LIVE
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
                                data.name || ""
                            )}
                        </div>

                        <div class="rsvpInfo">
                            ${escapeHTML(
                                data.attendance || ""
                            )}
                            ·
                            ${data.guests || 1}
                            tetamu
                        </div>
                    `;

                    list.appendChild(card);
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
   MOMENTS - OPEN
   ========================================================= */

function openGallery() {

    openSheet(`

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
                id="momentFile"
                type="file"
                accept="image/*"
                multiple
                style="
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
        $("momentFile");

    if (!fileInput?.files?.length) {

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
            "Moment upload error:",
            error
        );

        showToast(
            "Gagal upload gambar."
        );
    }
}

/* =========================================================
   MOMENTS LIVE
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
                "Moment listener:",
                error
            );
        }
    );
}

/* =========================================================
   MOMENT FORMAT DATE
   ========================================================= */

function formatDateTime(timestamp) {

    if (!timestamp) {
        return "Baru sahaja";
    }

    let date;

    if (
        timestamp &&
        typeof timestamp.toDate === "function"
    ) {

        date =
            timestamp.toDate();

    } else {

        date =
            new Date(timestamp);
    }

    if (
        !date ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Baru sahaja";
    }

    return date.toLocaleString(
        "ms-MY",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

/* =========================================================
   MOMENT CAROUSEL
   ========================================================= */

function chunkArray(
    array,
    size
) {

    const result = [];

    for (
        let i = 0;
        i < array.length;
        i += size
    ) {

        result.push(
            array.slice(
                i,
                i + size
            )
        );
    }

    return result;
}

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
            <div style="
                background:rgba(255,255,255,.94);
                border-radius:18px;
                padding:20px;
                text-align:center;
                color:#555;
            ">
                Belum ada momen.
            </div>
        `;

        return;
    }

    const pages =
        chunkArray(
            momentsData,
            4
        );

    if (
        currentMomentPage >= pages.length
    ) {

        currentMomentPage =
            pages.length - 1;
    }

    const track =
        document.createElement(
            "div"
        );

    track.className =
        "momentTrack";

    pages.forEach(
        (page, pageIndex) => {

            const slide =
                document.createElement(
                    "div"
                );

            slide.className =
                "momentSlide";

            page.forEach(
                (item, itemIndex) => {

                    slide.appendChild(
                        createMomentCard(
                            item,
                            pageIndex * 4 +
                            itemIndex
                        )
                    );
                }
            );

            /*
               Jika page terakhir kurang daripada 4,
               kosongkan ruang supaya layout tetap 2x2.
            */

            while (
                slide.children.length < 4
            ) {

                const empty =
                    document.createElement(
                        "div"
                    );

                empty.style.visibility =
                    "hidden";

                slide.appendChild(
                    empty
                );
            }

            track.appendChild(slide);
        }
    );

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.style.overflow =
        "hidden";

    wrapper.appendChild(
        track
    );

    container.innerHTML = "";

    container.appendChild(
        wrapper
    );

    if (pages.length > 1) {

        const indicator =
            document.createElement(
                "div"
            );

        indicator.className =
            "momentPageIndicator";

        indicator.textContent =
            `${currentMomentPage + 1} / ${pages.length}  ·  Swipe`;

        container.appendChild(
            indicator
        );
    }

    updateMomentPosition(
        wrapper,
        track,
        pages.length
    );

    enableMomentSwipe(
        wrapper,
        track,
        container,
        pages.length
    );
}

/* =========================================================
   MOMENT CARD
   ========================================================= */

function createMomentCard(
    item,
    index
) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "momentCard";

    const imageUrl =
        item.imageUrl ||
        "";

    const uploader =
        item.uploader ||
        "Tetamu";

    const likes =
        Number(item.likes || 0);

    card.innerHTML = `

        <div class="momentImageWrap">

            <img
                class="momentImage"
                src="${escapeAttribute(
                    imageUrl
                )}"
                alt="Momen ${index + 1}"
                loading="lazy"
            >

        </div>

        <div class="momentInfo">

            <div class="momentUploader">
                ${escapeHTML(
                    uploader
                )}
            </div>

            <div class="momentDate">
                ${formatDateTime(
                    item.createdAt
                )}
            </div>

        </div>

        <div class="momentActions">

            <button
                class="momentLike"
                type="button"
                data-id="${escapeAttribute(
                    item.id
                )}"
            >
                ❤️ ${likes}
            </button>

            <button
                class="momentDownload"
                type="button"
                data-url="${escapeAttribute(
                    imageUrl
                )}"
            >
                ⬇️
            </button>

        </div>
    `;

    const image =
        card.querySelector(
            ".momentImage"
        );

    if (image) {

        image.addEventListener(
            "click",
            () => {

                openLightbox(
                    index
                );
            }
        );
    }

    const like =
        card.querySelector(
            ".momentLike"
        );

    if (like) {

        like.addEventListener(
            "click",
            () => {

                likeMoment(
                    item.id
                );
            }
        );
    }

    const download =
        card.querySelector(
            ".momentDownload"
        );

    if (download) {

        download.addEventListener(
            "click",
            () => {

                downloadImage(
                    imageUrl
                );
            }
        );
    }

    return card;
}

/* =========================================================
   MOMENT POSITION
   ========================================================= */

function updateMomentPosition(
    wrapper,
    track,
    pageCount
) {

    track.style.transform =
        `translateX(-${
            currentMomentPage * 100
        }%)`;

    const indicator =
        wrapper.parentElement
            ?.querySelector(
                ".momentPageIndicator"
            );

    if (indicator) {

        indicator.textContent =
            `${currentMomentPage + 1} / ${pageCount}  ·  Swipe`;
    }
}

/* =========================================================
   MOMENT SWIPE
   ========================================================= */

function enableMomentSwipe(
    wrapper,
    track,
    container,
    pageCount
) {

    let startX = 0;
    let startY = 0;

    wrapper.addEventListener(
        "touchstart",
        (event) => {

            const touch =
                event.changedTouches[0];

            startX =
                touch.clientX;

            startY =
                touch.clientY;
        },
        {
            passive: true
        }
    );

    wrapper.addEventListener(
        "touchend",
        (event) => {

            const touch =
                event.changedTouches[0];

            const deltaX =
                touch.clientX -
                startX;

            const deltaY =
                touch.clientY -
                startY;

            /*
               Hanya swipe horizontal.
               Scroll atas/bawah tidak terganggu.
            */

            if (
                Math.abs(deltaX) < 50 ||
                Math.abs(deltaX) <
                Math.abs(deltaY)
            ) {
                return;
            }

            if (deltaX < 0) {

                if (
                    currentMomentPage <
                    pageCount - 1
                ) {

                    currentMomentPage++;
                }

            } else {

                if (
                    currentMomentPage > 0
                ) {

                    currentMomentPage--;
                }
            }

            updateMomentPosition(
                wrapper,
                track,
                pageCount
            );

            const indicator =
                container.querySelector(
                    ".momentPageIndicator"
                );

            if (indicator) {

                indicator.textContent =
                    `${currentMomentPage + 1} / ${pageCount}  ·  Swipe`;
            }
        },
        {
            passive: true
        }
    );
}

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
            "Tidak dapat like."
        );
    }
}

/* =========================================================
   DOWNLOAD IMAGE
   ========================================================= */

async function downloadImage(
    url
) {

    if (!url) return;

    try {

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Download gagal"
            );
        }

        const blob =
            await response.blob();

        const blobUrl =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            blobUrl;

        link.download =
            "momen-by-sann.jpg";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            blobUrl
        );

    } catch (error) {

        console.warn(
            "Download blocked:",
            error
        );

        /*
           Jika browser block CORS,
           buka gambar dalam tab baru.
        */

        window.open(
            url,
            "_blank"
        );
    }
}

/* =========================================================
   LIGHTBOX
   ========================================================= */

function openLightbox(
    index
) {

    lightboxImages =
        momentsData
            .map(
                item =>
                    item.imageUrl
            )
            .filter(Boolean);

    lightboxIndex =
        Math.max(
            0,
            Math.min(
                index,
                lightboxImages.length - 1
            )
        );

    updateLightbox();

    const lightbox =
        $("lightbox");

    if (lightbox) {
        lightbox.classList.add(
            "show"
        );
    }
}

function updateLightbox() {

    const image =
        $("lightboxImage");

    if (
        image &&
        lightboxImages[
            lightboxIndex
        ]
    ) {

        image.src =
            lightboxImages[
                lightboxIndex
            ];
    }
}

function closeLightbox() {

    const lightbox =
        $("lightbox");

    if (lightbox) {
        lightbox.classList.remove(
            "show"
        );
    }
}

$("lightboxClose")
    ?.addEventListener(
        "click",
        closeLightbox
    );

$("lightboxPrev")
    ?.addEventListener(
        "click",
        () => {

            if (!lightboxImages.length)
                return;

            lightboxIndex =
                (
                    lightboxIndex -
                    1 +
                    lightboxImages.length
                ) %
                lightboxImages.length;

            updateLightbox();
        }
    );

$("lightboxNext")
    ?.addEventListener(
        "click",
        () => {

            if (!lightboxImages.length)
                return;

            lightboxIndex =
                (
                    lightboxIndex +
                    1
                ) %
                lightboxImages.length;

            updateLightbox();
        }
    );

/* =========================================================
   WISHES
   ========================================================= */

function openWishes() {

    openSheet(`

        <h2>Ucapan & Doa</h2>

        <form id="wishForm">

            <input
                id="wishName"
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

            <textarea
                id="wishMessage"
                required
                rows="5"
                placeholder="Tulis ucapan..."
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

        <hr style="
            margin:22px 0;
            border:0;
            border-top:1px solid #eee;
        ">

        <div id="sheetWishList"></div>

    `);

    renderSheetWishes();

    $("wishForm")
        ?.addEventListener(
            "submit",
            submitWish
        );
}

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

    if (!name || !message)
        return;

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

        $("wishName").value = "";
        $("wishMessage").value = "";

        showToast(
            "Ucapan berjaya dihantar ❤️"
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Ucapan gagal dihantar."
        );
    }
}

/* =========================================================
   WISH LIVE
   ========================================================= */

let wishesData = [];

function listenWishes() {

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

            wishesData = [];

            snapshot.forEach(
                item => {

                    wishesData.push({
                        id: item.id,
                        ...item.data()
                    });
                }
            );

            renderWishes();
        },
        error => {

            console.error(
                "Wish listener:",
                error
            );
        }
    );
}

function renderWishes() {

    const list =
        $("wishList");

    if (!list) return;

    list.innerHTML = "";

    wishesData.forEach(
        item => {

            list.appendChild(
                createWishCard(
                    item
                )
            );
        }
    );
}

function renderSheetWishes() {

    const list =
        $("sheetWishList");

    if (!list) return;

    list.innerHTML = "";

    wishesData.forEach(
        item => {

            list.appendChild(
                createWishCard(
                    item
                )
            );
        }
    );
}

function createWishCard(
    item
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "wishCard";

    card.innerHTML = `

        <div class="wishHeader">

            <div class="wishName">
                ${escapeHTML(
                    item.name || "Tetamu"
                )}
            </div>

            <div class="wishDate">
                ${formatDateTime(
                    item.createdAt
                )}
            </div>

        </div>

        <p class="wishMessage">
            ${escapeHTML(
                item.message || ""
            )}
        </p>

        <div class="wishActions">

            <button
                class="wishLike"
                type="button"
                data-id="${escapeAttribute(
                    item.id
                )}"
            >
                ❤️ ${Number(
                    item.likes || 0
                )}
            </button>

        </div>
    `;

    const like =
        card.querySelector(
            ".wishLike"
        );

    if (like) {

        like.addEventListener(
            "click",
            async () => {

                try {

                    await updateDoc(
                        doc(
                            db,
                            "wishes",
                            item.id
                        ),
                        {
                            likes:
                                increment(1)
                        }
                    );

                } catch (error) {

                    console.error(
                        error
                    );
                }
            }
        );
    }

    return card;
}

/* =========================================================
   NAVIGATION
   ========================================================= */

$("dateBtn")
    ?.addEventListener(
        "click",
        openDate
    );

$("locationBtn")
    ?.addEventListener(
        "click",
        openLocation
    );

$("contactBtn")
    ?.addEventListener(
        "click",
        openContact
    );

$("rsvpBtn")
    ?.addEventListener(
        "click",
        openRSVP
    );

$("galleryBtn")
    ?.addEventListener(
        "click",
        openGallery
    );

$("wishBtn")
    ?.addEventListener(
        "click",
        openWishes
    );

/* =========================================================
   REVEAL
   ========================================================= */

function revealSections() {

    document
        .querySelectorAll(
            ".fade-section"
        )
        .forEach(
            element => {

                element.classList.add(
                    "visible"
                );
            }
        );
}

window.addEventListener(
    "scroll",
    revealSections,
    {
        passive: true
    }
);

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );
}

/* =========================================================
   DISABLE DOUBLE TAP ZOOM
   ========================================================= */

let lastTouchEnd = 0;

document.addEventListener(
    "touchend",
    event => {

        const now =
            Date.now();

        if (
            now - lastTouchEnd <= 300
        ) {

            event.preventDefault();
        }

        lastTouchEnd = now;

    },
    {
        passive: false
    }
);

/* =========================================================
   START
   ========================================================= */

listenRSVP();
listenMoments();
listenWishes();

loadSettings();

revealSections();