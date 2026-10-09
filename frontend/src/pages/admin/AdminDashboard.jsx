import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserRoundCog,
  Building2,
  BriefcaseBusiness,
  ClipboardCheck,
  Video,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const APPLICATIONS_KEY = "campuslink_applications";
const NOTIFICATIONS_KEY = "campuslink_notifications";

function safeParse(value, fallback = []) {
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch {
    return fallback;
  }
}

function getRegisteredUsers() {
  const users = safeParse(
    localStorage.getItem("campuslink_registered_users") || "[]",
    []
  );

  return Array.isArray(users) ? users : [];
}

function getAllJobs() {
  const jobs = [];

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("campuslink_jobs_")) return;

    const savedJobs = safeParse(
      localStorage.getItem(key) || "[]",
      []
    );

    if (Array.isArray(savedJobs)) {
      jobs.push(...savedJobs);
    }
  });

  return jobs;
}

function getStudentProfiles() {
  const profiles = [];

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("campuslink_student_profile_")) return;

    const profile = safeParse(
      localStorage.getItem(key) || "null",
      null
    );

    if (profile && typeof profile === "object") {
      profiles.push(profile);
    }
  });

  return profiles;
}

function getRecruiterCompanies() {
  const companies = [];

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("campuslink_jobs_")) return;

    const jobs = safeParse(
      localStorage.getItem(key) || "[]",
      []
    );

    if (!Array.isArray(jobs)) return;

    jobs.forEach((job) => {
      if (job?.companyName) {
        companies.push({
          name: job.companyName,
          recruiterEmail: job.recruiterEmail || "",
        });
      }
    });
  });

  const unique = new Map();

  companies.forEach((company) => {
    const key = `${company.name}`
      .trim()
      .toLowerCase();

    if (!unique.has(key)) {
      unique.set(key, company);
    }
  });

  return [...unique.values()];
}

function getApplications() {
  const applications = safeParse(
    localStorage.getItem(APPLICATIONS_KEY) || "[]",
    []
  );

  return Array.isArray(applications) ? applications : [];
}

function getNotifications() {
  const notifications = safeParse(
    localStorage.getItem(NOTIFICATIONS_KEY) || "[]",
    []
  );

  return Array.isArray(notifications) ? notifications : [];
}

function AdminDashboard() {
  const { user } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);

  const data = useMemo(() => {
    const registeredUsers = getRegisteredUsers();
    const profiles = getStudentProfiles();
    const jobs = getAllJobs();
    const companies = getRecruiterCompanies();
    const applications = getApplications();
    const notifications = getNotifications();

    const students = registeredUsers.filter(
      (item) =>
        String(item?.role || "").toLowerCase() ===
        "student"
    );

    const recruiters = registeredUsers.filter(
      (item) =>
        String(item?.role || "").toLowerCase() ===
        "recruiter"
    );

    const activeJobs = jobs.filter(
      (job) =>
        String(job?.status || "ACTIVE").toUpperCase() ===
        "ACTIVE"
    );

    const completedInterviews = applications.filter(
      (application) =>
        String(application?.status || "").toUpperCase() ===
        "INTERVIEW_COMPLETED"
    );

    const unreadNotifications = notifications.filter(
      (notification) => !notification?.read
    );

    return {
      students,
      recruiters,
      profiles,
      jobs,
      activeJobs,
      companies,
      applications,
      completedInterviews,
      notifications,
      unreadNotifications,
    };
  }, [refreshKey]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setRefreshKey((value) => value + 1);
    };

    window.addEventListener("storage", handleStorageUpdate);

    window.addEventListener(
      "campuslink_profile_updated",
      handleStorageUpdate
    );

    window.addEventListener(
      "campuslink_notification_updated",
      handleStorageUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageUpdate
      );

      window.removeEventListener(
        "campuslink_profile_updated",
        handleStorageUpdate
      );

      window.removeEventListener(
        "campuslink_notification_updated",
        handleStorageUpdate
      );
    };
  }, []);

  const statCards = [
    {
      title: "Students",
      value: data.students.length,
      description: "Registered student accounts",
      icon: Users,
      className: "students",
    },
    {
      title: "Recruiters",
      value: data.recruiters.length,
      description: "Registered recruiter accounts",
      icon: UserRoundCog,
      className: "recruiters",
    },
    {
      title: "Companies",
      value: data.companies.length,
      description: "Companies on CampusLink",
      icon: Building2,
      className: "companies",
    },
    {
      title: "Active Jobs",
      value: data.activeJobs.length,
      description: "Currently active job postings",
      icon: BriefcaseBusiness,
      className: "jobs",
    },
    {
      title: "Applications",
      value: data.applications.length,
      description: "Total submitted applications",
      icon: ClipboardCheck,
      className: "applications",
    },
    {
      title: "Interviews Completed",
      value: data.completedInterviews.length,
      description: "Completed interview sessions",
      icon: Video,
      className: "interviews",
    },
  ];

  const adminModules = [
    {
      title: "Manage Students",
      description:
        "View and manage registered student accounts and profiles.",
      icon: Users,
      path: "/admin/students",
    },
    {
      title: "Manage Recruiters",
      description:
        "View recruiter accounts and recruiter activity.",
      icon: UserRoundCog,
      path: "/admin/recruiters",
    },
    {
      title: "Manage Companies",
      description:
        "Review companies and their job postings.",
      icon: Building2,
      path: "/admin/companies",
    },
    {
      title: "Manage Jobs",
      description:
        "Monitor job postings and their current status.",
      icon: BriefcaseBusiness,
      path: "/admin/jobs",
    },
    {
      title: "Manage Tests",
      description:
        "Manage assessment and interview test information.",
      icon: ClipboardCheck,
      path: "/admin/tests",
    },
    {
      title: "Monitor Interviews",
      description:
        "Monitor completed and active interview records.",
      icon: Video,
      path: "/admin/interviews",
    },
    {
      title: "AI/ML Configuration",
      description:
        "View AI/ML configuration and integration status.",
      icon: BrainCircuit,
      path: "/admin/ai-ml",
    },
    {
      title: "System Reports",
      description:
        "View platform statistics and system activity.",
      icon: BarChart3,
      path: "/admin/reports",
    },
    {
      title: "Platform Access",
      description:
        "Manage platform access and administrative controls.",
      icon: ShieldCheck,
      path: "/admin/access",
    },
  ];

  const handleRefresh = () => {
    setRefreshKey((value) => value + 1);
  };

  const handleModuleClick = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <div>
          <div className="admin-dashboard-eyebrow">
            <ShieldCheck size={16} />
            ADMIN CONTROL CENTER
          </div>

          <h1>Admin Dashboard</h1>

          <p>
            Manage and monitor the complete CAMPUSLINK
            platform from one place.
          </p>
        </div>

        <div className="admin-dashboard-header-actions">
          <div className="admin-user-badge">
            <ShieldCheck size={18} />
            <span>{user?.name || "CampusLink Admin"}</span>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={handleRefresh}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      <section className="admin-stat-grid">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className={`admin-stat-card ${card.className}`}
              key={card.title}
            >
              <div className="admin-stat-icon">
                <Icon size={22} />
              </div>

              <div className="admin-stat-content">
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <small>{card.description}</small>
              </div>
            </div>
          );
        })}
      </section>

      <section className="admin-overview-grid">
        <div className="admin-overview-card">
          <div className="admin-overview-card-header">
            <div>
              <span className="admin-section-label">
                PLATFORM OVERVIEW
              </span>

              <h2>CampusLink Activity</h2>
            </div>

            <BarChart3 size={22} />
          </div>

          <div className="admin-overview-list">
            <div>
              <span>Student profiles</span>
              <strong>{data.profiles.length}</strong>
            </div>

            <div>
              <span>Total job postings</span>
              <strong>{data.jobs.length}</strong>
            </div>

            <div>
              <span>Total applications</span>
              <strong>{data.applications.length}</strong>
            </div>

            <div>
              <span>Unread notifications</span>
              <strong>
                {data.unreadNotifications.length}
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-overview-card">
          <div className="admin-overview-card-header">
            <div>
              <span className="admin-section-label">
                SYSTEM STATUS
              </span>

              <h2>Platform Services</h2>
            </div>

            <ShieldCheck size={22} />
          </div>

          <div className="admin-service-list">
            <div className="admin-service-row">
              <span className="admin-status-dot active" />
              <span>Frontend</span>
              <strong>Available</strong>
            </div>

            <div className="admin-service-row">
              <span className="admin-status-dot active" />
              <span>Authentication</span>
              <strong>Available</strong>
            </div>

            <div className="admin-service-row">
              <span className="admin-status-dot active" />
              <span>Application System</span>
              <strong>Available</strong>
            </div>

            <div className="admin-service-row">
              <span className="admin-status-dot pending" />
              <span>AI/ML API</span>
              <strong>Port 8002</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-modules-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-section-label">
              ADMINISTRATION
            </span>

            <h2>Platform Management</h2>

            <p>
              Access the administrative areas of
              CAMPUSLINK.
            </p>
          </div>
        </div>

        <div className="admin-module-grid">
          {adminModules.map((module) => {
            const Icon = module.icon;

            return (
              <button
                type="button"
                className="admin-module-card"
                key={module.title}
                onClick={() =>
                  handleModuleClick(module.path)
                }
              >
                <div className="admin-module-icon">
                  <Icon size={22} />
                </div>

                <div className="admin-module-content">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>

                <ArrowRight
                  size={19}
                  className="admin-module-arrow"
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;