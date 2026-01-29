const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(createWindow);

// ---- IPC: Open file dialog ----
ipcMain.handle("file:openTex", async () => {
  const result = await dialog.showOpenDialog({
    title: "Open LaTeX file",
    properties: ["openFile"],
    filters: [{ name: "LaTeX", extensions: ["tex"] }]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, "utf-8");
  return { canceled: false, filePath, content };
});

// ---- IPC: Save file ----
ipcMain.handle("file:save", async (_event, { filePath, content }) => {
  fs.writeFileSync(filePath, content, "utf-8");
  return { ok: true };
});