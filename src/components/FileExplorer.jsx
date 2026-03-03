import React, { useState, useEffect, useRef } from "react";
import {
  Folder,
  File as FileIcon,
  PlusSquare,
  Edit2,
  Trash2,
} from "lucide-react";
import { addNode, moveNode, deleteNode } from "@services/fileSystemService.js";

// simple tree view with expand/collapse and inline actions
const FileExplorer = ({ repoId, tree, onSelect, refreshTree }) => {
  const [openDirs, setOpenDirs] = useState({});
  // inline create { parentPath: string, type: 'file' | 'dir' }
  const [inlineCreate, setInlineCreate] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inlineCreate && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [inlineCreate]);

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
      alert(e.message);
    }
  };

  const renameNode = (oldPath) => {
    const segments = oldPath.split("/");
    const oldName = segments[segments.length - 1];
    const newName = window.prompt("New name", oldName);
    if (!newName || newName === oldName) return;
    const clean = newName.replace(/\s+/g, "-").trim();
    if (!clean) return;
    segments[segments.length - 1] = clean;
    const newPath = segments.join("/");
    try {
      moveNode(repoId, oldPath, newPath);
      refreshTree();
    } catch (e) {
      alert(e.message);
    }
  };

  const removeNode = (path) => {
    if (!window.confirm(`Delete '${path}'?`)) return;
    try {
      deleteNode(repoId, path);
      refreshTree();
      // if selected file was removed, clear selection
      if (onSelect) onSelect(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const renderNodes = (nodes, parentPath = "") => {
    return nodes.map((node) => {
      const fullPath = node.path;
      if (node.type === "dir") {
        const isOpen = !!openDirs[fullPath];
        return (
          <div key={fullPath} className="pl-2 bg-[#C8D1DA] rounded">
            <div className="flex items-center gap-1 ">
              <span
                className="cursor-pointer select-none"
                onClick={() => toggle(fullPath)}
              >
                {isOpen ? "▾" : "▸"}
              </span>
              <Folder size={16} />
              <span className="cursor-pointer" onClick={() => toggle(fullPath)}>
                {node.name}
              </span>
              <button
                title="add file"
                onClick={() =>
                  setInlineCreate({ parentPath: fullPath, type: "file" })
                }
                className="ml-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-file-plus-corner-icon lucide-file-plus-corner"
                >
                  <path d="M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35" />
                  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                  <path d="M14 19h6" />
                  <path d="M17 16v6" />
                </svg>
              </button>
              
              <button
                title="add folder"
                onClick={() =>
                  setInlineCreate({ parentPath: fullPath, type: "dir" })
                }
                className="ml-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-folder-plus-icon lucide-folder-plus"
                >
                  <path d="M12 10v6" />
                  <path d="M9 13h6" />
                  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                </svg>
              </button>
              <button
                title="rename"
                onClick={() => renameNode(fullPath)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                {/* <Edit2 size={14} /> */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-pencil-icon lucide-pencil"
                >
                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
              <button
                title="delete"
                onClick={() => removeNode(fullPath)}
                className="ml-1 text-red-600 hover:text-red-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {isOpen && (
              <>
                {renderNodes(node.children, fullPath)}
                {inlineCreate && inlineCreate.parentPath === fullPath && (
                  <div className="pl-6 py-1 flex items-center gap-2">
                    {inlineCreate.type === "dir" ? (
                      <Folder size={16} />
                    ) : (
                      <FileIcon size={16} />
                    )}
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={
                        inlineCreate.type === "dir" ? "New folder" : "New file"
                      }
                      className="border px-2 py-0.5 text-sm rounded w-48"
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          commitCreate(
                            fullPath,
                            inlineCreate.type === "dir",
                            e.currentTarget.value,
                          );
                        if (e.key === "Escape") setInlineCreate(null);
                      }}
                      onBlur={(e) =>
                        commitCreate(
                          fullPath,
                          inlineCreate.type === "dir",
                          e.currentTarget.value,
                        )
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
      }
      // file
      return (
        <div key={fullPath} className="pl-6 flex items-center gap-1">
          <FileIcon size={16} />
          <span
            className="cursor-pointer"
            onClick={() => onSelect && onSelect(node)}
          >
            {node.name}
          </span>
          <button
            title="rename"
            onClick={() => renameNode(fullPath)}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            <Edit2 size={14} />
          </button>
          <button
            title="delete"
            onClick={() => removeNode(fullPath)}
            className="ml-1 text-red-600 hover:text-red-800"
          >
            <Trash2 size={14} />
          </button>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setInlineCreate({ parentPath: "", type: "file" })}
          className="text-green-600 hover:text-green-800 flex items-center gap-1"
        >
          <PlusSquare size={16} /> File
        </button>
        <button
          onClick={() => setInlineCreate({ parentPath: "", type: "dir" })}
          className="text-green-600 hover:text-green-800 flex items-center gap-1"
        >
          <PlusSquare size={16} /> Folder
        </button>
      </div>
      {/* root-level nodes */}
      {renderNodes(tree)}
      {/* inline creator at root */}
      {inlineCreate && inlineCreate.parentPath === "" && (
        <div className="pl-2 py-1 flex items-center gap-2">
          {inlineCreate.type === "dir" ? (
            <Folder size={16} />
          ) : (
            <FileIcon size={16} />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder={
              inlineCreate.type === "dir" ? "New folder" : "New file"
            }
            className="border px-2 py-0.5 text-sm rounded w-48"
            onKeyDown={(e) => {
              if (e.key === "Enter")
                commitCreate(
                  "",
                  inlineCreate.type === "dir",
                  e.currentTarget.value,
                );
              if (e.key === "Escape") setInlineCreate(null);
            }}
            onBlur={(e) =>
              commitCreate(
                "",
                inlineCreate.type === "dir",
                e.currentTarget.value,
              )
            }
          />
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
