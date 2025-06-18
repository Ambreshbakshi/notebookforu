"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  FiMenu, 
  FiX, 
  FiShoppingCart, 
  FiUser, 
  FiSearch, 
  FiBook, 
  FiInfo, 
  FiMail, 
  FiHelpCircle, 
  FiTruck, 
  FiShield, 
  FiFileText, 
  FiChevronDown, 
  FiChevronUp,
  FiHome,
  FiGrid,
  FiStar,
  FiPercent
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Submenu = ({ 
  title, 
  children, 
  icon, 
  pathname,
  className = "",
  isMobile = false,
  isIconOnly = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const menuRef = useRef(null);

  // Close when clicking outside (desktop only)
  useEffect(() => {
    if (isMobile) return;
    
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(timeoutId);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    const id = setTimeout(() => {
      setIsOpen(false);
    }, 200);
    setTimeoutId(id);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    clearTimeout(timeoutId);
  };

  if (isMobile) {
    return (
      <div className="w-full">
        <button 
          className={`flex items-center justify-between w-full px-4 py-3 text-left ${isOpen ? 'bg-gray-50 text-blue-600' : ''}`}
          onClick={toggleMenu}
        >
          <div className="flex items-center">
            {icon && <span className="mr-3">{icon}</span>}
            <span className="font-medium">{title}</span>
          </div>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-8 overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={menuRef}
    >
      <button 
        className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${isOpen ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50'} ${isIconOnly ? 'p-2' : ''}`}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon && <span className="text-lg">{icon}</span>}
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
        className={`absolute top-full left-0 bg-white shadow-lg rounded-md mt-1 py-2 min-w-[200px] z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
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

  // Get cart items count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItemsCount(cart.reduce((total, item) => total + item.quantity, 0));
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 w-full ${scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"} transition-all duration-300 h-16 flex items-center z-50 border-b border-gray-100`}
      >
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }}>
           <Link href="/" className="flex items-center">
 
<Image
  src="/logo.png"
  alt="Notebook Foru Logo"
  width={120}     // smaller width
  height={32}     // adjust proportionally
  priority
/>


</Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" pathname={pathname} icon={<FiHome className="md:hidden" />}>
              Home
            </NavLink>
            
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
              <NavLink href="/contact" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
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
              
              <Submenu title={<FiUser className="text-xl" />} isIconOnly>
                <NavLink href="/login" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                  <FiUser className="mr-2" /> Login/Register
                </NavLink>
                <NavLink href="/profile" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                  <FiUser className="mr-2" /> My Account
                </NavLink>
                <NavLink href="/orders" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                  <FiTruck className="mr-2" /> My Orders
                </NavLink>
                <div className="border-t my-1"></div>
                <NavLink href="/wishlist" pathname={pathname} className="flex items-center px-4 py-2 hover:bg-gray-50">
                  <FiStar className="mr-2" /> Wishlist
                </NavLink>
              </Submenu>
            </div>
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
            className="md:hidden bg-white shadow-lg overflow-y-auto max-h-[calc(100vh-4rem)] fixed top-16 w-full left-0 z-40 border-t border-gray-100"
          > 
            <div className="px-4 py-2 flex flex-col">
              <MobileNavLink href="/" pathname={pathname} icon={<FiHome />}>Home</MobileNavLink>
              
              <Submenu title="Shop" icon={<FiGrid />} pathname={pathname} isMobile>
                <MobileNavLink href="/notebook-gallery" pathname={pathname}>All Products</MobileNavLink>
                <MobileNavLink href="/categories" pathname={pathname}>Categories</MobileNavLink>
                <MobileNavLink href="/new-arrivals" pathname={pathname}>New Arrivals</MobileNavLink>
                <MobileNavLink href="/deals" pathname={pathname}>Special Offers</MobileNavLink>
              </Submenu>
              
              <Submenu title="Information" icon={<FiInfo />} pathname={pathname} isMobile>
                <MobileNavLink href="/about-us" pathname={pathname}>About Us</MobileNavLink>
                <MobileNavLink href="/blog" pathname={pathname}>Blog</MobileNavLink>
                <MobileNavLink href="/contact" pathname={pathname}>Contact</MobileNavLink>
                <MobileNavLink href="/faq" pathname={pathname}>FAQ</MobileNavLink>
              </Submenu>

              <Submenu title="Account" icon={<FiUser />} pathname={pathname} isMobile>
                <MobileNavLink href="/login" pathname={pathname}>Login/Register</MobileNavLink>
                <MobileNavLink href="/profile" pathname={pathname}>My Account</MobileNavLink>
                <MobileNavLink href="/orders" pathname={pathname}>My Orders</MobileNavLink>
                <MobileNavLink href="/wishlist" pathname={pathname}>Wishlist</MobileNavLink>
              </Submenu>

              <div className="border-t my-1"></div>
              <MobileNavLink href="/search" pathname={pathname} icon={<FiSearch />}>Search</MobileNavLink>
              <div className="relative">
                <MobileNavLink href="/cart" pathname={pathname} icon={<FiShoppingCart />}>
                  Cart
                  {cartItemsCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </MobileNavLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Enhanced NavLink component for desktop
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
        className={`relative px-3 py-2 text-sm font-medium transition-colors flex items-center ${isActive || isProductRoute ? "text-blue-600" : "text-gray-700 hover:text-blue-500"} ${className}`}
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

// Mobile-specific NavLink component
const MobileNavLink = ({ href, pathname, children, icon }) => {
  const isActive = pathname === href;
  
  return (
    <Link href={href} passHref>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`flex items-center py-3 px-4 rounded-md ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
      >
        {icon && <span className="mr-3">{icon}</span>}
        <span className="font-medium">{children}</span>
      </motion.div>
    </Link>
  );
};

export default Navbar;