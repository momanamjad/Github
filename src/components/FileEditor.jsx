import React, { useState, useEffect } from "react";
import { updateNode } from "@services/fileSystemService.js";

const FileEditor = ({ repoId, file, onSave }) => {
  const [content, setContent] = useState(file?.content || "");

  useEffect(() => {
    setContent(file?.content || "");
  }, [file]);

  if (!file) return null;

  const handleSave = () => {
    try {
      updateNode(repoId, file.path, { content });
      if (onSave) onSave(file.path, content);
      alert("Saved");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="border p-4 bg-white">
      <h2 className="font-semibold mb-2">{file.name}</h2>
      <textarea
        className="w-full h-64 border p-2 font-mono text-sm"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        onClick={handleSave}
        className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
      >
        Save
      </button>
    </div>
  );
};

export default FileEditor;
