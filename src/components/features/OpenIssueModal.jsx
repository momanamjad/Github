import React from "react";
import RepoSelector from "./RepoSelector";

const OpenIssueModal = ({ onClose, username = "momanamjad" }) => {
  return (
    <div className="fixed inset-0 z-[100] absolute flex items-center justify-center ">
      <div className="absolute inset-0 bg-[#e9edf0]/50   " onClick={onClose} />

      <div className="relative bg-white border   rounded-lg shadow-2xl pt-4  w-[850px] max-w-[90%] min-h-[300px]">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4 pl-4 pr-2">
          <h3 className="font-semibold text-[16px] text-[#1F2328]">
            Create New Issue
          </h3>
          <div className="flex gap-3">
            <button
              data-component="IconButton"
              type="button"
              class="prc-Button-ButtonBase-9n-Xk CreateIssueDialogHeader-module__CopyToClipboardButton__kzd6gM7 prc-Button-IconButton-fyge7"
              data-loading="false"
              data-no-visuals="true"
              data-size="medium"
              data-variant="invisible"
              aria-labelledby="_r_1c_"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                display="inline-block"
                overflow="visible"
                //   style="vertical-align: text-bottom;"
              >
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
              </svg>
            </button>
            <button
              onClick={onClose}
              className="hover:bg-[#F3F4F6] p-1.5 rounded-md text-[#59636E] transition-colors"
            >
              <CrossBTN />
            </button>
          </div>
        </div>

        <div className="py-3 pl-4 pr-2">
          <div className="pt-1 pb-1 ml-1">
            <span className="font-semibold">Repository</span>
            <span className="ml-1 text-red-500">*</span>
          </div>

          <RepoSelector
            username="momanamjad"
            onSelect={(repo) => console.log("Selected:", repo)}
          />
        </div>
        <div className="mt-4 text-sm  border bg-[#EFF2F5] text-gray-800 pt-2 pb-2 pl-4 pr-2">
          Templates and forms
        </div>
        <div className="hover:bg-[#F3F4F6] rounded-lg  ml-2 mr-2 cursor-pointer">
          <div className=" mt-1 flex space-x-170   p-4  pb-2 cursor-pointer rounded-lg ">
            <h1 className="text-lg font-semibold">Blank Issue</h1>
            <span id="_r_5r_--trailing-visual">
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
                <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z"></path>
              </svg>
            </span>
          </div>
          <div className="mb-2 pb-1 pl-4 ">
            <p>Create a new issue from scratch</p>
          </div>
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
