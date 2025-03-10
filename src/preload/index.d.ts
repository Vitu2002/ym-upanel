import { ElectronAPI } from '@electron-toolkit/preload';
import { UploadStatus } from '@prisma/client';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getUser: () => Promise<User | null>;
      saveUser: (data: SaveUserEntity) => Promise<User>;
      removeUsers: () => Promise<User>;
      getCurrent: (
        queue_id: string
      ) => Promise<(Queue & { chapters: Chapter[]; errors: Errors[] }) | null>;
      getQueue: () => Promise<{ current: Queue | null; queue: Queue[]; finished: Queue[] }>;
      addQueue: (data: AddQueueEntity) => Promise<Queue>;
      removeQueue: (queue_id: string) => Promise<Queue>;
      selectFolder: () => Promise<string | null>;
      getFolderContent: (
        folderPath: string
      ) => Promise<{ name: string; path: string; isDirectory: boolean }[]>;
    };
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
}
