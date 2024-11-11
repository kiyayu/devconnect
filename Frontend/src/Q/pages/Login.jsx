import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { saveToken } from "../../auth";
import { loginUser } from "../services/api";
import {FaGoogle} from 'react-icons/fa'
import {
  FiUser,
  FiLock,
  FiCode,
  FiEye,
  FiEyeOff,
  FiGithub,
  FiLinkedin,
  FiFacebook,
} from "react-icons/fi";

const SocialButton = ({ icon: Icon, label, onClick, bgColor }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white ${bgColor} transition-colors duration-200`}
    onClick={onClick}
  >
    <Icon size={20} />
    <span>{label}</span>
  </motion.button>
);

const InputField = ({
  icon: Icon,
  type,
  placeholder,
  name,
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Icon size={20} />
      </div>
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      )}
    </div>
  );
};

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ message: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      login(response.data.token);
      saveToken(response.data.token);
      setStatus({
        message: "Login successful! Redirecting...",
        type: "success",
      });
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      setStatus({
        message:
          error.response?.data?.message || "Login failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social login logic here
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        {/* Logo and Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center"
          >
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <FiCode className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to DevConnect
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <InputField
              icon={FiUser}
              type="text"
              placeholder="Username"
              name="name"
              value={formData.name}
              onChange={handleInput}
            />
            <InputField
              icon={FiLock}
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleInput}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm text-gray-600"
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </motion.button>

          <AnimatePresence>
            {status.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-lg text-center ${
                  status.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SocialButton
              icon={FaGoogle}
              label="Google"
              onClick={() => handleSocialLogin("google")}
              bgColor="bg-red-500 hover:bg-red-600"
            />
            <SocialButton
              icon={FiGithub}
              label="GitHub"
              onClick={() => handleSocialLogin("github")}
              bgColor="bg-gray-800 hover:bg-gray-900"
            />
            <SocialButton
              icon={FiLinkedin}
              label="LinkedIn"
              onClick={() => handleSocialLogin("linkedin")}
              bgColor="bg-blue-600 hover:bg-blue-700"
            />
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
