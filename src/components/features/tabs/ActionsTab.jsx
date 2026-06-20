import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, CheckCircleIcon, XCircleIcon, HistoryIcon } from '@primer/octicons-react';
import { apiClient } from '@services/apiClient.js';

export default function ActionsTab({ repoId }) {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [visibleLogsCount, setVisibleLogsCount] = useState(0);
  const logEndRef = useRef(null);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await apiClient(`/repos/${repoId}/actions/runs`);
      if (res && res.data) {
        setRuns(res.data);
        if (res.data.length > 0 && !selectedRun) {
          setSelectedRun(res.data[0]);
          setVisibleLogsCount(res.data[0].logs?.length || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load workflow runs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoId) {
      fetchRuns();
    }
  }, [repoId]);

  // Simulate console logs printing lines sequentially
  useEffect(() => {
    if (selectedRun && visibleLogsCount < (selectedRun.logs?.length || 0)) {
      const timer = setTimeout(() => {
        setVisibleLogsCount(prev => prev + 1);
      }, 300); // speed of simulation
      return () => clearTimeout(timer);
    }
  }, [selectedRun, visibleLogsCount]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visibleLogsCount]);

  const handleTriggerRun = async () => {
    try {
      setTriggering(true);
      const res = await apiClient(`/repos/${repoId}/actions/runs`, {
        method: "POST",
        body: JSON.stringify({ branch: "main" })
      });
      if (res && res.data) {
        setRuns(prev => [res.data, ...prev]);
        setSelectedRun(res.data);
        setVisibleLogsCount(0); // Trigger incremental simulation
      }
    } catch (err) {
      console.error("Failed to trigger run:", err);
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-[#57606a]">Loading actions...</div>;
  }

  return (
    <div className="py-4 text-left flex flex-col lg:flex-row gap-6">
      {/* Workflow Runs List (Left) */}
      <div className="flex-1 lg:w-1/3 space-y-4">
        <div className="flex items-center justify-between border-b border-[#d0d7de] dark:border-[#30363d] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#1f2328] dark:text-white">Workflow runs</h2>
            <p className="text-[11px] text-[#57606a] dark:text-[#8b949e]">List of pipeline builds</p>
          </div>
          <button
            onClick={handleTriggerRun}
            disabled={triggering}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold rounded border-0 cursor-pointer"
          >
            <PlayIcon size={14} />
            {triggering ? "Running..." : "Run workflow"}
          </button>
        </div>

        <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22]">
          {runs.map(run => (
            <div
              key={run._id}
              onClick={() => {
                setSelectedRun(run);
                setVisibleLogsCount(run.logs?.length || 0);
              }}
              className={`p-3.5 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer flex items-center justify-between gap-3 text-left ${selectedRun?._id === run._id ? "bg-[#f6f8fa] dark:bg-[#21262d] border-l-2 border-[#f78166]" : ""}`}
            >
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1f2328] dark:text-white truncate">{run.name}</h4>
                <p className="text-[10px] text-[#57606a] dark:text-[#8b949e] mt-1 flex items-center gap-1">
                  <span className="font-mono bg-[#ebedf0] dark:bg-[#30363d] px-1 py-0.2 rounded">{run.branch}</span>
                  <span>· event: manual</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {run.status === "success" ? (
                  <span className="text-green-500 flex items-center gap-1 text-[11px] font-semibold">
                    <CheckCircleIcon size={14} /> Success
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center gap-1 text-[11px] font-semibold">
                    <XCircleIcon size={14} /> Failed
                  </span>
                )}
              </div>
            </div>
          ))}
          {runs.length === 0 && (
            <div className="p-8 text-center text-xs text-gray-500">
              No workflow runs found. Click "Run workflow" to start.
            </div>
          )}
        </div>
      </div>

      {/* Terminal build log display (Right) */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {selectedRun ? (
          <div className="flex-1 flex flex-col border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
            {/* Terminal Header */}
            <div className="bg-[#161b22] px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span className="ml-2 font-semibold text-gray-400">CI/CD Run Log ({selectedRun.name})</span>
              </div>
              <div className="text-[10px] font-mono text-gray-500">
                status: {selectedRun.status}
              </div>
            </div>

            {/* Logs Body */}
            <pre className="p-4 bg-[#0d1117] overflow-y-auto max-h-[420px] font-mono text-[11px] text-gray-300 text-left whitespace-pre-wrap leading-relaxed space-y-1 scrollbar-thin">
              {selectedRun.logs.slice(0, visibleLogsCount).map((log, index) => {
                let lineClass = "text-gray-300";
                if (log.startsWith("🚀")) {
                  lineClass = "text-[#58a6ff] font-bold";
                } else if (log.startsWith("✔") || log.startsWith("✅") || log.startsWith("PASS")) {
                  lineClass = "text-[#57ab5a]";
                } else if (log.startsWith("❌") || log.startsWith("FAIL")) {
                  lineClass = "text-[#f85149]";
                } else if (log.startsWith("🔧")) {
                  lineClass = "text-[#d3c6ff]";
                } else if (log.startsWith("🎉")) {
                  lineClass = "text-yellow-400 font-bold";
                }
                return (
                  <div key={index} className={lineClass}>
                    {log}
                  </div>
                );
              })}
              {visibleLogsCount < selectedRun.logs.length && (
                <div className="text-[#58a6ff] animate-pulse">▋ Pipeline executing...</div>
              )}
              <div ref={logEndRef} />
            </pre>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 border border-dashed border-[#d0d7de] dark:border-[#30363d] rounded-md text-center bg-gray-50 dark:bg-[#161b22]/20">
            <HistoryIcon size={24} className="text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">Select a workflow run to view step logs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
