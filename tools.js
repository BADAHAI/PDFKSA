/* ============================================================
   PDFKSA - tools.js (نسخة كاملة)
   جميع أدوات PDF والصور + أدوات الذكاء الاصطناعي (هيكل موحد)
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
        <button onclick="mergePDF()" class="btn-gold">دمج الملفات</button>
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
        <button onclick="splitPDF()" class="btn-gold">تقسيم الملف</button>
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

/* ------------------ 3) ضغط PDF ------------------ */

function openCompressPDFTool() {
    openToolModal(
        "ضغط ملف PDF",
        `
        <p>ضغط PDF يتم هنا بشكل مبسط عن طريق إعادة حفظ الصفحات.</p>
        <input type="file" id="compressPdfFile" accept="application/pdf">
        <br><br>
        <button onclick="compressPDF()" class="btn-gold">ضغط الملف</button>
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

/* ------------------ 4) تحويل PDF إلى صور (مبسّط) ------------------ */

function openPDFToImagesTool() {
    openToolModal(
        "تحويل PDF إلى صور",
        `
        <p>اختر ملف PDF وسيتم حفظ كل صفحة كصورة (طريقة مبسطة).</p>
        <input type="file" id="pdfToImagesFile" accept="application/pdf">
        <br><br>
        <button onclick="pdfToImages()" class="btn-gold">تحويل</button>
        <div id="pdfToImagesResult" style="margin-top:15px;"></div>
        `
    );
}

async function pdfToImages() {
    const input = document.getElementById("pdfToImagesFile");
    const result = document.getElementById("pdfToImagesResult");

    if (!input.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    result.innerText = "⚠️ هذه النسخة مبسطة ولا تدعم عرض PDF كصور حقيقية داخل المتصفح.";
}

/* ------------------ 5) تحويل الصور إلى PDF ------------------ */

function openImagesToPDFTool() {
    openToolModal(
        "تحويل الصور إلى PDF",
        `
        <p>اختر عدة صور وسيتم دمجها داخل ملف PDF واحد.</p>
        <input type="file" id="imagesToPdfFiles" accept="image/*" multiple>
        <br><br>
        <button onclick="imagesToPDF()" class="btn-gold">تحويل</button>
        <div id="imagesToPdfResult" style="margin-top:15px;"></div>
        `
    );
}

async function imagesToPDF() {
    const input = document.getElementById("imagesToPdfFiles");
    const result = document.getElementById("imagesToPdfResult");

    if (!input.files.length) {
        result.innerText = "❌ الرجاء اختيار صور.";
        return;
    }

    const pdf = await PDFLib.PDFDocument.create();

    for (let file of input.files) {
        const imgBytes = await file.arrayBuffer();
        let img;
        try {
            img = await pdf.embedJpg(imgBytes);
        } catch {
            img = await pdf.embedPng(imgBytes);
        }
        const page = pdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "images.pdf";
    link.click();

    result.innerText = "✔️ تم تحويل الصور إلى PDF.";
}

/* ------------------ 6) إعادة ترتيب صفحات PDF ------------------ */

function openReorderPDFTool() {
    openToolModal(
        "إعادة ترتيب صفحات PDF",
        `
        <p>أدخل ترتيب الصفحات الجديد (مثال: 3,1,2).</p>
        <input type="file" id="reorderPdfFile" accept="application/pdf">
        <br><br>
        <input type="text" id="reorderOrder" placeholder="مثال: 3,1,2" style="width:200px;">
        <br><br>
        <button onclick="reorderPDF()" class="btn-gold">إعادة الترتيب</button>
        <div id="reorderPdfResult" style="margin-top:15px;"></div>
        `
    );
}

async function reorderPDF() {
    const fileInput = document.getElementById("reorderPdfFile");
    const orderInput = document.getElementById("reorderOrder");
    const result = document.getElementById("reorderPdfResult");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    const order = orderInput.value
        .split(",")
        .map(n => parseInt(n.trim(), 10) - 1)
        .filter(n => !isNaN(n));

    if (!order.length) {
        result.innerText = "❌ الرجاء إدخال ترتيب صحيح.";
        return;
    }

    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

    const newPdf = await PDFLib.PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, order);
    pages.forEach(p => newPdf.addPage(p));

    const bytes = await newPdf.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reordered.pdf";
    link.click();

    result.innerText = "✔️ تم إعادة ترتيب الصفحات.";
}

/* ------------------ 7) تدوير صفحات PDF ------------------ */

function openRotatePDFTool() {
    openToolModal(
        "تدوير صفحات PDF",
        `
        <p>اختر ملف PDF ثم اختر زاوية التدوير.</p>
        <input type="file" id="rotatePdfFile" accept="application/pdf">
        <br><br>
        <select id="rotateAngle">
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
        </select>
        <br><br>
        <button onclick="rotatePDF()" class="btn-gold">تدوير</button>
        <div id="rotatePdfResult" style="margin-top:15px;"></div>
        `
    );
}

async function rotatePDF() {
    const fileInput = document.getElementById("rotatePdfFile");
    const angle = parseInt(document.getElementById("rotateAngle").value, 10);
    const result = document.getElementById("rotatePdfResult");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

    pdf.getPages().forEach(page => page.setRotation(PDFLib.degrees(angle)));

    const bytes = await pdf.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rotated.pdf";
    link.click();

    result.innerText = "✔️ تم تدوير الصفحات.";
}

/* ------------------ 8) حذف صفحات PDF ------------------ */

function openDeletePagesPDFTool() {
    openToolModal(
        "حذف صفحات من PDF",
        `
        <p>أدخل أرقام الصفحات المراد حذفها (مثال: 2,5).</p>
        <input type="file" id="deletePdfFile" accept="application/pdf">
        <br><br>
        <input type="text" id="deletePages" placeholder="مثال: 2,5" style="width:200px;">
        <br><br>
        <button onclick="deletePagesPDF()" class="btn-gold">حذف</button>
        <div id="deletePdfResult" style="margin-top:15px;"></div>
        `
    );
}

async function deletePagesPDF() {
    const fileInput = document.getElementById("deletePdfFile");
    const pagesInput = document.getElementById("deletePages");
    const result = document.getElementById("deletePdfResult");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    const toDelete = pagesInput.value
        .split(",")
        .map(n => parseInt(n.trim(), 10) - 1)
        .filter(n => !isNaN(n));

    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

    const newPdf = await PDFLib.PDFDocument.create();
    const keep = [];

    for (let i = 0; i < pdf.getPageCount(); i++) {
        if (!toDelete.includes(i)) keep.push(i);
    }

    const pages = await newPdf.copyPages(pdf, keep);
    pages.forEach(p => newPdf.addPage(p));

    const bytes = await newPdf.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "deleted-pages.pdf";
    link.click();

    result.innerText = "✔️ تم حذف الصفحات.";
}

/* ------------------ 9) استخراج الصور من PDF (مبسّط) ------------------ */

function openExtractImagesPDFTool() {
    openToolModal(
        "استخراج الصور من PDF",
        `
        <p>اختر ملف PDF. هذه النسخة مبسطة ولا تستخرج كل الصور بدقة.</p>
        <input type="file" id="extractImagesPdfFile" accept="application/pdf">
        <br><br>
        <button onclick="extractImagesPDF()" class="btn-gold">استخراج</button>
        <div id="extractImagesPdfResult" style="margin-top:15px;"></div>
        `
    );
}

async function extractImagesPDF() {
    const input = document.getElementById("extractImagesPdfFile");
    const result = document.getElementById("extractImagesPdfResult");

    if (!input.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    result.innerText = "⚠️ هذه النسخة مبسطة ولا تدعم استخراج كل الصور من PDF.";
}

/* ============================================================
   أدوات الصور
============================================================ */

/* ------------------ 10) تغيير حجم الصور ------------------ */

function openImageResizeTool() {
    openToolModal(
        "تغيير حجم الصور",
        `
        <p>اختر صورة ثم أدخل العرض والارتفاع الجديد.</p>
        <input type="file" id="resizeImageFile" accept="image/*">
        <br><br>
        <label>العرض: <input type="number" id="resizeWidth" style="width:80px;"></label>
        <label>الارتفاع: <input type="number" id="resizeHeight" style="width:80px;"></label>
        <br><br>
        <button onclick="resizeImage()" class="btn-gold">تغيير الحجم</button>
        <div id="resizeImageResult" style="margin-top:15px;"></div>
        <canvas id="resizeCanvas" style="display:none;"></canvas>
        `
    );
}

function resizeImage() {
    const fileInput = document.getElementById("resizeImageFile");
    const w = parseInt(document.getElementById("resizeWidth").value, 10);
    const h = parseInt(document.getElementById("resizeHeight").value, 10);
    const result = document.getElementById("resizeImageResult");
    const canvas = document.getElementById("resizeCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }
    if (!w || !h) {
        result.innerText = "❌ الرجاء إدخال أبعاد صحيحة.";
        return;
    }

    const img = new Image();
    img.onload = function () {
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "resized.png";
            link.click();
        });

        result.innerText = "✔️ تم تغيير الحجم.";
    };

    img.src = URL.createObjectURL(fileInput.files[0]);
}

/* ------------------ 11) ضغط الصور ------------------ */

function openImageCompressTool() {
    openToolModal(
        "ضغط الصور",
        `
        <p>اختر صورة وسيتم ضغطها بنسبة 70%.</p>
        <input type="file" id="compressImageFile" accept="image/*">
        <br><br>
        <button onclick="compressImage()" class="btn-gold">ضغط</button>
        <div id="compressImageResult" style="margin-top:15px;"></div>
        <canvas id="compressCanvas" style="display:none;"></canvas>
        `
    );
}

function compressImage() {
    const fileInput = document.getElementById("compressImageFile");
    const result = document.getElementById("compressImageResult");
    const canvas = document.getElementById("compressCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
            blob => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "compressed.jpg";
                link.click();
            },
            "image/jpeg",
            0.7
        );

        result.innerText = "✔️ تم ضغط الصورة.";
    };

    img.src = URL.createObjectURL(fileInput.files[0]);
}

/* ------------------ 12) تحويل صيغ الصور ------------------ */

function openImageConvertTool() {
    openToolModal(
        "تحويل صيغ الصور",
        `
        <p>اختر صورة ثم اختر الصيغة الجديدة.</p>
        <input type="file" id="convertImageFile" accept="image/*">
        <br><br>
        <select id="convertFormat">
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
        </select>
        <br><br>
        <button onclick="convertImage()" class="btn-gold">تحويل</button>
        <div id="convertImageResult" style="margin-top:15px;"></div>
        <canvas id="convertCanvas" style="display:none;"></canvas>
        `
    );
}

function convertImage() {
    const fileInput = document.getElementById("convertImageFile");
    const format = document.getElementById("convertFormat").value;
    const result = document.getElementById("convertImageResult");
    const canvas = document.getElementById("convertCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let mime = "image/png";
        let ext = "png";
        if (format === "jpg") {
            mime = "image/jpeg";
            ext = "jpg";
        } else if (format === "webp") {
            mime = "image/webp";
            ext = "webp";
        }

        canvas.toBlob(
            blob => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `converted.${ext}`;
                link.click();
            },
            mime
        );

        result.innerText = "✔️ تم تحويل الصورة.";
    };

    img.src = URL.createObjectURL(fileInput.files[0]);
}

/* ------------------ 13) تدوير الصور ------------------ */

function openImageRotateTool() {
    openToolModal(
        "تدوير الصور",
        `
        <p>اختر صورة ثم اختر زاوية التدوير.</p>
        <input type="file" id="rotateImageFile" accept="image/*">
        <br><br>
        <select id="rotateImageAngle">
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
        </select>
        <br><br>
        <button onclick="rotateImage()" class="btn-gold">تدوير</button>
        <div id="rotateImageResult" style="margin-top:15px;"></div>
        <canvas id="rotateImageCanvas" style="display:none;"></canvas>
        `
    );
}

function rotateImage() {
    const fileInput = document.getElementById("rotateImageFile");
    const angle = parseInt(document.getElementById("rotateImageAngle").value, 10);
    const result = document.getElementById("rotateImageResult");
    const canvas = document.getElementById("rotateImageCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    const img = new Image();
    img.onload = function () {
        let w = img.width;
        let h = img.height;

        if (angle === 90 || angle === 270) {
            canvas.width = h;
            canvas.height = w;
        } else {
            canvas.width = w;
            canvas.height = h;
        }

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(img, -w / 2, -h / 2);
        ctx.restore();

        canvas.toBlob(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "rotated.png";
            link.click();
        });

        result.innerText = "✔️ تم تدوير الصورة.";
    };

    img.src = URL.createObjectURL(fileInput.files[0]);
}

/* ------------------ 14) قلب الصور ------------------ */

function openImageFlipTool() {
    openToolModal(
        "قلب الصور",
        `
        <p>اختر صورة ثم اختر نوع القلب.</p>
        <input type="file" id="flipImageFile" accept="image/*">
        <br><br>
        <select id="flipType">
            <option value="horizontal">قلب أفقي</option>
            <option value="vertical">قلب عمودي</option>
        </select>
        <br><br>
        <button onclick="flipImage()" class="btn-gold">قلب</button>
        <div id="flipImageResult" style="margin-top:15px;"></div>
        <canvas id="flipCanvas" style="display:none;"></canvas>
        `
    );
}

function flipImage() {
    const fileInput = document.getElementById("flipImageFile");
    const type = document.getElementById("flipType").value;
    const result = document.getElementById("flipImageResult");
    const canvas = document.getElementById("flipCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.save();
        if (type === "horizontal") {
            ctx.scale(-1, 1);
            ctx.drawImage(img, -img.width, 0);
        } else {
            ctx.scale(1, -1);
            ctx.drawImage(img, 0, -img.height);
        }
        ctx.restore();

        canvas.toBlob(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "flipped.png";
            link.click();
        });

        result.innerText = "✔️ تم قلب الصورة.";
    };

    img.src = URL.createObjectURL(fileInput.files[0]);
}

/* ------------------ 15) قص الصور ------------------ */

function openCropImageTool() {
    openToolModal(
        "قص الصور",
        `
        <p>اختر صورة ثم أدخل أبعاد القص (بشكل مبسط).</p>
        <input type="file" id="cropImageFile" accept="image/*">
        <br><br>
        <label>X: <input type="number" id="cropX" value="0" style="width:60px;"></label>
        <label>Y: <input type="number" id="cropY" value="0" style="width:60px;"></label>
        <label>العرض: <input type="number" id="cropW" style="width:80px;"></label>
        <label>الارتفاع: <input type="number" id="cropH" style="width:80px;"></label>
        <br><br>
        <button onclick="cropImage()" class="btn-gold">قص</button>
        <div id="cropImageResult" style="margin-top:15px;"></div>
        <canvas id="cropCanvas" style="display:none;"></canvas>
        `
    );
}

function cropImage() {
    const fileInput = document.getElementById("cropImageFile");
    const x = parseInt(document.getElementById("cropX").value, 10) || 0;
    const y = parseInt(document.getElementById("cropY").value, 10) || 0;
    const w = parseInt(document.getElementById("cropW").value, 10);
    const h = parseInt(document.getElementById("cropH").value, 10);
    const result = document.getElementById("cropImageResult");
    const canvas = document.getElementById("cropCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }
    if (!w || !h) {
        result.innerText = "❌ الرجاء إدخال أبعاد قص صحيحة.";
        return;
    }

    const img = new Image();
    img.onload = function () {
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

        canvas.toBlob(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "cropped.png";
            link.click();
        });

        result.innerText = "✔️ تم قص الصورة.";
    };

    img.src = URL.createObjectURL(fileInput.files[0]);
}

/* ------------------ 16) تحويل الصور إلى WebP ------------------ */

function openWebPConvertTool() {
    openToolModal(
        "تحويل الصور إلى WebP",
        `
        <p>اختر صورة وسيتم تحويلها إلى صيغة WebP.</p>
        <input type="file" id="webpImageFile" accept="image/*">
        <br><br>
        <button onclick="convertToWebP()" class="btn-gold">تحويل</button>
        <div id="webpImageResult" style="margin-top:15px;"></div>
        <canvas id="webpCanvas" style="display:none;"></canvas>
        `
    );
}

function convertToWebP() {
    const fileInput = document.getElementById("webpImageFile");
    const result = document.getElementById("webpImageResult");
    const canvas = document.getElementById("webpCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
            blob => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "converted.webp";
                link.click();
            },
            "image/webp"
        );

        result.innerText = "✔️ تم تحويل الصورة إلى WebP.";
    };

    img.src = URL.createObjectURL(fileInput.files[0]);
}

/* ------------------ 17) تحسين جودة الصور ------------------ */

function openEnhanceImageTool() {
    openToolModal(
        "تحسين جودة الصورة",
        `
        <p>اختر صورة وسيتم تحسينها (زيادة الوضوح والتباين).</p>
        <input type="file" id="enhanceImageFile" accept="image/*">
        <br><br>
        <button onclick="enhanceImage()" class="btn-gold">تحسين الصورة</button>
        <div id="enhanceImageResult" style="margin-top:15px;"></div>
        <canvas id="enhanceCanvas" style="display:none;"></canvas>
        `
    );
}

function enhanceImage() {
    const fileInput = document.getElementById("enhanceImageFile");
    const result = document.getElementById("enhanceImageResult");
    const canvas = document.getElementById("enhanceCanvas");
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

        ctx.filter = "contrast(120%) brightness(110%) saturate(115%)";
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "enhanced-image.png";
            link.click();
        }, "image/png");

        result.innerText = "✔️ تم تحسين جودة الصورة.";
    };

    img.src = URL.createObjectURL(file);
}

/* ============================================================
   إزالة الخلفية (AI)
============================================================ */

function openRemoveBGTool() {
    openToolModal(
        "إزالة الخلفية (AI)",
        `
        <p>اختر صورة وسيتم إزالة الخلفية باستخدام الذكاء الاصطناعي.</p>
        <input type="file" id="removeBgAIFile" accept="image/*">
        <br><br>
        <button onclick="removeBG_AI()" class="btn-gold">إزالة الخلفية (AI)</button>
        <div id="removeBgAIResult" style="margin-top:15px;"></div>
        <canvas id="removeBgAICanvas" style="display:none;"></canvas>
        `
    );
}

/* تحميل نموذج U2NETP */
let u2netModel = null;

async function loadU2NetModel() {
    if (u2netModel) return u2netModel;

    u2netModel = await ort.InferenceSession.create("./models/u2netp.onnx", {
        executionProviders: ["wasm"]
    });

    return u2netModel;
}

/* دالة إزالة الخلفية بالذكاء الاصطناعي */
async function removeBG_AI() {
    const fileInput = document.getElementById("removeBgAIFile");
    const result = document.getElementById("removeBgAIResult");
    const canvas = document.getElementById("removeBgAICanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    result.innerText = "⏳ جاري معالجة الصورة بالذكاء الاصطناعي...";

    const file = fileInput.files[0];
    const img = new Image();

    img.onload = async function () {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = 320;
        tmpCanvas.height = 320;
        const tctx = tmpCanvas.getContext("2d");
        tctx.drawImage(img, 0, 0, 320, 320);

        const imgData = tctx.getImageData(0, 0, 320, 320);
        const data = imgData.data;

        const input = new Float32Array(1 * 3 * 320 * 320);
        let idx = 0;

        for (let i = 0; i < data.length; i += 4) {
            input[idx] = data[i] / 255;
            input[idx + 320 * 320] = data[i + 1] / 255;
            input[idx + 2 * 320 * 320] = data[i + 2] / 255;
            idx++;
        }

        const tensor = new ort.Tensor("float32", input, [1, 3, 320, 320]);

        const model = await loadU2NetModel();

        const output = await model.run({ input: tensor });

        const mask = output["output.1"].data;

        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = 320;
        maskCanvas.height = 320;
        const mctx = maskCanvas.getContext("2d");

        const maskImg = mctx.createImageData(320, 320);
        for (let i = 0; i < mask.length; i++) {
            const v = mask[i] * 255;
            maskImg.data[i * 4] = v;
            maskImg.data[i * 4 + 1] = v;
            maskImg.data[i * 4 + 2] = v;
            maskImg.data[i * 4 + 3] = 255;
        }

        mctx.putImageData(maskImg, 0, 0);

        const finalMaskCanvas = document.createElement("canvas");
        finalMaskCanvas.width = img.width;
        finalMaskCanvas.height = img.height;
        const fmctx = finalMaskCanvas.getContext("2d");
        fmctx.drawImage(maskCanvas, 0, 0, img.width, img.height);

        const finalMask = fmctx.getImageData(0, 0, img.width, img.height).data;

        const original = ctx.getImageData(0, 0, img.width, img.height);
        const odata = original.data;

        for (let i = 0; i < odata.length; i += 4) {
            const alpha = finalMask[i] / 255;
            odata[i + 3] = alpha * 255;
        }

        ctx.putImageData(original, 0, 0);

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "no-bg-ai.png";
            link.click();
        }, "image/png");

        result.innerText = "✔️ تمت إزالة الخلفية باستخدام الذكاء الاصطناعي.";
    };

    img.src = URL.createObjectURL(file);
}

/* ============================================================
   أدوات الذكاء الاصطناعي (Placeholder)
============================================================ */

function openOCR_AI_Tool() {
    openToolModal(
        "OCR بالذكاء الاصطناعي",
        `
        <p>هذه الأداة ستستخدم الذكاء الاصطناعي لاستخراج النصوص من الصور.</p>
        <p>سيتم إطلاقها قريبًا.</p>
        `
    );
}

function openAI_CleanImageTool() {
    openToolModal(
        "تنظيف الصور بالذكاء الاصطناعي",
        `
        <p>هذه الأداة ستقوم بإزالة التشويش وتحسين الصورة باستخدام AI.</p>
        <p>قريبًا.</p>
        `
    );
}

function openAI_EnhanceTool() {
    openToolModal(
        "ترقية جودة الصور بالذكاء الاصطناعي",
        `
        <p>هذه الأداة ستقوم بترقية جودة الصور باستخدام نماذج AI.</p>
        <p>قريبًا.</p>
        `
    );
}

function openAI_TextToPDFTool() {
    openToolModal(
        "تحويل النص إلى PDF تلقائيًا",
        `
        <p>هذه الأداة ستقوم بتحويل النصوص إلى PDF باستخدام الذكاء الاصطناعي.</p>
        <p>قريبًا.</p>
        `
    );
}

/* ============================================================
   نهاية الملف
============================================================ */
