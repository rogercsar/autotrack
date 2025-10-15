import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
      
      <div className="flex flex-col lg:flex-row">
        <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />
        
        <main className="flex-1 lg:ml-0">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
