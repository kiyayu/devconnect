//context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { AuthContext } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        query: { token },
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to Socket.io server");
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from Socket.io server");
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
