import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserRoundCog,
  Mail,
  Building2,
  BriefcaseBusiness,
  X,
  RefreshCw,
} from "lucide-react";

import "./Recruiters.css";

const REGISTERED_USERS_KEY = "campuslink_registered_users";

function safeParse(value, fallback = []) {
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch {
    return fallback;
  }
}

function getRegisteredRecruiters() {
  const users = safeParse(
    localStorage.getItem(REGISTERED_USERS_KEY) || "[]",
    []
  );

  return Array.isArray(users)
    ? users.filter(
        (user) =>
          String(user?.role || "").toLowerCase() ===
          "recruiter"
      )
    : [];
}

function getRecruiterJobs(email) {
  if (!email) return [];

  const cleanEmail = String(email).trim();

  const possibleKeys = [
    `campuslink_jobs_${cleanEmail}`,
    `campuslink_jobs_${cleanEmail.toLowerCase()}`,
  ];

  for (const key of [...new Set(possibleKeys)]) {
    const jobs = safeParse(
      localStorage.getItem(key) || "[]",
      []
    );

    if (Array.isArray(jobs)) {
      return jobs;
    }
  }

  return [];
}

function getRecruiterRequirements(email) {
  if (!email) return null;

  const cleanEmail = String(email).trim();

  const possibleKeys = [
    `campuslink_requirements_${cleanEmail}`,
    `campuslink_requirements_${cleanEmail.toLowerCase()}`,
  ];

  for (const key of [...new Set(possibleKeys)]) {
    const requirements = safeParse(
      localStorage.getItem(key) || "null",
      null
    );

    if (
      requirements &&
      typeof requirements === "object"
    ) {
      return requirements;
    }
  }

  return null;
}

function buildRecruiters() {
  const recruiters = getRegisteredRecruiters();

  return recruiters.map((recruiter, index) => {
    const email = String(recruiter?.email || "")
      .trim()
      .toLowerCase();

    const jobs = getRecruiterJobs(email);
    const requirements =
      getRecruiterRequirements(email);

    const companies = [
      ...new Set(
        jobs
          .map((job) =>
            String(job?.companyName || "").trim()
          )
          .filter(Boolean)
      ),
    ];

    return {
      ...recruiter,
      id:
        recruiter.id ||
        `RECRUITER-${index + 1}`,
      name:
        recruiter.name ||
        "CampusLink Recruiter",
      email: recruiter.email || email,
      company:
        recruiter.company ||
        companies[0] ||
        "",
      jobs,
      requirements,
      companies,
    };
  });
}

function Recruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] =
    useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadRecruiters = () => {
    setRecruiters(buildRecruiters());
  };

  useEffect(() => {
    loadRecruiters();

    const handleUpdate = () => {
      loadRecruiters();
    };

    window.addEventListener("storage", handleUpdate);

    window.addEventListener(
      "campuslink_notification_updated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleUpdate
      );

      window.removeEventListener(
        "campuslink_notification_updated",
        handleUpdate
      );
    };
  }, [refreshKey]);

  const filteredRecruiters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return recruiters;

    return recruiters.filter((recruiter) => {
      const searchableText = [
        recruiter.name,
        recruiter.email,
        recruiter.company,
        ...recruiter.companies,
        ...recruiter.jobs.map((job) => job.title),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [recruiters, search]);

  const totalJobs = recruiters.reduce(
    (total, recruiter) =>
      total + recruiter.jobs.length,
    0
  );

  const companies = [
    ...new Set(
      recruiters.flatMap(
        (recruiter) => recruiter.companies
      )
    ),
  ];

  return (
    <div className="admin-recruiters-page">
      <div className="admin-recruiters-header">
        <div>
          <div className="admin-recruiters-eyebrow">
            <UserRoundCog size={16} />
            RECRUITER MANAGEMENT
          </div>

          <h1>Manage Recruiters</h1>

          <p>
            View recruiter accounts, companies,
            requirements and job activity.
          </p>
        </div>

        <button
          type="button"
          className="admin-recruiters-refresh"
          onClick={() =>
            setRefreshKey((value) => value + 1)
          }
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="admin-recruiters-summary">
        <div className="admin-recruiter-summary-card">
          <UserRoundCog size={21} />

          <div>
            <span>Total Recruiters</span>
            <strong>{recruiters.length}</strong>
          </div>
        </div>

        <div className="admin-recruiter-summary-card">
          <Building2 size={21} />

          <div>
            <span>Companies</span>
            <strong>{companies.length}</strong>
          </div>
        </div>

        <div className="admin-recruiter-summary-card">
          <BriefcaseBusiness size={21} />

          <div>
            <span>Job Postings</span>
            <strong>{totalJobs}</strong>
          </div>
        </div>
      </div>

      <div className="admin-recruiters-toolbar">
        <div className="admin-recruiters-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search recruiter, company or job..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <span>
          Showing {filteredRecruiters.length} of{" "}
          {recruiters.length}
        </span>
      </div>

      <section className="admin-recruiters-list">
        {filteredRecruiters.length === 0 ? (
          <div className="admin-recruiters-empty">
            <UserRoundCog size={42} />

            <h2>No recruiters found</h2>

            <p>
              {search
                ? "Try a different search term."
                : "No recruiter accounts are available yet."}
            </p>
          </div>
        ) : (
          filteredRecruiters.map((recruiter) => (
            <div
              className="admin-recruiter-card"
              key={recruiter.email}
            >
              <div className="admin-recruiter-avatar">
                <UserRoundCog size={25} />
              </div>

              <div className="admin-recruiter-main">
                <h3>{recruiter.name}</h3>

                <div className="admin-recruiter-email">
                  <Mail size={14} />
                  {recruiter.email}
                </div>

                <div className="admin-recruiter-meta">
                  {recruiter.company && (
                    <span>
                      <Building2 size={14} />
                      {recruiter.company}
                    </span>
                  )}

                  <span>
                    <BriefcaseBusiness size={14} />
                    {recruiter.jobs.length} job
                    {recruiter.jobs.length === 1
                      ? ""
                      : "s"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="admin-recruiter-view-button"
                onClick={() =>
                  setSelectedRecruiter(recruiter)
                }
              >
                View Details
              </button>
            </div>
          ))
        )}
      </section>

      {selectedRecruiter && (
        <div
          className="admin-recruiter-modal-overlay"
          onClick={() =>
            setSelectedRecruiter(null)
          }
        >
          <div
            className="admin-recruiter-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-recruiter-modal-header">
              <div>
                <span>RECRUITER PROFILE</span>
                <h2>{selectedRecruiter.name}</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRecruiter(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-recruiter-profile">
              <div className="admin-recruiter-profile-icon">
                <UserRoundCog size={30} />
              </div>

              <div>
                <h3>{selectedRecruiter.name}</h3>

                <p>{selectedRecruiter.email}</p>

                <span>Recruiter Account</span>
              </div>
            </div>

            <div className="admin-recruiter-details">
              <div>
                <span>Company</span>

                <strong>
                  {selectedRecruiter.company ||
                    selectedRecruiter.companies[0] ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Total Jobs</span>

                <strong>
                  {selectedRecruiter.jobs.length}
                </strong>
              </div>

              <div>
                <span>Requirements</span>

                <strong>
                  {selectedRecruiter.requirements
                    ? "Configured"
                    : "Not configured"}
                </strong>
              </div>

              <div>
                <span>Account Role</span>

                <strong>Recruiter</strong>
              </div>
            </div>

            <div className="admin-recruiter-section">
              <h3>Companies</h3>

              {selectedRecruiter.companies.length ? (
                <div className="admin-recruiter-tags">
                  {selectedRecruiter.companies.map(
                    (company) => (
                      <span key={company}>
                        {company}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p>No company information available.</p>
              )}
            </div>

            <div className="admin-recruiter-section">
              <h3>Job Postings</h3>

              {selectedRecruiter.jobs.length ? (
                <div className="admin-recruiter-jobs">
                  {selectedRecruiter.jobs.map(
                    (job) => (
                      <div
                        className="admin-recruiter-job"
                        key={job.id || job.title}
                      >
                        <div>
                          <strong>
                            {job.title ||
                              "Untitled Job"}
                          </strong>

                          <span>
                            {job.companyName ||
                              "Company not provided"}
                          </span>
                        </div>

                        <small>
                          {job.status ||
                            "ACTIVE"}
                        </small>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>No jobs created yet.</p>
              )}
            </div>

            <div className="admin-recruiter-section">
              <h3>Recruiter Requirements</h3>

              {selectedRecruiter.requirements ? (
                <div className="admin-recruiter-requirements">
                  <div>
                    <span>Degree</span>
                    <strong>
                      {
                        selectedRecruiter
                          .requirements.degree
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Minimum CGPA</span>
                    <strong>
                      {
                        selectedRecruiter
                          .requirements.minimumCGPA
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Experience</span>
                    <strong>
                      {
                        selectedRecruiter
                          .requirements.experience
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Minimum Match</span>
                    <strong>
                      {
                        selectedRecruiter
                          .requirements.minimumMatchScore
                      }
                      %
                    </strong>
                  </div>
                </div>
              ) : (
                <p>
                  Recruiter requirements have not been
                  configured.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recruiters;