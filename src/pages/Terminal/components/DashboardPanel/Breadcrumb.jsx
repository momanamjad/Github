import React from 'react';

export const Breadcrumb = ({ currentPath, activeWsRef }) => {
  return (
    <div className="flex items-center gap-1 text-xs text-[#8b949e] px-3 py-2 border border-[#30363d] rounded-lg bg-[#161b22] flex-wrap">
      <span className="flex-shrink-0">📍</span>
      {currentPath.split('/').filter(Boolean).length > 0 ? (
        currentPath.split('/').filter(Boolean).map((part, i, arr) => {
          const pathUpToNow = '/' + arr.slice(0, i + 1).join('/');
          return (
            <span key={i} className="flex items-center gap-1">
              <span
                className="hover:text-[#58a6ff] cursor-pointer transition-colors"
                onClick={() => {
                  if (activeWsRef.current?.readyState === WebSocket.OPEN) {
                    activeWsRef.current.send(`cd ${pathUpToNow}\r`);
                  }
                }}
                title={pathUpToNow}
              >
                {part}
              </span>
              {i < arr.length - 1 && <span className="text-[#484f58] flex-shrink-0">/</span>}
            </span>
          );
        })
      ) : (
        <span className="text-[#8b949e]">~</span>
      )}
    </div>
  );
};
