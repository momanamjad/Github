import React, { useState, useEffect, useRef } from "react";
import { BellIcon, CheckIcon } from "@primer/octicons-react";
import { apiClient } from "@/services/apiClient";
import { useGitHub } from "@/contexts/GitHubContext";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || 'https://gtihub-backend.vercel.app/api';
const SOCKET_URL = API_URL.replace('/api', '');

const NotificationCenter = () => {
  const { user } = useGitHub();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiClient("/users/notifications?page=1&limit=20");
      if (res) {
        // Handle response format from backend pagination response
        const notifs = res.data || [];
        setNotifications(notifs);
        setUnreadCount(res.unread || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    const userId = user._id || user.id;
    socket.emit('register', userId);

    socket.on('notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient(`/users/notifications/${id}`, {
        method: "PUT"
      });
      // Update state locally
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n =>
          apiClient(`/users/notifications/${n._id}`, { method: "PUT" })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins || 1}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-8 h-8 text-[#57606a] dark:text-[#8b949e] border border-[#C8D1DA] dark:border-[#30363d] hover:bg-[#D1D9E0] dark:hover:bg-[#30363d] hover:text-[#1f2328] dark:hover:text-white rounded-[9px] transition-colors cursor-pointer bg-transparent"
      >
        <BellIcon size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-[#f6f8fa] dark:ring-[#0d1117]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed sm:absolute top-[64px] sm:top-full right-0 sm:right-0 sm:mt-2 w-full sm:w-80 md:w-[320px] max-h-[calc(100vh-64px)] sm:max-h-[85vh] overflow-y-auto bg-white dark:bg-[#161b22] border-t sm:border border-github-border dark:border-[#30363d] sm:rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
          {/* Popover Arrow */}
          <div className="hidden sm:block absolute -top-2 right-3 w-4 h-4 bg-white dark:bg-[#161b22] border-l border-t border-github-border dark:border-[#30363d] transform rotate-45 z-40" />

          {/* Header */}
          <div className="px-4 py-3 border-b border-github-border dark:border-[#30363d] flex items-center justify-between bg-white dark:bg-[#161b22] relative z-50 rounded-t-xl">
            <span className="font-semibold text-xs text-[#1f2328] dark:text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-[#0969da] dark:text-[#58a6ff] hover:underline cursor-pointer flex items-center gap-1 font-medium bg-transparent border-0"
              >
                <CheckIcon size={12} />
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-github-border dark:divide-[#30363d] relative z-50 bg-white dark:bg-[#161b22] rounded-b-xl">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#57606a] dark:text-[#8b949e] bg-white dark:bg-[#161b22] rounded-b-xl">
                No notifications
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-3 flex items-start gap-2.5 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors ${
                    !item.isRead ? "bg-[#f2f8ff] dark:bg-[#1f242c]" : "bg-white dark:bg-[#161b22]"
                  }`}
                >
                  {/* Actor Avatar */}
                  <img
                    src={item.actor?.avatar_url || "https://github.com/identicons/guest.png"}
                    alt={item.actor?.login || "User"}
                    className="w-7 h-7 rounded-full object-cover border border-[#d0d7de] dark:border-[#30363d]"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1f2328] dark:text-[#c9d1d9] leading-tight">
                      <span className="font-semibold text-[#1f2328] dark:text-white">
                        {item.actor?.login || "Someone"}
                      </span>{" "}
                      {item.type === "star" && "starred your repository"}
                      {item.type === "follow" && "followed you"}
                      {item.type === "issue" && "opened an issue"}
                      {item.type === "comment" && "commented on an issue"}
                    </p>
                    <span className="text-[11px] text-[#57606a] dark:text-[#8b949e] mt-1 block">
                      {formatTime(item.created_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item._id)}
                      title="Mark as read"
                      className="p-1 text-[#57606a] dark:text-[#8b949e] hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:bg-gray-100 dark:hover:bg-[#21262d] rounded-md transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
                    >
                      <CheckIcon size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
