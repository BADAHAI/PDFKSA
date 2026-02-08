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
   تبييض الخلفية (Background Whitening)
============================================================ */

function absherWhitenBackground() {
    const canvas = document.getElementById("absherCanvas");
    const ctx = canvas.getContext("2d");

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // نمر على كل بكسل
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // إذا كان البكسل قريب من اللون الرمادي/الخلفية
        const brightness = (r + g + b) / 3;

        if (brightness > 150) {
            // نرفع الإضاءة إلى الأبيض
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

/* ============================================================
   تحسين الإضاءة (Brightness Enhancement)
============================================================ */

function absherEnhanceBrightness() {
    const canvas = document.getElementById("absherCanvas");
    const ctx = canvas.getContext("2d");

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // نمر على كل بكسل
    for (let i = 0; i < data.length; i += 4) {
        // تجاهل الخلفية البيضاء
        if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
            continue;
        }

        // زيادة الإضاءة بنسبة 15%
        data[i] = Math.min(255, data[i] * 1.15);     // R
        data[i + 1] = Math.min(255, data[i + 1] * 1.15); // G
        data[i + 2] = Math.min(255, data[i + 2] * 1.15); // B
    }

    ctx.putImageData(imgData, 0, 0);
}

/* ============================================================
   تحسين التباين (Contrast Boost)
============================================================ */

function absherEnhanceContrast() {
    const canvas = document.getElementById("absherCanvas");
    const ctx = canvas.getContext("2d");

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const contrastLevel = 1.10; // زيادة التباين بنسبة 10%
    const factor = (259 * (contrastLevel + 255)) / (255 * (259 - contrastLevel));

    for (let i = 0; i < data.length; i += 4) {
        // تجاهل الخلفية البيضاء
        if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
            continue;
        }

        data[i] = truncate(factor * (data[i] - 128) + 128);       // R
        data[i + 1] = truncate(factor * (data[i + 1] - 128) + 128); // G
        data[i + 2] = truncate(factor * (data[i + 2] - 128) + 128); // B
    }

    ctx.putImageData(imgData, 0, 0);
}

// وظيفة مساعدة لمنع تجاوز القيم
function truncate(value) {
    return Math.min(255, Math.max(0, value));
}

/* ============================================================
   تنعيم البشرة (Skin Smoothing - Light Blur)
============================================================ */

function absherSmoothSkin() {
    const canvas = document.getElementById("absherCanvas");
    const ctx = canvas.getContext("2d");

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const width = canvas.width;
    const height = canvas.height;

    // قوة التنعيم (كلما زادت القيمة زاد التنعيم)
    const radius = 1;

    // نسخة من الصورة الأصلية
    const copy = new Uint8ClampedArray(data);

    // نمر على كل بكسل
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {

            let totalR = 0, totalG = 0, totalB = 0;
            let count = 0;

            // نأخذ البكسلات المحيطة (3×3)
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {

                    const px = (y + dy) * width + (x + dx);
                    const i = px * 4;

                    // تجاهل الخلفية البيضاء
                    if (copy[i] > 240 && copy[i + 1] > 240 && copy[i + 2] > 240) {
                        continue;
                    }

                    totalR += copy[i];
                    totalG += copy[i + 1];
                    totalB += copy[i + 2];
                    count++;
                }
            }

            const index = (y * width + x) * 4;

            // متوسط الألوان = تنعيم
            data[index]     = totalR / count;
            data[index + 1] = totalG / count;
            data[index + 2] = totalB / count;
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

/* ============================================================
   تحسين الحواف (Sharpen Filter)
============================================================ */

function absherSharpen() {
    const canvas = document.getElementById("absherCanvas");
    const ctx = canvas.getContext("2d");

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const width = canvas.width;
    const height = canvas.height;

    // نسخة من الصورة قبل التعديل
    const copy = new Uint8ClampedArray(data);

    // مصفوفة الفلتر (Sharpen Kernel)
    const kernel = [
        0, -1,  0,
       -1,  5, -1,
        0, -1,  0
    ];

    const side = 3;
    const half = Math.floor(side / 2);

    for (let y = half; y < height - half; y++) {
        for (let x = half; x < width - half; x++) {

            let r = 0, g = 0, b = 0;

            for (let ky = -half; ky <= half; ky++) {
                for (let kx = -half; kx <= half; kx++) {

                    const px = (y + ky) * width + (x + kx);
                    const i = px * 4;

                    const weight = kernel[(ky + half) * side + (kx + half)];

                    r += copy[i] * weight;
                    g += copy[i + 1] * weight;
                    b += copy[i + 2] * weight;
                }
            }

            const index = (y * width + x) * 4;

            data[index]     = Math.min(255, Math.max(0, r));
            data[index + 1] = Math.min(255, Math.max(0, g));
            data[index + 2] = Math.min(255, Math.max(0, b));
        }
    }

    ctx.putImageData(imgData, 0, 0);
}


/* ============================================================
   ضبط حجم الصورة النهائي (Resize to 600x600)
============================================================ */

function absherResizeFinal() {
    const canvas = document.getElementById("absherCanvas");
    const ctx = canvas.getContext("2d");

    // المقاس النهائي (يمكن تغييره إلى 200 أو 300)
    const finalSize = 600;

    // إنشاء Canvas جديد
    const resizedCanvas = document.createElement("canvas");
    const resizedCtx = resizedCanvas.getContext("2d");

    resizedCanvas.width = finalSize;
    resizedCanvas.height = finalSize;

    // رسم الصورة داخل المقاس الجديد
    resizedCtx.drawImage(canvas, 0, 0, finalSize, finalSize);

    // إعادة الصورة إلى الـ Canvas الأصلي
    canvas.width = finalSize;
    canvas.height = finalSize;
    ctx.drawImage(resizedCanvas, 0, 0);
}


/* ============================================================
   تجهيز الصورة (placeholder)
============================================================ */

function processAbsherImage() {
    absherAutoCrop();            // قص تلقائي
    absherWhitenBackground();    // تبييض الخلفية
    absherEnhanceBrightness();   // تحسين الإضاءة
    absherEnhanceContrast();     // تحسين التباين
    absherSmoothSkin();          // تنعيم البشرة
    absherSharpen();             // تحسين الحواف
    absherResizeFinal();         // ضبط الحجم النهائي

    document.getElementById("absherResult").innerHTML =
        "✔️ تم تجهيز الصورة بالكامل مع تحسين الحواف.";
}


/* ============================================================
   حفظ الصورة (placeholder)
============================================================ */

/* ============================================================
   حفظ الصورة النهائية (Export to JPG)
============================================================ */

function saveAbsherImage() {
    const canvas = document.getElementById("absherCanvas");

    // تحويل الصورة إلى بيانات JPG
    const imageData = canvas.toDataURL("image/jpeg", 0.95);

    // إنشاء رابط تحميل
    const link = document.createElement("a");
    link.href = imageData;
    link.download = "absher-photo.jpg";

    // تشغيل التحميل تلقائيًا
    link.click();

    document.getElementById("absherResult").innerHTML =
        "✔️ تم حفظ الصورة بنجاح.";
}

