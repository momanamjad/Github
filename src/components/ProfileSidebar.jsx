import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RealTimeComponent from "./RealTimeComponent";
import EditProfileModal from "./EditProfileModal";

const ProfileSidebar = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleSaveProfile = (updatedProfile) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updatedProfile,
    }));
    console.log("Profile updated:", updatedProfile);
  };

  return (
    <>
      <aside className="w-full lg:w-1/4 px-4 mt-6 lg:sticky lg:top-6">
        <img
          src={userProfile.avatar}
          alt={userProfile.name}
          className="rounded-full w-[296px] border-3 border-[#E7E6E8]    "
        />

        <h1 className="text-[26px]  font-semibold leading-tight mt-4">
          {userProfile.name}
        </h1>
        <p className="text-[20px] font-light text-[#59636E] leading-tight">
          {userProfile.username}
          {userProfile.pronouns && ` · ${userProfile.pronouns}`}
        </p>

        {userProfile.bio && (
          <p className="mt-3 text-sm text-github-muted">{userProfile.bio}</p>
        )}

        <div className="mt-4 ">
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

        <div className="text-sm text-github-muted mt-4 space-y-2">
          {userProfile.company && (
            <div className="flex items-center gap-3">
              <span className="text-lg">
                <svg
                  className="fill-[#59636E]"
                  // class="octicon octicon-organization"
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
                {" "}
                <svg
                  // class="octicon octicon-location"
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

          {/* {userProfile.displayLocalTime && <RealTimeComponent />} */}
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
<path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"></path>                </svg>
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
