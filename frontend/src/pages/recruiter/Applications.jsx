import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  Search,
  User,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import FinalDecisionModal from "./FinalDecisionModal";

import "./Applications.css";

const APPLICATIONS_KEY = "campuslink_applications";
const NOTIFICATIONS_KEY = "campuslink_notifications";

const STATUS_LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  INTERVIEW_COMPLETED: "Interview Completed",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

const STATUS_CLASSES = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  INTERVIEW_SCHEDULED: "interview-scheduled",
  INTERVIEW_COMPLETED: "interview-completed",
  SELECTED: "selected",
  REJECTED: "rejected",
};

function Applications() {
  const { user } = useAuth();

  const recruiterEmail =
    user?.email || "recruiter@campuslink.com";

  const jobsStorageKey =
    `campuslink_jobs_${recruiterEmail}`;

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [rejectingApplication, setRejectingApplication] =
    useState(null);

  const [schedulingApplication, setSchedulingApplication] =
    useState(null);

  const [decisionApplication, setDecisionApplication] =
    useState(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [interviewForm, setInterviewForm] = useState({
    date: "",
    time: "",
    duration: "30",
    instructions:
      "Please join the interview on time and make sure your camera and microphone are working.",
  });

  const [actionLoading, setActionLoading] = useState(false);

  /* =====================================================
     STORAGE HELPERS
  ===================================================== */

  const readStorage = (key, fallback = []) => {
    try {
      const stored = localStorage.getItem(key);

      if (!stored) {
        return fallback;
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed)
        ? parsed
        : fallback;
    } catch (error) {
      console.error(
        `Could not read ${key}:`,
        error
      );

      return fallback;
    }
  };

  /* =====================================================
     LOAD JOBS
  ===================================================== */

  const loadJobs = () => {
    const recruiterJobs = readStorage(
      jobsStorageKey,
      []
    );

    setJobs(recruiterJobs);
  };

  /* =====================================================
     LOAD APPLICATIONS
  ===================================================== */

  const loadApplications = () => {
    const allApplications = readStorage(
      APPLICATIONS_KEY,
      []
    );

    const recruiterJobs = readStorage(
      jobsStorageKey,
      []
    );

    const recruiterJobIds = new Set(
      recruiterJobs.map(
        (job) => String(job.id)
      )
    );

    const recruiterApplications =
      allApplications.filter(
        (application) =>
          recruiterJobIds.has(
            String(application.jobId)
          )
      );

    setApplications(
      recruiterApplications
    );

    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
    loadApplications();

    const handleApplicationUpdate = () => {
      loadJobs();
      loadApplications();
    };

    const handleStorage = (event) => {
      if (
        event.key === APPLICATIONS_KEY ||
        event.key === jobsStorageKey
      ) {
        loadJobs();
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
  }, [recruiterEmail]);

  /* =====================================================
     JOB LOOKUP
  ===================================================== */

  const getJobForApplication = (application) => {
    return jobs.find(
      (job) =>
        String(job.id) ===
        String(application.jobId)
    );
  };

  /* =====================================================
     STUDENT PROFILE PHOTO
  ===================================================== */

  const getStudentProfilePhoto = (studentEmail) => {
    if (!studentEmail) {
      return "";
    }

    const originalEmail = String(studentEmail).trim();
    const cleanEmail = originalEmail.toLowerCase();

    const possibleKeys = [
      `campuslink_student_profile_${originalEmail}`,
      `campuslink_student_profile_${cleanEmail}`,
    ];

    for (const key of [...new Set(possibleKeys)]) {
      try {
        const savedProfile = localStorage.getItem(key);

        if (!savedProfile) {
          continue;
        }

        const profile = JSON.parse(savedProfile);

        if (
          profile &&
          typeof profile.profilePhoto === "string" &&
          profile.profilePhoto.trim()
        ) {
          return profile.profilePhoto.trim();
        }
      } catch (error) {
        console.warn(
          "Could not load student profile photo:",
          error
        );
      }
    }

    return "";
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredApplications = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return applications.filter(
      (application) => {
        const matchesStatus =
          statusFilter === "ALL" ||
          application.status ===
            statusFilter;

        if (!matchesStatus) {
          return false;
        }

        if (!search) {
          return true;
        }

        const job =
          getJobForApplication(
            application
          );

        const studentName = String(
          application.studentName || ""
        ).toLowerCase();

        const studentEmail = String(
          application.studentEmail ||
            application.studentId ||
            ""
        ).toLowerCase();

        const jobTitle = String(
          application.jobTitle ||
            job?.title ||
            ""
        ).toLowerCase();

        const companyName = String(
          application.companyName ||
            job?.companyName ||
            ""
        ).toLowerCase();

        return (
          studentName.includes(search) ||
          studentEmail.includes(search) ||
          jobTitle.includes(search) ||
          companyName.includes(search)
        );
      }
    );
  }, [
    applications,
    jobs,
    searchTerm,
    statusFilter,
  ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = useMemo(() => {
    return {
      total: applications.length,

      pending: applications.filter(
        (item) =>
          item.status === "PENDING"
      ).length,

      accepted: applications.filter(
        (item) =>
          item.status === "ACCEPTED" ||
          item.status ===
            "INTERVIEW_SCHEDULED" ||
          item.status ===
            "INTERVIEW_COMPLETED"
      ).length,

      rejected: applications.filter(
        (item) =>
          item.status === "REJECTED"
      ).length,

      selected: applications.filter(
        (item) =>
          item.status === "SELECTED"
      ).length,
    };
  }, [applications]);

  /* =====================================================
     DATE
  ===================================================== */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
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

  /* =====================================================
     INTERVIEW DATE FORMAT
  ===================================================== */

  const formatInterviewDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "Date not set";
    }

    const date = new Date(
      `${dateValue}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
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
     NOTIFICATION
  ===================================================== */

  const createNotification = ({
    application,
    type,
    title,
    message,
    userEmail,
  }) => {
    const notifications =
      readStorage(
        NOTIFICATIONS_KEY,
        []
      );

    const notification = {
      notificationId:
        `NOTIF-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      userId:
        userEmail ||
        application.studentId ||
        application.studentEmail,

      userEmail:
        userEmail ||
        application.studentEmail ||
        application.studentId,

      type,

      title,

      message,

      jobId:
        application.jobId,

      applicationId:
        application.applicationId,

      read: false,

      createdAt:
        new Date().toISOString(),
    };

    notifications.push(
      notification
    );

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
  };

  /* =====================================================
     UPDATE APPLICATION
  ===================================================== */

  const updateApplication = (
    applicationId,
    updates
  ) => {
    const allApplications =
      readStorage(
        APPLICATIONS_KEY,
        []
      );

    const updatedApplications =
      allApplications.map(
        (application) => {
          if (
            String(
              application.applicationId
            ) !==
            String(applicationId)
          ) {
            return application;
          }

          return {
            ...application,
            ...updates,
            updatedAt:
              new Date().toISOString(),
          };
        }
      );

    localStorage.setItem(
      APPLICATIONS_KEY,
      JSON.stringify(
        updatedApplications
      )
    );

    window.dispatchEvent(
      new Event(
        "campuslink_application_updated"
      )
    );

    return updatedApplications;
  };

  /* =====================================================
     ACCEPT APPLICATION / OPEN SCHEDULE
  ===================================================== */

  const openAcceptSchedule = (
    application
  ) => {
    if (
      application.status !== "PENDING" &&
      application.status !== "ACCEPTED"
    ) {
      return;
    }

    setSelectedApplication(null);

    setSchedulingApplication(
      application
    );

    setInterviewForm({
      date: "",
      time: "",
      duration: "30",
      instructions:
        "Please join the interview on time and make sure your camera and microphone are working.",
    });
  };

  /* =====================================================
     CONFIRM ACCEPT + SCHEDULE
  ===================================================== */

  const handleAcceptAndSchedule =
    () => {
      if (!schedulingApplication) {
        return;
      }

      const {
        date,
        time,
        duration,
        instructions,
      } = interviewForm;

      if (!date) {
        alert(
          "Please select the interview date."
        );
        return;
      }

      if (!time) {
        alert(
          "Please select the interview time."
        );
        return;
      }

      if (!duration) {
        alert(
          "Please select the interview duration."
        );
        return;
      }

      setActionLoading(true);

      try {
        const updatedInterview = {
          scheduled: true,
          date,
          time,
          duration,
          instructions:
            instructions.trim(),
        };

        updateApplication(
          schedulingApplication.applicationId,
          {
            status:
              "INTERVIEW_SCHEDULED",

            recruiterDecision:
              "ACCEPTED",

            rejectionReason: "",

            finalDecision: "",

            finalDecisionReason: "",

            interview:
              updatedInterview,
          }
        );

        createNotification({
          application:
            schedulingApplication,

          type:
            "APPLICATION_ACCEPTED",

          title:
            "Application Accepted",

          message:
            `Your application for ${
              schedulingApplication.jobTitle ||
              "the job"
            } has been accepted by ${
              schedulingApplication.companyName ||
              "the company"
            }. Your interview has also been scheduled.`,
        });

        createNotification({
          application:
            schedulingApplication,

          type:
            "INTERVIEW_SCHEDULED",

          title:
            "Interview Scheduled",

          message:
            `Your ${
              schedulingApplication.jobTitle ||
              "job"
            } interview with ${
              schedulingApplication.companyName ||
              "the company"
            } is scheduled for ${formatInterviewDate(
              date
            )} at ${time}. Duration: ${duration} minutes.`,
        });

        setSchedulingApplication(
          null
        );

        setInterviewForm({
          date: "",
          time: "",
          duration: "30",
          instructions: "",
        });

        alert(
          "Application accepted and interview scheduled successfully."
        );
      } catch (error) {
        console.error(
          "Could not accept and schedule interview:",
          error
        );

        alert(
          "Could not schedule the interview."
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* =====================================================
     REJECT
  ===================================================== */

  const openRejectDialog = (
    application
  ) => {
    setSelectedApplication(null);

    setRejectingApplication(
      application
    );

    setRejectionReason("");
  };

  const handleReject = () => {
    if (!rejectingApplication) {
      return;
    }

    const reason =
      rejectionReason.trim();

    if (!reason) {
      alert(
        "Please enter a rejection reason."
      );
      return;
    }

    setActionLoading(true);

    try {
      updateApplication(
        rejectingApplication.applicationId,
        {
          status: "REJECTED",

          recruiterDecision:
            "REJECTED",

          rejectionReason:
            reason,

          finalDecision: "",

          finalDecisionReason: "",
        }
      );

      createNotification({
        application:
          rejectingApplication,

        type:
          "APPLICATION_REJECTED",

        title:
          "Application Rejected",

        message:
          `Your application for ${
            rejectingApplication.jobTitle ||
            "the job"
          } was rejected by ${
            rejectingApplication.companyName ||
            "the company"
          }. Reason: ${reason}`,
      });

      setRejectingApplication(
        null
      );

      setRejectionReason("");

      alert(
        "Application rejected and the student has been notified."
      );
    } catch (error) {
      console.error(
        "Could not reject application:",
        error
      );

      alert(
        "Could not reject the application."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     INTERVIEW SCHEDULE DISPLAY
  ===================================================== */

  const renderInterviewSchedule = (
    application
  ) => {
    if (!application.interview?.scheduled) {
      return null;
    }

    const interview =
      application.interview;

    return (
      <div className="recruiter-interview-scheduled-box">

        <div className="recruiter-interview-scheduled-header">
          <Video size={18} />

          <strong>
            Interview Scheduled
          </strong>
        </div>

        <div className="recruiter-interview-scheduled-grid">

          <div className="recruiter-interview-detail">
            <span>
              Date
            </span>

            <strong>
              {formatInterviewDate(
                interview.date
              )}
            </strong>
          </div>

          <div className="recruiter-interview-detail">
            <span>
              Time
            </span>

            <strong>
              {interview.time || "Not set"}
            </strong>
          </div>

          <div className="recruiter-interview-detail">
            <span>
              Duration
            </span>

            <strong>
              {interview.duration || "30"} min
            </strong>
          </div>

        </div>

        {interview.instructions && (
          <div className="recruiter-interview-instructions">
            <span>
              Instructions
            </span>

            <p>
              {interview.instructions}
            </p>
          </div>
        )}

      </div>
    );
  };

  /* =====================================================
     RENDER APPLICATION CARD
  ===================================================== */

  const renderApplicationCard = (
    application
  ) => {
    const job =
      getJobForApplication(
        application
      );

    const studentName =
      application.studentName ||
      "Student";

    const studentEmail =
      application.studentEmail ||
      application.studentId ||
      "Email not available";

    const jobTitle =
      application.jobTitle ||
      job?.title ||
      "Job Position";

    const companyName =
      application.companyName ||
      job?.companyName ||
      "Company";

    const status =
      application.status ||
      "PENDING";

    const statusClass =
      STATUS_CLASSES[status] ||
      "pending";

    const studentProfilePhoto =
      getStudentProfilePhoto(
        application.studentEmail ||
          application.studentId ||
          ""
      );

    return (
      <article
        className="recruiter-application-card"
        key={
          application.applicationId
        }
      >

        <div className="recruiter-application-card-top">

          <div className="recruiter-application-student">

            <div className="recruiter-application-avatar">
              {studentProfilePhoto ? (
                <img
                  src={studentProfilePhoto}
                  alt={studentName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                    display: "block",
                  }}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <User size={24} />
              )}
            </div>

            <div>
              <h3>
                {studentName}
              </h3>

              <div className="recruiter-application-email">

                <Mail size={14} />

                <span>
                  {studentEmail}
                </span>

              </div>
            </div>

          </div>

          <span
            className={`application-status-badge ${statusClass}`}
          >
            {STATUS_LABELS[status] ||
              status}
          </span>

        </div>

        <div className="recruiter-application-job">

          <div className="application-job-icon">
            <BriefcaseBusiness
              size={20}
            />
          </div>

          <div>

            <strong>
              {jobTitle}
            </strong>

            <span>
              {companyName}
            </span>

          </div>

        </div>

        <div className="recruiter-application-info-grid">

          <div className="application-info-item">

            <span>
              Match Score
            </span>

            <strong className="match-score">
              {application.matchScore ??
                0}%
            </strong>

          </div>

          <div className="application-info-item">

            <span>
              Applied
            </span>

            <strong>
              {formatDate(
                application.appliedAt
              )}
            </strong>

          </div>

          <div className="application-info-item">

            <span>
              Application ID
            </span>

            <strong>
              {application.applicationId ||
                "N/A"}
            </strong>

          </div>

        </div>

        {/* =================================================
            INTERVIEW INFORMATION
        ================================================= */}

        {renderInterviewSchedule(
          application
        )}

        {status === "REJECTED" &&
          application.rejectionReason && (
            <div className="application-rejection-note">

              <XCircle size={17} />

              <div>

                <strong>
                  Rejection Reason
                </strong>

                <p>
                  {
                    application.rejectionReason
                  }
                </p>

              </div>

            </div>
          )}

        {status === "ACCEPTED" && (
          <div className="application-accepted-note">

            <CheckCircle2
              size={17}
            />

            <span>
              Application accepted.
              Interview scheduling is
              required.
            </span>

          </div>
        )}

        <div className="recruiter-application-actions">

          <button
            type="button"
            className="application-view-button"
            onClick={() =>
              setSelectedApplication(
                application
              )
            }
          >
            <FileText size={17} />

            View Application
          </button>

          {status === "PENDING" && (
            <>
              <button
                type="button"
                className="application-accept-button"
                onClick={() =>
                  openAcceptSchedule(
                    application
                  )
                }
                disabled={
                  actionLoading
                }
              >
                <CheckCircle2
                  size={17}
                />

                Accept & Schedule
              </button>

              <button
                type="button"
                className="application-reject-button"
                onClick={() =>
                  openRejectDialog(
                    application
                  )
                }
                disabled={
                  actionLoading
                }
              >
                <XCircle
                  size={17}
                />

                Reject
              </button>
            </>
          )}

          {status === "ACCEPTED" && (
            <button
              type="button"
              className="application-accept-button"
              onClick={() =>
                openAcceptSchedule(
                  application
                )
              }
            >
              <CalendarDays
                size={17}
              />

              Schedule Interview
            </button>
          )}

          {status === "INTERVIEW_COMPLETED" && (
            <button
              type="button"
              className="application-accept-button"
              onClick={() =>
                setDecisionApplication(
                  application
                )
              }
            >
              <CheckCircle2 size={17} />

              Final Decision
            </button>
          )}

        </div>

      </article>
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="recruiter-applications-page">

        <div className="applications-loading">

          <div className="applications-loading-spinner" />

          <p>
            Loading applications...
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="recruiter-applications-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="recruiter-applications-header">

        <div>

          <div className="recruiter-applications-eyebrow">
            RECRUITER PORTAL
          </div>

          <h1>
            Applications
          </h1>

          <p>
            Review students who have applied
            to your job openings and manage
            their application status.
          </p>

        </div>

        <div className="recruiter-applications-header-icon">
          <Users size={30} />
        </div>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="recruiter-application-stat-grid">

        <div className="recruiter-application-stat">

          <div className="application-stat-icon total">
            <Users size={21} />
          </div>

          <div>

            <span>
              Total Applications
            </span>

            <strong>
              {statistics.total}
            </strong>

          </div>

        </div>

        <div className="recruiter-application-stat">

          <div className="application-stat-icon pending">
            <Clock3 size={21} />
          </div>

          <div>

            <span>
              Pending
            </span>

            <strong>
              {statistics.pending}
            </strong>

          </div>

        </div>

        <div className="recruiter-application-stat">

          <div className="application-stat-icon accepted">
            <CheckCircle2
              size={21}
            />
          </div>

          <div>

            <span>
              Accepted
            </span>

            <strong>
              {statistics.accepted}
            </strong>

          </div>

        </div>

        <div className="recruiter-application-stat">

          <div className="application-stat-icon rejected">
            <XCircle size={21} />
          </div>

          <div>

            <span>
              Rejected
            </span>

            <strong>
              {statistics.rejected}
            </strong>

          </div>

        </div>

        <div className="recruiter-application-stat">

          <div className="application-stat-icon selected">
            <GraduationCap
              size={21}
            />
          </div>

          <div>

            <span>
              Selected
            </span>

            <strong>
              {statistics.selected}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          FILTER
      ================================================= */}

      <div className="recruiter-applications-filter-card">

        <div className="applications-search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search student, email, job..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>

        <div className="applications-status-filter">

          <label htmlFor="applicationStatus">
            Status
          </label>

          <select
            id="applicationStatus"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Applications
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="ACCEPTED">
              Accepted
            </option>

            <option value="INTERVIEW_SCHEDULED">
              Interview Scheduled
            </option>

            <option value="INTERVIEW_COMPLETED">
              Interview Completed
            </option>

            <option value="SELECTED">
              Selected
            </option>

            <option value="REJECTED">
              Rejected
            </option>

          </select>

        </div>

      </div>

      {/* =================================================
          APPLICATIONS
      ================================================= */}

      <section className="recruiter-applications-section">

        <div className="recruiter-applications-section-header">

          <div>

            <h2>
              Student Applications
            </h2>

            <p>
              {filteredApplications.length}{" "}
              application
              {filteredApplications.length !==
              1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

        </div>

        {filteredApplications.length ===
        0 ? (
          <div className="recruiter-applications-empty">

            <div className="applications-empty-icon">
              <Users size={30} />
            </div>

            <h3>
              No applications found
            </h3>

            <p>
              When students apply to your
              jobs, their applications will
              appear here.
            </p>

          </div>
        ) : (
          <div className="recruiter-application-list">

            {filteredApplications.map(
              renderApplicationCard
            )}

          </div>
        )}

      </section>

      {/* =================================================
          VIEW APPLICATION MODAL
      ================================================= */}

      {selectedApplication && (
        <div
          className="application-modal-overlay"
          onClick={() =>
            setSelectedApplication(
              null
            )
          }
        >

          <div
            className="application-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="application-modal-header">

              <div>

                <span>
                  APPLICATION DETAILS
                </span>

                <h2>
                  {
                    selectedApplication.studentName ||
                    "Student"
                  }
                </h2>

              </div>

              <button
                type="button"
                className="application-modal-close"
                onClick={() =>
                  setSelectedApplication(
                    null
                  )
                }
              >
                <X size={21} />
              </button>

            </div>

            <div className="application-modal-body">

              <div className="application-detail-row">

                <span>
                  <User size={16} />
                  Student
                </span>

                <strong>
                  {
                    selectedApplication.studentName ||
                    "N/A"
                  }
                </strong>

              </div>

              <div className="application-detail-row">

                <span>
                  <Mail size={16} />
                  Email
                </span>

                <strong>
                  {
                    selectedApplication.studentEmail ||
                    selectedApplication.studentId ||
                    "N/A"
                  }
                </strong>

              </div>

              <div className="application-detail-row">

                <span>
                  <BriefcaseBusiness
                    size={16}
                  />

                  Job
                </span>

                <strong>
                  {
                    selectedApplication.jobTitle ||
                    getJobForApplication(
                      selectedApplication
                    )?.title ||
                    "N/A"
                  }
                </strong>

              </div>

              <div className="application-detail-row">

                <span>
                  <CheckCircle2 size={16} />

                  Match Score
                </span>

                <strong className="modal-match-score">
                  {
                    selectedApplication.matchScore ??
                    0
                  }%
                </strong>

              </div>

              <div className="application-detail-row">

                <span>
                  <CalendarDays
                    size={16}
                  />

                  Applied
                </span>

                <strong>
                  {formatDate(
                    selectedApplication.appliedAt
                  )}
                </strong>

              </div>

              <div className="application-detail-row">

                <span>
                  Status
                </span>

                <strong>
                  {
                    STATUS_LABELS[
                      selectedApplication.status
                    ] ||
                    selectedApplication.status ||
                    "Pending"
                  }
                </strong>

              </div>

              {/* =================================================
                  INTERVIEW SCHEDULE IN VIEW MODAL
              ================================================= */}

              {selectedApplication.interview
                ?.scheduled && (
                <div className="recruiter-interview-modal-box">

                  <div className="recruiter-interview-modal-header">

                    <Video size={18} />

                    <strong>
                      Interview Scheduled
                    </strong>

                  </div>

                  <div className="recruiter-interview-modal-row">

                    <span>
                      Date
                    </span>

                    <strong>
                      {formatInterviewDate(
                        selectedApplication
                          .interview
                          .date
                      )}
                    </strong>

                  </div>

                  <div className="recruiter-interview-modal-row">

                    <span>
                      Time
                    </span>

                    <strong>
                      {
                        selectedApplication
                          .interview
                          .time
                      }
                    </strong>

                  </div>

                  <div className="recruiter-interview-modal-row">

                    <span>
                      Duration
                    </span>

                    <strong>
                      {
                        selectedApplication
                          .interview
                          .duration
                      }{" "}
                      minutes
                    </strong>

                  </div>

                  <div className="recruiter-interview-modal-row">

                    <span>
                      Instructions
                    </span>

                    <strong className="recruiter-interview-instruction-value">
                      {
                        selectedApplication
                          .interview
                          .instructions ||
                        "No additional instructions."
                      }
                    </strong>

                  </div>

                </div>
              )}

              {selectedApplication.status ===
                "REJECTED" &&
                selectedApplication.rejectionReason && (
                  <div className="application-modal-rejection">

                    <AlertCircle
                      size={18}
                    />

                    <div>

                      <strong>
                        Rejection Reason
                      </strong>

                      <p>
                        {
                          selectedApplication.rejectionReason
                        }
                      </p>

                    </div>

                  </div>
                )}

            </div>

            <div className="application-modal-footer">

              {selectedApplication.status ===
                "PENDING" && (
                <>
                  <button
                    type="button"
                    className="application-accept-button"
                    onClick={() =>
                      openAcceptSchedule(
                        selectedApplication
                      )
                    }
                    disabled={
                      actionLoading
                    }
                  >

                    <CalendarDays
                      size={17}
                    />

                    Accept & Schedule

                  </button>

                  <button
                    type="button"
                    className="application-reject-button"
                    onClick={() =>
                      openRejectDialog(
                        selectedApplication
                      )
                    }
                    disabled={
                      actionLoading
                    }
                  >

                    <XCircle
                      size={17}
                    />

                    Reject

                  </button>
                </>
              )}

              {selectedApplication.status ===
                "ACCEPTED" && (
                <button
                  type="button"
                  className="application-accept-button"
                  onClick={() =>
                    openAcceptSchedule(
                      selectedApplication
                    )
                  }
                >

                  <CalendarDays
                    size={17}
                  />

                  Schedule Interview

                </button>
              )}

              {selectedApplication.status ===
                "INTERVIEW_COMPLETED" && (
                <button
                  type="button"
                  className="application-accept-button"
                  onClick={() => {
                    setSelectedApplication(null);
                    setDecisionApplication(
                      selectedApplication
                    );
                  }}
                >

                  <CheckCircle2 size={17} />

                  Final Decision

                </button>
              )}

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          ACCEPT + SCHEDULE MODAL
      ================================================= */}

      {schedulingApplication && (
        <div
          className="application-modal-overlay"
          onClick={() => {
            if (!actionLoading) {
              setSchedulingApplication(
                null
              );
            }
          }}
        >

          <div
            className="application-modal application-schedule-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="application-modal-header">

              <div>

                <span>
                  ACCEPT & SCHEDULE INTERVIEW
                </span>

                <h2>
                  {
                    schedulingApplication.studentName ||
                    "Student"
                  }
                </h2>

              </div>

              <button
                type="button"
                className="application-modal-close"
                onClick={() => {
                  if (!actionLoading) {
                    setSchedulingApplication(
                      null
                    );
                  }
                }}
              >

                <X size={21} />

              </button>

            </div>

            <div className="application-schedule-content">

              {/* JOB INFORMATION */}

              <div className="application-schedule-intro">

                <strong>
                  {
                    schedulingApplication.jobTitle ||
                    "Job Position"
                  }
                </strong>

                <span>
                  {
                    schedulingApplication.companyName ||
                    "Company"
                  }
                </span>

              </div>

              {/* FORM */}

              <div className="application-schedule-form">

                {/* DATE */}

                <div className="application-schedule-field">

                  <label htmlFor="interviewDate">
                    Interview Date
                  </label>

                  <input
                    id="interviewDate"
                    type="date"
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    value={
                      interviewForm.date
                    }
                    onChange={(event) =>
                      setInterviewForm(
                        (previous) => ({
                          ...previous,
                          date:
                            event.target
                              .value,
                        })
                      )
                    }
                    disabled={
                      actionLoading
                    }
                  />

                </div>

                {/* TIME */}

                <div className="application-schedule-field">

                  <label htmlFor="interviewTime">
                    Interview Time
                  </label>

                  <input
                    id="interviewTime"
                    type="time"
                    value={
                      interviewForm.time
                    }
                    onChange={(event) =>
                      setInterviewForm(
                        (previous) => ({
                          ...previous,
                          time:
                            event.target
                              .value,
                        })
                      )
                    }
                    disabled={
                      actionLoading
                    }
                  />

                </div>

                {/* DURATION */}

                <div className="application-schedule-field">

                  <label htmlFor="interviewDuration">
                    Interview Duration
                  </label>

                  <select
                    id="interviewDuration"
                    value={
                      interviewForm.duration
                    }
                    onChange={(event) =>
                      setInterviewForm(
                        (previous) => ({
                          ...previous,
                          duration:
                            event.target
                              .value,
                        })
                      )
                    }
                    disabled={
                      actionLoading
                    }
                  >

                    <option value="15">
                      15 minutes
                    </option>

                    <option value="30">
                      30 minutes
                    </option>

                    <option value="45">
                      45 minutes
                    </option>

                    <option value="60">
                      60 minutes
                    </option>

                    <option value="90">
                      90 minutes
                    </option>

                  </select>

                </div>

                {/* INSTRUCTIONS */}

                <div className="application-schedule-field">

                  <label htmlFor="interviewInstructions">
                    Interview Instructions
                  </label>

                  <textarea
                    id="interviewInstructions"
                    rows="4"
                    placeholder="Enter instructions for the student..."
                    value={
                      interviewForm.instructions
                    }
                    onChange={(event) =>
                      setInterviewForm(
                        (previous) => ({
                          ...previous,
                          instructions:
                            event.target
                              .value,
                        })
                      )
                    }
                    disabled={
                      actionLoading
                    }
                  />

                </div>

              </div>

            </div>

            <div className="application-schedule-footer">

              <button
                type="button"
                className="application-schedule-cancel-button"
                onClick={() => {
                  if (!actionLoading) {
                    setSchedulingApplication(
                      null
                    );
                  }
                }}
                disabled={
                  actionLoading
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="application-schedule-confirm-button"
                onClick={
                  handleAcceptAndSchedule
                }
                disabled={
                  actionLoading
                }
              >

                <CalendarDays
                  size={17}
                />

                {actionLoading
                  ? "Scheduling..."
                  : "Accept & Schedule Interview"}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          REJECT MODAL
      ================================================= */}

      {rejectingApplication && (
        <div
          className="application-modal-overlay"
          onClick={() => {
            if (!actionLoading) {
              setRejectingApplication(
                null
              );
            }
          }}
        >

          <div
            className="application-reject-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="application-modal-header">

              <div>

                <span>
                  REJECT APPLICATION
                </span>

                <h2>
                  {
                    rejectingApplication.studentName ||
                    "Student"
                  }
                </h2>

              </div>

              <button
                type="button"
                className="application-modal-close"
                onClick={() => {
                  if (!actionLoading) {
                    setRejectingApplication(
                      null
                    );
                  }
                }}
              >

                <X size={21} />

              </button>

            </div>

            <div className="application-reject-content">

              <div className="reject-warning">

                <AlertCircle
                  size={21}
                />

                <div>

                  <strong>
                    Rejection reason required
                  </strong>

                  <p>
                    The student will receive
                    this reason in their
                    notification.
                  </p>

                </div>

              </div>

              <label htmlFor="rejectionReason">
                Reason for rejection
              </label>

              <textarea
                id="rejectionReason"
                rows="5"
                placeholder="Enter the reason for rejecting this application..."
                value={
                  rejectionReason
                }
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                disabled={
                  actionLoading
                }
              />

            </div>

            <div className="application-reject-footer">

              <button
                type="button"
                className="application-cancel-button"
                onClick={() => {
                  if (!actionLoading) {
                    setRejectingApplication(
                      null
                    );
                  }
                }}
                disabled={
                  actionLoading
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="application-confirm-reject-button"
                onClick={
                  handleReject
                }
                disabled={
                  actionLoading
                }
              >

                <XCircle size={17} />

                {actionLoading
                  ? "Rejecting..."
                  : "Reject Application"}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          FINAL DECISION MODAL
      ================================================= */}

      {decisionApplication && (
        <FinalDecisionModal
          application={decisionApplication}
          onClose={() =>
            setDecisionApplication(null)
          }
        />
      )}

    </div>
  );
}

export default Applications;