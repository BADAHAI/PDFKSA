/* ===========================
   فتح الأدوات داخل المودال العادي
=========================== */
function openTool(toolName) {
    const modal = document.getElementById("toolModal");
    const content = document.getElementById("toolContent");

    modal.style.display = "block";

    // ربط الأدوات الفعلية
    if (toolName === "merge") {
        content.innerHTML = `<iframe src="tools/merge.html" class="tool-frame"></iframe>`;
    }

    if (toolName === "compress") {
        content.innerHTML = `<iframe src="tools/compress.html" class="tool-frame"></iframe>`;
    }

    if (toolName === "pdf-to-img") {
        content.innerHTML = `<iframe src="tools/pdf-to-img.html" class="tool-frame"></iframe>`;
    }
}

/* ===========================
   فتح أداة أبشر في مودال كامل
=========================== */
function openAbsherTool() {
    const modal = document.getElementById("absherModal");
    const content = document.getElementById("absherToolContent");

    modal.style.display = "block";
    content.innerHTML = `<iframe src="tools/absher.html" class="tool-frame"></iframe>`;
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
