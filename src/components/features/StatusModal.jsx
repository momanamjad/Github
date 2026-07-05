import React, { useState, useEffect } from 'react';
import { useGitHub } from '../../contexts/GitHubContext';
import { CheckIcon, InfoIcon } from '@primer/octicons-react';

export default function StatusModal({ isOpen, onClose }) {
  const { status, updateStatus } = useGitHub();
  const [emoji, setEmoji] = useState("");
  const [text, setText] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status) {
      setEmoji(status.emoji || "");
      setText(status.text || "");
      setIsBusy(status.isBusy || false);
    }
  }, [status, isOpen]);

  if (!isOpen) return null;

  const presets = [
    { emoji: "🌴", text: "On vacation", isBusy: true },
    { emoji: "🎯", text: "Focusing", isBusy: true },
    { emoji: "💻", text: "Coding", isBusy: false },
    { emoji: "🤒", text: "Out sick", isBusy: true },
    { emoji: "🤝", text: "In meetings", isBusy: true },
    { emoji: "🍔", text: "Out for lunch", isBusy: false }
  ];

  const popularEmojis = ["💬", "💻", "🎯", "🌴", "🤒", "🤝", "🍔", "🚀", "🎉", "🔥", "💡", "🎨", "🧪", "🐛", "🔒", "⏳", "💤"];

  const handleSelectPreset = (p) => {
    setEmoji(p.emoji);
    setText(p.text);
    setIsBusy(p.isBusy);
  };

  const handleClearStatus = async () => {
    setSubmitting(true);
    const success = await updateStatus({ emoji: "", text: "", isBusy: false });
    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await updateStatus({ emoji, text, isBusy });
    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1b1f23]/50 dark:bg-[#010409]/80 flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-xl w-full max-w-md overflow-hidden text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#24292f] dark:text-[#c9d1d9] uppercase tracking-wider">Set user status</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent border-0 cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* Custom Input */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="🔍"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.substring(0, 4))}
              className="w-10 text-center px-1.5 py-1.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-sm outline-none focus:border-[#58a6ff]"
              title="Emoji character"
            />
            <input
              type="text"
              placeholder="What's happening?"
              value={text}
              onChange={(e) => setText(e.target.value.substring(0, 100))}
              className="flex-1 px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff] text-[#24292f] dark:text-white"
            />
          </div>

          {/* Busy check */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isBusy}
              onChange={(e) => setIsBusy(e.target.checked)}
              className="rounded accent-purple-600"
            />
            <span>Busy (shows red status dot on profile)</span>
          </label>

          {/* Popular Emojis Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Popular Emojis</span>
            <div className="flex flex-wrap gap-1.5">
              {popularEmojis.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-sm border-0 bg-transparent cursor-pointer transition-colors ${emoji === e ? 'bg-purple-50 dark:bg-purple-950/20 border border-purple-300 dark:border-purple-800' : ''}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-[#d0d7de] dark:border-[#30363d]" />

          {/* Presets List */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Presets</span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-[#161b22] dark:hover:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-md flex items-center gap-2 transition-all cursor-pointer border-0"
                >
                  <span className="text-sm">{p.emoji}</span>
                  <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate font-medium">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-[#161b22] border-t border-[#d0d7de] dark:border-[#30363d] flex justify-between items-center gap-2">
          <button
            type="button"
            onClick={handleClearStatus}
            disabled={submitting}
            className="px-3 py-1.5 bg-transparent hover:text-red-500 border-0 text-[#57606a] dark:text-[#8b949e] font-semibold text-xs cursor-pointer"
          >
            Clear status
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-semibold text-xs rounded-md border-0 cursor-pointer"
            >
              {submitting ? "Saving..." : "Set Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
