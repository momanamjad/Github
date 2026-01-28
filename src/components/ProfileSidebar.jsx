import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RealTimeComponent from "./RealTimeComponent";
const ProfileSidebar = () => {
  return (
    <>
      <aside className="w-full lg:w-1/4 px-4 mt-6 lg:sticky lg:top-6">
        <img
          //  src={user.avatar_url}
          src="https://avatars.githubusercontent.com/u/1?v=4"
          className="rounded-full w-[296px]"
        />

        <h1 className="text-[26px] font-semibold leading-tight mt-4">
          Moman Amjad
        </h1>
        <p className="text-[20px] font-light text-github-muted leading-tight">
          momanamjad · he/him
        </p>

        <div className="mt-4">
          <Button variant="outline" className=" cursor-pointer w-full">
            Edit profile  
          </Button>
        </div>
        <div className="flex gap-4 text-sm mt-4">
          <span>
            <strong>0</strong> followers
          </span>
          <span>
            <strong>3</strong> following
          </span>
        </div>

        <div className="text-sm text-github-muted mt-4 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-lg">🏢</span>
            <span>Filinix Solutions</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">📍</span>
            <span>koh e noor Faisalabad</span>
          </div>
          <RealTimeComponent />
          <div className="flex items-center gap-3">
            <span className="text-lg">📧</span>
            <span>momomanamjad07@gmail.com</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProfileSidebar;
