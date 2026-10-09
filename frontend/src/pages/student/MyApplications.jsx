import { useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Video,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./MyApplications.css";

const APPLICATIONS_KEY =
  "campuslink_applications";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className: "pending",
  },

  ACCEPTED: {
    label: "Accepted",
    className: "accepted",
  },

  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    className: "interview-scheduled",
  },

  INTERVIEW_COMPLETED: {
    label: "Interview Completed",
    className: "interview-completed",
  },

  SELECTED: {
    label: "Selected",
    className: "selected",
  },

  REJECTED: {
    label: "Rejected",
    className: "rejected",
  },
};

function MyApplications() {
  const { user } = useAuth();

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =====================================================
     STORAGE
  ===================================================== */

  const loadApplications = () => {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            APPLICATIONS_KEY
          ) || "[]"
        );

      const studentEmail =
        String(
          user?.email || ""
        )
          .trim()
          .toLowerCase();

      const studentApplications =
        Array.isArray(saved)
          ? saved
              .filter(
                (application) => {
                  const applicationEmail =
                    String(
                      application.studentEmail ||
                      application.studentId ||
                      ""
                    )
                      .trim()
                      .toLowerCase();

                  return (
                    applicationEmail ===
                    studentEmail
                  );
                }
              )
              .sort(
                (a, b) =>
                  new Date(
                    b.appliedAt || 0
                  ) -
                  new Date(
                    a.appliedAt || 0
                  )
              )
          : [];

      setApplications(
        studentApplications
      );
    } catch (error) {
      console.error(
        "Could not load applications:",
        error
      );

      setApplications([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadApplications();

    const handleApplicationUpdate =
      () => {
        loadApplications();
      };

    const handleStorage = (event) => {
      if (
        event.key ===
        APPLICATIONS_KEY
      ) {
        loadApplications();
      }
    };

    window.addEventListener(
      "campuslink_application_updated",
      handleApplicationUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "campuslink_application_updated",
        handleApplicationUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [user?.email]);

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Not available";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatInterviewDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "Date not set";
    }

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
        weekday: "short",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     START INTERVIEW
  ===================================================== */

  const handleStartInterview = (
    application
  ) => {
    if (
      !application.interview
        ?.scheduled
    ) {
      return;
    }

    const date =
      application.interview.date;

    const time =
      application.interview.time;

    if (!date || !time) {
      alert(
        "Interview date and time are not available."
      );

      return;
    }

    const scheduledTime =
      new Date(
        `${date}T${time}`
      );

    if (
      Number.isNaN(
        scheduledTime.getTime()
      )
    ) {
      alert(
        "Invalid interview date or time."
      );

      return;
    }

    const now =
      new Date();

    /*
      Student can enter:
      - at interview time
      - up to 10 minutes early
    */

    const earliestJoinTime =
      new Date(
        scheduledTime.getTime() -
          10 * 60 * 1000
      );

    if (
      now < earliestJoinTime
    ) {
      alert(
        `Your interview starts at ${time} on ${formatInterviewDate(
          date
        )}. You can join up to 10 minutes before the scheduled time.`
      );

      return;
    }

    /*
      Do not allow joining after
      the full duration has expired.
    */

    const durationMinutes =
      Number(
        application.interview
          .duration || 30
      );

    const interviewEndTime =
      new Date(
        scheduledTime.getTime() +
          durationMinutes *
            60 *
            1000
      );

    if (
      now > interviewEndTime
    ) {
      alert(
        "This interview time has already ended."
      );

      return;
    }

    /*
      Save which application the
      student is starting.
    */

    localStorage.setItem(
      "campuslink_current_interview_application",
      JSON.stringify(
        application
      )
    );

    /*
      Navigate to existing
      working AI Interview page.
    */

    window.location.href =
      "/student/ai-interview";
  };

  /* =====================================================
     STATS
  ===================================================== */

  const totalApplications =
    applications.length;

  const pendingApplications =
    applications.filter(
      (item) =>
        item.status ===
        "PENDING"
    ).length;

  const acceptedApplications =
    applications.filter(
      (item) =>
        item.status ===
          "ACCEPTED" ||
        item.status ===
          "INTERVIEW_SCHEDULED" ||
        item.status ===
          "INTERVIEW_COMPLETED"
    ).length;

  const selectedApplications =
    applications.filter(
      (item) =>
        item.status ===
        "SELECTED"
    ).length;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="my-applications-page">

        <div className="applications-loading">
          <div className="applications-loading-spinner" />

          <p>
            Loading your applications...
          </p>
        </div>

      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="my-applications-page">

      {/* HEADER */}

      <div className="my-applications-header">

        <div>
          <div className="my-applications-eyebrow">
            STUDENT PORTAL
          </div>

          <h1>
            My Applications
          </h1>

          <p>
            Track every company and job
            application from one place.
          </p>
        </div>

        <div className="my-applications-header-icon">
          <Briefcase size={30} />
        </div>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="application-stat-grid">

        <div className="application-stat-card">

          <div className="application-stat-icon total">
            <Briefcase size={21} />
          </div>

          <div>
            <span>
              Total Applications
            </span>

            <strong>
              {totalApplications}
            </strong>
          </div>

        </div>

        <div className="application-stat-card">

          <div className="application-stat-icon pending">
            <Clock3 size={21} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingApplications}
            </strong>
          </div>

        </div>

        <div className="application-stat-card">

          <div className="application-stat-icon accepted">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>
              Accepted
            </span>

            <strong>
              {acceptedApplications}
            </strong>
          </div>

        </div>

        <div className="application-stat-card">

          <div className="application-stat-icon selected">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>
              Selected
            </span>

            <strong>
              {selectedApplications}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          APPLICATIONS
      ================================================= */}

      <section className="applications-section">

        <div className="applications-section-header">

          <div>
            <h2>
              Your Applications
            </h2>

            <p>
              Each company's application
              is tracked separately.
            </p>
          </div>

        </div>

        {applications.length ===
        0 ? (
          <div className="applications-empty">

            <Briefcase size={42} />

            <h3>
              No Applications Yet
            </h3>

            <p>
              When you apply for a job,
              your application will appear
              here.
            </p>

          </div>
        ) : (

          <div className="application-list">

            {applications.map(
              (application) => {

                const status =
                  application.status ||
                  "PENDING";

                const statusConfig =
                  STATUS_CONFIG[
                    status
                  ] ||
                  STATUS_CONFIG.PENDING;

                const isScheduled =
                  application
                    .interview
                    ?.scheduled;

                return (
                  <article
                    className="application-card"
                    key={
                      application.applicationId
                    }
                  >

                    {/* CARD HEADER */}

                    <div className="application-card-header">

                      <div className="application-student-info">

                        <div className="application-avatar">
                          <Building2
                            size={22}
                          />
                        </div>

                        <div>

                          <h3>
                            {
                              application.jobTitle ||
                              "Job Position"
                            }
                          </h3>

                          <p>
                            {
                              application.companyName ||
                              "Company"
                            }
                          </p>

                        </div>

                      </div>

                      <span
                        className={
                          `application-status ${statusConfig.className}`
                        }
                      >
                        {
                          statusConfig.label
                        }
                      </span>

                    </div>

                    {/* APPLICATION INFO */}

                    <div className="application-info-box">

                      <div>
                        <span>
                          Match Score
                        </span>

                        <strong className="application-match-score">
                          {
                            application.matchScore ??
                            0
                          }%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Applied
                        </span>

                        <strong>
                          {formatDate(
                            application.appliedAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Application ID
                        </span>

                        <strong>
                          {
                            application.applicationId ||
                            "N/A"
                          }
                        </strong>
                      </div>

                    </div>

                    {/* =================================================
                        INTERVIEW SCHEDULE
                    ================================================= */}

                    {isScheduled && (
                      <div
                        className="application-interview-box"
                        style={{
                          marginTop:
                            "18px",
                          padding:
                            "18px",
                          borderRadius:
                            "14px",
                          background:
                            "#eff6ff",
                          border:
                            "1px solid #bfdbfe",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "9px",
                            color:
                              "#1d4ed8",
                            fontWeight:
                              700,
                            marginBottom:
                              "14px",
                          }}
                        >
                          <Video
                            size={20}
                          />

                          Interview Scheduled
                        </div>

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(3, minmax(0, 1fr))",
                            gap:
                              "12px",
                          }}
                        >

                          <div>
                            <span
                              style={{
                                display:
                                  "block",
                                color:
                                  "#64748b",
                                fontSize:
                                  "12px",
                                marginBottom:
                                  "4px",
                              }}
                            >
                              Interview Date
                            </span>

                            <strong>
                              {formatInterviewDate(
                                application
                                  .interview
                                  .date
                              )}
                            </strong>
                          </div>

                          <div>
                            <span
                              style={{
                                display:
                                  "block",
                                color:
                                  "#64748b",
                                fontSize:
                                  "12px",
                                marginBottom:
                                  "4px",
                              }}
                            >
                              Interview Time
                            </span>

                            <strong>
                              {
                                application
                                  .interview
                                  .time
                              }
                            </strong>
                          </div>

                          <div>
                            <span
                              style={{
                                display:
                                  "block",
                                color:
                                  "#64748b",
                                fontSize:
                                  "12px",
                                marginBottom:
                                  "4px",
                              }}
                            >
                              Duration
                            </span>

                            <strong>
                              {
                                application
                                  .interview
                                  .duration
                              }{" "}
                              minutes
                            </strong>
                          </div>

                        </div>

                        {/* INSTRUCTIONS */}

                        {application
                          .interview
                          .instructions && (
                          <div
                            style={{
                              marginTop:
                                "14px",
                              padding:
                                "12px",
                              borderRadius:
                                "10px",
                              background:
                                "white",
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  "block",
                                marginBottom:
                                  "5px",
                              }}
                            >
                              Interview Instructions
                            </strong>

                            <p
                              style={{
                                margin:
                                  0,
                                color:
                                  "#475569",
                                lineHeight:
                                  1.5,
                              }}
                            >
                              {
                                application
                                  .interview
                                  .instructions
                              }
                            </p>
                          </div>
                        )}

                        {/* START BUTTON */}

                        <div
                          style={{
                            marginTop:
                              "16px",
                          }}
                        >

                          <button
                            type="button"
                            className="start-interview-button"
                            onClick={() =>
                              handleStartInterview(
                                application
                              )
                            }
                            style={{
                              width:
                                "100%",
                              border:
                                "none",
                              borderRadius:
                                "10px",
                              padding:
                                "13px 18px",
                              background:
                                "#2563eb",
                              color:
                                "white",
                              fontSize:
                                "15px",
                              fontWeight:
                                700,
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              gap:
                                "8px",
                            }}
                          >
                            <Video
                              size={18}
                            />

                            START INTERVIEW
                          </button>

                          <p
                            style={{
                              margin:
                                "8px 0 0",
                              textAlign:
                                "center",
                              fontSize:
                                "12px",
                              color:
                                "#64748b",
                            }}
                          >
                            You can join up to
                            10 minutes before
                            the scheduled time.
                          </p>

                        </div>

                      </div>
                    )}

                    {/* =================================================
                        REJECTION
                    ================================================= */}

                    {status ===
                      "REJECTED" &&
                      application.rejectionReason && (
                        <div className="application-message rejection">

                          <XCircle size={18} />

                          <div>
                            <strong>
                              Application Rejected
                            </strong>

                            <p>
                              {
                                application.rejectionReason
                              }
                            </p>
                          </div>

                        </div>
                      )}

                    {/* =================================================
                        SELECTED
                    ================================================= */}

                    {status ===
                      "SELECTED" && (
                      <div className="application-message selection">

                        <CheckCircle2
                          size={18}
                        />

                        <div>
                          <strong>
                            Congratulations!
                          </strong>

                          <p>
                            You have been selected
                            for this position.
                          </p>
                        </div>

                      </div>
                    )}

                    {/* =================================================
                        INTERVIEW COMPLETED
                    ================================================= */}

                    {status ===
                      "INTERVIEW_COMPLETED" && (
                      <div className="application-message">

                        <CheckCircle2
                          size={18}
                        />

                        <div>
                          <strong>
                            Interview Completed
                          </strong>

                          <p>
                            Your interview has
                            been completed. The
                            recruiter will review
                            your interview result.
                          </p>
                        </div>

                      </div>
                    )}

                    {/* =================================================
                        ACCEPTED BUT NOT SCHEDULED
                    ================================================= */}

                    {status ===
                      "ACCEPTED" && (
                      <div className="application-message">

                        <CheckCircle2
                          size={18}
                        />

                        <div>
                          <strong>
                            Application Accepted
                          </strong>

                          <p>
                            Your application has
                            been accepted. The
                            recruiter will schedule
                            your interview.
                          </p>
                        </div>

                      </div>
                    )}

                    {/* =================================================
                        CARD FOOTER
                    ================================================= */}

                    <div className="application-card-actions">

                      {status ===
                        "INTERVIEW_SCHEDULED" && (
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "7px",
                            color:
                              "#2563eb",
                            fontSize:
                              "13px",
                          }}
                        >
                          <CalendarDays
                            size={16}
                          />

                          Interview scheduled
                        </div>
                      )}

                      {status ===
                        "PENDING" && (
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "7px",
                            color:
                              "#64748b",
                            fontSize:
                              "13px",
                          }}
                        >
                          <Clock3
                            size={16}
                          />

                          Waiting for recruiter
                          response
                        </div>
                      )}

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

export default MyApplications;