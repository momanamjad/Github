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
  const terminalRefs = useRef({});
  const tabsRef = useRef({});
  const activeXtermRef = useRef(null);
  const activeWsRef = useRef(null);
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

  // Dynamic Tabs State (Fix 3)
  const [tabs, setTabs] = useState([{ id: 1, label: "bash" }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const activeTabIdRef = useRef(activeTabId);
  const nextTabId = useRef(2);

  // Keep activeTabIdRef updated
  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  // Track command history (Fix 1)
  const commandHistoryRef = useRef([]);
  const currentCommandRef = useRef('');

  const { user } = useGitHub();
  const isLoggedIn = !!user;

  // --- Session persistence helpers ---
  const lastSaveTimeRef = useRef(0);
  const saveSession = useCallback((term, force = false) => {
    if (!term) return;
    const now = Date.now();
    if (!force && now - lastSaveTimeRef.current < 5000) return;
    lastSaveTimeRef.current = now;

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
      sessionStorage.removeItem(SESSION_KEY);
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

  // --- Command palette global shortcut (Fix 2) ---
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "p") { e.preventDefault(); setShowPalette(v => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // New tab and Close tab functions (Fix 3)
  const handleNewTab = () => {
    const newId = nextTabId.current++;
    const newLabel = `bash ${newId}`;
    setTabs(prev => [...prev, { id: newId, label: newLabel }]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (tabId) => {
    setTabs(prev => {
      const nextTabs = prev.filter(t => t.id !== tabId);
      if (nextTabs.length === 0) {
        const newId = nextTabId.current++;
        const newLabel = `bash ${newId}`;
        setActiveTabId(newId);
        return [{ id: newId, label: newLabel }];
      }
      if (tabId === activeTabId) {
        const closedIdx = prev.findIndex(t => t.id === tabId);
        const newActiveIdx = Math.min(nextTabs.length - 1, Math.max(0, closedIdx - 1));
        setActiveTabId(nextTabs[newActiveIdx].id);
      }
      return nextTabs;
    });
  };

  // Switch tabs & update references
  useEffect(() => {
    const activeTab = tabsRef.current[activeTabId];
    activeXtermRef.current = activeTab ? activeTab.term : null;
    activeWsRef.current = activeTab ? activeTab.ws : null;

    if (activeTab) {
      if (activeTab.ws) {
        if (activeTab.ws.readyState === WebSocket.OPEN) {
          setWsStatus("connected");
        } else if (activeTab.ws.readyState === WebSocket.CONNECTING) {
          setWsStatus("connecting");
        } else {
          setWsStatus("disconnected");
        }
      } else {
        setWsStatus("connecting");
      }

      setTimeout(() => {
        if (activeTab.fitAddon) activeTab.fitAddon.fit();
        if (activeTab.term) activeTab.term.focus();
      }, 100);
    }
  }, [activeTabId, tabs]);

  // Terminal instances initialization for each tab
  useEffect(() => {
    if (!isLoggedIn) return;

    tabs.forEach((tab, index) => {
      if (tabsRef.current[tab.id]) return; // already initialized!

      const container = terminalRefs.current[tab.id];
      if (!container) return;

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

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());
      term.open(container);

      // Replay saved session before WS connects
      if (index === 0) {
        replaySession(term);
      }

      setTimeout(() => fitAddon.fit(), 100);

      // Welcome banner
      term.writeln("\x1b[1;36m╔══════════════════════════════════════════════════╗\x1b[0m");
      term.writeln("\x1b[1;36m║\x1b[0m  \x1b[1;37mgithub-cli\x1b[0m — \x1b[32mProduction Terminal\x1b[0m                 \x1b[1;36m║\x1b[0m");
      term.writeln("\x1b[1;36m║\x1b[0m  \x1b[33mvim, nano, git, node, npm available\x1b[0m             \x1b[1;36m║\x1b[0m");
      term.writeln("\x1b[1;36m║\x1b[0m  \x1b[2mCtrl+P: Command Palette | Ctrl+±: Font Size\x1b[0m    \x1b[1;36m║\x1b[0m");
      term.writeln("\x1b[1;36m╚══════════════════════════════════════════════════╝\x1b[0m");
      term.writeln("");

      let currentLine = "";
      let reconnectTimeout = null;
      let ws = null;

      const connectWS = () => {
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        const newWs = new WebSocket(`${WS_URL}/ws`);
        newWs.binaryType = "blob";
        ws = newWs;
        
        if (tabsRef.current[tab.id]) {
          tabsRef.current[tab.id].ws = newWs;
        }
        if (tab.id === activeTabIdRef.current) {
          activeWsRef.current = newWs;
        }

        newWs.onopen = () => {
          if (tab.id === activeTabIdRef.current) {
            setWsStatus("connected");
          }
          newWs.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
        };

        newWs.onmessage = async (event) => {
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
            if (tab.id === activeTabIdRef.current) {
              setCmdRunning(false);
            }
            currentLine = "";
          }
          // Save session
          saveSession(term);
        };

        newWs.onclose = () => {
          if (tab.id === activeTabIdRef.current) {
            setWsStatus("disconnected");
          }
          reconnectTimeout = setTimeout(() => {
            if (tab.id === activeTabIdRef.current) {
              setWsStatus("connecting");
            }
            connectWS();
          }, 3000);
          if (tabsRef.current[tab.id]) {
            tabsRef.current[tab.id].reconnectTimeout = reconnectTimeout;
          }
        };

        newWs.onerror = () => {
          if (tab.id === activeTabIdRef.current) {
            setWsStatus("error");
          }
          newWs.close();
        };
      };

      connectWS();

      // DOM-level keyboard capture BEFORE xterm
      const handleKeydown = (e) => {
        // Font size
        if (e.ctrlKey && (e.key === "=" || e.key === "+")) {
          e.preventDefault(); e.stopPropagation();
          fontSizeRef.current = Math.min(28, fontSizeRef.current + 1);
          Object.values(tabsRef.current).forEach(tInfo => {
            if (tInfo.term) {
              tInfo.term.options.fontSize = fontSizeRef.current;
              if (tInfo.fitAddon) tInfo.fitAddon.fit();
            }
          });
          return;
        }
        if (e.ctrlKey && e.key === "-") {
          e.preventDefault(); e.stopPropagation();
          fontSizeRef.current = Math.max(8, fontSizeRef.current - 1);
          Object.values(tabsRef.current).forEach(tInfo => {
            if (tInfo.term) {
              tInfo.term.options.fontSize = fontSizeRef.current;
              if (tInfo.fitAddon) tInfo.fitAddon.fit();
            }
          });
          return;
        }
        // Ctrl+Shift+V → paste
        if (e.ctrlKey && e.shiftKey && (e.key === 'V' || e.code === 'KeyV')) {
          e.preventDefault(); e.stopPropagation();
          navigator.clipboard.readText().then(text => {
            const activeWs = tabsRef.current[tab.id]?.ws;
            if (text && activeWs?.readyState === WebSocket.OPEN) activeWs.send(text);
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

        // --- Fix 4 — Real terminal keyboard shortcuts ---
        const activeWs = tabsRef.current[tab.id]?.ws;
        // Ctrl+L → clear screen
        if (e.ctrlKey && !e.shiftKey && e.key === 'l') {
          e.preventDefault();
          term.clear();
          activeWs?.send('\x0c'); // send Ctrl+L to shell too
          return;
        }
        // Ctrl+U → clear current line (send to shell)
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
          activeWs?.send('\x15');
          return;
        }
        // Ctrl+A → go to start of line
        if (e.ctrlKey && e.key === 'a') {
          e.preventDefault();
          activeWs?.send('\x01');
          return;
        }
        // Ctrl+E → go to end of line
        if (e.ctrlKey && e.key === 'e') {
          e.preventDefault();
          activeWs?.send('\x05');
          return;
        }
        // Ctrl+W → delete word before cursor
        if (e.ctrlKey && e.key === 'w') {
          e.preventDefault();
          activeWs?.send('\x17');
          return;
        }
        // Ctrl+R → reverse history search (send to shell)
        if (e.ctrlKey && e.key === 'r') {
          e.preventDefault();
          activeWs?.send('\x12');
          return;
        }
      };
      container.addEventListener('keydown', handleKeydown, true);

      const handleRightClick = (e) => {
        e.preventDefault();
        navigator.clipboard.readText().then(text => {
          const activeWs = tabsRef.current[tab.id]?.ws;
          if (text && activeWs?.readyState === WebSocket.OPEN) activeWs.send(text);
        }).catch(() => {});
      };
      container.addEventListener('contextmenu', handleRightClick);

      // --- Fix 1 & 5: data input handling ---
      term.onData((data) => {
        // Build current command string
        if (data === '\r') {
          // Enter pressed — save command if not empty
          const cmd = currentCommandRef.current.trim();
          if (cmd) {
            setCmdRunning(true);
            if (cmd !== commandHistoryRef.current[0]) {
              commandHistoryRef.current = [cmd, ...commandHistoryRef.current].slice(0, 50);
              // Update history dropdown state
              setCommandHistory([...commandHistoryRef.current]);
            }
          }
          currentCommandRef.current = '';
        } else if (data === '\x7f') {
          // Backspace
          currentCommandRef.current = currentCommandRef.current.slice(0, -1);
        } else if (data >= ' ' || data === '\t') {
          // Printable character
          currentCommandRef.current += data;
        }

        // Send to WebSocket as before
        const activeWs = tabsRef.current[tab.id]?.ws;
        if (activeWs?.readyState === WebSocket.OPEN) {
          activeWs.send(data);
        }
      });

      // --- Fix 5 — Up/Down arrow key history in shell: ---
      term.attachCustomKeyEventHandler((e) => {
        // Always let arrow keys through
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          return true;
        }
      });

      term.onResize(({ cols, rows }) => {
        const activeWs = tabsRef.current[tab.id]?.ws;
        if (activeWs?.readyState === WebSocket.OPEN) {
          activeWs.send(JSON.stringify({ type: "resize", cols, rows }));
        }
      });

      tabsRef.current[tab.id] = {
        term,
        fitAddon,
        ws,
        reconnectTimeout,
        container,
        handleKeydown,
        handleRightClick
      };
    });

    // Cleanup closed tabs
    Object.keys(tabsRef.current).forEach(idStr => {
      const id = parseInt(idStr, 10);
      if (!tabs.find(t => t.id === id)) {
        const tInfo = tabsRef.current[id];
        if (tInfo) {
          if (tInfo.reconnectTimeout) clearTimeout(tInfo.reconnectTimeout);
          if (tInfo.ws) tInfo.ws.close();
          if (tInfo.container) {
            tInfo.container.removeEventListener('keydown', tInfo.handleKeydown, true);
            tInfo.container.removeEventListener('contextmenu', tInfo.handleRightClick);
          }
          if (tInfo.term) tInfo.term.dispose();
        }
        delete tabsRef.current[id];
      }
    });

  }, [tabs, isLoggedIn]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      Object.values(tabsRef.current).forEach(tInfo => {
        if (tInfo.fitAddon) tInfo.fitAddon.fit();
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Global listeners for buddy extension (modified to target active tab)
  useEffect(() => {
    const handleBuddyCommand = (e) => {
      const { command } = e.detail;
      const activeWs = activeWsRef.current;
      if (activeWs?.readyState === WebSocket.OPEN) activeWs.send(command + "\r");
    };

    const handleBuddyGetOutput = (e) => {
      const activeTerm = activeXtermRef.current;
      if (!activeTerm) return;
      const buffer = activeTerm.buffer.active;
      let output = "";
      for (let i = Math.max(0, buffer.baseY + buffer.viewportY - 50); i < buffer.baseY + buffer.viewportY + activeTerm.rows; i++) {
        const line = buffer.getLine(i);
        if (line) output += line.translateToString(true) + "\n";
      }
      const callback = e.detail?.callback;
      if (callback) callback(output);
    };

    window.addEventListener("buddy_terminal_command", handleBuddyCommand);
    window.addEventListener("buddy_get_output", handleBuddyGetOutput);

    return () => {
      window.removeEventListener("buddy_terminal_command", handleBuddyCommand);
      window.removeEventListener("buddy_get_output", handleBuddyGetOutput);
    };
  }, []);

  // Cleanup all sessions/connections on component unmount
  useEffect(() => {
    return () => {
      Object.values(tabsRef.current).forEach(tInfo => {
        if (tInfo.reconnectTimeout) clearTimeout(tInfo.reconnectTimeout);
        if (tInfo.ws) tInfo.ws.close();
        if (tInfo.container) {
          tInfo.container.removeEventListener('keydown', tInfo.handleKeydown, true);
          tInfo.container.removeEventListener('contextmenu', tInfo.handleRightClick);
        }
        if (tInfo.term) {
          saveSession(tInfo.term);
          tInfo.term.dispose();
        }
      });
    };
  }, [saveSession]);

  // Close history dropdown on outside click
  useEffect(() => {
    if (!showHistory) return;
    const close = () => setShowHistory(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showHistory]);

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
                <FileExplorer wsRef={activeWsRef} />
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
          <TabBar 
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onNewTab={handleNewTab}
            onCloseTab={handleCloseTab}
          />
          {/* Toolbar */}
          <TerminalToolbar
            wsRef={activeWsRef} xtermRef={activeXtermRef}
            isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}
            commandHistory={commandHistory.slice(0, 10)}
            showHistory={showHistory} setShowHistory={setShowHistory}
          />
          {/* Terminal */}
          <div className="flex-1 p-2 sm:p-4 relative min-h-0 overflow-hidden">
            <SpinnerIndicator running={cmdRunning} />
            <CommandPalette visible={showPalette} onClose={() => setShowPalette(false)} wsRef={activeWsRef} />
            {tabs.map(tab => (
              <div 
                key={tab.id}
                ref={el => { terminalRefs.current[tab.id] = el; }}
                className={`absolute inset-2 sm:inset-4 overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117] ${tab.id === activeTabId ? 'block' : 'hidden'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;
