import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <div className="bg-gray-900 text-gray-400 md:py-14">
      <div className="container mx-auto px-6 md:px-12">
        {/* Footer Top Section */}
        <div className="flex flex-col md:flex-row md:justify-between gap-8 md:gap-0">
          {/* Links Section */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="flex   gap-3">
              <Link to="/about" className="hover:text-gray-200 transition">
                About Us
              </Link>
              <Link to="/help" className="hover:text-gray-200 transition">
                Help Center
              </Link>
              <Link to="/contact" className="hover:text-gray-200 transition">
                Contact Us
              </Link>
            </div>
           
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center space-x-5 mt-5 md:mt-0">
            <motion.a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
            >
              <Icon
                as={FaFacebook}
                boxSize={6}
                className="text-gray-400 hover:text-blue-600"
              />
            </motion.a>
            <motion.a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
            >
              <Icon
                as={FaTwitter}
                boxSize={6}
                className="text-gray-400 hover:text-blue-400"
              />
            </motion.a>
            <motion.a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
            >
              <Icon
                as={FaInstagram}
                boxSize={6}
                className="text-gray-400 hover:text-pink-600"
              />
            </motion.a>
            <motion.a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
            >
              <Icon
                as={FaYoutube}
                boxSize={6}
                className="text-gray-400 hover:text-red-600"
              />
            </motion.a>
          </div>
        </div>

        {/* Horizontal Line Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Footer Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Link to="/privacy-policy" className="mr-4 hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="mr-4 hover:underline">
              Terms and Conditions
            </Link>
            <Link to="/cookies-policy" className="hover:underline">
              Cookies Policy
            </Link>
          </div>
          <p>© {new Date().getFullYear()} DevConnect. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
