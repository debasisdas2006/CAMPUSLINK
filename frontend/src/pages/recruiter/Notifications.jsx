import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  UserPlus,
  Video,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./Notifications.css";

const NOTIFICATIONS_KEY = "campuslink_notifications";

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(NOTIFICATIONS_KEY) || "[]"
      );

      const recruiterEmail = String(user?.email || "")
        .trim()
        .toLowerCase();

      const filtered = Array.isArray(saved)
        ? saved
            .filter((notification) => {
              const notificationUser = String(
                notification.userEmail ||
                  notification.userId ||
                  ""
              )
                .trim()
                .toLowerCase();

              return notificationUser === recruiterEmail;
            })
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
            )
        : [];

      setNotifications(filtered);
    } catch (error) {
      console.error("Could not load recruiter notifications:", error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener(
      "campuslink_notification_updated",
      handleUpdate
    );

    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(
        "campuslink_notification_updated",
        handleUpdate
      );

      window.removeEventListener("storage", handleUpdate);
    };
  }, [user?.email]);

  const markAsRead = (notificationId) => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(NOTIFICATIONS_KEY) || "[]"
      );

      const updated = saved.map((notification) =>
        notification.notificationId === notificationId
          ? { ...notification, read: true }
          : notification
      );

      localStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updated)
      );

      loadNotifications();
    } catch (error) {
      console.error("Could not mark notification as read:", error);
    }
  };

  const markAllAsRead = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(NOTIFICATIONS_KEY) || "[]"
      );

      const recruiterEmail = String(user?.email || "")
        .trim()
        .toLowerCase();

      const updated = saved.map((notification) => {
        const notificationUser = String(
          notification.userEmail ||
            notification.userId ||
            ""
        )
          .trim()
          .toLowerCase();

        if (notificationUser === recruiterEmail) {
          return {
            ...notification,
            read: true,
          };
        }

        return notification;
      });

      localStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updated)
      );

      loadNotifications();
    } catch (error) {
      console.error(
        "Could not mark all notifications as read:",
        error
      );
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "JOB_APPLICATION_RECEIVED":
        return <UserPlus size={22} />;

      case "INTERVIEW_SCHEDULED":
      case "INTERVIEW_RESCHEDULED":
        return <Clock3 size={22} />;

      case "INTERVIEW_COMPLETED":
        return <Video size={22} />;

      case "JOB_SELECTED":
        return <CheckCircle2 size={22} />;

      default:
        return <FileText size={22} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "JOB_APPLICATION_RECEIVED":
        return "New Application";

      case "INTERVIEW_SCHEDULED":
        return "Interview Scheduled";

      case "INTERVIEW_RESCHEDULED":
        return "Interview Rescheduled";

      case "INTERVIEW_COMPLETED":
        return "Interview Completed";

      case "JOB_SELECTED":
        return "Selection Update";

      default:
        return "Notification";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="recruiter-notifications-page">
      <div className="recruiter-notifications-header">
        <div>
          <div className="notifications-title-row">
            <Bell size={28} />
            <h1>Notifications</h1>
          </div>

          <p>
            Stay updated about applications, interviews and
            candidate activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="mark-all-read-btn"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-summary">
        <div className="notification-summary-card">
          <span>Total Notifications</span>
          <strong>{notifications.length}</strong>
        </div>

        <div className="notification-summary-card unread">
          <span>Unread</span>
          <strong>{unreadCount}</strong>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="notifications-empty">
          <Bell size={48} />

          <h2>No notifications yet</h2>

          <p>
            New student applications and interview updates
            will appear here.
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.notificationId}
              className={`notification-card ${
                notification.read ? "read" : "unread"
              }`}
              onClick={() =>
                !notification.read &&
                markAsRead(notification.notificationId)
              }
            >
              <div className="notification-icon">
                {getIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-top">
                  <span className="notification-type">
                    {getTypeLabel(notification.type)}
                  </span>

                  {!notification.read && (
                    <span className="unread-dot">
                      New
                    </span>
                  )}
                </div>

                <h3>{notification.title}</h3>

                <p>{notification.message}</p>

                <span className="notification-date">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;