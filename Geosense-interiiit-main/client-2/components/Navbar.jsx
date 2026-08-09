import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Map Interface', href: '/pixeldeed' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Marketplace', href: '/marketplace' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 font-sans ${scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Geo<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sense</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 hover:text-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pl-4 border-l border-white/10">
                <ConnectButton showBalance={false} />
              </div>
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden absolute w-full transition-all duration-300 overflow-hidden glass-panel rounded-none border-x-0 border-t-0 ${isMobileMenuOpen ? 'max-h-96 border-b' : 'max-h-0 border-none'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-white/10">
             <ConnectButton showBalance={false} />
          </div>
        </div>
      </div>
    </nav>
  );
}
