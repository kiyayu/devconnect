// services/api.js
import axios from "axios";
import { getToken } from "../auth"; // Adjust the path based on your project structure

// Create an Axios instance with a base URL from environment variables
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Handle unauthorized errors globally
    if (error.response && error.response.status === 401) {
      // Redirect to login or show a notification
      // window.location.href = "/login";
      console.error("Unauthorized access - Redirecting to login.");
    }
    return Promise.reject(error);
  }
);

// Chat API calls

// Questions API calls
export const fetchQuestions = () => api.get("/questions");
export const fetchQuestionById = (id) => {
  if (!id) throw new Error("Question ID is required");
  return api.get(`/questions/${id}`);
};
export const createQuestion = (questionData) =>
  api.post("/questions", questionData);
export const deleteQuestion = (id) => {
  if (!id) throw new Error("Question ID is required");
  return api.delete(`/questions/${id}`);
};
export const updateQuestion = (id, updateData) => {
  if (!id) throw new Error("Question ID is required");
  return api.put(`/questions/${id}`, updateData);
};

// Add answer to a question
export const addAnswer = (questionId, formData) => {
  if (!questionId) throw new Error("Question ID is required");
  if (!(formData instanceof FormData)) throw new Error("FormData is required");
  return api.post(`/questions/${questionId}/answers`, formData);
};

export const reactToEntity = (reactionData) => {
  const { onModel, on, reactionType } = reactionData;

  if (!onModel || !on || !reactionType) {
    throw new Error("onModel, on, and reactionType are required");
  }

  return api.post("/reactions", reactionData);
};

// User authentication API calls
export const createUser = (formData) => {
  if (!(formData instanceof FormData)) throw new Error("FormData is required");
  return api.post("/auth/register", formData);
};
export const loginUser = (formData) => {
  if (!formData) throw new Error("Login data is required");
  return api.post("/auth/login", formData);
};

// Fetch user profile
export const userProfile = () => api.get("/auth/profile");

// Fetch user by ID
export const fetchUserById = (id) => {
  if (!id) throw new Error("User ID is required");
  return api.get(`/users/${id}`);
};

// services/api.js
export const fetchUsers = () => api.get("/auth/users");
export const fetchOnlineUsers = () => api.get("/auth/users");

// Fetch reactions for an entity
export const fetchReactions = (onModel, on) => {
  if (!onModel || !on) throw new Error("onModel and on are required");
  return api.get("/reactions", { params: { onModel, on } });
};

// Delete a reaction by ID
export const deleteReaction = (reactionId) => {
  if (!reactionId) throw new Error("Reaction ID is required");
  return api.delete(`/reactions/${reactionId}`);
};

// Fetch tags
export const fetchTags = () => api.get("/tags");

// Create a new tag
export const createTag = (tagdata) => api.post("/tags", tagdata);

// Update an existing tag
export const updateTag = ({id, tagData}) => {
  if (!id) throw new Error("Tag ID is required");
  return api.put(`/tags/${id}`, tagData);
};

// Delete a tag
export const deleteTag = (id) => {
  if (!id) throw new Error("Tag ID is required");
  return api.delete(`/tags/${id}`);
};

// Update user profile
export const updateUserProfile = (formData) => {
  return api.put("/auth/updateProfile", formData);
};

//get Notifications
export const getNotifications = (page) =>
  api.get(`/api/notifications?page=${page}`);
export const markNotifications = () => api.post("/api/notifications/read", {});

export default api;
