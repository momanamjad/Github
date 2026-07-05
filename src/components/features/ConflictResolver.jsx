import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { AlertIcon, CheckIcon, CodeIcon, GitPullRequestIcon, InfoIcon } from '@primer/octicons-react';

const parseConflicts = (content) => {
  const blocks = [];
  const lines = content.split(/\r?\n/);
  let currentNormal = [];
  let currentTarget = [];
  let currentSource = [];
  let stage = 'normal'; // 'normal' | 'target' | 'source'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('<<<<<<<')) {
      if (currentNormal.length > 0) {
        blocks.push({ type: 'normal', content: currentNormal.join('\n') });
        currentNormal = [];
      }
      stage = 'target';
    } else if (line.startsWith('=======')) {
      stage = 'source';
    } else if (line.startsWith('>>>>>>>')) {
      blocks.push({
        type: 'conflict',
        target: currentTarget.join('\n'),
        source: currentSource.join('\n'),
        resolved: null // null | 'target' | 'source' | 'both'
      });
      currentTarget = [];
      currentSource = [];
      stage = 'normal';
    } else {
      if (stage === 'normal') {
        currentNormal.push(line);
      } else if (stage === 'target') {
        currentTarget.push(line);
      } else if (stage === 'source') {
        currentSource.push(line);
      }
    }
  }

  if (currentNormal.length > 0) {
    blocks.push({ type: 'normal', content: currentNormal.join('\n') });
  }

  return blocks;
};

const rebuildContent = (blocks) => {
  return blocks.map(block => {
    if (block.type === 'normal') {
      return block.content;
    } else {
      if (block.resolved === 'target') {
        return block.target;
      } else if (block.resolved === 'source') {
        return block.source;
      } else if (block.resolved === 'both') {
        return block.target + '\n' + block.source;
      } else {
        return `<<<<<<< HEAD\n${block.target}\n=======\n${block.source}\n>>>>>>> branch`;
      }
    }
  }).join('\n');
};

export default function ConflictResolver({ repoId, pr, onClose, onResolveComplete }) {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]); // Array of { path, blocks, isResolved, isManual, manualContent }
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        setLoading(true);
        const res = await apiClient(`/repos/${repoId}/pulls/${pr._id || pr.id}/conflicts`);
        if (res?.data) {
          const formattedFiles = res.data.map(file => {
            const blocks = parseConflicts(file.content);
            return {
              path: file.path,
              blocks,
              isResolved: blocks.every(b => b.type === 'normal' || b.resolved !== null),
              isManual: false,
              manualContent: file.content
            };
          });
          setFiles(formattedFiles);
        }
      } catch (err) {
        console.error("Failed to fetch conflicts:", err);
      } finally {
        setLoading(false);
      }
    };
    if (repoId && pr) {
      fetchConflicts();
    }
  }, [repoId, pr]);

  const activeFile = files[activeFileIdx];

  const handleResolveConflictBlock = (blockIdx, choice) => {
    setFiles(prev => prev.map((f, fileIdx) => {
      if (fileIdx !== activeFileIdx) return f;

      const newBlocks = f.blocks.map((b, idx) => {
        if (idx !== blockIdx) return b;
        return { ...b, resolved: choice };
      });

      const allResolved = newBlocks.every(b => b.type === 'normal' || b.resolved !== null);

      return {
        ...f,
        blocks: newBlocks,
        isResolved: allResolved
      };
    }));
  };

  const handleToggleManualEdit = (val) => {
    setFiles(prev => prev.map((f, fileIdx) => {
      if (fileIdx !== activeFileIdx) return f;
      
      const currentRebuilt = rebuildContent(f.blocks);
      return {
        ...f,
        isManual: val,
        manualContent: val ? currentRebuilt : f.manualContent
      };
    }));
  };

  const handleManualContentChange = (val) => {
    setFiles(prev => prev.map((f, fileIdx) => {
      if (fileIdx !== activeFileIdx) return f;
      return {
        ...f,
        manualContent: val,
        isResolved: val.indexOf('<<<<<<<') === -1 // Considered resolved if no conflict markers remain
      };
    }));
  };

  const handleCommitResolution = async () => {
    setSubmitting(true);
    try {
      const resolvedFilesPayload = {};
      files.forEach(f => {
        resolvedFilesPayload[f.path] = f.isManual ? f.manualContent : rebuildContent(f.blocks);
      });

      const res = await apiClient(`/repos/${repoId}/pulls/${pr._id || pr.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolvedFiles: resolvedFilesPayload })
      });

      if (res?.success) {
        onResolveComplete();
      }
    } catch (err) {
      console.error(err);
      alert("Resolution submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-xs text-[#57606a]">
        <RefreshCwIcon className="animate-spin text-purple-600 mb-2" />
        <span>Analyzing merge conflicts...</span>
      </div>
    );
  }

  const allResolved = files.every(f => f.isResolved);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] border border-[#d0d7de] dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117] overflow-hidden text-left shadow-sm">
      {/* Header bar */}
      <div className="bg-[#f6f8fa] dark:bg-[#161b22] px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1f2328] dark:text-white flex items-center gap-1.5">
            <AlertIcon className="text-yellow-600" />
            Resolve conflicts in Pull Request #{pr.number}
          </h3>
          <p className="text-[11px] text-[#57606a] dark:text-[#8b949e]">
            Review changes from <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">{pr.sourceBranch}</span> into <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">{pr.targetBranch}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-gray-700 dark:text-gray-300 rounded text-xs font-semibold cursor-pointer"
          >
            Abort
          </button>
          <button
            onClick={handleCommitResolution}
            disabled={!allResolved || submitting}
            className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded text-xs font-semibold cursor-pointer border-0"
          >
            {submitting ? 'Saving...' : 'Commit merge resolution'}
          </button>
        </div>
      </div>

      {/* Main Workspace: File List & Editor Panel */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#d0d7de] dark:divide-[#30363d] overflow-hidden">
        {/* Left Side: Conflicted Files List */}
        <div className="w-full md:w-64 bg-[#f6f8fa] dark:bg-[#161b22] flex flex-col overflow-y-auto max-h-48 md:max-h-none">
          <div className="p-3 border-b border-[#d0d7de] dark:border-[#30363d] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Conflicted Files ({files.length})
          </div>
          <div className="divide-y divide-[#d0d7de]/50 dark:divide-[#30363d]/50">
            {files.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setActiveFileIdx(idx)}
                className={`w-full text-left p-3 text-xs flex items-center justify-between gap-3 border-0 bg-transparent cursor-pointer transition-colors ${idx === activeFileIdx ? 'bg-white dark:bg-[#0d1117] font-semibold text-[#0969da] dark:text-[#58a6ff]' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              >
                <span className="font-mono truncate">{file.path}</span>
                {file.isResolved ? (
                  <span className="text-[#2ea44f]" title="Resolved">
                    <CheckIcon size={14} />
                  </span>
                ) : (
                  <span className="text-yellow-600 animate-pulse" title="Conflicts remain">
                    ●
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Interactive Editor Panel */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0d1117] overflow-hidden">
          {activeFile ? (
            <>
              {/* Toolbar */}
              <div className="px-4 py-2 border-b border-[#d0d7de] dark:border-[#30363d] bg-gray-50 dark:bg-[#161b22]/40 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-gray-600 dark:text-gray-300 truncate">{activeFile.path}</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[11px] text-[#57606a] dark:text-[#8b949e] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFile.isManual}
                      onChange={(e) => handleToggleManualEdit(e.target.checked)}
                      className="rounded accent-purple-600"
                    />
                    <span>Edit raw conflict markers</span>
                  </label>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                {activeFile.isManual ? (
                  <textarea
                    value={activeFile.manualContent}
                    onChange={(e) => handleManualContentChange(e.target.value)}
                    className="w-full h-full p-4 bg-gray-50 dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md outline-none text-xs font-mono text-[#24292f] dark:text-[#c9d1d9] resize-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Manually resolve conflict blocks..."
                  />
                ) : (
                  <div className="space-y-4">
                    {activeFile.blocks.map((block, idx) => {
                      if (block.type === 'normal') {
                        return (
                          <pre key={idx} className="whitespace-pre-wrap pl-6 text-[#24292f] dark:text-[#c9d1d9] leading-relaxed border-l-2 border-transparent">
                            {block.content || ' '}
                          </pre>
                        );
                      }

                      // Conflict block
                      return (
                        <div key={idx} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22]">
                          {/* Helper Header */}
                          <div className="bg-[#f6f8fa] dark:bg-[#161b22] px-3.5 py-2 border-b border-[#d0d7de] dark:border-[#30363d] flex flex-wrap items-center justify-between gap-3 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <InfoIcon size={14} className="text-purple-600" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                Conflict Block: Choose how to merge
                              </span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleResolveConflictBlock(idx, 'target')}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${block.resolved === 'target' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#21262d] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                              >
                                Use {pr.targetBranch} (Current)
                              </button>
                              <button
                                onClick={() => handleResolveConflictBlock(idx, 'source')}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${block.resolved === 'source' ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-[#21262d] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                              >
                                Use {pr.sourceBranch} (Incoming)
                              </button>
                              <button
                                onClick={() => handleResolveConflictBlock(idx, 'both')}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${block.resolved === 'both' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-[#21262d] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                              >
                                Keep Both
                              </button>
                            </div>
                          </div>

                          {/* Options content */}
                          <div className="flex flex-col divide-y divide-[#d0d7de] dark:divide-[#30363d] font-mono text-[11px]">
                            {/* Current Branch Box */}
                            <div className={`p-3 text-left ${block.resolved === 'target' ? 'bg-blue-50/20' : ''}`}>
                              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                                {pr.targetBranch} (Current)
                              </span>
                              <pre className="whitespace-pre-wrap pl-3 border-l-2 border-blue-500/40">
                                {block.target || <i className="text-gray-400">&lt;empty&gt;</i>}
                              </pre>
                            </div>

                            {/* Incoming Branch Box */}
                            <div className={`p-3 text-left ${block.resolved === 'source' ? 'bg-green-50/20' : ''}`}>
                              <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 block mb-1">
                                {pr.sourceBranch} (Incoming)
                              </span>
                              <pre className="whitespace-pre-wrap pl-3 border-l-2 border-green-500/40">
                                {block.source || <i className="text-gray-400">&lt;empty&gt;</i>}
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 text-xs">
              <CodeIcon size={24} className="mb-2" />
              <span>Select a conflicted file from the sidebar to begin resolution.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon helpers to prevent Primer import bugs
const RefreshCwIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 2.5a5.487 5.487 0 00-4.131 1.869l1.204 1.204A.25.25 0 014.896 6H1.25A.25.25 0 011 5.75V2.104a.25.25 0 01.427-.177l1.38 1.38A7.001 7.001 0 0114.95 7.16a.75.75 0 11-1.49.128A5.501 5.501 0 008 2.5zM1.05 8.84a.75.75 0 01.74-.632.75.75 0 01.632.74A5.501 5.501 0 008 13.5c1.7 0 3.224-.77 4.131-1.869l-1.204-1.204a.25.25 0 01.177-.427h3.646c.138 0 .25.112.25.25v3.646a.25.25 0 01-.427.177l-1.38-1.38A7.001 7.001 0 011.05 8.84z"/>
  </svg>
);
