import { useLocation } from 'react-router-dom';
import { HiPlus, HiMenu } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children, onAddWebsite }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />

      <div className="md:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100/80 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm shadow-gray-100">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <HiMenu className="w-5 h-5" />
            </button>
            <span className="md:hidden text-lg font-bold text-gray-900 tracking-tight">WebLinks</span>
          </div>
          <button
            id="add-website-btn"
            onClick={onAddWebsite}
            className="flex items-center gap-2 px-3 md:px-4 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-primary-200/70 transition-all duration-200 hover:shadow-lg hover:shadow-primary-300/50 hover:-translate-y-px"
          >
            <HiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Website</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        <main key={location.pathname} className="flex-1 px-4 md:px-8 py-4 md:py-6 fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
