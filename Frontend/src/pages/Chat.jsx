import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { getToken } from "../auth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api"
import { toast } from "react-toastify";
import { Link } from "react-router-dom"
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { IoSend, IoAddCircle, IoClose } from "react-icons/io5";
import { FiUsers, FiMessageCircle, FiMenu, FiArrowDownLeft, FiArrowLeft } from "react-icons/fi";
import { BsImage } from "react-icons/bs";
import { MdAttachEmail, MdAttachFile, MdAttachment, MdDelete, MdEdit,   MdMore,   MdMoreHoriz, MdSignalCellularNull, } from "react-icons/md";
import EmojiPicker from 'emoji-picker-react';
import { formatDistanceToNow } from "date-fns";
import {createGroup, getGroup, deleteGroup} from "../services/api"
import Connection from "../components/Connection";
const Chat = () => {
  // State declarations
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [name, setName] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const messagesEndRef = useRef(null);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState(null);
  const [groupIcon, setGroupIcon] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesContainerRef = useRef(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [moreId, setMoreId] = useState(null)
  const [groupId, setGroupId] = useState(null)


        const [selectedUser, setSelectedUser] = useState(null);

        const [showProfile, setShowProfile] = useState(false);
        const hanldeShowProfile = async (userId) => {
          console.log("Fetching user ID:", userId); // Add this to check the ID
          try {
            const response = await api.get(`/auth/users/${userId}`);
            const data = await response.data; // Correctly retrieve data (not `response.json()`)
            console.log("Fetched user data:", data); // Add this to debug the response
            setSelectedUser(data);
            setShowProfile(true);
          } catch (error) {
            console.error("Error fetching user details:", error);
          }
        };
  const token = getToken();
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 const scrollToBottom = useCallback(() => {
   if (!isAutoScrollEnabled) return;

   if (messagesEndRef.current) {
     messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
   }
 }, [isAutoScrollEnabled]);

 // Handle scroll events to detect manual scrolling
 const handleScroll = useCallback((e) => {
   const container = e.target;
   const isScrolledNearBottom =
     container.scrollHeight - container.scrollTop - container.clientHeight <
     100;

   setIsAutoScrollEnabled(isScrolledNearBottom);
 }, []);
 
 
 // Effect for new messages
 useEffect(() => {
   scrollToBottom();
 }, [messages, scrollToBottom]); 
  const generateRoomId = useCallback((user1Id, user2Id) => {
    return [user1Id, user2Id].sort().join("-");
  }, []);
const handleMore = (id) => {
 
    
    setMoreId(moreId== id ? null: id);
  
};

useEffect(() => {
  const newSocket = io(import.meta.env.VITE_API_URL, {
    transports: ["websocket"],
    auth: { token },
     
  });
  newSocket.on("connect", () => {});

  newSocket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    toast.error("Connection error. Please try again.");
  });

  newSocket.on("updated_users", (users) => {
    const filteredUsers = users.filter((user) => user._id !== userId);
    setOnlineUsers(filteredUsers);
  });

  newSocket.on("receiveMessage", (message) => {
    setMessages((prev) => [...prev, message]);
  });

  newSocket.on("messageHistory", (messages) => {
    setMessages(messages);
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }
      setIsAutoScrollEnabled(true);
    }, 100);
  });
  newSocket.on("messageDeleted", ({ id }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === id ? { ...msg, isDeleted: true, content: "" } : msg
      )
    );
  });
  // Inside your main useEffect where other socket listeners are defined

  newSocket.on("messageUpdated", ({ messageId, content, editedAt }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId
          ? { ...msg, content, isEdited: true, editedAt }
          : msg
      )
    );
  });

  newSocket.on("error", (error) => {
    toast.error(error.message);
  });

  setSocket(newSocket);

  return () => {
    if (newSocket) newSocket.disconnect();
  };
}, [userId, token, scrollToBottom]);
 

const handleUpdateMessage = useCallback(
  (messageId, newContent) => {
    if (!socket || !newContent.trim()) {
      toast.error("Cannot update message");
      return;
    }

    socket.emit("updateMessage", {
      messageId,
      content: newContent.trim(),
    });
    setEditingMessage(null);
  },
  [socket]
);
  // Inside your sendMessage function
  const sendMessage = useCallback(async () => {
    if (!content.trim() || !socket || !selectedRoom) {
      toast.error("Please select a chat and type a message");
      return;
    }

    try {
      let fileUrl = null;

      // If a file is selected, upload it first
      if (file) {
        const formData = new FormData();
        formData.append("file", file); // Append the file to the FormData
        // Ensure you have the correct function to retrieve the token
       console.log(formData.name)
        try {
          const response = await api.post("/files/upload",
            formData,
          );
     
          const data = response.data; // Access the response data
          
          if (response.status === 201) {
            // Check for successful upload
            fileUrl = data.url; // Assuming your API returns the file URL
          } else {
            toast.error("File upload failed");
            return; // Exit if file upload fails
          }
        } catch (error) {
          console.error("File upload error:", error);
          toast.error("File upload failed");
          return; // Handle error appropriately
        }
      }

      // Now emit the message with the file URL if it exists
      socket.emit("sendMessage", {
        roomId: selectedRoom,
        content: content.trim(),
        file: fileUrl, // Include the file URL in the message
      });
setShowEmojiPicker(false);
      // Clear inputs after sending
      setContent("");
      setFile(null); // Clear the file input
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  }, [content, socket, selectedRoom, file]);
const handleDeleteMessage = (messageId) => {
    if (!window.confirm("Are you sure you want to delete this Message?")) {
      return;
    }
  socket.emit("deleteMessage", messageId);
};
const toggleEmojiPicker = () => {
  setShowEmojiPicker((prev) => !prev);
};

const handleEmojiClick = (event, emojiObject) => {
  if (emojiObject && emojiObject.emoji) {
    setContent((prevMessage) => prevMessage + emojiObject.emoji);
  }
};

 
  const handleGroup = async () => {
    const formData = new FormData()
    formData.append("name", name)
    if(groupIcon){  
    formData.append("groupIcon", groupIcon)}
    try {
      
      if (!name.trim()) {
        toast.error("Please enter a group name");
        return;
      }
     
      const response = await createGroup(formData)

      toast.success("Group created successfully");
      setName("");
      setGroupIcon(null)
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Update state with the selected file
  };
  const fetchGroups = useCallback(async () => {
    try {
      const response = await getGroup()
      
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to fetch groups");
    }
  }, [token]);

  const joinRoom = useCallback(
    (roomId, chatName) => {
      if (socket) {
        setSelectedRoom(roomId);
        setCurrentChat(chatName);
        socket.emit("joinRoom", roomId);
      }
    },
    [socket]
  );

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupDelete = async (id) => {
    try{ 
     
     const response =  await deleteGroup(id); // Call your delete API function
      toast.success("Group deleted successfully"); // Provide user feedback
      fetchGroups(); // Refresh the groups list
      setGroupId(null);
    }
    catch (error) {
      console.error("error", error)
      alert("delete error")
    }

  }
  const toggleMobilePanel = (panel) => {
    if (activeMobilePanel === panel) {
      setActiveMobilePanel(null);
    } else {
      setActiveMobilePanel(panel);
    }
  };

  const handleGroupIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupIcon(file);
    }
  };

  return (
    <div className="h-[90vh] w-[100%]  bg-gray-50   ">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center justify-between shadow-md">
        <Link to="/home">
          {" "}
          <FiArrowLeft
            className="text-2xl text-gray-700 cursor-pointer"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          />{" "}
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
        <div className="flex gap-4">
          <FiMessageCircle
            className="text-2xl text-gray-700 cursor-pointer"
            onClick={() => toggleMobilePanel("groups")}
          />
          <FiUsers
            className="text-2xl text-gray-700 cursor-pointer"
            onClick={() => toggleMobilePanel("users")}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="h-full flex pt-4 lg:pt-0">
        {/* Left Sidebar - Groups (Desktop) */}
        <div className="hidden lg:block w-72 bg-white border-r border-gray-200 h-full overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Groups</h2>
              <button
                onClick={() => setShowGroupCreate(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <IoAddCircle className="text-2xl text-indigo-600" />
              </button>
            </div>
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => joinRoom(group._id, group.name)}
                  className={`cursor-pointer relative p-3 rounded-xl transition-all duration-200 ${
                    selectedRoom === group._id
                      ? "bg-indigo-50 border-l-4 border-indigo-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium  flex justify-between items-center  text-gray-700  gap">
                    <span>
                      {" "}
                      {group.groupIcon && (
                        <img
                          src={`  ${group.groupIcon}`}
                          alt="Profile"
                          className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                        />
                      )}
                      {group.name}
                    </span>
                    <span onClick={() => setGroupId(group._id)}>
                      {" "}
                      <MdMoreHoriz />{" "}
                    </span>
                  </p>
                  {groupId === group._id && (
                    <div className="  shadow-lg rounded-lg flex flex-col gap-3 p-5 bg-slate-500 w-25 absolute top-0 right-8">
                      <span
                        onClick={() => setGroupId(null)}
                        className="text-center text-white text-sm absolute top-0 right-1"
                      >
                        x
                      </span>
                      <button className="text-sm text-green-500 rounded-lg shadow  shadow-white px-2 py-1">
                        Invite
                      </button>
                      <button
                        onClick={() => handleGroupDelete(group._id)}
                        className="text-sm px-1 text-red-700 rounded-lg shadow  shadow-orange-400 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {showProfile && (
          <Connection user={selectedUser} close={() => setShowProfile(false)} />
        )}
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          {/* Chat Header - Fixed at top */}
          <div className="sticky   z-10 p-4 border-b bg-white">
            <h2 className="text-xl font-bold text-gray-800">
              {currentChat || "Select a chat"}
            </h2>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4"
          >
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.sender._id === userId ? "justify-end" : "justify-start"
                  } mb-4 relative`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[70%] ${
                      msg.sender._id === userId ? "flex-row-reverse" : ""
                    }`}
                  >
                    <img
                      onClick={() => hanldeShowProfile(msg.sender._id)}
                      src={` ${msg.sender.profilePicture}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                    />
                    <div
                      className={`px-3 rounded-lg ${
                        msg.sender._id === userId
                          ? "bg-indigo-400 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm text-[10px] font-medium mb-1">
                        {msg.sender.name}
                      </p>
                      {editingMessage === msg._id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            defaultValue={msg.content}
                            className="px-2 py-1 rounded text-black"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateMessage(msg._id, e.target.value);
                              }
                            }}
                          />

                          <button
                            onClick={() => setEditingMessage(null)}
                            className="text-xs bg-red-500 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <p
                            className={
                              msg.sender._id === userId
                                ? "text-white"
                                : "text-gray-700"
                            }
                          >
                            {msg.isDeleted ? "Message deleted" : msg.content}
                            <p className="text-sm text-slate-600 opacity-40">
                              {" "}
                              {!msg.isEdited
                                ? `${formatDistanceToNow(
                                    new Date(msg.createdAt)
                                  )} ago`
                                : ""}
                            </p>
                          </p>
                          {!msg.isDeleted &&
                            (msg.isEdited
                              ? `Edited ${formatDistanceToNow(
                                  new Date(msg.editedAt)
                                )} ago`
                              : "")}
                        </>
                      )}

                      {/* File Preview Section */}
                      {msg.file && !msg.isDeleted && (
                        <div className="mt-2">
                          {/* Image, video, audio, and PDF previews */}
                          {msg.fileType === "image" && (
                            <img
                              src={` ${msg.file}`}
                              alt="Preview"
                              className="max-w-60 h-[30vh] cursor-pointer"
                              onClick={() =>
                                window.open(` ${msg.file}`, "_blank")
                              }
                            />
                          )}
                          {msg.fileType === "video" && (
                            <video
                              controls
                              className="max-w-full h-auto cursor-pointer"
                              onClick={() =>
                                window.open(` ${msg.file}`, "_blank")
                              }
                            >
                              <source src={` ${msg.file}`} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {msg.fileType === "audio" && (
                            <audio controls className="cursor-pointer">
                              <source src={` ${msg.file}`} type="audio/mpeg" />
                              Your browser does not support the audio tag.
                            </audio>
                          )}
                          {msg.fileType === "pdf" && (
                            <a
                              href={` ${msg.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      )}

                      {/* Delete Button */}

                      {!msg.isDeleted && msg.sender._id === userId && (
                        <div className="relative   z-10">
                          <div
                            onClick={() => handleMore(msg._id)}
                            className=" relative rounded-full cursor-pointer transition-colors"
                          >
                            <MdMoreHoriz className="text-gray-600 text-xl hover:text-white" />
                          </div>{" "}
                        </div>
                      )}

                      {moreId === msg._id && (
                        <div className="absolute top-8 z-20 right-5 bg-white rounded-lg shadow-lg border border-gray-200 w-24 overflow-hidden">
                          <button
                            onClick={() => {
                              setEditingMessage(msg._id), setMoreId(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                          >
                            <MdEdit className="text-lg" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteMessage(msg._id), setMoreId(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <MdDelete className="text-lg" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Message Input */}
          <div className="sticky bottom-0 p-4 border-t bg-white">
            <div className="flex gap-3 items-center">
              <label
                htmlFor="file-upload"
                className="rounded-full p-2 border border-green-500 bg-green-200 bg-opacity-50"
              >
                <MdAttachment size={24} cursor={"pointer"} />
              </label>
              <input
                type="file"
                id="file-upload"
                style={{ display: "none" }}
                onChange={handleFileChange} // Only use onChange to set the file
              />

              <input
                type="text"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={!selectedRoom}
              />
              <button onClick={toggleEmojiPicker}>😊</button>
              {showEmojiPicker && (
                <div
                  style={{ position: "absolute", bottom: "60px", zIndex: 1000 }}
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    pickerStyle={{ width: "300px" }}
                  />
                </div>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!selectedRoom}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400"
              >
                <IoSend className="text-xl" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Online Users (Desktop) */}
        <div className="hidden lg:block w-72 bg-white border-l border-gray-200 h-full overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Online Users</h2>
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                {onlineUsers.length}
              </span>
            </div>
            <div className="space-y-2">
              {onlineUsers.map((user, index) => (
                <div
                  key={index}
                  onClick={() =>
                    joinRoom(generateRoomId(userId, user._id), user.name)
                  }
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 ${
                    selectedRoom === generateRoomId(userId, user._id)
                      ? "bg-indigo-50 border-l-4 border-indigo-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {user.profilePicture && (
                    <img
                      onClick={() => hanldeShowProfile(user._id)}
                      src={` ${user.profilePicture}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-700">{user.name}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-500">Online</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Panels */}
      <AnimatePresence>
        {activeMobilePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setActiveMobilePanel(null)}
          >
            <motion.div
              initial={{ x: activeMobilePanel === "groups" ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{
                x: activeMobilePanel === "groups" ? "-100%" : "100%",
              }}
              className={`absolute ${
                activeMobilePanel === "groups" ? "left-0" : "right-0"
              } top-0 bottom-0 w-80 bg-white p-4`}
              onClick={(e) => e.stopPropagation()}
            >
              {activeMobilePanel === "groups" ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Groups</h2>
                    <button
                      onClick={() => setShowGroupCreate(true)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <IoAddCircle className="text-2xl text-indigo-600" />
                    </button>
                    <button
                      onClick={() => setActiveMobilePanel(null)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <IoClose className="text-2xl text-gray-700" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {groups.map((group) => (
                      <div
                        key={group._id}
                        onClick={() => {
                          joinRoom(group._id, group.name);
                          setActiveMobilePanel(null);
                        }}
                        className={`cursor-pointer p-3 rounded-xl mb-2 ${
                          selectedRoom === group._id
                            ? "bg-indigo-50 border-l-4 border-indigo-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <p className="font-medium text-gray-700">
                          {group.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      Online Users
                    </h2>
                    <button
                      onClick={() => setActiveMobilePanel(null)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <IoClose className="text-2xl text-gray-700" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {onlineUsers.map((user, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          joinRoom(generateRoomId(userId, user._id), user.name);
                          setActiveMobilePanel(null);
                        }}
                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl mb-2 ${
                          selectedRoom === generateRoomId(userId, user._id)
                            ? "bg-indigo-50 border-l-4 border-indigo-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {user.profilePicture && (
                          <img
                            onClick={() => hanldeShowProfile(user._id)}
                            src={` ${user.profilePicture}`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-700">
                            {user.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-500">
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showGroupCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Create New Group
                </h3>

                <button
                  onClick={() => setShowGroupCreate(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <IoClose className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                      {groupIcon ? (
                        <img
                          src={URL.createObjectURL(groupIcon)}
                          alt="Group Icon"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <BsImage className="text-3xl text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGroupIconChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Group name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGroup}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700"
                  type="submit"
                >
                  Create Group
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;