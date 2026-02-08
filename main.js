/* ===========================
   فتح المودال العادي للأدوات
=========================== */
function openTool(toolName) {
    const modal = document.getElementById("toolModal");
    const content = document.getElementById("toolContent");

    modal.style.display = "block";
    content.innerHTML = `<h2>جاري تحميل أداة: ${toolName}</h2>
                         <p>سيتم إضافة محتوى الأداة لاحقًا داخل tools.js</p>`;
}

/* ===========================
   إغلاق المودال العادي
=========================== */
function closeModal() {
    document.getElementById("toolModal").style.display = "none";
}

/* ===========================
   فتح مودال أداة تجهيز صور أبشر (Full Screen)
=========================== */
function openAbsherTool() {
    const modal = document.getElementById("absherModal");
    const content = document.getElementById("absherToolContent");

    modal.style.display = "block";
    content.innerHTML = `
        <h2>أداة تجهيز صور منصة أبشر</h2>
        <p>سيتم إضافة واجهة الأداة لاحقًا داخل image-tools.js</p>
    `;
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
