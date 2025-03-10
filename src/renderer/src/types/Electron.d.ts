export {};

declare global {
    interface Window {
        electron: import('../../electron/preload').ElectronAPI;
    }
}
