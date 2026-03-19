import { create } from 'zustand';

export type UploadStatus = 'idle' | 'in-progress' | 'completed' | 'error';

interface UploadState {
  status: UploadStatus;
  title: string;
  description: string;
  setUploadState: (
    status: UploadStatus,
    title?: string,
    description?: string
  ) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  status: 'idle',
  title: '',
  description: '',
  setUploadState: (status, title = '', description = '') =>
    set({ status, title, description }),
  reset: () => set({ status: 'idle', title: '', description: '' }),
}));
