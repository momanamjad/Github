import React, { useEffect, useState } from "react";
import Profile from "@pages/Profile";
import { Navigate, Route, Routes } from "react-router-dom";
import ProfileLayout from "@pages/ProfileLayout";
import Overview from "@features/tabs/Overview";
import Repositories from "@features/tabs/Repositories";
import Stars from "@features/tabs/Stars";
import RepoDetails from "@features/RepoDetails";
import NewRepoPage from "@features/NewRepoPage";

const App = () => {
  

  return (
    <>
      <div className="min-h-screen bg-github-bg text-github-text text-[14px] leading-[1.5]">
        
        <Routes>
          <Route path="/" element={<Navigate to="/momanamjad" />} />
                  <Route path="/new" element={<NewRepoPage />} />
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
