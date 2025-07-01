"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiMenu, FiX, FiShoppingCart, FiUser, FiHeart, FiHome, FiGrid,
  FiInfo, FiTruck, FiChevronDown, FiChevronUp
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from '@/hooks/useAuth';
import Image from "next/image";
import LoginSwipe from "@/components/LoginSwipe";

const MobileNavLink = ({ href, pathname, children, className = "", icon }) => {
  const isActive = pathname === href;
  return (
    <Link href={href}>
      <motion.div whileTap={{ scale: 0.98 }} className={`flex items-center py-3 px-4 rounded-md ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"} ${className}`}>
        {icon && <span className="mr-3">{icon}</span>}
        <span className="font-medium">{children}</span>
      </motion.div>
    </Link>
  );
};

const MobileSubmenu = ({ title, children, icon, pathname }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full">
      <button className={`flex items-center justify-between w-full px-4 py-3 text-left ${isOpen ? 'bg-gray-50 text-blue-600' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          <span className="font-medium">{title}</span>
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

const MobileMenuDrawer = ({ menuOpen, setMenuOpen, pathname }) => (
  <AnimatePresence>
    {menuOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-40" onClick={() => setMenuOpen(false)} />
        <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <FiX className="text-xl" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            <MobileNavLink href="/" pathname={pathname} icon={<FiHome />}>Home</MobileNavLink>
            <MobileSubmenu title="Shop" icon={<FiGrid />} pathname={pathname}>
              <MobileNavLink href="/notebook-gallery" pathname={pathname}>All Products</MobileNavLink>
              <MobileNavLink href="/categories" pathname={pathname}>Categories</MobileNavLink>
              <MobileNavLink href="/new-arrivals" pathname={pathname}>New Arrivals</MobileNavLink>
              <MobileNavLink href="/deals" pathname={pathname}>Special Offers</MobileNavLink>
            </MobileSubmenu>
            <MobileSubmenu title="Info" icon={<FiInfo />} pathname={pathname}>
              <MobileNavLink href="/about-us" pathname={pathname}>About Us</MobileNavLink>
              <MobileNavLink href="/blog" pathname={pathname}>Blog</MobileNavLink>
              <MobileNavLink href="/contact-us" pathname={pathname}>Contact</MobileNavLink>
              <MobileNavLink href="/faq" pathname={pathname}>FAQ</MobileNavLink>
            </MobileSubmenu>
            <MobileNavLink href="/track-order" pathname={pathname} icon={<FiTruck />}>Track Order</MobileNavLink>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const MobileTopNav = ({ setMenuOpen, setLoginOpen }) => {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 0) return;
      if (window.scrollY > lastScrollY) {
        setShowNav(false); // scrolling down, hide
      } else {
        setShowNav(true); // scrolling up, show
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`md:hidden fixed top-0 left-0 right-0 bg-white border-b shadow z-40 h-14 flex items-center justify-between px-4 transition-transform duration-300 ${
        showNav ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <button onClick={() => setMenuOpen(true)} className="p-2">
        <FiMenu className="text-2xl" />
      </button>
      <Link href="/" className="flex justify-center items-center">
        <Image src="/logo.png" alt="Logo" width={100} height={24} />
      </Link>
      <button onClick={() => setLoginOpen(true)} className="p-2">
        <FiUser className="text-2xl" />
      </button>
    </div>
  );
};

const MobileBottomNav = ({ pathname, cartItemsCount, setMenuOpen, setLoginOpen }) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleAccountClick = () => {
    user ? router.push("/admin/dashboard/profile") : setLoginOpen(true);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow z-40">
      <div className="flex justify-around items-center h-16">
        <button onClick={() => setMenuOpen(true)} className="flex flex-col items-center">
          <FiMenu className="text-xl" />
          <span className="text-xs mt-1">Menu</span>
        </button>
        <MobileNavLink href="/wishlist" pathname={pathname} className="flex flex-col items-center">
          <FiHeart className="text-xl" />
          <span className="text-xs mt-1">Wishlist</span>
        </MobileNavLink>
        <div className="relative flex flex-col items-center">
          <MobileNavLink href="/cart" pathname={pathname} className="flex flex-col items-center">
            <FiShoppingCart className="text-xl" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{cartItemsCount}</span>
            )}
            <span className="text-xs mt-1">Cart</span>
          </MobileNavLink>
        </div>
        <button onClick={handleAccountClick} className="flex flex-col items-center">
          <FiUser className="text-xl" />
          <span className="text-xs mt-1">My Account</span>
        </button>
      </div>
    </div>
  );
};

export {
  MobileBottomNav,
  MobileMenuDrawer,
  LoginSwipe as MobileLoginPanel,
  MobileTopNav
};
