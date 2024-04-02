import React from 'react';
import {Route, Routes} from 'react-router-dom';

import { ProgramDetails, CreateProgram, Home, Profile } from './pages';
import { Navbar, Sidebar } from './components'

const App = () => {
  return (
    // set background color to 
    <div className="relative sm:-8 p-4 bg-white] min-h-screen flex flex-row">
      <div className="sm:flex hidden mr-10 relative">
        <Sidebar />     
      </div>

      <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-program" element={<CreateProgram />} />
          <Route path="/program-details/:id" element={<ProgramDetails />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
