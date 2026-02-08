function openAbsherTool() {
    const modal = document.getElementById("absherModal");
    const content = document.getElementById("absherToolContent");

    modal.style.display = "block";

    content.innerHTML = `
        <h2>تجهيز صور منصة أبشر</h2>
        <p>اختر نوع الوثيقة وسيتم ضبط الأبعاد تلقائيًا حسب متطلبات منصة أبشر.</p>

        <label>نوع الوثيقة:</label>
        <select id="absherType" onchange="setAbsherDimensions()">
            <option value="id">هوية وطنية</option>
            <option value="iqama">إقامة</option>
            <option value="passport">جواز سفر</option>
            <option value="custom">مخصص</option>
        </select>

        <br><br>

        <label>العرض (px):</label>
        <input type="number" id="absherWidth">

        <label>الارتفاع (px):</label>
        <input type="number" id="absherHeight">

        <br><br>

        <label>اختر صورة:</label>
        <input type="file" id="absherImage" accept="image/*">

        <br><br>

        <button onclick="processAbsherImage()" class="btn-gold">تجهيز الصورة</button>

        <div id="absherResult" style="margin-top:15px;"></div>

        <canvas id="absherCanvas" style="display:none;"></canvas>
    `;

    setAbsherDimensions(); // ضبط الأبعاد تلقائيًا عند الفتح
}

function closeAbsherModal() {
    document.getElementById("absherModal").style.display = "none";
}

/* ===========================
   ضبط الأبعاد حسب نوع الوثيقة
=========================== */
function setAbsherDimensions() {
    const type = document.getElementById("absherType").value;
    const width = document.getElementById("absherWidth");
    const height = document.getElementById("absherHeight");

    if (type === "id" || type === "iqama") {
        width.value = 480;
        height.value = 640;
    } 
    else if (type === "passport") {
        width.value = 472;
        height.value = 709;
    }
    else {
        width.value = "";
        height.value = "";
    }
}

/* ===========================
   تجهيز الصورة
=========================== */
function processAbsherImage() {
    const fileInput = document.getElementById("absherImage");
    const width = parseInt(document.getElementById("absherWidth").value);
    const height = parseInt(document.getElementById("absherHeight").value);
    const result = document.getElementById("absherResult");
    const canvas = document.getElementById("absherCanvas");
    const ctx = canvas.getContext("2d");

    if (!fileInput.files.length) {
        result.innerText = "❌ الرجاء اختيار صورة.";
        return;
    }

    if (!width || !height) {
        result.innerText = "❌ الرجاء إدخال أبعاد صحيحة.";
        return;
    }

    const img = new Image();
    img.onload = function () {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(function (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `absher-image.jpg`;
            link.click();
        }, "image/jpeg", 0.9);

        result.innerText = "✔️ تم تجهيز الصورة بنجاح.";
    };

    img.src = URL.createObjectURL(fileInput.files[0]);
}
