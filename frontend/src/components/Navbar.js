'use client';
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiBook, FiInfo, 
  FiMail, FiHelpCircle, FiTruck, FiFileText, FiChevronDown, 
  FiChevronUp, FiHome, FiGrid, FiStar, FiPercent, FiLogOut, FiPackage 
} from "react-icons/fi";
import { motion } from "framer-motion";
import useAuth from '@/hooks/useAuth';
import { MobileBottomNav, MobileMenuDrawer, MobileLoginPanel, MobileTopNav } from './MobileNav';

const NavLink = ({ href, pathname, children, className = "", icon }) => {
  const isActive = pathname === href;
  const isProductRoute = href === '/notebook-gallery' && 
    (pathname.startsWith('/notebook') || 
    pathname.startsWith('/diary') || 
    pathname.startsWith('/combination') || 
    pathname === '/notebook-gallery');

  return (
    <Link href={href} passHref>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative px-3 py-2 text-sm font-medium transition-colors flex items-center ${
          isActive || isProductRoute ? "text-blue-600" : "text-gray-700 hover:text-blue-500"
        } ${className}`}
      >
        {icon && <span className="mr-2 md:hidden">{icon}</span>}
        {children}
        {(isActive || isProductRoute) && (
          <motion.span 
            layoutId="navActive"
            className="absolute left-3 right-3 bottom-0 h-0.5 bg-blue-600"
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

const Submenu = ({ title, children, icon, className = "", isIconOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsOpen(false);
    }, 200);
    setTimeoutId(id);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    clearTimeout(timeoutId);
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={menuRef}
    >
      <button 
        className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
          isOpen ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50'
        } ${isIconOnly ? 'p-2' : ''}`}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon && <span className={`${isIconOnly ? 'text-xl' : 'text-lg'}`}>{icon}</span>}
        {!isIconOnly && title}
        {!isIconOnly && (
          <span className="text-sm ml-1">
            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        )}
      </button>
      
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`absolute top-full left-0 bg-white shadow-lg rounded-md mt-1 py-2 min-w-[200px] z-50 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {children}
      </motion.div>
    </div>
  );
};

const UserSubmenu = () => {
  const pathname = usePathname();
  const { user, loading, handleLogout } = useAuth();

  if (loading) {
    return <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>;
  }

  if (!user) {
    return (
      <NavLink href="/admin/login" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
        <FiUser className="mr-2" /> Login/Register
      </NavLink>
    );
  }

  return (
    <>
      <NavLink href="/admin/dashboard/profile" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
        <FiUser className="mr-2" /> My Account
      </NavLink>
      <NavLink href="/admin/dashboard/orders" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
        <FiPackage className="mr-2" /> My Orders
      </NavLink>
      <div className="border-t my-1"></div>
      <NavLink href="/track-order" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
        <FiTruck className="mr-2" /> Track Order
      </NavLink>
      <NavLink href="/admin/wishlist" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
        <FiStar className="mr-2" /> Wishlist
      </NavLink>
      <button
        onClick={handleLogout}
        className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-50 text-red-600"
      >
        <FiLogOut className="mr-2" /> Logout
      </button>
    </>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItemsCount(cart.reduce((total, item) => total + item.quantity, 0));
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  return (
    <>
      {/* Mobile Top Nav */}
      <div className="md:hidden">
        <MobileTopNav setMenuOpen={setMenuOpen} setLoginOpen={setLoginOpen} />
      </div>

      {/* Desktop Nav */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`hidden md:flex fixed top-0 left-0 w-full ${
          scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
        } transition-all duration-300 h-16 items-center z-50 border-b border-gray-100`}
      >
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          {/* Left - Logo */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Notebook Foru Logo" width={120} height={32} priority />
            </Link>
          </motion.div>

          {/* Center & Right - Menu */}
          <div className="flex items-center space-x-1">
            <NavLink href="/" pathname={pathname} icon={<FiHome className="md:hidden" />}>Home</NavLink>

            <Submenu title="Shop" icon={<FiGrid className="md:hidden" />}>
              <NavLink href="/notebook-gallery" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                <FiBook className="mr-2" /> All Products
              </NavLink>
              <NavLink href="/categories" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                <FiGrid className="mr-2" /> Categories
              </NavLink>
              <NavLink href="/new-arrivals" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                <FiStar className="mr-2" /> New Arrivals
              </NavLink>
              <NavLink href="/deals" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                <FiPercent className="mr-2" /> Special Offers
              </NavLink>
            </Submenu>

            <Submenu title="Info" icon={<FiInfo className="md:hidden" />}>
              <NavLink href="/about-us" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                <FiInfo className="mr-2" /> About Us
              </NavLink>
              <NavLink href="/blog" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                <FiFileText className="mr-2" /> Blog
              </NavLink>
              <NavLink href="/contact-us" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                <FiMail className="mr-2" /> Contact
              </NavLink>
              <NavLink href="/faq" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                <FiHelpCircle className="mr-2" /> FAQ
              </NavLink>
            </Submenu>

            <div className="flex items-center space-x-1 ml-4">
              <NavLink href="/search" pathname={pathname} className="p-2 text-gray-700 hover:text-blue-600">
                <FiSearch className="text-xl" />
              </NavLink>

              <div className="relative">
                <NavLink href="/cart" pathname={pathname} className="p-2 text-gray-700 hover:text-blue-600">
                  <FiShoppingCart className="text-xl" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </NavLink>
              </div>

              <Submenu icon={<FiUser className="text-xl" />} isIconOnly={true} className="p-0">
                <UserSubmenu />
              </Submenu>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="pt-16 md:pt-0"></div>

      {/* Mobile Side Drawer */}
      <MobileMenuDrawer menuOpen={menuOpen} setMenuOpen={setMenuOpen} pathname={pathname} />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav pathname={pathname} cartItemsCount={cartItemsCount} setMenuOpen={setMenuOpen} setLoginOpen={setLoginOpen} />

      {/* Mobile Login Panel */}
      <div className="md:hidden">
        <MobileLoginPanel isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    </>
  );
};

export default Navbar;
