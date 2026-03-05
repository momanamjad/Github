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

      {/* Responsive layout: stacked on mobile, side-by-side on lg+ */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-3 sm:px-4">
        <ProfileSidebar />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default ProfileLayout;
