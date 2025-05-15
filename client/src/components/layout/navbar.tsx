import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import Logo from "../logo";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-glass shadow-glass' : ''}`}>
      <nav className="bg-glass shadow-glass mx-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Logo />
              </Link>
            </div>
            
            {/* Navigation links (desktop) */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <button 
                onClick={() => scrollToSection('about')} 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:text-primary-600 transition duration-150 ease-in-out"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:text-primary-600 transition duration-150 ease-in-out"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:text-primary-600 transition duration-150 ease-in-out"
              >
                Features
              </button>
              <Link 
                href="/feed" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:text-primary-600 transition duration-150 ease-in-out"
              >
                Feed
              </Link>
            </div>
            
            {/* Auth buttons */}
            <div className="flex items-center">
              <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out mr-3">
                Login
              </Link>
              <Link href="/signup" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white btn-gradient focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out">
                Sign Up
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                type="button" 
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Heroicon name: menu (outline) */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => scrollToSection('about')}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-primary-600 hover:bg-gray-100 w-full text-left"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-primary-600 hover:bg-gray-100 w-full text-left"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-primary-600 hover:bg-gray-100 w-full text-left"
            >
              Features
            </button>
            <Link 
              href="/feed"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-primary-600 hover:bg-gray-100 w-full text-left"
            >
              Feed
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
