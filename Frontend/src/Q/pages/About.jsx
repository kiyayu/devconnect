import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCodepen,
  FaQuoteLeft,
  FaGithub,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

// Data
const tabContents = {
  overview:
    "DevConnect is a community-driven platform that empowers developers of all skill levels to learn, collaborate, and grow. We're on a mission to break down barriers in the tech industry and provide accessible resources for aspiring and experienced developers alike.",
  approach:
    "Our approach is centered around fostering a supportive and inclusive environment. We offer a wide range of educational resources, from interactive coding tutorials to hands-on project collaborations. We also host regular virtual events and hackathons to bring our community together and encourage innovation.",
};

const team = [
  {
    name: "John Doe",
    role: "Founder & CEO",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Jane Smith",
    role: "CTO",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Michael Johnson",
    role: "Head of Engineering",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    name: "Emily Brown",
    role: "Lead Designer",
    avatar: "https://randomuser.me/api/portraits/women/49.jpg",
  },
  {
    name: "David Lee",
    role: "Community Manager",
    avatar: "https://randomuser.me/api/portraits/men/51.jpg",
  },
  {
    name: "Sarah Wilson",
    role: "Content Strategist",
    avatar: "https://randomuser.me/api/portraits/women/60.jpg",
  },
];

const testimonials = [
  {
    text: "DevConnect has been a game-changer for my coding journey. The community and resources have helped me grow exponentially as a developer.",
    author: "Sarah K.",
    avatar: "https://randomuser.me/api/portraits/women/19.jpg",
  },
  {
    text: "Ive learned so much from the project collaborations and mentorship opportunities on DevConnect. The support from the community is unparalleled.",
    author: "Mike L.",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    text: "Thanks to DevConnect, I was able to build a strong portfolio and land my dream job. The platform has truly been invaluable to my career growth.",
    author: "Linda T.",
    avatar: "https://randomuser.me/api/portraits/women/51.jpg",
  },
];

const About = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <FaCodepen className="text-blue-500 text-8xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 to-blue-400 rounded-full blur-md opacity-50"></div>
            </div>
            <h1 className="text-5xl font-bold text-blue-500 mb-2">
              DevConnect
            </h1>
            <p className="text-xl text-gray-600">
              Empowering Developers, Shaping the Future
            </p>
          </motion.div>

          {/* Tabs with reduced size */}
          <div className="flex justify-center mt-12">
            {["Overview", "Our Approach", "Our Team", "Testimonials"].map(
              (tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`${
                    activeTab === tab.toLowerCase()
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500 hover:bg-blue-100"
                  } py-2 px-3 mx-1 rounded-full text-sm font-small shadow-md transition duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab}
                </motion.button>
              )
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center mt-12 max-w-3xl mx-auto"
              >
                {tabContents.overview}
              </motion.div>
            )}
            {activeTab === "our approach" && (
              <motion.div
                key="our approach"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center mt-12 max-w-3xl mx-auto"
              >
                {tabContents.approach}
              </motion.div>
            )}
            {activeTab === "our team" && (
              <motion.div
                key="our team"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center mt-12"
              >
                <h2 className="text-4xl font-bold mb-12 text-blue-500">
                  Our Team
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                  {team.map((member, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 to-blue-400 opacity-10 blur-lg"></div>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 relative z-10 border-4 border-white shadow-lg"
                      />
                      <h3 className="font-bold text-blue-500 mb-2 relative z-10">
                        {member.name}
                      </h3>
                      <p className="text-gray-600 relative z-10">
                        {member.role}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {activeTab === "testimonials" && (
              <motion.div
                key="testimonials"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center mt-12"
              >
                <h2 className="text-4xl font-bold mb-12 text-blue-500">
                  What Our Members Say
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 to-blue-400 opacity-10 blur-lg"></div>
                      <FaQuoteLeft className="absolute top-3 left-3 text-blue-500 opacity-25 text-2xl z-10" />
                      <p className="italic mb-4 text-gray-700 relative z-10">
                        {testimonial.text}
                      </p>
                      <div className="flex items-center relative z-10">
                        <img
                          className="w-12 h-12 rounded-full mr-4"
                          src={testimonial.avatar}
                          alt={testimonial.author}
                        />
                        <div>
                          <p className="font-bold text-blue-500">
                            {testimonial.author}
                          </p>
                          <p className="text-gray-600">Member</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-16">
            <motion.button
              className="bg-blue-500 text-white py-3 px-6 rounded-full text-lg font-bold shadow-md transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Become a Member
            </motion.button>
          </div>

          <div className="flex justify-center gap-8 mt-12">
            <a
              href="https://github.com/devconnect"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub className="text-blue-500 text-3xl md:text-4xl hover:text-gray-600 transition duration-300" />
            </a>
            <a
              href="https://linkedin.com/company/devconnect"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin className="text-blue-500 text-3xl md:text-4xl hover:text-gray-600 transition duration-300" />
            </a>
            <a
              href="https://twitter.com/devconnect"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className="text-blue-500 text-3xl md:text-4xl hover:text-gray-600 transition duration-300" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
