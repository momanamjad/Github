import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import {
  FolderOpen, File, ChevronRight, Search, X, Maximize2, Minimize2,
  Trash2, Copy, ChevronDown, Plus, Columns, Palette,
  ChevronUp, CaseSensitive, Save, ArrowUp, ArrowDown, Lock,
  Keyboard
} from "lucide-react";

// Lazy-load Monaco Editor (~2MB) — only loaded when a file is opened
const LazyMonacoEditor = lazy(() => import('@monaco-editor/react'));

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// =============================================
// TERMINAL THEMES (Upgrade 3)
// =============================================
export const TERMINAL_THEMES = {
  'GitHub Dark': { background: '#0d1117', foreground: '#e6edf3', cursor: '#58a6ff', selection: '#264f78',
    black: '#484f58', red: '#ff7b72', green: '#3fb950', yellow: '#d29922', blue: '#58a6ff', magenta: '#bc8cff', cyan: '#39c5cf', white: '#b1bac4',
    brightBlack: '#6e7681', brightRed: '#ffa198', brightGreen: '#56d364', brightYellow: '#e3b341', brightBlue: '#79c0ff', brightMagenta: '#d2a8ff', brightCyan: '#56d4dd', brightWhite: '#ffffff' },
  'Dracula': { background: '#282a36', foreground: '#f8f8f2', cursor: '#ff79c6', selection: '#44475a',
    black: '#21222c', red: '#ff5555', green: '#50fa7b', yellow: '#f1fa8c', blue: '#bd93f9', magenta: '#ff79c6', cyan: '#8be9fd', white: '#f8f8f2',
    brightBlack: '#6272a4', brightRed: '#ff6e6e', brightGreen: '#69ff94', brightYellow: '#ffffa5', brightBlue: '#d6acff', brightMagenta: '#ff92df', brightCyan: '#a4ffff', brightWhite: '#ffffff' },
  'Monokai': { background: '#272822', foreground: '#f8f8f2', cursor: '#f8f8f2', selection: '#49483e',
    black: '#272822', red: '#f92672', green: '#a6e22e', yellow: '#f4bf75', blue: '#66d9ef', magenta: '#ae81ff', cyan: '#a1efe4', white: '#f8f8f2',
    brightBlack: '#75715e', brightRed: '#f92672', brightGreen: '#a6e22e', brightYellow: '#f4bf75', brightBlue: '#66d9ef', brightMagenta: '#ae81ff', brightCyan: '#a1efe4', brightWhite: '#f9f8f5' },
  'One Dark': { background: '#282c34', foreground: '#abb2bf', cursor: '#528bff', selection: '#3e4451',
    black: '#282c34', red: '#e06c75', green: '#98c379', yellow: '#d19a66', blue: '#61afef', magenta: '#c678dd', cyan: '#56b6c2', white: '#abb2bf',
    brightBlack: '#5c6370', brightRed: '#e06c75', brightGreen: '#98c379', brightYellow: '#d19a66', brightBlue: '#61afef', brightMagenta: '#c678dd', brightCyan: '#56b6c2', brightWhite: '#ffffff' },
  'Solarized Dark': { background: '#002b36', foreground: '#839496', cursor: '#268bd2', selection: '#073642',
    black: '#073642', red: '#dc322f', green: '#859900', yellow: '#b58900', blue: '#268bd2', magenta: '#d33682', cyan: '#2aa198', white: '#eee8d5',
    brightBlack: '#002b36', brightRed: '#cb4b16', brightGreen: '#586e75', brightYellow: '#657b83', brightBlue: '#839496', brightMagenta: '#6c71c4', brightCyan: '#93a1a1', brightWhite: '#fdf6e3' },
};

// --- Locked Screen (Login required) ---
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

// =============================================
// FILE EXPLORER
// =============================================
export const FileExplorer = ({ wsRef, onOpenFile }) => {
  const [currentPath, setCurrentPath] = useState(".");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, entry, filePath }

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

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('contextmenu', close);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('contextmenu', close);
    };
  }, [contextMenu]);

  const breadcrumbs = currentPath === "." ? ["project"] : ["project", ...currentPath.split("/").filter(Boolean)];

  const getFullPath = (entryName) => {
    if (currentPath === ".") return entryName;
    return currentPath.endsWith('/') 
      ? `${currentPath}${entryName}` 
      : `${currentPath}/${entryName}`;
  };

  const handleClick = (entry) => {
    if (entry.isDir) {
      setCurrentPath(currentPath === "." ? entry.name : `${currentPath}/${entry.name}`);
    } else {
      const filePath = getFullPath(entry.name);
      if (onOpenFile) {
        onOpenFile(filePath);
      } else if (wsRef?.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(`cat ${filePath}\r`);
      }
    }
  };

  const handleRightClick = (e, entry) => {
    if (entry.isDir) return;
    e.preventDefault();
    e.stopPropagation();
    const filePath = getFullPath(entry.name);
    setContextMenu({ x: e.clientX, y: e.clientY, entry, filePath });
  };

  const downloadFile = async (filePath, fileName) => {
    try {
      const res = await fetch(`${API_URL}/file?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      const blob = new Blob([data.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const handleContextAction = (action) => {
    if (!contextMenu) return;
    const { entry, filePath } = contextMenu;
    setContextMenu(null);

    if (action === 'open') {
      if (onOpenFile) onOpenFile(filePath);
      else if (wsRef?.current?.readyState === WebSocket.OPEN) wsRef.current.send(`cat ${filePath}\r`);
    } else if (action === 'download') {
      downloadFile(filePath, entry.name);
    } else if (action === 'copy') {
      navigator.clipboard.writeText(filePath).catch(() => {});
    } else if (action === 'delete') {
      if (window.confirm(`Delete "${entry.name}"? This cannot be undone.`)) {
        if (wsRef?.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(`rm ${filePath}\r`);
          setTimeout(() => fetchDir(currentPath), 800);
        }
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
          <button
            key={i}
            onClick={() => handleClick(e)}
            onContextMenu={(ev) => handleRightClick(ev, e)}
            className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-[#0d1117] rounded transition-colors text-[13px] text-left group"
          >
            {e.isDir ? <FolderOpen size={14} className="text-[#58a6ff] shrink-0" /> : <File size={14} className="text-[#8b949e] shrink-0" />}
            <span className={`truncate ${e.isDir ? "text-[#58a6ff]" : "text-[#c9d1d9]"} group-hover:text-[#e6edf3]`}>{e.name}</span>
          </button>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[200] py-1 rounded-lg shadow-2xl border"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: '#161b22',
            borderColor: '#30363d',
            minWidth: '180px',
          }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { key: 'open',     icon: '📄', label: 'Open in Editor' },
            { key: 'download', icon: '⬇️', label: 'Download' },
            { key: 'copy',     icon: '📋', label: 'Copy Path' },
            { key: 'delete',   icon: '🗑️', label: 'Delete', danger: true },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => handleContextAction(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors text-left ${
                item.danger
                  ? 'text-[#f85149] hover:bg-[#21262d]'
                  : 'text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Command Palette ---
export const CommandPalette = ({ visible, onClose, wsRef }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const commands = [
    "git status", "git log --oneline -10", "git branch -a", "git diff",
    "ls -la", "cat package.json", "npm run build", "npm run dev", "npm install", "pwd", "clear",
  ];

  useEffect(() => {
    if (visible && inputRef.current) inputRef.current.focus();
  }, [visible]);

  if (!visible) return null;

  const filtered = commands.filter(c => c.toLowerCase().includes(query.toLowerCase()));

  const run = (cmd) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(cmd + "\n");
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

// =============================================
// KEYBOARD SHORTCUTS MODAL
// =============================================
export const ShortcutsModal = ({ visible, onClose }) => {
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  if (!visible) return null;

  const shortcuts = [
    { keys: 'Ctrl+Shift+C', desc: 'Copy selection' },
    { keys: 'Ctrl+Shift+V', desc: 'Paste' },
    { keys: 'Ctrl+L', desc: 'Clear screen' },
    { keys: 'Ctrl+U', desc: 'Clear line' },
    { keys: 'Ctrl+R', desc: 'Search history' },
    { keys: 'Ctrl+A', desc: 'Start of line' },
    { keys: 'Ctrl+E', desc: 'End of line' },
    { keys: 'Ctrl+W', desc: 'Delete word' },
    { keys: 'Ctrl+F', desc: 'Search terminal' },
    { keys: 'Ctrl+P', desc: 'Command palette' },
    { keys: 'Ctrl++ / Ctrl+-', desc: 'Zoom in/out' },
    { keys: '?', desc: 'This help modal' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[480px] max-w-[90vw] bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-[#58a6ff]" />
            <span className="text-[15px] font-semibold text-[#e6edf3]">Terminal Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#484f58] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider label */}
        <div className="px-6 pt-3 pb-1">
          <div className="h-px bg-[#30363d]" />
        </div>

        {/* Shortcuts List */}
        <div className="px-6 py-3 space-y-1 max-h-[400px] overflow-y-auto">
          {shortcuts.map(({ keys, desc }) => (
            <div key={keys} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#21262d] transition-colors group">
              <span className="text-[13px] text-[#8b949e] group-hover:text-[#c9d1d9]">{desc}</span>
              <kbd className="px-2 py-0.5 text-[11px] font-mono text-[#c9d1d9] bg-[#0d1117] border border-[#30363d] rounded-md shadow-sm whitespace-nowrap">
                {keys}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#30363d] flex items-center justify-between">
          <span className="text-[11px] text-[#484f58]">Press <kbd className="px-1 py-0.5 bg-[#0d1117] border border-[#30363d] rounded text-[10px]">Esc</kbd> or click outside to close</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[12px] text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================
// TERMINAL TOOLBAR
// =============================================
export const TerminalToolbar = ({
  wsRef, xtermRef, isFullscreen, setIsFullscreen,
  commandHistory, setShowHistory, showHistory,
  onSplit, isSplit, selectedTheme, onThemeChange,
  onShowShortcuts
}) => {
  const [showThemes, setShowThemes] = useState(false);

  const handleClear = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("clear\n");
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

      {/* Split Pane Button */}
      <button onClick={onSplit} className={`flex items-center gap-1.5 px-2 py-1 text-[11px] ${isSplit ? 'text-[#58a6ff]' : 'text-[#8b949e]'} hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors`} title={isSplit ? "Close Split" : "Split Pane"}>
        <Columns size={12} /> {isSplit ? "Unsplit" : "Split"}
      </button>

      {/* Shortcuts Button */}
      <button onClick={onShowShortcuts} className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors" title="Keyboard Shortcuts (?)">
        <Keyboard size={12} /> Keys
      </button>

      {/* Theme Dropdown */}
      <div className="relative">
        <button onClick={() => setShowThemes(!showThemes)} className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors">
          <Palette size={12} /> Theme
        </button>
        {showThemes && (
          <div className="absolute left-0 top-full mt-1 w-[180px] bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl z-30 py-1">
            {Object.keys(TERMINAL_THEMES).map(name => (
              <button key={name} onClick={() => { onThemeChange(name); setShowThemes(false); }}
                className={`w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center gap-2 ${
                  name === selectedTheme ? 'bg-[#21262d] text-[#58a6ff]' : 'text-[#c9d1d9] hover:bg-[#21262d]'
                }`}>
                <div className="w-3 h-3 rounded-full border border-[#484f58]" style={{ backgroundColor: TERMINAL_THEMES[name].background }} />
                {name}
                {name === selectedTheme && <span className="ml-auto text-[#3fb950]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative ml-auto">
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors">
          <ChevronDown size={12} /> History
        </button>
        {showHistory && (
          <div className="absolute right-0 top-full mt-1 w-[260px] bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl z-30 py-1 max-h-[200px] overflow-y-auto">
            {commandHistory && commandHistory.length > 0 ? (
              commandHistory.map((cmd, i) => (
                <button key={i} onClick={() => { if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(cmd + "\r"); setShowHistory(false); }}
                  className="w-full text-left px-3 py-1.5 text-[12px] font-mono text-[#c9d1d9] hover:bg-[#21262d] truncate transition-colors">
                  <span className="text-[#484f58] mr-2">$</span>{cmd}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-[12px] text-[#8b949e] italic text-center">No commands yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Tab Bar ---
export const TabBar = ({ tabs, activeTabId, onSelectTab, onNewTab, onCloseTab }) => (
  <div className="h-9 border-b border-[#30363d] flex items-center px-2 bg-[#0d1117] shrink-0">
    <div className="flex items-center gap-0.5 w-full overflow-x-auto overflow-y-hidden scrollbar-none">
      {tabs && tabs.map(tab => (
        <div 
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`flex items-center gap-2 px-3 py-1.5 border border-[#30363d] border-b-transparent rounded-t-md text-[12px] font-medium cursor-pointer transition-colors shrink-0 group ${
            tab.id === activeTabId 
              ? "bg-[#161b22] text-[#e6edf3]" 
              : "bg-[#0d1117] text-[#8b949e] hover:bg-[#161b22]/50 hover:text-[#e6edf3]"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-[#3fb950]" />
          <span>{tab.label}</span>
          {tabs.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="ml-1.5 p-0.5 rounded-full text-[#484f58] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors flex items-center justify-center"
              title="Close tab"
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}
      <button 
        onClick={onNewTab}
        className="flex items-center justify-center w-7 h-7 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors shrink-0" 
        title="New tab"
      >
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

// =============================================
// TERMINAL SEARCH BAR
// =============================================
export const TerminalSearchBar = ({ visible, onClose, searchAddonRef }) => {
  const [query, setQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [resultIndex, setResultIndex] = useState(0);
  const [resultCount, setResultCount] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [visible]);

  const doSearch = useCallback((searchQuery, options = {}) => {
    if (!searchAddonRef?.current || !searchQuery) {
      setResultCount(0);
      setResultIndex(0);
      return;
    }
    const addon = searchAddonRef.current;
    const found = addon.findNext(searchQuery, {
      caseSensitive: options.caseSensitive ?? caseSensitive,
      incremental: true,
    });
    if (found) {
      setResultCount(prev => Math.max(prev, 1));
    }
  }, [caseSensitive, searchAddonRef]);

  useEffect(() => {
    if (query) {
      doSearch(query);
    } else if (searchAddonRef?.current) {
      searchAddonRef.current.clearDecorations();
      setResultCount(0);
      setResultIndex(0);
    }
  }, [query, caseSensitive, doSearch, searchAddonRef]);

  const handleNext = () => {
    if (searchAddonRef?.current && query) {
      searchAddonRef.current.findNext(query, { caseSensitive, incremental: false });
      setResultIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (searchAddonRef?.current && query) {
      searchAddonRef.current.findPrevious(query, { caseSensitive });
      setResultIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleClose = () => {
    if (searchAddonRef?.current) {
      searchAddonRef.current.clearDecorations();
    }
    setQuery('');
    setResultCount(0);
    setResultIndex(0);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl"
      onClick={e => e.stopPropagation()}>
      <Search size={14} className="text-[#8b949e] shrink-0" />
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); handleNext(); }
          if (e.key === 'Escape') { e.preventDefault(); handleClose(); }
        }}
        className="w-[180px] bg-transparent text-[13px] text-[#e6edf3] outline-none placeholder-[#484f58]"
        placeholder="Search terminal..."
      />
      {query && (
        <span className="text-[11px] text-[#8b949e] shrink-0 min-w-[40px] text-center">
          {resultCount > 0 ? `${(resultIndex % resultCount) + 1} of ${resultCount}+` : 'No results'}
        </span>
      )}
      <button onClick={handlePrev} className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors" title="Previous">
        <ArrowUp size={14} />
      </button>
      <button onClick={handleNext} className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors" title="Next">
        <ArrowDown size={14} />
      </button>
      <button onClick={() => setCaseSensitive(!caseSensitive)}
        className={`p-1 rounded transition-colors ${caseSensitive ? 'text-[#58a6ff] bg-[#21262d]' : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'}`}
        title="Case Sensitive">
        <CaseSensitive size={14} />
      </button>
      <button onClick={handleClose} className="p-1 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors" title="Close">
        <X size={14} />
      </button>
    </div>
  );
};

// =============================================
// MONACO FILE EDITOR
// =============================================
const EXT_TO_LANG = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  py: 'python', rs: 'rust', go: 'go', rb: 'ruby', java: 'java',
  json: 'json', md: 'markdown', css: 'css', scss: 'scss', html: 'html',
  xml: 'xml', yaml: 'yaml', yml: 'yaml', toml: 'toml', sql: 'sql',
  sh: 'shell', bash: 'shell', zsh: 'shell', dockerfile: 'dockerfile',
  c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp', cs: 'csharp',
};

export const MonacoEditor = ({ filePath, onClose }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const editorRef = useRef(null);

  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const language = EXT_TO_LANG[ext] || 'plaintext';
  const fileName = filePath.split('/').pop();

  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/file?path=${encodeURIComponent(filePath)}`);
        const data = await res.json();
        setContent(data.content || '');
      } catch (e) {
        setContent(`// Error loading file: ${e.message}`);
      }
      setLoading(false);
    };
    fetchFile();
  }, [filePath]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('');
    try {
      const currentContent = editorRef.current?.getValue() || content;
      const res = await fetch(`${API_URL}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content: currentContent }),
      });
      const data = await res.json();
      setSaveStatus(data.output || 'Saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (e) {
      setSaveStatus(`Error: ${e.message}`);
    }
    setSaving(false);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-l border-[#30363d] animate-slideIn">
      {/* Editor Toolbar */}
      <div className="h-10 border-b border-[#30363d] flex items-center justify-between px-4 bg-[#161b22] shrink-0">
        <div className="flex items-center gap-2">
          <File size={14} className="text-[#8b949e]" />
          <span className="text-[13px] text-[#e6edf3] font-medium">{fileName}</span>
          <span className="text-[11px] text-[#484f58] font-mono">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className={`text-[11px] ${saveStatus.startsWith('Error') ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>
              {saveStatus}
            </span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] text-[#e6edf3] bg-[#238636] hover:bg-[#2ea043] rounded transition-colors disabled:opacity-50">
            <Save size={12} /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      {/* Editor Body */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
                <span className="text-[12px] text-[#8b949e]">Loading editor...</span>
              </div>
            }
          >
            <LazyMonacoEditor
              height="100%"
              language={language}
              value={content}
              theme="vs-dark"
              onMount={handleEditorMount}
              onChange={(value) => setContent(value || '')}
              options={{
                fontSize: 14,
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                padding: { top: 8 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};
