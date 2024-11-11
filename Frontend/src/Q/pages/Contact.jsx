// contact.jsx
import React, { useState } from "react";
import { MdLocationPin, MdEmail, MdPhone, MdSend } from "react-icons/md";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const Contact = () => {
  const { ref, inView } = useInView();
  const animation = useAnimation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (inView) {
      animation.start({
        y: "0",
        opacity: 1,
        transition: {
          type: "tween",
          duration: 0.8,
          ease: "easeOut",
        },
      });
    }
    if (!inView) {
      animation.start({ y: "1vh", opacity: 0 });
    }
  }, [animation, inView]);

  const itemAnimation = {
    hidden: { x: "-100vw", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const formAnimation = {
    hidden: { x: "100vw", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const buttonAnimation = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.6,
        bounce: 0.4,
      },
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Send the contact form data to the backend API
      const response = await axios.post("http://localhost:5004/api/contact", {
        name,
        email,
        subject,
        message,
      });

      // Display a success message
      alert(response.data.message);

      // Reset the form
      resetForm();
    } catch (error) {
      console.error("Error sending contact form:", error);
    
   toast.error("Error sending message. Please try again later.", {
     position: "top-right",
     autoClose: 3000,
   });
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <motion.div
      className="container mx-auto min-h-screen py-20"
      ref={ref}
      initial={{ y: "100vh", opacity: 0 }}
      animate={animation}
    >
      <div className="">
        <motion.div
          className="w-full px-10 py-5"
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-sm flex items-center text-[14px] font-light font-serif">
            Contact <span className="text-orange-500">_____________</span>
          </h2>
          <p className="text-[36px] uppercase font-serif font-bold">
            Get in Touch
          </p>
        </motion.div>
        <motion.div
          className="flex flex-col p-5 px-10 gap-20 md:flex-row sm:flex-col justify-center"
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className=" flex flex-col gap-5 p-4"
            variants={itemAnimation}
            initial="hidden"
            animate="visible"
          >
            <div className=" flex gap-4 items-center shadow-lg shadow-slate-400 p-5 rounded">
              <i className="text-orange-500 p-3 border border-slate-300 rounded-full hover:bg-orange-500 hover:text-white transition duration-300 ease-in-out">
                <MdLocationPin />{" "}
              </i>
              <div className="">
                <h4 className="text-lg font-bold">Location:</h4>
                <p>A108 Street, Lorem ipsum dolor sit., LM 535022</p>
              </div>
            </div>

            <div className="flex gap-4 items-center shadow-lg p-5 shadow-slate-400 rounded">
              <i className="text-orange-500 p-3 border border-slate-300 rounded-full hover:bg-orange-500 hover:text-white transition duration-300 ease-in-out">
                <MdEmail />{" "}
              </i>
              <div>
                <h4 className="text-lg font-bold">Email:</h4>
                <p>info@example.com</p>
              </div>
            </div>

            <div className="flex gap-4 items-center shadow-lg p-5 shadow-slate-400 rounded">
              <i className="text-orange-500 p-3 border border-slate-300 rounded-full hover:bg-orange-500 hover:text-white transition duration-300 ease-in-out">
                <MdPhone />{" "}
              </i>
              <div>
                <h4 className="text-lg font-bold">Call:</h4>
                <p>+1 5589 55488 55s</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col p-4 flex-2"
            variants={formAnimation}
            initial="hidden"
            animate="visible"
          >
            <form className="flex flex-col gap-9 py-3" onSubmit={handleSubmit}>
              <div className="flex gap-7 justify-evenly w-full">
                <motion.input
                  type="text"
                  placeholder="Your Name"
                  className="border shadow-lg border-green-400 focus:outline-none p-2 w-full rounded placeholder:text-gray-600"
                  variants={itemAnimation}
                  initial="hidden"
                  animate="visible"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <motion.input
                  type="email"
                  placeholder="Your Email"
                  className="border shadow-lg border-green-400 focus:outline-none w-full p-2 rounded placeholder:text-gray-600"
                  variants={itemAnimation}
                  initial="hidden"
                  animate="visible"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <motion.input
                type="text"
                placeholder="Subject"
                className="border border-green-400 shadow-lg focus:outline-none p-2 rounded placeholder:text-gray-600"
                variants={itemAnimation}
                initial="hidden"
                animate="visible"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <motion.textarea
                placeholder="Your message here...."
                className="focus:outline-none border border-green-500 p-4 placeholder:text-gray-600 rounded"
                variants={itemAnimation}
                initial="hidden"
                animate="visible"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <motion.button
                className="bg-blue-500 flex items-center text-lg justify-center self-start mx-auto py-2 px-10 rounded-lg text-white hover:bg-orange-500 transition duration-500 gap-3 uppercase shadow-lg ease-in-out"
                variants={buttonAnimation}
                initial="hidden"
                animate="visible"
                type="submit"
              >
                Submit
                <span>
                  <MdSend />
                </span>
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;
