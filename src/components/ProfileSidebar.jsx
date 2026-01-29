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
    // Here you would typically make an API call to save the profile
    console.log("Profile updated:", updatedProfile);
  };

  return (
    <>
      <aside className="w-full lg:w-1/4 px-4 mt-6 lg:sticky lg:top-6">
        <img
          src={userProfile.avatar}
          alt={userProfile.name}
          className="rounded-full w-[296px]"
        />

        <h1 className="text-[26px] font-semibold leading-tight mt-4">
          {userProfile.name}
        </h1>
        <p className="text-[20px] font-light text-github-muted leading-tight">
          {userProfile.username}
          {userProfile.pronouns && ` · ${userProfile.pronouns}`}
        </p>

        {userProfile.bio && (
          <p className="mt-3 text-sm text-github-muted">{userProfile.bio}</p>
        )}

        <div className="mt-4">
          <Button
            variant="outline"
            className="cursor-pointer w-full"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit profile
          </Button>
        </div>

        <div className="flex gap-4 text-sm mt-4">
          <span className="cursor-pointer hover:text-blue-600">
            <strong>{userProfile.followers}</strong> followers
          </span>
          <span className="cursor-pointer hover:text-blue-600">
            <strong>{userProfile.following}</strong> following
          </span>
        </div>

        <div className="text-sm text-github-muted mt-4 space-y-2">
          {userProfile.company && (
            <div className="flex items-center gap-3">
              <span className="text-lg">🏢</span>
              <span>{userProfile.company}</span>
            </div>
          )}

          {userProfile.location && (
            <div className="flex items-center gap-3">
              <span className="text-lg">📍</span>
              <span>{userProfile.location}</span>
            </div>
          )}

          {userProfile.displayLocalTime && <RealTimeComponent />}

          {userProfile.email && (
            <div className="flex items-center gap-3">
              <span className="text-lg">📧</span>
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
