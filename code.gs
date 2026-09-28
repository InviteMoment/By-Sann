/*
==========================================================
BY-SANN WEDDING
GOOGLE DRIVE EXPORT + WISH BOOK
Google Apps Script
==========================================================

FUNGSI:
1. Export semua Momen ke Google Drive
2. Buat Buku Ucapan dalam bentuk PDF
3. Folder utama Google Drive:
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
   GET
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
   POST
========================================================== */

function doPost(e) {

    try {

        let payload = null;


        /* --------------------------------------------------
           CARA 1
           JSON body daripada admin.js
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
           CARA 2
           Fallback untuk parameter payload
        -------------------------------------------------- */

        if (
            !payload &&
            e &&
            e.parameter &&
            e.parameter.payload
        ) {

            payload =
                JSON.parse(
                    e.parameter.payload
                );

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


        /* --------------------------------------------------
           EXPORT MOMENTS
        -------------------------------------------------- */

        if (
            payload.action ===
            "exportMoments"
        ) {

            return exportMoments(
                payload.moments || []
            );

        }


        /* --------------------------------------------------
           CREATE WISH BOOK
        -------------------------------------------------- */

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


        return jsonResponse({

            success: false,

            message:
                "Action tidak dikenali."

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
   EXPORT MOMENTS
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
           CREATE EXPORT FOLDER
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
           DOWNLOAD SETIAP GAMBAR
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


                    /* --------------------------------------------------
                       NAMA UPLOADER
                    -------------------------------------------------- */

                    const uploader =
                        item.uploader ||
                        item.name ||
                        "Tetamu";


                    const safeUploader =
                        safeFileName(
                            uploader
                        );


                    /* --------------------------------------------------
                       EXTENSION
                    -------------------------------------------------- */

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
   CREATE WISH BOOK
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


        /* --------------------------------------------------
           TIMESTAMP
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


        /* --------------------------------------------------
           PAGE SIZE
        -------------------------------------------------- */

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


        body.appendParagraph(
            ""
        );


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


        body.appendParagraph(
            ""
        );

        body.appendParagraph(
            ""
        );


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


                /* --------------------------------------------------
                   PAGE NUMBER
                -------------------------------------------------- */

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


                body.appendParagraph(
                    ""
                );


                /* --------------------------------------------------
                   NAME
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
                    .setFontSize(20)
                    .setBold(true);


                body.appendParagraph(
                    ""
                );


                /* --------------------------------------------------
                   MESSAGE
                -------------------------------------------------- */

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


                body.appendParagraph(
                    ""
                );


                /* --------------------------------------------------
                   LIKE
                -------------------------------------------------- */

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


                /* --------------------------------------------------
                   DATE
                -------------------------------------------------- */

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


                /* --------------------------------------------------
                   SEPARATOR
                -------------------------------------------------- */

                if (
                    index <
                    wishes.length - 1
                ) {

                    body.appendPageBreak();

                }

            }
        );


        /* --------------------------------------------------
           SAVE DOCUMENT
        -------------------------------------------------- */

        document.saveAndClose();


        /* ==================================================
           CONVERT GOOGLE DOC → PDF
        ================================================== */

        const docFile =
            DriveApp.getFileById(
                document.getId()
            );


        const pdfBlob =
            docFile
                .getAs(
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


        /* --------------------------------------------------
           MOVE GOOGLE DOC INTO TRASH
           Supaya Drive tidak penuh dengan
           Google Docs sementara.
        -------------------------------------------------- */

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