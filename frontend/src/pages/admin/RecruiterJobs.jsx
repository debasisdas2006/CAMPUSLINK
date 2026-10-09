import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MapPin,
  Search,
  User,
  Users,
  X,
} from "lucide-react";

import "./RecruiterJobs.css";

const JOB_PREFIX = "campuslink_jobs_";
const USER_KEY = "campuslink_registered_users";

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readRegisteredUsers() {
  const parsed = safeParse(
    localStorage.getItem(USER_KEY) || "[]",
    []
  );

  return Array.isArray(parsed) ? parsed : [];
}

function readAllJobs() {
  const jobs = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith(JOB_PREFIX)) {
      continue;
    }

    const recruiterEmail = key.replace(JOB_PREFIX, "");

    const parsed = safeParse(
      localStorage.getItem(key) || "[]",
      []
    );

    if (!Array.isArray(parsed)) {
      continue;
    }

    parsed.forEach((job) => {
      if (!job || typeof job !== "object") {
        return;
      }

      jobs.push({
        ...job,
        __recruiterEmail:
          job.recruiterEmail ||
          job.recruiter_email ||
          recruiterEmail,
      });
    });
  }

  return jobs;
}

function normalizeStatus(value) {
  const status = String(value || "ACTIVE")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (
    status === "ACTIVE" ||
    status === "OPEN" ||
    status === "PUBLISHED"
  ) {
    return "ACTIVE";
  }

  if (
    status === "CLOSED" ||
    status === "INACTIVE" ||
    status === "EXPIRED"
  ) {
    return "INACTIVE";
  }

  return status || "ACTIVE";
}

function formatStatus(value) {
  return String(value || "ACTIVE")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getRecruiterName(email, users) {
  if (!email) {
    return "Unknown Recruiter";
  }

  const recruiter = users.find(
    (user) =>
      String(user?.email || "").toLowerCase() ===
        String(email).toLowerCase() &&
      String(user?.role || "").toLowerCase() === "recruiter"
  );

  return recruiter?.name || email;
}

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString();
  } catch {
    return String(value);
  }
}

function getLanguages(job) {
  const value =
    job?.requiredLanguages ||
    job?.languages ||
    job?.programmingLanguages ||
    [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getSkills(job) {
  const value =
    job?.technicalSkills ||
    job?.skills ||
    job?.requiredSkills ||
    [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedJob, setSelectedJob] = useState(null);

  const loadData = () => {
    const users = readRegisteredUsers();
    const allJobs = readAllJobs();

    const seen = new Set();

    const normalized = allJobs
      .map((job, index) => {
        const jobId =
          job?.id ||
          job?.jobId ||
          `JOB-${index + 1}`;

        const recruiterEmail =
          job?.recruiterEmail ||
          job?.recruiter_email ||
          job?.__recruiterEmail ||
          "";

        return {
          ...job,
          __jobId: jobId,
          __recruiterEmail: recruiterEmail,
          __recruiterName: getRecruiterName(
            recruiterEmail,
            users
          ),
          __status: normalizeStatus(job?.status),
          __languages: getLanguages(job),
          __skills: getSkills(job),
        };
      })
      .filter((job) => {
        const uniqueKey = String(
          job.__jobId
        ).toLowerCase();

        if (seen.has(uniqueKey)) {
          return false;
        }

        seen.add(uniqueKey);
        return true;
      })
      .sort((a, b) => {
        const first =
          new Date(
            a.createdAt ||
              a.updatedAt ||
              0
          ).getTime() || 0;

        const second =
          new Date(
            b.createdAt ||
              b.updatedAt ||
              0
          ).getTime() || 0;

        return second - first;
      });

    setJobs(normalized);
  };

  useEffect(() => {
    loadData();

    const handleStorage = () => loadData();

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "campuslink_jobs_updated",
      loadData
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_jobs_updated",
        loadData
      );
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      if (
        statusFilter !== "ALL" &&
        job.__status !== statusFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = [
        job.__jobId,
        job.title,
        job.companyName,
        job.location,
        job.employmentType,
        job.degree,
        job.experience,
        job.__recruiterName,
        job.__recruiterEmail,
        ...job.__languages,
        ...job.__skills,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [jobs, search, statusFilter]);

  const summary = useMemo(() => {
    const companies = new Set(
      jobs
        .map((job) => job.companyName)
        .filter(Boolean)
    );

    const recruiters = new Set(
      jobs
        .map((job) => job.__recruiterEmail)
        .filter(Boolean)
    );

    return {
      total: jobs.length,
      active: jobs.filter(
        (job) => job.__status === "ACTIVE"
      ).length,
      inactive: jobs.filter(
        (job) => job.__status === "INACTIVE"
      ).length,
      companies: companies.size,
      recruiters: recruiters.size,
    };
  }, [jobs]);

  return (
    <div className="admin-recruiter-jobs">
      <div className="recruiter-jobs-header">
        <div>
          <div className="recruiter-jobs-eyebrow">
            ADMIN CONTROL CENTER
          </div>

          <h1>Recruiter Jobs</h1>

          <p>
            View and monitor every job created by
            recruiters across the CampusLink platform.
          </p>
        </div>

        <button
          type="button"
          className="recruiter-jobs-refresh"
          onClick={loadData}
        >
          <Activity size={17} />
          Refresh
        </button>
      </div>

      <div className="recruiter-jobs-summary">
        <SummaryCard
          icon={<Briefcase size={20} />}
          label="Total Jobs"
          value={summary.total}
        />

        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          label="Active Jobs"
          value={summary.active}
        />

        <SummaryCard
          icon={<Building2 size={20} />}
          label="Companies"
          value={summary.companies}
        />

        <SummaryCard
          icon={<Users size={20} />}
          label="Recruiters"
          value={summary.recruiters}
        />
      </div>

      <div className="recruiter-jobs-toolbar">
        <div className="recruiter-jobs-search">
          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search job, company, recruiter, skill..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="recruiter-jobs-filter"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="recruiter-jobs-table-card">
        <div className="recruiter-jobs-table-header">
          <div>
            <h2>All Recruiter Jobs</h2>

            <span>
              Showing {filteredJobs.length} of{" "}
              {jobs.length} jobs
            </span>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="recruiter-jobs-empty">
            <Briefcase size={42} />

            <h3>No recruiter jobs found</h3>

            <p>
              Jobs created by recruiters will appear
              here automatically.
            </p>
          </div>
        ) : (
          <div className="recruiter-jobs-table-wrapper">
            <table className="recruiter-jobs-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Recruiter</th>
                  <th>Requirements</th>
                  <th>Openings</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.__jobId}>
                    <td>
                      <div className="recruiter-job-main">
                        <div className="recruiter-job-icon">
                          <Briefcase size={18} />
                        </div>

                        <div>
                          <strong>
                            {job.title ||
                              "Untitled Job"}
                          </strong>

                          <span>
                            {job.__jobId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="recruiter-job-company">
                        <strong>
                          {job.companyName ||
                            "Company not specified"}
                        </strong>

                        <span>
                          <MapPin size={12} />
                          {job.location ||
                            "Location not specified"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="recruiter-job-recruiter">
                        <div className="recruiter-mini-avatar">
                          <User size={15} />
                        </div>

                        <div>
                          <strong>
                            {job.__recruiterName}
                          </strong>

                          <span>
                            {job.__recruiterEmail}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="recruiter-job-requirements">
                        <span>
                          {job.degree ||
                            "Degree: Any"}
                        </span>

                        <span>
                          CGPA{" "}
                          {job.minimumCGPA ??
                            "N/A"}
                        </span>

                        <span>
                          {job.__skills.length} Skills
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="recruiter-job-openings">
                        <strong>
                          {job.openings ?? "--"}
                        </strong>

                        <span>Openings</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`recruiter-job-status status-${job.__status.toLowerCase()}`}
                      >
                        {formatStatus(
                          job.__status
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="recruiter-job-view-btn"
                        onClick={() =>
                          setSelectedJob(job)
                        }
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() =>
            setSelectedJob(null)
          }
        />
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="recruiter-job-stat">
      <div className="recruiter-job-stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function JobDetailsModal({ job, onClose }) {
  return (
    <div className="recruiter-job-modal-backdrop">
      <div className="recruiter-job-modal">
        <div className="recruiter-job-modal-header">
          <div>
            <span>RECRUITER JOB</span>

            <h2>
              {job.title || "Untitled Job"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="recruiter-job-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="recruiter-job-modal-body">
          <section className="recruiter-job-profile">
            <div className="recruiter-job-large-icon">
              <Briefcase size={28} />
            </div>

            <div className="recruiter-job-profile-info">
              <h3>
                {job.title ||
                  "Untitled Job"}
              </h3>

              <p>
                {job.companyName ||
                  "Company not specified"}
              </p>

              <div className="recruiter-job-tags">
                <span>
                  {job.__jobId}
                </span>

                <span
                  className={`recruiter-job-status status-${job.__status.toLowerCase()}`}
                >
                  {formatStatus(
                    job.__status
                  )}
                </span>

                {job.employmentType && (
                  <span>
                    {job.employmentType}
                  </span>
                )}
              </div>
            </div>
          </section>

          <div className="recruiter-job-detail-grid">
            <DetailCard
              icon={<Building2 size={19} />}
              title="Company"
              rows={[
                [
                  "Company",
                  job.companyName ||
                    "Not specified",
                ],
                [
                  "Location",
                  job.location ||
                    "Not specified",
                ],
              ]}
            />

            <DetailCard
              icon={<User size={19} />}
              title="Recruiter"
              rows={[
                [
                  "Name",
                  job.__recruiterName,
                ],
                [
                  "Email",
                  job.__recruiterEmail ||
                    "Not available",
                ],
              ]}
            />
          </div>

          <section className="recruiter-job-detail-card">
            <div className="recruiter-job-card-title">
              <FileText size={19} />
              <h3>Job Requirements</h3>
            </div>

            <div className="recruiter-requirement-grid">
              <Requirement
                label="Degree"
                value={
                  job.degree || "Any"
                }
              />

              <Requirement
                label="Minimum CGPA"
                value={
                  job.minimumCGPA ??
                  "Not specified"
                }
              />

              <Requirement
                label="Experience"
                value={
                  job.experience ||
                  "Not specified"
                }
              />

              <Requirement
                label="Openings"
                value={
                  job.openings ?? "--"
                }
              />
            </div>
          </section>

          <section className="recruiter-job-detail-card">
            <div className="recruiter-job-card-title">
              <Users size={19} />
              <h3>Programming Languages</h3>
            </div>

            {job.__languages.length > 0 ? (
              <div className="recruiter-skill-list">
                {job.__languages.map(
                  (language, index) => (
                    <span key={index}>
                      {language}
                    </span>
                  )
                )}
              </div>
            ) : (
              <EmptyDetail text="No programming languages specified." />
            )}
          </section>

          <section className="recruiter-job-detail-card">
            <div className="recruiter-job-card-title">
              <Activity size={19} />
              <h3>Technical Skills</h3>
            </div>

            {job.__skills.length > 0 ? (
              <div className="recruiter-skill-list">
                {job.__skills.map(
                  (skill, index) => (
                    <span key={index}>
                      {skill}
                    </span>
                  )
                )}
              </div>
            ) : (
              <EmptyDetail text="No technical skills specified." />
            )}
          </section>

          <section className="recruiter-job-detail-card">
            <div className="recruiter-job-card-title">
              <FileText size={19} />
              <h3>Description</h3>
            </div>

            <p className="recruiter-job-description">
              {job.description ||
                "No job description available."}
            </p>
          </section>

          <section className="recruiter-job-detail-card">
            <div className="recruiter-job-card-title">
              <Calendar size={19} />
              <h3>Important Details</h3>
            </div>

            <div className="recruiter-job-meta-grid">
              <div>
                <span>Deadline</span>

                <strong>
                  {formatDate(
                    job.deadline
                  )}
                </strong>
              </div>

              <div>
                <span>Created</span>

                <strong>
                  {formatDate(
                    job.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>Interview Required</span>

                <strong>
                  {job.interviewRequired
                    ? "Yes"
                    : "No"}
                </strong>
              </div>

              <div>
                <span>Employment Type</span>

                <strong>
                  {job.employmentType ||
                    "Not specified"}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <div className="recruiter-job-modal-footer">
          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, title, rows }) {
  return (
    <section className="recruiter-job-detail-card">
      <div className="recruiter-job-card-title">
        {icon}
        <h3>{title}</h3>
      </div>

      <div className="recruiter-job-detail-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function Requirement({ label, value }) {
  return (
    <div className="recruiter-requirement">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyDetail({ text }) {
  return (
    <div className="recruiter-job-empty-detail">
      {text}
    </div>
  );
}

export default RecruiterJobs;