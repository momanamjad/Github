import React from "react";
import CloseIcon from "../../public/customIcons/CloseIcon";
import { useScrollLock } from "../hooks/useScrollLock";


export default function FilterModal({ open, onClose, title, options = [], onSelect }) {
  useScrollLock(open);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white sm:border border-gray-300 rounded-t-xl sm:rounded-lg shadow-lg flex flex-col max-h-[80vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-200">
        <div className="px-4 py-3 border-b font-semibold flex justify-between items-center bg-[#f6f8fa] rounded-t-xl sm:bg-white sm:rounded-t-lg shrink-0">
          <span>{title}</span>
          <button className="sm:hidden p-1 text-gray-500" onClick={onClose}>
            <CloseIcon width="16" height="16" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 sm:pb-0">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(opt);
                onClose();
              }}
              className="w-full text-left px-4 py-3 sm:py-2 hover:bg-gray-100 text-sm border-b sm:border-none border-gray-100 last:border-none active:bg-gray-200"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
