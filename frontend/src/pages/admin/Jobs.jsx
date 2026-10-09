import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import "./Jobs.css";

const USERS_KEY = "campuslink_registered_users";

function safeParse(value, fallback = null) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function formatDate(date) {
  if (!date) return "Not specified";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString();
}

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedJob, setSelectedJob] = useState(null);

  const loadJobs = () => {
    const allJobs = [];

    let users = safeParse(
      localStorage.getItem(USERS_KEY) || "[]",
      []
    );

    if (!Array.isArray(users)) {
      users = [];
    }

    const recruiters = users.filter(
      (user) =>
        normalize(user.role) === "recruiter"
    );

    recruiters.forEach((recruiter) => {
      const recruiterEmail =
        String(recruiter.email || "").trim();

      if (!recruiterEmail) return;

      const jobsKey =
        `campuslink_jobs_${recruiterEmail}`;

      const recruiterJobs = safeParse(
        localStorage.getItem(jobsKey) || "[]",
        []
      );

      if (!Array.isArray(recruiterJobs)) {
        return;
      }

      recruiterJobs.forEach((job) => {
        allJobs.push({
          ...job,
          recruiterName:
            recruiter.name ||
            "Recruiter",
          recruiterEmail,
          recruiterCompany:
            recruiter.company ||
            recruiter.companyName ||
            "",
        });
      });
    });

    /*
      Also discover job collections directly from
      localStorage so jobs can still appear if a
      recruiter record is unavailable.
    */

    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith("campuslink_jobs_")) {
        return;
      }

      const recruiterEmail =
        key.replace(
          "campuslink_jobs_",
          ""
        );

      const storedJobs = safeParse(
        localStorage.getItem(key) || "[]",
        []
      );

      if (!Array.isArray(storedJobs)) {
        return;
      }

      storedJobs.forEach((job) => {
        const jobId =
          job.id ||
          `${job.title}-${job.companyName}-${recruiterEmail}`;

        const alreadyExists =
          allJobs.some(
            (item) =>
              item.id === jobId
          );

        if (alreadyExists) return;

        allJobs.push({
          ...job,
          recruiterName:
            job.recruiterName ||
            "Recruiter",
          recruiterEmail,
          recruiterCompany:
            job.companyName ||
            "",
        });
      });
    });

    /*
      Remove accidental duplicates.
    */

    const uniqueJobs = [];
    const seen = new Set();

    allJobs.forEach((job) => {
      const uniqueKey =
        job.id ||
        `${job.title}-${job.companyName}-${job.recruiterEmail}`;

      if (seen.has(uniqueKey)) {
        return;
      }

      seen.add(uniqueKey);
      uniqueJobs.push(job);
    });

    uniqueJobs.sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );

    setJobs(uniqueJobs);
  };

  useEffect(() => {
    loadJobs();

    const handleUpdate = () => {
      loadJobs();
    };

    window.addEventListener(
      "campuslink_profile_updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "campuslink_profile_updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const query = normalize(search);

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        normalize(
          [
            job.title,
            job.companyName,
            job.location,
            job.degree,
            job.experience,
            job.recruiterName,
            job.recruiterEmail,
            ...(Array.isArray(
              job.requiredLanguages
            )
              ? job.requiredLanguages
              : []),
            ...(Array.isArray(
              job.technicalSkills
            )
              ? job.technicalSkills
              : []),
          ].join(" ")
        ).includes(query);

      const jobStatus =
        normalize(job.status || "ACTIVE");

      const matchesStatus =
        statusFilter === "ALL" ||
        jobStatus ===
          normalize(statusFilter);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [jobs, search, statusFilter]);

  const totalActive = jobs.filter(
    (job) =>
      normalize(job.status || "ACTIVE") ===
      "active"
  ).length;

  const totalInactive = jobs.filter(
    (job) =>
      normalize(job.status || "") ===
      "inactive"
  ).length;

  const totalOpenings = jobs.reduce(
    (total, job) =>
      total +
      Number(job.openings || 0),
    0
  );

  return (
    <div className="admin-jobs-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="admin-jobs-header">

        <div>
          <div className="admin-jobs-eyebrow">
            ADMINISTRATION
          </div>

          <h1>
            Manage Jobs
          </h1>

          <p>
            Monitor all job postings created
            by CampusLink recruiters.
          </p>
        </div>

        <button
          className="admin-jobs-refresh"
          onClick={loadJobs}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>


      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="admin-job-summary">

        <div className="admin-job-summary-card">

          <div className="admin-job-summary-icon">
            <BriefcaseBusiness size={22} />
          </div>

          <div>
            <span>
              Total Jobs
            </span>

            <strong>
              {jobs.length}
            </strong>
          </div>

        </div>


        <div className="admin-job-summary-card">

          <div className="admin-job-summary-icon">
            <BriefcaseBusiness size={22} />
          </div>

          <div>
            <span>
              Active Jobs
            </span>

            <strong>
              {totalActive}
            </strong>
          </div>

        </div>


        <div className="admin-job-summary-card">

          <div className="admin-job-summary-icon">
            <Users size={22} />
          </div>

          <div>
            <span>
              Total Openings
            </span>

            <strong>
              {totalOpenings}
            </strong>
          </div>

        </div>


        <div className="admin-job-summary-card">

          <div className="admin-job-summary-icon">
            <X size={22} />
          </div>

          <div>
            <span>
              Inactive Jobs
            </span>

            <strong>
              {totalInactive}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================
          FILTER
      ===================================== */}

      <div className="admin-jobs-filter">

        <div className="admin-job-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search job, company, recruiter, skill..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

        </div>


        <div className="admin-job-status-filter">

          <button
            className={
              statusFilter === "ALL"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("ALL")
            }
          >
            All
          </button>

          <button
            className={
              statusFilter === "ACTIVE"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("ACTIVE")
            }
          >
            Active
          </button>

          <button
            className={
              statusFilter === "INACTIVE"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("INACTIVE")
            }
          >
            Inactive
          </button>

        </div>

      </div>


      {/* =====================================
          JOB LIST
      ===================================== */}

      {filteredJobs.length === 0 ? (

        <div className="admin-jobs-empty">

          <BriefcaseBusiness size={42} />

          <h3>
            No jobs found
          </h3>

          <p>
            Job postings created by recruiters
            will appear here.
          </p>

        </div>

      ) : (

        <div className="admin-job-grid">

          {filteredJobs.map((job, index) => {

            const status =
              String(
                job.status || "ACTIVE"
              ).toUpperCase();

            return (
              <div
                className="admin-job-card"
                key={
                  job.id ||
                  `${job.title}-${index}`
                }
              >

                <div className="admin-job-card-header">

                  <div className="admin-job-icon">
                    <BriefcaseBusiness size={24} />
                  </div>

                  <span
                    className={`admin-job-status ${status.toLowerCase()}`}
                  >
                    {status}
                  </span>

                </div>


                <h3>
                  {job.title ||
                    "Untitled Job"}
                </h3>


                <div className="admin-job-company">

                  <Building2 size={16} />

                  <span>
                    {job.companyName ||
                      job.recruiterCompany ||
                      "Company not specified"}
                  </span>

                </div>


                <div className="admin-job-location">

                  <MapPin size={15} />

                  <span>
                    {job.location ||
                      "Location not specified"}
                  </span>

                </div>


                <div className="admin-job-card-stats">

                  <div>
                    <Users size={15} />

                    <span>
                      {Number(
                        job.openings || 0
                      )}{" "}
                      Opening
                      {Number(
                        job.openings || 0
                      ) !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div>
                    <CalendarDays size={15} />

                    <span>
                      {formatDate(
                        job.deadline
                      )}
                    </span>
                  </div>

                </div>


                <button
                  className="admin-job-view"
                  onClick={() =>
                    setSelectedJob(job)
                  }
                >
                  View Job Details
                </button>

              </div>
            );
          })}

        </div>

      )}


      {/* =====================================
          JOB DETAILS MODAL
      ===================================== */}

      {selectedJob && (

        <div
          className="admin-job-modal-overlay"
          onClick={() =>
            setSelectedJob(null)
          }
        >

          <div
            className="admin-job-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-job-modal-header">

              <div>
                <div className="admin-job-modal-icon">
                  <BriefcaseBusiness size={25} />
                </div>

                <div>
                  <h2>
                    {selectedJob.title ||
                      "Job Details"}
                  </h2>

                  <span>
                    {selectedJob.companyName ||
                      "Company not specified"}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedJob(null)
                }
                aria-label="Close"
              >
                <X size={21} />
              </button>

            </div>


            {/* =================================
                RECRUITER
            ================================= */}

            <div className="admin-job-detail-section">

              <h3>
                Recruiter
              </h3>

              <div className="admin-job-recruiter-box">

                <UserRound size={19} />

                <div>
                  <strong>
                    {selectedJob.recruiterName ||
                      "Recruiter"}
                  </strong>

                  <span>
                    {selectedJob.recruiterEmail ||
                      "Email not available"}
                  </span>
                </div>

              </div>

            </div>


            {/* =================================
                JOB INFORMATION
            ================================= */}

            <div className="admin-job-detail-section">

              <h3>
                Job Information
              </h3>

              <div className="admin-job-info-grid">

                <div>
                  <span>
                    Location
                  </span>

                  <strong>
                    {selectedJob.location ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>
                    Employment Type
                  </span>

                  <strong>
                    {selectedJob.employmentType ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>
                    Openings
                  </span>

                  <strong>
                    {selectedJob.openings ||
                      0}
                  </strong>
                </div>

                <div>
                  <span>
                    Deadline
                  </span>

                  <strong>
                    {formatDate(
                      selectedJob.deadline
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Degree
                  </span>

                  <strong>
                    {selectedJob.degree ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>
                    Minimum CGPA
                  </span>

                  <strong>
                    {selectedJob.minimumCGPA ??
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>
                    Experience
                  </span>

                  <strong>
                    {selectedJob.experience ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>
                    Interview
                  </span>

                  <strong>
                    {selectedJob.interviewRequired
                      ? "Required"
                      : "Not Required"}
                  </strong>
                </div>

              </div>

            </div>


            {/* =================================
                DESCRIPTION
            ================================= */}

            <div className="admin-job-detail-section">

              <h3>
                Description
              </h3>

              <p className="admin-job-description">
                {selectedJob.description ||
                  "No job description provided."}
              </p>

            </div>


            {/* =================================
                LANGUAGES
            ================================= */}

            <div className="admin-job-detail-section">

              <h3>
                Required Languages
              </h3>

              {Array.isArray(
                selectedJob.requiredLanguages
              ) &&
              selectedJob.requiredLanguages.length > 0 ? (

                <div className="admin-job-tags">

                  {selectedJob.requiredLanguages.map(
                    (language, index) => (
                      <span
                        key={`${language}-${index}`}
                      >
                        {language}
                      </span>
                    )
                  )}

                </div>

              ) : (

                <p className="admin-job-muted">
                  No specific languages listed.
                </p>

              )}

            </div>


            {/* =================================
                TECHNICAL SKILLS
            ================================= */}

            <div className="admin-job-detail-section">

              <h3>
                Technical Skills
              </h3>

              {Array.isArray(
                selectedJob.technicalSkills
              ) &&
              selectedJob.technicalSkills.length > 0 ? (

                <div className="admin-job-tags">

                  {selectedJob.technicalSkills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              ) : (

                <p className="admin-job-muted">
                  No technical skills listed.
                </p>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Jobs;