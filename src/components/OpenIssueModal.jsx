import React from "react";

const OpenIssueModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] absolute flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 2. Centered Modal Box */}
      <div className="relative bg-white border border-[#C8D1DA] rounded-lg shadow-2xl p-6 w-[500px] max-w-[90%] min-h-[300px]">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="font-semibold text-[16px] text-[#1F2328]">
            Create New Issue
          </h3>
          <button
            onClick={onClose}
            className="hover:bg-[#F3F4F6] p-1.5 rounded-md text-[#59636E] transition-colors"
          >
            <CrossBTN />
          </button>
        </div>

        {/* Content Area */}
        <div className="py-4">
          <p className="text-[14px] text-[#59636E]">
            Add your issue form fields or content here...
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[14px] font-medium border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="px-4 py-1.5 text-[14px] font-medium bg-[#1F883D] text-white rounded-md hover:bg-[#1A7F37]">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenIssueModal;
function CrossBTN() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      display="inline-block"
      overflow="visible"
    >
      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
    </svg>
  );
}
