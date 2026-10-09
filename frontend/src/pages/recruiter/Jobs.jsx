import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  MapPin,
  Plus,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./Jobs.css";

function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =====================================================
     LOAD JOBS
  ===================================================== */

  useEffect(() => {
    if (!user?.email) {
      setJobs([]);
      return;
    }

    try {
      const storageKey = `campuslink_jobs_${user.email}`;

      const savedJobs = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );

      setJobs(
        Array.isArray(savedJobs)
          ? savedJobs
          : []
      );
    } catch (error) {
      console.error(
        "Could not load recruiter jobs:",
        error
      );

      setJobs([]);
    }
  }, [user?.email]);

  /* =====================================================
     FILTERED JOBS
  ===================================================== */

  const filteredJobs = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        String(job.title || "")
          .toLowerCase()
          .includes(search) ||
        String(job.companyName || "")
          .toLowerCase()
          .includes(search) ||
        String(job.location || "")
          .toLowerCase()
          .includes(search);

      const status = String(
        job.status || "ACTIVE"
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    jobs,
    searchTerm,
    statusFilter,
  ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const activeJobs = jobs.filter(
    (job) =>
      String(job.status || "ACTIVE")
        .toUpperCase() === "ACTIVE"
  ).length;

  const closedJobs = jobs.filter(
    (job) =>
      String(job.status || "")
        .toUpperCase() === "CLOSED"
  ).length;

  const totalOpenings = jobs.reduce(
    (total, job) =>
      total + Number(job.openings || 0),
    0
  );

  /* =====================================================
     SAVE JOBS
  ===================================================== */

  const saveJobs = (updatedJobs) => {
    if (!user?.email) return;

    const storageKey =
      `campuslink_jobs_${user.email}`;

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedJobs)
    );

    setJobs(updatedJobs);
  };

  /* =====================================================
     CLOSE / REOPEN
  ===================================================== */

  const handleCloseJob = (job) => {
    const confirmed = window.confirm(
      `Close "${job.title}"?`
    );

    if (!confirmed) return;

    saveJobs(
      jobs.map((item) =>
        item.id === job.id
          ? {
              ...item,
              status: "CLOSED",
            }
          : item
      )
    );
  };

  const handleReopenJob = (job) => {
    saveJobs(
      jobs.map((item) =>
        item.id === job.id
          ? {
              ...item,
              status: "ACTIVE",
            }
          : item
      )
    );
  };

  /* =====================================================
     VIEW
  ===================================================== */

  const handleViewJob = (job) => {
    alert(
      `Job Details\n\n` +
      `Position: ${job.title}\n` +
      `Company: ${job.companyName}\n` +
      `Location: ${job.location}\n` +
      `Openings: ${job.openings}\n` +
      `Status: ${job.status || "ACTIVE"}`
    );
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEditJob = () => {
    alert(
      "Job editing will be connected to the backend in the integration stage."
    );
  };

  return (
    <div className="recruiter-jobs-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="recruiter-jobs-header">

        <div className="recruiter-jobs-header-content">

          <div className="recruiter-jobs-kicker">
            RECRUITER PORTAL
          </div>

          <h1>
            Job Management
          </h1>

          <p>
            Create, manage and monitor your company
            job opportunities.
          </p>

        </div>

        <button
          type="button"
          className="recruiter-create-job-button"
          onClick={() =>
            navigate(
              "/recruiter/jobs/create"
            )
          }
        >
          <Plus size={18} />
          <span>Create New Job</span>
        </button>

      </section>


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <section className="recruiter-jobs-stats">

        <div className="recruiter-job-stat-card">

          <div className="recruiter-job-stat-icon blue">
            <Briefcase size={21} />
          </div>

          <div>
            <span>Total Jobs</span>
            <strong>{jobs.length}</strong>
          </div>

        </div>


        <div className="recruiter-job-stat-card">

          <div className="recruiter-job-stat-icon green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Active Jobs</span>
            <strong>{activeJobs}</strong>
          </div>

        </div>


        <div className="recruiter-job-stat-card">

          <div className="recruiter-job-stat-icon orange">
            <Users size={21} />
          </div>

          <div>
            <span>Total Openings</span>
            <strong>{totalOpenings}</strong>
          </div>

        </div>


        <div className="recruiter-job-stat-card">

          <div className="recruiter-job-stat-icon red">
            <XCircle size={21} />
          </div>

          <div>
            <span>Closed Jobs</span>
            <strong>{closedJobs}</strong>
          </div>

        </div>

      </section>


      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <section className="recruiter-jobs-toolbar">

        <div className="recruiter-search-box">

          <Search size={18} />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search jobs, company or location..."
          />

        </div>


        <div className="recruiter-job-filters">

          <button
            type="button"
            className={
              statusFilter === "ALL"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setStatusFilter("ALL")
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              statusFilter === "ACTIVE"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setStatusFilter("ACTIVE")
            }
          >
            Active
          </button>

          <button
            type="button"
            className={
              statusFilter === "CLOSED"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setStatusFilter("CLOSED")
            }
          >
            Closed
          </button>

        </div>

      </section>


      {/* =================================================
          RESULTS HEADER
      ================================================= */}

      <div className="recruiter-jobs-results-header">

        <div>
          <h2>
            Your Job Opportunities
          </h2>

          <p>
            {filteredJobs.length} job
            {filteredJobs.length !== 1
              ? "s"
              : ""}{" "}
            found
          </p>
        </div>

        <span className="recruiter-results-badge">
          {statusFilter === "ALL"
            ? "All Jobs"
            : statusFilter === "ACTIVE"
              ? "Active Jobs"
              : "Closed Jobs"}
        </span>

      </div>


      {/* =================================================
          JOB LIST
      ================================================= */}

      {filteredJobs.length === 0 ? (

        <section className="recruiter-jobs-empty">

          <div className="recruiter-empty-icon">
            <Briefcase size={31} />
          </div>

          <h2>
            No Jobs Found
          </h2>

          <p>
            {jobs.length === 0
              ? "You have not created any job opportunities yet."
              : "No jobs match your current search or filter."}
          </p>

          {jobs.length === 0 && (
            <button
              type="button"
              className="recruiter-empty-button"
              onClick={() =>
                navigate(
                  "/recruiter/jobs/create"
                )
              }
            >
              <Plus size={17} />
              Create Your First Job
            </button>
          )}

        </section>

      ) : (

        <section className="recruiter-jobs-list">

          {filteredJobs.map((job) => {

            const status =
              String(
                job.status || "ACTIVE"
              ).toUpperCase();

            return (

              <article
                className="recruiter-job-card"
                key={job.id}
              >

                {/* JOB TOP */}

                <div className="recruiter-job-card-top">

                  <div className="recruiter-job-title-wrapper">

                    <div className="recruiter-job-main-icon">
                      <Briefcase size={21} />
                    </div>

                    <div>

                      <h2>
                        {job.title}
                      </h2>

                      <p>
                        {job.companyName ||
                          "Company not specified"}
                      </p>

                    </div>

                  </div>


                  <span
                    className={
                      status === "ACTIVE"
                        ? "job-status active"
                        : "job-status closed"
                    }
                  >
                    {status === "ACTIVE"
                      ? "ACTIVE"
                      : "CLOSED"}
                  </span>

                </div>


                {/* META */}

                <div className="recruiter-job-meta">

                  <span>
                    <MapPin size={15} />
                    {job.location ||
                      "Location not specified"}
                  </span>

                  <span>
                    <Briefcase size={15} />
                    {job.employmentType ||
                      "Full Time"}
                  </span>

                  <span>
                    <Users size={15} />
                    {job.openings || 0} Openings
                  </span>

                  <span>
                    <CalendarDays size={15} />
                    {job.deadline ||
                      "No deadline"}
                  </span>

                </div>


                {/* REQUIREMENTS */}

                <div className="recruiter-job-requirements">

                  <div className="requirement-box">

                    <span>
                      Degree
                    </span>

                    <strong>
                      {job.degree ||
                        "Not specified"}
                    </strong>

                  </div>


                  <div className="requirement-box">

                    <span>
                      Minimum CGPA
                    </span>

                    <strong>
                      {job.minimumCGPA ??
                        "Not specified"}
                    </strong>

                  </div>


                  <div className="requirement-box">

                    <span>
                      Experience
                    </span>

                    <strong>
                      {job.experience ||
                        "Not specified"}
                    </strong>

                  </div>

                </div>


                {/* SKILLS */}

                {Array.isArray(
                  job.technicalSkills
                ) &&
                  job.technicalSkills.length > 0 && (

                    <div className="recruiter-job-skills">

                      <span className="skills-title">
                        Technical Skills
                      </span>

                      <div className="skills-list">

                        {job.technicalSkills
                          .slice(0, 8)
                          .map((skill) => (
                            <span
                              key={skill}
                            >
                              {skill}
                            </span>
                          ))}

                      </div>

                    </div>

                  )}


                {/* ACTIONS */}

                <div className="recruiter-job-actions">

                  <button
                    type="button"
                    className="job-view-button"
                    onClick={() =>
                      handleViewJob(job)
                    }
                  >
                    <Eye size={16} />
                    View
                  </button>


                  <button
                    type="button"
                    className="job-edit-button"
                    onClick={
                      handleEditJob
                    }
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>


                  {status === "ACTIVE" ? (

                    <button
                      type="button"
                      className="job-close-button"
                      onClick={() =>
                        handleCloseJob(job)
                      }
                    >
                      <XCircle size={16} />
                      Close Job
                    </button>

                  ) : (

                    <button
                      type="button"
                      className="job-reopen-button"
                      onClick={() =>
                        handleReopenJob(job)
                      }
                    >
                      <CheckCircle2 size={16} />
                      Reopen
                    </button>

                  )}

                </div>

              </article>

            );
          })}

        </section>

      )}

    </div>
  );
}

export default Jobs;