import React, { useState } from "react";
import { Folder, File as FileIcon, PlusSquare, Edit2, Trash2 } from "lucide-react";
import {
  addNode,
  moveNode,
  deleteNode,
} from "@services/fileSystemService.js";

// simple tree view with expand/collapse and inline actions
const FileExplorer = ({ repoId, tree, onSelect, refreshTree }) => {
  const [openDirs, setOpenDirs] = useState({});

  const toggle = (path) =>
    setOpenDirs((prev) => ({ ...prev, [path]: !prev[path] }));

  const createNode = (parentPath, isDir) => {
    const promptText = isDir ? "Directory name" : "File name";
    const name = window.prompt(promptText);
    if (!name) return;
    const clean = name.replace(/\s+/g, "-").trim();
    if (!clean) return;
    const newPath = parentPath ? `${parentPath}/${clean}` : clean;
    const node = isDir
      ? { type: "dir", name: clean, path: newPath, children: [] }
      : { type: "file", name: clean, path: newPath, content: "" };
    try {
      addNode(repoId, parentPath, node);
      refreshTree();
      if (!isDir) {
        onSelect && onSelect(node);
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
                onClick={() => createNode(fullPath, false)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <PlusSquare size={14} />
              </button>
              <button
                title="add folder"
                onClick={() => createNode(fullPath, true)}
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
            {isOpen && renderNodes(node.children, fullPath)}
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
          onClick={() => createNode("", false)}
          className="text-green-600 hover:text-green-800 flex items-center gap-1"
        >
          <PlusSquare size={16} /> File
        </button>
        <button
          onClick={() => createNode("", true)}
          className="text-green-600 hover:text-green-800 flex items-center gap-1"
        >
          <PlusSquare size={16} /> Folder
        </button>
      </div>
      {renderNodes(tree)}
    </div>
  );
};

export default FileExplorer;
