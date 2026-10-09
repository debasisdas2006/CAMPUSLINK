import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  X,
  Users,
  Briefcase,
  Building2,
  User,
  GraduationCap,
  Award,
  Code2,
  Languages,
  FileText,
  Video,
  Target,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import "./Candidates.css";

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function readStudentProfile(email) {
  if (!email) return null;

  const profile = safeParse(
    localStorage.getItem(`campuslink_student_profile_${email}`),
    null
  );

  return profile && typeof profile === "object" ? profile : null;
}

function getAllJobs() {
  const jobs = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith("campuslink_jobs_")) {
      continue;
    }

    const recruiterEmail = key
      .replace("campuslink_jobs_", "")
      .trim();

    const stored = safeParse(localStorage.getItem(key), []);

    if (!Array.isArray(stored)) {
      continue;
    }

    stored.forEach((job) => {
      if (!job || typeof job !== "object") return;

      jobs.push({
        ...job,
        recruiterEmail: job.recruiterEmail || recruiterEmail,
      });
    });
  }

  return jobs;
}

function getApplicationStudentEmail(application) {
  return (
    application?.studentEmail ||
    application?.email ||
    application?.student?.email ||
    application?.userEmail ||
    ""
  );
}

function getApplicationJobId(application) {
  return (
    application?.jobId ||
    application?.job?.id ||
    application?.job_id ||
    ""
  );
}

function getApplicationStudentName(application, profile) {
  return (
    application?.studentName ||
    application?.name ||
    application?.student?.name ||
    profile?.name ||
    "Unknown Student"
  );
}

function normalizeStatus(status) {
  return String(status || "PENDING")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function getStatusLabel(status) {
  const normalized = normalizeStatus(status);

  const labels = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    INTERVIEW_SCHEDULED: "Interview Scheduled",
    INTERVIEW_COMPLETED: "Interview Completed",
    SELECTED: "Selected",
    NOT_SELECTED: "Not Selected",
  };

  return labels[normalized] || normalized.replace(/_/g, " ");
}

function getStatusClass(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "SELECTED") return "selected";
  if (normalized === "ACCEPTED") return "accepted";
  if (normalized === "INTERVIEW_COMPLETED") return "completed";
  if (normalized === "INTERVIEW_SCHEDULED") return "scheduled";
  if (
    normalized === "REJECTED" ||
    normalized === "NOT_SELECTED"
  ) {
    return "rejected";
  }

  return "pending";
}

function Candidates() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const loadData = () => {
    const storedApplications = safeParse(
      localStorage.getItem("campuslink_applications"),
      []
    );

    const storedUsers = safeParse(
      localStorage.getItem("campuslink_registered_users"),
      []
    );

    setApplications(
      Array.isArray(storedApplications)
        ? storedApplications
        : []
    );

    setRegisteredUsers(
      Array.isArray(storedUsers) ? storedUsers : []
    );

    setJobs(getAllJobs());
  };

  useEffect(() => {
    loadData();

    const handleStorage = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "campuslink_application_updated",
      handleStorage
    );
    window.addEventListener(
      "campuslink_applications_updated",
      handleStorage
    );
    window.addEventListener(
      "campuslink_profile_updated",
      handleStorage
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "campuslink_application_updated",
        handleStorage
      );
      window.removeEventListener(
        "campuslink_applications_updated",
        handleStorage
      );
      window.removeEventListener(
        "campuslink_profile_updated",
        handleStorage
      );
    };
  }, []);

  const candidateRecords = useMemo(() => {
    return applications.map((application, index) => {
      const studentEmail =
        getApplicationStudentEmail(application);

      const jobId = getApplicationJobId(application);

      const job = jobs.find(
        (item) =>
          String(item?.id || "").toLowerCase() ===
          String(jobId || "").toLowerCase()
      );

      const profile = readStudentProfile(studentEmail);

      const registeredUser = registeredUsers.find(
        (user) =>
          String(user?.email || "").toLowerCase() ===
          String(studentEmail || "").toLowerCase()
      );

      const studentName = getApplicationStudentName(
        application,
        profile
      );

      const languages = normalizeArray(
        profile?.languages || application?.languages
      );

      const skills = normalizeArray(
        profile?.skills || application?.skills
      );

      const matchScore =
        application?.matchScore ??
        application?.matchPercentage ??
        application?.jobMatchScore ??
        application?.finalMatchScore ??
        job?.matchScore ??
        null;

      const interview = application?.interview || {};

      const candidateId =
        application?.id ||
        `CANDIDATE-${index + 1}-${studentEmail || "unknown"}`;

      return {
        ...application,

        candidateId,
        studentEmail,
        studentName,

        profile,
        registeredUser,

        job,
        jobId,

        companyName:
          application?.companyName ||
          application?.company ||
          job?.companyName ||
          registeredUser?.company ||
          "Company not specified",

        jobTitle:
          application?.jobTitle ||
          application?.jobRole ||
          job?.title ||
          "Job not specified",

        recruiterEmail:
          application?.recruiterEmail ||
          job?.recruiterEmail ||
          "",

        degree:
          profile?.degree ||
          application?.degree ||
          "",

        cgpa:
          profile?.cgpa ??
          application?.cgpa ??
          "",

        experience:
          profile?.experience ??
          application?.experience ??
          "",

        languages,
        skills,

        matchScore,

        interview,
      };
    });
  }, [applications, jobs, registeredUsers]);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidateRecords.filter((candidate) => {
      const searchableText = [
        candidate.studentName,
        candidate.studentEmail,
        candidate.jobTitle,
        candidate.companyName,
        candidate.jobId,
        candidate.recruiterEmail,
        candidate.degree,
        ...candidate.skills,
        ...candidate.languages,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const candidateStatus = normalizeStatus(
        candidate.status
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        candidateStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [candidateRecords, search, statusFilter]);

  const summary = useMemo(() => {
    const total = candidateRecords.length;

    const pending = candidateRecords.filter(
      (candidate) =>
        normalizeStatus(candidate.status) === "PENDING"
    ).length;

    const accepted = candidateRecords.filter(
      (candidate) =>
        normalizeStatus(candidate.status) === "ACCEPTED"
    ).length;

    const interviewScheduled = candidateRecords.filter(
      (candidate) =>
        normalizeStatus(candidate.status) ===
        "INTERVIEW_SCHEDULED"
    ).length;

    const interviewCompleted = candidateRecords.filter(
      (candidate) =>
        normalizeStatus(candidate.status) ===
        "INTERVIEW_COMPLETED"
    ).length;

    const selected = candidateRecords.filter(
      (candidate) =>
        normalizeStatus(candidate.status) === "SELECTED"
    ).length;

    const rejected = candidateRecords.filter((candidate) =>
      ["REJECTED", "NOT_SELECTED"].includes(
        normalizeStatus(candidate.status)
      )
    ).length;

    return {
      total,
      pending,
      accepted,
      interviewScheduled,
      interviewCompleted,
      selected,
      rejected,
    };
  }, [candidateRecords]);

  const getProfilePhoto = (candidate) => {
    return (
      candidate?.profile?.profilePhoto ||
      candidate?.profile?.photo ||
      candidate?.student?.profilePhoto ||
      ""
    );
  };

  const getMatchDisplay = (candidate) => {
    if (
      candidate.matchScore === null ||
      candidate.matchScore === undefined ||
      candidate.matchScore === ""
    ) {
      return "N/A";
    }

    const numeric = Number(candidate.matchScore);

    if (Number.isNaN(numeric)) {
      return String(candidate.matchScore);
    }

    return `${Math.round(numeric)}%`;
  };

  const getInterviewDisplay = (candidate) => {
    const status = normalizeStatus(candidate.status);

    if (candidate.interview?.scheduled) {
      return "Scheduled";
    }

    if (status === "INTERVIEW_COMPLETED") {
      return "Completed";
    }

    if (status === "SELECTED") {
      return "Completed";
    }

    return "Not scheduled";
  };

  return (
    <div className="admin-candidates-page">
      <div className="candidates-header">
        <div>
          <div className="candidates-eyebrow">
            <Users size={16} />
            ADMIN CANDIDATE MANAGEMENT
          </div>

          <h1>Candidates</h1>

          <p>
            View students who have applied to jobs, their profile
            information, application status, match score and interview
            progress.
          </p>
        </div>

        <button
          className="candidates-refresh-button"
          onClick={loadData}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="candidate-summary-grid">
        <div className="candidate-summary-card">
          <div className="candidate-summary-icon">
            <Users size={20} />
          </div>

          <div>
            <span>Total Candidates</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="candidate-summary-card">
          <div className="candidate-summary-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{summary.pending}</strong>
          </div>
        </div>

        <div className="candidate-summary-card">
          <div className="candidate-summary-icon">
            <Video size={20} />
          </div>

          <div>
            <span>Interviews</span>
            <strong>
              {summary.interviewScheduled +
                summary.interviewCompleted}
            </strong>
          </div>
        </div>

        <div className="candidate-summary-card">
          <div className="candidate-summary-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Selected</span>
            <strong>{summary.selected}</strong>
          </div>
        </div>
      </div>

      <div className="candidate-toolbar">
        <div className="candidate-search">
          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search student, job, company, skills, degree..."
          />

          {search && (
            <button
              className="candidate-clear-search"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="candidate-filter">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="INTERVIEW_SCHEDULED">
              Interview Scheduled
            </option>
            <option value="INTERVIEW_COMPLETED">
              Interview Completed
            </option>
            <option value="SELECTED">Selected</option>
            <option value="NOT_SELECTED">
              Not Selected
            </option>
          </select>
        </div>
      </div>

      <div className="candidates-content">
        <div className="candidates-content-header">
          <div>
            <h2>Candidate Applications</h2>

            <span>
              Showing {filteredCandidates.length} of{" "}
              {candidateRecords.length}
            </span>
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="candidates-empty">
            <Users size={45} />

            <h3>No candidates found</h3>

            <p>
              Student applications will appear here when students
              apply for recruiter jobs.
            </p>
          </div>
        ) : (
          <div className="candidates-table-wrapper">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Match</th>
                  <th>Application</th>
                  <th>Interview</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCandidates.map((candidate) => {
                  const photo = getProfilePhoto(candidate);
                  const statusClass = getStatusClass(
                    candidate.status
                  );

                  return (
                    <tr key={candidate.candidateId}>
                      <td>
                        <div className="candidate-person">
                          {photo ? (
                            <img
                              src={photo}
                              alt={candidate.studentName}
                            />
                          ) : (
                            <div className="candidate-avatar">
                              {candidate.studentName
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <div>
                            <strong>
                              {candidate.studentName}
                            </strong>

                            <span>
                              {candidate.studentEmail ||
                                "Email not available"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="candidate-job-cell">
                          <Briefcase size={15} />

                          <div>
                            <strong>
                              {candidate.jobTitle}
                            </strong>

                            {candidate.jobId && (
                              <span>{candidate.jobId}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="candidate-company-cell">
                          <Building2 size={15} />
                          <span>
                            {candidate.companyName}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="candidate-match">
                          {getMatchDisplay(candidate)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`candidate-status ${statusClass}`}
                        >
                          {getStatusLabel(
                            candidate.status
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`candidate-interview ${
                            getInterviewDisplay(
                              candidate
                            ) === "Completed"
                              ? "completed"
                              : getInterviewDisplay(
                                    candidate
                                  ) === "Scheduled"
                                ? "scheduled"
                                : "none"
                          }`}
                        >
                          {getInterviewDisplay(candidate)}
                        </span>
                      </td>

                      <td>
                        <button
                          className="candidate-view-button"
                          onClick={() =>
                            setSelectedCandidate(candidate)
                          }
                        >
                          View Candidate
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

      {selectedCandidate && (
        <div
          className="candidate-modal-overlay"
          onClick={() =>
            setSelectedCandidate(null)
          }
        >
          <div
            className="candidate-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="candidate-modal-header">
              <div className="candidate-modal-person">
                {getProfilePhoto(selectedCandidate) ? (
                  <img
                    src={getProfilePhoto(
                      selectedCandidate
                    )}
                    alt={selectedCandidate.studentName}
                  />
                ) : (
                  <div className="candidate-modal-avatar">
                    {selectedCandidate.studentName
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <span className="candidate-modal-eyebrow">
                    CANDIDATE PROFILE
                  </span>

                  <h2>
                    {selectedCandidate.studentName}
                  </h2>

                  <p>
                    {selectedCandidate.studentEmail ||
                      "Email not available"}
                  </p>
                </div>
              </div>

              <button
                className="candidate-modal-close"
                onClick={() =>
                  setSelectedCandidate(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="candidate-modal-body">
              <section className="candidate-detail-section">
                <div className="candidate-detail-title">
                  <Briefcase size={18} />
                  <h3>Application</h3>
                </div>

                <div className="candidate-detail-grid">
                  <div>
                    <span>Job</span>
                    <strong>
                      {selectedCandidate.jobTitle}
                    </strong>
                  </div>

                  <div>
                    <span>Company</span>
                    <strong>
                      {selectedCandidate.companyName}
                    </strong>
                  </div>

                  <div>
                    <span>Job ID</span>
                    <strong>
                      {selectedCandidate.jobId ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>Application ID</span>
                    <strong>
                      {selectedCandidate.candidateId}
                    </strong>
                  </div>

                  <div>
                    <span>Application Status</span>
                    <strong>
                      <span
                        className={`candidate-status ${getStatusClass(
                          selectedCandidate.status
                        )}`}
                      >
                        {getStatusLabel(
                          selectedCandidate.status
                        )}
                      </span>
                    </strong>
                  </div>

                  <div>
                    <span>Match Score</span>
                    <strong>
                      {getMatchDisplay(
                        selectedCandidate
                      )}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="candidate-detail-section">
                <div className="candidate-detail-title">
                  <GraduationCap size={18} />
                  <h3>Education & Experience</h3>
                </div>

                <div className="candidate-detail-grid">
                  <div>
                    <span>Degree</span>
                    <strong>
                      {selectedCandidate.degree ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>CGPA</span>
                    <strong>
                      {selectedCandidate.cgpa ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>Experience</span>
                    <strong>
                      {selectedCandidate.experience
                        ? `${selectedCandidate.experience} years`
                        : "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>College</span>
                    <strong>
                      {selectedCandidate.profile
                        ?.collegeName ||
                        selectedCandidate.profile
                          ?.college ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>Graduation Year</span>
                    <strong>
                      {selectedCandidate.profile
                        ?.graduationYear ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>Resume</span>
                    <strong className="resume-availability">
                      <FileText size={14} />

                      Resume available through CAMPUSLINK
                    </strong>
                  </div>
                </div>
              </section>

              <section className="candidate-detail-section">
                <div className="candidate-detail-title">
                  <Code2 size={18} />
                  <h3>Technical Skills</h3>
                </div>

                <div className="candidate-chip-list">
                  {selectedCandidate.skills.length >
                  0 ? (
                    selectedCandidate.skills.map(
                      (skill) => (
                        <span key={skill}>
                          {skill}
                        </span>
                      )
                    )
                  ) : (
                    <span className="empty-chip">
                      No skills listed
                    </span>
                  )}
                </div>
              </section>

              <section className="candidate-detail-section">
                <div className="candidate-detail-title">
                  <Languages size={18} />
                  <h3>Programming Languages</h3>
                </div>

                <div className="candidate-chip-list language">
                  {selectedCandidate.languages.length >
                  0 ? (
                    selectedCandidate.languages.map(
                      (language) => (
                        <span key={language}>
                          {language}
                        </span>
                      )
                    )
                  ) : (
                    <span className="empty-chip">
                      No languages listed
                    </span>
                  )}
                </div>
              </section>

              <section className="candidate-detail-section">
                <div className="candidate-detail-title">
                  <Video size={18} />
                  <h3>Interview</h3>
                </div>

                <div className="candidate-interview-card">
                  <div className="candidate-detail-grid">
                    <div>
                      <span>Interview Status</span>
                      <strong>
                        {getInterviewDisplay(
                          selectedCandidate
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Scheduled Date</span>
                      <strong>
                        {selectedCandidate.interview
                          ?.date ||
                          "Not scheduled"}
                      </strong>
                    </div>

                    <div>
                      <span>Scheduled Time</span>
                      <strong>
                        {selectedCandidate.interview
                          ?.time ||
                          "Not scheduled"}
                      </strong>
                    </div>

                    <div>
                      <span>Duration</span>
                      <strong>
                        {selectedCandidate.interview
                          ?.duration
                          ? `${selectedCandidate.interview.duration} minutes`
                          : "Not specified"}
                      </strong>
                    </div>
                  </div>

                  {selectedCandidate.interview
                    ?.instructions && (
                    <div className="candidate-instructions">
                      <span>Instructions</span>
                      <p>
                        {
                          selectedCandidate
                            .interview
                            .instructions
                        }
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="candidate-detail-section">
                <div className="candidate-detail-title">
                  <Target size={18} />
                  <h3>Recruiter Decision</h3>
                </div>

                <div className="candidate-detail-grid">
                  <div>
                    <span>Recruiter Decision</span>
                    <strong>
                      {selectedCandidate.recruiterDecision ||
                        "Pending"}
                    </strong>
                  </div>

                  <div>
                    <span>Final Decision</span>
                    <strong>
                      {selectedCandidate.finalDecision ||
                        "Pending"}
                    </strong>
                  </div>

                  <div>
                    <span>Rejection Reason</span>
                    <strong>
                      {selectedCandidate.rejectionReason ||
                        "Not applicable"}
                    </strong>
                  </div>

                  <div>
                    <span>Final Decision Reason</span>
                    <strong>
                      {selectedCandidate.finalDecisionReason ||
                        "Not available"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="candidate-detail-section">
                <div className="candidate-detail-title">
                  <Award size={18} />
                  <h3>Selection Information</h3>
                </div>

                {selectedCandidate.finalDecision ===
                "SELECTED" ? (
                  <div className="selection-card">
                    <div>
                      <span>Team</span>
                      <strong>
                        {selectedCandidate.teamName ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>Team Size</span>
                      <strong>
                        {selectedCandidate.teamSize ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>Team Leader</span>
                      <strong>
                        {selectedCandidate.teamLeaderName ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>Role</span>
                      <strong>
                        {selectedCandidate.teamRole ||
                          selectedCandidate.jobTitle}
                      </strong>
                    </div>

                    <div>
                      <span>Joining Date</span>
                      <strong>
                        {selectedCandidate.joiningDate ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>Additional Details</span>
                      <strong>
                        {selectedCandidate.additionalDetails ||
                          "None"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="no-selection-card">
                    <Clock3 size={17} />
                    <span>
                      Final selection information is not
                      available for this candidate.
                    </span>
                  </div>
                )}
              </section>
            </div>

            <div className="candidate-modal-footer">
              <button
                className="candidate-close-button"
                onClick={() =>
                  setSelectedCandidate(null)
                }
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

export default Candidates;