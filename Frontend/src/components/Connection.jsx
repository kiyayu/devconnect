import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import {
  MdClose,
  MdPersonAdd,
  MdBlock,
  MdMessage,
  MdGroup,
  MdPeople,
  MdMoreVert,
} from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { toast } from "react-toastify";
import { getToken } from "../auth";

const Connection = ({ user, close }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("none");
  const [mutualFriends, setMutualFriends] = useState([]);
  const socketRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMutualFriends, setShowMutualFriends] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [friends, setFriends] = useState([]);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const token = getToken();
const [processingFriendId, setProcessingFriendId] = useState(null);
const [friendStatuses, setFriendStatuses] = useState({});
   const [showProfile, setShowProfile] = useState(false);
// ... (previous useEffect and other functions remain the same)

const fetchFriendStatuses = async (friendsList) => {
  try {
    const statuses = {};
    for (const friend of friendsList) {
      const response = await api.get(`/connections/${friend._id}/status`);
      statuses[friend._id] = response.data.status;
    }
    setFriendStatuses(statuses);
  } catch (error) {
    console.error("Failed to fetch friend statuses:", error);
    toast.error("Failed to fetch friend statuses");
  }
};

const handleFriendList = async () => {
  try {
    const response = await api.get(`/connections/${user._id}/friends`);
    const friendsList = response.data || [];
    setFriends(friendsList);
    await fetchFriendStatuses(friendsList);
  } catch (error) {
    console.error("Error fetching friend list:", error);
    toast.error("Failed to fetch friend list");
  }
};

const handleFriendAction = async (friendId) => {
  setProcessingFriendId(friendId);
  try {
    const status = friendStatuses[friendId];

    if (!status || status === "none") {
      await api.post(`/connections/${friendId}/request`);
      setFriendStatuses((prev) => ({
        ...prev,
        [friendId]: "pending",
      }));
      toast.success("Friend request sent successfully!");
    } else if (status === "pending") {
      await api.post(`/connections/${friendId}/cancel-request`);
      setFriendStatuses((prev) => ({
        ...prev,
        [friendId]: "none",
      }));
      toast.success("Friend request cancelled!");
    } else if (status === "accepted") {
      await api.post(`/connections/${friendId}/unfriend`);
      setFriendStatuses((prev) => ({
        ...prev,
        [friendId]: "none",
      }));
      toast.success("Friend removed successfully!");
    }
  } catch (error) {
    console.error("Friend action error:", error);
    toast.error("Failed to process friend action");
  } finally {
    setProcessingFriendId(null);
  }
};
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initializeSocket = useCallback(() => {
    try {
      socketRef.current = io(import.meta.env.VITE_API_URL, {
        transports: ["websocket"],
        auth: token,
      });

      socketRef.current.on("updated_users", (users) => {
        setOnlineUsers(users);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        toast.error("Connection error. Retrying...");
      });

      socketRef.current.on("reconnect", (attemptNumber) => {
        toast.success("Reconnected successfully!");
      });
    } catch (error) {
      console.error("Socket initialization error:", error);
      toast.error("Failed to initialize connection");
    }
  }, []);

  useEffect(() => {
    initializeSocket();
    fetchConnectionStatus();
    fetchMutualFriends();
    handleFriendList();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user._id, initializeSocket]);

  const fetchConnectionStatus = async () => {
    try {
      setError(null);
      const response = await api.get(`/connections/${user._id}/status`);
      setConnectionStatus(response.data.status);
    } catch (error) {
      setError("Failed to fetch connection status");
      toast.error("Failed to fetch connection status");
    }
  };

  const fetchMutualFriends = async () => {
    try {
      setError(null);
      const response = await api.get(`/connections/${user._id}/mutual-friends`);
      setMutualFriends(response.data.mutualFriends);
    } catch (error) {
      setError("Failed to fetch mutual friends");
      toast.error("Failed to fetch mutual friends");
    }
  };

  const handleFriendRequest = async () => {
    setLoading(true);
    try {
      await api.post(`/connections/${user._id}/request`);
      setConnectionStatus("pending");
      toast.success("Friend request sent successfully!");
    } catch (error) {
      toast.error("Failed to send friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      toast.info("Opening message window...");
      // Implement message functionality here
    } catch (error) {
      toast.error("Failed to open message window");
    }
  };

  const handleBlock = async () => {
    try {
      await api.post(`/connections/${user._id}/block`);
      setConnectionStatus("blocked");
      toast.success("User blocked successfully");
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  const handleUnblock = async () => {
    try {
      await api.post(`/connections/${user._id}/unblock`);
      setConnectionStatus("none");
      toast.success("User unblocked successfully");
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  };

  const handleAddToGroup = async () => {
    try {
      // Implement add to group functionality
      toast.info("Opening group selection...");
    } catch (error) {
      toast.error("Failed to open group selection");
    }
  };

 

  const toggleFriendsList = () => {
    setShowFriendsList(!showFriendsList);
  };
  const renderFriendActionButton = (friend) => {
    const status = friendStatuses[friend._id];
    const isProcessing = processingFriendId === friend._id;

    if (isProcessing) {
      return (
        <motion.button
          className="text-sm bg-gray-400 text-white px-3 py-1 rounded flex items-center gap-1"
          disabled
        >
          Processing...
        </motion.button>
      );
    }

    switch (status) {
      case "none":
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFriendAction(friend._id)}
            className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1"
          >
            <MdPersonAdd />
            Add Friend
          </motion.button>
        );
      case "pending":
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleFriendAction(friend._id)}
            className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 flex items-center gap-1"
          >
            Cancel Request
          </motion.button>
        );
      case "accepted":
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleFriendAction(friend._id)}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
          >
            Unfriend
          </motion.button>
        );
      default:
        return null;
    }
  };
  const renderActionButton = () => {
    switch (connectionStatus) {
      case "none":
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            onClick={handleFriendRequest}
            className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-1"
          >
            <MdPersonAdd />
            {loading ? "Sending..." : "Add Friend"}
          </motion.button>
        );
      case "pending":
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-sm bg-gray-500 text-white px-3 py-1 rounded flex items-center gap-1"
          >
            <MdPersonAdd />
            Request Pending
          </motion.button>
        );
      case "accepted":
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
          >
            <MdPeople />
            Friends
          </motion.button>
        );
      case "blocked":
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleUnblock}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1"
          >
            <MdBlock />
            Unblock
          </motion.button>
        );
      default:
        return null;
    }
  };

  const isOnline = onlineUsers.some(
    (onlineUser) => onlineUser._id === user._id
  );

  const renderProfileSection = () => (
    <div className="flex gap-3 items-center pb-2 px-2">
      <div className="relative">
        {isImageLoading && (
          <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
        )}
        <motion.img
          whileHover={{ scale: 1.05 }}
          onLoad={handleImageLoad}
          style={{ display: isImageLoading ? "none" : "block" }}
          src={user.profilePicture || "/default-profile.png"}
          alt={user.name}
          className="w-20 h-20 rounded-full cursor-pointer object-cover"
          onClick={() => setShowModal(true)}
        />
        <div
          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      </div>
      <div className="flex flex-col flex-1">
        <p className="font-semibold">{user.name}</p>
        <motion.p
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowMutualFriends(true)}
          className="text-sm text-gray-500 cursor-pointer"
        >
          {mutualFriends.length} mutual friends
        </motion.p>
      </div>
      {renderActionButton()}
    </div>
  );

  const renderOptionsMenu = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-2 z-50"
    >
      {connectionStatus === "accepted" && (
        <>
          <button
            onClick={handleMessage}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
          >
            <MdMessage />
            Send Message
          </button>
          <button
            onClick={handleAddToGroup}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
          >
            <MdGroup />
            Add to Group
          </button>
        </>
      )}
      <button
        onClick={handleBlock}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 flex items-center gap-2"
      >
        <MdBlock />
        Block User
      </button>
    </motion.div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-30"
        onClick={close}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-[300px] z-40 bg-white fixed top-[15%] md:left-[40%] md:top-[10%] right-[10%] rounded-lg shadow-lg"
      >
        <div className="relative">
          <div className="flex justify-between items-center p-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={close}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MdClose className="text-xl" />
            </motion.button>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <MdMoreVert className="text-xl" />
              </motion.button>
              <AnimatePresence>
                {showOptions && renderOptionsMenu()}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col border-b-2 p-3">
            {renderProfileSection()}
            <div className="flex items-center justify-center text-sm gap-2">
              {isOnline ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center"
                >
                  <span className="text-green-600">Online</span>
                  <div className="w-2 h-2 rounded-full bg-green-600 ml-2"></div>
                </motion.div>
              ) : (
                <span className="text-gray-500">
                  {user.lastSeen
                    ? `Last seen ${formatDistanceToNow(
                        new Date(user.lastSeen)
                      )} ago`
                    : "Offline"}
                </span>
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 p-5"
          >
            <div className="mb-4">
              <h3 className="font-semibold mb-1">About</h3>
              <p className="text-sm text-gray-600">
                {user.bio || "No bio available"}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-1">Location</h3>
              <p className="text-sm text-gray-600">
                {user.address || "No location provided"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMessage}
                className="w-full py-2 px-4 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <MdMessage />
                Send Message
              </motion.button>

              {connectionStatus === "accepted" && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleFriendsList}
                    className="w-full py-2 px-4 text-sm border border-gray-300 rounded hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <MdPeople />
                    View Friend List
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToGroup}
                    className="w-full py-2 px-4 text-sm border border-gray-300 rounded hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <MdGroup />
                    Add to Group
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
          {showFriendsList && (
            <motion.div
              initial={{ y: -100, opacity: 0.3 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="z-50 bg-white w-full top-0 absolute rounded-xl shadow-lg shadow-slate-800 p-4 sm:p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white pb-4 z-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                  {user.name}'s Friends
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({friends.length})
                  </span>
                </h2>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFriendsList(false)}
                  className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>

              {filteredFriends.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm
                      ? "No friends found matching your search"
                      : "No friends yet"}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3 h-[50vh] overflow-y-auto">
                  {filteredFriends.map((friend) => (
                    <motion.li
                      key={friend._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={friend.profilePicture || "/default-avatar.png"}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {friend.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {friend.mutualFriends} mutual friends
                          </p>
                        </div>
                      </div>
                    
                    
                      {renderFriendActionButton(friend)}
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-[90%] md:w-[500px] rounded-lg p-5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowModal(false)}
                className="absolute right-3 top-3 p-2 hover:bg-gray-100 rounded-full"
              >
                <MdClose className="text-xl" />
              </motion.button>

              <div className="flex flex-col items-center">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={user.profilePicture || "/default-profile.png"}
                  alt={user.name}
                  className="w-48 h-48 rounded-full mb-4 object-cover"
                />
                <h2 className="text-xl font-bold mb-2">{user.name}</h2>
                <p className="text-gray-500 mb-4">
                  {isOnline
                    ? "Currently Online"
                    : user.lastSeen
                    ? `Last seen ${formatDistanceToNow(
                        new Date(user.lastSeen)
                      )} ago`
                    : "Offline"}
                </p>
                <div className="text-center max-w-md">
                  <p className="mb-3">{user.bio || "No bio available"}</p>
                  <p className="text-gray-600">
                    {user.address || "No location provided"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default Connection;
