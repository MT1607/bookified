import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export type UploadStatus = 'idle' | 'in-progress' | 'completed' | 'error';

interface LoadingOverlayProps {
  status?: UploadStatus;
  title?: string;
  description?: string;
  onClose?: () => void;
}

const LoadingOverlay = ({
  status = 'in-progress',
  title = 'Synthesizing Book',
  description = 'Transcribing PDF contents...',
  onClose,
}: LoadingOverlayProps) => {
  if (status === 'idle') return null;

  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper bg-white">
        <div className="loading-shadow relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <XCircle size={20} />
            </button>
          )}

          <div className="mb-4 flex justify-center">
            {status === 'in-progress' && (
              <Loader2 className="loading-animation h-12 w-12 text-[#663820]" />
            )}
            {status === 'completed' && (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>

          <h2 className="loading-title mb-2 text-center text-xl font-bold">
            {title}
          </h2>

          {description && (
            <div className="loading-progress mt-2 flex w-full justify-center">
              <div className="loading-progress-item flex items-center justify-center gap-2">
                {status === 'in-progress' && (
                  <span className="loading-progress-status" />
                )}
                <p className="text-center text-[#3d485e]">{description}</p>
              </div>
            </div>
          )}

          {(status === 'completed' || status === 'error') && onClose && (
            <div className="mt-6 flex w-full justify-center">
              <button
                onClick={onClose}
                className="w-full rounded-md bg-[#663820] px-6 py-2 font-bold text-white transition-colors hover:bg-[#8B7355]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
