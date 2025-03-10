import { electronAPI } from '@electron-toolkit/preload';
import { Chapter, Errors, Queue, UploadStatus, User } from '@prisma/client';
import { contextBridge, ipcRenderer } from 'electron';

// Custom APIs for renderer
const api = {
  getUser: (): Promise<User | null> => ipcRenderer.invoke('get-user'),
  saveUser: (data: SaveUserEntity): Promise<User> => ipcRenderer.invoke('save-user', data),
  removeUsers: (): Promise<User> => ipcRenderer.invoke('remove-users'),
  getCurrent: (
    queue_id: string
  ): Promise<(Queue & { chapters: Chapter[]; errors: Errors[] }) | null> =>
    ipcRenderer.invoke('get-current', queue_id),
  getQueue: (): Promise<{ current: Queue | null; queue: Queue[]; finished: Queue[] }> =>
    ipcRenderer.invoke('get-queue'),
  addQueue: (data: AddQueueEntity): Promise<Queue> => ipcRenderer.invoke('add-queue', data),
  removeQueue: (queue_id: string): Promise<Queue> => ipcRenderer.invoke('remove-queue', queue_id),
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke('select-folder'),
  getFolderContent: (
    folderPath: string
  ): Promise<{ name: string; path: string; isDirectory: boolean }[]> =>
    ipcRenderer.invoke('get-folder-content', folderPath)
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}

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
