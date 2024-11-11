import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "../services/api";
import {
  FiUser,
  FiMail,
  FiLock,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiEye,
  FiEyeOff,
  FiCode,
} from "react-icons/fi";

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative w-full">
    <input
      {...props}
      className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-blue-600 rounded-lg outline-none focus:outline-none focus:ring transition-all duration-200 text-gray-900 placeholder-gray-500"
    />
    <div className="absolute left-4 top-3 text-gray-400">
      <Icon size={18} />
    </div>
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    phone: "",
    address: "",
    profilePicture: null,
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "profilePicture" && files?.[0]) {
      setFormData({ ...formData, profilePicture: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
     
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();


 if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        alert("Please fill in all required fields!");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (!formData.termsAccepted) {
        alert("Please accept the terms and conditions!");
        return;
      }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.termsAccepted) {
      alert("Please accept the terms and conditions!");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value && key !== "confirmPassword" && key !== "termsAccepted") {
          formDataToSend.append(key, value);
        }
      });

      await createUser(formDataToSend);
      alert("Account created successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Error while registering");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-14 relative overflow-hidden">
      <div className="max-w-2xl mx-auto relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="font-bold text-orange-600 absolute left-9 top-2 text-sm"
            >
              DevConnect
            </motion.h1>
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-8">
              Create Your Account
            </h1>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="space-y-6 w-full">
                    {currentStep === 1 && (
                      <>
                        <InputField
                          icon={FiUser}
                          name="name"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleInput}
                          required
                        />
                        <InputField
                          icon={FiMail}
                          name="email"
                          type="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={handleInput}
                          required
                        />
                        <div className="relative">
                          <InputField
                            icon={FiLock}
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInput}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        <div className="relative">
                          <InputField
                            icon={FiLock}
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInput}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="terms"
                            name="termsAccepted"
                            checked={formData.termsAccepted}
                            onChange={handleInput}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            required
                          />
                          <label
                            htmlFor="terms"
                            className="text-sm text-gray-600"
                          >
                            I agree to the{" "}
                            <a
                              href="/terms"
                              className="text-blue-600 hover:text-blue-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Terms and Conditions
                            </a>
                          </label>
                        </div>
                      </>
                    )}

                    {currentStep === 2 && (
                      <>
                        <InputField
                          icon={FiCalendar}
                          name="age"
                          type="number"
                          placeholder="Age"
                          value={formData.age}
                          onChange={handleInput}
                        />
                        <InputField
                          icon={FiPhone}
                          name="phone"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={handleInput}
                        />
                        <InputField
                          icon={FiMapPin}
                          name="address"
                          placeholder="Address"
                          value={formData.address}
                          onChange={handleInput}
                        />
                      </>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6 w-full">
                        {previewImage && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                            className="flex justify-center"
                          >
                            <div className="w-40 h-40 rounded-full overflow-hidden border-3 border-gray-200">
                              <img
                                src={previewImage}
                                alt="Profile Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </motion.div>
                        )}

                        <div>
                          <input
                            type="file"
                            name="profilePicture"
                            onChange={handleInput}
                            accept="image/*"
                            className="hidden"
                            id="profile-picture"
                          />
                          <label
                            htmlFor="profile-picture"
                            className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                          >
                            <FiCamera className="mr-2" />
                            Upload Profile Picture
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between mt-6">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                          Back
                        </button>
                      )}

                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                        >
                          {isLoading ? "Creating..." : "Complete Registration"}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>

            <Link
              to="/login"
              className="block text-center mt-6 text-gray-500 hover:text-gray-700 transition-colors duration-200 text-sm"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
