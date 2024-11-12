import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getToken } from "../../auth";
import { getNotifications, markNotifications } from "../services/api";
export const NotificationContext = createContext();

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await  getNotifications(pageNum)

      const { notifications, pagination } = response.data;
      setNotifications((prev) =>
        pageNum === 1 ? notifications : [...prev, ...notifications]
      );
      setHasMore(pageNum < pagination.totalPages);
      setUnreadCount(notifications.filter((n) => !n.isRead).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = async () => {
    try {
      
      await markNotifications()

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchNotifications(page + 1);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        hasMore,
        markAllAsRead,
        loadMore,
        refreshNotifications: () => fetchNotifications(1),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
