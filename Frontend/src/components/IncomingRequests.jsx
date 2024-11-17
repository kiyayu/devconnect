import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../auth";

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const token = getToken();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }
    fetchRequestsAndFriends();
  }, []);

  const fetchRequestsAndFriends = async () => {
    setLoading(true);
    setError("");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // First, get the user's ID from the auth token
      const userResponse = await axios.get(`${API_URL}/api/auth/me`, config);
      const userId = userResponse.data._id;

      // Then fetch requests and friends
      const [requestsResponse, friendsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/connections/requests/pending`, config),
        axios.get(`${API_URL}/api/connections/${userId}/friends`, config),
      ]);

      setRequests(requestsResponse.data || []);
      setFriends(friendsResponse.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      let errorMessage = "Failed to load friend requests and friends list";

      if (err.response) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        errorMessage = "Network error - please check your connection";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requesterId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/api/connections/${requesterId}/accept`,
        {},
        config
      );

      if (response.status === 200) {
        setRequests((prev) => prev.filter((req) => req._id !== requesterId));
        showAlert("Friend request accepted successfully!");
        fetchRequestsAndFriends(); // Refresh the lists
      }
    } catch (err) {
      console.error("Accept Error:", err);
      setError("Failed to accept friend request. Please try again.");
    }
  };

  const handleReject = async (requesterId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.delete(
        `${API_URL}/api/connections/${requesterId}/remove`,
        config
      );

      if (response.status === 200) {
        setRequests((prev) => prev.filter((req) => req._id !== requesterId));
        showAlert("Friend request rejected successfully");
        fetchRequestsAndFriends(); // Refresh the lists
      }
    } catch (err) {
      console.error("Reject Error:", err);
      setError("Failed to reject friend request. Please try again.");
    }
  };

  const showAlert = (message) => {
    setAlertMessage(message);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {alertMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={fetchRequestsAndFriends}
            className="ml-4 text-sm underline hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incoming Requests Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
            Incoming Friend Requests
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({requests.length})
            </span>
          </h2>

          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending friend requests</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {requests.map((request) => (
                <li
                  key={request._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={request.profilePicture || "/default-avatar.png"}
                      alt={request.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {request.name}
                      </h3>
                      <p className="text-sm text-gray-500">Wants to connect</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Friends List Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
            Your Friends
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

          {filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm
                  ? "No friends found matching your search"
                  : "No friends yet"}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredFriends.map((friend) => (
                <li
                  key={friend._id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={friend.profilePicture || "/default-avatar.png"}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-800">{friend.name}</h3>
                    <p className="text-sm text-gray-500">Connected</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomingRequests;
