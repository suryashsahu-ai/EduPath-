import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import Logo from './Logo.jsx';
import UserAvatar from './UserAvatar.jsx';
import { ButtonLink } from './ui/Button.jsx';
import { NAV_LINKS } from './navigation.js';
import { useAuth } from '../context/AuthContext.jsx';

const desktopLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium border-b-2 transition-colors hover:bg-ink/5 ${
    isActive ? 'border-ink font-semibold' : 'border-transparent'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-3 text-base font-medium hover:bg-ink/5 ${isActive ? 'bg-ink/10 font-semibold' : ''}`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const toggleRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const closeMenu = () => setMenuOpen(false);
  const closeDropdown = () => setProfileDropdownOpen(false);

  // Close after any navigation (including browser back/forward).
  useEffect(() => {
    setMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    if (!profileDropdownOpen) return undefined;
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  // Escape closes any open menu
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (menuOpen) {
          setMenuOpen(false);
          toggleRef.current?.focus();
        }
        if (profileDropdownOpen) {
          setProfileDropdownOpen(false);
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, profileDropdownOpen]);

  const handleLogout = async () => {
    closeMenu();
    closeDropdown();
    navigate('/', { replace: true });
    await logout();
  };

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'User';

  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-surface text-ink">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo onClick={closeMenu} />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={desktopLinkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Auth Navigation */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <ButtonLink to="/dashboard" variant="secondary" size="md">
                Dashboard
              </ButtonLink>

              {/* Profile Button with Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  id="profile-menu-button"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-full border border-ink/20 bg-ink/5 py-1 pl-1 pr-3 transition-colors hover:border-ink hover:bg-ink/10 focus:outline-hidden focus:ring-2 focus:ring-ink"
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="text-sm font-semibold text-ink">{firstName}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-ink/70 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="profile-menu-button"
                    className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-ink/20 bg-surface p-2 shadow-xl ring-1 ring-black/5 focus:outline-hidden"
                  >
                    {/* User Card */}
                    <div className="flex items-center gap-3 border-b border-ink/10 px-3 py-3">
                      <UserAvatar user={user} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{user.full_name}</p>
                        <p className="truncate text-xs text-ink/70">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        role="menuitem"
                        onClick={closeDropdown}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/10"
                      >
                        <User className="h-4 w-4 text-ink/70" aria-hidden="true" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        role="menuitem"
                        onClick={closeDropdown}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/10"
                      >
                        <LayoutDashboard className="h-4 w-4 text-ink/70" aria-hidden="true" />
                        <span>Dashboard</span>
                      </Link>
                    </div>

                    <div className="border-t border-ink/10 pt-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                      >
                        <LogOut className="h-4 w-4 text-danger" aria-hidden="true" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <ButtonLink to="/login" variant="secondary">
                Login
              </ButtonLink>
              <ButtonLink to="/register">Get Started</ButtonLink>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          ref={toggleRef}
          type="button"
          className="rounded-lg p-2 hover:bg-ink/10 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-ink/15 bg-surface lg:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-7xl px-4 pb-5 pt-3 sm:px-6">
            {user && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-ink/15 bg-ink/5 p-3">
                <UserAvatar user={user} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{user.full_name}</p>
                  <p className="truncate text-xs text-ink/70">{user.email}</p>
                </div>
              </div>
            )}

            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.end} onClick={closeMenu} className={mobileLinkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-2.5 border-t border-ink/15 pt-4">
              {user ? (
                <>
                  <ButtonLink to="/profile" fullWidth onClick={closeMenu}>
                    <User className="h-4 w-4 mr-1.5 inline" aria-hidden="true" />
                    My Profile
                  </ButtonLink>
                  <ButtonLink to="/dashboard" variant="secondary" fullWidth onClick={closeMenu}>
                    <LayoutDashboard className="h-4 w-4 mr-1.5 inline" aria-hidden="true" />
                    Dashboard
                  </ButtonLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-danger/40 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <ButtonLink to="/login" variant="secondary" fullWidth onClick={closeMenu}>
                    Login
                  </ButtonLink>
                  <ButtonLink to="/register" fullWidth onClick={closeMenu}>
                    Get Started
                  </ButtonLink>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
