/* ============================================================
   واجهة أداة تجهيز صور منصة أبشر (Full Screen UI)
============================================================ */

function openAbsherTool() {
    const modal = document.getElementById("absherModal");
    const content = document.getElementById("absherToolContent");

    modal.style.display = "block";

    content.innerHTML = `
        <div style="padding: 20px;">

            <h2 style="margin-bottom: 15px;">أداة تجهيز صور منصة أبشر</h2>

            <p>قم برفع الصورة وسيتم عرضها في منطقة العمل. لاحقًا سيتم إضافة أدوات القص والمعالجة.</p>

            <br>

            <!-- رفع الصورة -->
            <input type="file" id="absherImgFile" accept="image/*" onchange="absherPreviewImage()">

            <br><br>

            <!-- منطقة العمل -->
            <div style="
                width: 100%;
                height: 400px;
                background: #f0f0f0;
                border: 2px dashed #ccc;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            ">
                <canvas id="absherCanvas" style="max-width: 100%; max-height: 100%;"></canvas>
            </div>

            <br>

            <!-- أزرار التحكم -->
            <button onclick="processAbsherImage()" style="
                background: #006C35;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
            ">تجهيز الصورة</button>

            <button onclick="saveAbsherImage()" style="
                background: #CFAE70;
                color: black;
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                margin-right: 10px;
            ">حفظ الصورة</button>

            <div id="absherResult" style="margin-top: 20px; font-size: 16px;"></div>

        </div>
    `;
}

/* ============================================================
   عرض الصورة داخل الـ Canvas
============================================================ */

function absherPreviewImage() {
    const file = document.getElementById("absherImgFile").files[0];
    if (!file) return;

    const canvas = document.getElementById("absherCanvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };

    img.src = URL.createObjectURL(file);
}
/* ============================================================
   القص التلقائي للصورة (Auto Crop to Square)
============================================================ */

function absherAutoCrop() {
    const canvas = document.getElementById("absherCanvas");
    const ctx = canvas.getContext("2d");

    // إنشاء Canvas جديد للقص
    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    // تحديد أقصر ضلع
    const size = Math.min(width, height);

    // حساب نقطة البداية للقص
    const startX = (width - size) / 2;
    const startY = (height - size) / 2;

    // ضبط حجم Canvas الجديد
    croppedCanvas.width = size;
    croppedCanvas.height = size;

    // قص الصورة
    croppedCtx.drawImage(canvas, startX, startY, size, size, 0, 0, size, size);

    // إعادة رسم الصورة المقصوصة على Canvas الأصلي
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(croppedCanvas, 0, 0);
}

/* ============================================================
   تجهيز الصورة (placeholder)
============================================================ */

function processAbsherImage() {
    absherAutoCrop();

    document.getElementById("absherResult").innerHTML =
        "✔️ تم قص الصورة تلقائيًا إلى مقاس مربع (جاهزة للخطوة التالية).";
}


/* ============================================================
   حفظ الصورة (placeholder)
============================================================ */

function saveAbsherImage() {
    document.getElementById("absherResult").innerHTML =
        "سيتم إضافة ميزة حفظ الصورة لاحقًا.";
}
