import{

auth,

onAuthStateChanged,

signOut

}

from "./firebase.js";

onAuthStateChanged(

auth,

user=>{

if(!user){

location.href="login.html";

}

}
);

/* ==========================================================
   FIREBASE
========================================================== */

import{

    db,

    collection,

    onSnapshot,

    deleteDoc,

    doc,
  
    getDoc,
  
    setDoc,
  
    updateDoc,
  
}

from "./firebase.js";

/* ==========================================================
   ELEMENT
========================================================== */

const pageTitle =

document.getElementById("pageTitle");

const menuButtons =

document.querySelectorAll(".menuBtn");

const pages =

document.querySelectorAll(".pageContent");

const totalRsvp =

document.getElementById("totalRsvp");

const totalMoment =

document.getElementById("totalMoment");

const totalWish =

document.getElementById("totalWish");

const rsvpList =
document.getElementById("rsvpList");

const searchRsvp =
document.getElementById("searchRsvp");

const momentList =

document.getElementById("momentList");

const searchMoment =

document.getElementById("searchMoment");

const wishList =
document.getElementById("wishList");

const searchWish =
document.getElementById("searchWish");

const exportExcelBtn =
document.getElementById("exportExcelBtn");

const editModal =
document.getElementById("editModal");

const editName =
document.getElementById("editName");

const editPhone =
document.getElementById("editPhone");

const editAttendance =
document.getElementById("editAttendance");

const editGuest =
document.getElementById("editGuest");

const saveEditBtn =
document.getElementById("saveEditBtn");

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

let editingId = "";

const coverUpload =
document.getElementById("coverUpload");

let coverFile = null;

const coverPreview =
document.getElementById("coverPreview");

const uploadCover =
document.getElementById("uploadCover");

const pageMediaList =
document.getElementById("pageMediaList");

for(let i=1;i<=10;i++){

pageMediaList.innerHTML+=`

<div class="pageMedia">

<span>

Page ${i}

</span>

<button
onclick="uploadPage(${i})">

Upload

</button>

</div>

`;

}

let selectedPage = null;
let selectedFile = null;

/* ==========================================================
   SIDEBAR
========================================================== */

menuButtons.forEach(button=>{

    button.addEventListener(

        "click",

        ()=>{

            menuButtons.forEach(

                btn=>btn.classList.remove("active")

            );

            button.classList.add("active");

            const page =

            button.dataset.page;

            pageTitle.textContent =

            button.textContent.trim();

            pages.forEach(

                section=>section.classList.add("hidden")

            );

            document

            .getElementById(

                page+"Page"

            )

            .classList

            .remove("hidden");

        }

    );

});

/* ==========================================================
   COLLECTION
========================================================== */

const rsvpRef =

collection(db,"rsvps");

const momentRef =

collection(db,"moments");

const wishRef =

collection(db,"wishes");

/* ==========================================================
   STATISTIC
========================================================== */

onSnapshot(

    rsvpRef,

    snapshot=>{

        totalRsvp.textContent =

        snapshot.size;

    }

);

onSnapshot(

    momentRef,

    snapshot=>{

        totalMoment.textContent =

        snapshot.size;

    }

);

onSnapshot(

    wishRef,

    snapshot=>{

        totalWish.textContent =

        snapshot.size;

    }

);

/* ==========================================================
   RSVP LIST
========================================================== */

let allRsvp=[];

onSnapshot(

    rsvpRef,

    snapshot=>{

        allRsvp=[];

        snapshot.forEach(docItem=>{

            allRsvp.push({

                id:docItem.id,

                ...docItem.data()

            });

        });

        renderRsvp();

    }

);

function renderRsvp(){

    const keyword=

    searchRsvp.value.toLowerCase();

    rsvpList.innerHTML="";

    allRsvp

    .filter(item=>

        item.name

        .toLowerCase()

        .includes(keyword)

    )

    .forEach(item=>{

        rsvpList.innerHTML+=`

<div class="adminCard">

<div class="adminInfo">

<h3>

${item.name}

</h3>

<p>

📞 ${item.phone}

</p>

<p>

${item.attendance}

</p>

<p>

👥 ${item.guest}

</p>

</div>

<div
style="display:flex;gap:10px;">

<button

onclick="editRsvp('${item.id}')">

✏️

</button>

<button

class="deleteBtn"

onclick="deleteRsvp('${item.id}')">

Padam

</button>

</div>

</div>

`;

    });

}

searchRsvp

.addEventListener(

"input",

renderRsvp

);

window.deleteRsvp = async (id) => {

    if (!confirm("Padam RSVP ini?")) return;

    await deleteDoc(
        doc(
            db,
            "rsvps",
            id
        )
    );

};

/* ==========================================================
   MOMENT LIST
========================================================== */

let allMoment=[];

onSnapshot(

    momentRef,

    snapshot=>{

        allMoment=[];

        snapshot.forEach(docItem=>{

            allMoment.push({

                id:docItem.id,

                ...docItem.data()

            });

        });

        renderMoment();

    }

);

function renderMoment(){

    const keyword=

    searchMoment.value.toLowerCase();

    momentList.innerHTML="";

    allMoment

    .filter(item=>

        (item.imageUrl||"")

        .toLowerCase()

        .includes(keyword)

    )

    .forEach(item=>{

        momentList.innerHTML+=`

<div class="momentCard">

<img

src="${item.imageUrl}"

onclick="previewMoment('${item.imageUrl}')"

<div class="momentBody">

<p>

❤️ ${item.likes||0}

</p>

<button

class="momentDelete"

onclick="deleteMoment('${item.id}')">

Padam

</button>

</div>

</div>

`;

    });

}

searchMoment

.addEventListener(

"input",

renderMoment

);

window.deleteMoment=

async(id)=>{

if(

confirm(

"Padam gambar ini?"

)

){

await deleteDoc(

doc(

db,

"moments",

id

)

);

}

};

/* ==========================================================
   WISH LIST
========================================================== */

let allWish=[];

onSnapshot(

    wishRef,

    snapshot=>{

        allWish=[];

        snapshot.forEach(docItem=>{

            allWish.push({

                id:docItem.id,

                ...docItem.data()

            });

        });

        renderWish();

    }

);

function renderWish(){

    const keyword=

    searchWish.value.toLowerCase();

    wishList.innerHTML="";

    allWish

    .filter(item=>

        (item.name||"")

        .toLowerCase()

        .includes(keyword)

    )

    .forEach(item=>{

        wishList.innerHTML+=`

<div class="wishAdminCard">

<div class="wishTop">

<h3>

${item.name}

</h3>

<span class="wishDate">

${item.createdAt || "-"}

</span>

</div>

<div class="wishMessage">

${item.message}

</div>

<div class="wishFooter">

<span class="wishLike">

❤️ ${item.likes || 0}

</span>

<button

class="deleteBtn"

onclick="deleteWish('${item.id}')">

Padam

</button>

</div>

</div>

`;

    });

}

searchWish.addEventListener(

"input",

renderWish

);

window.deleteWish=

async(id)=>{

if(

confirm(

"Padam ucapan ini?"

)

){

await deleteDoc(

doc(

db,

"wishes",

id

)

);

}

};

document
.getElementById("logoutBtn")
.addEventListener("click",async()=>{

    await signOut(auth);

    location.href="login.html";

});

/* ==========================================================
   EXPORT EXCEL
========================================================== */

exportExcelBtn.addEventListener(

    "click",

    ()=>{

        const data = allRsvp.map(item=>({

            Nama:item.name || "",

            Telefon:item.phone || "",

            Kehadiran:item.attendance || "",

            Tetamu:item.guest || 0,

            Ucapan:item.wish || "",

            Tarikh:item.createdAt || ""

        }));

        const workbook =

        XLSX.utils.book_new();

        const worksheet =

        XLSX.utils.json_to_sheet(data);

        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            "RSVP"

        );

        XLSX.writeFile(

            workbook,

            "RSVP.xlsx"

        );

    }

);

const imageModal=

document.getElementById(

"imageModal"

);

const previewImage=

document.getElementById(

"previewImage"

);

const closeImageModal=

document.getElementById(

"closeImageModal"

);

window.previewMoment=(url)=>{

previewImage.src=url;

imageModal.classList.add("show");

};

closeImageModal.onclick=()=>{

imageModal.classList.remove("show");

};

imageModal.onclick=(e)=>{

if(e.target===imageModal){

imageModal.classList.remove("show");

}

};

window.editRsvp=(id)=>{

const item=

allRsvp.find(

r=>r.id===id

);

editingId=id;

editName.value=item.name;

editPhone.value=item.phone;

editAttendance.value=item.attendance;

editGuest.value=item.guest;

editModal.classList.add("show");

};

saveEditBtn.onclick=

async()=>{

await updateDoc(

doc(

db,

"rsvps",

editingId

),

{

name:editName.value,

phone:editPhone.value,

attendance:editAttendance.value,

guest:Number(editGuest.value)

}

);

editModal.classList.remove("show");

};

editModal.onclick=(e)=>{

if(e.target===editModal){

editModal.classList.remove("show");

}

};

/* ==========================================================
   SETTINGS
========================================================== */

async function loadSettings(){

    const snap = await getDoc(

        doc(db,"settings","config")

    );

    if(!snap.exists()) return;

    const data = snap.data();

    groomName.value = data.groomName || "";

    brideName.value = data.brideName || "";

    weddingDate.value = data.weddingDate || "";

    weddingTime.value = data.weddingTime || "";

    address.value = data.address || "";

    phone.value = data.phone || "";

    whatsapp.value = data.whatsapp || "";

    maps.value = data.maps || "";

    waze.value = data.waze || "";

    music.value = data.music || "";

    rsvpOpen.checked = data.rsvpOpen;

    momentOpen.checked = data.momentOpen;

    wishOpen.checked = data.wishOpen;

}

loadSettings();

saveSettings.addEventListener(

"click",

async()=>{

await updateDoc(

doc(db,"settings","config"),

{

groomName:groomName.value,

brideName:brideName.value,

weddingDate:weddingDate.value,

weddingTime:weddingTime.value,

address:address.value,

phone:phone.value,

whatsapp:whatsapp.value,

maps:maps.value,

waze:waze.value,

music:music.value,

rsvpOpen:rsvpOpen.checked,

momentOpen:momentOpen.checked,

wishOpen:wishOpen.checked

}

);

alert("Settings berjaya disimpan.");

});

/* ==========================================================
   PREVIEW IMAGE
========================================================== */

coverUpload.addEventListener("change",(e)=>{

    coverFile = e.target.files[0];

    if(!coverFile) return;

    coverPreview.src = URL.createObjectURL(coverFile);

    coverPreview.style.display = "block";

});

uploadCover.addEventListener(

"click",

async()=>{

if(!coverFile){

alert(

"Sila pilih gambar dahulu."

);

return;

}

try{

const formData =

new FormData();

formData.append(

"file",

coverFile

);

formData.append(

"upload_preset",

"bysann_cover"

);

const response =

await fetch(

"https://api.cloudinary.com/v1_1/onarqwtu/image/upload",

{

method:"POST",

body:formData

}

);

const result =

await response.json();

await updateDoc(

doc(

db,

"settings",

"config"

),

{

coverImage:

result.secure_url

}

);

alert(

"Cover berjaya dikemaskini."

);

}

catch(error){

console.error(error);

alert(

"Upload cover gagal."

);

}

});

window.uploadPage = function(page){

    selectedPage = page;

    const input = document.createElement("input");

    input.type = "file";

    input.accept = "image/*";

    input.onchange = (e)=>{

        selectedFile = e.target.files[0];

        if(selectedFile){

            uploadSelectedPage();

        }

    };

    input.click();

}

async function uploadSelectedPage(){

    if(!selectedFile) return;

    try{

        const formData = new FormData();

        formData.append(
            "file",
            selectedFile
        );

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

        await updateDoc(

            doc(db,"settings","config"),

            {

                [`pageImages.page${selectedPage}`]:

                result.secure_url

            }

        );

        alert(

            `Page ${selectedPage} berjaya dikemaskini.`

        );

    }

    catch(error){

        console.log(error);

        alert("Upload gagal.");

    }

}