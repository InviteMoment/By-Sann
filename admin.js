/* ==========================================================
   BY-SANN ADMIN.JS
   Firebase + Google Drive + Ucapan PDF
========================================================== */

import {
    auth,
    db,
    collection,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    signOut,
    onAuthStateChanged
} from "./firebase.js";


/* ==========================================================
   GOOGLE APPS SCRIPT
========================================================== */

const GOOGLE_APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycby68Qp0rQB3FTWrRIkJ8eshJYpuerrkSKfWh_i_lUTP7tgVGBgaIpH73-C6rIu6wH7s8A/exec";


/* ==========================================================
   GLOBAL
========================================================== */

let currentEditId = "";

let rsvpData = [];

let momentData = [];

let wishData = [];

let settingsData = {};


/* ==========================================================
   COLLECTION
========================================================== */

const rsvpRef =
    collection(db, "rsvps");

const momentRef =
    collection(db, "moments");

const wishRef =
    collection(db, "wishes");

const settingsRef =
    doc(db, "settings", "config");


/* ==========================================================
   ELEMENTS
========================================================== */

/* Sidebar */

const menuButtons =
    document.querySelectorAll(".menuBtn");

const pageTitle =
    document.getElementById("pageTitle");

const pages =
    document.querySelectorAll(".pageContent");

const logoutBtn =
    document.getElementById("logoutBtn");


/* Dashboard */

const totalRsvp =
    document.getElementById("totalRsvp");

const totalMoment =
    document.getElementById("totalMoment");

const totalWish =
    document.getElementById("totalWish");


/* RSVP */

const searchRsvp =
    document.getElementById("searchRsvp");

const exportExcelBtn =
    document.getElementById("exportExcelBtn");

const rsvpList =
    document.getElementById("rsvpList");


/* Moment */

const searchMoment =
    document.getElementById("searchMoment");

const momentList =
    document.getElementById("momentList");

const exportMomentsDriveBtn =
    document.getElementById(
        "exportMomentsDriveBtn"
    );


/* Wish */

const searchWish =
    document.getElementById("searchWish");

const wishList =
    document.getElementById("wishList");

const downloadWishBookBtn =
    document.getElementById(
        "downloadWishBookBtn"
    );


/* Settings */

const groomName =
    document.getElementById("groomName");

const brideName =
    document.getElementById("brideName");

const weddingDate =
    document.getElementById("weddingDate");

const weddingTime =
    document.getElementById("weddingTime");

const address =
    document.getElementById("address");

const phone =
    document.getElementById("phone");

const whatsapp =
    document.getElementById("whatsapp");

const maps =
    document.getElementById("maps");

const waze =
    document.getElementById("waze");

const music =
    document.getElementById("music");

const rsvpOpen =
    document.getElementById("rsvpOpen");

const momentOpen =
    document.getElementById("momentOpen");

const wishOpen =
    document.getElementById("wishOpen");

const saveSettings =
    document.getElementById("saveSettings");


/* Media */

const coverUpload =
    document.getElementById("coverUpload");

const coverPreview =
    document.getElementById("coverPreview");

const uploadCover =
    document.getElementById("uploadCover");

const pageMediaList =
    document.getElementById("pageMediaList");


/* Modal */

const imageModal =
    document.getElementById("imageModal");

const previewImage =
    document.getElementById("previewImage");

const closeImageModal =
    document.getElementById(
        "closeImageModal"
    );


const editModal =
    document.getElementById("editModal");

const editName =
    document.getElementById("editName");

const editPhone =
    document.getElementById("editPhone");

const editAttendance =
    document.getElementById(
        "editAttendance"
    );

const editGuest =
    document.getElementById("editGuest");

const saveEditBtn =
    document.getElementById(
        "saveEditBtn"
    );


/* ==========================================================
   PAGE MAP
========================================================== */

const PAGE_MAP = {

    dashboard:
        "dashboardPage",

    rsvp:
        "rsvpPage",

    moments:
        "momentsPage",

    wishes:
        "wishesPage",

    settings:
        "settingsPage",

    media:
        "mediaPage"

};


/* ==========================================================
   AUTH
========================================================== */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            location.href =
                "login.html";

        }

    }
);


/* ==========================================================
   PAGE ENGINE
========================================================== */

function openPage(page) {

    pages.forEach(
        section => {

            section.classList.add(
                "hidden"
            );

        }
    );


    menuButtons.forEach(
        btn => {

            btn.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.getElementById(
            PAGE_MAP[page]
        );


    if (target) {

        target.classList.remove(
            "hidden"
        );

    }


    const active =
        document.querySelector(
            `[data-page="${page}"]`
        );


    if (active) {

        active.classList.add(
            "active"
        );

        pageTitle.textContent =
            active.textContent.trim();

    }

}


menuButtons.forEach(
    button => {

        if (!button.dataset.page)
            return;


        button.onclick = () => {

            openPage(
                button.dataset.page
            );

        };

    }
);


openPage("dashboard");


/* ==========================================================
   LOGOUT
========================================================== */

logoutBtn.onclick = async () => {

    await signOut(auth);

    location.href =
        "login.html";

};


/* ==========================================================
   HELPERS
========================================================== */

function formatDate(timestamp) {

    if (!timestamp)
        return "-";


    try {

        return timestamp
            .toDate()
            .toLocaleString(
                "ms-MY"
            );

    }

    catch {

        return "-";

    }

}


function showExportLoading(
    button,
    text
) {

    if (!button)
        return;


    button.disabled = true;


    button.dataset.originalText =
        button.innerHTML;


    button.innerHTML =
        text;

}


function hideExportLoading(
    button
) {

    if (!button)
        return;


    button.disabled = false;


    if (
        button.dataset.originalText
    ) {

        button.innerHTML =
            button.dataset.originalText;

    }

}


/* ==========================================================
   GOOGLE APPS SCRIPT REQUEST
========================================================== */

async function callAppsScript(
    payload
) {

    const response =
        await fetch(
            GOOGLE_APPS_SCRIPT_URL,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify(
                        payload
                    )

            }
        );


    const responseText =
        await response.text();


    let result;


    try {

        result =
            JSON.parse(
                responseText
            );

    }

    catch {

        throw new Error(
            "Apps Script tidak memberikan jawapan JSON yang sah."
        );

    }


    if (!result.success) {

        throw new Error(
            result.message ||
            "Operasi gagal."
        );

    }


    return result;

}


/* ==========================================================
   DASHBOARD
========================================================== */

function updateDashboard() {

    totalRsvp.textContent =
        rsvpData.length;


    totalMoment.textContent =
        momentData.length;


    totalWish.textContent =
        wishData.length;

}


/* ==========================================================
   REALTIME RSVP
========================================================== */

onSnapshot(
    rsvpRef,
    snapshot => {

        rsvpData = [];


        snapshot.forEach(
            item => {

                rsvpData.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        updateDashboard();

        renderRsvp();

    }
);


/* ==========================================================
   REALTIME MOMEN
========================================================== */

onSnapshot(
    momentRef,
    snapshot => {

        momentData = [];


        snapshot.forEach(
            item => {

                momentData.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        updateDashboard();

        renderMoment();

    }
);


/* ==========================================================
   REALTIME UCAPAN
========================================================== */

onSnapshot(
    wishRef,
    snapshot => {

        wishData = [];


        snapshot.forEach(
            item => {

                wishData.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        updateDashboard();

        renderWish();

    }
);


/* ==========================================================
   RSVP MANAGER
========================================================== */

function renderRsvp(
    data = rsvpData
) {

    rsvpList.innerHTML =
        "";


    if (!data.length) {

        rsvpList.innerHTML = `

            <div class="emptyState">

                Tiada RSVP

            </div>

        `;

        return;

    }


    data.forEach(
        item => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "rsvpCard";


            card.innerHTML = `

                <div class="rsvpHeader">

                    <h3>
                        ${item.name ?? "-"}
                    </h3>

                    <span>
                        ${item.attendance ?? "-"}
                    </span>

                </div>


                <div class="rsvpBody">

                    <p>
                        📞 ${item.phone ?? "-"}
                    </p>

                    <p>
                        👥 ${item.guest ?? 0}
                    </p>

                    <p>
                        🕒 ${formatDate(
                            item.createdAt
                        )}
                    </p>

                </div>


                <div class="rsvpAction">

                    <button
                        class="editBtn"
                        data-id="${item.id}"
                    >
                        ✏ Edit
                    </button>


                    <button
                        class="deleteBtn"
                        data-id="${item.id}"
                    >
                        🗑 Delete
                    </button>

                </div>

            `;


            rsvpList.appendChild(
                card
            );

        }
    );


    document
        .querySelectorAll(
            ".editBtn"
        )
        .forEach(
            btn => {

                btn.onclick = () => {

                    openEditModal(
                        btn.dataset.id
                    );

                };

            }
        );


    document
        .querySelectorAll(
            ".deleteBtn"
        )
        .forEach(
            btn => {

                btn.onclick = () => {

                    removeRsvp(
                        btn.dataset.id
                    );

                };

            }
        );

}


/* ==========================================================
   SEARCH RSVP
========================================================== */

searchRsvp.addEventListener(
    "input",
    () => {

        const keyword =
            searchRsvp.value
                .trim()
                .toLowerCase();


        renderRsvp(

            rsvpData.filter(
                item => {

                    return (

                        (
                            item.name ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                        ||

                        (
                            item.phone ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                    );

                }
            )

        );

    }
);


/* ==========================================================
   EDIT RSVP
========================================================== */

function openEditModal(id) {

    currentEditId =
        id;


    const data =
        rsvpData.find(
            item =>
                item.id === id
        );


    if (!data)
        return;


    editName.value =
        data.name || "";


    editPhone.value =
        data.phone || "";


    editAttendance.value =
        data.attendance ||
        "Hadir";


    editGuest.value =
        data.guest ||
        1;


    editModal.style.display =
        "flex";

}


/* ==========================================================
   SAVE RSVP EDIT
========================================================== */

saveEditBtn.onclick =
    async () => {

        if (!currentEditId)
            return;


        await updateDoc(

            doc(
                db,
                "rsvps",
                currentEditId
            ),

            {

                name:
                    editName.value.trim(),

                phone:
                    editPhone.value.trim(),

                attendance:
                    editAttendance.value,

                guest:
                    Number(
                        editGuest.value
                    )

            }

        );


        editModal.style.display =
            "none";

    };


/* ==========================================================
   DELETE RSVP
========================================================== */

async function removeRsvp(
    id
) {

    if (
        !confirm(
            "Padam RSVP ini?"
        )
    )
        return;


    await deleteDoc(
        doc(
            db,
            "rsvps",
            id
        )
    );

}


/* ==========================================================
   EXPORT EXCEL
========================================================== */

exportExcelBtn.onclick =
    () => {

        const excelData =
            rsvpData.map(
                item => ({

                    Nama:
                        item.name,

                    Telefon:
                        item.phone,

                    Kehadiran:
                        item.attendance,

                    Tetamu:
                        item.guest,

                    Tarikh:
                        formatDate(
                            item.createdAt
                        )

                })
            );


        const workbook =
            XLSX.utils.book_new();


        const worksheet =
            XLSX.utils.json_to_sheet(
                excelData
            );


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "RSVP"
        );


        XLSX.writeFile(
            workbook,
            "RSVP.xlsx"
        );

    };


/* ==========================================================
   MOMEN MANAGER
========================================================== */

function renderMoment(
    data = momentData
) {

    momentList.innerHTML =
        "";


    if (!data.length) {

        momentList.innerHTML = `

            <div class="emptyState">

                Tiada Momen

            </div>

        `;

        return;

    }


    data.forEach(
        item => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "momentCard";


            card.innerHTML = `

                <img
                    src="${item.imageUrl}"
                    class="momentImage"
                >


                <div class="momentInfo">

                    <p>
                        ❤️ ${item.likes || 0}
                    </p>

                    <p>
                        ${formatDate(
                            item.createdAt
                        )}
                    </p>

                </div>


                <div class="momentAction">

                    <button
                        class="viewMoment"
                        data-url="${item.imageUrl}"
                    >
                        👁 View
                    </button>


                    <button
                        class="deleteMoment"
                        data-id="${item.id}"
                    >
                        🗑 Delete
                    </button>

                </div>

            `;


            momentList.appendChild(
                card
            );

        }
    );


    document
        .querySelectorAll(
            ".viewMoment"
        )
        .forEach(
            btn => {

                btn.onclick = () => {

                    previewImage.src =
                        btn.dataset.url;


                    imageModal.style.display =
                        "flex";

                };

            }
        );


    document
        .querySelectorAll(
            ".deleteMoment"
        )
        .forEach(
            btn => {

                btn.onclick = () => {

                    removeMoment(
                        btn.dataset.id
                    );

                };

            }
        );

}


/* ==========================================================
   SEARCH MOMEN
========================================================== */

searchMoment.addEventListener(
    "input",
    () => {

        const keyword =
            searchMoment.value
                .trim()
                .toLowerCase();


        renderMoment(

            momentData.filter(
                item => {

                    return (
                        (
                            item.imageUrl ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                keyword
                            )
                    );

                }
            )

        );

    }
);


/* ==========================================================
   DELETE MOMEN
========================================================== */

async function removeMoment(
    id
) {

    if (
        !confirm(
            "Padam gambar ini?"
        )
    )
        return;


    await deleteDoc(
        doc(
            db,
            "moments",
            id
        )
    );

}


/* ==========================================================
   GOOGLE DRIVE
   EXPORT SEMUA MOMEN
========================================================== */

if (
    exportMomentsDriveBtn
) {

    exportMomentsDriveBtn.onclick =
        async () => {

            if (
                !momentData.length
            ) {

                alert(
                    "Tiada momen untuk diexport."
                );

                return;

            }


            if (
                !confirm(
                    `Export ${momentData.length} gambar Momen ke Google Drive?`
                )
            )
                return;


            showExportLoading(

                exportMomentsDriveBtn,

                "⏳ Sedang export..."

            );


            try {

                const moments =
                    momentData

                        .filter(
                            item =>
                                item.imageUrl
                        )

                        .map(
                            (
                                item,
                                index
                            ) => ({

                                id:
                                    item.id,

                                imageUrl:
                                    item.imageUrl,

                                uploader:
                                    item.uploader ||
                                    "Tetamu",

                                likes:
                                    Number(
                                        item.likes ||
                                        0
                                    ),

                                date:
                                    formatDate(
                                        item.createdAt
                                    ),

                                index:
                                    index + 1

                            })
                        );


                const result =
                    await callAppsScript({

                        action:
                            "exportMoments",

                        moments:
                            moments

                    });


                alert(

                    `Berjaya export ${result.count || moments.length} gambar ke Google Drive.\n\nFolder: Momen`

                );

            }

            catch (error) {

                console.error(
                    "Google Drive export:",
                    error
                );


                alert(

                    "Export Momen gagal.\n\n" +
                    error.message

                );

            }

            finally {

                hideExportLoading(
                    exportMomentsDriveBtn
                );

            }

        };

}


/* ==========================================================
   UCAPAN MANAGER
========================================================== */

function renderWish(
    data = wishData
) {

    wishList.innerHTML =
        "";


    if (!data.length) {

        wishList.innerHTML = `

            <div class="emptyState">

                Tiada Ucapan

            </div>

        `;

        return;

    }


    data.forEach(
        item => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "wishCard";


            card.innerHTML = `

                <div class="wishHeader">

                    <h3>
                        ${item.name || "Tetamu"}
                    </h3>


                    <span>
                        ❤️ ${item.likes || 0}
                    </span>

                </div>


                <div class="wishMessage">

                    ${item.message || "-"}

                </div>


                <div class="wishFooter">

                    <small>

                        ${formatDate(
                            item.createdAt
                        )}

                    </small>

                </div>


                <div class="wishAction">

                    <button
                        class="deleteWish"
                        data-id="${item.id}"
                    >
                        🗑 Delete
                    </button>

                </div>

            `;


            wishList.appendChild(
                card
            );

        }
    );


    document
        .querySelectorAll(
            ".deleteWish"
        )
        .forEach(
            btn => {

                btn.onclick = () => {

                    removeWish(
                        btn.dataset.id
                    );

                };

            }
        );

}


/* ==========================================================
   SEARCH UCAPAN
========================================================== */

searchWish.addEventListener(
    "input",
    () => {

        const keyword =
            searchWish.value
                .trim()
                .toLowerCase();


        renderWish(

            wishData.filter(
                item => {

                    return (

                        (
                            item.name ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                        ||

                        (
                            item.message ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                    );

                }
            )

        );

    }
);


/* ==========================================================
   DELETE UCAPAN
========================================================== */

async function removeWish(
    id
) {

    if (
        !confirm(
            "Padam ucapan ini?"
        )
    )
        return;


    await deleteDoc(
        doc(
            db,
            "wishes",
            id
        )
    );

}


/* ==========================================================
   UCAPAN
   DOWNLOAD BUKU PDF
========================================================== */

if (
    downloadWishBookBtn
) {

    downloadWishBookBtn.onclick =
        async () => {

            if (
                !wishData.length
            ) {

                alert(
                    "Tiada ucapan untuk dibuat buku."
                );

                return;

            }


            if (
                !confirm(
                    `Buat buku PDF untuk ${wishData.length} ucapan?`
                )
            )
                return;


            showExportLoading(

                downloadWishBookBtn,

                "⏳ Sedang bina buku PDF..."

            );


            try {

                const wishes =
                    wishData.map(
                        (
                            item,
                            index
                        ) => ({

                            name:
                                item.name ||
                                "Tetamu",

                            message:
                                item.message ||
                                "",

                            likes:
                                Number(
                                    item.likes ||
                                    0
                                ),

                            date:
                                formatDate(
                                    item.createdAt
                                ),

                            index:
                                index + 1

                        })
                    );


                const result =
                    await callAppsScript({

                        action:
                            "createWishBook",

                        title:
                            "Atikah & Hafiezul",

                        subtitle:
                            "Koleksi Ucapan Tetamu",

                        wishes:
                            wishes

                    });


                if (result.url) {

                    window.open(
                        result.url,
                        "_blank"
                    );

                }


                alert(
                    "Buku PDF Ucapan berjaya dibuat."
                );

            }

            catch (error) {

                console.error(
                    "Wish book export:",
                    error
                );


                alert(

                    "Buku PDF gagal dibuat.\n\n" +
                    error.message

                );

            }

            finally {

                hideExportLoading(
                    downloadWishBookBtn
                );

            }

        };

}


/* ==========================================================
   MODALS
========================================================== */

closeImageModal.onclick =
    () => {

        imageModal.style.display =
            "none";

    };


window.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            imageModal
        ) {

            imageModal.style.display =
                "none";

        }


        if (
            event.target ===
            editModal
        ) {

            editModal.style.display =
                "none";

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            imageModal.style.display =
                "none";


            editModal.style.display =
                "none";

        }

    }
);


previewImage.draggable =
    false;


/* ==========================================================
   SETTINGS
========================================================== */

async function loadSettings() {

    try {

        const snap =
            await getDoc(
                settingsRef
            );


        if (!snap.exists())
            return;


        settingsData =
            snap.data();


        groomName.value =
            settingsData.groomName ||
            "";


        brideName.value =
            settingsData.brideName ||
            "";


        weddingDate.value =
            settingsData.weddingDate ||
            "";


        weddingTime.value =
            settingsData.weddingTime ||
            "";


        address.value =
            settingsData.address ||
            "";


        phone.value =
            settingsData.phone ||
            "";


        whatsapp.value =
            settingsData.whatsapp ||
            "";


        maps.value =
            settingsData.maps ||
            "";


        waze.value =
            settingsData.waze ||
            "";


        music.value =
            settingsData.music ||
            "";


        rsvpOpen.checked =
            settingsData.rsvpOpen ??
            true;


        momentOpen.checked =
            settingsData.momentOpen ??
            true;


        wishOpen.checked =
            settingsData.wishOpen ??
            true;


        if (
            settingsData.coverImage
        ) {

            coverPreview.src =
                settingsData.coverImage;

        }

    }

    catch (error) {

        console.error(
            "Load settings:",
            error
        );

    }

}


loadSettings();


/* ==========================================================
   SAVE SETTINGS
========================================================== */

saveSettings.onclick =
    async () => {

        try {

            await updateDoc(

                settingsRef,

                {

                    groomName:
                        groomName.value.trim(),

                    brideName:
                        brideName.value.trim(),

                    weddingDate:
                        weddingDate.value,

                    weddingTime:
                        weddingTime.value,

                    address:
                        address.value.trim(),

                    phone:
                        phone.value.trim(),

                    whatsapp:
                        whatsapp.value.trim(),

                    maps:
                        maps.value.trim(),

                    waze:
                        waze.value.trim(),

                    music:
                        music.value.trim(),

                    rsvpOpen:
                        rsvpOpen.checked,

                    momentOpen:
                        momentOpen.checked,

                    wishOpen:
                        wishOpen.checked

                }

            );


            alert(
                "Settings berjaya disimpan"
            );

        }

        catch (error) {

            console.error(
                "Save settings:",
                error
            );


            alert(

                "Settings gagal disimpan.\n\n" +
                error.message

            );

        }

    };


/* ==========================================================
   MEDIA
========================================================== */

function renderMedia() {

    pageMediaList.innerHTML =
        "";


    for (
        let i = 1;
        i <= 10;
        i++
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "mediaItem";


        card.innerHTML = `

            <h4>
                Page ${i}
            </h4>


            <img

                src="images/page${i}.webp"

                class="mediaPreview"

                onerror="
                    this.style.display='none'
                "

            >

        `;


        pageMediaList.appendChild(
            card
        );

    }

}


renderMedia();


/* ==========================================================
   COVER PREVIEW
========================================================== */

coverUpload.onchange =
    () => {

        const file =
            coverUpload.files[0];


        if (!file)
            return;


        coverPreview.src =
            URL.createObjectURL(
                file
            );

    };


/* ==========================================================
   COVER UPLOAD
========================================================== */

uploadCover.onclick =
    () => {

        if (
            !coverUpload.files.length
        ) {

            alert(
                "Sila pilih gambar."
            );

            return;

        }


        alert(

            "Upload Cover akan disambungkan dengan Cloudinary pada V3.1"

        );

    };


/* ==========================================================
   STARTUP
========================================================== */

window.addEventListener(
    "load",
    () => {

        openPage(
            "dashboard"
        );


        updateDashboard();


        renderRsvp();


        renderMoment();


        renderWish();


        renderMedia();

    }
);


/* ==========================================================
   VERSION
========================================================== */

console.log(
    "========================================"
);

console.log(
    "BY-SANN ADMIN + GOOGLE DRIVE READY"
);

console.log(
    "Dashboard : READY"
);

console.log(
    "RSVP : READY"
);

console.log(
    "Momen : READY"
);

console.log(
    "Ucapan : READY"
);

console.log(
    "Settings : READY"
);

console.log(
    "Media : READY"
);

console.log(
    "Google Drive : READY"
);

console.log(
    "Ucapan PDF : READY"
);

console.log(
    "========================================"
);