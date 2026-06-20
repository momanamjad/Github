// ============================================
// FILE: src/components/layout/ProfileSidebar.jsx
// Your EXISTING sidebar + Status Button Integration
// ============================================

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useGitHub } from "@/contexts/GitHubContext";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Card, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import RealTimeComponent from "@features/RealTimeComponent";
import EditProfileForm from "@features/EditProfileForm";
import StatusButton from "../common/StatusButton";
import { RepoIcon, StarIcon, RepoForkedIcon, OrganizationIcon, LocationIcon, MailIcon, LinkIcon } from "@primer/octicons-react";
import { getUser } from "../../services/GithubApi";
import { apiClient } from "../../services/apiClient";

const ProfileSidebar = ({
  repositories = [],
  pinnedRepos = [],
  onRepoClick,
}) => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { user, updateUser } = useGitHub();

  const username = routeUsername || user?.login || "moman";
  const isOwner = user && user.login === username;

  const [userProfile, setUserProfile] = useState({
    id: "",
    name: "",
    username: username,
    pronouns: "he/him",
    avatar: "/profile.webp",
    bio: "",
    company: "",
    location: "",
    displayLocalTime: false,
    timezone: "(GMT-12:00) International Date Line West",
    email: "",
    website: "",
    socialLinks: ["", "", "", ""],
    followers: 0,
    following: 0,
    isFollowing: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const u = await getUser(username);
        setUserProfile({
          id: u._id || u.id,
          name: u.name || u.login,
          username: u.login,
          pronouns: u.pronouns || "he/him",
          avatar: u.avatar_url || "/profile.webp",
          bio: u.bio || "",
          company: u.company || "",
          location: u.location || "",
          displayLocalTime: false,
          timezone: "(GMT-12:00) International Date Line West",
          email: u.email || "",
          website: u.blog || "",
          socialLinks: ["", "", "", ""],
          followers: u.followers_count || 0,
          following: u.following_count || 0,
          isFollowing: u.isFollowing || false,
        });
      } catch (err) {
        console.error("Failed to load profile for sidebar:", err);
      }
    };
    fetchProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!user) {
      alert("Please log in to follow users.");
      return;
    }
    try {
      const res = await apiClient(`/users/${userProfile.id}/follow`, { method: "POST" });
      const followed = res?.data?.message === "Followed";
      setUserProfile((prev) => ({
        ...prev,
        isFollowing: followed,
        followers: followed ? prev.followers + 1 : prev.followers - 1,
      }));
    } catch (e) {
      alert("Failed to follow/unfollow: " + e.message);
    }
  };

  const handleSaveProfile = (updatedProfile) => {
    const newProfile = {
      ...userProfile,
      ...updatedProfile,
    };
    setUserProfile(newProfile);
    if (isOwner) {
      updateUser({
        ...user,
        name: newProfile.name,
        avatar_url: newProfile.avatar,
        bio: newProfile.bio,
        company: newProfile.company,
        location: newProfile.location,
        email: newProfile.email,
        blog: newProfile.website,
      });
    }
    console.log("Profile updated:", updatedProfile);
    setIsEditingProfile(false);
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
              className="rounded-full w-[72px] h-[72px] sm:w-[96px] sm:h-[96px] lg:w-[256px] lg:h-[256px] aspect-square border border-[#d0d7de] object-cover"
            />

            <div className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 lg:bottom-5 lg:right-5 z-10">
              <StatusButton username={username} profileStatus={userProfile.status} />
            </div>
          </div>

        {/* Mobile: name beside avatar */}
        {!isEditingProfile && (
          <div className="lg:hidden flex-1 min-w-0">
            <h1 className="text-[18px] sm:text-[20px] font-semibold leading-tight text-gray-900 dark:text-white">
              {userProfile.name}
            </h1>
            <p className="text-[14px] sm:text-[16px] font-light text-[#57606a] dark:text-[#8b949e] leading-tight">
              {userProfile.username}
              {userProfile.pronouns && ` · ${userProfile.pronouns}`}
            </p>
          </div>
        )}
      </div>

      {isEditingProfile ? (
        <div className="mt-4">
          <EditProfileForm
            userProfile={userProfile}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditingProfile(false)}
          />
        </div>
      ) : (
        <>
          {/* Desktop: name below avatar */}
          <h1 className="hidden lg:block text-[26px] font-semibold leading-tight mt-4 text-gray-900 dark:text-white">
            {userProfile.name}
          </h1>
          <p className="hidden lg:block text-[20px] font-light text-[#57606a] dark:text-[#8b949e] leading-tight">
            {userProfile.username}
            {userProfile.pronouns && ` · ${userProfile.pronouns}`}
          </p>

          {userProfile.bio && (
            <p className="mt-3 text-[16px] text-[#24292f] dark:text-[#c9d1d9] leading-snug">{userProfile.bio}</p>
          )}

          {isOwner ? (
            <div className="mt-4">
              <Button
                variant="editProfile"
                className="cursor-pointer w-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#24292f] dark:text-gray-300 border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d]"
                onClick={() => setIsEditingProfile(true)}
              >
                Edit profile
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <button
                className={`cursor-pointer w-full text-sm font-semibold rounded-md border py-1.5 transition-all
                  ${userProfile.isFollowing
                    ? "bg-[#f6f8fa] dark:bg-[#21262d] text-[#24292f] dark:text-gray-300 border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d]"
                    : "bg-[#2da44f] text-white border-[#2da44e] hover:bg-[#2c974b]"
                  }`}
                onClick={handleFollowToggle}
              >
                {userProfile.isFollowing ? "Unfollow" : "Follow"}
              </button>
            </div>
          )}
        </>
      )}

      <div className="flex gap-4 text-sm mt-4 text-[#57606a] dark:text-[#8b949e]">
        <Link to={`/${userProfile.username}?tab=followers`} className="cursor-pointer text-[#57606a] dark:text-[#8b949e] text-[14px] hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
          <strong className="text-gray-900 dark:text-white">{userProfile.followers}</strong> followers
        </Link>
        <Link to={`/${userProfile.username}?tab=following`} className="cursor-pointer text-[#57606a] dark:text-[#8b949e] text-[14px] hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
          <strong className="text-gray-900 dark:text-white">{userProfile.following}</strong> following
        </Link>
      </div>

      {displayRepos.length > 0 && (
        <div className="mt-6 pt-2 border-t border-[#d0d7de] dark:border-[#30363d]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#1f2328] dark:text-white uppercase tracking-wide">
              {pinnedRepos.length > 0
                ? "Pinned repositories"
                : "Repositories"}
            </h3>
            {pinnedRepos.length > 0 && repositories.length > 0 && (
              <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
                {repositories.length} total
              </span>
            )}
          </div>

          <div className="space-y-2">
            {displayRepos.map((repo) => (
              <button
                key={repo.id || repo.name}
                onClick={() => handleRepoClick(repo.name)}
                className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-[#161b22] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] rounded-md transition-colors duration-150 group border border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#57606a] dark:text-[#8b949e] group-hover:text-[#0969da] dark:group-hover:text-[#58a6ff]">
                    <RepoIcon size={16} />
                  </span>

                  <span className="flex-1 font-medium text-[#0969da] dark:text-[#58a6ff] group-hover:underline truncate">
                    {repo.name}
                  </span>

                  {repo.private !== undefined && (
                    <span className="text-xs text-[#57606a] dark:text-[#8b949e] border border-[#d0d7de] dark:border-[#30363d] rounded-full px-2 py-0.5">
                      {repo.private ? "Private" : "Public"}
                    </span>
                  )}
                </div>

                {repo.description && (
                  <p className="mt-1 text-xs text-[#57606a] dark:text-[#8b949e] line-clamp-2 pl-[22px]">
                    {repo.description}
                  </p>
                )}

                {(repo.language ||
                  repo.stargazersCount > 0 ||
                  repo.forksCount > 0) && (
                    <div className="mt-1 flex items-center gap-3 pl-[22px] text-xs text-[#57606a] dark:text-[#8b949e]">
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
                          <StarIcon size={14} className="text-yellow-500" />
                          {repo.stargazersCount}
                        </span>
                      )}
                      {repo.forksCount > 0 && (
                        <span className="flex items-center gap-1">
                          <RepoForkedIcon size={14} />
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
              className="w-full text-left mt-2 px-3 py-1.5 text-xs text-[#0969da] dark:text-[#58a6ff] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] border-0 bg-transparent cursor-pointer rounded-md transition-colors"
            >
              View all {repositories.length} repositories →
            </button>
          )}
        </div>
      )}

      {!isEditingProfile && (
        <div className="text-sm text-[#24292f] dark:text-[#c9d1d9] mt-4 space-y-2">
          {userProfile.company && (
            <div className="flex items-center gap-3">
              <OrganizationIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
              <span>{userProfile.company}</span>
            </div>
          )}

          {userProfile.location && (
            <div className="flex items-center gap-3">
              <LocationIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
              <span>{userProfile.location}</span>
            </div>
          )}

          <RealTimeComponent />

          {userProfile.email && (
            <div className="flex items-center gap-3">
              <MailIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
              <span>{userProfile.email}</span>
            </div>
          )}

          {userProfile.website && (
            <div className="flex items-center gap-3">
              <LinkIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
              <a
                href={userProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0969da] dark:text-[#58a6ff] hover:underline"
              >
                {userProfile.website}
              </a>
            </div>
          )}

          {userProfile.socialLinks.some((link) => link) && (
            <div className="space-y-2 pt-2 border-t border-[#d0d7de] dark:border-[#30363d]">
              {userProfile.socialLinks
                .filter((link) => link)
                .map((link, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <LinkIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0969da] dark:text-[#58a6ff] hover:underline truncate"
                    >
                      {link}
                    </a>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
      </aside>
    </>
  );
};

export default ProfileSidebar;
