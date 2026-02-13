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
   أدوات PDF (مطابقة لترتيب صفحة الأدوات)
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

/* ------------------ 3) ضغط PDF ------------------ */

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

/* ------------------ 4) تحويل PDF إلى صور (واجهة فقط حالياً) ------------------ */

function openPDFToImagesTool() {
    openToolModal(
        "تحويل PDF إلى صور",
        `
        <p>هذه الميزة تحتاج معالجة متقدمة (PDF إلى صور) وسيتم إضافتها لاحقًا.</p>
        <p>يمكنك الآن استخدام بقية أدوات PDF المتاحة.</p>
        `
    );
}

/* ------------------ 5) تحويل الصور إلى PDF ------------------ */

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

/* ------------------ 6) إعادة ترتيب صفحات PDF (جديد) ------------------ */

function openReorderPDFTool() {
    openToolModal(
        "إعادة ترتيب صفحات PDF",
        `
        <p>اختر ملف PDF ثم أدخل ترتيب الصفحات الجديد (مثال: 3,1,2).</p>
        <input type="file" id="reorderPdfFile" accept="application/pdf">
        <br><br>
        <label>الترتيب الجديد: <input type="text" id="reorderInput" placeholder="مثال: 3,1,2" style="width:200px;"></label>
        <br><br>
        <button onclick="reorderPDF()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">إعادة الترتيب</button>
        <div id="reorderResult" style="margin-top:15px;"></div>
        `
    );
}

async function reorderPDF() {
    const fileInput = document.getElementById("reorderPdfFile");
    const orderInput = document.getElementById("reorderInput");
    const result = document.getElementById("reorderResult");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    const order = orderInput.value.split(",").map(n => parseInt(n.trim(), 10) - 1);

    if (order.some(isNaN)) {
        result.innerText = "❌ الرجاء إدخال ترتيب صحيح.";
        return;
    }

    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();

    if (order.some(i => i < 0 || i >= totalPages)) {
        result.innerText = "❌ الترتيب يحتوي صفحات غير موجودة.";
        return;
    }

    const newPdf = await PDFLib.PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, order);
    pages.forEach(p => newPdf.addPage(p));

    const newBytes = await newPdf.save();
    const blob = new Blob([newBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reordered.pdf";
    link.click();

    result.innerText = "✔️ تم إعادة ترتيب الصفحات.";
}

/* ------------------ 7) تدوير صفحات PDF (جديد) ------------------ */

function openRotatePDFTool() {
    openToolModal(
        "تدوير صفحات PDF",
        `
        <p>اختر ملف PDF وحدد زاوية التدوير.</p>
        <input type="file" id="rotatePdfFile" accept="application/pdf">
        <br><br>
        <select id="rotatePdfAngle">
            <option value="90">90 درجة</option>
            <option value="180">180 درجة</option>
            <option value="270">270 درجة</option>
        </select>
        <br><br>
        <button onclick="rotatePDF()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">تدوير</button>
        <div id="rotatePdfResult" style="margin-top:15px;"></div>
        `
    );
}

async function rotatePDF() {
    const fileInput = document.getElementById("rotatePdfFile");
    const angleInput = document.getElementById("rotatePdfAngle");
    const result = document.getElementById("rotatePdfResult");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    const angle = parseInt(angleInput.value, 10);

    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

    const newPdf = await PDFLib.PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, pdf.getPageIndices());

    pages.forEach(p => {
        p.setRotation(PDFLib.degrees(angle));
        newPdf.addPage(p);
    });

    const newBytes = await newPdf.save();
    const blob = new Blob([newBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rotated.pdf";
    link.click();

    result.innerText = "✔️ تم تدوير الصفحات.";
}

/* ------------------ 8) حذف صفحات من PDF (جديد) ------------------ */

function openDeletePagesPDFTool() {
    openToolModal(
        "حذف صفحات من PDF",
        `
        <p>اختر ملف PDF ثم أدخل أرقام الصفحات المراد حذفها (مثال: 2,5).</p>
        <input type="file" id="deletePdfFile" accept="application/pdf">
        <br><br>
        <label>الصفحات المراد حذفها: <input type="text" id="deletePagesInput" placeholder="مثال: 2,5" style="width:200px;"></label>
        <br><br>
        <button onclick="deletePagesPDF()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">حذف الصفحات</button>
        <div id="deletePagesResult" style="margin-top:15px;"></div>
        `
    );
}

async function deletePagesPDF() {
    const fileInput = document.getElementById("deletePdfFile");
    const pagesInput = document.getElementById("deletePagesInput");
    const result = document.getElementById("deletePagesResult");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    const toDelete = pagesInput.value.split(",").map(n => parseInt(n.trim(), 10) - 1);

    if (toDelete.some(isNaN)) {
        result.innerText = "❌ الرجاء إدخال أرقام صفحات صحيحة.";
        return;
    }

    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

    const totalPages = pdf.getPageCount();
    const keepPages = [];

    for (let i = 0; i < totalPages; i++) {
        if (!toDelete.includes(i)) keepPages.push(i);
    }

    const newPdf = await PDFLib.PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, keepPages);
    pages.forEach(p => newPdf.addPage(p));

    const newBytes = await newPdf.save();
    const blob = new Blob([newBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "deleted-pages.pdf";
    link.click();

    result.innerText = "✔️ تم حذف الصفحات المحددة.";
}

/* ------------------ 9) استخراج الصور من PDF (جديد) ------------------ */

function openExtractImagesPDFTool() {
    openToolModal(
        "استخراج الصور من PDF",
        `
        <p>اختر ملف PDF وسيتم استخراج جميع الصور الموجودة بداخله.</p>
        <input type="file" id="extractImagesPdfFile" accept="application/pdf">
        <br><br>
        <button onclick="extractImagesPDF()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">استخراج الصور</button>
        <div id="extractImagesResult" style="margin-top:15px;"></div>
        `
    );
}

async function extractImagesPDF() {
    const fileInput = document.getElementById("extractImagesPdfFile");
    const result = document.getElementById("extractImagesResult");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار ملف PDF.";
        return;
    }

    result.innerText = "⏳ جاري استخراج الصور...";

    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

    let imageCount = 0;

    for (let pageIndex = 0; pageIndex < pdf.getPageCount(); pageIndex++) {
        const page = pdf.getPage(pageIndex);
        const images = page.node.Resources().XObject();

        if (!images) continue;

        for (const key in images) {
            const xObject = images[key];

            if (xObject.lookup("Subtype").name === "Image") {
                const img = await pdf.embedPng(await xObject.getBytes());
                const pngBytes = await img.bytes;

                const blob = new Blob([pngBytes], { type: "image/png" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `extracted_${pageIndex + 1}_${imageCount + 1}.png`;
                link.click();

                imageCount++;
            }
        }
    }

    result.innerText =
        imageCount > 0
            ? `✔️ تم استخراج ${imageCount} صورة.`
            : "❌ لم يتم العثور على صور داخل الملف.";
}

/* ============================================================
   أدوات الصور العامة (مطابقة لترتيب صفحة الأدوات)
============================================================ */

/* ------------------ 1) تغيير حجم الصور ------------------ */

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

/* ------------------ 2) قص الصور (جديد) ------------------ */

function openCropImageTool() {
    openToolModal(
        "قص الصورة",
        `
        <p>اختر صورة وحدد أبعاد القص.</p>
        <input type="file" id="cropImageFile" accept="image/*">
        <br><br>
        <label>العرض: <input type="number" id="cropWidth" style="width:80px;"></label>
        <label>الارتفاع: <input type="number" id="cropHeight" style="width:80px;"></label>
        <br><br>
        <button onclick="cropImage()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">قص الصورة</button>
        <div id="cropImageResult" style="margin-top:15px;"></div>
        <canvas id="cropCanvas" style="display:none;"></canvas>
        `
    );
}

function cropImage() {
    const fileInput = document.getElementById("cropImageFile");
    const wInput = document.getElementById("cropWidth");
    const hInput = document.getElementById("cropHeight");
    const result = document.getElementById("cropImageResult");
    const canvas = document.getElementById("cropCanvas");
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
            link.download = "cropped-image.png";
            link.click();
        }, "image/png");

        result.innerText = "✔️ تم قص الصورة.";
    };

    img.src = URL.createObjectURL(file);
}

/* ------------------ 3) ضغط الصور ------------------ */

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

/* ------------------ 4) تحويل صيغ الصور ------------------ */

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

/* ------------------ 5) تدوير الصور ------------------ */

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

/* ------------------ 6) قلب الصور ------------------ */

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

/* ------------------ 7) تحويل الصور إلى WebP (جديد) ------------------ */

function openWebPConvertTool() {
    openToolModal(
        "تحويل الصور إلى WebP",
        `
        <p>اختر صورة وسيتم تحويلها إلى صيغة WebP.</p>
        <input type="file" id="webpImageFile" accept="image/*">
        <br><br>
        <button onclick="convertToWebP()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">تحويل إلى WebP</button>
        <div id="webpResult" style="margin-top:15px;"></div>
        <canvas id="webpCanvas" style="display:none;"></canvas>
        `
    );
}

function convertToWebP() {
    const fileInput = document.getElementById("webpImageFile");
    const result = document.getElementById("webpResult");
    const canvas = document.getElementById("webpCanvas");
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
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "converted.webp";
            link.click();
        }, "image/webp");

        result.innerText = "✔️ تم تحويل الصورة إلى WebP.";
    };

    img.src = URL.createObjectURL(file);
}

/* ------------------ 8) تحسين جودة الصور (جديد — تحسين بسيط) ------------------ */

function openEnhanceImageTool() {
    openToolModal(
        "تحسين جودة الصورة",
        `
        <p>اختر صورة وسيتم تحسينها (زيادة الوضوح والتباين).</p>
        <input type="file" id="enhanceImageFile" accept="image/*">
        <br><br>
        <button onclick="enhanceImage()" style="
            background:#006C35;color:#fff;padding:10px 20px
                   ">تحسين الصورة</button>
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

/* ------------------ 9) إزالة الخلفية (جديد — إزالة بسيطة) ------------------ */

function openRemoveBGTool() {
    openToolModal(
        "إزالة الخلفية",
        `
        <p>اختر صورة وسيتم إزالة الخلفية (نسخة مبسطة بدون ذكاء اصطناعي).</p>
        <input type="file" id="removeBgFile" accept="image/*">
        <br><br>
        <button onclick="removeBG()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">إزالة الخلفية</button>
        <div id="removeBgResult" style="margin-top:15px;"></div>
        <canvas id="removeBgCanvas" style="display:none;"></canvas>
        `
    );
}

function removeBG() {
    const fileInput = document.getElementById("removeBgFile");
    const result = document.getElementById("removeBgResult");
    const canvas = document.getElementById("removeBgCanvas");
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

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // إزالة خلفية بيضاء/فاتحة (نسخة مبسطة)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r > 200 && g > 200 && b > 200) {
                data[i + 3] = 0; // شفافية
            }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "no-bg.png";
            link.click();
        }, "image/png");

        result.innerText = "✔️ تمت إزالة الخلفية (نسخة مبسطة).";
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
 
