import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

export const ErrorState = ({ 
  message = 'An error occurred while loading this section.', 
  onRetry, 
  error 
}) => {
  const displayMessage = error?.message || message;

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-center max-w-md mx-auto my-4 shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f85149]/10 text-[#f85149] mb-4">
        <AlertOctagon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-[#24292f] dark:text-white mb-2">
        Failed to load content
      </h3>
      <p className="text-sm text-[#57606a] dark:text-[#8b949e] mb-4 leading-relaxed">
        {displayMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2188ff] hover:bg-[#0062d6] active:bg-[#005cc5] text-white text-sm font-semibold rounded-md transition shadow-sm cursor-pointer"
        >
          <RotateCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
