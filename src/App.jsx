import React from 'react'
import Profile from './pages/Profile'

const App = () => {
  return (
    <>
 <div className="min-h-screen bg-github-bg text-github-text text-[14px] leading-[1.5]">

    <Routes>
        <Route path="/" element={<Navigate to="/octocat" />} />
        <Route path="/:username" element={<Profile />} />
      </Routes>
    </div>
    </>
  )
}

export default App