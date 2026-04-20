import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiHome,
  HiCollection,
  HiLogout,
  HiLink,
  HiX,
  HiTag,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import ManageCategoriesModal from '../modals/ManageCategoriesModal';

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: HiHome },
  { to: '/websites', label: 'Websites', icon: HiCollection },
];

function LogoutDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 flex flex-col gap-4">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <HiX className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
          <HiLogout className="text-red-500 text-xl" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Sign out?</h2>
          <p className="text-sm text-gray-500 mt-1">You'll be returned to the login screen. Your bookmarks are safely saved.</p>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 md:hidden modal-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50 shadow-[0_0_15px_rgba(0,0,0,0.05)] md:shadow-sm transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-200">
              <HiLink className="text-white text-lg" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">WebLinks</span>
          </div>
          <button onClick={onCloseMobile} className="md:hidden p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto scrollbar-thin">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Menu</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-primary-100 text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  {label}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
                </>
              )}
            </NavLink>
          ))}

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Settings</p>
            <button
              id="manage-categories-btn"
              onClick={() => setShowManageCategories(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 group"
            >
              <span className="p-1 rounded-lg text-gray-400 group-hover:text-gray-600 transition-colors">
                <HiTag className="w-4 h-4" />
              </span>
              Manage Categories
            </button>
          </div>
        </nav>

        <div className="border-t border-gray-100 px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-100 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary-600">{user?.displayName?.[0]?.toUpperCase() || 'U'}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            id="logout-btn"
            onClick={() => setShowLogoutDialog(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 group"
          >
            <span className="p-1 rounded-lg group-hover:bg-red-100 transition-colors">
              <HiLogout className="w-4 h-4" />
            </span>
            Sign out
          </button>
        </div>
      </aside>

      {showLogoutDialog && (
        <LogoutDialog onConfirm={handleLogout} onCancel={() => setShowLogoutDialog(false)} />
      )}

      <ManageCategoriesModal
        isOpen={showManageCategories}
        onClose={() => setShowManageCategories(false)}
        onCategoriesChanged={() => {}}
      />
    </>
  );
}
