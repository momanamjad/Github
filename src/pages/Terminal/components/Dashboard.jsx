import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { Activity, FileCode, Hash, Package, GitBranch, CheckCircle2, AlertCircle, Cpu, HardDrive, MemoryStick, Clock, Play, Loader2, GitCommit, GitPullRequest, Upload, Download, PlusCircle, Network, ExternalLink, RefreshCw } from "lucide-react";
import { FileExplorer } from "../TerminalComponents";
import { useDashboardPolling } from "../hooks/useDashboardPolling";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Format bytes to human readable
const formatSize = (bytes) => {
  if (bytes === 0) return '0 KB';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatUptime = (seconds) => {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const getBarColor = (pct) => {
  if (pct < 50) return '#3fb950';  // green
  if (pct < 80) return '#d29922';  // yellow
  return '#f85149';                 // red
};

// =============================================
// ANIMATED METRIC BAR
// =============================================
const MetricBar = ({ label, used, total, unit, pct, icon: Icon, iconColor }) => {
  const color = getBarColor(pct);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={13} style={{ color: iconColor }} />
          <span className="text-[12px] text-[#8b949e]">{label}</span>
        </div>
        <span className="text-[11px] text-[#c9d1d9] font-mono">
          {used} / {total} {unit}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(100, pct)}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}66`,
          }}
        />
      </div>
    </div>
  );
};

// =============================================
// SYSTEM MONITOR CARD (memoized)
// =============================================
export const SystemMonitor = memo(({ metrics }) => {
  const ramPct  = metrics ? (metrics.ram_used_mb / metrics.ram_total_mb) * 100 : 0;
  const diskPct = metrics ? (metrics.disk_used_gb / metrics.disk_total_gb) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Title with live dot */}
      <div className="flex items-center gap-2">
        <Cpu size={18} className="text-[#58a6ff]" />
        <span className="text-[14px] font-semibold">System Monitor</span>
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]" />
        </span>
      </div>

      {!metrics ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-1.5">
              <div className="h-3 bg-[#21262d] rounded w-1/3" />
              <div className="h-1.5 bg-[#21262d] rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* CPU */}
          <MetricBar
            label="CPU"
            used={metrics.cpu_usage.toFixed(1) + '%'}
            total="100%"
            unit=""
            pct={metrics.cpu_usage}
            icon={Cpu}
            iconColor="#79c0ff"
          />

          {/* RAM */}
          <MetricBar
            label="RAM"
            used={(metrics.ram_used_mb / 1024).toFixed(1) + ' GB'}
            total={(metrics.ram_total_mb / 1024).toFixed(1) + ' GB'}
            unit=""
            pct={ramPct}
            icon={MemoryStick}
            iconColor="#d2a8ff"
          />

          {/* Disk */}
          <MetricBar
            label="Disk"
            used={metrics.disk_used_gb.toFixed(1) + ' GB'}
            total={metrics.disk_total_gb.toFixed(1) + ' GB'}
            unit=""
            pct={diskPct}
            icon={HardDrive}
            iconColor="#f0883e"
          />

          {/* Uptime */}
          <div className="flex items-center justify-between pt-1 border-t border-[#21262d]">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#8b949e]" />
              <span className="text-[12px] text-[#8b949e]">Uptime</span>
            </div>
            <span className="text-[12px] text-[#3fb950] font-mono font-semibold">
              {formatUptime(metrics.uptime_seconds)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
SystemMonitor.displayName = 'SystemMonitor';

// =============================================
// NPM SCRIPTS RUNNER CARD (memoized)
// =============================================
const SCRIPT_COLORS = {
  dev:    { bg: '#1c2a4a', border: '#2f81f7', text: '#79c0ff', hover: '#2f81f7' },
  start:  { bg: '#1c2a4a', border: '#2f81f7', text: '#79c0ff', hover: '#2f81f7' },
  build:  { bg: '#1a2e1a', border: '#238636', text: '#3fb950', hover: '#238636' },
  test:   { bg: '#2e2a1a', border: '#bb8009', text: '#d29922', hover: '#bb8009' },
  lint:   { bg: '#2e1e0f', border: '#bd561d', text: '#f0883e', hover: '#bd561d' },
  format: { bg: '#2e1e0f', border: '#bd561d', text: '#f0883e', hover: '#bd561d' },
};

const getScriptStyle = (name) => {
  const key = Object.keys(SCRIPT_COLORS).find(k => name === k || name.startsWith(k));
  return key ? SCRIPT_COLORS[key] : { bg: '#1e222a', border: '#30363d', text: '#8b949e', hover: '#30363d' };
};

export const ScriptsRunner = memo(({ activeWsRef }) => {
  const [scripts, setScripts] = useState(null);
  const [running, setRunning] = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const fetchScripts = async () => {
      try {
        const r = await fetch(`${API_URL}/file?path=/workspace/project/package.json`, { signal: ctrl.signal });
        const data = await r.json();
        if (data.content) {
          const pkg = JSON.parse(data.content);
          setScripts(pkg.scripts || {});
        } else {
          setError('No package.json found');
        }
      } catch (e) {
        if (e.name !== 'AbortError') setError('Failed to load scripts');
      }
    };
    fetchScripts();
    return () => ctrl.abort();
  }, []);

  const runScript = (name) => {
    if (activeWsRef?.current?.readyState === WebSocket.OPEN) {
      setRunning(name);
      activeWsRef.current.send(`npm run ${name}\r`);
      setTimeout(() => setRunning(null), 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Play size={18} className="text-[#3fb950]" />
        <span className="text-[14px] font-semibold">npm Scripts</span>
      </div>

      {scripts === null && !error && (
        <div className="flex items-center gap-2 py-2">
          <div className="w-3 h-3 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-[#8b949e]">Loading scripts...</span>
        </div>
      )}

      {error && (
        <div className="text-[12px] text-[#8b949e] italic">{error}</div>
      )}

      {scripts && Object.keys(scripts).length === 0 && (
        <div className="text-[12px] text-[#8b949e] italic">No scripts found</div>
      )}

      {scripts && Object.keys(scripts).length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {Object.keys(scripts).map(name => {
            const style = getScriptStyle(name);
            const isRunning = running === name;
            return (
              <button
                key={name}
                onClick={() => runScript(name)}
                disabled={isRunning}
                title={`npm run ${name}: ${scripts[name]}`}
                style={{
                  backgroundColor: style.bg,
                  borderColor: style.border,
                  color: style.text,
                }}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-mono font-medium rounded-md border transition-all duration-150 truncate
                  ${isRunning ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-125 active:scale-95 cursor-pointer'}`}
              >
                {isRunning
                  ? <Loader2 size={10} className="animate-spin shrink-0" />
                  : <Play size={10} className="shrink-0" />
                }
                <span className="truncate">{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
ScriptsRunner.displayName = 'ScriptsRunner';

// =============================================
// GIT PANEL (memoized)
// =============================================
const parseGitStatus = (output) => {
  const files = [];
  const lines = output.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Short format: XY filename
    const shortMatch = trimmed.match(/^([MADRCU?!]{1,2})\s+(.+)$/);
    if (shortMatch) {
      const code = shortMatch[1];
      const name = shortMatch[2];
      let status = 'modified';
      if (code.includes('?') || code.includes('A')) status = 'added';
      else if (code.includes('D')) status = 'deleted';
      else status = 'modified';
      files.push({ name, status });
      continue;
    }
    // Long format lines like "modified: src/foo.js"
    const longMatch = trimmed.match(/^(modified|new file|deleted|renamed|untracked):\s+(.+)$/);
    if (longMatch) {
      const code = longMatch[1];
      const name = longMatch[2];
      let status = 'modified';
      if (code === 'new file' || code === 'untracked') status = 'added';
      else if (code === 'deleted') status = 'deleted';
      files.push({ name, status });
    }
  }
  return files;
};

const parseBranch = (output) => {
  const match = output.match(/\*\s+(\S+)/);
  if (match) return match[1];
  const statusMatch = output.match(/On branch (\S+)/);
  if (statusMatch) return statusMatch[1];
  return null;
};

const STATUS_INDICATOR = {
  added:    { label: '+', color: '#3fb950', title: 'New / Untracked' },
  modified: { label: 'M', color: '#d29922', title: 'Modified' },
  deleted:  { label: '-', color: '#f85149', title: 'Deleted' },
};

export const GitPanel = memo(({ activeWsRef }) => {
  const [files, setFiles]               = useState([]);
  const [isClean, setIsClean]           = useState(false);
  const [branch, setBranch]             = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [runningCmd, setRunningCmd]     = useState(null);

  const isConnected = () => activeWsRef?.current?.readyState === WebSocket.OPEN;

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/git/status`);
      const data = await r.json();
      const output = data.output || '';
      const clean = output.includes('nothing to commit') || output.includes('working tree clean');
      setIsClean(clean);
      setFiles(clean ? [] : parseGitStatus(output));
      const b = parseBranch(output);
      if (b) setBranch(b);
    } catch {}
  }, []);

  const fetchBranch = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/git/branch`);
      const data = await r.json();
      const b = parseBranch(data.output || '');
      if (b) setBranch(b);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchBranch();
    // Git status is now polled by useDashboardPolling every 30s.
    // This panel only needs an initial fetch + manual refresh.
  }, [fetchStatus, fetchBranch]);

  const sendCmd = (cmd, cmdKey) => {
    if (!isConnected()) return;
    setRunningCmd(cmdKey);
    activeWsRef.current.send(cmd + '\r');
    setTimeout(() => {
      setRunningCmd(null);
      fetchStatus();
    }, 3000);
  };

  const handleStage  = () => sendCmd('git add .', 'stage');
  const handleCommit = () => { if (!commitMessage.trim()) return; sendCmd(`git commit -m "${commitMessage.trim()}"`, 'commit'); setCommitMessage(''); };
  const handlePush   = () => sendCmd('git push', 'push');
  const handlePull   = () => sendCmd('git pull', 'pull');

  const ActionBtn = ({ onClick, disabled, cmdKey, icon: Icon, label, color }) => {
    const spinning = runningCmd === cmdKey;
    return (
      <button
        onClick={onClick}
        disabled={disabled || spinning || !isConnected()}
        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md border transition-all duration-150
          ${ disabled || !isConnected()
            ? 'opacity-40 cursor-not-allowed border-[#30363d] text-[#484f58] bg-transparent'
            : 'cursor-pointer hover:brightness-125 active:scale-95'
          }`}
        style={disabled || !isConnected() ? {} : { backgroundColor: color.bg, borderColor: color.border, color: color.text }}
      >
        {spinning
          ? <Loader2 size={11} className="animate-spin shrink-0" />
          : <Icon size={11} className="shrink-0" />
        }
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Title + Branch Badge */}
      <div className="flex items-center gap-2">
        <GitBranch size={18} className="text-[#ff7b72]" />
        <span className="text-[14px] font-semibold">Git Panel</span>
        {branch && (
          <span className="ml-auto px-2 py-0.5 text-[11px] font-mono rounded-full bg-[#2f81f722] text-[#58a6ff] border border-[#2f81f744]">
            {branch}
          </span>
        )}
      </div>

      {/* Changed Files */}
      <div className="space-y-1">
        {isClean ? (
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-[#12261e] border border-[#23863633]">
            <CheckCircle2 size={13} className="text-[#3fb950]" />
            <span className="text-[12px] text-[#3fb950]">Nothing to commit</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-[12px] text-[#8b949e] italic py-1">Fetching status...</div>
        ) : (
          <div className="max-h-[120px] overflow-y-auto space-y-0.5 pr-1">
            {files.map((f, i) => {
              const ind = STATUS_INDICATOR[f.status] || STATUS_INDICATOR.modified;
              return (
                <div key={i} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[#0d1117] group transition-colors">
                  <span
                    className="text-[11px] font-mono font-bold w-4 shrink-0 text-center"
                    style={{ color: ind.color }}
                    title={ind.title}
                  >{ind.label}</span>
                  <span className="text-[12px] text-[#c9d1d9] truncate font-mono group-hover:text-[#e6edf3]">{f.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Commit Message Input */}
      <input
        placeholder="Commit message..."
        value={commitMessage}
        onChange={e => setCommitMessage(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && commitMessage.trim()) handleCommit(); }}
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-[#484f58] focus:border-[#58a6ff] outline-none transition-colors"
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        <ActionBtn
          onClick={handleStage}
          cmdKey="stage"
          icon={PlusCircle}
          label="Stage All"
          color={{ bg: '#1c2a4a', border: '#2f81f7', text: '#79c0ff' }}
        />
        <ActionBtn
          onClick={handleCommit}
          disabled={!commitMessage.trim()}
          cmdKey="commit"
          icon={GitCommit}
          label="Commit"
          color={{ bg: '#1a2e1a', border: '#238636', text: '#3fb950' }}
        />
        <ActionBtn
          onClick={handlePush}
          cmdKey="push"
          icon={Upload}
          label="Push"
          color={{ bg: '#2e1e0f', border: '#bd561d', text: '#f0883e' }}
        />
        <ActionBtn
          onClick={handlePull}
          cmdKey="pull"
          icon={Download}
          label="Pull"
          color={{ bg: '#2e2a1a', border: '#bb8009', text: '#d29922' }}
        />
      </div>

      {/* Refresh hint */}
      <button
        onClick={fetchStatus}
        className="w-full text-[11px] text-[#484f58] hover:text-[#8b949e] transition-colors py-0.5 text-center"
      >
        ↻ refresh status
      </button>
    </div>
  );
});
GitPanel.displayName = 'GitPanel';

// =============================================
// PORT MONITOR CARD (memoized)
// =============================================
const PORT_LABELS = {
  3000: { label: 'React Dev', color: '#61dafb' },
  5173: { label: 'Vite',      color: '#a78bfa' },
  8080: { label: 'HTTP',      color: '#f0883e' },
  3001: { label: 'github-cli', color: '#3fb950', highlight: true },
  8000: { label: 'Dev Server', color: '#d29922' },
  4000: { label: 'GraphQL',   color: '#e10098' },
};
const DEV_PORTS = new Set([3000, 5173]);

export const PortMonitor = memo(({ ports, onRefresh }) => {
  // Deduplicate by port number, keep first occurrence
  const uniquePorts = ports
    ? [...new Map(ports.map(p => [p.port, p])).values()]
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={18} className="text-[#58a6ff]" />
          <span className="text-[14px] font-semibold">Port Monitor</span>
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]" />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-1 rounded text-[#484f58] hover:text-[#8b949e] hover:bg-[#21262d] transition-colors"
            title="Refresh now"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      {/* Port List */}
      {ports === null ? (
        <div className="flex items-center gap-2 py-2">
          <div className="w-3 h-3 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-[#8b949e]">Scanning ports...</span>
        </div>
      ) : uniquePorts.length === 0 ? (
        <div className="text-[12px] text-[#8b949e] italic py-2 text-center">No active ports detected</div>
      ) : (
        <div className="space-y-1">
          {uniquePorts.map((p, i) => {
            const meta = PORT_LABELS[p.port];
            const isHighlighted = meta?.highlight;
            const isDevPort = DEV_PORTS.has(p.port);
            const portColor = meta?.color || '#8b949e';
            return (
              <div
                key={i}
                className={`flex items-center gap-2 py-1.5 px-2.5 rounded-md transition-colors ${
                  isHighlighted ? 'bg-[#12261e] border border-[#23863633]' : 'hover:bg-[#0d1117]'
                }`}
              >
                {/* Status dot */}
                <span
                  className="text-[10px] font-bold"
                  style={{ color: portColor }}
                >
                  ●
                </span>

                {/* Port number */}
                <span
                  className="text-[13px] font-mono font-bold w-[42px] shrink-0"
                  style={{ color: portColor }}
                >
                  {p.port}
                </span>

                {/* Process name */}
                <span className="text-[12px] text-[#c9d1d9] truncate flex-1">
                  {meta?.label || (p.process ? p.process.replace(/["`']/g, '').split(/\s+/)[0] : 'unknown')}
                </span>

                {/* Status badge */}
                <span className="text-[10px] text-[#484f58] font-mono shrink-0">{p.status}</span>

                {/* Open button for dev ports */}
                {isDevPort && (
                  <a
                    href={`http://localhost:${p.port}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-[#58a6ff] border border-[#2f81f744] rounded hover:bg-[#2f81f722] transition-colors shrink-0"
                    title={`Open localhost:${p.port}`}
                  >
                    <ExternalLink size={9} />
                    Open
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
PortMonitor.displayName = 'PortMonitor';

// =============================================
// MAIN DASHBOARD
// =============================================
export const Dashboard = ({
  stats,
  deps,
  gitStatus,
  currentPath,
  dashboardUpdating,
  activeWsRef,
  onOpenFile,
}) => {
  // Consolidated polling: metrics + ports + git
  const { metrics, ports, gitStatus: polledGit, isLoading } = useDashboardPolling(currentPath);

  // Merge: parent's gitStatus (from cd events) takes priority
  const effectiveGitStatus = gitStatus ?? polledGit;

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
            <div className="text-xl font-bold">{formatSize(stats.avg_size || 0)}</div>
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
    const devDeps  = Object.entries(deps.devDependencies || {});
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
    if (!effectiveGitStatus) return <div className="animate-pulse h-24 bg-[#161b22] rounded-lg"></div>;
    const output = effectiveGitStatus.output || "";
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

  return (
    <div className="hidden lg:block w-[380px] border-r border-[#30363d] bg-[#0d1117] overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-[#3fb950]" />
        <h2 className="text-lg font-bold">Live Dashboard</h2>
        {dashboardUpdating && (
          <div className="ml-auto animate-spin">
            <div className="w-3 h-3 border-2 border-[#58a6ff] border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      
      {/* Breadcrumb showing current terminal path */}
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
      
      <div className="space-y-6">
        {/* Project Stats */}
        <section className={`bg-[#161b22] p-5 rounded-xl border shadow-sm transition-colors duration-300 ${dashboardUpdating ? 'border-[#58a6ff]' : 'border-[#30363d]'}`}>
          {renderStats()}
        </section>

        {/* System Monitor — receives metrics from consolidated poller */}
        <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
          <SystemMonitor metrics={metrics} />
        </section>

        {/* npm Scripts */}
        <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
          <ScriptsRunner activeWsRef={activeWsRef} />
        </section>

        {/* Git Panel */}
        <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
          <GitPanel activeWsRef={activeWsRef} />
        </section>

        {/* Port Monitor — receives ports from consolidated poller */}
        <section className="bg-[#161b22] p-5 rounded-xl border border-[#30363d] shadow-sm">
          <PortMonitor ports={ports} onRefresh={() => {}} />
        </section>

        {/* Dependencies */}
        <section className={`bg-[#161b22] p-5 rounded-xl border shadow-sm transition-colors duration-300 ${dashboardUpdating ? 'border-[#58a6ff]' : 'border-[#30363d]'}`}>
          {renderDeps()}
        </section>

        {/* Git Status */}
        <section className={`bg-[#161b22] p-5 rounded-xl border shadow-sm transition-colors duration-300 ${dashboardUpdating ? 'border-[#58a6ff]' : 'border-[#30363d]'}`}>
          {renderGit()}
        </section>

        {/* File Explorer */}
        <section className={`bg-[#161b22] p-5 rounded-xl border shadow-sm transition-colors duration-300 ${dashboardUpdating ? 'border-[#58a6ff]' : 'border-[#30363d]'}`}>
          <FileExplorer wsRef={activeWsRef} onOpenFile={onOpenFile} />
        </section>
      </div>
    </div>
  );
};
