import React from 'react'
import Profile from './pages/Profile'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProfileLayout from "./pages/ProfileLayout";
import Overview from "./pages/Overview";
import Repositories from "./pages/Repositories";
import Stars from "./pages/Stars";

const App = () => {
  return (
    <>
 <div className="min-h-screen bg-github-bg text-github-text text-[14px] leading-[1.5]">

     <Routes>
      <Route path="/" element={<Navigate to="/octocat" />} />

      <Route path="/:username" element={<ProfileLayout />}>
        <Route index element={<Overview />} />
        <Route path="repositories" element={<Repositories />} />
        <Route path="stars" element={<Stars />} />
      </Route>
    </Routes>
    </div>
    </>
  )
}

export default App