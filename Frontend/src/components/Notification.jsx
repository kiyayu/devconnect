import React, { useContext } from "react";
import { Link } from "react-router-dom"; // Import Link
import { NotificationContext } from "../context/NotificationContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import IncomingRequests from "./IncomingRequests";
const NotificationItem = ({ notification }) => {
  const navigate = useNavigate();
 

 
return  (
   
  <div className="p-4 border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center">
          {" "}
          {/* Flexbox for aligning profile and name */}
          <Link   >
            {" "}
            {/* Link to user profile */}
            <img
              src={` ${notification.user.profilePicture}`}
              alt="Profile"
              className="w-8 h-8 object-cover rounded-full border-2 border-gray-200 cursor-pointer" // Added cursor pointer
            />
          </Link>
          <Link to={`/${notification.user._id}`} className="ml-2">
            {" "}
            {/* Link to user profile */}
            <p className="cursor-pointer">{notification.user.name}</p>{" "}
            {/* Added cursor pointer */}
          </Link>
        </div>

        <span
          className={`text-sm ${
            notification.isRead ? "text-gray-500" : "text-black font-semibold"
          }`}
        >
          {notification.type}
        </span>
        <p className="mt-1 text-gray-800">{notification.contentSummary}</p>

        <span className="text-xs text-gray-500">
          {new Date(notification.createdAt).toLocaleDateString()}
        </span>
      </div>
      {!notification.isRead && (
        <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
      )}
    </div>
  </div>
)};

const Notification = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadMore,
    markAllAsRead,
  } = useContext(NotificationContext);
 
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-blue-500 hover:text-blue-600"
          >
            Mark all as read
          </button>
        )}
      </div>

      <InfiniteScroll
        dataLength={notifications.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="p-4 text-center">Loading...</div>}
        endMessage={
          <div className="p-4 text-center text-gray-500">
            No more notifications
          </div>
        }
      >
        {notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
          />
        ))}
      </InfiniteScroll>
      <IncomingRequests />

      {loading && notifications.length === 0 && (
        <div className="p-4 text-center">Loading notifications...</div>
      )}
    </div>
  );
};

export default Notification;
