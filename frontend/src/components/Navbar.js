"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 w-full ${scrolled ? "bg-white shadow-lg" : "bg-white/90 backdrop-blur-sm"} transition-all duration-300 h-16 flex items-center z-50`}
      >
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6">
          {/* Logo with hover effect */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-regular text-blue-600 tracking-wide"
              style={{ fontFamily: "'Glacial Indifference', sans-serif" }}
            >
              NOTEBOOK FORU
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <NavLink href="/" pathname={pathname}>Home</NavLink>
            <NavLink href="/notebook-gallery" pathname={pathname}>Notebook Gallery</NavLink>
            <NavLink href="/about-us" pathname={pathname}>About Us</NavLink>
            <NavLink href="/contact-us" pathname={pathname}>Contact</NavLink>
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-2xl text-gray-700 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Spacer to prevent content hiding */}
      <div className="pt-16"></div>

      {/* Mobile Menu with Animation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg overflow-hidden fixed top-16 w-full left-0 z-40"
          >
            <div className="px-6 py-4 flex flex-col space-y-4">
              <NavLink href="/" pathname={pathname}>Home</NavLink>
              <NavLink href="/notebook-gallery" pathname={pathname}>Notebook Gallery</NavLink>
              <NavLink href="/about-us" pathname={pathname}>About Us</NavLink>
              <NavLink href="/contact-us" pathname={pathname}>Contact</NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Enhanced NavLink component
const NavLink = ({ href, pathname, children }) => {
  const isActive = pathname === href;
  
  return (
    <Link href={href} passHref>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative px-2 py-1 text-lg font-medium transition-colors ${isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
      >
        {children}
        {isActive && (
          <motion.span 
            layoutId="navActive"
            className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-600"
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

export default Navbar;