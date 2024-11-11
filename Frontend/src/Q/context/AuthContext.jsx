import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Corrected import
import { saveToken, getToken, clearToken } from "../../auth";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken());
  const [allUsers, setAllUsers] = useState([]);


  // Function to calculate token expiration and set a timeout for automatic logout
  const setAutoLogout = (exp) => {
    const currentTime = Date.now();
    const expiryTime = exp * 1000 - currentTime;
    if (expiryTime > 0) {
      setTimeout(logout, expiryTime); // Set timeout to logout when token expires
    } else {
      logout(); // Immediately log out if the token is already expired
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = getToken(); // Correctly get the token
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/http://192.168.4.2:5004/api/auth/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllUsers(response.data);
    } catch (error) {
      console.error("error", error); // Corrected error logging
    }
  };

  useEffect(() => {
    fetchAllUsers(); // Corrected function name
  }, [token]); // Optionally add token to dependencies

  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        setUser({
          userId: decodedToken.userId,
          username: decodedToken.name,
          email: decodedToken.email,
          profilePicture: decodedToken.profilePicture,
          role: decodedToken.role,
        });
        setToken(storedToken);
        setAutoLogout(decodedToken.exp);
      } catch (error) {
        console.error("Error decoding token:", error);
        clearToken();
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  const login = (newToken) => {
    saveToken(newToken);
    const decodedToken = jwtDecode(newToken);
    setUser({
      userId: decodedToken.userId,
      username: decodedToken.name,
      email: decodedToken.email,
      profilePicture: decodedToken.profilePicture,
      phone: decodedToken.phone,
      role: decodedToken.role,
      address: decodedToken.address,
      status: decodedToken.status,
    });
    setToken(newToken);
    setAutoLogout(decodedToken.exp);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, allUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
