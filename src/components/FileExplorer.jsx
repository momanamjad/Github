import React, { useState, useEffect, useRef } from "react";
import {
  FileDirectoryFillIcon,
  FileIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@primer/octicons-react";
import { addNode, moveNode, deleteNode } from "@services/fileSystemService.js";

const FileExplorer = ({ repoId, tree, onSelect, refreshTree }) => {
  const [openDirs, setOpenDirs] = useState({});
  const [inlineCreate, setInlineCreate] = useState(null);
  const [renamingPath, setRenamingPath] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const createInputRef = useRef(null);
  const renameInputRef = useRef(null);

  useEffect(() => {
    if (inlineCreate && createInputRef.current) {
      createInputRef.current.focus();
      createInputRef.current.select();
    }
  }, [inlineCreate]);

  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingPath]);

  const toggle = (path) =>
    setOpenDirs((prev) => ({ ...prev, [path]: !prev[path] }));

  const commitCreate = (parentPath, isDir, rawName) => {
    const clean = (rawName || "").replace(/\s+/g, "-").trim();
    if (!clean) {
      setInlineCreate(null);
      return;
    }
    const newPath = parentPath ? `${parentPath}/${clean}` : clean;
    const node = isDir
      ? { type: "dir", name: clean, path: newPath, children: [] }
      : { type: "file", name: clean, path: newPath, content: "" };
    try {
      addNode(repoId, parentPath, node);
      setInlineCreate(null);
      refreshTree();
      if (!isDir) {
        onSelect && onSelect(node);
      }
      if (parentPath) {
        setOpenDirs((prev) => ({ ...prev, [parentPath]: true }));
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  // ── Inline rename (VS Code style) ──
  const startRename = (path, currentName) => {
    setRenamingPath(path);
    setRenameValue(currentName);
  };

  const commitRename = (oldPath) => {
    const clean = (renameValue || "").replace(/\s+/g, "-").trim();
    const segments = oldPath.split("/");
    const oldName = segments[segments.length - 1];

    if (!clean || clean === oldName) {
      setRenamingPath(null);
      return;
    }

    segments[segments.length - 1] = clean;
    const newPath = segments.join("/");
    try {
      moveNode(repoId, oldPath, newPath);
      setRenamingPath(null);
      refreshTree();
    } catch (e) {
      console.error(e.message);
      setRenamingPath(null);
    }
  };

  const cancelRename = () => {
    setRenamingPath(null);
    setRenameValue("");
  };

  const removeNode = (path, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      deleteNode(repoId, path);
      refreshTree();
      if (onSelect) onSelect(null);
    } catch (e) {
      console.error(e.message);
    }
  };

  const renderNodes = (nodes, depth = 0) => {
    return nodes.map((node) => {
      const fullPath = node.path;
      const isRenaming = renamingPath === fullPath;
      const paddingLeft = `${depth * 16 + 8}px`;

      if (node.type === "dir") {
        const isOpen = !!openDirs[fullPath];
        return (
          <div key={fullPath}>
            {/* Directory row */}
            <div
              className="group flex items-center gap-1.5 py-1 px-2 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] cursor-pointer transition-colors"
              style={{ paddingLeft }}
            >
              <span onClick={() => toggle(fullPath)} className="shrink-0 text-[#636c76] dark:text-[#8b949e]">
                {isOpen ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
              </span>
              <span className="shrink-0 text-[#54aeff]">
                <FileDirectoryFillIcon size={16} />
              </span>

              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(fullPath);
                    if (e.key === "Escape") cancelRename();
                  }}
                  onBlur={() => commitRename(fullPath)}
                  className="flex-1 min-w-0 px-1.5 py-0 text-[13px] border border-[#0969da] dark:border-[#58a6ff] rounded bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-white outline-none ring-1 ring-[#0969da]/30"
                />
              ) : (
                <span
                  className="flex-1 text-[14px] text-[#1f2328] dark:text-[#c9d1d9] truncate"
                  onClick={() => toggle(fullPath)}
                >
                  {node.name}
                </span>
              )}

              {/* Action buttons — visible on hover */}
              {!isRenaming && (
                <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-auto">
                  <ActionBtn
                    title="New file"
                    onClick={() => {
                      setOpenDirs((prev) => ({ ...prev, [fullPath]: true }));
                      setInlineCreate({ parentPath: fullPath, type: "file" });
                    }}
                  >
                    <PlusIcon size={14} />
                  </ActionBtn>
                  <ActionBtn
                    title="New folder"
                    onClick={() => {
                      setOpenDirs((prev) => ({ ...prev, [fullPath]: true }));
                      setInlineCreate({ parentPath: fullPath, type: "dir" });
                    }}
                  >
                    <PlusIcon size={14} />
                  </ActionBtn>
                  <ActionBtn title="Rename" onClick={() => startRename(fullPath, node.name)}>
                    <PencilIcon size={13} />
                  </ActionBtn>
                  <ActionBtn title="Delete" onClick={() => removeNode(fullPath, node.name)} variant="danger">
                    <TrashIcon size={13} />
                  </ActionBtn>
                </div>
              )}
            </div>
            {/* Children */}
            {isOpen && (
              <>
                {renderNodes(node.children, depth + 1)}
                {inlineCreate && inlineCreate.parentPath === fullPath && (
                  <InlineInput
                    ref={createInputRef}
                    type={inlineCreate.type}
                    depth={depth + 1}
                    onCommit={(name) => commitCreate(fullPath, inlineCreate.type === "dir", name)}
                    onCancel={() => setInlineCreate(null)}
                  />
                )}
              </>
            )}
          </div>
        );
      }

      // ── File node ──
      return (
        <div
          key={fullPath}
          className="group flex items-center gap-1.5 py-1 px-2 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] cursor-pointer transition-colors"
          style={{ paddingLeft }}
        >
          <span className="shrink-0 w-[14px]" />
          <span className="shrink-0 text-[#636c76] dark:text-[#8b949e]">
            <FileIcon size={16} />
          </span>

          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename(fullPath);
                if (e.key === "Escape") cancelRename();
              }}
              onBlur={() => commitRename(fullPath)}
              className="flex-1 min-w-0 px-1.5 py-0 text-[13px] border border-[#0969da] dark:border-[#58a6ff] rounded bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-white outline-none ring-1 ring-[#0969da]/30"
            />
          ) : (
            <span
              className="flex-1 text-[14px] text-[#1f2328] dark:text-[#c9d1d9] truncate hover:underline hover:text-[#0969da] dark:hover:text-[#58a6ff]"
              onClick={() => onSelect && onSelect(node)}
            >
              {node.name}
            </span>
          )}

          {!isRenaming && (
            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-auto">
              <ActionBtn title="Rename" onClick={() => startRename(fullPath, node.name)}>
                <PencilIcon size={13} />
              </ActionBtn>
              <ActionBtn title="Delete" onClick={() => removeNode(fullPath, node.name)} variant="danger">
                <TrashIcon size={13} />
              </ActionBtn>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-t-md">
        <button
          onClick={() => setInlineCreate({ parentPath: "", type: "file" })}
          className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#24292f] dark:text-[#c9d1d9] bg-white dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] transition-colors cursor-pointer"
        >
          <PlusIcon size={14} /> File
        </button>
        <button
          onClick={() => setInlineCreate({ parentPath: "", type: "dir" })}
          className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#24292f] dark:text-[#c9d1d9] bg-white dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] transition-colors cursor-pointer"
        >
          <PlusIcon size={14} /> Folder
        </button>
      </div>

      {/* File tree */}
      <div className="border border-t-0 border-[#d0d7de] dark:border-[#30363d] rounded-b-md bg-white dark:bg-[#0d1117] overflow-hidden">
        {tree.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#636c76] dark:text-[#8b949e] text-sm">
            This repository is empty. Create a file or folder to get started.
          </div>
        ) : (
          renderNodes(tree)
        )}

        {/* Root-level inline input */}
        {inlineCreate && inlineCreate.parentPath === "" && (
          <InlineInput
            ref={createInputRef}
            type={inlineCreate.type}
            depth={0}
            onCommit={(name) => commitCreate("", inlineCreate.type === "dir", name)}
            onCancel={() => setInlineCreate(null)}
          />
        )}
      </div>
    </div>
  );
};

// Small action button used in file rows
const ActionBtn = ({ children, title, onClick, variant = "default" }) => (
  <button
    title={title}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`p-1 rounded transition-colors cursor-pointer bg-transparent border-0
      ${variant === "danger"
        ? "text-[#636c76] dark:text-[#8b949e] hover:text-[#cf222e] dark:hover:text-[#ff7b72] hover:bg-[#ffebe9] dark:hover:bg-[#4d1f21]"
        : "text-[#636c76] dark:text-[#8b949e] hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:bg-[#ddf4ff] dark:hover:bg-[#1f3f26]"
      }`}
  >
    {children}
  </button>
);

// Inline input for creating files/folders
const InlineInput = React.forwardRef(({ type, depth, onCommit, onCancel }, ref) => {
  const paddingLeft = `${depth * 16 + 8}px`;
  return (
    <div
      className="flex items-center gap-1.5 py-1 px-2 bg-[#ddf4ff] dark:bg-[#1f3f26] border-b border-[#0969da]/30"
      style={{ paddingLeft }}
    >
      <span className="shrink-0 w-[14px]" />
      <span className="shrink-0 text-[#636c76] dark:text-[#8b949e]">
        {type === "dir" ? <FileDirectoryFillIcon size={16} /> : <FileIcon size={16} />}
      </span>
      <input
        ref={ref}
        type="text"
        placeholder={type === "dir" ? "Folder name..." : "Filename..."}
        className="flex-1 min-w-0 px-1.5 py-0 text-[13px] border border-[#0969da] dark:border-[#58a6ff] rounded bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-white outline-none ring-1 ring-[#0969da]/30"
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(e.currentTarget.value);
          if (e.key === "Escape") onCancel();
        }}
        onBlur={(e) => onCommit(e.currentTarget.value)}
      />
    </div>
  );
});

InlineInput.displayName = "InlineInput";

export default FileExplorer;
