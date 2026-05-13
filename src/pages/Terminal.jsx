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

const TerminalPage = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const wsRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [deps, setDeps] = useState(null);
  const [gitStatus, setGitStatus] = useState(null);
  const [wsStatus, setWsStatus] = useState("connecting");
  const localBufferRef = useRef("");

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:3001/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchDeps = async () => {
    try {
      const res = await fetch("http://localhost:3001/deps");
      const data = await res.json();
      setDeps(data);
    } catch (err) {
      console.error("Failed to fetch deps", err);
    }
  };

  const fetchGitStatus = async () => {
    try {
      const res = await fetch("http://localhost:3001/git/status");
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

  const handleCommand = useCallback(async (cmd) => {
    const trimmedCmd = cmd.trim();
    const term = xtermRef.current;
    
    term.write("\r\n");
    if (!trimmedCmd) {
      term.write("\x1b[32mgithub-cli> \x1b[0m");
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(trimmedCmd);
    } else {
      if (trimmedCmd === "stats") {
        await fetchStats();
        term.write("\x1b[32mStats updated!\x1b[0m\r\n");
      } else if (trimmedCmd === "deps") {
        await fetchDeps();
        term.write("\x1b[32mDependencies updated!\x1b[0m\r\n");
      } else if (trimmedCmd === "git-status" || trimmedCmd === "git status") {
        await fetchGitStatus();
        term.write("\x1b[32mGit status updated!\x1b[0m\r\n");
      } else if (trimmedCmd === "help") {
        term.write("Available commands (REST fallback): stats, deps, git-status, help\r\n");
      } else {
        term.write(`\x1b[31mError: WebSocket disconnected and command '${trimmedCmd}' not supported in fallback mode.\x1b[0m\r\n`);
      }
      term.write("\x1b[32mgithub-cli> \x1b[0m");
    }
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: GITHUB_DARK,
      fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
      fontSize: 14,
      cursorBlink: true,
      convertEol: true,
      rows: 24,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    
    // Small delay to ensure container is rendered before fitting
    setTimeout(() => fitAddon.fit(), 100);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.write("\x1b[32mWelcome to github-cli. Type help for commands.\x1b[0m\r\n");
    term.write("\x1b[32mgithub-cli> \x1b[0m");

    const connectWS = () => {
      const ws = new WebSocket("ws://localhost:3001/ws");
      wsRef.current = ws;

      ws.onopen = () => setWsStatus("connected");
      ws.onmessage = (event) => {
        term.write(event.data + "\r\n");
        term.write("\x1b[32mgithub-cli> \x1b[0m");
      };
      ws.onclose = () => setWsStatus("disconnected");
      ws.onerror = () => setWsStatus("error");
    };

    connectWS();

    // Handle terminal input and pastes
    term.onData((data) => {
      // If data is more than one character, it's likely a paste
      if (data.length > 1) {
        // Remove any carraige returns or newlines from the paste for the buffer
        // but detect if it ended with one to auto-execute
        const cleanData = data.replace(/\r?\n/g, "");
        const hadNewline = /\r?\n/.test(data);
        
        term.write(cleanData);
        localBufferRef.current += cleanData;
        
        if (hadNewline) {
          handleCommand(localBufferRef.current);
          localBufferRef.current = "";
        }
        return;
      }

      // Handle single character input (typing)
      const code = data.charCodeAt(0);
      if (code === 13) { // Enter
        handleCommand(localBufferRef.current);
        localBufferRef.current = "";
      } else if (code === 127) { // Backspace
        if (localBufferRef.current.length > 0) {
          localBufferRef.current = localBufferRef.current.slice(0, -1);
          term.write("\b \b");
        }
      } else if (code === 27) {
        // Ignore escape sequences (arrows, etc)
      } else if (code < 32) {
        // Ignore other control codes
      } else {
        localBufferRef.current += data;
        term.write(data);
      }
    });

    const handleResize = () => {
      if (fitAddonRef.current) fitAddonRef.current.fit();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
      if (wsRef.current) wsRef.current.close();
    };
  }, [handleCommand]);

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
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Dashboard */}
        <div className="w-[380px] border-r border-[#30363d] bg-[#0d1117] overflow-y-auto p-6 space-y-6">
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
        <div className="flex-1 flex flex-col bg-[#0d1117]">
          <div className="h-12 border-b border-[#30363d] flex items-center justify-between px-6 bg-[#161b22]">
            <div className="flex items-center gap-3">
              <TerminalSquare size={18} className="text-[#8b949e]" />
              <span className="text-[13px] font-medium text-[#c9d1d9]">github-cli — terminal</span>
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
          <div className="flex-1 p-4 relative">
            <div 
              ref={terminalRef} 
              className="absolute inset-4 overflow-hidden rounded-lg border border-[#30363d]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;
