import { useMemo } from "react";
import {
  BriefcaseBusiness,
  Users,
  FileCheck2,
  Video,
  Plus,
  ClipboardList,
  UserRoundSearch,
  Settings,
  Building2,
  ArrowRight,
  Clock3,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  TrendingUp,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./RecruiterDashboard.css";

/* =========================================================
   HELPERS
========================================================= */

function readJSON(key, fallback = []) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || "null"
    );

    return value ?? fallback;
  } catch (error) {
    console.error(
      `Could not read localStorage key: ${key}`,
      error
    );

    return fallback;
  }
}

function getAllRecruiterJobs(email) {
  const jobs = readJSON(
    `campuslink_jobs_${email}`,
    []
  );

  return Array.isArray(jobs) ? jobs : [];
}

function getApplications() {
  const applications = readJSON(
    "campuslink_applications",
    []
  );

  return Array.isArray(applications)
    ? applications
    : [];
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not scheduled";
  }

  try {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return String(dateValue);
  }
}

function formatTime(timeValue) {
  if (!timeValue) {
    return "";
  }

  return String(timeValue);
}

function getStatusClass(status) {
  const value = String(
    status || ""
  ).toUpperCase();

  if (
    value.includes("ACCEPT") ||
    value.includes("SELECT") ||
    value.includes("COMPLETED")
  ) {
    return "success";
  }

  if (
    value.includes("REJECT") ||
    value.includes("CANCEL")
  ) {
    return "danger";
  }

  if (
    value.includes("INTERVIEW") ||
    value.includes("SCHEDULE")
  ) {
    return "info";
  }

  return "warning";
}

function getStatusLabel(status) {
  if (!status) {
    return "PENDING";
  }

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* =========================================================
   COMPONENT
========================================================= */

function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const recruiterEmail =
    user?.email || "";

  /* =======================================================
     DATA
  ======================================================= */

  const jobs = useMemo(
    () =>
      getAllRecruiterJobs(
        recruiterEmail
      ),
    [recruiterEmail]
  );

  const allApplications = useMemo(
    () => getApplications(),
    []
  );

  /* =======================================================
     RECRUITER APPLICATIONS
  ======================================================= */

  const recruiterApplications =
    useMemo(() => {
      return allApplications.filter(
        (application) => {
          const applicationRecruiter =
            String(
              application.recruiterEmail ||
                application.recruiter_email ||
                ""
            )
              .trim()
              .toLowerCase();

          const applicationJobId =
            application.jobId ||
            application.job_id;

          const belongsToRecruiter =
            applicationRecruiter ===
            recruiterEmail
              .trim()
              .toLowerCase();

          const belongsToRecruiterJob =
            jobs.some(
              (job) =>
                String(job.id) ===
                String(applicationJobId)
            );

          return (
            belongsToRecruiter ||
            belongsToRecruiterJob
          );
        }
      );
    }, [
      allApplications,
      jobs,
      recruiterEmail,
    ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const activeJobs = jobs.filter(
    (job) =>
      String(
        job.status || "ACTIVE"
      ).toUpperCase() === "ACTIVE"
  );

  const pendingApplications =
    recruiterApplications.filter(
      (application) => {
        const status = String(
          application.status || "PENDING"
        ).toUpperCase();

        return (
          status === "PENDING" ||
          status === "APPLIED"
        );
      }
    );

  const acceptedApplications =
    recruiterApplications.filter(
      (application) => {
        const status = String(
          application.status || ""
        ).toUpperCase();

        return (
          status.includes("ACCEPT") ||
          status.includes("INTERVIEW") ||
          status.includes("SCHEDULE")
        );
      }
    );

  const completedInterviews =
    recruiterApplications.filter(
      (application) => {
        const status = String(
          application.status || ""
        ).toUpperCase();

        return (
          status ===
            "INTERVIEW_COMPLETED" ||
          status.includes("SELECTED") ||
          status === "SELECTED"
        );
      }
    );

  /* =======================================================
     INTERVIEWS
  ======================================================= */

  const scheduledInterviews =
    recruiterApplications.filter(
      (application) => {
        const interview =
          application.interview;

        if (
          !interview ||
          !interview.scheduled
        ) {
          return false;
        }

        const status = String(
          application.status || ""
        ).toUpperCase();

        return (
          status !== "INTERVIEW_COMPLETED" &&
          status !== "SELECTED" &&
          status !== "REJECTED"
        );
      }
    );

  /* =======================================================
     RECENT APPLICATIONS
  ======================================================= */

  const recentApplications =
    [...recruiterApplications]
      .sort((a, b) => {
        const dateA =
          new Date(
            a.appliedAt ||
              a.createdAt ||
              0
          ).getTime();

        const dateB =
          new Date(
            b.appliedAt ||
              b.createdAt ||
              0
          ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);

  /* =======================================================
     UPCOMING INTERVIEWS
  ======================================================= */

  const upcomingInterviews =
    [...scheduledInterviews]
      .sort((a, b) => {
        const aDate =
          `${a.interview?.date || ""} ${
            a.interview?.time || ""
          }`;

        const bDate =
          `${b.interview?.date || ""} ${
            b.interview?.time || ""
          }`;

        return (
          new Date(aDate).getTime() -
          new Date(bDate).getTime()
        );
      })
      .slice(0, 4);

  /* =======================================================
     UNIQUE CANDIDATES
  ======================================================= */

  const uniqueCandidates =
    new Set(
      recruiterApplications.map(
        (application) =>
          application.studentEmail ||
          application.studentId ||
          application.email ||
          application.student?.email ||
          application.student?.id
      )
    );

  /* =======================================================
     QUICK NAVIGATION
  ======================================================= */

  const goTo = (path) => {
    navigate(path);
  };

  /* =======================================================
     COMPANY NAME
  ======================================================= */

  const companyName =
    user?.company ||
    jobs.find(
      (job) => job.companyName
    )?.companyName ||
    "Your Company";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="recruiter-dashboard">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="recruiter-hero">

        <div className="recruiter-hero-content">

          <div className="recruiter-eyebrow">
            <Sparkles size={15} />
            CAMPUSLINK RECRUITMENT
          </div>

          <h1>
            Recruiter Dashboard
          </h1>

          <p className="recruiter-welcome">
            Welcome back,{" "}
            <strong>
              {user?.name || "Recruiter"}
            </strong>{" "}
            👋
          </p>

          <p className="recruiter-hero-description">
            Manage your jobs, applications,
            candidates and interviews from
            one recruitment workspace.
          </p>

          <div className="recruiter-hero-actions">

            <button
              type="button"
              className="recruiter-primary-action"
              onClick={() =>
                goTo(
                  "/recruiter/jobs/create"
                )
              }
            >
              <Plus size={18} />
              Create New Job
            </button>

            <button
              type="button"
              className="recruiter-secondary-action"
              onClick={() =>
                goTo(
                  "/recruiter/applications"
                )
              }
            >
              View Applications
              <ArrowRight size={17} />
            </button>

          </div>

        </div>


        <div className="recruiter-hero-side">

          <div className="recruiter-company-card">

            <div className="recruiter-company-icon">
              <Building2 size={25} />
            </div>

            <div>

              <span>
                RECRUITING FOR
              </span>

              <strong>
                {companyName}
              </strong>

            </div>

          </div>

          <div className="recruiter-live-indicator">
            <span />
            Recruitment workspace active
          </div>

        </div>

      </section>


      {/* ===================================================
          STATISTICS
      =================================================== */}

      <section className="recruiter-stats-grid">

        <div className="recruiter-stat-card">

          <div className="recruiter-stat-icon blue">
            <BriefcaseBusiness
              size={22}
            />
          </div>

          <div className="recruiter-stat-content">

            <span>
              ACTIVE JOBS
            </span>

            <strong>
              {activeJobs.length}
            </strong>

            <small>
              Currently accepting candidates
            </small>

          </div>

        </div>


        <div className="recruiter-stat-card">

          <div className="recruiter-stat-icon cyan">
            <FileCheck2 size={22} />
          </div>

          <div className="recruiter-stat-content">

            <span>
              APPLICATIONS
            </span>

            <strong>
              {recruiterApplications.length}
            </strong>

            <small>
              Total applications received
            </small>

          </div>

        </div>


        <div className="recruiter-stat-card">

          <div className="recruiter-stat-icon purple">
            <Users size={22} />
          </div>

          <div className="recruiter-stat-content">

            <span>
              CANDIDATES
            </span>

            <strong>
              {uniqueCandidates.size}
            </strong>

            <small>
              Unique applicants
            </small>

          </div>

        </div>


        <div className="recruiter-stat-card">

          <div className="recruiter-stat-icon green">
            <Video size={22} />
          </div>

          <div className="recruiter-stat-content">

            <span>
              INTERVIEWS
            </span>

            <strong>
              {scheduledInterviews.length}
            </strong>

            <small>
              Upcoming interviews
            </small>

          </div>

        </div>

      </section>


      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <div className="recruiter-main-grid">

        {/* =================================================
            RECENT APPLICATIONS
        ================================================= */}

        <section className="recruiter-panel recruiter-applications-panel">

          <div className="recruiter-panel-header">

            <div>

              <span className="recruiter-section-label">
                TALENT PIPELINE
              </span>

              <h2>
                Recent Applications
              </h2>

            </div>

            <button
              type="button"
              className="recruiter-view-all"
              onClick={() =>
                goTo(
                  "/recruiter/applications"
                )
              }
            >
              View All
              <ArrowRight size={16} />
            </button>

          </div>


          {recentApplications.length ===
          0 ? (

            <div className="recruiter-empty">

              <div className="recruiter-empty-icon">
                <Users size={25} />
              </div>

              <h3>
                No applications yet
              </h3>

              <p>
                Applications from students
                will appear here.
              </p>

              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/recruiter/jobs/create"
                  )
                }
              >
                Create a Job
              </button>

            </div>

          ) : (

            <div className="recruiter-application-list">

              {recentApplications.map(
                (application, index) => {

                  const studentName =
                    application.studentName ||
                    application.name ||
                    application.student
                      ?.name ||
                    "Student";

                  const jobTitle =
                    application.jobTitle ||
                    application.jobRole ||
                    application.job
                      ?.title ||
                    "Job Position";

                  const matchScore =
                    application.matchScore ||
                    application.matchPercentage ||
                    application.finalMatchScore;

                  const status =
                    application.status ||
                    "PENDING";

                  return (
                    <div
                      className="recruiter-application-row"
                      key={
                        application.id ||
                        `${studentName}-${index}`
                      }
                    >

                      <div className="recruiter-candidate-avatar">
                        {String(
                          studentName
                        )
                          .split(" ")
                          .slice(0, 2)
                          .map(
                            (part) =>
                              part[0]
                          )
                          .join("")
                          .toUpperCase()}
                      </div>


                      <div className="recruiter-application-info">

                        <strong>
                          {studentName}
                        </strong>

                        <span>
                          {jobTitle}
                        </span>

                      </div>


                      <div className="recruiter-match-score">

                        {matchScore ? (
                          <>
                            <strong>
                              {matchScore}%
                            </strong>

                            <span>
                              MATCH
                            </span>
                          </>
                        ) : (
                          <span>
                            —
                          </span>
                        )}

                      </div>


                      <div
                        className={`recruiter-status-pill ${getStatusClass(
                          status
                        )}`}
                      >
                        {getStatusLabel(
                          status
                        )}
                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            PIPELINE
        ================================================= */}

        <section className="recruiter-panel">

          <div className="recruiter-panel-header">

            <div>

              <span className="recruiter-section-label">
                RECRUITMENT PIPELINE
              </span>

              <h2>
                Application Overview
              </h2>

            </div>

            <BarChart3
              size={20}
              className="recruiter-header-icon"
            />

          </div>


          <div className="recruiter-pipeline">

            <div className="recruiter-pipeline-item">

              <div className="pipeline-icon pending">
                <Clock3 size={18} />
              </div>

              <div>
                <strong>
                  {pendingApplications.length}
                </strong>

                <span>
                  Pending Review
                </span>
              </div>

            </div>


            <div className="recruiter-pipeline-item">

              <div className="pipeline-icon accepted">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <strong>
                  {acceptedApplications.length}
                </strong>

                <span>
                  Accepted / Interview
                </span>
              </div>

            </div>


            <div className="recruiter-pipeline-item">

              <div className="pipeline-icon interview">
                <Video size={18} />
              </div>

              <div>
                <strong>
                  {scheduledInterviews.length}
                </strong>

                <span>
                  Interviews Scheduled
                </span>
              </div>

            </div>


            <div className="recruiter-pipeline-item">

              <div className="pipeline-icon completed">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <strong>
                  {completedInterviews.length}
                </strong>

                <span>
                  Completed / Selected
                </span>
              </div>

            </div>

          </div>

        </section>

      </div>


      {/* ===================================================
          LOWER GRID
      =================================================== */}

      <div className="recruiter-lower-grid">

        {/* =================================================
            UPCOMING INTERVIEWS
        ================================================= */}

        <section className="recruiter-panel">

          <div className="recruiter-panel-header">

            <div>

              <span className="recruiter-section-label">
                INTERVIEW SCHEDULE
              </span>

              <h2>
                Upcoming Interviews
              </h2>

            </div>

            <button
              type="button"
              className="recruiter-view-all"
              onClick={() =>
                goTo(
                  "/recruiter/interviews"
                )
              }
            >
              View All
              <ArrowRight size={16} />
            </button>

          </div>


          {upcomingInterviews.length ===
          0 ? (

            <div className="recruiter-small-empty">

              <CalendarDays size={28} />

              <span>
                No upcoming interviews
              </span>

              <small>
                Scheduled interviews will
                appear here.
              </small>

            </div>

          ) : (

            <div className="recruiter-interview-list">

              {upcomingInterviews.map(
                (application, index) => {

                  const interview =
                    application.interview ||
                    {};

                  const studentName =
                    application.studentName ||
                    application.name ||
                    application.student
                      ?.name ||
                    "Student";

                  const jobTitle =
                    application.jobTitle ||
                    application.jobRole ||
                    "Interview";

                  return (
                    <div
                      className="recruiter-interview-row"
                      key={
                        application.id ||
                        `interview-${index}`
                      }
                    >

                      <div className="recruiter-date-box">

                        <CalendarDays
                          size={17}
                        />

                        <strong>
                          {formatDate(
                            interview.date
                          )}
                        </strong>

                      </div>


                      <div className="recruiter-interview-info">

                        <strong>
                          {studentName}
                        </strong>

                        <span>
                          {jobTitle}
                        </span>

                      </div>


                      <div className="recruiter-interview-time">

                        <Clock3
                          size={15}
                        />

                        {formatTime(
                          interview.time
                        ) || "Time TBD"}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="recruiter-panel">

          <div className="recruiter-panel-header">

            <div>

              <span className="recruiter-section-label">
                GET STARTED
              </span>

              <h2>
                Quick Actions
              </h2>

            </div>

          </div>


          <div className="recruiter-quick-actions">

            <button
              type="button"
              onClick={() =>
                goTo(
                  "/recruiter/jobs/create"
                )
              }
            >

              <div className="quick-action-icon blue">
                <Plus size={19} />
              </div>

              <div>
                <strong>
                  Create Job
                </strong>

                <span>
                  Publish a new opening
                </span>
              </div>

              <ArrowRight size={16} />

            </button>


            <button
              type="button"
              onClick={() =>
                goTo(
                  "/recruiter/applications"
                )
              }
            >

              <div className="quick-action-icon cyan">
                <ClipboardList size={19} />
              </div>

              <div>
                <strong>
                  Review Applications
                </strong>

                <span>
                  Check student applications
                </span>
              </div>

              <ArrowRight size={16} />

            </button>


            <button
              type="button"
              onClick={() =>
                goTo(
                  "/recruiter/candidates"
                )
              }
            >

              <div className="quick-action-icon purple">
                <UserRoundSearch
                  size={19}
                />
              </div>

              <div>
                <strong>
                  Find Candidates
                </strong>

                <span>
                  Explore eligible students
                </span>
              </div>

              <ArrowRight size={16} />

            </button>


            <button
              type="button"
              onClick={() =>
                goTo(
                  "/recruiter/requirements"
                )
              }
            >

              <div className="quick-action-icon green">
                <Settings size={19} />
              </div>

              <div>
                <strong>
                  Job Requirements
                </strong>

                <span>
                  Configure hiring criteria
                </span>
              </div>

              <ArrowRight size={16} />

            </button>

          </div>

        </section>

      </div>


      {/* ===================================================
          FOOTER INSIGHT
      =================================================== */}

      <section className="recruiter-insight">

        <div className="recruiter-insight-icon">
          <TrendingUp size={22} />
        </div>

        <div>

          <strong>
            CampusLink AI Recruitment
          </strong>

          <p>
            Your recruitment workspace is
            ready for AI-powered candidate
            matching, interview monitoring
            and evaluation.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            goTo(
              "/recruiter/candidates"
            )
          }
        >
          Explore Candidates
          <ArrowRight size={16} />
        </button>

      </section>

    </div>
  );
}

export default RecruiterDashboard;