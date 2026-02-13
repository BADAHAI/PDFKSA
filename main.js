/* ===========================
   فتح مودال أداة أبشر
=========================== */
function openAbsherTool() {
    const modal = document.getElementById("absherModal");
    const content = document.getElementById("absherToolContent");

    modal.style.display = "block";

    // تحميل واجهة أداة أبشر من ملف image-tools.js
    if (typeof loadAbsherTool === "function") {
        loadAbsherTool(content);
    } else {
        content.innerHTML = "<p>تعذر تحميل الأداة. تأكد من تحميل image-tools.js</p>";
    }
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
/* ===========================
   فتح أداة إزالة الخلفية AI
=========================== */
function openRemoveBGTool() {
    const modal = document.getElementById("pdfModal");
    const content = document.getElementById("pdfToolContent");

    modal.style.display = "block";

    // تحميل واجهة الأداة من tools.js
    if (typeof loadRemoveBGTool === "function") {
        loadRemoveBGTool(content);
    } else {
        content.innerHTML = "<p>تعذر تحميل أداة إزالة الخلفية. تأكد من تحميل tools.js</p>";
    }
}
