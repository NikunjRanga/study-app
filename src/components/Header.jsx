// Header.jsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Command } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import DATA from '../data/data';
import Logo from './Logo';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${scrolled
        ? 'bg-white/80 backdrop-blur-xl border-zinc-200/50 py-3 shadow-[0_2px_20px_rgba(0,0,0,0.02)]'
        : 'bg-transparent border-transparent py-6'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavigation('/')}
        >
          <div className="w-10 h-10 flex items-center justify-center transition-all duration-300">
            <Logo className="w-full h-full" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900 group-hover:opacity-80 transition-opacity">
            Study<span className="text-indigo-600">App</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <div className="flex items-center bg-zinc-100/50 p-1 rounded-full border border-zinc-200/50 backdrop-blur-md">
            {DATA.header.navLinks.filter(l => !['Login', 'Signup'].includes(l.name)).map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.url)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden ${activeTab === link.url || (link.url !== '/' && activeTab.startsWith(link.url))
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                  }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Auth Buttons or Profile */}
        <div className="hidden md:flex items-center gap-4">
          {localStorage.getItem('token') ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-zinc-900">
                  {JSON.parse(localStorage.getItem('user'))?.name || 'User'}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="text-xs text-zinc-500 hover:text-red-600 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                {JSON.parse(localStorage.getItem('user'))?.name?.charAt(0) || 'U'}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleNavigation('/login')}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => handleNavigation('/signup')}
                className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-zinc-100 shadow-2xl p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
          {DATA.header.navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavigation(link.url)}
              className={`text-left py-3 text-lg font-medium border-b border-zinc-100 last:border-0 transition-colors ${activeTab === link.url
                ? 'bg-black text-white rounded-lg px-3'
                : 'text-zinc-800 hover:bg-zinc-100'
                }`}
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
