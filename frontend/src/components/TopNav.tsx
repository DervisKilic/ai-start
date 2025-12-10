import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { navItems, adminItems } from '../config/navigation';
import { navLinkBase, navLinkActive, navLinkInactive, cn } from '../utils/styles';
import BackendStatus from './BackendStatus';

export default function TopNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-dark-900/80 backdrop-blur-md border-b border-dark-700/60 shadow-lg shadow-dark-950/20 sticky top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo and App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center shadow-lg shadow-warm-500/30 ring-2 ring-warm-500/20">
              <svg className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9 5 7 8 7 11c0 2.5 1.5 4.5 3.5 5.5L9 22h6l-1.5-5.5C15.5 15.5 17 13.5 17 11c0-3-2-6-5-9zm0 4c1.5 2 2.5 4 2.5 5.5 0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5C9.5 10 10.5 8 12 6z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-white bg-gradient-to-r from-white to-dark-200 bg-clip-text text-transparent">KeepWarm</h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(navLinkBase, isActive ? navLinkActive : navLinkInactive)
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <>
                <div className="h-6 w-px bg-dark-700 mx-2" />
                {adminItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(navLinkBase, isActive ? navLinkActive : navLinkInactive)
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </>
            )}
          </div>

          {/* User Info, Backend Status, and Logout */}
          <div className="flex items-center gap-4">
            {/* Backend Status Indicator */}
            <BackendStatus />

            {user && (
              <div className="text-right px-4 py-2 bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/50">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-dark-300">{user.role === 'admin' ? 'Admin' : 'Seller'}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="p-2.5 text-dark-300 hover:text-white hover:bg-dark-800/70 backdrop-blur-sm rounded-xl transition-all duration-200 hover:translate-y-[-1px] border border-transparent hover:border-dark-700/50"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

