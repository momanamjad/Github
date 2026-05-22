import React from "react";
import { Activity, FileCode, Hash, Package, GitBranch, CheckCircle2, AlertCircle } from "lucide-react";
import { FileExplorer } from "../TerminalComponents";

export const Dashboard = ({
  stats,
  deps,
  gitStatus,
  currentPath,
  dashboardUpdating,
  activeWsRef,
  onOpenFile
}) => {
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
        <section className={`bg-[#161b22] p-5 rounded-xl border shadow-sm transition-colors duration-300 ${dashboardUpdating ? 'border-[#58a6ff]' : 'border-[#30363d]'}`}>
          {renderStats()}
        </section>
        <section className={`bg-[#161b22] p-5 rounded-xl border shadow-sm transition-colors duration-300 ${dashboardUpdating ? 'border-[#58a6ff]' : 'border-[#30363d]'}`}>
          {renderDeps()}
        </section>
        <section className={`bg-[#161b22] p-5 rounded-xl border shadow-sm transition-colors duration-300 ${dashboardUpdating ? 'border-[#58a6ff]' : 'border-[#30363d]'}`}>
          {renderGit()}
        </section>
        <section className={`bg-[#161b22] p-5 rounded-xl border shadow-sm transition-colors duration-300 ${dashboardUpdating ? 'border-[#58a6ff]' : 'border-[#30363d]'}`}>
          <FileExplorer wsRef={activeWsRef} onOpenFile={onOpenFile} />
        </section>
      </div>
    </div>
  );
};
