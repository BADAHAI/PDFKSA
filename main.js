/* ===========================
   فتح المودال العادي
=========================== */
function openTool(toolName) {
    const modal = document.getElementById("toolModal");
    const content = document.getElementById("toolContent");

    modal.style.display = "block";

    // تحميل محتوى الأداة حسب الاسم
    if (toolName === "merge") {
        content.innerHTML = "<h2>دمج ملفات PDF</h2><p>هنا سيتم وضع أداة الدمج.</p>";
    }

    if (toolName === "compress") {
        content.innerHTML = "<h2>ضغط PDF</h2><p>هنا سيتم وضع أداة الضغط.</p>";
    }

    if (toolName === "pdf-to-img") {
        content.innerHTML = "<h2>تحويل PDF إلى صور</h2><p>هنا سيتم وضع أداة التحويل.</p>";
    }
}
/* ===========================
   فتح مودال أداة أبشر
=========================== */
function openAbsherTool() {
    const modal = document.getElementById("absherModal");
    const content = document.getElementById("absherToolContent");

    modal.style.display = "block";

    // تحميل أداة أبشر
    content.innerHTML = `
        <h2>تجهيز صور منصة أبشر</h2>
        <p>هنا سيتم وضع أداة تجهيز الصور.</p>
    `;
}


/* ===========================
   إغلاق المودال العادي
=========================== */
function closeModal() {
    document.getElementById("toolModal").style.display = "none";
}

/* ===========================
   إغلاق مودال أبشر
=========================== */
function closeAbsherModal() {
    document.getElementById("absherModal").style.display = "none";
}

/* ===========================
   إغلاق المودالات عند الضغط خارجها
=========================== */
window.onclick = function(event) {
    const modal = document.getElementById("toolModal");
    const absherModal = document.getElementById("absherModal");

    if (event.target === modal) {
        modal.style.display = "none";
    }

    if (event.target === absherModal) {
        absherModal.style.display = "none";
    }
};
