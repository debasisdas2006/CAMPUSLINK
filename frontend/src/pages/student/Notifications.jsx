import {
  Bell,
  CheckCircle2,
  XCircle,
  CalendarDays,
  BriefcaseBusiness,
  Video,
  Clock3,
  Trash2,
  CheckCheck,
  Info,
  Users,
  UserCheck,
  UserRound,
  Building2,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import "./Notifications.css";

/* =========================================================
   STORAGE
========================================================= */

const NOTIFICATIONS_KEY =
  "campuslink_notifications";

/* =========================================================
   NOTIFICATION TYPES
========================================================= */

const NOTIFICATION_TYPES = {
  JOB_APPLICATION_RECEIVED:
    "JOB_APPLICATION_RECEIVED",

  APPLICATION_ACCEPTED:
    "APPLICATION_ACCEPTED",

  APPLICATION_REJECTED:
    "APPLICATION_REJECTED",

  INTERVIEW_SCHEDULED:
    "INTERVIEW_SCHEDULED",

  INTERVIEW_RESCHEDULED:
    "INTERVIEW_RESCHEDULED",

  INTERVIEW_CANCELLED:
    "INTERVIEW_CANCELLED",

  INTERVIEW_COMPLETED:
    "INTERVIEW_COMPLETED",

  JOB_SELECTED:
    "JOB_SELECTED",

  JOB_REJECTED:
    "JOB_REJECTED",
};

/* =========================================================
   TYPE CONFIG
========================================================= */

const TYPE_CONFIG = {
  APPLICATION_ACCEPTED: {
    title: "Application Accepted",
    icon: CheckCircle2,
    className: "notification-success",
  },

  APPLICATION_REJECTED: {
    title: "Application Rejected",
    icon: XCircle,
    className: "notification-danger",
  },

  INTERVIEW_SCHEDULED: {
    title: "Interview Scheduled",
    icon: CalendarDays,
    className: "notification-info",
  },

  INTERVIEW_RESCHEDULED: {
    title: "Interview Rescheduled",
    icon: CalendarDays,
    className: "notification-info",
  },

  INTERVIEW_CANCELLED: {
    title: "Interview Cancelled",
    icon: XCircle,
    className: "notification-danger",
  },

  INTERVIEW_COMPLETED: {
    title: "Interview Completed",
    icon: Video,
    className: "notification-purple",
  },

  JOB_SELECTED: {
    title: "Congratulations!",
    icon: CheckCircle2,
    className: "notification-selected",
  },

  JOB_REJECTED: {
    title: "Application Update",
    icon: XCircle,
    className: "notification-danger",
  },

  JOB_APPLICATION_RECEIVED: {
    title: "Application Update",
    icon: BriefcaseBusiness,
    className: "notification-info",
  },
};

/* =========================================================
   DEMO NOTIFICATIONS
========================================================= */

const DEMO_NOTIFICATIONS = [
  {
    notificationId:
      "NOTIF-DEMO-001",

    userId:
      "student@campuslink.com",

    type:
      NOTIFICATION_TYPES.APPLICATION_ACCEPTED,

    title:
      "Application Accepted",

    message:
      "Your application for Python Developer at Tech Solutions has been accepted by the recruiter.",

    jobId:
      "JOB-001",

    applicationId:
      "APP-DEMO-001",

    read: false,

    createdAt:
      "2026-09-29T10:30:00.000Z",
  },

  {
    notificationId:
      "NOTIF-DEMO-002",

    userId:
      "student@campuslink.com",

    type:
      NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,

    title:
      "Interview Scheduled",

    message:
      "Your interview for Python Developer at Tech Solutions has been scheduled for 05 October 2026 at 10:00 AM.",

    jobId:
      "JOB-001",

    applicationId:
      "APP-DEMO-001",

    read: false,

    createdAt:
      "2026-09-30T08:30:00.000Z",
  },

  {
    notificationId:
      "NOTIF-DEMO-003",

    userId:
      "student@campuslink.com",

    type:
      NOTIFICATION_TYPES.INTERVIEW_COMPLETED,

    title:
      "Interview Completed",

    message:
      "Your AI interview session has been completed. Your interview performance is now available for review.",

    jobId:
      "JOB-001",

    applicationId:
      "APP-DEMO-001",

    read: true,

    createdAt:
      "2026-09-30T14:20:00.000Z",
  },
];

/* =========================================================
   LOAD NOTIFICATIONS
========================================================= */

function loadNotifications(user) {
  try {
    const saved =
      JSON.parse(
        localStorage.getItem(
          NOTIFICATIONS_KEY
        ) || "[]"
      );

    const notifications =
      Array.isArray(saved)
        ? saved
        : [];

    const userEmail =
      String(
        user?.email || ""
      )
        .trim()
        .toLowerCase();

    const userNotifications =
      notifications.filter(
        (notification) => {
          const notificationUser =
            String(
              notification?.userId ||
                notification?.userEmail ||
                ""
            )
              .trim()
              .toLowerCase();

          return (
            notificationUser ===
            userEmail
          );
        }
      );

    /*
      Demo notifications are shown
      only for the demo student when
      there are no real notifications.
    */

    if (
      userNotifications.length === 0 &&
      userEmail ===
        "student@campuslink.com"
    ) {
      return DEMO_NOTIFICATIONS;
    }

    return userNotifications;
  } catch (error) {
    console.error(
      "Could not load notifications:",
      error
    );

    return [];
  }
}

/* =========================================================
   SAVE NOTIFICATIONS
========================================================= */

function saveNotifications(
  notifications
) {
  try {
    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(
        notifications
      )
    );

    window.dispatchEvent(
      new Event(
        "campuslink_notification_updated"
      )
    );
  } catch (error) {
    console.error(
      "Could not save notifications:",
      error
    );
  }
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatNotificationDate(
  dateValue
) {
  if (!dateValue) {
    return "—";
  }

  try {
    const date =
      new Date(dateValue);

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "—";
  }
}

/* =========================================================
   FORMAT JOINING DATE
========================================================= */

function formatJoiningDate(
  dateValue
) {
  if (!dateValue) {
    return "—";
  }

  try {
    const date =
      new Date(
        `${dateValue}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  } catch {
    return dateValue;
  }
}

/* =========================================================
   FINAL DECISION DETAILS
========================================================= */

function FinalDecisionDetails({
  notification,
}) {
  const isSelected =
    notification?.type ===
    NOTIFICATION_TYPES.JOB_SELECTED;

  const isRejected =
    notification?.type ===
    NOTIFICATION_TYPES.JOB_REJECTED;

  if (!isSelected && !isRejected) {
    return null;
  }

  const finalDecision =
    notification?.finalDecision ||
    {};

  const jobRole =
    finalDecision?.jobRole ||
    notification?.jobTitle ||
    "—";

  const companyName =
    notification?.companyName ||
    "—";

  /* =======================================================
     SELECTED
  ======================================================= */

  if (isSelected) {
    return (
      <div className="final-notification-details">
        <div className="final-notification-details-header">
          <CheckCircle2
            size={19}
          />

          <div>
            <h4>
              Selection Details
            </h4>

            <p>
              You have been selected
              for this position.
            </p>
          </div>
        </div>

        <div className="final-notification-details-grid">
          <div className="final-notification-detail-item">
            <BriefcaseBusiness
              size={17}
            />

            <div>
              <span>
                Job Role
              </span>

              <strong>
                {jobRole}
              </strong>
            </div>
          </div>

          <div className="final-notification-detail-item">
            <Building2
              size={17}
            />

            <div>
              <span>
                Company
              </span>

              <strong>
                {companyName}
              </strong>
            </div>
          </div>

          <div className="final-notification-detail-item">
            <Users
              size={17}
            />

            <div>
              <span>
                Team
              </span>

              <strong>
                {finalDecision?.teamName ||
                  "—"}
              </strong>
            </div>
          </div>

          <div className="final-notification-detail-item">
            <Users
              size={17}
            />

            <div>
              <span>
                Team Size
              </span>

              <strong>
                {finalDecision?.teamSize ||
                  "—"}
              </strong>
            </div>
          </div>

          <div className="final-notification-detail-item">
            <UserCheck
              size={17}
            />

            <div>
              <span>
                Team Leader
              </span>

              <strong>
                {finalDecision?.teamLeaderName ||
                  "—"}
              </strong>
            </div>
          </div>

          <div className="final-notification-detail-item">
            <UserRound
              size={17}
            />

            <div>
              <span>
                Your Role
              </span>

              <strong>
                {finalDecision?.teamRole ||
                  "—"}
              </strong>
            </div>
          </div>

          <div className="final-notification-detail-item">
            <CalendarDays
              size={17}
            />

            <div>
              <span>
                Joining Date
              </span>

              <strong>
                {formatJoiningDate(
                  finalDecision?.joiningDate
                )}
              </strong>
            </div>
          </div>

          {finalDecision?.additionalDetails && (
            <div className="final-notification-detail-item final-notification-full-width">
              <Info
                size={17}
              />

              <div>
                <span>
                  Additional Information
                </span>

                <strong className="final-notification-multiline">
                  {
                    finalDecision.additionalDetails
                  }
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =======================================================
     REJECTED
  ======================================================= */

  return (
    <div className="final-notification-details final-notification-rejected">
      <div className="final-notification-details-header">
        <XCircle
          size={19}
        />

        <div>
          <h4>
            Application Update
          </h4>

          <p>
            Your application was not
            selected for this position.
          </p>
        </div>
      </div>

      <div className="final-notification-details-grid">
        <div className="final-notification-detail-item">
          <BriefcaseBusiness
            size={17}
          />

          <div>
            <span>
              Job Role
            </span>

            <strong>
              {jobRole}
            </strong>
          </div>
        </div>

        <div className="final-notification-detail-item">
          <Building2
            size={17}
          />

          <div>
            <span>
              Company
            </span>

            <strong>
              {companyName}
            </strong>
          </div>
        </div>

        <div className="final-notification-detail-item final-notification-full-width">
          <XCircle
            size={17}
          />

          <div>
            <span>
              Reason for Rejection
            </span>

            <strong className="final-notification-multiline">
              {notification?.rejectionReason ||
                finalDecision?.rejectionReason ||
                "No reason was provided."}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATION CARD
========================================================= */

function NotificationCard({
  notification,
  onRead,
  isExpanded,
  onToggleDetails,
}) {
  const type =
    String(
      notification?.type ||
        "JOB_APPLICATION_RECEIVED"
    )
      .trim()
      .toUpperCase();

  const config =
    TYPE_CONFIG[type] ||
    TYPE_CONFIG.JOB_APPLICATION_RECEIVED;

  const NotificationIcon =
    config.icon;

  const hasFinalDecisionDetails =
    type ===
      NOTIFICATION_TYPES.JOB_SELECTED ||
    type ===
      NOTIFICATION_TYPES.JOB_REJECTED;

  return (
    <div
      className={`notification-card ${
        notification?.read
          ? "notification-read"
          : "notification-unread"
      } ${
        hasFinalDecisionDetails
          ? "notification-final-decision"
          : ""
      }`}
      onClick={() => {
        if (!notification?.read) {
          onRead(
            notification.notificationId
          );
        }

        if (hasFinalDecisionDetails) {
          onToggleDetails(
            notification.notificationId
          );
        }
      }}
    >
      {/* ICON */}

      <div
        className={`notification-icon ${config.className}`}
      >
        <NotificationIcon
          size={21}
        />
      </div>

      {/* CONTENT */}

      <div className="notification-content">
        <div className="notification-top-row">
          <h3>
            {notification?.title ||
              config.title}
          </h3>

          {!notification?.read && (
            <span className="unread-dot" />
          )}
        </div>

        <p className="notification-message">
          {notification?.message ||
            "You have a new notification."}
        </p>

        <div className="notification-meta">
          <Clock3
            size={13}
          />

          <span>
            {formatNotificationDate(
              notification?.createdAt
            )}
          </span>
        </div>

        {hasFinalDecisionDetails && (
          <div className="final-notification-action">
            {isExpanded
              ? "Hide details"
              : "Click to view details"}
          </div>
        )}

        {hasFinalDecisionDetails &&
          isExpanded && (
            <FinalDecisionDetails
              notification={
                notification
              }
            />
          )}
      </div>

      {/* READ STATUS */}

      <div className="notification-status">
        {notification?.read ? (
          <span className="read-label">
            Read
          </span>
        ) : (
          <span className="new-label">
            New
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

function Notifications() {
  const {
    user,
  } = useAuth();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    expandedNotificationId,
    setExpandedNotificationId,
  ] = useState(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const refreshNotifications = () => {
    const loaded =
      loadNotifications(user);

    setNotifications(
      loaded
    );
  };

  useEffect(() => {
    refreshNotifications();
  }, [
    user?.email,
  ]);

  /* =======================================================
     LISTEN FOR UPDATES
  ======================================================= */

  useEffect(() => {
    const handleUpdate = () => {
      refreshNotifications();
    };

    window.addEventListener(
      "campuslink_notification_updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "campuslink_notification_updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, [
    user?.email,
  ]);

  /* =======================================================
     TOGGLE FINAL DECISION DETAILS
  ======================================================= */

  const toggleDetails = (
    notificationId
  ) => {
    setExpandedNotificationId(
      (previous) =>
        previous === notificationId
          ? null
          : notificationId
    );
  };

  /* =======================================================
     MARK ONE AS READ
  ======================================================= */

  const markAsRead = (
    notificationId
  ) => {
    const updated =
      notifications.map(
        (notification) => {
          if (
            notification.notificationId !==
            notificationId
          ) {
            return notification;
          }

          return {
            ...notification,
            read: true,
          };
        }
      );

    setNotifications(
      updated
    );

    /*
      Save only real notifications.
      Demo notifications remain available
      until the application workflow creates
      real notification records.
    */

    try {
      const existing =
        JSON.parse(
          localStorage.getItem(
            NOTIFICATIONS_KEY
          ) || "[]"
        );

      const safeExisting =
        Array.isArray(existing)
          ? existing
          : [];

      const merged =
        safeExisting.map(
          (notification) => {
            if (
              notification.notificationId ===
              notificationId
            ) {
              return {
                ...notification,
                read: true,
              };
            }

            return notification;
          }
        );

      if (
        merged.some(
          (item) =>
            item.notificationId ===
            notificationId
        )
      ) {
        saveNotifications(
          merged
        );
      }
    } catch (error) {
      console.error(
        "Could not update notification:",
        error
      );
    }
  };

  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  const markAllAsRead = () => {
    const updated =
      notifications.map(
        (notification) => ({
          ...notification,
          read: true,
        })
      );

    setNotifications(
      updated
    );

    try {
      const existing =
        JSON.parse(
          localStorage.getItem(
            NOTIFICATIONS_KEY
          ) || "[]"
        );

      const safeExisting =
        Array.isArray(existing)
          ? existing
          : [];

      const userEmail =
        String(
          user?.email || ""
        )
          .trim()
          .toLowerCase();

      const merged =
        safeExisting.map(
          (notification) => {
            const notificationUser =
              String(
                notification?.userId ||
                  notification?.userEmail ||
                  ""
              )
                .trim()
                .toLowerCase();

            if (
              notificationUser ===
              userEmail
            ) {
              return {
                ...notification,
                read: true,
              };
            }

            return notification;
          }
        );

      if (
        merged.length > 0
      ) {
        saveNotifications(
          merged
        );
      }
    } catch (error) {
      console.error(
        "Could not mark all notifications as read:",
        error
      );
    }
  };

  /* =======================================================
     CLEAR READ NOTIFICATIONS
  ======================================================= */

  const clearReadNotifications = () => {
    const remaining =
      notifications.filter(
        (notification) =>
          !notification?.read
      );

    setNotifications(
      remaining
    );

    const existing =
      JSON.parse(
        localStorage.getItem(
          NOTIFICATIONS_KEY
        ) || "[]"
      );

    const safeExisting =
      Array.isArray(existing)
        ? existing
        : [];

    const userEmail =
      String(
        user?.email || ""
      )
        .trim()
        .toLowerCase();

    const remainingStored =
      safeExisting.filter(
        (notification) => {
          const notificationUser =
            String(
              notification?.userId ||
                notification?.userEmail ||
                ""
            )
              .trim()
              .toLowerCase();

          return (
            notificationUser !==
              userEmail ||
            !notification?.read
          );
        }
      );

    saveNotifications(
      remainingStored
    );

    setExpandedNotificationId(
      null
    );
  };

  /* =======================================================
     COUNTS
  ======================================================= */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification?.read
    ).length;

  const readCount =
    notifications.filter(
      (notification) =>
        notification?.read
    ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="notifications-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="notifications-header">
        <div>
          <p className="notifications-eyebrow">
            CAMPUSLINK UPDATES
          </p>

          <h1>
            Notifications
          </h1>

          <p className="notifications-description">
            Stay updated about your applications,
            interviews, and recruitment decisions.
          </p>
        </div>

        <div className="notifications-header-icon">
          <Bell
            size={26}
          />

          {unreadCount > 0 && (
            <span>
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="notification-summary">
        <div className="notification-summary-card">
          <div className="summary-icon">
            <Bell
              size={20}
            />
          </div>

          <div>
            <span>
              Total Notifications
            </span>

            <strong>
              {notifications.length}
            </strong>
          </div>
        </div>

        <div className="notification-summary-card">
          <div className="summary-icon unread-summary">
            <Info
              size={20}
            />
          </div>

          <div>
            <span>
              Unread
            </span>

            <strong>
              {unreadCount}
            </strong>
          </div>
        </div>

        <div className="notification-summary-card">
          <div className="summary-icon read-summary">
            <CheckCheck
              size={20}
            />
          </div>

          <div>
            <span>
              Read
            </span>

            <strong>
              {readCount}
            </strong>
          </div>
        </div>
      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      {notifications.length > 0 && (
        <div className="notification-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={
                markAllAsRead
              }
            >
              <CheckCheck
                size={16}
              />

              Mark all as read
            </button>
          )}

          {readCount > 0 && (
            <button
              type="button"
              className="clear-button"
              onClick={
                clearReadNotifications
              }
            >
              <Trash2
                size={16}
              />

              Clear read
            </button>
          )}
        </div>
      )}

      {/* =================================================
          NOTIFICATION LIST
      ================================================= */}

      <div className="notifications-section">
        <div className="notifications-section-header">
          <h2>
            Recent Notifications
          </h2>

          <span>
            {notifications.length}
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell
              size={42}
            />

            <h3>
              No notifications yet
            </h3>

            <p>
              You will receive notifications here
              when there are updates about your
              applications and interviews.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(
              (notification) => (
                <NotificationCard
                  key={
                    notification.notificationId
                  }
                  notification={
                    notification
                  }
                  onRead={
                    markAsRead
                  }
                  isExpanded={
                    expandedNotificationId ===
                    notification.notificationId
                  }
                  onToggleDetails={
                    toggleDetails
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;