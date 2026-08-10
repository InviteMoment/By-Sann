/* ==========================================================
   BY-SANN V3 STABLE
   ADMIN.JS
========================================================== */

/* ==========================================================
   FIREBASE
========================================================== */

import{

    auth,
    db,

    collection,
    addDoc,
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

}from "./firebase.js";


/* ==========================================================
   AUTH
========================================================== */

onAuthStateChanged(auth,user=>{

    if(!user){

        location.href="login.html";

    }

});


/* ==========================================================
   GLOBAL
========================================================== */

let currentPage="dashboard";

let currentEditId="";

let rsvpData=[];

let momentData=[];

let wishData=[];

let settingsData={};


/* ==========================================================
   COLLECTION
========================================================== */

const rsvpRef=

collection(db,"rsvps");

const momentRef=

collection(db,"moments");

const wishRef=

collection(db,"wishes");

const settingsRef=

doc(db,"settings","config");


/* ==========================================================
   ELEMENT
========================================================== */

/* Sidebar */

const menuButtons=

document.querySelectorAll(".menuBtn");

const pageTitle=

document.getElementById("pageTitle");

const pages=

document.querySelectorAll(".pageContent");

const logoutBtn=

document.getElementById("logoutBtn");


/* Dashboard */

const totalRsvp=

document.getElementById("totalRsvp");

const totalMoment=

document.getElementById("totalMoment");

const totalWish=

document.getElementById("totalWish");


/* RSVP */

const searchRsvp=

document.getElementById("searchRsvp");

const exportExcelBtn=

document.getElementById("exportExcelBtn");

const rsvpList=

document.getElementById("rsvpList");


/* Moment */

const searchMoment=

document.getElementById("searchMoment");

const momentList=

document.getElementById("momentList");


/* Wish */

const searchWish=

document.getElementById("searchWish");

const wishList=

document.getElementById("wishList");


/* Settings */

const groomName=

document.getElementById("groomName");

const brideName=

document.getElementById("brideName");

const weddingDate=

document.getElementById("weddingDate");

const weddingTime=

document.getElementById("weddingTime");

const address=

document.getElementById("address");

const phone=

document.getElementById("phone");

const whatsapp=

document.getElementById("whatsapp");

const maps=

document.getElementById("maps");

const waze=

document.getElementById("waze");

const music=

document.getElementById("music");

const rsvpOpen=

document.getElementById("rsvpOpen");

const momentOpen=

document.getElementById("momentOpen");

const wishOpen=

document.getElementById("wishOpen");

const saveSettings=

document.getElementById("saveSettings");


/* Media */

const coverUpload=

document.getElementById("coverUpload");

const coverPreview=

document.getElementById("coverPreview");

const uploadCover=

document.getElementById("uploadCover");

const pageMediaList=

document.getElementById("pageMediaList");


/* Modal */

const imageModal=

document.getElementById("imageModal");

const previewImage=

document.getElementById("previewImage");

const closeImageModal=

document.getElementById("closeImageModal");

const editModal=

document.getElementById("editModal");

const editName=

document.getElementById("editName");

const editPhone=

document.getElementById("editPhone");

const editAttendance=

document.getElementById("editAttendance");

const editGuest=

document.getElementById("editGuest");

const saveEditBtn=

document.getElementById("saveEditBtn");


/* ==========================================================
   PAGE MAP
========================================================== */

const PAGE_MAP={

    dashboard:"dashboardPage",

    rsvp:"rsvpPage",

    moments:"momentsPage",

    wishes:"wishesPage",

    settings:"settingsPage",

    media:"mediaPage"

};


/* ==========================================================
   START
========================================================== */

console.log("✅ ADMIN V3 PART 1 READY");

/* ==========================================================
   PAGE ENGINE
========================================================== */

function openPage(page){

    currentPage=page;

    pages.forEach(section=>{

        section.classList.add("hidden");

    });

    menuButtons.forEach(btn=>{

        btn.classList.remove("active");

    });

    const target=

    document.getElementById(

        PAGE_MAP[page]

    );

    if(target){

        target.classList.remove("hidden");

    }

    const active=

    document.querySelector(

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
   LOGOUT
========================================================== */

logoutBtn.onclick=async()=>{

    await signOut(auth);

    location.href="login.html";

};


/* ==========================================================
   DASHBOARD
========================================================== */

function updateDashboard(){

    totalRsvp.textContent=

    rsvpData.length;

    totalMoment.textContent=

    momentData.length;

    totalWish.textContent=

    wishData.length;

}


/* ==========================================================
   REALTIME
========================================================== */

onSnapshot(

    rsvpRef,

    snapshot=>{

        rsvpData=[];

        snapshot.forEach(doc=>{

            rsvpData.push({

                id:doc.id,

                ...doc.data()

            });

        });

        updateDashboard();

        if(typeof renderRsvp==="function"){

            renderRsvp();

        }

    }

);


onSnapshot(

    momentRef,

    snapshot=>{

        momentData=[];

        snapshot.forEach(doc=>{

            momentData.push({

                id:doc.id,

                ...doc.data()

            });

        });

        updateDashboard();

        if(typeof renderMoment==="function"){

            renderMoment();

        }

    }

);


onSnapshot(

    wishRef,

    snapshot=>{

        wishData=[];

        snapshot.forEach(doc=>{

            wishData.push({

                id:doc.id,

                ...doc.data()

            });

        });

        updateDashboard();

        if(typeof renderWish==="function"){

            renderWish();

        }

    }

);

console.log("✅ ADMIN V3 PART 2 READY");

/* ==========================================================
   RSVP MANAGER
========================================================== */

function renderRsvp(data = rsvpData){

    rsvpList.innerHTML="";

    if(data.length===0){

        rsvpList.innerHTML=`

        <div class="emptyState">

            Tiada RSVP

        </div>

        `;

        return;

    }

    data.forEach(item=>{

        const card=document.createElement("div");

        card.className="rsvpCard";

        card.innerHTML=`

        <div class="rsvpHeader">

            <h3>${item.name??"-"}</h3>

            <span>${item.attendance??"-"}</span>

        </div>

        <div class="rsvpBody">

            <p>

            📞 ${item.phone??"-"}

            </p>

            <p>

            👥 ${item.guest??0}

            </p>

            <p>

            🕒 ${formatDate(item.createdAt)}

            </p>

        </div>

        <div class="rsvpAction">

            <button

            class="editBtn"

            data-id="${item.id}">

            ✏ Edit

            </button>

            <button

            class="deleteBtn"

            data-id="${item.id}">

            🗑 Delete

            </button>

        </div>

        `;

        rsvpList.appendChild(card);

    });

    bindRsvpButton();

}


/* ==========================================================
   SEARCH RSVP
========================================================== */

searchRsvp.addEventListener(

"input",

()=>{

    const keyword=

    searchRsvp.value

    .trim()

    .toLowerCase();

    const result=

    rsvpData.filter(item=>{

        return(

            (item.name||"")

            .toLowerCase()

            .includes(keyword)

            ||

            (item.phone||"")

            .toLowerCase()

            .includes(keyword)

        );

    });

    renderRsvp(result);

});


/* ==========================================================
   RSVP BUTTON
========================================================== */

function bindRsvpButton(){

    document

    .querySelectorAll(".editBtn")

    .forEach(btn=>{

        btn.onclick=()=>{

            openEditModal(

                btn.dataset.id

            );

        };

    });

    document

    .querySelectorAll(".deleteBtn")

    .forEach(btn=>{

        btn.onclick=()=>{

            removeRsvp(

                btn.dataset.id

            );

        };

    });

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDate(timestamp){

    if(!timestamp) return "-";

    try{

        return timestamp

        .toDate()

        .toLocaleString(

            "ms-MY"

        );

    }

    catch{

        return "-";

    }

}

console.log("✅ ADMIN V3 PART 3 READY");

/* ==========================================================
   EDIT RSVP
========================================================== */

function openEditModal(id){

    currentEditId=id;

    const data=rsvpData.find(

        item=>item.id===id

    );

    if(!data) return;

    editName.value=

    data.name||"";

    editPhone.value=

    data.phone||"";

    editAttendance.value=

    data.attendance||"Hadir";

    editGuest.value=

    data.guest||1;

    editModal.style.display="flex";

}


/* ==========================================================
   CLOSE EDIT
========================================================== */

window.addEventListener(

"click",

event=>{

    if(

        event.target===editModal

    ){

        editModal.style.display="none";

    }

});


/* ==========================================================
   SAVE EDIT
========================================================== */

saveEditBtn.onclick=async()=>{

    if(!currentEditId) return;

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

            guest:Number(

                editGuest.value

            )

        }

    );

    editModal.style.display="none";

};


/* ==========================================================
   DELETE RSVP
========================================================== */

async function removeRsvp(id){

    const confirmDelete=

    confirm(

        "Padam RSVP ini?"

    );

    if(!confirmDelete) return;

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

exportExcelBtn.onclick=()=>{

    const excelData=

    rsvpData.map(item=>({

        Nama:item.name,

        Telefon:item.phone,

        Kehadiran:item.attendance,

        Tetamu:item.guest,

        Tarikh:

        formatDate(

            item.createdAt

        )

    }));

    const workbook=

    XLSX.utils.book_new();

    const worksheet=

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

console.log("✅ ADMIN V3 PART 4 READY");

/* ==========================================================
   MOMENT MANAGER
========================================================== */

function renderMoment(data = momentData){

    momentList.innerHTML="";

    if(data.length===0){

        momentList.innerHTML=`

        <div class="emptyState">

            Tiada Momen

        </div>

        `;

        return;

    }

    data.forEach(item=>{

        const card=document.createElement("div");

        card.className="momentCard";

        card.innerHTML=`

        <img

        src="${item.imageUrl}"

        class="momentImage">

        <div class="momentInfo">

            <p>

            ❤️ ${item.likes||0}

            </p>

            <p>

            ${formatDate(item.createdAt)}

            </p>

        </div>

        <div class="momentAction">

            <button

            class="viewMoment"

            data-url="${item.imageUrl}">

            👁 View

            </button>

            <button

            class="deleteMoment"

            data-id="${item.id}">

            🗑 Delete

            </button>

        </div>

        `;

        momentList.appendChild(card);

    });

    bindMomentButton();

}


/* ==========================================================
   SEARCH MOMENT
========================================================== */

searchMoment.addEventListener(

"input",

()=>{

    const keyword=

    searchMoment.value

    .trim()

    .toLowerCase();

    const result=

    momentData.filter(item=>

        (item.imageUrl||"")

        .toLowerCase()

        .includes(keyword)

    );

    renderMoment(result);

});


/* ==========================================================
   MOMENT BUTTON
========================================================== */

function bindMomentButton(){

    document

    .querySelectorAll(".viewMoment")

    .forEach(btn=>{

        btn.onclick=()=>{

            previewImage.src=

            btn.dataset.url;

            imageModal.style.display=

            "flex";

        };

    });

    document

    .querySelectorAll(".deleteMoment")

    .forEach(btn=>{

        btn.onclick=()=>{

            removeMoment(

                btn.dataset.id

            );

        };

    });

}


/* ==========================================================
   CLOSE IMAGE
========================================================== */

closeImageModal.onclick=()=>{

    imageModal.style.display="none";

};

window.addEventListener(

"click",

event=>{

    if(

        event.target===imageModal

    ){

        imageModal.style.display="none";

    }

});


/* ==========================================================
   DELETE MOMENT
========================================================== */

async function removeMoment(id){

    const confirmDelete=

    confirm(

        "Padam gambar ini?"

    );

    if(!confirmDelete) return;

    await deleteDoc(

        doc(

            db,

            "moments",

            id

        )

    );

}

console.log("✅ ADMIN V3 PART 5 READY");

/* ==========================================================
   WISH MANAGER
========================================================== */

function renderWish(data = wishData){

    wishList.innerHTML="";

    if(data.length===0){

        wishList.innerHTML=`

        <div class="emptyState">

            Tiada Ucapan

        </div>

        `;

        return;

    }

    data.forEach(item=>{

        const card=document.createElement("div");

        card.className="wishCard";

        card.innerHTML=`

        <div class="wishHeader">

            <h3>

            ${item.name||"Tetamu"}

            </h3>

            <span>

            ❤️ ${item.likes||0}

            </span>

        </div>

        <div class="wishMessage">

            ${item.message||"-"}

        </div>

        <div class="wishFooter">

            <small>

            ${formatDate(item.createdAt)}

            </small>

        </div>

        <div class="wishAction">

            <button

            class="deleteWish"

            data-id="${item.id}">

            🗑 Delete

            </button>

        </div>

        `;

        wishList.appendChild(card);

    });

    bindWishButton();

}


/* ==========================================================
   SEARCH WISH
========================================================== */

searchWish.addEventListener(

"input",

()=>{

    const keyword=

    searchWish.value

    .trim()

    .toLowerCase();

    const result=

    wishData.filter(item=>{

        return(

            (item.name||"")

            .toLowerCase()

            .includes(keyword)

            ||

            (item.message||"")

            .toLowerCase()

            .includes(keyword)

        );

    });

    renderWish(result);

});


/* ==========================================================
   DELETE WISH
========================================================== */

function bindWishButton(){

    document

    .querySelectorAll(".deleteWish")

    .forEach(btn=>{

        btn.onclick=()=>{

            removeWish(

                btn.dataset.id

            );

        };

    });

}


async function removeWish(id){

    const confirmDelete=

    confirm(

        "Padam ucapan ini?"

    );

    if(!confirmDelete) return;

    await deleteDoc(

        doc(

            db,

            "wishes",

            id

        )

    );

}

console.log("✅ ADMIN V3 PART 6 READY");

/* ==========================================================
   SETTINGS
========================================================== */

async function loadSettings(){

    const snap=await getDoc(settingsRef);

    if(!snap.exists()) return;

    settingsData=snap.data();

    groomName.value=settingsData.groomName||"";

    brideName.value=settingsData.brideName||"";

    weddingDate.value=settingsData.weddingDate||"";

    weddingTime.value=settingsData.weddingTime||"";

    address.value=settingsData.address||"";

    phone.value=settingsData.phone||"";

    whatsapp.value=settingsData.whatsapp||"";

    maps.value=settingsData.maps||"";

    waze.value=settingsData.waze||"";

    music.value=settingsData.music||"";

    rsvpOpen.checked=settingsData.rsvpOpen??true;

    momentOpen.checked=settingsData.momentOpen??true;

    wishOpen.checked=settingsData.wishOpen??true;

    if(settingsData.coverImage){

        coverPreview.src=settingsData.coverImage;

    }

}

loadSettings();


/* ==========================================================
   SAVE SETTINGS
========================================================== */

saveSettings.onclick=async()=>{

    await updateDoc(

        settingsRef,

        {

            groomName:groomName.value.trim(),

            brideName:brideName.value.trim(),

            weddingDate:weddingDate.value,

            weddingTime:weddingTime.value,

            address:address.value.trim(),

            phone:phone.value.trim(),

            whatsapp:whatsapp.value.trim(),

            maps:maps.value.trim(),

            waze:waze.value.trim(),

            music:music.value.trim(),

            rsvpOpen:rsvpOpen.checked,

            momentOpen:momentOpen.checked,

            wishOpen:wishOpen.checked

        }

    );

    alert("Settings berjaya disimpan");

};


/* ==========================================================
   COVER PREVIEW
========================================================== */

coverUpload.onchange=()=>{

    const file=

    coverUpload.files[0];

    if(!file) return;

    coverPreview.src=

    URL.createObjectURL(file);

};


/* ==========================================================
   MEDIA
========================================================== */

function renderMedia(){

    pageMediaList.innerHTML="";

    for(let i=1;i<=10;i++){

        const card=

        document.createElement("div");

        card.className="mediaItem";

        card.innerHTML=`

        <h4>

        Page ${i}

        </h4>

        <img

        src="images/page${i}.webp"

        class="mediaPreview"

        onerror="this.style.display='none'">

        `;

        pageMediaList.appendChild(card);

    }

}

renderMedia();

console.log("✅ ADMIN V3 PART 7 READY");

/* ==========================================================
   IMAGE UPLOAD
========================================================== */

uploadCover.onclick=()=>{

    if(!coverUpload.files.length){

        alert("Sila pilih gambar.");

        return;

    }

    alert(
        "Upload Cover akan disambungkan dengan Cloudinary pada V3.1"
    );

};


/* ==========================================================
   REFRESH UI
========================================================== */

function refreshAll(){

    updateDashboard();

    renderRsvp();

    renderMoment();

    renderWish();

    renderMedia();

}


/* ==========================================================
   ESC CLOSE MODAL
========================================================== */

document.addEventListener(

"keydown",

event=>{

    if(event.key==="Escape"){

        imageModal.style.display="none";

        editModal.style.display="none";

    }

});


/* ==========================================================
   PREVIEW IMAGE
========================================================== */

previewImage.draggable=false;


/* ==========================================================
   WINDOW LOAD
========================================================== */

window.addEventListener(

"load",

()=>{

    openPage("dashboard");

    refreshAll();

});


/* ==========================================================
   VERSION
========================================================== */

console.log(
"%cBY-SANN ADMIN V3 STABLE",
"color:#2563eb;font-size:16px;font-weight:bold;"
);

console.log("Version : 3.0.0");

console.log("Dashboard : READY");

console.log("RSVP : READY");

console.log("Moment : READY");

console.log("Wish : READY");

console.log("Settings : READY");

console.log("Media : READY");

console.log("Logout : READY");

console.log("Firebase : CONNECTED");

console.log("✔ ADMIN LOADED");