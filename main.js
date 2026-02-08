/* ===========================
   فتح مودال أداة أبشر
=========================== */
function openAbsherTool() {
    const modal = document.getElementById("absherModal");
    const content = document.getElementById("absherToolContent");

    modal.style.display = "block";

    content.innerHTML = `
        <h2>تجهيز صور منصة أبشر</h2>
        <p>هنا سيتم وضع أداة تجهيز الصور.</p>
    `;
}

/* ===========================
   فتح المودال العادي (احتياطي)
=========================== */
function openTool(toolName) {
    const modal = document.getElementById("toolModal");
    const content = document.getElementById("toolContent");

    modal.style.display = "block";
    content.innerHTML = `<h2>${toolName}</h2>`;
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
