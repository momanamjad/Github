import React from "react";
import Profile from "./pages/Profile";
import { Navigate, Route, Routes } from "react-router-dom";
import ProfileLayout from "./pages/ProfileLayout";
import Overview from "./components/tabs/Overview";
import Repositories from "./components/tabs/Repositories";
import Stars from "./components/tabs/Stars";
import RepoDetails from "./components/RepoDetails";
// import Check from "./components/check";

const App = () => {
  return (
    <>
      <div className="min-h-screen bg-github-bg text-github-text text-[14px] leading-[1.5]">
        {/* <Check/> */}
        <Routes>
          <Route path="/" element={<Navigate to="/momanamjad" />} />
          <Route path="/:username" element={<ProfileLayout />}>
            <Route index element={<Overview />} />
            <Route path="repositories" element={<Repositories />} />
            <Route path="stars" element={<Stars />} />
            <Route path="/:username/:repo" element={<RepoDetails />} />

          </Route>
        </Routes>
      </div>
    </>
  );
};

export default App;
