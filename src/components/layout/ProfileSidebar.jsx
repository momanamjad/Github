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

const ProfileSidebar = ({
  username = "momanamjad",
  repositories = [],
  pinnedRepos = [],
  onRepoClick,
}) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Status-related state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [expiration, setExpiration] = useState("never");
  const [expirationTime, setExpirationTime] = useState(null);
  const [isStatusHovered, setIsStatusHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const [userProfile, setUserProfile] = useState({
    name: "Moman Amjad",
    username: "momanamjad",
    pronouns: "he/him",
    avatar: "/profile.png",
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

  // Emoji list for the picker
  const emojis = [
    { emoji: "😊", name: "smile" },
    { emoji: "😄", name: "grin" },
    { emoji: "😆", name: "laughing" },
    { emoji: "😅", name: "sweat_smile" },
    { emoji: "🤣", name: "rofl" },
    { emoji: "😂", name: "joy" },
    { emoji: "🙂", name: "slightly_smiling_face" },
    { emoji: "🙃", name: "upside_down_face" },
    { emoji: "🫠", name: "melting_face" },
    { emoji: "😉", name: "wink" },
    { emoji: "😌", name: "relieved" },
    { emoji: "😍", name: "heart_eyes" },
    { emoji: "🥰", name: "smiling_face_with_hearts" },
    { emoji: "😘", name: "kissing_heart" },
    { emoji: "😗", name: "kissing" },
    { emoji: "😙", name: "kissing_smiling_eyes" },
    { emoji: "😚", name: "kissing_closed_eyes" },
    { emoji: "😋", name: "yum" },
    { emoji: "😛", name: "stuck_out_tongue" },
    { emoji: "😝", name: "stuck_out_tongue_closed_eyes" },
    { emoji: "😜", name: "stuck_out_tongue_winking_eye" },
    { emoji: "🤪", name: "zany_face" },
    { emoji: "🤨", name: "raised_eyebrow" },
    { emoji: "🧐", name: "monocle_face" },
    { emoji: "🤓", name: "nerd_face" },
    { emoji: "😎", name: "sunglasses" },
    { emoji: "🥳", name: "partying_face" },
    { emoji: "😏", name: "smirk" },
    { emoji: "😒", name: "unamused" },
    { emoji: "😞", name: "disappointed" },
    { emoji: "😔", name: "pensive" },
    { emoji: "😟", name: "worried" },
    { emoji: "😕", name: "confused" },
    { emoji: "🙁", name: "slightly_frowning_face" },
    { emoji: "☹️", name: "frowning_face" },
    { emoji: "😣", name: "persevere" },
    { emoji: "😖", name: "confounded" },
    { emoji: "😫", name: "tired_face" },
    { emoji: "😩", name: "weary" },
    { emoji: "🥺", name: "pleading_face" },
    { emoji: "😢", name: "cry" },
    { emoji: "😭", name: "sob" },
    { emoji: "😤", name: "triumph" },
    { emoji: "😠", name: "angry" },
    { emoji: "😡", name: "rage" },
    { emoji: "🤬", name: "face_with_symbols_on_mouth" },
    { emoji: "🤯", name: "exploding_head" },
    { emoji: "😳", name: "flushed" },
    { emoji: "🥵", name: "hot_face" },
    { emoji: "🥶", name: "cold_face" },
    { emoji: "😱", name: "scream" },
    { emoji: "😨", name: "fearful" },
    { emoji: "😰", name: "cold_sweat" },
    { emoji: "😥", name: "disappointed_relieved" },
    { emoji: "😓", name: "sweat" },
    { emoji: "🤗", name: "hugs" },
    { emoji: "🤔", name: "thinking" },
    { emoji: "🤭", name: "hand_over_mouth" },
    { emoji: "🤫", name: "shushing_face" },
    { emoji: "🤥", name: "lying_face" },
    { emoji: "😶", name: "no_mouth" },
    { emoji: "😐", name: "neutral_face" },
    { emoji: "😑", name: "expressionless" },
    { emoji: "😬", name: "grimacing" },
    { emoji: "🙄", name: "rolling_eyes" },
    { emoji: "😯", name: "hushed" },
    { emoji: "😦", name: "frowning" },
    { emoji: "😧", name: "anguished" },
    { emoji: "😮", name: "open_mouth" },
    { emoji: "😲", name: "astonished" },
    { emoji: "🥱", name: "yawning_face" },
    { emoji: "😴", name: "sleeping" },
    { emoji: "🤤", name: "drooling_face" },
    { emoji: "😪", name: "sleepy" },
    { emoji: "😵", name: "dizzy_face" },
    { emoji: "🤐", name: "zipper_mouth_face" },
    { emoji: "🥴", name: "woozy_face" },
    { emoji: "🤢", name: "nauseated_face" },
    { emoji: "🤮", name: "vomiting_face" },
    { emoji: "🤧", name: "sneezing_face" },
    { emoji: "😷", name: "mask" },
    { emoji: "🤒", name: "face_with_thermometer" },
    { emoji: "🤕", name: "face_with_head_bandage" },
    { emoji: "🏝️", name: "vacation" },
    { emoji: "🏠", name: "home" },
    { emoji: "💻", name: "laptop" },
    { emoji: "☕", name: "coffee" },
    { emoji: "🎮", name: "gaming" },
    { emoji: "📚", name: "books" },
    { emoji: "🎵", name: "music" },
  ];

  // Preset status options
  const presetStatuses = [
    { emoji: "🏝️", text: "On vacation", label: "🏝️ On vacation" },
    { emoji: "🤒", text: "Out sick", label: "🤒 Out sick" },
    { emoji: "🏠", text: "Working from home", label: "🏠 Working from home" },
    { emoji: "💻", text: "Focusing", label: "💻 Focusing" },
  ];

  // Check expiration
  useEffect(() => {
    if (!expirationTime) return;

    const checkExpiration = setInterval(() => {
      if (Date.now() >= expirationTime) {
        clearStatus();
      }
    }, 1000);

    return () => clearInterval(checkExpiration);
  }, [expirationTime]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

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

  // Status functions
  const openStatusModal = () => {
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  const clearEmoji = () => {
    setSelectedEmoji("");
  };

  const handlePresetClick = (preset) => {
    setSelectedEmoji(preset.emoji);
    setStatusText(preset.text);
  };

  const clearStatus = () => {
    setSelectedEmoji("");
    setStatusText("");
    setIsBusy(false);
    setExpiration("never");
    setExpirationTime(null);
    setIsStatusModalOpen(false);
  };

  const setStatus = () => {
    if (expiration !== "never") {
      const now = Date.now();
      let expiryTime;

      switch (expiration) {
        case "30min":
          expiryTime = now + 30 * 60 * 1000;
          break;
        case "1hour":
          expiryTime = now + 60 * 60 * 1000;
          break;
        case "4hours":
          expiryTime = now + 4 * 60 * 60 * 1000;
          break;
        case "today":
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);
          expiryTime = endOfDay.getTime();
          break;
        case "week":
          expiryTime = now + 7 * 24 * 60 * 60 * 1000;
          break;
        case "month":
          expiryTime = now + 30 * 24 * 60 * 60 * 1000;
          break;
        default:
          expiryTime = null;
      }

      setExpirationTime(expiryTime);
    }

    setIsStatusModalOpen(false);
    setShowEmojiPicker(false);
  };

  const displayRepos =
    pinnedRepos.length > 0 ? pinnedRepos : repositories.slice(0, 5);
  const hasStatus = selectedEmoji || statusText;

  return (
    <>
      <aside className="w-full lg:w-1/4 px-4 mt-6 lg:sticky lg:top-6">
        {/* Profile Image with Status Button */}
        <div className="relative inline-block">
          <img
            src={userProfile.avatar}
            alt={userProfile.name}
            className="rounded-full w-[256px] border-3 border-[#E7E6E8]"
          />

          {/* Status Button positioned at bottom right of avatar */}
          <div className="absolute bottom-2 right-2">
            <button
              onClick={openStatusModal}
              onMouseEnter={() => setIsStatusHovered(true)}
              onMouseLeave={() => setIsStatusHovered(false)}
              className={`relative flex items-center justify-center transition-all duration-200 rounded-full bg-white ${
                isBusy ? "ring-2 ring-orange-600 ring-offset-2" : ""
              } ${
                isStatusHovered
                  ? "bg-[#f6f8fa] px-3 py-1 gap-2"
                  : hasStatus
                    ? "w-8 h-8"
                    : "w-8 h-8 border border-[#d0d7de]"
              }`}
            >
              <span className="text-base">
                {hasStatus ? selectedEmoji : "🙂"}
              </span>
              {isStatusHovered && (
                <span className="text-sm text-[#59636E] whitespace-nowrap">
                  {hasStatus ? statusText || "Edit status" : "Set status"}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Status Display Below Avatar - Shows when status is set */}
        {hasStatus && !isStatusHovered && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-base">{selectedEmoji}</span>
            {statusText && <span className="text-[#59636E]">{statusText}</span>}
          </div>
        )}

        <h1 className="text-[26px] font-semibold leading-tight mt-4">
          {userProfile.name}
        </h1>
        <p className="text-[20px] font-light text-[#59636E] leading-tight">
          {userProfile.username}
          {userProfile.pronouns && ` · ${userProfile.pronouns}`}
        </p>

        {userProfile.bio && (
          <p className="mt-3 text-sm text-github-muted">{userProfile.bio}</p>
        )}

        {/* Edit Profile Button */}
        <div className="mt-4">
          <Button
            variant="editProfile"
            className="cursor-pointer w-full"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit profile
          </Button>
        </div>

        {/* Followers/Following Section */}
        <div className="flex gap-4 text-sm mt-4">
          <span className="cursor-pointer text-[#596368] text-[14px] hover:text-blue-500">
            <strong>{userProfile.followers}</strong> followers
          </span>
          <span className="cursor-pointer text-[#596368] text-[14px] hover:text-blue-500">
            <strong>{userProfile.following}</strong> following
          </span>
        </div>

        {/* Repositories Section */}
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
                      <svg
                        className="fill-current"
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                      >
                        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                      </svg>
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
                            className={`w-2 h-2 rounded-full ${
                              repo.language === "JavaScript"
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
                          <svg
                            className="fill-current"
                            viewBox="0 0 16 16"
                            width="14"
                            height="14"
                          >
                            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.192L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
                          </svg>
                          {repo.stargazersCount}
                        </span>
                      )}
                      {repo.forksCount > 0 && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="fill-current"
                            viewBox="0 0 16 16"
                            width="14"
                            height="14"
                          >
                            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
                          </svg>
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

        {/* Info Section */}
        <div className="text-sm text-github-muted mt-4 space-y-2">
          {userProfile.company && (
            <div className="flex items-center gap-3">
              <span className="text-lg">
                <svg
                  className="fill-[#59636E]"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"></path>
                </svg>
              </span>
              <span>{userProfile.company}</span>
            </div>
          )}

          {userProfile.location && (
            <div className="flex items-center gap-3">
              <span className="text-lg">
                <svg
                  className="fill-[#59636E]"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z"></path>
                </svg>
              </span>
              <span>{userProfile.location}</span>
            </div>
          )}

          <RealTimeComponent />

          {userProfile.email && (
            <div className="flex items-center gap-3">
              <span className="text-lg">
                <svg
                  className="fill-[#59636E]"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"></path>
                </svg>
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

      {/* Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl lg:max-w-lg">
            {/* Close button for mobile */}
            <button
              onClick={closeStatusModal}
              className="absolute top-4 right-4 text-[#59636E] hover:text-[#1F2328] lg:hidden"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#1F2328] mb-4">
                Edit status
              </h2>

              {/* What's happening section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1F2328] mb-2">
                  What's happening
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors"
                    >
                      {selectedEmoji ? (
                        <span className="text-xl">{selectedEmoji}</span>
                      ) : (
                        <span className="text-xl">🙂</span>
                      )}
                    </button>
                    <input
                      type="text"
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      maxLength={80}
                      placeholder=""
                      className="flex-1 px-3 py-2 border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-[#59636E] mt-1">
                    {80 - statusText.length} characters remaining
                  </p>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute top-12 left-0 z-10 w-80 bg-white border border-[#d0d7de] rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto"
                    >
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="Filter Emojis"
                          className="w-full px-3 py-2 border border-[#d0d7de] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {emojis.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiSelect(item.emoji)}
                            className="text-2xl hover:bg-[#f6f8fa] rounded p-1 transition-colors"
                            title={item.name}
                          >
                            {item.emoji}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={clearEmoji}
                        className="w-full mt-3 py-2 text-sm text-[#59636E] border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors"
                      >
                        Clear emoji
                      </button>
                    </div>
                  )}
                </div>

                {/* Preset Status Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {presetStatuses.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetClick(preset)}
                      className="px-3 py-1.5 text-sm border border-[#d0d7de] rounded-full hover:bg-[#f6f8fa] transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Busy Checkbox */}
              <div className="mb-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBusy}
                    onChange={(e) => setIsBusy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 border-[#d0d7de] rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-[#1F2328]">
                      Busy
                    </span>
                    <p className="text-xs text-[#59636E] mt-0.5">
                      When others mention you, assign you, or request your
                      review, GitHub will let them know that you have limited
                      availability.
                    </p>
                  </div>
                </label>
              </div>

              {/* Expiration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1F2328] mb-2">
                  Expiration
                </label>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="never">Never</option>
                  <option value="30min">In 30 minutes</option>
                  <option value="1hour">In 1 hour</option>
                  <option value="4hours">In 4 hours</option>
                  <option value="today">After today</option>
                  <option value="week">After this week</option>
                  <option value="month">After a month</option>
                </select>
                <p className="text-xs text-[#59636E] mt-1">
                  Your status will be cleared after the selected time.
                </p>
              </div>

              {/* Visible to */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1F2328] mb-2">
                  Visible to
                </label>
                <select
                  defaultValue="everyone"
                  className="w-full px-3 py-2 border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="everyone">Everyone</option>
                </select>
                <p className="text-xs text-[#59636E] mt-1">
                  Limit status visibility to a single organization.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={clearStatus}
                  className="px-4 py-2 text-sm font-medium text-[#1F2328] border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors"
                >
                  Clear status
                </button>
                <button
                  onClick={setStatus}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2da44e] rounded-md hover:bg-[#2c974b] transition-colors"
                >
                  Set status
                </button>
              </div>
            </div>

            {/* Close button for desktop */}
            <button
              onClick={closeStatusModal}
              className="hidden lg:block absolute top-4 right-4 text-[#59636E] hover:text-[#1F2328]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* YOUR EXISTING EDIT PROFILE MODAL */}
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
