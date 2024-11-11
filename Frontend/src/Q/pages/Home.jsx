import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Data for cards and slides are kept inside the component for now
  const cardData = [
    {
      icon: "💻",
      title: "Code",
      description: "Share and explore coding projects",
    },
    {
      icon: "📚",
      title: "Learn",
      description: "Join discussions to enhance your programming skills",
    },
    {
      icon: "👨‍💻",
      title: "Collaborate",
      description: "Work together on coding challenges and projects",
    },
    {
      icon: "🚀",
      title: "Innovate",
      description: "Bring your ideas to life with cutting-edge tech",
    },
  ];

  const slideData = [
    {
      image:
        "https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2ViJTIwZGV2ZWxvcG1lbnR8ZW58MHx8MHx8fDA%3D",
      title: "Join Our Coding Community",
      description:
        "Connect with developers from around the world and share your passion for coding.",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1690303193705-eec163806599?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzd8fHdlYiUyMGRldmVsb3BtZW50fGVufDB8fDB8fHww",
      title: "Learn New Technologies",
      description:
        "Stay up-to-date with the latest programming languages and frameworks.",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1690303193725-e3a9c08cfca4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTN8fHdlYiUyMGRldmVsb3BtZW50fGVufDB8fDB8fHww",
      title: "Build Amazing Projects",
      description: "Collaborate on exciting projects and build your portfolio.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col  sm:justify-center items-center overflow-hidden  p-2 md:p-8 bg-white">
      <BackgroundAnimation />
      <div className="text-center text-black z-10 max-w-4xl w-full">
        <motion.h1
          className="text-3xl mb-4 font-semibold"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to DevConnect
        </motion.h1>
        <motion.p
          className="text-lg mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Connect and discuss everything programming
        </motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 justify-center">
          {cardData.map((card, index) => (
            <AnimatedCard key={index} card={card} index={index} />
          ))}
        </div>

        <motion.button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full shadow-lg focus:outline-none transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Link to="/qa">Join the Conversation</Link>
        </motion.button>
      </div>
      <Carousel currentSlide={currentSlide} slideData={slideData} />
      <ParticlesOverlay />
    </div>
  );
};

// AnimatedCard with memoization for better performance
const AnimatedCard = memo(({ card, index }) => {
  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-4 w-40 sm:w-40 text-black"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 * index, duration: 0.5 }}
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
    >
      <div className="text-4xl mb-2">{card.icon}</div>
      <h3 className="text-lg mb-1 font-semibold">{card.title}</h3>
      <p className="text-sm text-gray-600">{card.description}</p>
    </motion.div>
  );
});

// Carousel component with lazy-loaded images
// Carousel component with smaller size
const Carousel = ({ currentSlide, slideData }) => {
  return (
    <div className="relative w-[480px] sm:w-full    h-[150px] mt-12 overflow-hidden"> {/* Reduced height */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          className="absolute w-full h-full flex items-center justify-center"
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
        >
          {/* Reduced image size to 40% of width */}
          <LazyImage
            src={slideData[currentSlide].image}
            alt={slideData[currentSlide].title}
            className="w-2/5 h-full object-cover rounded-lg" 
          />
          {/* Reduced text box size to 35% of width and less padding */}
          <div className="w-1/3 p-4 bg-white/80 rounded-lg h-full flex flex-col justify-center shadow-lg">
            <h2 className="text-sm mb-2 text-black font-semibold"> {/* Reduced title size */}
              {slideData[currentSlide].title}
            </h2>
            <p className="text-sm text-black"> {/* Reduced description size */}
              {slideData[currentSlide].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const LazyImage = ({ src, alt, className }) => {
  return <img loading="lazy" className={className} src={src} alt={alt} />;
};

const BackgroundAnimation = memo(() => {
  return (
    <motion.div className="absolute top-0 left-0 w-full h-full bg-cover bg-center" />
  );
});

const ParticlesOverlay = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      {[...Array(30)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute bg-orange-500 rounded-full"
          animate={{
            y: ["0%", "100%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
          }}
        />
      ))}
    </div>
  );
};

export default Home;
