/* ============================================================
   ملف tools.js
   يحتوي على الأدوات الأساسية الخاصة بـ PDF
   جميع الأدوات تعمل داخل المتصفح بدون أي اتصال خارجي
============================================================ */

/* ===========================
   دمج ملفات PDF
=========================== */
function loadMergePDF() {
    document.getElementById("toolContent").innerHTML = `
        <h2>دمج ملفات PDF</h2>
        <input type="file" id="mergeFiles" multiple accept="application/pdf">
        <button onclick="mergePDF()">دمج الملفات</button>
        <div id="mergeResult"></div>
    `;
}

function mergePDF() {
    const files = document.getElementById("mergeFiles").files;
    if (files.length < 2) {
        alert("يجب اختيار ملفين PDF على الأقل.");
        return;
    }

    document.getElementById("mergeResult").innerHTML = `
        <p>سيتم إضافة دمج PDF لاحقًا (يعمل داخل المتصفح فقط).</p>
    `;
}

/* ===========================
   ضغط PDF
=========================== */
function loadCompressPDF() {
    document.getElementById("toolContent").innerHTML = `
        <h2>ضغط ملف PDF</h2>
        <input type="file" id="compressFile" accept="application/pdf">
        <button onclick="compressPDF()">ضغط الملف</button>
        <div id="compressResult"></div>
    `;
}

function compressPDF() {
    document.getElementById("compressResult").innerHTML = `
        <p>ميزة ضغط PDF سيتم إضافتها لاحقًا.</p>
    `;
}

/* ===========================
   تحويل PDF إلى صور
=========================== */
function loadPDFtoIMG() {
    document.getElementById("toolContent").innerHTML = `
        <h2>تحويل PDF إلى صور</h2>
        <input type="file" id="pdfToImgFile" accept="application/pdf">
        <button onclick="convertPDFtoIMG()">تحويل</button>
        <div id="pdfToImgResult"></div>
    `;
}

function convertPDFtoIMG() {
    document.getElementById("pdfToImgResult").innerHTML = `
        <p>ميزة تحويل PDF إلى صور سيتم إضافتها لاحقًا.</p>
    `;
}

/* ===========================
   تحويل الصور إلى PDF
=========================== */
function loadIMGtoPDF() {
    document.getElementById("toolContent").innerHTML = `
        <h2>تحويل الصور إلى PDF</h2>
        <input type="file" id="imgToPdfFiles" multiple accept="image/*">
        <button onclick="convertIMGtoPDF()">تحويل</button>
        <div id="imgToPdfResult"></div>
    `;
}

function convertIMGtoPDF() {
    document.getElementById("imgToPdfResult").innerHTML = `
        <p>ميزة تحويل الصور إلى PDF سيتم إضافتها لاحقًا.</p>
    `;
}

/* ============================================================
   ربط الأدوات مع openTool() في main.js
============================================================ */
function openTool(toolName) {
    const modal = document.getElementById("toolModal");
    const content = document.getElementById("toolContent");

    modal.style.display = "block";

    switch (toolName) {
        case "merge":
            loadMergePDF();
            break;

        case "split":
            content.innerHTML = "<h2>تقسيم PDF</h2><p>سيتم إضافة الأداة لاحقًا.</p>";
            break;

        case "compress":
            loadCompressPDF();
            break;

        case "pdf-to-img":
            loadPDFtoIMG();
            break;

        case "img-to-pdf":
            loadIMGtoPDF();
            break;

        default:
            content.innerHTML = "<p>الأداة غير موجودة.</p>";
    }
}
