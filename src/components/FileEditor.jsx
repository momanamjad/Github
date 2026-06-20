import React, { useState, useEffect } from "react";
import { updateNode } from "@services/fileSystemService.js";
import { CheckIcon, CodeIcon } from "@primer/octicons-react";

const FileEditor = ({ repoId, file, onSave, isOwner = true }) => {
  const [content, setContent] = useState(file?.content || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContent(file?.content || "");
    setSaved(false);
  }, [file]);

  if (!file) return null;

  const handleSave = async () => {
    try {
      await updateNode(repoId, file.path, { content });
      if (onSave) onSave(file.path, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e.message);
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
            onClick={handleSave}
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

      {/* Editor area */}
      <div className="relative">
        <textarea
          className="w-full min-h-[300px] sm:min-h-[400px] p-3 sm:p-4 font-mono text-[13px] leading-relaxed text-[#1f2328] dark:text-[#c9d1d9] bg-white dark:bg-[#0d1117] border-none outline-none resize-y"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSaved(false);
          }}
          readOnly={!isOwner}
          spellCheck={false}
          placeholder="Start typing..."
        />
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-[#f6f8fa] dark:bg-[#161b22] border-t border-[#d0d7de] dark:border-[#30363d] text-[11px] text-[#636c76] dark:text-[#8b949e]">
        <span>{content.split("\n").length} lines</span>
        <span>{content.length} characters</span>
      </div>
    </div>
  );
};

export default FileEditor;
