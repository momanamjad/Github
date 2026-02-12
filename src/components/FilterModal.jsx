import React from "react";

export default function FilterModal({ open, onClose, title, options = [], onSelect }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div
        className="absolute inset-0 bg-gray-200/60"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white border border-gray-300 rounded-lg shadow-lg">
        <div className="px-4 py-3 border-b font-semibold">{title}</div>

        <div className="max-h-80 overflow-y-auto">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(opt);
                onClose();
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
