import { PDFDocument, rgb, StandardFonts } from "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm";

const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const fileList = document.getElementById("fileList");
const fileItemTemplate = document.getElementById("fileItemTemplate");
const emptyState = document.getElementById("emptyState");
const fileCount = document.getElementById("fileCount");
const statusBanner = document.getElementById("statusBanner");
const clearButton = document.getElementById("clearButton");
const mergeButton = document.getElementById("mergeButton");

const acceptedTypes = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);
const acceptedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

let items = [];
let draggedId = null;
let statusTimer = null;
let idCounter = 0;

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const showStatus = (message, type = "") => {
  if (statusTimer) {
    window.clearTimeout(statusTimer);
  }
  statusBanner.textContent = message;
  statusBanner.className = `status-banner ${type}`.trim();
  if (message) {
    statusTimer = window.setTimeout(() => {
      statusBanner.textContent = "";
      statusBanner.className = "status-banner";
    }, 4500);
  }
};

const getFileKind = (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (acceptedTypes.has(extension)) return extension;
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return file.type.split("/")[1];
  return "";
};

const isAllowedFile = (file) => {
  const kind = getFileKind(file);
  return acceptedTypes.has(kind) || acceptedMimeTypes.has(file.type);
};

const updateEmptyState = () => {
  const hasItems = items.length > 0;
  emptyState.classList.toggle("hidden", hasItems);
  fileList.classList.toggle("hidden", !hasItems);
  clearButton.disabled = !hasItems;
  mergeButton.disabled = !hasItems;
  fileCount.textContent = `${items.length} file`;
};

const getTypeLabel = (kind) => {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "jpg":
      return "JPG";
    case "jpeg":
      return "JPEG";
    case "png":
      return "PNG";
    case "webp":
      return "WEBP";
    default:
      return "FILE";
  }
};

const renderPdfIcon = () => {
  const icon = document.createElement("div");
  icon.className = "pdf-icon";
  icon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 15.5h1.3c1.5 0 2.7-1.2 2.7-2.7s-1.2-2.7-2.7-2.7H8.5z" />
      <path d="M14.8 10.1v5.4" />
      <path d="M17.5 10.1v5.4" />
      <path d="M17.5 12.9h-2.7" />
    </svg>`;
  return icon;
};

const createItemElement = (item) => {
  const node = fileItemTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.id = item.id;

  const preview = node.querySelector(".file-preview");
  const name = node.querySelector(".file-name");
  const type = node.querySelector(".file-type");
  const size = node.querySelector(".file-size");
  const upButton = node.querySelector(".move-up-button");
  const downButton = node.querySelector(".move-down-button");
  const removeButton = node.querySelector(".remove-button");

  name.textContent = item.file.name;
  type.textContent = getTypeLabel(item.kind);
  size.textContent = `${formatBytes(item.file.size)} • ${item.kind === "pdf" ? "dokumen" : "gambar"}`;

  if (item.kind === "pdf") {
    preview.appendChild(renderPdfIcon());
  } else {
    const image = document.createElement("img");
    image.src = item.previewUrl;
    image.alt = item.file.name;
    preview.appendChild(image);
  }

  upButton.addEventListener("click", () => moveItem(item.id, -1));
  downButton.addEventListener("click", () => moveItem(item.id, 1));
  removeButton.addEventListener("click", () => removeItem(item.id));

  node.addEventListener("dragstart", (event) => {
    draggedId = item.id;
    node.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item.id);
  });

  node.addEventListener("dragend", () => {
    draggedId = null;
    node.classList.remove("is-dragging");
    [...fileList.children].forEach((child) => child.classList.remove("is-drop-target"));
  });

  node.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (draggedId && draggedId !== item.id) {
      node.classList.add("is-drop-target");
    }
  });

  node.addEventListener("dragleave", () => node.classList.remove("is-drop-target"));

  node.addEventListener("drop", (event) => {
    event.preventDefault();
    node.classList.remove("is-drop-target");
    const sourceId = event.dataTransfer.getData("text/plain") || draggedId;
    if (sourceId && sourceId !== item.id) {
      reorderByDrop(sourceId, item.id);
    }
  });

  return node;
};

const renderList = () => {
  fileList.innerHTML = "";
  items.forEach((item) => {
    fileList.appendChild(createItemElement(item));
  });
  updateEmptyState();
};

const addFiles = async (files) => {
  const incoming = [...files];
  if (incoming.length === 0) return;

  const invalidFiles = incoming.filter((file) => !isAllowedFile(file));
  if (invalidFiles.length > 0) {
    showStatus(
      `File ditolak: ${invalidFiles.map((file) => file.name).join(", ")}. Hanya PDF, JPG, JPEG, PNG, dan WEBP yang diizinkan.`,
      "error",
    );
  }

  const validFiles = incoming.filter((file) => isAllowedFile(file));
  if (validFiles.length === 0) return;

  const preparedItems = await Promise.all(
    validFiles.map(async (file) => ({
      id: `${Date.now()}-${idCounter++}`,
      file,
      kind: getFileKind(file),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    })),
  );

  items = [...items, ...preparedItems];
  renderList();
  showStatus(`${preparedItems.length} file berhasil ditambahkan.`, "success");
};

const removeItem = (id) => {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return;
  const [removed] = items.splice(index, 1);
  if (removed.previewUrl) {
    URL.revokeObjectURL(removed.previewUrl);
  }
  renderList();
  showStatus(`File ${removed.file.name} dihapus.`, "success");
};

const moveItem = (id, direction) => {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return;
  [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
  renderList();
};

const reorderByDrop = (sourceId, targetId) => {
  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;
  const [source] = items.splice(sourceIndex, 1);
  const adjustedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  items.splice(adjustedTarget, 0, source);
  renderList();
};

const resetAll = () => {
  items.forEach((item) => {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
  items = [];
  renderList();
  showStatus("Daftar file dibersihkan.", "success");
};

const loadImageData = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      URL.revokeObjectURL(objectUrl);
      resolve({ dataUrl, width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Gagal memuat gambar ${file.name}.`));
    };
    image.src = objectUrl;
  });

const mergeDocuments = async () => {
  if (items.length === 0) return;

  mergeButton.disabled = true;
  mergeButton.textContent = "Menggabungkan...";

  try {
    const mergedPdf = await PDFDocument.create();
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);

    for (const item of items) {
      if (item.kind === "pdf") {
        const sourceBytes = await item.file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(sourceBytes);
        const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        continue;
      }

      const { dataUrl } = await loadImageData(item.file);
      const imageBytes = await fetch(dataUrl).then((response) => response.arrayBuffer());
      const embeddedImage = await mergedPdf.embedPng(imageBytes);
      const page = mergedPdf.addPage([embeddedImage.width, embeddedImage.height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: embeddedImage.width,
        height: embeddedImage.height,
      });
      page.drawRectangle({
        x: 16,
        y: page.getHeight() - 44,
        width: Math.min(page.getWidth() - 32, 360),
        height: 28,
        color: rgb(0, 0, 0),
        opacity: 0.45,
      });
      page.drawText(item.file.name, {
        x: 24,
        y: page.getHeight() - 37,
        size: 11,
        font,
        color: rgb(1, 1, 1),
      });
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "merged-document.pdf";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showStatus("PDF berhasil digabung dan sedang diunduh.", "success");
  } catch (error) {
    console.error(error);
    showStatus(error instanceof Error ? error.message : "Gagal menggabungkan file.", "error");
  } finally {
    mergeButton.disabled = items.length === 0;
    mergeButton.textContent = "Gabungkan PDF";
  }
};

fileInput.addEventListener("change", async (event) => {
  await addFiles(event.target.files ?? []);
  fileInput.value = "";
});

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("is-dragover");
});

dropzone.addEventListener("dragleave", (event) => {
  if (!dropzone.contains(event.relatedTarget)) {
    dropzone.classList.remove("is-dragover");
  }
});

dropzone.addEventListener("drop", async (event) => {
  event.preventDefault();
  dropzone.classList.remove("is-dragover");
  await addFiles(event.dataTransfer.files ?? []);
});

clearButton.addEventListener("click", resetAll);
mergeButton.addEventListener("click", mergeDocuments);

updateEmptyState();