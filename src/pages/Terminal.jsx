import React, { useEffect, useRef, useState, useCallback } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import "xterm/css/xterm.css";
import { useGitHub } from "@/contexts/GitHubContext";
import { 
  TerminalSquare, Activity, Package, GitBranch, AlertCircle,
  FileCode, Hash, CheckCircle2
} from "lucide-react";
import {
  LockedScreen, FileExplorer, CommandPalette,
  TerminalToolbar, TabBar, SpinnerIndicator
} from "./TerminalComponents";

const GITHUB_DARK = {
  background: "#0d1117",
  foreground: "#e6edf3",
  cursor: "#58a6ff",
  selection: "#334d5c",
  black: "#484f58",
  red: "#ff7b72",
  green: "#3fb950",
  yellow: "#d29922",
  blue: "#58a6ff",
  magenta: "#bc8cff",
  cyan: "#39c5cf",
  white: "#b1bac4",
  brightBlack: "#6e7681",
  brightRed: "#ffa198",
  brightGreen: "#56d364",
  brightYellow: "#e3b341",
  brightBlue: "#79c0ff",
  brightMagenta: "#d2a8ff",
  brightCyan: "#56d4dd",
  brightWhite: "#ffffff",
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 
  (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//localhost:3001';

const SESSION_KEY = "terminal_session_lines";
const MAX_SESSION_LINES = 200;

const TerminalPage = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const fontSizeRef = useRef(14);
  const [stats, setStats] = useState(null);
  const [deps, setDeps] = useState(null);
  const [gitStatus, setGitStatus] = useState(null);
  const [wsStatus, setWsStatus] = useState("connecting");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [cmdRunning, setCmdRunning] = useState(false);

  const { user } = useGitHub();
  const isLoggedIn = !!user;

  // --- Session persistence helpers ---
  const saveSession = useCallback((term) => {
    if (!term) return;
    const buf = term.buffer.active;
    const lines = [];
    const start = Math.max(0, buf.length - MAX_SESSION_LINES);
    for (let i = start; i < buf.length; i++) {
      const line = buf.getLine(i);
      if (line) lines.push(line.translateToString(true));
    }
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(lines)); } catch {}
  }, []);

  const replaySession = useCallback((term) => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const lines = JSON.parse(raw);
      if (Array.isArray(lines) && lines.length) {
        lines.forEach(l => term.writeln(l));
        term.writeln("\x1b[2m--- session restored ---\x1b[0m");
      }
    } catch {}
  }, []);

  // --- Dashboard fetches ---
  const fetchStats = async () => {
    try { const r = await fetch(`${API_URL}/stats`); setStats(await r.json()); } catch {}
  };
  const fetchDeps = async () => {
    try { const r = await fetch(`${API_URL}/deps`); setDeps(await r.json()); } catch {}
  };
  const fetchGitStatus = async () => {
    try { const r = await fetch(`${API_URL}/git/status`); setGitStatus(await r.json()); } catch {}
  };

  useEffect(() => { fetchStats(); fetchDeps(); fetchGitStatus(); }, []);

  // --- Command palette global shortcut ---
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "p") { e.preventDefault(); setShowPalette(v => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // --- Terminal init (only when authenticated) ---
  useEffect(() => {
    if (!terminalRef.current || !isLoggedIn) return;

    const term = new XTerm({
      theme: GITHUB_DARK,
      fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
      fontSize: fontSizeRef.current,
      cursorBlink: true,
      convertEol: true,
      allowProposedApi: true,
      rightClickSelectsWord: false,
      macOptionIsMeta: true,
    });

    const container = terminalRef.current;

    // DOM-level keyboard capture BEFORE xterm
    const handleKeydown = (e) => {
      // Font size
      if (e.ctrlKey && (e.key === "=" || e.key === "+")) {
        e.preventDefault(); e.stopPropagation();
        fontSizeRef.current = Math.min(28, fontSizeRef.current + 1);
        term.options.fontSize = fontSizeRef.current;
        if (fitAddonRef.current) fitAddonRef.current.fit();
        return;
      }
      if (e.ctrlKey && e.key === "-") {
        e.preventDefault(); e.stopPropagation();
        fontSizeRef.current = Math.max(8, fontSizeRef.current - 1);
        term.options.fontSize = fontSizeRef.current;
        if (fitAddonRef.current) fitAddonRef.current.fit();
        return;
      }
      // Ctrl+Shift+V → paste
      if (e.ctrlKey && e.shiftKey && (e.key === 'V' || e.code === 'KeyV')) {
        e.preventDefault(); e.stopPropagation();
        navigator.clipboard.readText().then(text => {
          if (text && wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(text);
        }).catch(() => {});
        return;
      }
      // Ctrl+Shift+C → copy
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.code === 'KeyC')) {
        e.preventDefault(); e.stopPropagation();
        const sel = term.getSelection();
        if (sel) navigator.clipboard.writeText(sel).catch(() => {});
        return;
      }
      // Ctrl+C with selection
      if (e.ctrlKey && !e.shiftKey && (e.key === 'C' || e.code === 'KeyC')) {
        const sel = term.getSelection();
        if (sel) {
          e.preventDefault(); e.stopPropagation();
          navigator.clipboard.writeText(sel).catch(() => {});
          term.clearSelection();
          return;
        }
      }
    };
    container.addEventListener('keydown', handleKeydown, true);

    const handleRightClick = (e) => {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        if (text && wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(text);
      }).catch(() => {});
    };
    container.addEventListener('contextmenu', handleRightClick);

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.open(container);

    // Replay saved session before WS connects
    replaySession(term);

    setTimeout(() => fitAddon.fit(), 100);
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome banner
    term.writeln("\x1b[1;36m╔══════════════════════════════════════════════════╗\x1b[0m");
    term.writeln("\x1b[1;36m║\x1b[0m  \x1b[1;37mgithub-cli\x1b[0m — \x1b[32mProduction Terminal\x1b[0m                 \x1b[1;36m║\x1b[0m");
    term.writeln("\x1b[1;36m║\x1b[0m  \x1b[33mvim, nano, git, node, npm available\x1b[0m             \x1b[1;36m║\x1b[0m");
    term.writeln("\x1b[1;36m║\x1b[0m  \x1b[2mCtrl+P: Command Palette | Ctrl+±: Font Size\x1b[0m    \x1b[1;36m║\x1b[0m");
    term.writeln("\x1b[1;36m╚══════════════════════════════════════════════════╝\x1b[0m");
    term.writeln("");

    // --- Prompt detection for spinner ---
    let currentLine = "";

    const connectWS = () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      const ws = new WebSocket(`${WS_URL}/ws`);
      ws.binaryType = "blob";
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus("connected");
        ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      };
      ws.onmessage = async (event) => {
        let text;
        if (event.data instanceof Blob) {
          const buf = await event.data.arrayBuffer();
          const bytes = new Uint8Array(buf);
          term.write(bytes);
          text = new TextDecoder().decode(bytes);
        } else {
          term.write(event.data);
          text = event.data;
        }
        // Prompt detection
        currentLine += text;
        if (/[$#]\s*$/.test(currentLine.split("\n").pop())) {
          setCmdRunning(false);
          currentLine = "";
        }
        // Save session periodically
        saveSession(term);
      };
      ws.onclose = () => {
        setWsStatus("disconnected");
        reconnectTimeoutRef.current = setTimeout(() => { setWsStatus("connecting"); connectWS(); }, 3000);
      };
      ws.onerror = () => { setWsStatus("error"); ws.close(); };
    };

    connectWS();

    // Track commands for history + spinner
    let inputBuffer = "";
    term.onData((data) => {
      if (data === '\x16') return;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
      // Track Enter to detect commands
      if (data === '\r' || data === '\n') {
        const cmd = inputBuffer.trim();
        if (cmd) {
          setCmdRunning(true);
          setCommandHistory(prev => {
            const next = [cmd, ...prev.filter(c => c !== cmd)].slice(0, 10);
            return next;
          });
        }
        inputBuffer = "";
      } else if (data === '\x7f') {
        inputBuffer = inputBuffer.slice(0, -1);
      } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
        inputBuffer += data;
      }
    });

    term.onResize(({ cols, rows }) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "resize", cols, rows }));
      }
    });

    const handleResize = () => { if (fitAddonRef.current) fitAddonRef.current.fit(); };
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (terminalRef.current) resizeObserver.observe(terminalRef.current);

    const handleBuddyCommand = (e) => {
      const { command } = e.detail;
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(command + "\r");
    };
    const handleBuddyGetOutput = (e) => {
      if (!xtermRef.current) return;
      const t = xtermRef.current;
      const buffer = t.buffer.active;
      let output = "";
      for (let i = Math.max(0, buffer.baseY + buffer.viewportY - 50); i < buffer.baseY + buffer.viewportY + t.rows; i++) {
        const line = buffer.getLine(i);
        if (line) output += line.translateToString(true) + "\n";
      }
      const callback = e.detail?.callback;
      if (callback) callback(output);
    };

    window.addEventListener("buddy_terminal_command", handleBuddyCommand);
    window.addEventListener("buddy_get_output", handleBuddyGetOutput);

    return () => {
      saveSession(term);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("buddy_terminal_command", handleBuddyCommand);
      window.removeEventListener("buddy_get_output", handleBuddyGetOutput);
      if (container) {
        container.removeEventListener('keydown', handleKeydown, true);
        container.removeEventListener('contextmenu', handleRightClick);
      }
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      resizeObserver.disconnect();
      term.dispose();
      if (wsRef.current) wsRef.current.close();
    };
  }, [isLoggedIn]);

  // Close history dropdown on outside click
  useEffect(() => {
    if (!showHistory) return;
    const close = () => setShowHistory(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showHistory]);

  // --- Dashboard Renderers (unchanged logic) ---
  const renderStats = () => {
    if (!stats) return <div className="animate-pulse h-40 bg-[#161b22] rounded-lg"></div>;
    const total = stats.total_files || 0;
    const types = stats.file_types || {};
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode size={18} className="text-[#79c0ff]" />
            <span className="text-[14px] font-semibold">Project Stats</span>
          </div>
          <span className="text-[12px] text-[#8b949e]">{total} files</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0d1117] p-3 rounded-md border border-[#30363d]">
            <div className="text-[12px] text-[#8b949e] mb-1 uppercase tracking-wider">Lines of Code</div>
            <div className="text-xl font-bold flex items-center gap-2">
              <Hash size={16} className="text-[#3fb950]" />
              {stats.total_lines?.toLocaleString() || 0}
            </div>
          </div>
          <div className="bg-[#0d1117] p-3 rounded-md border border-[#30363d]">
            <div className="text-[12px] text-[#8b949e] mb-1 uppercase tracking-wider">Avg. Size</div>
            <div className="text-xl font-bold">{stats.avg_size || "0 KB"}</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-[12px] text-[#8b949e]">File Distribution</div>
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-[#30363d]">
            {Object.entries(types).map(([ext, count], idx) => {
              const pct = (count / total) * 100;
              const colors = ["#2f81f7", "#3fb950", "#d29922", "#f85149", "#db61a2"];
              return <div key={ext} style={{ width: `${pct}%`, backgroundColor: colors[idx % colors.length] }} title={`${ext}: ${count}`} />;
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(types).map(([ext, count], idx) => {
              const colors = ["#2f81f7", "#3fb950", "#d29922", "#f85149", "#db61a2"];
              return (
                <div key={ext} className="flex items-center gap-1.5 text-[11px]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                  <span className="text-[#e6edf3]">{ext}</span>
                  <span className="text-[#8b949e]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDeps = () => {
    if (!deps) return <div className="animate-pulse h-40 bg-[#161b22] rounded-lg"></div>;
    const prodDeps = Object.entries(deps.dependencies || {});
    const devDeps = Object.entries(deps.devDependencies || {});
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-[#d29922]" />
            <span className="text-[14px] font-semibold">Dependencies</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#23863622] text-[#3fb950] border border-[#23863644]">{prodDeps.length} Prod</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#a371f722] text-[#a371f7] border border-[#a371f744]">{devDeps.length} Dev</span>
          </div>
        </div>
        <div className="max-h-[120px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent">
          <div className="grid grid-cols-1 gap-1">
            {prodDeps.map(([name, version]) => (
              <div key={name} className="flex items-center justify-between py-1 px-2 hover:bg-[#0d1117] rounded transition-colors group">
                <span className="text-[13px] text-[#c9d1d9] group-hover:text-[#58a6ff]">{name}</span>
                <span className="text-[11px] text-[#8b949e] font-mono">{version.replace("^", "")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGit = () => {
    if (!gitStatus) return <div className="animate-pulse h-24 bg-[#161b22] rounded-lg"></div>;
    const output = gitStatus.output || "";
    const isClean = output.includes("nothing to commit, working tree clean");
    const branchMatch = output.match(/On branch (.+)/);
    const branch = branchMatch ? branchMatch[1] : "unknown";
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-[#ff7b72]" />
            <span className="text-[14px] font-semibold">Git Status</span>
          </div>
          {isClean ? (
            <div className="flex items-center gap-1 text-[#3fb950] text-[12px]"><CheckCircle2 size={14} /><span>Clean</span></div>
          ) : (
            <div className="flex items-center gap-1 text-[#d29922] text-[12px]"><AlertCircle size={14} /><span>Dirty</span></div>
          )}
        </div>
        <div className="bg-[#0d1117] p-3 rounded-md border border-[#30363d] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#8b949e] uppercase">Current Branch</span>
            <span className="text-[14px] font-mono text-[#58a6ff]">{branch}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#8b949e] uppercase">State</span>
            <div className="text-[13px] text-[#c9d1d9]">{isClean ? "Up to date" : "Uncommitted changes"}</div>
          </div>
        </div>
      </div>
    );
  };

  // --- Render ---
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0d1117] text-[#e6edf3] font-sans">
        <LockedScreen onLogin={() => window.location.href = "/"} />
      </div>
    );
  }

  const terminalPanelClass = isFullscreen
    ? "fixed inset-0 z-40 flex flex-col bg-[#0d1117]"
    : "flex-1 flex flex-col bg-[#0d1117] min-w-0 overflow-hidden";

  return (
    <div className={`flex flex-col ${isFullscreen ? "" : "h-[calc(100vh-64px)]"} bg-[#0d1117] text-[#e6edf3] font-sans`}>
      <div className={`flex flex-1 overflow-hidden ${isFullscreen ? "" : "flex-col lg:flex-row"}`}>
        {/* Left Panel - Dashboard */}
        {!isFullscreen && (
          <div className="hidden lg:block w-[380px] border-r border-[#30363d] bg-[#0d1117] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={20} className="text-[#3fb950]" />
              <h2 className="text-lg font-bold">Live Dashboard</h2>
            </div>
            <div className="space-y-6">
              <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">{renderStats()}</section>
              <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">{renderDeps()}</section>
              <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">{renderGit()}</section>
              <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
                <FileExplorer wsRef={wsRef} />
              </section>
            </div>
          </div>
        )}

        {/* Right Panel - Terminal */}
        <div className={terminalPanelClass}>
          {/* Header */}
          <div className="h-12 border-b border-[#30363d] flex items-center justify-between px-4 sm:px-6 bg-[#161b22] shrink-0">
            <div className="flex items-center gap-3">
              <TerminalSquare size={18} className="text-[#8b949e]" />
              <span className="text-[13px] font-medium text-[#c9d1d9] truncate">github-cli — terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                wsStatus === "connected" ? "bg-[#3fb950] shadow-[0_0_8px_#3fb950]" : 
                wsStatus === "connecting" ? "bg-[#d29922]" : "bg-[#f85149]"
              }`} />
              <span className="text-[11px] text-[#8b949e] uppercase tracking-wider font-semibold">{wsStatus}</span>
            </div>
          </div>
          {/* Tab Bar */}
          <TabBar />
          {/* Toolbar */}
          <TerminalToolbar
            wsRef={wsRef} xtermRef={xtermRef}
            isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}
            commandHistory={commandHistory}
            showHistory={showHistory} setShowHistory={setShowHistory}
          />
          {/* Terminal */}
          <div className="flex-1 p-2 sm:p-4 relative min-h-0 overflow-hidden">
            <SpinnerIndicator running={cmdRunning} />
            <CommandPalette visible={showPalette} onClose={() => setShowPalette(false)} wsRef={wsRef} />
            <div 
              ref={terminalRef} 
              className="absolute inset-2 sm:inset-4 overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;
