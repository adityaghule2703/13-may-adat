import React, { useState, useRef, useEffect } from "react";
import { Settings, User, ChevronDown, Search, Menu, X, Leaf } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../components/LanguageToggle';
import BASE_URL from "../config/Config";

const Header = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data from API
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUserData({
            name: data.user.name || 'User',
            email: data.user.email || '',
            role: data.user.role || 'member'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setIsProfileOpen(false);
    }
  };

  const handleAccountClick = () => {
    setIsProfileOpen(false);
    navigate('/account');
  };

  const getRoleText = (role) => {
    const roleMap = {
      'superadmin': 'Super Admin',
      'farmer': 'Farmer',
      'operator': 'Operator'
    };
    return roleMap[role] || 'Member';
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-16 z-20 backdrop-blur-xl"
        style={{ background: 'rgba(255, 255, 255, 0.98)', borderBottom: '1px solid rgba(76, 175, 80, 0.2)' }}
      >
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-green-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg" style={{ color: '#1B5E20' }}>{t('common.appName')}</span>
              <span className="text-xs block" style={{ color: '#6D4C41' }}>{t('common.subtitle')}</span>
            </div>
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-green-50 transition-colors"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>

          {/* Desktop Search Bar */}
          <div
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: '#F1F8E9', border: '1px solid #C8E6C9' }}
          >
            <Search className="w-4 h-4" style={{ color: '#43A047' }} />
            <input
              type="text"
              placeholder={t('common.search')}
              className="bg-transparent text-sm outline-none w-64 lg:w-80"
              style={{ color: '#2E7D32' }}
            />
            <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#FFFFFF', color: '#8D6E63' }}>⌘K</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l cursor-pointer"
                style={{ borderColor: '#C8E6C9' }}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold" style={{ color: '#2E7D32' }}>
                    {loading ? 'Loading...' : userData.name}
                  </p>
                  <p className="text-[10px]" style={{ color: '#FF6F00' }}>
                    {loading ? '...' : getRoleText(userData.role)}
                  </p>
                </div>
                <div className="relative group">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
                  >
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown
                    className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-white rounded-full p-0.5"
                    style={{ background: '#FF6F00' }}
                  />
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border overflow-hidden z-30"
                  style={{ borderColor: '#E8F5E9' }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
                      >
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>
                          {loading ? 'Loading...' : userData.name}
                        </p>
                        <p className="text-xs" style={{ color: '#8D6E63' }}>
                          {loading ? '...' : userData.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleAccountClick}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-green-50 transition-colors flex items-center gap-3"
                      style={{ color: '#2E7D32' }}
                    >
                      <User className="w-4 h-4" />
                      Account
                    </button>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-red-50 transition-colors flex items-center gap-3"
                      style={{ color: '#D84315' }}
                    >
                      {isLoggingOut ? (
                        <>
                          <svg className="animate-spin h-4 w-4" style={{ color: '#D84315' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging out...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div
            className="fixed top-16 left-0 right-0 bg-white p-4 shadow-lg z-20 md:hidden"
            style={{ borderBottom: '1px solid #E8F5E9' }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: '#F1F8E9', border: '1px solid #C8E6C9' }}
            >
              <Search className="w-4 h-4" style={{ color: '#2E7D32' }} />
              <input
                type="text"
                placeholder={t('common.search')}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: '#2E7D32' }}
                autoFocus
              />
              <button onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;