/* ============================================================
   PDFKSA - tools.js
   جميع أدوات PDF والصور (هيكل موحد + أدوات أساسية شغالة)
============================================================ */

/* ================== عناصر عامة للمودال ================== */

function openToolModal(title, innerHtml) {
    const modal = document.getElementById("pdfModal");
    const content = document.getElementById("pdfToolContent");

    modal.style.display = "block";
    content.innerHTML = `
        <div style="padding: 20px;">
            <h2>${title}</h2>
            ${innerHtml}
        </div>
    `;
}

function closeToolModal() {
    const modal = document.getElementById("pdfModal");
    modal.style.display = "none";
}

/* ============================================================
   أدوات PDF
============================================================ */

/* ------------------ 1) دمج ملفات PDF ------------------ */

function openMergePDFTool() {
    openToolModal(
        "دمج ملفات PDF",
        `
        <p>قم برفع ملفين PDF أو أكثر وسيتم دمجها داخل المتصفح.</p>
        <input type="file" id="mergePdfFiles" accept="application/pdf" multiple>
        <br><br>
        <button onclick="mergePDF()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">دمج الملفات</button>
        <div id="mergeResult" style="margin-top:15px;"></div>
        `
    );
}

async function mergePDF() {
    const input = document.getElementById("mergePdfFiles");
    const files = input.files;

    if (!files.length || files.length < 2) {
        document.getElementById("mergeResult").innerText =
            "❌ الرجاء اختيار ملفين PDF على الأقل.";
        return;
    }

    const mergedPdf = await PDFLib.PDFDocument.create();

    for (let file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => mergedPdf.addPage(p));
    }

    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "merged.pdf";
    link.click();

    document.getElementById("mergeResult").innerText =
        "✔️ تم دمج الملفات بنجاح.";
}

/* ------------------ 2) تقسيم PDF ------------------ */

function openSplitPDFTool() {
    openToolModal(
        "تقسيم ملف PDF",
        `
        <p>اختر ملف PDF وحدد نطاق الصفحات المراد استخراجها.</p>
        <input type="file" id="splitPdfFile" accept="application/pdf">
        <br><br>
        <label>من صفحة: <input type="number" id="splitFrom" min="1" style="width:70px;"></label>
        <label>إلى صفحة: <input type="number" id="splitTo" min="1" style="width:70px;"></label>
        <br><br>
        <button onclick="splitPDF()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">تقسيم الملف</button>
        <div id="splitResult" style="margin-top:15px;"></div>
        `
    );
}

async function splitPDF() {
    const fileInput = document.getElementById("splitPdfFile");
    const fromInput = document.getElementById("splitFrom");
    const toInput = document.getElementById("splitTo");
    const result = document.getElementById("splitResult");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    const from = parseInt(fromInput.value, 10);
    const to = parseInt(toInput.value, 10);

    if (!from || !to || from > to) {
        result.innerText = "❌ الرجاء إدخال نطاق صفحات صحيح.";
        return;
    }

    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();

    if (from < 1 || to > totalPages) {
        result.innerText = `❌ عدد صفحات الملف ${totalPages}، تأكد من النطاق.`;
        return;
    }

    const newPdf = await PDFLib.PDFDocument.create();
    const indices = [];
    for (let i = from - 1; i <= to - 1; i++) indices.push(i);

    const pages = await newPdf.copyPages(pdf, indices);
    pages.forEach(p => newPdf.addPage(p));

    const newBytes = await newPdf.save();
    const blob = new Blob([newBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `split_${from}-${to}.pdf`;
    link.click();

    result.innerText = "✔️ تم استخراج الصفحات بنجاح.";
}

/* ------------------ 3) ضغط PDF (تقليل الحجم) ------------------ */

function openCompressPDFTool() {
    openToolModal(
        "ضغط ملف PDF",
        `
        <p>ضغط PDF يتم هنا بشكل مبسط عن طريق إعادة حفظ الصفحات.</p>
        <input type="file" id="compressPdfFile" accept="application/pdf">
        <br><br>
        <button onclick="compressPDF()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">ضغط الملف</button>
        <div id="compressResult" style="margin-top:15px;"></div>
        `
    );
}

async function compressPDF() {
    const input = document.getElementById("compressPdfFile");
    const result = document.getElementById("compressResult");

    if (!input.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    const arrayBuffer = await input.files[0].arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

    // ضغط بسيط: إعادة إنشاء الملف (بدون صور عالية الجودة)
    const newPdf = await PDFLib.PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(p => newPdf.addPage(p));

    const newBytes = await newPdf.save({ useObjectStreams: true });
    const blob = new Blob([newBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "compressed.pdf";
    link.click();

    result.innerText = "✔️ تم ضغط الملف (بشكل مبسط).";
}

/* ------------------ 4) تحويل الصور إلى PDF ------------------ */

function openImagesToPDFTool() {
    openToolModal(
        "تحويل الصور إلى PDF",
        `
        <p>اختر صورة أو أكثر وسيتم تحويلها إلى ملف PDF واحد.</p>
        <input type="file" id="imagesToPdfFiles" accept="image/*" multiple>
        <br><br>
        <button onclick="imagesToPDF()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">تحويل إلى PDF</button>
        <div id="imagesToPdfResult" style="margin-top:15px;"></div>
        `
    );
}

async function imagesToPDF() {
    const input = document.getElementById("imagesToPdfFiles");
    const result = document.getElementById("imagesToPdfResult");

    if (!input.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة واحدة على الأقل.";
        return;
    }

    const pdfDoc = await PDFLib.PDFDocument.create();

    for (let file of input.files) {
        const imgBytes = await file.arrayBuffer();
        let img;
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
            img = await pdfDoc.embedJpg(imgBytes);
        } else {
            img = await pdfDoc.embedPng(imgBytes);
        }

        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, {
            x: 0,
            y: 0,
            width: img.width,
            height: img.height
        });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "images-to-pdf.pdf";
    link.click();

    result.innerText = "✔️ تم تحويل الصور إلى PDF.";
}

/* ------------------ 5) تحويل PDF إلى صور (ملاحظة) ------------------ */
/* 
   ملاحظة: تحويل PDF إلى صور يحتاج إما:
   - مكتبة كبيرة مثل pdf.js + canvas
   أو
   - سيرفر يعالج الملف

   هنا نضع واجهة فقط ونوضح للمستخدم أن الميزة ستُضاف لاحقًا.
*/

function openPDFToImagesTool() {
    openToolModal(
        "تحويل PDF إلى صور",
        `
        <p>هذه الميزة تحتاج معالجة متقدمة (PDF إلى صور) وسيتم إضافتها لاحقًا.</p>
        <p>يمكنك الآن استخدام بقية أدوات PDF المتاحة.</p>
        `
    );
}

/* ============================================================
   أدوات الصور العامة (غير أداة أبشر)
============================================================ */

/* ------------------ 1) تغيير حجم الصورة ------------------ */

function openImageResizeTool() {
    openToolModal(
        "تغيير حجم الصورة",
        `
        <p>اختر صورة وحدد الأبعاد الجديدة.</p>
        <input type="file" id="resizeImageFile" accept="image/*">
        <br><br>
        <label>العرض: <input type="number" id="resizeWidth" style="width:80px;"></label>
        <label>الارتفاع: <input type="number" id="resizeHeight" style="width:80px;"></label>
        <br><br>
        <button onclick="resizeImage()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">تغيير الحجم</button>
        <div id="resizeImageResult" style="margin-top:15px;"></div>
        <canvas id="resizeCanvas" style="display:none;"></canvas>
        `
    );
}

function resizeImage() {
    const fileInput = document.getElementById("resizeImageFile");
    const wInput = document.getElementById("resizeWidth");
    const hInput = document.getElementById("resizeHeight");
    const result = document.getElementById("resizeImageResult");
    const canvas = document.getElementById("resizeCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    const width = parseInt(wInput.value, 10);
    const height = parseInt(hInput.value, 10);

    if (!width || !height) {
        result.innerText = "❌ الرجاء إدخال أبعاد صحيحة.";
        return;
    }

    const file = fileInput.files[0];
    const img = new Image();
    img.onload = function () {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "resized-image.png";
            link.click();
        }, "image/png");

        result.innerText = "✔️ تم تغيير حجم الصورة وحفظها.";
    };
    img.src = URL.createObjectURL(file);
}

/* ------------------ 2) ضغط الصور ------------------ */

function openImageCompressTool() {
    openToolModal(
        "ضغط الصورة",
        `
        <p>اختر صورة وحدد جودة الضغط (من 10 إلى 100).</p>
        <input type="file" id="compressImageFile" accept="image/*">
        <br><br>
        <label>الجودة: <input type="number" id="compressQuality" value="70" min="10" max="100" style="width:80px;"></label>
        <br><br>
        <button onclick="compressImage()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">ضغط الصورة</button>
        <div id="compressImageResult" style="margin-top:15px;"></div>
        <canvas id="compressCanvas" style="display:none;"></canvas>
        `
    );
}

function compressImage() {
    const fileInput = document.getElementById("compressImageFile");
    const qInput = document.getElementById("compressQuality");
    const result = document.getElementById("compressImageResult");
    const canvas = document.getElementById("compressCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    let quality = parseInt(qInput.value, 10);
    if (quality < 10) quality = 10;
    if (quality > 100) quality = 100;

    const file = fileInput.files[0];
    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "compressed-image.jpg";
            link.click();
        }, "image/jpeg", quality / 100);

        result.innerText = "✔️ تم ضغط الصورة وحفظها.";
    };
    img.src = URL.createObjectURL(file);
}

/* ------------------ 3) تحويل صيغة الصورة ------------------ */

function openImageConvertTool() {
    openToolModal(
        "تحويل صيغة الصورة",
        `
        <p>اختر صورة ثم اختر الصيغة المطلوبة.</p>
        <input type="file" id="convertImageFile" accept="image/*">
        <br><br>
        <select id="convertFormat">
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WEBP</option>
        </select>
        <br><br>
        <button onclick="convertImageFormat()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">تحويل الصيغة</button>
        <div id="convertImageResult" style="margin-top:15px;"></div>
        <canvas id="convertCanvas" style="display:none;"></canvas>
        `
    );
}

function convertImageFormat() {
    const fileInput = document.getElementById("convertImageFile");
    const formatSelect = document.getElementById("convertFormat");
    const result = document.getElementById("convertImageResult");
    const canvas = document.getElementById("convertCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    const format = formatSelect.value;
    const file = fileInput.files[0];
    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            let ext = "jpg";
            if (format === "image/png") ext = "png";
            if (format === "image/webp") ext = "webp";
            link.download = `converted.${ext}`;
            link.click();
        }, format);

        result.innerText = "✔️ تم تحويل صيغة الصورة.";
    };
    img.src = URL.createObjectURL(file);
}

/* ------------------ 4) تدوير الصورة ------------------ */

function openImageRotateTool() {
    openToolModal(
        "تدوير الصورة",
        `
        <p>اختر صورة وحدد زاوية التدوير.</p>
        <input type="file" id="rotateImageFile" accept="image/*">
        <br><br>
        <label>الزاوية (درجة): <input type="number" id="rotateAngle" value="90" style="width:80px;"></label>
        <br><br>
        <button onclick="rotateImage()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">تدوير الصورة</button>
        <div id="rotateImageResult" style="margin-top:15px;"></div>
        <canvas id="rotateCanvas" style="display:none;"></canvas>
        `
    );
}

function rotateImage() {
    const fileInput = document.getElementById("rotateImageFile");
    const angleInput = document.getElementById("rotateAngle");
    const result = document.getElementById("rotateImageResult");
    const canvas = document.getElementById("rotateCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    const angleDeg = parseInt(angleInput.value, 10) || 0;
    const angleRad = angleDeg * Math.PI / 180;

    const file = fileInput.files[0];
    const img = new Image();
    img.onload = function () {
        const w = img.width;
        const h = img.height;

        // لزاوية 90 أو 270 نقلب الأبعاد
        const sin = Math.abs(Math.sin(angleRad));
        const cos = Math.abs(Math.cos(angleRad));
        const newWidth = Math.round(w * cos + h * sin);
        const newHeight = Math.round(w * sin + h * cos);

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.clearRect(0, 0, newWidth, newHeight);
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(angleRad);
        ctx.drawImage(img, -w / 2, -h / 2);

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "rotated-image.png";
            link.click();
        }, "image/png");

        result.innerText = "✔️ تم تدوير الصورة وحفظها.";
    };
    img.src = URL.createObjectURL(file);
}

/* ------------------ 5) قلب الصورة (Mirror) ------------------ */

function openImageFlipTool() {
    openToolModal(
        "قلب الصورة",
        `
        <p>اختر صورة وحدد نوع القلب.</p>
        <input type="file" id="flipImageFile" accept="image/*">
        <br><br>
        <select id="flipType">
            <option value="horizontal">قلب أفقي</option>
            <option value="vertical">قلب عمودي</option>
        </select>
        <br><br>
        <button onclick="flipImage()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">قلب الصورة</button>
        <div id="flipImageResult" style="margin-top:15px;"></div>
        <canvas id="flipCanvas" style="display:none;"></canvas>
        `
    );
}

function flipImage() {
    const fileInput = document.getElementById("flipImageFile");
    const flipType = document.getElementById("flipType").value;
    const result = document.getElementById("flipImageResult");
    const canvas = document.getElementById("flipCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    const file = fileInput.files[0];
    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.save();
        if (flipType === "horizontal") {
            ctx.scale(-1, 1);
            ctx.drawImage(img, -img.width, 0);
        } else {
            ctx.scale(1, -1);
            ctx.drawImage(img, 0, -img.height);
        }
        ctx.restore();

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "flipped-image.png";
            link.click();
        }, "image/png");

        result.innerText = "✔️ تم قلب الصورة وحفظها.";
    };
    img.src = URL.createObjectURL(file);
}

/* ============================================================
   ملاحظات:
   - أداة أبشر موجودة في ملف image-tools.js كما بنيناها سابقًا.
   - هنا ركزنا على أدوات PDF + أدوات صور عامة.
   - يمكن لاحقًا إضافة:
     - OCR
     - PDF إلى صور متقدم
     - علامات مائية
     - توقيع إلكتروني
============================================================ */
