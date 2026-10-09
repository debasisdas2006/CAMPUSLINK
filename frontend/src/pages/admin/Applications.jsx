import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  FileText,
  User,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  X,
  GraduationCap,
  Award,
  MapPin,
  Mail,
} from "lucide-react";

import "./Applications.css";

const APPLICATIONS_KEY = "campuslink_applications";

const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "SELECTED",
  "REJECTED",
];

function readArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Could not read ${key}:`, error);
    return [];
  }
}

function readObject(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "null");
    return data && typeof data === "object" ? data : null;
  } catch (error) {
    console.error(`Could not read ${key}:`, error);
    return null;
  }
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date, time) {
  if (!date && !time) return "Not scheduled";

  if (date && time) {
    return `${formatDate(date)} • ${time}`;
  }

  return date ? formatDate(date) : time;
}

function normalizeStatus(application) {
  const status = String(application?.status || "")
    .trim()
    .toUpperCase();

  if (!status) return "PENDING";

  return status;
}

function getStatusLabel(status) {
  return String(status || "PENDING")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status) {
  switch (status) {
    case "SELECTED":
      return "status-selected";

    case "REJECTED":
      return "status-rejected";

    case "INTERVIEW_COMPLETED":
      return "status-completed";

    case "INTERVIEW_SCHEDULED":
      return "status-scheduled";

    case "ACCEPTED":
      return "status-accepted";

    default:
      return "status-pending";
  }
}

function getStudentProfile(email) {
  if (!email) return null;

  return readObject(
    `campuslink_student_profile_${String(email)
      .trim()
      .toLowerCase()}`
  );
}

function getRegisteredUsers() {
  return readArray("campuslink_registered_users");
}

function getRecruiterJobs() {
  const users = getRegisteredUsers();

  const recruiterEmails = users
    .filter(
      (user) =>
        String(user?.role || "").toLowerCase() ===
        "recruiter"
    )
    .map((user) => user.email)
    .filter(Boolean);

  const jobs = [];

  recruiterEmails.forEach((email) => {
    const recruiterJobs = readArray(
      `campuslink_jobs_${email}`
    );

    recruiterJobs.forEach((job) => {
      jobs.push({
        ...job,
        recruiterEmail:
          job.recruiterEmail || email,
      });
    });
  });

  Object.keys(localStorage)
    .filter((key) =>
      key.startsWith("campuslink_jobs_")
    )
    .forEach((key) => {
      const recruiterEmail = key.replace(
        "campuslink_jobs_",
        ""
      );

      const storedJobs = readArray(key);

      storedJobs.forEach((job) => {
        jobs.push({
          ...job,
          recruiterEmail:
            job.recruiterEmail || recruiterEmail,
        });
      });
    });

  const uniqueJobs = new Map();

  jobs.forEach((job) => {
    const id =
      job.id ||
      `${job.recruiterEmail || ""}-${job.title || ""}-${job.companyName || ""}`;

    if (!uniqueJobs.has(id)) {
      uniqueJobs.set(id, job);
    }
  });

  return Array.from(uniqueJobs.values());
}

function buildApplicationData(application) {
  const studentEmail =
    application.studentEmail ||
    application.email ||
    application.student?.email ||
    "";

  const studentProfile =
    getStudentProfile(studentEmail);

  const registeredUser = getRegisteredUsers().find(
    (user) =>
      String(user?.email || "").toLowerCase() ===
      String(studentEmail || "").toLowerCase()
  );

  const jobs = getRecruiterJobs();

  const job = jobs.find(
    (item) =>
      String(item?.id || "") ===
      String(application.jobId || "")
  );

  return {
    ...application,

    studentEmail,

    studentName:
      application.studentName ||
      application.name ||
      application.student?.name ||
      studentProfile?.name ||
      registeredUser?.name ||
      "Unknown Student",

    companyName:
      application.companyName ||
      job?.companyName ||
      "Unknown Company",

    jobTitle:
      application.jobTitle ||
      application.title ||
      application.jobRole ||
      job?.title ||
      "Unknown Job",

    recruiterEmail:
      application.recruiterEmail ||
      job?.recruiterEmail ||
      "",

    location:
      application.location ||
      job?.location ||
      "",

    degree:
      application.degree ||
      studentProfile?.degree ||
      "",

    collegeName:
      application.collegeName ||
      studentProfile?.collegeName ||
      "",

    cgpa:
      application.cgpa ??
      studentProfile?.cgpa ??
      "",

    experience:
      application.experience ||
      studentProfile?.experience ||
      "",

    skills:
      application.skills?.length
        ? application.skills
        : studentProfile?.skills || [],

    languages:
      application.languages?.length
        ? application.languages
        : studentProfile?.languages || [],

    profilePhoto:
      application.profilePhoto ||
      studentProfile?.profilePhoto ||
      "",

    appliedAt:
      application.appliedAt ||
      application.createdAt ||
      application.appliedDate ||
      application.created_at ||
      null,

    status: normalizeStatus(application),
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  type,
}) {
  return (
    <div className="admin-applications-stat-card">
      <div className={`admin-applications-stat-icon ${type}`}>
        <Icon size={21} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ApplicationDetailsModal({
  application,
  onClose,
}) {
  if (!application) return null;

  const interview = application.interview || {};

  return (
    <div
      className="admin-application-modal-overlay"
      onClick={onClose}
    >
      <div
        className="admin-application-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="admin-application-modal-header">
          <div>
            <p className="admin-modal-eyebrow">
              APPLICATION DETAILS
            </p>

            <h2>{application.studentName}</h2>

            <p>
              {application.jobTitle} •{" "}
              {application.companyName}
            </p>
          </div>

          <button
            className="admin-modal-close"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-application-modal-body">

          <div className="admin-application-profile">
            <div className="admin-application-large-avatar">
              {application.profilePhoto ? (
                <img
                  src={application.profilePhoto}
                  alt={application.studentName}
                />
              ) : (
                application.studentName
                  ?.charAt(0)
                  ?.toUpperCase() || "S"
              )}
            </div>

            <div>
              <h3>{application.studentName}</h3>

              <p>
                <Mail size={14} />
                {application.studentEmail || "—"}
              </p>

              <span
                className={`admin-application-status ${getStatusClass(
                  application.status
                )}`}
              >
                {getStatusLabel(application.status)}
              </span>
            </div>
          </div>

          <div className="admin-application-detail-grid">

            <div className="admin-detail-box">
              <span>
                <GraduationCap size={16} />
                College
              </span>
              <strong>
                {application.collegeName || "—"}
              </strong>
            </div>

            <div className="admin-detail-box">
              <span>
                <Award size={16} />
                Degree
              </span>
              <strong>
                {application.degree || "—"}
              </strong>
            </div>

            <div className="admin-detail-box">
              <span>CGPA</span>
              <strong>
                {application.cgpa || "—"}
              </strong>
            </div>

            <div className="admin-detail-box">
              <span>Experience</span>
              <strong>
                {application.experience || "—"}
              </strong>
            </div>

            <div className="admin-detail-box">
              <span>
                <BriefcaseBusiness size={16} />
                Job
              </span>
              <strong>
                {application.jobTitle}
              </strong>
            </div>

            <div className="admin-detail-box">
              <span>
                <Building2 size={16} />
                Company
              </span>
              <strong>
                {application.companyName}
              </strong>
            </div>

            <div className="admin-detail-box">
              <span>
                <MapPin size={16} />
                Location
              </span>
              <strong>
                {application.location || "—"}
              </strong>
            </div>

            <div className="admin-detail-box">
              <span>
                <CalendarDays size={16} />
                Applied
              </span>
              <strong>
                {formatDate(application.appliedAt)}
              </strong>
            </div>

          </div>

          <div className="admin-detail-section">
            <h3>Technical Skills</h3>

            <div className="admin-tag-list">
              {application.skills?.length ? (
                application.skills.map(
                  (skill, index) => (
                    <span key={`${skill}-${index}`}>
                      {skill}
                    </span>
                  )
                )
              ) : (
                <small>No skills available</small>
              )}
            </div>
          </div>

          <div className="admin-detail-section">
            <h3>Programming Languages</h3>

            <div className="admin-tag-list">
              {application.languages?.length ? (
                application.languages.map(
                  (language, index) => (
                    <span
                      key={`${language}-${index}`}
                    >
                      {language}
                    </span>
                  )
                )
              ) : (
                <small>
                  No programming languages available
                </small>
              )}
            </div>
          </div>

          <div className="admin-detail-section">
            <h3>Interview</h3>

            <div className="admin-interview-info">

              <div>
                <span>Status</span>
                <strong>
                  {interview.scheduled
                    ? "Scheduled"
                    : application.status ===
                      "INTERVIEW_COMPLETED"
                    ? "Completed"
                    : "Not scheduled"}
                </strong>
              </div>

              <div>
                <span>Date & Time</span>
                <strong>
                  {interview.scheduled
                    ? formatDateTime(
                        interview.date,
                        interview.time
                      )
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Duration</span>
                <strong>
                  {interview.duration
                    ? `${interview.duration} minutes`
                    : "—"}
                </strong>
              </div>

            </div>

            {interview.instructions && (
              <div className="admin-interview-instructions">
                <span>Instructions</span>
                <p>{interview.instructions}</p>
              </div>
            )}
          </div>

          {application.finalDecision && (
            <div className="admin-detail-section">
              <h3>Final Decision</h3>

              <div className="admin-final-decision">
                <div>
                  <span>Decision</span>
                  <strong>
                    {application.finalDecision
                      ?.status ||
                      application.status}
                  </strong>
                </div>

                {application.finalDecision
                  ?.joiningDate && (
                  <div>
                    <span>Joining Date</span>
                    <strong>
                      {formatDate(
                        application.finalDecision
                          .joiningDate
                      )}
                    </strong>
                  </div>
                )}

                {application.finalDecision
                  ?.teamName && (
                  <div>
                    <span>Team</span>
                    <strong>
                      {
                        application.finalDecision
                          .teamName
                      }
                    </strong>
                  </div>
                )}

                {application.finalDecision
                  ?.teamLeaderName && (
                  <div>
                    <span>Team Leader</span>
                    <strong>
                      {
                        application.finalDecision
                          .teamLeaderName
                      }
                    </strong>
                  </div>
                )}
              </div>

              {application.finalDecision
                ?.additionalDetails && (
                <p className="admin-final-details">
                  {
                    application.finalDecision
                      .additionalDetails
                  }
                </p>
              )}
            </div>
          )}

          {application.rejectionReason && (
            <div className="admin-rejection-box">
              <XCircle size={19} />

              <div>
                <strong>Rejection Reason</strong>
                <p>
                  {application.rejectionReason}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function AdminApplications() {
  const [applications, setApplications] =
    useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const loadApplications = () => {
    setLoading(true);

    const rawApplications =
      readArray(APPLICATIONS_KEY);

    const prepared = rawApplications
      .map(buildApplicationData)
      .sort((a, b) => {
        const dateA = new Date(
          a.appliedAt || 0
        ).getTime();

        const dateB = new Date(
          b.appliedAt || 0
        ).getTime();

        return dateB - dateA;
      });

    setApplications(prepared);

    setTimeout(() => {
      setLoading(false);
    }, 150);
  };

  useEffect(() => {
    loadApplications();

    const handleStorage = () => {
      loadApplications();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "campuslink_application_updated",
      handleStorage
    );

    window.addEventListener(
      "campuslink_applications_updated",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_application_updated",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_applications_updated",
        handleStorage
      );
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: applications.length,

      pending: applications.filter(
        (item) =>
          item.status === "PENDING"
      ).length,

      accepted: applications.filter(
        (item) =>
          item.status === "ACCEPTED"
      ).length,

      scheduled: applications.filter(
        (item) =>
          item.status ===
          "INTERVIEW_SCHEDULED"
      ).length,

      completed: applications.filter(
        (item) =>
          item.status ===
          "INTERVIEW_COMPLETED"
      ).length,

      selected: applications.filter(
        (item) =>
          item.status === "SELECTED"
      ).length,

      rejected: applications.filter(
        (item) =>
          item.status === "REJECTED"
      ).length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return applications.filter(
      (application) => {
        const matchesStatus =
          statusFilter === "ALL" ||
          application.status ===
            statusFilter;

        if (!matchesStatus) return false;

        if (!query) return true;

        const searchableText = [
          application.studentName,
          application.studentEmail,
          application.jobTitle,
          application.companyName,
          application.degree,
          application.collegeName,
          application.location,
          application.recruiterEmail,
          application.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      }
    );
  }, [
    applications,
    search,
    statusFilter,
  ]);

  return (
    <div className="admin-applications-page">

      <div className="admin-applications-header">

        <div>
          <p className="admin-applications-eyebrow">
            ADMIN CONTROL CENTER
          </p>

          <h1>Applications</h1>

          <p className="admin-applications-subtitle">
            Monitor and manage all student job
            applications across the CampusLink
            platform.
          </p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={loadApplications}
          type="button"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "admin-spin"
                : ""
            }
          />
          Refresh
        </button>

      </div>

      <div className="admin-applications-stats">

        <StatCard
          icon={FileText}
          label="Total Applications"
          value={stats.total}
          type="blue"
        />

        <StatCard
          icon={AlertCircle}
          label="Pending"
          value={stats.pending}
          type="pending"
        />

        <StatCard
          icon={CheckCircle2}
          label="Accepted"
          value={
            stats.accepted +
            stats.scheduled +
            stats.completed
          }
          type="accepted"
        />

        <StatCard
          icon={CalendarDays}
          label="Interviews"
          value={
            stats.scheduled +
            stats.completed
          }
          type="scheduled"
        />

        <StatCard
          icon={Award}
          label="Selected"
          value={stats.selected}
          type="selected"
        />

        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          type="rejected"
        />

      </div>

      <div className="admin-applications-toolbar">

        <div className="admin-application-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search student, job, company, email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="admin-status-filters">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              className={
                statusFilter === status
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(status)
              }
            >
              {status === "ALL"
                ? "All"
                : getStatusLabel(status)}
            </button>
          ))}
        </div>

      </div>

      <div className="admin-applications-section">

        <div className="admin-applications-section-header">

          <div>
            <span>
              APPLICATION RECORDS
            </span>

            <h2>
              {filteredApplications.length}{" "}
              application
              {filteredApplications.length !==
              1
                ? "s"
                : ""}
            </h2>
          </div>

          <div className="admin-section-info">
            <FileText size={17} />
            Central application management
          </div>

        </div>

        {loading ? (
          <div className="admin-applications-empty">
            <RefreshCw
              size={26}
              className="admin-spin"
            />
            <p>Loading applications...</p>
          </div>
        ) : filteredApplications.length ===
          0 ? (
          <div className="admin-applications-empty">

            <div className="admin-empty-icon">
              <FileText size={30} />
            </div>

            <h3>
              No applications found
            </h3>

            <p>
              Applications submitted by students
              will appear here.
            </p>

          </div>
        ) : (
          <div className="admin-applications-table-wrapper">

            <table className="admin-applications-table">

              <thead>
                <tr>
                  <th>Student</th>
                  <th>Job / Company</th>
                  <th>Applied</th>
                  <th>Interview</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredApplications.map(
                  (application, index) => {
                    const interview =
                      application.interview ||
                      {};

                    return (
                      <tr
                        key={
                          application.id ||
                          application.applicationId ||
                          `${application.studentEmail}-${application.jobId}-${index}`
                        }
                      >

                        <td>
                          <div className="admin-student-cell">

                            <div className="admin-table-avatar">
                              {application.profilePhoto ? (
                                <img
                                  src={
                                    application.profilePhoto
                                  }
                                  alt={
                                    application.studentName
                                  }
                                />
                              ) : (
                                application.studentName
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                "S"
                              )}
                            </div>

                            <div>
                              <strong>
                                {
                                  application.studentName
                                }
                              </strong>

                              <span>
                                {
                                  application.studentEmail ||
                                  "—"
                                }
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          <div className="admin-job-cell">

                            <strong>
                              {
                                application.jobTitle
                              }
                            </strong>

                            <span>
                              <Building2
                                size={13}
                              />
                              {
                                application.companyName
                              }
                            </span>

                          </div>
                        </td>

                        <td>
                          <div className="admin-date-cell">
                            <CalendarDays
                              size={14}
                            />
                            {formatDate(
                              application.appliedAt
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="admin-interview-cell">

                            {interview.scheduled ? (
                              <>
                                <span>
                                  <CalendarDays
                                    size={13}
                                  />
                                  {formatDate(
                                    interview.date
                                  )}
                                </span>

                                <small>
                                  <Clock3
                                    size={12}
                                  />
                                  {interview.time ||
                                    "—"}
                                </small>
                              </>
                            ) : application.status ===
                              "INTERVIEW_COMPLETED" ? (
                              <span>
                                <CheckCircle2
                                  size={14}
                                />
                                Completed
                              </span>
                            ) : (
                              <span className="muted">
                                Not scheduled
                              </span>
                            )}

                          </div>
                        </td>

                        <td>
                          <span
                            className={`admin-application-status ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(
                              application.status
                            )}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-view-button"
                            onClick={() =>
                              setSelectedApplication(
                                application
                              )
                            }
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() =>
            setSelectedApplication(null)
          }
        />
      )}

    </div>
  );
}