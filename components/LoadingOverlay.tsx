import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = () => {
  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper bg-white">
        <div className="loading-shadow">
          <Loader2 className="loading-animation h-12 w-12 text-[#663820]" />
          <h2 className="loading-title">Synthesizing Book</h2>
          <div className="loading-progress">
            <div className="loading-progress-item">
              <span className="loading-progress-status" />
              <p className="text-[#3d485e]">Transcribing PDF contents...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
