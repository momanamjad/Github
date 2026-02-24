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
          <div key={fullPath} className="pl-2">
            <div className="flex items-center gap-1">
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
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <PlusSquare size={14} />
              </button>
              <button
                title="add folder"
                onClick={() =>
                  setInlineCreate({ parentPath: fullPath, type: "dir" })
                }
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <PlusSquare size={14} />
              </button>
              <button
                title="rename"
                onClick={() => renameNode(fullPath)}
                className="ml-1 text-blue-600 hover:text-blue-800"
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
