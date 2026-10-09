import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Search,
  RefreshCw,
  Eye,
  X,
  MapPin,
  Building2,
  Users,
  CalendarDays,
} from "lucide-react";

import "./StudentJobs.css";

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || ""
    );

    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function loadAllJobs() {
  const jobs = [];
  const seen = new Set();

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key) continue;

    if (!key.startsWith("campuslink_jobs_")) {
      continue;
    }

    const data = readJSON(key, []);

    if (!Array.isArray(data)) {
      continue;
    }

    data.forEach((job) => {
      if (!job || typeof job !== "object") {
        return;
      }

      const jobId =
        job.id ||
        `${key}-${job.title || "job"}-${job.companyName || ""}`;

      if (seen.has(jobId)) {
        return;
      }

      seen.add(jobId);

      jobs.push({
        ...job,
        recruiterEmail:
          job.recruiterEmail ||
          key.replace("campuslink_jobs_", ""),
      });
    });
  }

  return jobs;
}

function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [selectedJob, setSelectedJob] =
    useState(null);

  const loadJobs = () => {
    setJobs(loadAllJobs());
  };

  useEffect(() => {
    loadJobs();

    const handleStorage = () => {
      loadJobs();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [
          job.title,
          job.companyName,
          job.location,
          job.degree,
          job.experience,
          job.recruiterEmail,
          ...(job.requiredLanguages || []),
          ...(job.technicalSkills || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const jobStatus =
        String(job.status || "ACTIVE")
          .trim()
          .toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        jobStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const totalJobs = jobs.length;

  const activeJobs = jobs.filter(
    (job) =>
      String(job.status || "ACTIVE")
        .toUpperCase() === "ACTIVE"
  ).length;

  const inactiveJobs = jobs.filter(
    (job) =>
      String(job.status || "")
        .toUpperCase() === "INACTIVE"
  ).length;

  const totalOpenings = jobs.reduce(
    (total, job) =>
      total + Number(job.openings || 0),
    0
  );

  return (
    <div className="admin-student-jobs-page">

      {/* HEADER */}

      <div className="student-jobs-header">

        <div>
          <div className="student-jobs-eyebrow">
            ADMIN • STUDENT MANAGEMENT
          </div>

          <h1>
            <Briefcase size={28} />
            Student Jobs
          </h1>

          <p>
            View all job opportunities available
            across the CampusLink platform.
          </p>
        </div>

        <button
          type="button"
          className="student-jobs-refresh"
          onClick={loadJobs}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>


      {/* SUMMARY */}

      <div className="student-jobs-summary">

        <div className="student-job-stat">
          <Briefcase size={22} />

          <div>
            <span>Total Jobs</span>
            <strong>{totalJobs}</strong>
          </div>
        </div>

        <div className="student-job-stat">
          <Briefcase size={22} />

          <div>
            <span>Active Jobs</span>
            <strong>{activeJobs}</strong>
          </div>
        </div>

        <div className="student-job-stat">
          <Users size={22} />

          <div>
            <span>Total Openings</span>
            <strong>{totalOpenings}</strong>
          </div>
        </div>

        <div className="student-job-stat">
          <Briefcase size={22} />

          <div>
            <span>Inactive Jobs</span>
            <strong>{inactiveJobs}</strong>
          </div>
        </div>

      </div>


      {/* FILTER BAR */}

      <div className="student-jobs-toolbar">

        <div className="student-jobs-search">

          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search jobs, companies, skills..."
          />

        </div>

        <div className="student-jobs-filters">

          {[
            "ALL",
            "ACTIVE",
            "INACTIVE",
          ].map((status) => (
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
              {status}
            </button>
          ))}

        </div>

      </div>


      {/* JOB LIST */}

      <div className="student-jobs-grid">

        {filteredJobs.length === 0 ? (

          <div className="student-jobs-empty">

            <Briefcase size={46} />

            <h3>
              No jobs found
            </h3>

            <p>
              There are no job records matching
              the current search or filter.
            </p>

          </div>

        ) : (

          filteredJobs.map((job) => {

            const status =
              String(
                job.status || "ACTIVE"
              ).toUpperCase();

            return (
              <div
                className="student-job-card"
                key={job.id}
              >

                <div className="student-job-card-top">

                  <div className="student-job-icon">
                    <Briefcase size={23} />
                  </div>

                  <span
                    className={
                      status === "ACTIVE"
                        ? "job-status active"
                        : "job-status inactive"
                    }
                  >
                    {status}
                  </span>

                </div>


                <h2>
                  {job.title ||
                    "Untitled Job"}
                </h2>


                <div className="student-job-company">

                  <Building2 size={16} />

                  <span>
                    {job.companyName ||
                      "Company not specified"}
                  </span>

                </div>


                <div className="student-job-info">

                  <div>
                    <MapPin size={15} />

                    <span>
                      {job.location ||
                        "Location not specified"}
                    </span>
                  </div>

                  <div>
                    <Users size={15} />

                    <span>
                      {job.openings || 0}
                      {" "}opening(s)
                    </span>
                  </div>

                  <div>
                    <CalendarDays size={15} />

                    <span>
                      {job.deadline ||
                        "No deadline"}
                    </span>
                  </div>

                </div>


                <div className="student-job-tags">

                  {(job.technicalSkills || [])
                    .slice(0, 5)
                    .map((skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    ))}

                </div>


                <button
                  type="button"
                  className="student-job-view"
                  onClick={() =>
                    setSelectedJob(job)
                  }
                >
                  <Eye size={16} />
                  View Job Details
                </button>

              </div>
            );
          })
        )}

      </div>


      {/* DETAILS MODAL */}

      {selectedJob && (

        <div
          className="student-job-modal-overlay"
          onClick={() =>
            setSelectedJob(null)
          }
        >

          <div
            className="student-job-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="student-job-modal-header">

              <div>
                <span>
                  ADMIN • JOB DETAILS
                </span>

                <h2>
                  {selectedJob.title ||
                    "Job Details"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedJob(null)
                }
              >
                <X size={21} />
              </button>

            </div>


            <div className="student-job-modal-content">

              <div className="student-job-detail">

                <label>
                  Company
                </label>

                <p>
                  {selectedJob.companyName ||
                    "—"}
                </p>

              </div>

              <div className="student-job-detail">

                <label>
                  Recruiter Email
                </label>

                <p>
                  {selectedJob.recruiterEmail ||
                    "—"}
                </p>

              </div>

              <div className="student-job-detail">

                <label>
                  Location
                </label>

                <p>
                  {selectedJob.location ||
                    "—"}
                </p>

              </div>

              <div className="student-job-detail">

                <label>
                  Employment Type
                </label>

                <p>
                  {selectedJob.employmentType ||
                    "—"}
                </p>

              </div>

              <div className="student-job-detail">

                <label>
                  Degree
                </label>

                <p>
                  {selectedJob.degree ||
                    "—"}
                </p>

              </div>

              <div className="student-job-detail">

                <label>
                  Minimum CGPA
                </label>

                <p>
                  {selectedJob.minimumCGPA ??
                    "—"}
                </p>

              </div>

              <div className="student-job-detail">

                <label>
                  Experience
                </label>

                <p>
                  {selectedJob.experience ||
                    "—"}
                </p>

              </div>

              <div className="student-job-detail">

                <label>
                  Openings
                </label>

                <p>
                  {selectedJob.openings ??
                    "—"}
                </p>

              </div>

              <div className="student-job-detail">

                <label>
                  Deadline
                </label>

                <p>
                  {selectedJob.deadline ||
                    "—"}
                </p>

              </div>


              <div className="student-job-detail full">

                <label>
                  Required Languages
                </label>

                <p>
                  {(
                    selectedJob.requiredLanguages ||
                    []
                  ).join(", ") || "—"}
                </p>

              </div>


              <div className="student-job-detail full">

                <label>
                  Technical Skills
                </label>

                <p>
                  {(
                    selectedJob.technicalSkills ||
                    []
                  ).join(", ") || "—"}
                </p>

              </div>


              <div className="student-job-detail full">

                <label>
                  Description
                </label>

                <p>
                  {selectedJob.description ||
                    "No description available."}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default StudentJobs;