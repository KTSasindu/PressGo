import { useEffect, useRef, useState } from "react";
import apiClient from "../api/apiClient.js";
import { isAuthenticated } from "../utils/authStorage.js";
import NotificationPanel from "./NotificationPanel.jsx";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const containerRef = useRef(null);
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (!authenticated) {
      setNotifications([]);
      setLoading(false);
      setError("");
      setIsOpen(false);
      return undefined;
    }

    let isMounted = true;

    const fetchNotifications = async (showLoader = true) => {
      try {
        if (isMounted && showLoader) {
          setLoading(true);
          setError("");
        }

        const response = await apiClient.get("/notifications/my");

        if (isMounted) {
          const sortedNotifications = [...(response.data?.notifications || [])]
            .sort(
              (firstNotification, secondNotification) =>
                new Date(secondNotification?.createdAt || 0).getTime() -
                new Date(firstNotification?.createdAt || 0).getTime()
            );
          setNotifications(sortedNotifications);
        }
      } catch (fetchError) {
        console.error(fetchError);

        if (isMounted) {
          setError("Unable to load notifications right now.");
        }
      } finally {
        if (isMounted && showLoader) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
    const intervalId = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [authenticated]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setUpdatingId(notificationId);
      setError("");

      await apiClient.patch(`/notifications/${notificationId}/read`);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (updateError) {
      console.error(updateError);
      setError(updateError.response?.data?.message || "Unable to update notification.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/notifications/my");
      const sortedNotifications = [...(response.data?.notifications || [])].sort(
        (firstNotification, secondNotification) =>
          new Date(secondNotification?.createdAt || 0).getTime() -
          new Date(firstNotification?.createdAt || 0).getTime()
      );
      setNotifications(sortedNotifications);
    } catch (refreshError) {
      console.error(refreshError);
      setError(
        refreshError.response?.data?.message ||
          "Unable to refresh notifications right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification?.isRead
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      setMarkingAllAsRead(true);
      setError("");

      await Promise.all(
        unreadNotifications.map((notification) =>
          apiClient.patch(`/notifications/${notification.id}/read`)
        )
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (updateError) {
      console.error(updateError);
      setError(
        updateError.response?.data?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  const unreadCount = notifications.filter(
    (notification) => !notification?.isRead
  ).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-white transition hover:border-aqua/40 hover:bg-white/10"
        aria-label="Toggle notifications"
        aria-expanded={isOpen}
      >
        <span aria-hidden="true">🔔</span>

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border border-slate-950/60 bg-coral px-1.5 text-[11px] font-semibold text-slate-950">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          error={error}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onRefresh={handleRefresh}
          updatingId={updatingId}
          markingAllAsRead={markingAllAsRead}
        />
      ) : null}
    </div>
  );
}

export default NotificationBell;
