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
  const [selectedLabels, setSelectedLabels] = useState([]);

  const labelsOptions = [
    { name: "bug", color: "bg-[#f85149] text-white", label: "Bug 🔴" },
    { name: "enhancement", color: "bg-[#58a6ff] text-black", label: "Enhancement 🔵" },
    { name: "documentation", color: "bg-[#57ab5a] text-white", label: "Documentation 🟢" },
    { name: "duplicate", color: "bg-[#d3c6ff] text-black", label: "Duplicate 🟡" }
  ];

  const handleSelectRepo = (repo) => {
    setSelectedRepo(repo);
  };

  const handleTemplateClick = (templateType) => {
    if (!selectedRepo) {
      alert("Please select a repository first.");
      return;
    }
    
    if (templateType === "bug") {
      setIssueTitle("[BUG] ");
      setIssueBody("### Expected Behavior\n\n### Actual Behavior\n\n### Steps to Reproduce\n1.\n2.\n3.");
      setSelectedLabels(["bug"]);
    } else if (templateType === "feature") {
      setIssueTitle("[FEATURE] ");
      setIssueBody("### Pitch / Use Case\n\n### Proposed Solution\n\n### Additional Context");
      setSelectedLabels(["enhancement"]);
    } else {
      setIssueTitle("");
      setIssueBody("");
      setSelectedLabels([]);
    }
    
    setShowForm(true);
  };

  const handleLabelToggle = (labelName) => {
    if (selectedLabels.includes(labelName)) {
      setSelectedLabels(prev => prev.filter(l => l !== labelName));
    } else {
      setSelectedLabels(prev => [...prev, labelName]);
    }
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
          labels: selectedLabels
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
        labels: res.data?.labels || selectedLabels,
        assignee: null,
        description: issueBody
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

            {/* Labels Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#1f2328] dark:text-white mb-1.5">
                Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {labelsOptions.map(opt => {
                  const active = selectedLabels.includes(opt.name);
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => handleLabelToggle(opt.name)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer transition-all ${
                        active 
                          ? `${opt.color} border-transparent scale-105 shadow-sm` 
                          : "bg-gray-100 dark:bg-[#21262d] text-[#57606a] dark:text-[#8b949e] border-[#d0d7de] dark:border-[#30363d]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
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
                Back
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
              Issue Templates
            </div>

            <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d] px-2">
              {/* Bug Report Template */}
              <div 
                onClick={() => handleTemplateClick("bug")}
                className="hover:bg-[#F3F4F6] dark:hover:bg-[#21262d] rounded-lg cursor-pointer transition-colors p-4 flex justify-between items-center"
              >
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-[#f85149] dark:text-[#f85149]">Bug Report 🔴</h4>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-1">Report a software bug, error, or system defect.</p>
                </div>
                <ArrowRightIcon display="inline-block" overflow="visible" className="text-gray-400" />
              </div>

              {/* Feature Request Template */}
              <div 
                onClick={() => handleTemplateClick("feature")}
                className="hover:bg-[#F3F4F6] dark:hover:bg-[#21262d] rounded-lg cursor-pointer transition-colors p-4 flex justify-between items-center"
              >
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-[#58a6ff] dark:text-[#58a6ff]">Feature Request 🔵</h4>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-1">Propose a new feature, improvement, or idea.</p>
                </div>
                <ArrowRightIcon display="inline-block" overflow="visible" className="text-gray-400" />
              </div>

              {/* Blank Issue */}
              <div 
                onClick={() => handleTemplateClick("blank")}
                className="hover:bg-[#F3F4F6] dark:hover:bg-[#21262d] rounded-lg cursor-pointer transition-colors p-4 flex justify-between items-center"
              >
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-[#1f2328] dark:text-white">Blank Issue</h4>
                  <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-1">Create a new issue from scratch.</p>
                </div>
                <ArrowRightIcon display="inline-block" overflow="visible" className="text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenIssueModal;
