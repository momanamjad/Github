import React, { useState, useEffect, useRef } from "react";
import {
  Folder,
  FolderOpen,
  File as FileIcon,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
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
              className="group flex items-center gap-1.5 py-1 px-2 hover:bg-[#f6f8fa] cursor-pointer transition-colors border-b border-[#d0d7de]/50"
              style={{ paddingLeft }}
            >
              <span onClick={() => toggle(fullPath)} className="shrink-0 text-[#636c76]">
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
              <span className="shrink-0 text-[#54aeff]">
                {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
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
                  className="flex-1 min-w-0 px-1.5 py-0 text-[13px] border border-[#0969da] rounded bg-white outline-none ring-1 ring-[#0969da]/30"
                />
              ) : (
                <span
                  className="flex-1 text-[14px] text-[#1f2328] truncate"
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
                    <FilePlus size={14} />
                  </ActionBtn>
                  <ActionBtn
                    title="New folder"
                    onClick={() => {
                      setOpenDirs((prev) => ({ ...prev, [fullPath]: true }));
                      setInlineCreate({ parentPath: fullPath, type: "dir" });
                    }}
                  >
                    <FolderPlus size={14} />
                  </ActionBtn>
                  <ActionBtn title="Rename" onClick={() => startRename(fullPath, node.name)}>
                    <Pencil size={13} />
                  </ActionBtn>
                  <ActionBtn title="Delete" onClick={() => removeNode(fullPath, node.name)} variant="danger">
                    <Trash2 size={13} />
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
          className="group flex items-center gap-1.5 py-1 px-2 hover:bg-[#f6f8fa] cursor-pointer transition-colors border-b border-[#d0d7de]/50"
          style={{ paddingLeft }}
        >
          <span className="shrink-0 w-[14px]" />
          <span className="shrink-0 text-[#636c76]">
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
              className="flex-1 min-w-0 px-1.5 py-0 text-[13px] border border-[#0969da] rounded bg-white outline-none ring-1 ring-[#0969da]/30"
            />
          ) : (
            <span
              className="flex-1 text-[14px] text-[#1f2328] truncate hover:underline hover:text-[#0969da]"
              onClick={() => onSelect && onSelect(node)}
            >
              {node.name}
            </span>
          )}

          {!isRenaming && (
            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-auto">
              <ActionBtn title="Rename" onClick={() => startRename(fullPath, node.name)}>
                <Pencil size={13} />
              </ActionBtn>
              <ActionBtn title="Delete" onClick={() => removeNode(fullPath, node.name)} variant="danger">
                <Trash2 size={13} />
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
      <div className="flex items-center gap-2 px-3 py-2 bg-[#f6f8fa] border border-[#d0d7de] rounded-t-md">
        <button
          onClick={() => setInlineCreate({ parentPath: "", type: "file" })}
          className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#24292f] bg-white border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] transition-colors cursor-pointer"
        >
          <FilePlus size={14} /> File
        </button>
        <button
          onClick={() => setInlineCreate({ parentPath: "", type: "dir" })}
          className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#24292f] bg-white border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] transition-colors cursor-pointer"
        >
          <FolderPlus size={14} /> Folder
        </button>
      </div>

      {/* File tree */}
      <div className="border border-t-0 border-[#d0d7de] rounded-b-md bg-white overflow-hidden">
        {tree.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#636c76] text-sm">
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
    className={`p-1 rounded transition-colors cursor-pointer
      ${variant === "danger"
        ? "text-[#636c76] hover:text-[#cf222e] hover:bg-[#ffebe9]"
        : "text-[#636c76] hover:text-[#0969da] hover:bg-[#ddf4ff]"
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
      className="flex items-center gap-1.5 py-1 px-2 bg-[#ddf4ff] border-b border-[#0969da]/30"
      style={{ paddingLeft }}
    >
      <span className="shrink-0 w-[14px]" />
      <span className="shrink-0 text-[#636c76]">
        {type === "dir" ? <Folder size={16} /> : <FileIcon size={16} />}
      </span>
      <input
        ref={ref}
        type="text"
        placeholder={type === "dir" ? "Folder name..." : "Filename..."}
        className="flex-1 min-w-0 px-1.5 py-0 text-[13px] border border-[#0969da] rounded bg-white outline-none ring-1 ring-[#0969da]/30"
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
