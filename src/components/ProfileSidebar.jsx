const ProfileSidebar = () => {
  return (
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
      <button className="w-full mt-4 py-[5px] text-sm bg-github-panel border border-github-border rounded-md hover:bg-github-panelHover">
        Edit profile
      </button>

      <div className="flex gap-4 text-sm mt-4">
        <span>
          <strong>0</strong> followers
        </span>
        <span>
          <strong>3</strong> following
        </span>
      </div>

      <div className="text-sm text-github-muted mt-4 space-y-1">
        <p>🏢 Filnix Solutions</p>
        <p>📍 Koh-e-Noor, Faisalabad</p>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
