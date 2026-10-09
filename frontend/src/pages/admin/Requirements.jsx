import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  X,
  Briefcase,
  Building2,
  User,
  GraduationCap,
  Award,
  Code2,
  Languages,
  Video,
  Target,
  FileText,
} from "lucide-react";

import "./Requirements.css";

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getRecruiterEmailFromKey(key) {
  return key.replace("campuslink_requirements_", "").trim();
}

function Requirements() {
  const [requirements, setRequirements] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [interviewFilter, setInterviewFilter] = useState("ALL");
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  const loadData = () => {
    const users = safeParse(
      localStorage.getItem("campuslink_registered_users"),
      []
    );

    setRegisteredUsers(Array.isArray(users) ? users : []);

    const records = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key || !key.startsWith("campuslink_requirements_")) {
        continue;
      }

      const recruiterEmail = getRecruiterEmailFromKey(key);
      const data = safeParse(localStorage.getItem(key), null);

      if (!data || typeof data !== "object") {
        continue;
      }

      records.push({
        ...data,
        recruiterEmail,
        id:
          data.id ||
          `REQ-${recruiterEmail.replace(/[^a-zA-Z0-9]/g, "-")}`,
      });
    }

    setRequirements(records);
  };

  useEffect(() => {
    loadData();

    const handleStorage = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("campuslink_requirements_updated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "campuslink_requirements_updated",
        handleStorage
      );
    };
  }, []);

  const getRecruiter = (email) => {
    return registeredUsers.find(
      (user) =>
        String(user?.email || "").toLowerCase() ===
        String(email || "").toLowerCase()
    );
  };

  const filteredRequirements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requirements.filter((item) => {
      const recruiter = getRecruiter(item.recruiterEmail);

      const recruiterName = String(recruiter?.name || "").toLowerCase();
      const recruiterEmail = String(
        item.recruiterEmail || recruiter?.email || ""
      ).toLowerCase();

      const degree = String(item.degree || "").toLowerCase();

      const languages = normalizeArray(item.requiredLanguages)
        .join(" ")
        .toLowerCase();

      const skills = normalizeArray(item.technicalSkills)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        recruiterName.includes(query) ||
        recruiterEmail.includes(query) ||
        degree.includes(query) ||
        languages.includes(query) ||
        skills.includes(query);

      const interviewRequired = Boolean(item.interviewRequired);

      const matchesInterview =
        interviewFilter === "ALL" ||
        (interviewFilter === "REQUIRED" && interviewRequired) ||
        (interviewFilter === "NOT_REQUIRED" && !interviewRequired);

      return matchesSearch && matchesInterview;
    });
  }, [requirements, registeredUsers, search, interviewFilter]);

  const summary = useMemo(() => {
    const total = requirements.length;

    const interviewsRequired = requirements.filter(
      (item) => Boolean(item.interviewRequired)
    ).length;

    const interviewsNotRequired = total - interviewsRequired;

    const recruiters = new Set(
      requirements.map((item) => item.recruiterEmail).filter(Boolean)
    ).size;

    return {
      total,
      interviewsRequired,
      interviewsNotRequired,
      recruiters,
    };
  }, [requirements]);

  const formatList = (value) => {
    const list = normalizeArray(value);
    return list.length ? list : ["Not specified"];
  };

  const getRecruiterDisplay = (email) => {
    const recruiter = getRecruiter(email);

    return {
      name: recruiter?.name || "Unknown Recruiter",
      email: recruiter?.email || email || "Not available",
      company: recruiter?.company || "Company not specified",
    };
  };

  return (
    <div className="admin-requirements-page">
      <div className="requirements-header">
        <div>
          <div className="requirements-eyebrow">
            <SlidersHorizontal size={16} />
            ADMIN CONTROL CENTER
          </div>

          <h1>Recruiter Requirements</h1>

          <p>
            Review and monitor job eligibility criteria configured by
            recruiters across CAMPUSLINK.
          </p>
        </div>

        <button className="requirements-refresh" onClick={loadData}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="requirements-summary-grid">
        <div className="requirements-summary-card">
          <div className="summary-icon">
            <SlidersHorizontal size={20} />
          </div>

          <div>
            <span>Total Requirements</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="requirements-summary-card">
          <div className="summary-icon">
            <Video size={20} />
          </div>

          <div>
            <span>Interview Required</span>
            <strong>{summary.interviewsRequired}</strong>
          </div>
        </div>

        <div className="requirements-summary-card">
          <div className="summary-icon">
            <Briefcase size={20} />
          </div>

          <div>
            <span>Interview Not Required</span>
            <strong>{summary.interviewsNotRequired}</strong>
          </div>
        </div>

        <div className="requirements-summary-card">
          <div className="summary-icon">
            <User size={20} />
          </div>

          <div>
            <span>Recruiters</span>
            <strong>{summary.recruiters}</strong>
          </div>
        </div>
      </div>

      <div className="requirements-toolbar">
        <div className="requirements-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search recruiter, email, degree, skills or languages..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              className="requirements-clear-search"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="requirements-filter">
          <SlidersHorizontal size={17} />

          <select
            value={interviewFilter}
            onChange={(event) => setInterviewFilter(event.target.value)}
          >
            <option value="ALL">All Interview Settings</option>
            <option value="REQUIRED">Interview Required</option>
            <option value="NOT_REQUIRED">Interview Not Required</option>
          </select>
        </div>
      </div>

      <div className="requirements-results">
        <div className="requirements-results-heading">
          <div>
            <h2>Configured Requirements</h2>
            <span>
              Showing {filteredRequirements.length} of {requirements.length}
            </span>
          </div>
        </div>

        {filteredRequirements.length === 0 ? (
          <div className="requirements-empty">
            <SlidersHorizontal size={42} />

            <h3>No requirements found</h3>

            <p>
              Recruiter requirement configurations will appear here after
              they are created.
            </p>
          </div>
        ) : (
          <div className="requirements-table-wrapper">
            <table className="requirements-table">
              <thead>
                <tr>
                  <th>Recruiter</th>
                  <th>Degree</th>
                  <th>Minimum CGPA</th>
                  <th>Experience</th>
                  <th>Match Score</th>
                  <th>Skills</th>
                  <th>Interview</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequirements.map((item) => {
                  const recruiter = getRecruiterDisplay(item.recruiterEmail);

                  const skills = normalizeArray(item.technicalSkills);
                  const languages = normalizeArray(item.requiredLanguages);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="requirement-recruiter">
                          <div className="requirement-avatar">
                            {recruiter.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{recruiter.name}</strong>
                            <span>{recruiter.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="requirement-value">
                          {item.degree || "Not specified"}
                        </span>
                      </td>

                      <td>
                        <span className="requirement-number">
                          {item.minimumCGPA || "0"}
                        </span>
                      </td>

                      <td>
                        <span className="requirement-value">
                          {item.experience || "0"} years
                        </span>
                      </td>

                      <td>
                        <span className="score-badge">
                          {item.minimumMatchScore || "0"}%
                        </span>
                      </td>

                      <td>
                        <div className="requirement-tags">
                          {skills.slice(0, 2).map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}

                          {skills.length > 2 && (
                            <small>+{skills.length - 2}</small>
                          )}

                          {!skills.length && (
                            <span className="muted-tag">None</span>
                          )}
                        </div>

                        {languages.length > 0 && (
                          <div className="requirement-language-line">
                            {languages.length} language
                            {languages.length > 1 ? "s" : ""}
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          className={`interview-status ${
                            item.interviewRequired
                              ? "required"
                              : "not-required"
                          }`}
                        >
                          {item.interviewRequired
                            ? "Required"
                            : "Not Required"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="requirement-view-button"
                          onClick={() => setSelectedRequirement(item)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRequirement && (
        <div
          className="requirements-modal-overlay"
          onClick={() => setSelectedRequirement(null)}
        >
          <div
            className="requirements-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="requirements-modal-header">
              <div>
                <span className="modal-eyebrow">
                  REQUIREMENT CONFIGURATION
                </span>

                <h2>Eligibility Requirements</h2>

                <p>
                  {getRecruiterDisplay(
                    selectedRequirement.recruiterEmail
                  ).name}
                </p>
              </div>

              <button
                className="requirements-modal-close"
                onClick={() => setSelectedRequirement(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="requirements-modal-body">
              <section className="requirement-detail-section">
                <div className="detail-section-title">
                  <User size={18} />
                  <h3>Recruiter Information</h3>
                </div>

                <div className="requirement-detail-grid">
                  <div>
                    <span>Recruiter Name</span>
                    <strong>
                      {
                        getRecruiterDisplay(
                          selectedRequirement.recruiterEmail
                        ).name
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {
                        getRecruiterDisplay(
                          selectedRequirement.recruiterEmail
                        ).email
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Company</span>
                    <strong>
                      {
                        getRecruiterDisplay(
                          selectedRequirement.recruiterEmail
                        ).company
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Requirement ID</span>
                    <strong>{selectedRequirement.id}</strong>
                  </div>
                </div>
              </section>

              <section className="requirement-detail-section">
                <div className="detail-section-title">
                  <GraduationCap size={18} />
                  <h3>Academic Criteria</h3>
                </div>

                <div className="requirement-detail-grid">
                  <div>
                    <span>Required Degree</span>
                    <strong>
                      {selectedRequirement.degree || "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>Minimum CGPA</span>
                    <strong>
                      {selectedRequirement.minimumCGPA || "0"}
                    </strong>
                  </div>

                  <div>
                    <span>Experience</span>
                    <strong>
                      {selectedRequirement.experience || "0"} years
                    </strong>
                  </div>

                  <div>
                    <span>Minimum Match Score</span>
                    <strong>
                      {selectedRequirement.minimumMatchScore || "0"}%
                    </strong>
                  </div>
                </div>
              </section>

              <section className="requirement-detail-section">
                <div className="detail-section-title">
                  <Code2 size={18} />
                  <h3>Technical Skills</h3>
                </div>

                <div className="detail-chip-list">
                  {formatList(selectedRequirement.technicalSkills).map(
                    (skill) => (
                      <span key={skill}>{skill}</span>
                    )
                  )}
                </div>
              </section>

              <section className="requirement-detail-section">
                <div className="detail-section-title">
                  <Languages size={18} />
                  <h3>Required Languages</h3>
                </div>

                <div className="detail-chip-list language-chips">
                  {formatList(selectedRequirement.requiredLanguages).map(
                    (language) => (
                      <span key={language}>{language}</span>
                    )
                  )}
                </div>
              </section>

              <section className="requirement-detail-section">
                <div className="detail-section-title">
                  <Video size={18} />
                  <h3>Interview Requirement</h3>
                </div>

                <div className="interview-detail-card">
                  <div
                    className={`large-interview-status ${
                      selectedRequirement.interviewRequired
                        ? "required"
                        : "not-required"
                    }`}
                  >
                    {selectedRequirement.interviewRequired
                      ? "INTERVIEW REQUIRED"
                      : "INTERVIEW NOT REQUIRED"}
                  </div>

                  <p>
                    {selectedRequirement.interviewRequired
                      ? "Students meeting the eligibility criteria may proceed through the interview workflow."
                      : "This requirement configuration does not require an interview."}
                  </p>
                </div>
              </section>

              <section className="requirement-detail-section">
                <div className="detail-section-title">
                  <Target size={18} />
                  <h3>Additional Criteria</h3>
                </div>

                <div className="additional-criteria">
                  {selectedRequirement.additionalCriteria ? (
                    <p>{selectedRequirement.additionalCriteria}</p>
                  ) : (
                    <p className="empty-detail">
                      No additional criteria specified.
                    </p>
                  )}
                </div>
              </section>

              <section className="requirement-detail-section">
                <div className="detail-section-title">
                  <FileText size={18} />
                  <h3>Configuration Metadata</h3>
                </div>

                <div className="requirement-detail-grid">
                  <div>
                    <span>Last Updated</span>
                    <strong>
                      {selectedRequirement.updatedAt
                        ? new Date(
                            selectedRequirement.updatedAt
                          ).toLocaleString()
                        : "Not available"}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            <div className="requirements-modal-footer">
              <button
                className="requirements-close-button"
                onClick={() => setSelectedRequirement(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Requirements;