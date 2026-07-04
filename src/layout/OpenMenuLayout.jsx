import { Navbar } from '@/components/layout'
import React from 'react'
import { Outlet } from 'react-router-dom'

const OpenMenuLayout = () => {
  return (
    <div>
      <Navbar/>
      <main id="main-content" tabIndex="-1" className="outline-none">
        <Outlet />
      </main>
    </div>
  );
}

export default OpenMenuLayout