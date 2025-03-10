import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { UploadStatus } from '@prisma/client';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { readdirSync, statSync } from 'fs';
import path, { join } from 'path';
import icon from '../../resources/icon.png?asset';
import { prisma } from '../database/prisma';

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  // =========================================================== //
  //                          USUÁRIO                            //
  // =========================================================== //
  ipcMain.handle('get-user', async () => {
    const user = await prisma.user.findFirst();
    return user;
  });

  ipcMain.handle('save-user', async (_, { id, ...data }: SaveUserEntity) => {
    const user = await prisma.user.upsert({
      where: { id: id },
      update: { ...data },
      create: { ...data }
    });
    return user;
  });

  ipcMain.handle('remove-users', async () => {
    const user = await prisma.user.deleteMany();
    return user;
  });

  // =========================================================== //
  //                            QUEUE                            //
  // =========================================================== //
  ipcMain.handle('get-current', async (_, queue_id: string) => {
    const status = await prisma.queue.findFirst({
      where: { id: queue_id },
      include: {
        chapters: true,
        errors: true
      }
    });

    return status;
  });

  ipcMain.handle('get-queue', async () => {
    const [current, queue, finished] = await Promise.all([
      prisma.queue.findFirst({ where: { status: 'PROCESSING' } }),
      prisma.queue.findMany({ where: { status: 'PENDING' } }),
      prisma.queue.findMany({ where: { status: { notIn: ['PROCESSING', 'PENDING'] } } })
    ]);

    return { current, queue, finished };
  });

  ipcMain.handle('add-queue', async (_, data: AddQueueEntity) => {
    const queue = await prisma.queue.create({ data });
    return queue;
  });

  ipcMain.handle('remove-queue', async (_, queue_id: string) => {
    const queue = await prisma.queue.deleteMany({ where: { id: queue_id } });
    return queue;
  });

  // =========================================================== //
  //                           OUTROS                            //
  // =========================================================== //
  ipcMain.handle('select-folder', async () => {
    const path = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: 'Selecione uma pasta com capítulos para upload',
      buttonLabel: 'Selecionar pasta'
    });

    if (!path.canceled) return null;
    return path.filePaths[0];
  });

  ipcMain.handle('get-folder-content', async (_, folderPath: string) => {
    try {
      const items = readdirSync(folderPath).map((item) => {
        const itemPath = path.join(folderPath, item);
        const isDirectory = statSync(itemPath).isDirectory();
        return { name: item, path: itemPath, isDirectory };
      });

      return items;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

interface SaveUserEntity {
  id?: string;
  api_id: number;
  email: string;
  username: string;
  token: string;
}

interface AddQueueEntity {
  api_id: number | null;
  path: string;
  status: UploadStatus;
  title: string;
  slug: string;
  cover: string | null;
  added_at: Date;
  started_at: Date | null;
  finished_at: Date | null;
  bytes: number;
}
