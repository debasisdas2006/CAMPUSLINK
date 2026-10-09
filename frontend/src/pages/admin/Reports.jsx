import { useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  BriefcaseBusiness,
  FileText,
  Video,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  Activity,
} from "lucide-react";

import "./Reports.css";

const readJSON = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const getAllJobs = () => {
  const jobs = [];

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("campuslink_jobs_")) return;

    const data = readJSON(key, []);

    if (!Array.isArray(data)) return;

    data.forEach((job) => {
      if (!job?.id) return;

      jobs.push({
        ...job,
        recruiterEmail:
          job.recruiterEmail ||
          key.replace("campuslink_jobs_", ""),
      });
    });
  });

  const unique = new Map();

  jobs.forEach((job) => {
    unique.set(job.id, job);
  });

  return Array.from(unique.values());
};

const getAllProfiles = () => {
  const profiles = [];

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("campuslink_student_profile_")) return;

    const profile = readJSON(key, null);

    if (!profile || typeof profile !== "object") return;

    profiles.push(profile);
  });

  return profiles;
};

const getAllRequirements = () => {
  const requirements = [];

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("campuslink_requirements_")) return;

    const requirement = readJSON(key, null);

    if (!requirement || typeof requirement !== "object") return;

    requirements.push({
      ...requirement,
      recruiterEmail: key.replace(
        "campuslink_requirements_",
        ""
      ),
    });
  });

  return requirements;
};

function Reports() {
  const [refreshKey, setRefreshKey] = useState(0);

  const reportData = useMemo(() => {
    const registeredUsers = readJSON(
      "campuslink_registered_users",
      []
    );

    const users = Array.isArray(registeredUsers)
      ? registeredUsers
      : [];

    const students = users.filter(
      (user) =>
        String(user?.role || "").toLowerCase() ===
        "student"
    );

    const recruiters = users.filter(
      (user) =>
        String(user?.role || "").toLowerCase() ===
        "recruiter"
    );

    const profiles = getAllProfiles();

    const jobs = getAllJobs();

    const requirements = getAllRequirements();

    const applications = readJSON(
      "campuslink_applications",
      []
    );

    const safeApplications = Array.isArray(applications)
      ? applications
      : [];

    const notifications = readJSON(
      "campuslink_notifications",
      []
    );

    const safeNotifications = Array.isArray(notifications)
      ? notifications
      : [];

    const activeJobs = jobs.filter(
      (job) =>
        String(job?.status || "ACTIVE").toUpperCase() ===
        "ACTIVE"
    );

    const inactiveJobs = jobs.filter(
      (job) =>
        String(job?.status || "").toUpperCase() ===
        "INACTIVE"
    );

    const pendingApplications =
      safeApplications.filter(
        (application) =>
          String(application?.status || "").toUpperCase() ===
          "PENDING"
      );

    const acceptedApplications =
      safeApplications.filter(
        (application) =>
          String(application?.status || "").toUpperCase() ===
          "ACCEPTED"
      );

    const scheduledApplications =
      safeApplications.filter(
        (application) =>
          String(application?.status || "").toUpperCase() ===
          "INTERVIEW_SCHEDULED"
      );

    const completedInterviews =
      safeApplications.filter(
        (application) =>
          String(application?.status || "").toUpperCase() ===
          "INTERVIEW_COMPLETED"
      );

    const selectedApplications =
      safeApplications.filter(
        (application) =>
          String(application?.status || "").toUpperCase() ===
          "SELECTED"
      );

    const rejectedApplications =
      safeApplications.filter(
        (application) =>
          String(application?.status || "").toUpperCase() ===
          "REJECTED"
      );

    const totalOpenings = jobs.reduce(
      (total, job) =>
        total + (Number(job?.openings) || 0),
      0
    );

    const notificationsUnread =
      safeNotifications.filter(
        (notification) => !notification?.read
      ).length;

    return {
      users,
      students,
      recruiters,
      profiles,
      jobs,
      activeJobs,
      inactiveJobs,
      requirements,
      applications: safeApplications,
      notifications: safeNotifications,
      pendingApplications,
      acceptedApplications,
      scheduledApplications,
      completedInterviews,
      selectedApplications,
      rejectedApplications,
      totalOpenings,
      notificationsUnread,
    };
  }, [refreshKey]);

  const applicationRate =
    reportData.applications.length > 0
      ? Math.round(
          (reportData.selectedApplications.length /
            reportData.applications.length) *
            100
        )
      : 0;

  const interviewCompletionRate =
    reportData.scheduledApplications.length > 0
      ? Math.round(
          (reportData.completedInterviews.length /
            reportData.scheduledApplications.length) *
            100
        )
      : 0;

  return (
    <div className="admin-reports-page">
      <div className="reports-header">
        <div>
          <div className="reports-eyebrow">
            ADMIN / SYSTEM REPORTS
          </div>

          <h1>System Reports</h1>

          <p>
            Monitor CampusLink platform activity,
            applications, jobs, users and interview
            statistics.
          </p>
        </div>

        <button
          className="reports-refresh-button"
          onClick={() =>
            setRefreshKey((value) => value + 1)
          }
        >
          <RefreshCw size={17} />
          Refresh Reports
        </button>
      </div>

      <section className="reports-summary-grid">
        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total Students</span>
            <strong>{reportData.students.length}</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Recruiters</span>
            <strong>{reportData.recruiters.length}</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <BriefcaseBusiness size={22} />
          </div>

          <div>
            <span>Active Jobs</span>
            <strong>{reportData.activeJobs.length}</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <FileText size={22} />
          </div>

          <div>
            <span>Applications</span>
            <strong>{reportData.applications.length}</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Video size={22} />
          </div>

          <div>
            <span>Completed Interviews</span>
            <strong>
              {reportData.completedInterviews.length}
            </strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Selected</span>
            <strong>
              {reportData.selectedApplications.length}
            </strong>
          </div>
        </div>
      </section>

      <section className="reports-main-grid">
        <div className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <span className="reports-panel-eyebrow">
                PLATFORM
              </span>
              <h2>Platform Overview</h2>
            </div>

            <BarChart3 size={22} />
          </div>

          <div className="platform-stat-list">
            <div className="platform-stat-row">
              <span>Registered Users</span>
              <strong>{reportData.users.length}</strong>
            </div>

            <div className="platform-stat-row">
              <span>Student Profiles</span>
              <strong>{reportData.profiles.length}</strong>
            </div>

            <div className="platform-stat-row">
              <span>Recruiter Requirements</span>
              <strong>
                {reportData.requirements.length}
              </strong>
            </div>

            <div className="platform-stat-row">
              <span>Total Job Openings</span>
              <strong>{reportData.totalOpenings}</strong>
            </div>

            <div className="platform-stat-row">
              <span>Inactive Jobs</span>
              <strong>
                {reportData.inactiveJobs.length}
              </strong>
            </div>

            <div className="platform-stat-row">
              <span>Unread Notifications</span>
              <strong>
                {reportData.notificationsUnread}
              </strong>
            </div>
          </div>
        </div>

        <div className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <span className="reports-panel-eyebrow">
                APPLICATIONS
              </span>
              <h2>Application Status</h2>
            </div>

            <FileText size={22} />
          </div>

          <div className="application-status-list">
            <div className="status-report-row">
              <span>
                <Clock3 size={16} />
                Pending
              </span>

              <strong>
                {reportData.pendingApplications.length}
              </strong>
            </div>

            <div className="status-report-row">
              <span>
                <CheckCircle2 size={16} />
                Accepted
              </span>

              <strong>
                {reportData.acceptedApplications.length}
              </strong>
            </div>

            <div className="status-report-row">
              <span>
                <Video size={16} />
                Interview Scheduled
              </span>

              <strong>
                {reportData.scheduledApplications.length}
              </strong>
            </div>

            <div className="status-report-row">
              <span>
                <Activity size={16} />
                Interview Completed
              </span>

              <strong>
                {reportData.completedInterviews.length}
              </strong>
            </div>

            <div className="status-report-row">
              <span>
                <CheckCircle2 size={16} />
                Selected
              </span>

              <strong>
                {reportData.selectedApplications.length}
              </strong>
            </div>

            <div className="status-report-row">
              <span>
                <XCircle size={16} />
                Rejected
              </span>

              <strong>
                {reportData.rejectedApplications.length}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="reports-main-grid">
        <div className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <span className="reports-panel-eyebrow">
                INTERVIEW
              </span>
              <h2>Interview Statistics</h2>
            </div>

            <Video size={22} />
          </div>

          <div className="metric-card-grid">
            <div className="metric-card">
              <span>Scheduled</span>
              <strong>
                {reportData.scheduledApplications.length}
              </strong>
            </div>

            <div className="metric-card">
              <span>Completed</span>
              <strong>
                {reportData.completedInterviews.length}
              </strong>
            </div>

            <div className="metric-card">
              <span>Completion Rate</span>
              <strong>
                {interviewCompletionRate}%
              </strong>
            </div>
          </div>
        </div>

        <div className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <span className="reports-panel-eyebrow">
                OUTCOME
              </span>
              <h2>Application Outcome</h2>
            </div>

            <CheckCircle2 size={22} />
          </div>

          <div className="metric-card-grid">
            <div className="metric-card">
              <span>Selected</span>
              <strong>
                {reportData.selectedApplications.length}
              </strong>
            </div>

            <div className="metric-card">
              <span>Rejected</span>
              <strong>
                {reportData.rejectedApplications.length}
              </strong>
            </div>

            <div className="metric-card">
              <span>Selection Percentage</span>
              <strong>{applicationRate}%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="reports-panel reports-health-panel">
        <div className="reports-panel-header">
          <div>
            <span className="reports-panel-eyebrow">
              SYSTEM
            </span>
            <h2>Platform Activity</h2>
          </div>

          <Activity size={22} />
        </div>

        <div className="system-health-grid">
          <div className="system-health-card">
            <div className="health-indicator"></div>

            <div>
              <strong>Student Management</strong>
              <span>
                {reportData.students.length} registered
                students
              </span>
            </div>
          </div>

          <div className="system-health-card">
            <div className="health-indicator"></div>

            <div>
              <strong>Recruiter Management</strong>
              <span>
                {reportData.recruiters.length} registered
                recruiters
              </span>
            </div>
          </div>

          <div className="system-health-card">
            <div className="health-indicator"></div>

            <div>
              <strong>Job Management</strong>
              <span>
                {reportData.activeJobs.length} active jobs
              </span>
            </div>
          </div>

          <div className="system-health-card">
            <div className="health-indicator"></div>

            <div>
              <strong>Application System</strong>
              <span>
                {reportData.applications.length} total
                applications
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Reports;