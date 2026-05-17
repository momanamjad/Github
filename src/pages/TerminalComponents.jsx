import React, { useState, useEffect, useRef } from "react";
import { FolderOpen, File, ChevronRight, Search, X, Maximize2, Minimize2, Trash2, Copy, ChevronDown, Plus, Lock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// --- Locked Screen ---
export const LockedScreen = ({ onLogin }) => (
  <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
    <div className="text-center space-y-6 p-8 bg-[#161b22] rounded-2xl border border-[#30363d] shadow-2xl max-w-md w-full mx-4">
      <div className="w-20 h-20 mx-auto rounded-full bg-[#21262d] flex items-center justify-center border border-[#30363d]">
        <Lock size={36} className="text-[#8b949e]" />
      </div>
      <h2 className="text-2xl font-bold text-[#e6edf3]">Terminal Access</h2>
      <p className="text-[#8b949e] text-sm leading-relaxed">
        Sign in with your GitHub account to access the live terminal session.
      </p>
      <button
        onClick={onLogin}
        className="w-full py-3 px-6 bg-[#238636] hover:bg-[#2ea043] text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        Sign in with GitHub
      </button>
    </div>
  </div>
);

// --- File Explorer ---
export const FileExplorer = ({ wsRef }) => {
  const [currentPath, setCurrentPath] = useState(".");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDir = async (path) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ls?path=${encodeURIComponent(path)}`);
      const text = await res.text();
      const lines = text.split("\n").filter(Boolean);
      const parsed = lines.map(line => {
        const isDir = line.endsWith("/");
        const name = isDir ? line.slice(0, -1) : line;
        return { name, isDir };
      }).filter(e => e.name && e.name !== "." && e.name !== "..");
      parsed.sort((a, b) => (b.isDir - a.isDir) || a.name.localeCompare(b.name));
      setEntries(parsed);
    } catch { setEntries([]); }
    setLoading(false);
  };

  useEffect(() => { fetchDir(currentPath); }, [currentPath]);

  const breadcrumbs = currentPath === "." ? ["project"] : ["project", ...currentPath.split("/").filter(Boolean)];

  const handleClick = (entry) => {
    if (entry.isDir) {
      setCurrentPath(currentPath === "." ? entry.name : `${currentPath}/${entry.name}`);
    } else {
      const filePath = currentPath === "." ? entry.name : `${currentPath}/${entry.name}`;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(`cat ${filePath}\r`);
      }
    }
  };

  const navigateBreadcrumb = (idx) => {
    if (idx === 0) setCurrentPath(".");
    else {
      const parts = currentPath.split("/").filter(Boolean);
      setCurrentPath(parts.slice(0, idx).join("/"));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FolderOpen size={18} className="text-[#58a6ff]" />
        <span className="text-[14px] font-semibold">File Explorer</span>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-[#8b949e] flex-wrap">
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={10} className="text-[#484f58]" />}
            <button onClick={() => navigateBreadcrumb(i)} className="hover:text-[#58a6ff] transition-colors">{b}</button>
          </React.Fragment>
        ))}
      </div>
      <div className="max-h-[180px] overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent">
        {currentPath !== "." && (
          <button onClick={() => {
            const parts = currentPath.split("/").filter(Boolean);
            parts.pop();
            setCurrentPath(parts.length ? parts.join("/") : ".");
          }} className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-[#0d1117] rounded transition-colors text-[13px] text-[#8b949e]">
            <FolderOpen size={14} className="text-[#d29922]" /> ..
          </button>
        )}
        {loading ? (
          <div className="text-[12px] text-[#8b949e] py-4 text-center animate-pulse">Loading...</div>
        ) : entries.map((e, i) => (
          <button key={i} onClick={() => handleClick(e)} className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-[#0d1117] rounded transition-colors text-[13px] text-left group">
            {e.isDir ? <FolderOpen size={14} className="text-[#58a6ff] shrink-0" /> : <File size={14} className="text-[#8b949e] shrink-0" />}
            <span className={`truncate ${e.isDir ? "text-[#58a6ff]" : "text-[#c9d1d9]"} group-hover:text-[#e6edf3]`}>{e.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Command Palette ---
export const CommandPalette = ({ visible, onClose, wsRef }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const commands = [
    "git status", "git log --oneline -10", "git branch", "ls",
    "npm run build", "npm run dev", "cat package.json",
  ];

  useEffect(() => {
    if (visible && inputRef.current) inputRef.current.focus();
  }, [visible]);

  if (!visible) return null;

  const filtered = commands.filter(c => c.toLowerCase().includes(query.toLowerCase()));

  const run = (cmd) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(cmd + "\r");
    }
    onClose();
    setQuery("");
  };

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center pt-[15%] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[480px] max-w-[90vw] bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d]">
          <Search size={16} className="text-[#8b949e]" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") onClose(); if (e.key === "Enter" && filtered.length) run(filtered[0]); }}
            className="flex-1 bg-transparent text-[14px] text-[#e6edf3] outline-none placeholder-[#484f58]" placeholder="Type a command..." />
          <button onClick={onClose}><X size={16} className="text-[#484f58] hover:text-[#e6edf3]" /></button>
        </div>
        <div className="max-h-[280px] overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button key={i} onClick={() => run(cmd)}
              className="w-full text-left px-4 py-2.5 text-[13px] font-mono text-[#c9d1d9] hover:bg-[#21262d] transition-colors flex items-center gap-3">
              <span className="text-[#3fb950]">$</span> {cmd}
            </button>
          ))}
          {!filtered.length && <div className="px-4 py-6 text-center text-[13px] text-[#484f58]">No matching commands</div>}
        </div>
      </div>
    </div>
  );
};

// --- Terminal Toolbar ---
export const TerminalToolbar = ({ wsRef, xtermRef, isFullscreen, setIsFullscreen, commandHistory, setShowHistory, showHistory }) => {
  const handleClear = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("clear\r");
  };
  const handleCopy = () => {
    if (xtermRef.current) {
      const sel = xtermRef.current.getSelection();
      if (sel) navigator.clipboard.writeText(sel).catch(() => {});
    }
  };

  return (
    <div className="h-9 border-b border-[#30363d] flex items-center gap-1 px-3 bg-[#161b22] shrink-0">
      <button onClick={handleClear} className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors" title="Clear">
        <Trash2 size={12} /> Clear
      </button>
      <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors" title="Copy">
        <Copy size={12} /> Copy
      </button>
      <button onClick={() => setIsFullscreen(!isFullscreen)} className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors" title="Fullscreen">
        {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        {isFullscreen ? "Exit" : "Fullscreen"}
      </button>
      <div className="relative ml-auto">
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors">
          <ChevronDown size={12} /> History
        </button>
        {showHistory && commandHistory.length > 0 && (
          <div className="absolute right-0 top-full mt-1 w-[260px] bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl z-30 py-1 max-h-[200px] overflow-y-auto">
            {commandHistory.map((cmd, i) => (
              <button key={i} onClick={() => { if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(cmd + "\r"); setShowHistory(false); }}
                className="w-full text-left px-3 py-1.5 text-[12px] font-mono text-[#c9d1d9] hover:bg-[#21262d] truncate transition-colors">
                <span className="text-[#484f58] mr-2">$</span>{cmd}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Tab Bar ---
export const TabBar = () => (
  <div className="h-9 border-b border-[#30363d] flex items-center px-2 bg-[#0d1117] shrink-0">
    <div className="flex items-center gap-0.5">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border border-[#30363d] border-b-transparent rounded-t-md text-[12px] text-[#e6edf3] font-medium">
        <div className="w-2 h-2 rounded-full bg-[#3fb950]" />
        bash
      </div>
      <button className="flex items-center justify-center w-7 h-7 text-[#484f58] hover:text-[#8b949e] hover:bg-[#21262d] rounded transition-colors" title="New tab">
        <Plus size={14} />
      </button>
    </div>
  </div>
);

// --- Spinner Indicator ---
export const SpinnerIndicator = ({ running }) => {
  if (!running) return null;
  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-2.5 py-1 bg-[#161b22] border border-[#30363d] rounded-md">
      <div className="w-3 h-3 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
      <span className="text-[11px] text-[#8b949e]">Running...</span>
    </div>
  );
};
