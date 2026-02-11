import { Navbar } from '@/components/layout'
import React from 'react'
import { Outlet } from 'react-router-dom'

const OpenMenuLayout = () => {
  return (
<div>
    <Navbar/>
  <main>
        <Outlet />
      </main>
  
</div>
  
)
}

export default OpenMenuLayout