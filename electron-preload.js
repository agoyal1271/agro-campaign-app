// Preload script for security
// Exposes limited APIs to renderer process

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  nodeVersion: process.version
});
