import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import { IconButton } from "@chakra-ui/react";
import {
  MdMenu,
  MdClose,
  MdWifi,
  MdSettings,
  MdNotificationAdd,
  MdNotifications,
  MdPerson,
  MdExitToApp,
  MdDarkMode,
  MdHelp,
  MdSecurity,
  MdLanguage,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount, markAllAsRead } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSetting(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShowSettingModal = () => {
    setShowSetting(!showSetting);
    if (isOpen) setIsOpen(false);
  };

  const handleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Add dark mode implementation
  };

  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > 10;
    if (isScrolled !== scrolled) {
      setScrolled(isScrolled);
    }
  }, [scrolled]);

  useEffect(() => {
    const debouncedHandleScroll = debounce(handleScroll, 100);
    window.addEventListener("scroll", debouncedHandleScroll);

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
    };
  }, [handleScroll]);

  const handleNavLinkClick = () => {
    if (isOpen) setIsOpen(false);
    setShowSetting(false);
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
    if (showSetting) setShowSetting(false);
  };

 
  // Settings Item Component
  const SettingItem = ({ icon, text, badge, toggle, textClass, onClick }) => (
    <div
      className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <span className="text-gray-600 dark:text-gray-400">{icon}</span>
        <span
          className={`text-sm ${
            textClass || "text-gray-700 dark:text-gray-300"
          }`}
        >
          {text}
        </span>
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
      {toggle !== undefined && (
        <div
          className={`w-8 h-4 rounded-full ${
            toggle ? "bg-blue-500" : "bg-gray-300"
          } relative`}
        >
          <div
            className={`absolute w-4 h-4 rounded-full bg-white top-0 transition-transform ${
              toggle ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
      )}
    </div>
  );

  // Settings Modal Component
  const SettingsModal = () => (
    <motion.div
      ref={settingsRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${
        isMobile
          ? "fixed top-[9vh] right-0 left-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
          : "absolute top-12 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      } overflow-hidden z-50`}
    >
      <div className="p-2">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
          <span className="text-lg font-semibold text-gray-800 dark:text-white">
            Settings
          </span>
          <button
            onClick={handleShowSettingModal}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <MdClose className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="py-2">
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center space-x-3">
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-gray-200"
              />
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {user?.username}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <Link to="/profile" onClick={handleShowSettingModal}>
            <SettingItem icon={<MdPerson />} text="Profile" />
          </Link>

          <Link
            to="/notification"
            onClick={() => {
              handleShowSettingModal();
              markAllAsRead();
            }}
          >
            <SettingItem
              icon={<MdNotifications />}
              text="Notifications"
              badge={unreadCount > 0 ? unreadCount : null}
            />
          </Link>

          <SettingItem
            icon={<MdDarkMode />}
            text="Dark Mode"
            toggle={isDarkMode}
            onClick={handleDarkMode}
          />
          <Link to="privacy-policy" onClick={handleShowSettingModal}>
            <SettingItem icon={<MdSecurity />} text="Privacy & Security" />
          </Link>
          <SettingItem icon={<MdLanguage />} text="Language" />
          <SettingItem icon={<MdHelp />} text="Help & Support" />

          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <SettingItem
              icon={<MdExitToApp className="text-red-500" />}
              text="Logout"
              textClass="text-red-500"
              onClick={() => {
                logout();
                handleShowSettingModal();
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div
      className={`fixed w-full h-[9vh] bg-white shadow-md z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md" : ""
      }`}
    >
      <div className="flex items-center justify-between h-full px-6 md:px-12">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-orange-600">DevConnect</span>
        </div>

        {/* Mobile Menu Icon */}
        <div className="flex items-center space-x-4 md:hidden">
          {user && (
            <>
              <Link to="/notification" onClick={markAllAsRead}>
                <div className="relative">
                  <MdNotifications className="text-2xl text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </Link>
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 30 }}
                  className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                  onClick={handleShowSettingModal}
                >
                  <MdSettings className="text-2xl text-gray-600" />
                </motion.div>
              </div>
            </>
          )}
          <IconButton
            onClick={toggleMenu}
            icon={isOpen ? <MdClose fontSize={30} /> : <MdMenu fontSize={30} />}
            aria-label="Toggle navigation"
            className="text-gray-700"
            _hover={{ bg: "gray.200" }}
            zIndex={100}
          />
        </div>

        {/* Nav Links (Mobile & Desktop) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`${
            isOpen
              ? "fixed top-[9vh] right-0 h-[91vh] w-64 bg-white shadow-2xl shadow-slate-700 z-50 p-8 flex flex-col justify-between"
              : "hidden"
          } md:flex md:static md:w-auto md:p-0 md:items-center md:h-auto`}
        >
          <motion.div
            className="flex flex-col md:flex-row text-sm items-start md:items-center gap-6 md:gap-9"
            onClick={handleNavLinkClick}
          >
            <Link
              to="/"
              className={`nav-link text-sm ${
                location.pathname === "/" ? "active" : ""
              } hover:scale-105 transition-all md:text-gray-700 text-sm md:text-base`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`nav-link ${
                location.pathname === "/about" ? "active" : ""
              } hover:scale-105 transition-all md:text-gray-700 text-sm md:text-base`}
            >
              About
            </Link>
            {user && (
              <>
                <Link
                  to="/chat"
                  className={`nav-link ${
                    location.pathname === "/chat" ? "active" : ""
                  } hover:scale-105 transition-all md:text-gray-700 text-sm md:text-base`}
                >
                  Chat
                </Link>
                <Link
                  to="/ad"
                  className={`nav-link ${
                    location.pathname === "/ad" ? "active" : ""
                  } hover:scale-105 transition-all md:text-gray-700 text-sm md:text-base`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/qa"
                  className={`nav-link ${
                    location.pathname === "/qa" ? "active" : ""
                  } hover:scale-105 transition-all md:text-gray-700 text-sm md:text-base`}
                >
                  QA
                </Link>
              </>
            )}
            <Link
              to="/contact"
              className={`nav-link ${
                location.pathname === "/contact" ? "active" : ""
              } hover:scale-105 transition-all md:text-gray-700 text-sm md:text-base`}
            >
              Contact
            </Link>
          </motion.div>

          {/* Mobile Auth Buttons */}
          {!user && (
            <div className="flex flex-col space-y-4 mt-8 md:hidden">
              <Link to="/login" onClick={handleNavLinkClick}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="grad-blue text-white w-full px-5 py-2 rounded-md"
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/register" onClick={handleNavLinkClick}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="grad-blue text-white w-full px-5 py-2 rounded-md"
                >
                  Register
                </motion.button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Profile and Settings (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile">
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md">
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 object-cover rounded-full border-2 border-gray-200"
                  />
                  <span className="font-medium text-gray-700">
                    {user.username}
                  </span>
                </div>
              </Link>

              <div className="flex items-center space-x-4">
                <Link to="/notification" onClick={markAllAsRead}>
                  <div className="relative">
                    <MdNotifications className="text-2xl text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 30 }}
                    className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                    onClick={handleShowSettingModal}
                  >
                    <MdSettings className="text-2xl text-gray-600" />
                  </motion.div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="grad-blue text-white px-5 py-2 rounded-md"
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="grad-blue text-white px-5 py-2 rounded-md"
                >
                  Register
                </motion.button>
              </Link>
            </div>
          )}
        </div>

        {/* Settings Modal for both Mobile and Desktop */}
        <AnimatePresence>{showSetting && <SettingsModal />}</AnimatePresence>
      </div>
    </div>
  );
};

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default NavBar;
