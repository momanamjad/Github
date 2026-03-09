// ============================================
// FILE: src/components/layout/ProfileSidebar.jsx
// Your EXISTING sidebar + Status Button Integration
// ============================================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Card, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import RealTimeComponent from "@features/RealTimeComponent";
import EditProfileModal from "@features/EditProfileModal";
import StatusButton from "../common/StatusButton";
import ReposotoryIcon from "../ui/icons/ReposotoryIcon";
import StarsIcon from "../ui/icons/StarsIcon";
import ForkIcon from "../ui/icons/ForkIcon";
import CompanyIcon from "../ui/icons/CompanyIcon";
import LocationIcon from "../ui/icons/LocationIcon";
import EmailIcon from "../ui/icons/EmailIcon";
const ProfileSidebar = ({
  username = "momanamjad",
  repositories = [],
  pinnedRepos = [],
  onRepoClick,
}) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Status-related state
  // const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  // const [selectedEmoji, setSelectedEmoji] = useState("");
  // const [statusText, setStatusText] = useState("");
  // const [isBusy, setIsBusy] = useState(false);
  // const [expiration, setExpiration] = useState("never");
  // const [expirationTime, setExpirationTime] = useState(null);
  // const [isStatusHovered, setIsStatusHovered] = useState(false);
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // const emojiPickerRef = useRef(null);

  const [userProfile, setUserProfile] = useState({
    name: "Moman Amjad",
    username: "momanamjad",
    pronouns: "he/him",
    avatar: "/profile.webp",
    bio: "",
    company: "Filinix Solutions",
    location: "koh e noor Faisalabad",
    displayLocalTime: false,
    timezone: "(GMT-12:00) International Date Line West",
    email: "momanamjad07@gmail.com",
    website: "",
    socialLinks: ["", "", "", ""],
    followers: 0,
    following: 3,
  });




  const handleSaveProfile = (updatedProfile) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updatedProfile,
    }));
    console.log("Profile updated:", updatedProfile);
  };

  const handleRepoClick = (repoName) => {
    if (onRepoClick) {
      onRepoClick(repoName);
    } else {
      navigate(`/${userProfile.username || username}/${repoName}`);
    }
  };


  const displayRepos =
    pinnedRepos.length > 0 ? pinnedRepos : repositories.slice(0, 5);

  return (
    <>
      <aside className="w-full lg:w-1/4 px-3 sm:px-4 mt-4 lg:mt-6 lg:sticky lg:top-6">
        {/* Mobile: horizontal layout, Desktop: vertical */}
        <div className="flex items-center gap-4 lg:block">
          <div className="relative inline-block shrink-0">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="rounded-full w-[72px] sm:w-[96px] lg:w-[256px] border border-[#d0d7de] object-cover"
            />

            <div className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 lg:bottom-5 lg:right-5 z-10">
              <StatusButton />
            </div>
          </div>

          {/* Mobile: name beside avatar */}
          <div className="lg:hidden flex-1 min-w-0">
            <h1 className="text-[18px] sm:text-[20px] font-semibold leading-tight">
              {userProfile.name}
            </h1>
            <p className="text-[14px] sm:text-[16px] font-light text-[#59636E] leading-tight">
              {userProfile.username}
              {userProfile.pronouns && ` · ${userProfile.pronouns}`}
            </p>
          </div>
        </div>


        {/* Desktop: name below avatar */}
        <h1 className="hidden lg:block text-[26px] font-semibold leading-tight mt-4">
          {userProfile.name}
        </h1>
        <p className="hidden lg:block text-[20px] font-light text-[#59636E] leading-tight">
          {userProfile.username}
          {userProfile.pronouns && ` · ${userProfile.pronouns}`}
        </p>

        {userProfile.bio && (
          <p className="mt-3 text-sm text-github-muted">{userProfile.bio}</p>
        )}

        <div className="mt-4">
          <Button
            variant="editProfile"
            className="cursor-pointer w-full"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit profile
          </Button>
        </div>

        <div className="flex gap-4 text-sm mt-4">
          <span className="cursor-pointer text-[#596368] text-[14px] hover:text-blue-500">
            <strong>{userProfile.followers}</strong> followers
          </span>
          <span className="cursor-pointer text-[#596368] text-[14px] hover:text-blue-500">
            <strong>{userProfile.following}</strong> following
          </span>
        </div>

        {displayRepos.length > 0 && (
          <div className="mt-6 pt-2 border-t border-[#E7E6E8]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#1F2328] uppercase tracking-wide">
                {pinnedRepos.length > 0
                  ? "Pinned repositories"
                  : "Repositories"}
              </h3>
              {pinnedRepos.length > 0 && repositories.length > 0 && (
                <span className="text-xs text-[#59636E]">
                  {repositories.length} total
                </span>
              )}
            </div>

            <div className="space-y-2">
              {displayRepos.map((repo) => (
                <button
                  key={repo.id || repo.name}
                  onClick={() => handleRepoClick(repo.name)}
                  className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-[#f6f8fa] rounded-md transition-colors duration-150 group border border-transparent hover:border-[#d0d7de]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#59636E] group-hover:text-[#0969da]">
                      <ReposotoryIcon className="fill-current w-4 h-4" viewBox="0 0 16 16" />
                    </span>

                    <span className="flex-1 font-medium text-[#0969da] group-hover:underline truncate">
                      {repo.name}
                    </span>

                    {repo.private !== undefined && (
                      <span className="text-xs text-[#59636E] border border-[#d0d7de] rounded-full px-2 py-0.5">
                        {repo.private ? "Private" : "Public"}
                      </span>
                    )}
                  </div>

                  {repo.description && (
                    <p className="mt-1 text-xs text-[#59636E] line-clamp-2 pl-[22px]">
                      {repo.description}
                    </p>
                  )}

                  {(repo.language ||
                    repo.stargazersCount > 0 ||
                    repo.forksCount > 0) && (
                      <div className="mt-1 flex items-center gap-3 pl-[22px] text-xs text-[#59636E]">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${repo.language === "JavaScript"
                                ? "bg-yellow-400"
                                : repo.language === "TypeScript"
                                  ? "bg-blue-500"
                                  : repo.language === "CSS"
                                    ? "bg-purple-500"
                                    : repo.language === "HTML"
                                      ? "bg-orange-500"
                                      : repo.language === "Python"
                                        ? "bg-green-500"
                                        : "bg-gray-500"
                                }`}
                            />
                            {repo.language}
                          </span>
                        )}
                        {repo.stargazersCount > 0 && (
                          <span className="flex items-center gap-1">
                            <StarsIcon className="fill-current w-[14px] h-[14px]" viewBox="0 0 16 16" />
                            {repo.stargazersCount}
                          </span>
                        )}
                        {repo.forksCount > 0 && (
                          <span className="flex items-center gap-1">
                            <ForkIcon />
                            {repo.forksCount}
                          </span>
                        )}
                      </div>
                    )}
                </button>
              ))}
            </div>

            {repositories.length > 5 && (
              <button
                onClick={() =>
                  navigate(
                    `/${userProfile.username || username}?tab=repositories`,
                  )
                }
                className="w-full text-left mt-2 px-3 py-1.5 text-xs text-[#0969da] hover:bg-[#f6f8fa] rounded-md transition-colors"
              >
                View all {repositories.length} repositories →
              </button>
            )}
          </div>
        )}

        <div className="text-sm text-github-muted mt-4 space-y-2">
          {userProfile.company && (
            <div className="flex items-center gap-3">
              <span className="text-lg">
                <CompanyIcon />
              </span>
              <span>{userProfile.company}</span>
            </div>
          )}

          {userProfile.location && (
            <div className="flex items-center gap-3">
              <span className="text-lg">
                <LocationIcon />
              </span>
              <span>{userProfile.location}</span>
            </div>
          )}

          <RealTimeComponent />

          {userProfile.email && (
            <div className="flex items-center gap-3">
              <span className="text-lg">
                <EmailIcon />
              </span>
              <span>{userProfile.email}</span>
            </div>
          )}

          {userProfile.website && (
            <div className="flex items-center gap-3">
              <span className="text-lg">🔗</span>
              <a
                href={userProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {userProfile.website}
              </a>
            </div>
          )}

          {userProfile.socialLinks.some((link) => link) && (
            <div className="space-y-2 pt-2 border-t">
              {userProfile.socialLinks
                .filter((link) => link)
                .map((link, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-lg">🔗</span>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {link}
                    </a>
                  </div>
                ))}
            </div>
          )}
        </div>
      </aside>


      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userProfile={userProfile}
        onSave={handleSaveProfile}
      />
    </>
  );
};

export default ProfileSidebar;
