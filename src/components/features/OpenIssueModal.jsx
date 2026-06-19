import React, { useState } from "react";
import RepoSelector from "./RepoSelector";
import CopyToClipboardIcon from "../../../public/customIcons/CopyToClipboardIcon";
import CloseIcon from "../../../public/customIcons/CloseIcon";
import ArrowRightIcon from "../../../public/customIcons/ArrowRightIcon";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useGitHub } from "../../contexts/GitHubContext";
import { apiClient } from "@/services/apiClient";

const OpenIssueModal = ({ onClose, username, onSubmit }) => {
  const { user } = useGitHub();
  const activeUsername = username || user?.login || "moman";
  useScrollLock(true);

  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueBody, setIssueBody] = useState("");

  const handleSelectRepo = (repo) => {
    setSelectedRepo(repo);
  };

  const handleBlankIssueClick = () => {
    if (!selectedRepo) {
      alert("Please select a repository first.");
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueTitle.trim() || !selectedRepo) return;

    try {
      const repoId = selectedRepo._id || selectedRepo.id;
      const res = await apiClient(`/repos/${repoId}/issues`, {
        method: 'POST',
        body: JSON.stringify({
          title: issueTitle,
          description: issueBody,
          labels: []
        })
      });

      const nextId = res.data?._id || res.data?.id;
      const newlyCreated = {
        id: nextId,
        title: issueTitle,
        repo: selectedRepo.name || selectedRepo.full_name,
        repoId: repoId,
        number: res.data?.number || Math.floor(Math.random() * 800) + 100,
        status: res.data?.state || "open",
        author: activeUsername,
        updated: "Just now",
        labels: res.data?.labels || [],
        assignee: null,
      };

      // Sync local storage as well for fallback consistency
      let savedIssues = [];
      const saved = localStorage.getItem("github_clone_issues");
      if (saved) {
        try {
          savedIssues = JSON.parse(saved);
        } catch (err) {
          console.error(err);
        }
      }
      const updatedList = [newlyCreated, ...savedIssues];
      localStorage.setItem("github_clone_issues", JSON.stringify(updatedList));

      window.dispatchEvent(new CustomEvent("github_clone_issues_updated", { detail: newlyCreated }));

      if (onSubmit) {
        onSubmit(newlyCreated);
      }
      onClose();
    } catch (err) {
      console.error("Failed to create issue on backend:", err);
      alert("Failed to create issue: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-[#e9edf0]/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-2xl pt-4 w-full sm:w-[850px] max-w-full sm:max-w-[90%] max-h-[90vh] min-h-[300px] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#d0d7de] dark:border-[#30363d] pb-3 mb-4 pl-4 pr-2 flex-shrink-0">
          <h3 className="font-semibold text-[16px] text-[#1f2328] dark:text-white">
            {showForm ? "Create a new issue" : "Create New Issue"}
          </h3>
          <div className="flex gap-3">
            <button
              data-component="IconButton"
              type="button"
              className="prc-Button-ButtonBase-9n-Xk CreateIssueDialogHeader-module__CopyToClipboardButton__kzd6gM7 prc-Button-IconButton-fyge7 bg-transparent border-0 text-gray-400 hover:text-gray-600 cursor-pointer"
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
              className="hover:bg-[#F3F4F6] dark:hover:bg-[#30363d] p-1.5 rounded-md text-[#59636E] dark:text-[#8b949e] transition-colors border-0 bg-transparent cursor-pointer"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {showForm ? (
          /* Issue Submission Form */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-semibold text-[#1f2328] dark:text-white mb-1.5">
                Title
              </label>
              <input
                type="text"
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Title"
                className="w-full border border-[#d0d7de] dark:border-[#30363d] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-white"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-semibold text-[#1f2328] dark:text-white mb-1.5">
                Description
              </label>
              <textarea
                rows="6"
                value={issueBody}
                onChange={(e) => setIssueBody(e.target.value)}
                placeholder="Leave a comment"
                className="w-full flex-1 border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-white min-h-[150px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#d0d7de] dark:border-[#30363d]">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#d0d7de] dark:border-[#30363d] text-xs font-semibold rounded-md transition-colors cursor-pointer bg-white dark:bg-[#21262d] text-[#1f2328] dark:text-[#c9d1d9] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
              >
                Submit new issue
              </button>
            </div>
          </form>
        ) : (
          /* Repository and Template Selector */
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="py-3 pl-4 pr-2">
              <div className="pt-1 pb-1 ml-1">
                <span className="font-semibold text-[#1f2328] dark:text-white">Repository</span>
                <span className="ml-1 text-red-500">*</span>
              </div>

              <RepoSelector
                username={activeUsername}
                onSelect={handleSelectRepo}
              />
            </div>
            <div className="mt-4 text-sm border-y border-[#d0d7de] dark:border-[#30363d] bg-[#EFF2F5] dark:bg-[#161b22] text-gray-800 dark:text-white pt-2 pb-2 pl-4 pr-2">
              Templates and forms
            </div>
            <div 
              onClick={handleBlankIssueClick}
              className="hover:bg-[#F3F4F6] dark:hover:bg-[#21262d] rounded-lg ml-2 mr-2 cursor-pointer transition-colors"
            >
              <div className="mt-1 flex gap-4 justify-between items-center p-4 pb-2">
                <h1 className="text-lg font-semibold text-[#1f2328] dark:text-white">Blank Issue</h1>
                <span id="_r_5r_--trailing-visual" className="flex-shrink-0 text-gray-400">
                  <ArrowRightIcon display="inline-block" overflow="visible" />
                </span>
              </div>
              <div className="mb-2 pb-1 pl-4 text-sm text-gray-500 dark:text-[#8b949e]">
                <p>Create a new issue from scratch</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenIssueModal;
