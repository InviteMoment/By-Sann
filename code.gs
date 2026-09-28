/*
==========================================================
BY-SANN WEDDING
GOOGLE DRIVE EXPORT + PDF BOOKS
Google Apps Script
==========================================================

FUNGSI:
1. Export semua Momen ke Google Drive
2. Buat Buku Ucapan dalam bentuk PDF
3. Buat Buku RSVP dalam bentuk PDF
4. Semua fail masuk ke folder Google Drive yang sama

FOLDER GOOGLE DRIVE:
1YG6hl0Am9Oiv2bnbieHqewBl9j2IWfFk

DEPLOY:
Execute as: Me
Who has access: Anyone
==========================================================
*/


/* ==========================================================
   GOOGLE DRIVE FOLDER
========================================================== */

const EXPORT_FOLDER_ID =
    "1YG6hl0Am9Oiv2bnbieHqewBl9j2IWfFk";


/* ==========================================================
   WEB APP - GET
========================================================== */

function doGet() {

    return ContentService
        .createTextOutput(
            JSON.stringify({
                success: true,
                message:
                    "By-Sann Google Drive API aktif."
            })
        )
        .setMimeType(
            ContentService.MimeType.JSON
        );

}


/* ==========================================================
   WEB APP - POST
========================================================== */

function doPost(e) {

    try {

        let payload = null;


        /* --------------------------------------------------
           BACA JSON BODY DARIPADA admin.js
        -------------------------------------------------- */

        if (
            e &&
            e.postData &&
            e.postData.contents
        ) {

            const raw =
                e.postData.contents.trim();


            if (raw) {

                try {

                    payload =
                        JSON.parse(raw);

                }

                catch (error) {

                    payload = null;

                }

            }

        }


        /* --------------------------------------------------
           FALLBACK: PARAMETER payload
        -------------------------------------------------- */

        if (
            !payload &&
            e &&
            e.parameter &&
            e.parameter.payload
        ) {

            try {

                payload =
                    JSON.parse(
                        e.parameter.payload
                    );

            }

            catch (error) {

                payload = null;

            }

        }


        /* --------------------------------------------------
           CHECK PAYLOAD
        -------------------------------------------------- */

        if (!payload) {

            return jsonResponse({

                success: false,

                message:
                    "Payload tidak diterima."

            });

        }


        /* ==================================================
           EXPORT MOMEN
        ================================================== */

        if (
            payload.action ===
            "exportMoments"
        ) {

            return exportMoments(
                payload.moments || []
            );

        }


        /* ==================================================
           BUKU UCAPAN
        ================================================== */

        if (
            payload.action ===
            "createWishBook"
        ) {

            return createWishBook(
                payload.wishes || [],

                payload.title ||
                    "Atikah & Hafiezul",

                payload.subtitle ||
                    "Koleksi Ucapan Tetamu"
            );

        }


        /* ==================================================
           BUKU RSVP
        ================================================== */

        if (
            payload.action ===
            "createRsvpBook"
        ) {

            return createRsvpBook(

                payload.rsvps || [],

                payload.title ||
                    "Atikah & Hafiezul",

                payload.subtitle ||
                    "Senarai RSVP Tetamu"

            );

        }


        /* --------------------------------------------------
           ACTION TIDAK DIKENALI
        -------------------------------------------------- */

        return jsonResponse({

            success: false,

            message:
                "Action tidak dikenali: " +
                (
                    payload.action ||
                    "undefined"
                )

        });

    }

    catch (error) {

        return jsonResponse({

            success: false,

            message:
                error.message ||
                "Server error."

        });

    }

}


/* ==========================================================
   EXPORT MOMEN KE GOOGLE DRIVE
========================================================== */

function exportMoments(
    moments
) {

    try {

        if (
            !Array.isArray(moments) ||
            moments.length === 0
        ) {

            return jsonResponse({

                success: false,

                message:
                    "Tiada gambar Momen untuk diexport."

            });

        }


        const parentFolder =
            DriveApp.getFolderById(
                EXPORT_FOLDER_ID
            );


        /* --------------------------------------------------
           CREATE FOLDER EXPORT
        -------------------------------------------------- */

        const timeZone =
            Session.getScriptTimeZone() ||
            "Asia/Kuala_Lumpur";


        const stamp =
            Utilities.formatDate(
                new Date(),
                timeZone,
                "yyyy-MM-dd_HH-mm-ss"
            );


        const exportFolder =
            parentFolder.createFolder(
                "Export Momen - " +
                stamp
            );


        let successCount = 0;

        let failedCount = 0;


        /* --------------------------------------------------
           DOWNLOAD GAMBAR
        -------------------------------------------------- */

        moments.forEach(
            function (
                item,
                index
            ) {

                try {

                    if (
                        !item ||
                        !item.imageUrl
                    ) {

                        failedCount++;

                        return;

                    }


                    const response =
                        UrlFetchApp.fetch(
                            item.imageUrl,
                            {

                                muteHttpExceptions:
                                    true,

                                followRedirects:
                                    true

                            }
                        );


                    const status =
                        response
                            .getResponseCode();


                    if (
                        status < 200 ||
                        status >= 300
                    ) {

                        failedCount++;

                        return;

                    }


                    const blob =
                        response.getBlob();


                    const uploader =
                        item.uploader ||
                        item.name ||
                        "Tetamu";


                    const safeUploader =
                        safeFileName(
                            uploader
                        );


                    const extension =
                        getExtension(
                            item.imageUrl,
                            blob.getContentType()
                        );


                    const fileName =
                        String(
                            index + 1
                        )
                            .padStart(
                                3,
                                "0"
                            )
                        +
                        "-"
                        +
                        safeUploader
                        +
                        extension;


                    blob.setName(
                        fileName
                    );


                    exportFolder.createFile(
                        blob
                    );


                    successCount++;

                }

                catch (error) {

                    failedCount++;

                    console.log(
                        "Momen error: " +
                        error.message
                    );

                }

            }
        );


        return jsonResponse({

            success: true,

            message:
                "Export Momen selesai.",

            count:
                successCount,

            failed:
                failedCount,

            folderUrl:
                exportFolder.getUrl()

        });

    }

    catch (error) {

        return jsonResponse({

            success: false,

            message:
                error.message ||
                "Export Momen gagal."

        });

    }

}


/* ==========================================================
   BUKU UCAPAN
========================================================== */

function createWishBook(
    wishes,
    title,
    subtitle
) {

    try {

        if (
            !Array.isArray(wishes) ||
            wishes.length === 0
        ) {

            return jsonResponse({

                success: false,

                message:
                    "Tiada ucapan untuk dibuat buku."

            });

        }


        const parentFolder =
            DriveApp.getFolderById(
                EXPORT_FOLDER_ID
            );


        const timeZone =
            Session.getScriptTimeZone() ||
            "Asia/Kuala_Lumpur";


        /* --------------------------------------------------
           CREATE GOOGLE DOC
        -------------------------------------------------- */

        const document =
            DocumentApp.create(
                "Koleksi Ucapan - " +
                title
            );


        const body =
            document.getBody();


        body.clear();


        body.setMarginTop(50);

        body.setMarginBottom(50);

        body.setMarginLeft(55);

        body.setMarginRight(55);


        /* ==================================================
           COVER
        ================================================== */

        const coverTitle =
            body.appendParagraph(
                title
            );


        coverTitle
            .setAlignment(
                DocumentApp.HorizontalAlignment
                    .CENTER
            )
            .setFontSize(28)
            .setBold(true);


        body.appendParagraph("");


        const coverSubtitle =
            body.appendParagraph(
                subtitle
            );


        coverSubtitle
            .setAlignment(
                DocumentApp.HorizontalAlignment
                    .CENTER
            )
            .setFontSize(16);


        body.appendParagraph("");

        body.appendParagraph("");


        const coverDate =
            body.appendParagraph(
                Utilities.formatDate(
                    new Date(),
                    timeZone,
                    "dd MMMM yyyy"
                )
            );


        coverDate
            .setAlignment(
                DocumentApp.HorizontalAlignment
                    .CENTER
            )
            .setFontSize(12);


        body.appendPageBreak();


        /* ==================================================
           UCAPAN
        ================================================== */

        wishes.forEach(
            function (
                wish,
                index
            ) {

                const name =
                    wish.name ||
                    "Tetamu";


                const message =
                    wish.message ||
                    "";


                const likes =
                    Number(
                        wish.likes || 0
                    );


                const date =
                    wish.date ||
                    "";


                const number =
                    body.appendParagraph(
                        "UCAPAN " +
                        String(
                            index + 1
                        )
                    );


                number
                    .setAlignment(
                        DocumentApp.HorizontalAlignment
                            .CENTER
                    )
                    .setFontSize(11)
                    .setBold(true);


                body.appendParagraph("");


                const guestName =
                    body.appendParagraph(
                        name
                    );


                guestName
                    .setAlignment(
                        DocumentApp.HorizontalAlignment
                            .CENTER
                    )
                    .setFontSize(20)
                    .setBold(true);


                body.appendParagraph("");


                const quote =
                    body.appendParagraph(
                        "“" +
                        message +
                        "”"
                    );


                quote
                    .setAlignment(
                        DocumentApp.HorizontalAlignment
                            .CENTER
                    )
                    .setFontSize(14)
                    .setItalic(true);


                body.appendParagraph("");


                const likeText =
                    body.appendParagraph(
                        "❤️  " +
                        likes +
                        " likes"
                    );


                likeText
                    .setAlignment(
                        DocumentApp.HorizontalAlignment
                            .CENTER
                    )
                    .setFontSize(11);


                if (date) {

                    const dateText =
                        body.appendParagraph(
                            date
                        );


                    dateText
                        .setAlignment(
                            DocumentApp.HorizontalAlignment
                                .CENTER
                        )
                        .setFontSize(10);

                }


                if (
                    index <
                    wishes.length - 1
                ) {

                    body.appendPageBreak();

                }

            }
        );


        document.saveAndClose();


        /* --------------------------------------------------
           CONVERT DOC → PDF
        -------------------------------------------------- */

        const docFile =
            DriveApp.getFileById(
                document.getId()
            );


        const pdfBlob =
            docFile.getAs(
                MimeType.PDF
            );


        pdfBlob.setName(
            "Koleksi-Ucapan-" +
            safeFileName(title) +
            ".pdf"
        );


        const pdfFile =
            parentFolder.createFile(
                pdfBlob
            );


        docFile.setTrashed(
            true
        );


        return jsonResponse({

            success: true,

            message:
                "Buku Ucapan berjaya dibuat.",

            count:
                wishes.length,

            url:
                pdfFile.getUrl(),

            fileId:
                pdfFile.getId(),

            fileName:
                pdfFile.getName()

        });

    }

    catch (error) {

        return jsonResponse({

            success: false,

            message:
                error.message ||
                "Buku Ucapan gagal dibuat."

        });

    }

}


/* ==========================================================
   BUKU RSVP
========================================================== */

function createRsvpBook(
    rsvps,
    title,
    subtitle
) {

    try {

        if (
            !Array.isArray(rsvps) ||
            rsvps.length === 0
        ) {

            return jsonResponse({

                success: false,

                message:
                    "Tiada RSVP untuk dibuat buku."

            });

        }


        const parentFolder =
            DriveApp.getFolderById(
                EXPORT_FOLDER_ID
            );


        const timeZone =
            Session.getScriptTimeZone() ||
            "Asia/Kuala_Lumpur";


        /* --------------------------------------------------
           CREATE GOOGLE DOC
        -------------------------------------------------- */

        const document =
            DocumentApp.create(
                "Koleksi RSVP - " +
                title
            );


        const body =
            document.getBody();


        body.clear();


        body.setMarginTop(50);

        body.setMarginBottom(50);

        body.setMarginLeft(55);

        body.setMarginRight(55);


        /* ==================================================
           COVER
        ================================================== */

        const coverTitle =
            body.appendParagraph(
                title
            );


        coverTitle
            .setAlignment(
                DocumentApp.HorizontalAlignment
                    .CENTER
            )
            .setFontSize(28)
            .setBold(true);


        body.appendParagraph("");


        const coverSubtitle =
            body.appendParagraph(
                subtitle
            );


        coverSubtitle
            .setAlignment(
                DocumentApp.HorizontalAlignment
                    .CENTER
            )
            .setFontSize(17)
            .setBold(true);


        body.appendParagraph("");

        body.appendParagraph("");


        const totalText =
            body.appendParagraph(
                "Jumlah RSVP: " +
                rsvps.length
            );


        totalText
            .setAlignment(
                DocumentApp.HorizontalAlignment
                    .CENTER
            )
            .setFontSize(13);


        body.appendParagraph("");


        const coverDate =
            body.appendParagraph(
                Utilities.formatDate(
                    new Date(),
                    timeZone,
                    "dd MMMM yyyy"
                )
            );


        coverDate
            .setAlignment(
                DocumentApp.HorizontalAlignment
                    .CENTER
            )
            .setFontSize(11);


        body.appendPageBreak();


        /* ==================================================
           RSVP RECORD
        ================================================== */

        rsvps.forEach(
            function (
                rsvp,
                index
            ) {

                const name =
                    rsvp.name ||
                    "Tetamu";


                const phone =
                    rsvp.phone ||
                    "-";


                const attendance =
                    rsvp.attendance ||
                    "-";


                const guest =
                    Number(
                        rsvp.guest || 0
                    );


                const date =
                    rsvp.date ||
                    "";


                /* --------------------------------------------------
                   TAJUK
                -------------------------------------------------- */

                const number =
                    body.appendParagraph(
                        "RSVP " +
                        String(
                            index + 1
                        )
                    );


                number
                    .setAlignment(
                        DocumentApp.HorizontalAlignment
                            .CENTER
                    )
                    .setFontSize(12)
                    .setBold(true);


                body.appendParagraph("");


                /* --------------------------------------------------
                   NAMA
                -------------------------------------------------- */

                const guestName =
                    body.appendParagraph(
                        name
                    );


                guestName
                    .setAlignment(
                        DocumentApp.HorizontalAlignment
                            .CENTER
                    )
                    .setFontSize(22)
                    .setBold(true);


                body.appendParagraph("");


                /* --------------------------------------------------
                   MAKLUMAT RSVP
                -------------------------------------------------- */

                const infoTable =
                    body.appendTable();


                infoTable
                    .setBorderWidth(1);


                addRsvpRow(
                    infoTable,
                    "No. Telefon",
                    phone
                );


                addRsvpRow(
                    infoTable,
                    "Kehadiran",
                    attendance
                );


                addRsvpRow(
                    infoTable,
                    "Bilangan Tetamu",
                    String(
                        guest
                    ) +
                    " orang"
                );


                if (date) {

                    addRsvpRow(
                        infoTable,
                        "Tarikh RSVP",
                        date
                    );

                }


                body.appendParagraph("");

                body.appendParagraph("");


                /* --------------------------------------------------
                   PAGE BREAK
                -------------------------------------------------- */

                if (
                    index <
                    rsvps.length - 1
                ) {

                    body.appendPageBreak();

                }

            }
        );


        document.saveAndClose();


        /* ==================================================
           DOC → PDF
        ================================================== */

        const docFile =
            DriveApp.getFileById(
                document.getId()
            );


        const pdfBlob =
            docFile.getAs(
                MimeType.PDF
            );


        pdfBlob.setName(
            "Koleksi-RSVP-" +
            safeFileName(title) +
            ".pdf"
        );


        const pdfFile =
            parentFolder.createFile(
                pdfBlob
            );


        /* --------------------------------------------------
           PADAM DOC SEMENTARA
        -------------------------------------------------- */

        docFile.setTrashed(
            true
        );


        return jsonResponse({

            success: true,

            message:
                "Buku RSVP berjaya dibuat.",

            count:
                rsvps.length,

            url:
                pdfFile.getUrl(),

            fileId:
                pdfFile.getId(),

            fileName:
                pdfFile.getName()

        });

    }

    catch (error) {

        return jsonResponse({

            success: false,

            message:
                error.message ||
                "Buku RSVP gagal dibuat."

        });

    }

}


/* ==========================================================
   TAMBAH ROW DALAM TABLE RSVP
========================================================== */

function addRsvpRow(
    table,
    label,
    value
) {

    const row =
        table.appendTableRow();


    const labelCell =
        row.appendTableCell(
            label
        );


    const valueCell =
        row.appendTableCell(
            value
        );


    labelCell
        .setBackgroundColor(
            "#f5f5f5"
        );


    labelCell
        .getChild(0)
        .asParagraph()
        .setBold(true);


    valueCell
        .getChild(0)
        .asParagraph()
        .setBold(false);

}


/* ==========================================================
   FILE EXTENSION
========================================================== */

function getExtension(
    url,
    contentType
) {

    const cleanUrl =
        String(url)
            .split("?")[0]
            .split("#")[0];


    const match =
        cleanUrl.match(
            /\.([a-zA-Z0-9]{2,5})$/
        );


    if (match) {

        return (
            "." +
            match[1].toLowerCase()
        );

    }


    const map = {

        "image/jpeg":
            ".jpg",

        "image/jpg":
            ".jpg",

        "image/png":
            ".png",

        "image/webp":
            ".webp",

        "image/gif":
            ".gif",

        "image/heic":
            ".heic"

    };


    return (
        map[contentType] ||
        ".jpg"
    );

}


/* ==========================================================
   SAFE FILE NAME
========================================================== */

function safeFileName(
    name
) {

    return String(name)

        .replace(
            /[\\/:*?"<>|]/g,
            "-"
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim()

        .substring(
            0,
            80
        );

}


/* ==========================================================
   JSON RESPONSE
========================================================== */

function jsonResponse(
    data
) {

    return ContentService

        .createTextOutput(
            JSON.stringify(data)
        )

        .setMimeType(
            ContentService.MimeType.JSON
        );

}