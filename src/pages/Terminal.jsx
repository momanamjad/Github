import React, { useEffect, useRef, useState, useCallback } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import "xterm/css/xterm.css";
import { 
  TerminalSquare, 
  Activity, 
  Package, 
  GitBranch, 
  AlertCircle,
  FileCode,
  Hash,
  CheckCircle2
} from "lucide-react";

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

const TerminalPage = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [deps, setDeps] = useState(null);
  const [gitStatus, setGitStatus] = useState(null);
  const [wsStatus, setWsStatus] = useState("connecting");

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchDeps = async () => {
    try {
      const res = await fetch(`${API_URL}/deps`);
      const data = await res.json();
      setDeps(data);
    } catch (err) {
      console.error("Failed to fetch deps", err);
    }
  };

  const fetchGitStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/git/status`);
      const data = await res.json();
      setGitStatus(data);
    } catch (err) {
      console.error("Failed to fetch git status", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchDeps();
    fetchGitStatus();
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: GITHUB_DARK,
      fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
      fontSize: 14,
      cursorBlink: true,
      convertEol: true,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    
    // Small delay to ensure container is rendered before fitting
    setTimeout(() => fitAddon.fit(), 100);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const connectWS = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      const ws = new WebSocket(`${WS_URL}/ws`);
      ws.binaryType = "blob";
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus("connected");
        ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      };

      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          const buffer = await event.data.arrayBuffer();
          term.write(new Uint8Array(buffer));
        } else {
          term.write(event.data);
        }
      };

      ws.onclose = () => {
        setWsStatus("disconnected");
        // Try to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          setWsStatus("connecting");
          connectWS();
        }, 3000);
      };

      ws.onerror = () => {
        setWsStatus("error");
        ws.close();
      };
    };

    connectWS();

    term.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
    });

    term.onResize(({ cols, rows }) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "resize", cols, rows }));
      }
    });

    const handleResize = () => {
      if (fitAddonRef.current) fitAddonRef.current.fit();
    };
    window.addEventListener("resize", handleResize);

    // Use ResizeObserver for container-level responsiveness (e.g. when sidebar hides)
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    const handleBuddyCommand = (e) => {
      const { command } = e.detail;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send command with enter
        wsRef.current.send(command + "\r");
      }
    };

    const handleBuddyGetOutput = (e) => {
      if (!xtermRef.current) return;
      const term = xtermRef.current;
      // Get the last 50 lines of output
      const buffer = term.buffer.active;
      let output = "";
      for (let i = Math.max(0, buffer.baseY + buffer.viewportY - 50); i < buffer.baseY + buffer.viewportY + term.rows; i++) {
        const line = buffer.getLine(i);
        if (line) output += line.translateToString(true) + "\n";
      }
      
      const callback = e.detail?.callback;
      if (callback) callback(output);
    };

    window.addEventListener("buddy_terminal_command", handleBuddyCommand);
    window.addEventListener("buddy_get_output", handleBuddyGetOutput);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("buddy_terminal_command", handleBuddyCommand);
      window.removeEventListener("buddy_get_output", handleBuddyGetOutput);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      resizeObserver.disconnect();
      term.dispose();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

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
            <div className="text-xl font-bold">
              {stats.avg_size || "0 KB"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[12px] text-[#8b949e]">File Distribution</div>
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-[#30363d]">
            {Object.entries(types).map(([ext, count], idx) => {
              const percentage = (count / total) * 100;
              const colors = ["#2f81f7", "#3fb950", "#d29922", "#f85149", "#db61a2"];
              return (
                <div 
                  key={ext}
                  style={{ width: `${percentage}%`, backgroundColor: colors[idx % colors.length] }}
                  title={`${ext}: ${count}`}
                />
              );
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
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#23863622] text-[#3fb950] border border-[#23863644]">
              {prodDeps.length} Prod
            </span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#a371f722] text-[#a371f7] border border-[#a371f744]">
              {devDeps.length} Dev
            </span>
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
            <div className="flex items-center gap-1 text-[#3fb950] text-[12px]">
              <CheckCircle2 size={14} />
              <span>Clean</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[#d29922] text-[12px]">
              <AlertCircle size={14} />
              <span>Dirty</span>
            </div>
          )}
        </div>

        <div className="bg-[#0d1117] p-3 rounded-md border border-[#30363d] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#8b949e] uppercase">Current Branch</span>
            <span className="text-[14px] font-mono text-[#58a6ff]">{branch}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#8b949e] uppercase">State</span>
            <div className="text-[13px] text-[#c9d1d9]">
              {isClean ? "Up to date" : "Uncommitted changes"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0d1117] text-[#e6edf3] font-sans">
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left Panel - Dashboard (Hidden on smaller screens by default, or you can make it a toggle) */}
        <div className="hidden lg:block w-[380px] border-r border-[#30363d] bg-[#0d1117] overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={20} className="text-[#3fb950]" />
            <h2 className="text-lg font-bold">Live Dashboard</h2>
          </div>

          <div className="space-y-6">
            <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
              {renderStats()}
            </section>

            <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
              {renderDeps()}
            </section>

            <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
              {renderGit()}
            </section>
          </div>
        </div>

        {/* Right Panel - Xterm */}
        <div className="flex-1 flex flex-col bg-[#0d1117] min-w-0 overflow-hidden">
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
              <span className="text-[11px] text-[#8b949e] uppercase tracking-wider font-semibold">
                {wsStatus}
              </span>
            </div>
          </div>
          <div className="flex-1 p-2 sm:p-4 relative min-h-0 overflow-hidden">
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
