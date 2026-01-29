const { ipcRenderer } = window.nodeRequire("electron");

let editor = null;
let currentFilePath = null;

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function enableSave(enabled) {
  document.getElementById("saveBtn").disabled = !enabled;
}

// Initialize Monaco
window.require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: `% Larne\n\\documentclass{article}\n\\begin{document}\nHello, Larne.\n\\end{document}\n`,
    language: "latex",
    theme: "vs",
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14
  });

  setStatus("Ready (no file opened)");
});

// Open file
document.getElementById("openBtn").addEventListener("click", async () => {
  const res = await ipcRenderer.invoke("file:openTex");
  if (res.canceled) return;

  currentFilePath = res.filePath;
  editor.setValue(res.content);

  enableSave(true);
  setStatus(`Opened: ${currentFilePath}`);
});

// Save file
async function saveFile() {
  if (!currentFilePath) return;
  const content = editor.getValue();
  await ipcRenderer.invoke("file:save", { filePath: currentFilePath, content });
  setStatus(`Saved: ${currentFilePath}`);
}

document.getElementById("saveBtn").addEventListener("click", saveFile);

// Ctrl/Cmd + S
window.addEventListener("keydown", (e) => {
  const isMac = window.nodeProcess.platform === "darwin";
  const key = e.key.toLowerCase();

  const isSave =
    (isMac && e.metaKey && key === "s") ||
    (!isMac && e.ctrlKey && key === "s");

  if (isSave) {
    e.preventDefault();
    saveFile();
  }
});