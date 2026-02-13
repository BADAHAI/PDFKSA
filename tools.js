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
/* ------------------ 8) تحسين جودة الصور (جديد — تحسين بسيط) ------------------ */

function openEnhanceImageTool() {
    openToolModal(
        "تحسين جودة الصورة",
        `
        <p>اختر صورة وسيتم تحسينها (زيادة الوضوح والتباين).</p>
        <input type="file" id="enhanceImageFile" accept="image/*">
        <br><br>
        <button onclick="enhanceImage()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
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

/* ============================================================
   إزالة الخلفية (AI) — استبدال الأداة القديمة بالكامل
============================================================ */

function openRemoveBGTool() {
    openToolModal(
        "إزالة الخلفية (AI)",
        `
        <p>اختر صورة وسيتم إزالة الخلفية باستخدام الذكاء الاصطناعي.</p>
        <input type="file" id="removeBgAIFile" accept="image/*">
        <br><br>
        <button onclick="removeBG_AI()" style="
            background:#006C35;color:#fff;padding:10px 20px;
            border:none;border-radius:8px;cursor:pointer;
        ">إزالة الخلفية (AI)</button>
        <div id="removeBgAIResult" style="margin-top:15px;"></div>
        <canvas id="removeBgAICanvas" style="display:none;"></canvas>
        `
    );
}
/* ============================================================
   إزالة الخلفية (AI) — دالة الذكاء الاصطناعي
============================================================ */

/* تحميل نموذج U2NETP */
let u2netModel = null;

async function loadU2NetModel() {
    if (u2netModel) return u2netModel;

    u2netModel = await ort.InferenceSession.create("./u2netp.onnx", {
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

        // رسم الصورة على كانفاس
        ctx.drawImage(img, 0, 0);

        // تجهيز صورة 320x320 للنموذج
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = 320;
        tmpCanvas.height = 320;
        const tctx = tmpCanvas.getContext("2d");
        tctx.drawImage(img, 0, 0, 320, 320);

        const imgData = tctx.getImageData(0, 0, 320, 320);
        const data = imgData.data;

        // تحويل الصورة إلى تنسيق Float32 للنموذج
        const input = new Float32Array(1 * 3 * 320 * 320);
        let idx = 0;

        for (let i = 0; i < data.length; i += 4) {
            input[idx] = data[i] / 255;       // R
            input[idx + 320 * 320] = data[i + 1] / 255; // G
            input[idx + 2 * 320 * 320] = data[i + 2] / 255; // B
            idx++;
        }

        const tensor = new ort.Tensor("float32", input, [1, 3, 320, 320]);

        // تحميل النموذج
        const model = await loadU2NetModel();

        // تشغيل النموذج
        const output = await model.run({ "input": tensor });
        const mask = output.output.data;

        // إنشاء قناع بحجم الصورة الأصلية
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
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

        // تكبير القناع لحجم الصورة الأصلي
        const finalMaskCanvas = document.createElement("canvas");
        finalMaskCanvas.width = img.width;
        finalMaskCanvas.height = img.height;
        const fmctx = finalMaskCanvas.getContext("2d");
        fmctx.drawImage(maskCanvas, 0, 0, img.width, img.height);

        const finalMask = fmctx.getImageData(0, 0, img.width, img.height).data;

        // تطبيق القناع على الصورة الأصلية
        const original = ctx.getImageData(0, 0, img.width, img.height);
        const odata = original.data;

        for (let i = 0; i < odata.length; i += 4) {
            const alpha = finalMask[i] / 255;
            odata[i + 3] = alpha * 255;
        }

        ctx.putImageData(original, 0, 0);

        // حفظ الصورة
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
