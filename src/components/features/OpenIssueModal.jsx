import React from "react";
import RepoSelector from "./RepoSelector";
import CopyToClipboardIcon from "../../../public/customIcons/CopyToClipboardIcon";
import CloseIcon from "../../../public/customIcons/CloseIcon";
import ArrowRightIcon from "../../../public/customIcons/ArrowRightIcon";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useGitHub } from "../../contexts/GitHubContext";


const OpenIssueModal = ({ onClose, username }) => {
  const { user } = useGitHub();
  const activeUsername = username || user?.login || "moman";
  useScrollLock(true); // Since this component is only rendered when open

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-[#e9edf0]/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white border rounded-lg shadow-2xl pt-4 w-full sm:w-[850px] max-w-full sm:max-w-[90%] max-h-[90vh] min-h-[300px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4 pl-4 pr-2 flex-shrink-0">
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
              <CopyToClipboardIcon display="inline-block" overflow="visible" />
            </button>
            <button
              onClick={onClose}
              className="hover:bg-[#F3F4F6] p-1.5 rounded-md text-[#59636E] transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          <div className="py-3 pl-4 pr-2">
            <div className="pt-1 pb-1 ml-1">
              <span className="font-semibold">Repository</span>
              <span className="ml-1 text-red-500">*</span>
            </div>

            <RepoSelector
              username={activeUsername}
            />
          </div>
          <div className="mt-4 text-sm border bg-[#EFF2F5] text-gray-800 pt-2 pb-2 pl-4 pr-2">
            Templates and forms
          </div>
          <div className="hover:bg-[#F3F4F6] rounded-lg ml-2 mr-2 cursor-pointer transition-colors">
            <div className="mt-1 flex gap-4 justify-between items-center p-4 pb-2">
              <h1 className="text-lg font-semibold">Blank Issue</h1>
              <span id="_r_5r_--trailing-visual" className="flex-shrink-0">
                <ArrowRightIcon display="inline-block" overflow="visible" />
              </span>
            </div>
            <div className="mb-2 pb-1 pl-4">
              <p>Create a new issue from scratch</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenIssueModal;
