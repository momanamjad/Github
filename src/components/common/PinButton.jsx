import React, { useState, useEffect } from "react";
import { Pin } from "lucide-react";
import { useGitHub } from "@/contexts/GitHubContext";
import { togglePinRepo, getPinnedRepos } from "@services/GithubApi";

const PinButton = ({ repo, className = "" }) => {
  const { user } = useGitHub();
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.login && repo) {
      getPinnedRepos(user.login)
        .then((pinnedList) => {
          const pinned = pinnedList.some(r => r._id === repo._id || r.id === repo.id || r.name === repo.name);
          setIsPinned(pinned);
        })
        .catch(console.error);
    }
  }, [repo, user?.login]);

  const handlePinClick = async (e) => {
    e.preventDefault();
    if (loading || !repo) return;
    setLoading(true);
    try {
      const repoId = repo._id || repo.id;
      const res = await togglePinRepo(repoId);
      const isNowPinned = res?.message === "Pinned";
      setIsPinned(isNowPinned);
      
      // Dispatch event to update overview/pinned repo listing
      window.dispatchEvent(new CustomEvent("github_pinned_updated"));
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert(error.message || "Failed to toggle pin");
    } finally {
      setLoading(false);
    }
  };

  // Only allow pinning public repos per backend restrictions
  const isPrivate = repo?.private || repo?.visibility === "private";
  if (isPrivate) return null;

  return (
    <button
      onClick={handlePinClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-[3px] text-[#24292f] border border-[#d0d7de] rounded-md transition-colors cursor-pointer font-medium ${
        isPinned ? "bg-[#f3f4f6] hover:bg-[#e5e7eb]" : "bg-[#f6f8fa] hover:bg-[#ebedf0]"
      } ${className}`}
    >
      <Pin
        size={14}
        className={`transform rotate-[45deg] ${isPinned ? "text-blue-500 fill-blue-500" : "text-[#57606a]"}`}
      />
      <span>{isPinned ? "Pinned" : "Pin"}</span>
    </button>
  );
};

export default PinButton;
