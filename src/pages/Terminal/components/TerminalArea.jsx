import React from "react";
import { X } from "lucide-react";
import {
  SpinnerIndicator,
  TerminalSearchBar,
  CommandPalette,
  MonacoEditor
} from "../TerminalComponents";

export const TerminalArea = ({
  isSplit,
  splitRatio,
  splitFocused,
  splitTermRef,
  splitContainerRef,
  splitFitRef,
  splitSearchRef,
  handleDividerMouseDown,
  handleSplitToggle,
  tabs,
  activeTabId,
  terminalRefs,
  cmdRunning,
  showSearch,
  setShowSearch,
  showPalette,
  setShowPalette,
  activeWsRef,
  editorFile,
  setEditorFile,
  searchAddonRef,
  setSplitFocused
}) => {
  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Terminal area */}
      <div className={`flex-1 relative min-h-0 overflow-hidden ${editorFile ? 'w-1/2' : 'w-full'}`} style={editorFile ? { flex: '0 0 50%' } : {}}>
        <div className="absolute inset-0 p-2 sm:p-4">
          <SpinnerIndicator running={cmdRunning} />
          <TerminalSearchBar
            visible={showSearch}
            onClose={() => setShowSearch(false)}
            searchAddonRef={splitFocused === 'right' ? splitSearchRef : searchAddonRef}
          />
          <CommandPalette visible={showPalette} onClose={() => setShowPalette(false)} wsRef={activeWsRef} />
          
          {/* Split or single pane terminal */}
          {isSplit ? (
            <div className="flex h-full gap-0">
              {/* Left Pane */}
              <div
                style={{ width: `${splitRatio}%` }}
                className={`relative overflow-hidden rounded-l-lg border bg-[#0d1117] transition-colors ${
                  splitFocused === 'left' ? 'border-[#58a6ff]' : 'border-[#30363d]'
                }`}
                onClick={() => setSplitFocused('left')}
              >
                {tabs.map(tab => (
                  <div
                    key={tab.id}
                    ref={el => { terminalRefs.current[tab.id] = el; }}
                    className={`absolute inset-0 overflow-hidden ${tab.id === activeTabId ? 'block' : 'hidden'}`}
                  />
                ))}
              </div>

              {/* Divider */}
              <div
                className="w-1.5 bg-[#21262d] hover:bg-[#58a6ff] cursor-col-resize transition-colors flex items-center justify-center shrink-0"
                onMouseDown={handleDividerMouseDown}
              >
                <div className="w-0.5 h-8 bg-[#484f58] rounded-full" />
              </div>

              {/* Right Pane */}
              <div
                style={{ width: `${100 - splitRatio}%` }}
                className={`relative overflow-hidden rounded-r-lg border bg-[#0d1117] transition-colors ${
                  splitFocused === 'right' ? 'border-[#58a6ff]' : 'border-[#30363d]'
                }`}
                onClick={() => setSplitFocused('right')}
              >
                {/* Close split button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleSplitToggle(); }}
                  className="absolute top-1 right-1 z-10 p-1 text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] rounded transition-colors"
                  title="Close split pane"
                >
                  <X size={14} />
                </button>
                <div
                  ref={splitContainerRef}
                  className="absolute inset-0 overflow-hidden"
                />
              </div>
            </div>
          ) : (
            // Single pane
            <>
              {tabs.map(tab => (
                <div 
                  key={tab.id}
                  ref={el => { terminalRefs.current[tab.id] = el; }}
                  className={`absolute inset-2 sm:inset-4 overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117] ${tab.id === activeTabId ? 'block' : 'hidden'}`}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Monaco Editor Panel */}
      {editorFile && (
        <div className="w-1/2 border-l border-[#30363d]" style={{ flex: '0 0 50%' }}>
          <MonacoEditor
            filePath={editorFile}
            onClose={() => setEditorFile(null)}
          />
        </div>
      )}
    </div>
  );
};
