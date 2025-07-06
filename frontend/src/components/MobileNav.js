"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiMenu, FiX, FiShoppingCart, FiUser, FiHeart, FiHome, FiGrid,
  FiInfo, FiTruck, FiChevronDown, FiChevronUp,FiShoppingBag
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from '@/hooks/useAuth';
import Image from "next/image";
import LoginSwipe from "@/components/LoginSwipe";

/* ------------ Drawer ke liye Link ------------ */
const MobileNavLinkDrawer = ({ href, pathname, children, icon }) => {
  const isActive = pathname === href;
  return (
    <Link href={href} passHref legacyBehavior>
      <motion.a 
        whileTap={{ scale: 0.98 }} 
        className={`flex items-center gap-3 w-full py-3 px-4 rounded-md ${
          isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        {icon && <span className="text-xl">{icon}</span>}
        <span className="font-medium text-sm">{children}</span>
      </motion.a>
    </Link>
  );
};

/* ------------ Bottom Navbar ke liye Link ------------ */
const MobileNavLinkBottom = ({ href, pathname, children, icon }) => {
  const isActive = pathname === href;
  return (
    <Link href={href} passHref legacyBehavior>
      <motion.a 
        whileTap={{ scale: 0.98 }} 
        className={`flex flex-col items-center py-3 px-4 rounded-md ${
          isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-500"
        }`}
      >
        {icon && <span className="mb-1 text-xl">{icon}</span>}
        <span className="font-medium text-xs">{children}</span>
      </motion.a>
    </Link>
  );
};

/* ------------ Submenu Drawer ke liye ------------ */
const MobileSubmenu = ({ title, children, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full">
      <button className={`flex items-center justify-between w-full px-4 py-3 text-left ${isOpen ? 'bg-gray-50 text-blue-600' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="pl-8 overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------ Drawer Smooth Slide ------------ */
const MobileMenuDrawer = ({ menuOpen, setMenuOpen, pathname }) => (
  <AnimatePresence>
    {menuOpen && (
      <div className="fixed inset-0 z-[100]">
        
        {/* Dark Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black"
          onClick={() => setMenuOpen(false)}
        />

        {/* Sliding Drawer */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-0 left-0 h-full w-72 bg-white shadow-lg overflow-y-auto"
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <div className="p-4 space-y-2">
            <MobileNavLinkDrawer href="/" pathname={pathname} icon={<FiHome />}>
              Home
            </MobileNavLinkDrawer>
<MobileNavLinkDrawer href="/notebook-gallery" pathname={pathname} icon={<FiGrid />}>
                All Products
              </MobileNavLinkDrawer>
            {/* <MobileSubmenu title="Shop" icon={<FiGrid />}>
              <MobileNavLinkDrawer href="/notebook-gallery" pathname={pathname}>
                All Products
              </MobileNavLinkDrawer>
              <MobileNavLinkDrawer href="/categories" pathname={pathname}>
                Categories
              </MobileNavLinkDrawer>
              <MobileNavLinkDrawer href="/new-arrivals" pathname={pathname}>
                New Arrivals
              </MobileNavLinkDrawer>
              <MobileNavLinkDrawer href="/deals" pathname={pathname}>
                Special Offers
              </MobileNavLinkDrawer>
            </MobileSubmenu> */}

            <MobileSubmenu title="Info" icon={<FiInfo />}>
              <MobileNavLinkDrawer href="/about-us" pathname={pathname}>
                About Us
              </MobileNavLinkDrawer>
              <MobileNavLinkDrawer href="/blog" pathname={pathname}>
                Blog
              </MobileNavLinkDrawer>
              <MobileNavLinkDrawer href="/contact-us" pathname={pathname}>
                Contact Us
              </MobileNavLinkDrawer>
              <MobileNavLinkDrawer href="/faq" pathname={pathname}>
                FAQ
              </MobileNavLinkDrawer>
            </MobileSubmenu>

            <MobileNavLinkDrawer href="/track-order" pathname={pathname} icon={<FiTruck />}>
              Track Order
            </MobileNavLinkDrawer>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);


/* ------------ Top Nav ------------ */
const MobileTopNav = ({ setMenuOpen, setLoginOpen }) => {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 0) return;
      if (window.scrollY > lastScrollY) setShowNav(false);
      else setShowNav(true);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`md:hidden fixed top-0 left-0 right-0 bg-white border-b shadow z-50 h-14 flex items-center justify-between px-4 transition-transform duration-300 ${showNav ? "translate-y-0" : "-translate-y-full"}`}>
      <button onClick={() => setMenuOpen(true)} className="p-2"><FiMenu className="text-2xl" /></button>
      
      <Link href="/" className="flex justify-center items-center"><Image src="/logo.png" alt="Logo" width={100} height={24} /></Link>
      <button onClick={() => setLoginOpen(true)} className="p-2"><FiUser className="text-2xl" /></button>
    </div>
  );
};

/* ------------ Bottom Nav ------------ */
const MobileBottomNav = ({ pathname, cartItemsCount, setMenuOpen, setLoginOpen }) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleAccountClick = () => {
    user ? router.push("/admin/dashboard/profile") : setLoginOpen(true);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow z-50">
      <div className="flex justify-around items-center h-16">
        
        <MobileNavLinkBottom href="/" pathname={pathname} icon={<FiHome />}>
          Home
        </MobileNavLinkBottom>

        <MobileNavLinkBottom href="/notebook-gallery" pathname={pathname} icon={<FiGrid />}>
          Our Products
        </MobileNavLinkBottom>

        <MobileNavLinkBottom href="/admin/wishlist" pathname={pathname} icon={<FiHeart />}>
          Wishlist
        </MobileNavLinkBottom>

       <div className="relative flex flex-col items-center">
  <MobileNavLinkBottom href="/cart" pathname={pathname} icon={<FiShoppingCart />}>
    Cart
  </MobileNavLinkBottom>
  
  {cartItemsCount > 0 && (
    <span className="absolute -top-0.6 right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
      {cartItemsCount}
    </span>
  )}
</div>


        <button onClick={handleAccountClick} className="flex flex-col items-center focus:outline-none text-gray-700 hover:text-blue-500">
          <FiUser className="text-xl" />
          <span className="text-xs mt-1">My Account</span>
        </button>
        
      </div>
    </div>
  );
};


export {
  MobileMenuDrawer,
  MobileTopNav,
  MobileBottomNav,
  LoginSwipe as MobileLoginPanel
};
