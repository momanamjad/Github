import { Outlet, useParams } from "react-router-dom";
import Navbar from "@layout/Navbar";
import Tabs from "@layout/Tabs";
import ProfileSidebar from "@layout/ProfileSidebar";

const ProfileLayout = () => {
  const { username } = useParams();

  return (
    <>
      <Navbar />

      <Tabs username={username} />

      <div className="flex max-w-7xl mx-auto px-4">
        <ProfileSidebar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default ProfileLayout;
