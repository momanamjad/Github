import React, { useState, useEffect } from "react";
import { updateNode, addNode } from "@services/fileSystemService.js";
import { CheckIcon, CodeIcon } from "@primer/octicons-react";
import MarkdownRenderer from "./common/MarkdownRenderer.jsx";

const FileEditor = ({ repoId, file, onSave, isOwner = true, branch = 'main' }) => {
  const [content, setContent] = useState(file?.content || "");
  const [saved, setSaved] = useState(false);
  const [editorTab, setEditorTab] = useState("edit"); // "edit" | "preview"

  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMsg, setCommitMsg] = useState("");
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    setContent(file?.content || "");
    setSaved(false);
    setCommitMsg("");
    setEditorTab("edit");
  }, [file]);

  if (!file) return null;

  const isNew = !file._id && !file.id;

  const handleSave = async () => {
    if (committing) return;
    setCommitting(true);
    try {
      const finalMsg = commitMsg.trim() || (isNew ? `Create ${file.name}` : `Update ${file.name}`);
      if (isNew) {
        await addNode(repoId, file.parentPath, {
          name: file.name,
          path: file.path,
          type: 'file',
          content,
          commitMessage: finalMsg
        }, branch);
      } else {
        await updateNode(repoId, file.path, { 
          content,
          commitMessage: finalMsg
        }, branch);
      }
      if (onSave) onSave(file.path, content, isNew);
      setSaved(true);
      setShowCommitModal(false);
      setCommitMsg("");
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e.message);
    } finally {
      setCommitting(false);
    }
  };

  // Detect language from file extension for styling
  const ext = file.name.split(".").pop()?.toLowerCase();
  const langLabel = {
    js: "JavaScript",
    jsx: "JSX",
    ts: "TypeScript",
    tsx: "TSX",
    py: "Python",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    md: "Markdown",
    txt: "Text",
  }[ext] || ext?.toUpperCase() || "File";

  const isUnchanged = content === (file?.content || "");

  return (
    <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] overflow-hidden">
      {/* File header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="flex items-center gap-2 min-w-0">
          <CodeIcon size={16} className="text-[#636c76] dark:text-[#8b949e] shrink-0" />
          <span className="text-[14px] font-semibold text-[#1f2328] dark:text-[#c9d1d9] truncate">{file.name}</span>
          <span className="hidden sm:inline text-[11px] px-1.5 py-[1px] bg-[#ddf4ff] dark:bg-[#30363d] text-[#0969da] dark:text-[#58a6ff] rounded-full font-medium">
            {langLabel}
          </span>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowCommitModal(true)}
            disabled={isUnchanged && !saved}
            className={`flex items-center gap-1.5 px-3 py-[5px] text-[13px] font-semibold rounded-md border transition-all shrink-0
              ${saved
                ? "bg-[#2da44f] text-white border-transparent"
                : isUnchanged
                  ? "bg-[#f6f8fa] dark:bg-[#21262d] text-[#8c959f] border-[#d0d7de] dark:border-[#30363d] cursor-not-allowed"
                  : "bg-[#2da44f] hover:bg-[#2c974b] text-white border-transparent cursor-pointer"
              }`}
          >
            {saved ? (
              <>
                <CheckIcon size={14} /> Saved!
              </>
            ) : (
              <>
                <CheckIcon size={14} /> <span className="hidden sm:inline">Commit changes</span><span className="sm:hidden">Save</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Edit/Preview Tabs */}
      <div className="flex border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] px-3 sm:px-4 gap-2 select-none">
        <button
          onClick={() => setEditorTab("edit")}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 cursor-pointer bg-transparent border-0 -mb-[1px] ${editorTab === "edit" ? "border-[#f78166] text-[#1f2328] dark:text-white font-bold" : "border-transparent text-[#57606a] dark:text-[#8b949e]"}`}
        >
          Edit
        </button>
        <button
          onClick={() => setEditorTab("preview")}
          className={`px-3 py-1.5 text-xs font-semibold border-b-2 cursor-pointer bg-transparent border-0 -mb-[1px] ${editorTab === "preview" ? "border-[#f78166] text-[#1f2328] dark:text-white font-bold" : "border-transparent text-[#57606a] dark:text-[#8b949e]"}`}
        >
          Preview
        </button>
      </div>

      {/* Editor area */}
      <div className="relative min-h-[300px] sm:min-h-[400px]">
        {editorTab === "edit" ? (
          <textarea
            className="w-full min-h-[300px] sm:min-h-[400px] p-3 sm:p-4 font-mono text-[13px] leading-relaxed text-[#1f2328] dark:text-[#c9d1d9] bg-white dark:bg-[#0d1117] border-none outline-none resize-y text-left"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
            readOnly={!isOwner}
            spellCheck={false}
            placeholder="Start typing..."
          />
        ) : (
          <div className="p-4 bg-white dark:bg-[#0d1117] min-h-[300px] sm:min-h-[400px] text-left overflow-y-auto">
            {ext === "md" ? (
              <MarkdownRenderer content={content} />
            ) : (
              <pre className="font-mono text-[13px] leading-relaxed text-[#1f2328] dark:text-[#c9d1d9] whitespace-pre-wrap">{content || <i className="text-gray-400">Empty file</i>}</pre>
            )}
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-[#f6f8fa] dark:bg-[#161b22] border-t border-[#d0d7de] dark:border-[#30363d] text-[11px] text-[#636c76] dark:text-[#8b949e]">
        <span>{content.split("\n").length} lines</span>
        <span>{content.length} characters</span>
      </div>

      {/* Commit Modal Overlay */}
      {showCommitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-lg overflow-hidden text-left">
            <div className="px-4 py-3 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[#24292f] dark:text-white font-sans">Commit changes</h3>
              <button 
                onClick={() => setShowCommitModal(false)}
                disabled={committing}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white bg-transparent border-0 cursor-pointer font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#57606a] dark:text-[#8b949e] mb-1.5">
                  Commit message
                </label>
                <input
                  type="text"
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  placeholder={isNew ? `Create ${file.name}` : `Update ${file.name}`}
                  className="w-full px-3 py-2 text-xs border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] focus:outline-none focus:border-[#0969da] dark:focus:border-[#58a6ff] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2 pt-3 justify-end border-t border-[#d0d7de] dark:border-[#30363d]">
                <button
                  onClick={() => setShowCommitModal(false)}
                  disabled={committing}
                  className="px-3 py-1.5 text-xs font-semibold text-[#24292f] dark:text-white border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#21262d] hover:bg-[#ebedf0] dark:hover:bg-[#30363d] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={committing}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2ea043] border border-transparent rounded-md hover:bg-[#2c974b] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {committing && (
                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {committing ? "Committing..." : "Commit changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileEditor;
