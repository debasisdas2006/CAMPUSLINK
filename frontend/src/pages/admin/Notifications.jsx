import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  CalendarDays,
  BriefcaseBusiness,
  Video,
  Info,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import "./Notifications.css";

const STORAGE_KEY = "campuslink_notifications";

const readNotifications = () => {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const saveNotifications = (notifications) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notifications)
  );

  window.dispatchEvent(
    new Event("campuslink_notifications_updated")
  );
};

const getNotificationTitle = (notification) => {
  switch (notification?.type) {
    case "JOB_APPLICATION_RECEIVED":
      return "New Job Application";

    case "JOB_APPLICATION_ACCEPTED":
      return "Application Accepted";

    case "JOB_APPLICATION_REJECTED":
      return "Application Rejected";

    case "INTERVIEW_SCHEDULED":
      return "Interview Scheduled";

    case "INTERVIEW_RESCHEDULED":
      return "Interview Rescheduled";

    case "INTERVIEW_COMPLETED":
      return "Interview Completed";

    case "JOB_SELECTED":
      return "Student Selected";

    case "JOB_REJECTED":
      return "Student Rejected";

    default:
      return (
        notification?.title ||
        "CampusLink Notification"
      );
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "JOB_APPLICATION_RECEIVED":
      return <BriefcaseBusiness size={19} />;

    case "JOB_APPLICATION_ACCEPTED":
    case "JOB_SELECTED":
      return <CheckCircle2 size={19} />;

    case "JOB_APPLICATION_REJECTED":
    case "JOB_REJECTED":
      return <XCircle size={19} />;

    case "INTERVIEW_SCHEDULED":
    case "INTERVIEW_RESCHEDULED":
      return <CalendarDays size={19} />;

    case "INTERVIEW_COMPLETED":
      return <Video size={19} />;

    default:
      return <Info size={19} />;
  }
};

const getNotificationClass = (type) => {
  if (
    type === "JOB_SELECTED" ||
    type === "JOB_APPLICATION_ACCEPTED"
  ) {
    return "admin-notification-success";
  }

  if (
    type === "JOB_REJECTED" ||
    type === "JOB_APPLICATION_REJECTED"
  ) {
    return "admin-notification-danger";
  }

  if (
    type === "INTERVIEW_SCHEDULED" ||
    type === "INTERVIEW_RESCHEDULED"
  ) {
    return "admin-notification-interview";
  }

  return "admin-notification-info";
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
};

function Notifications() {
  const [notifications, setNotifications] =
    useState(readNotifications);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshNotifications = () => {
    setNotifications(readNotifications());
    setRefreshKey((value) => value + 1);
  };

  const markAllRead = () => {
    const updated = notifications.map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

    saveNotifications(updated);
    setNotifications(updated);
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map(
      (notification, index) => {
        const currentId =
          notification.id || `notification-${index}`;

        if (currentId !== notificationId) {
          return notification;
        }

        return {
          ...notification,
          read: true,
        };
      }
    );

    saveNotifications(updated);
    setNotifications(updated);
  };

  const deleteNotification = (notificationId) => {
    const updated = notifications.filter(
      (notification, index) => {
        const currentId =
          notification.id || `notification-${index}`;

        return currentId !== notificationId;
      }
    );

    saveNotifications(updated);
    setNotifications(updated);
  };

  const clearReadNotifications = () => {
    const updated = notifications.filter(
      (notification) => !notification.read
    );

    saveNotifications(updated);
    setNotifications(updated);
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications
      .filter((notification) => {
        if (filter === "UNREAD") {
          return !notification.read;
        }

        if (filter === "READ") {
          return notification.read;
        }

        if (filter === "APPLICATION") {
          return String(
            notification.type || ""
          ).includes("APPLICATION");
        }

        if (filter === "INTERVIEW") {
          return String(
            notification.type || ""
          ).includes("INTERVIEW");
        }

        if (filter === "SELECTION") {
          return (
            notification.type === "JOB_SELECTED" ||
            notification.type === "JOB_REJECTED"
          );
        }

        return true;
      })
      .filter((notification) => {
        if (!query) return true;

        const searchable = [
          getNotificationTitle(notification),
          notification.message,
          notification.type,
          notification.studentName,
          notification.studentEmail,
          notification.recruiterEmail,
          notification.jobTitle,
          notification.companyName,
          notification.reason,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
  }, [
    notifications,
    filter,
    search,
    refreshKey,
  ]);

  return (
    <div className="admin-notifications-page">
      <div className="admin-notifications-header">
        <div>
          <div className="admin-notifications-eyebrow">
            ADMIN / PLATFORM NOTIFICATIONS
          </div>

          <h1>Notifications</h1>

          <p>
            Monitor platform-wide application,
            interview and recruitment notifications.
          </p>
        </div>

        <button
          className="admin-notifications-refresh"
          onClick={refreshNotifications}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <section className="admin-notification-summary">
        <div className="admin-notification-summary-card">
          <div className="admin-summary-icon">
            <Bell size={21} />
          </div>

          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="admin-notification-summary-card">
          <div className="admin-summary-icon">
            <Info size={21} />
          </div>

          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="admin-notification-summary-card">
          <div className="admin-summary-icon">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <span>Applications</span>
            <strong>
              {
                notifications.filter((item) =>
                  String(item.type || "").includes(
                    "APPLICATION"
                  )
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="admin-notification-summary-card">
          <div className="admin-summary-icon">
            <Video size={21} />
          </div>

          <div>
            <span>Interview Events</span>
            <strong>
              {
                notifications.filter((item) =>
                  String(item.type || "").includes(
                    "INTERVIEW"
                  )
                ).length
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="admin-notifications-toolbar">
        <div className="admin-notification-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
        >
          <option value="ALL">All Notifications</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
          <option value="APPLICATION">
            Applications
          </option>
          <option value="INTERVIEW">
            Interviews
          </option>
          <option value="SELECTION">
            Selection / Rejection
          </option>
        </select>

        <button
          className="admin-notification-action"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={16} />
          Mark All Read
        </button>

        <button
          className="admin-notification-action danger"
          onClick={clearReadNotifications}
          disabled={
            notifications.every(
              (notification) => !notification.read
            )
          }
        >
          <Trash2 size={16} />
          Clear Read
        </button>
      </section>

      <section className="admin-notifications-panel">
        <div className="admin-notifications-panel-header">
          <div>
            <span>PLATFORM ACTIVITY</span>

            <h2>
              {filteredNotifications.length} Notifications
            </h2>
          </div>

          <Bell size={22} />
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="admin-notifications-empty">
            <Bell size={40} />

            <h3>No notifications found</h3>

            <p>
              Platform notifications will appear here
              when activity occurs.
            </p>
          </div>
        ) : (
          <div className="admin-notifications-list">
            {filteredNotifications.map(
              (notification, index) => {
                const notificationId =
                  notification.id ||
                  `notification-${index}`;

                return (
                  <article
                    key={notificationId}
                    className={`admin-notification-item ${
                      notification.read
                        ? "is-read"
                        : "is-unread"
                    }`}
                    onClick={() =>
                      markAsRead(notificationId)
                    }
                  >
                    <div
                      className={`admin-notification-icon ${getNotificationClass(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="admin-notification-content">
                      <div className="admin-notification-top">
                        <div>
                          <h3>
                            {getNotificationTitle(
                              notification
                            )}
                          </h3>

                          <span className="admin-notification-type">
                            {String(
                              notification.type ||
                                "SYSTEM"
                            )
                              .replaceAll("_", " ")
                              .toLowerCase()
                              .replace(
                                /\b\w/g,
                                (letter) =>
                                  letter.toUpperCase()
                              )}
                          </span>
                        </div>

                        <span className="admin-notification-time">
                          {formatDate(
                            notification.createdAt ||
                              notification.timestamp ||
                              notification.date
                          )}
                        </span>
                      </div>

                      <p>
                        {notification.message ||
                          notification.description ||
                          "No notification message available."}
                      </p>

                      <div className="admin-notification-meta">
                        {notification.studentName && (
                          <span>
                            Student:{" "}
                            <strong>
                              {notification.studentName}
                            </strong>
                          </span>
                        )}

                        {notification.studentEmail && (
                          <span>
                            Email:{" "}
                            <strong>
                              {notification.studentEmail}
                            </strong>
                          </span>
                        )}

                        {notification.jobTitle && (
                          <span>
                            Job:{" "}
                            <strong>
                              {notification.jobTitle}
                            </strong>
                          </span>
                        )}

                        {notification.companyName && (
                          <span>
                            Company:{" "}
                            <strong>
                              {notification.companyName}
                            </strong>
                          </span>
                        )}

                        {notification.reason && (
                          <span>
                            Reason:{" "}
                            <strong>
                              {notification.reason}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="admin-notification-controls">
                      {!notification.read && (
                        <span className="unread-dot"></span>
                      )}

                      <button
                        title="Mark as read"
                        onClick={(event) => {
                          event.stopPropagation();
                          markAsRead(notificationId);
                        }}
                      >
                        <CheckCheck size={16} />
                      </button>

                      <button
                        title="Delete notification"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteNotification(
                            notificationId
                          );
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Notifications;