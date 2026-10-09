import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  Search,
  Star,
  User,
  X,
} from "lucide-react";

import "./StudentFeedback.css";

const APPLICATIONS_KEY = "campuslink_applications";

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readApplications() {
  const parsed = safeParse(
    localStorage.getItem(APPLICATIONS_KEY) || "[]",
    []
  );

  return Array.isArray(parsed) ? parsed : [];
}

function readAllInterviewSessions() {
  const sessions = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith("campuslink_interview_session_")) {
      continue;
    }

    const parsed = safeParse(localStorage.getItem(key) || "null");

    if (!parsed) {
      continue;
    }

    if (Array.isArray(parsed)) {
      parsed.forEach((item) => {
        if (item && typeof item === "object") {
          sessions.push({
            ...item,
            __storageKey: key,
          });
        }
      });
    } else if (typeof parsed === "object") {
      sessions.push({
        ...parsed,
        __storageKey: key,
      });
    }
  }

  return sessions;
}

function readAllProfiles() {
  const profiles = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith("campuslink_student_profile_")) {
      continue;
    }

    const parsed = safeParse(localStorage.getItem(key) || "null");

    if (parsed && typeof parsed === "object") {
      profiles.push(parsed);
    }
  }

  return profiles;
}

function readAllJobs() {
  const jobs = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith("campuslink_jobs_")) {
      continue;
    }

    const parsed = safeParse(localStorage.getItem(key) || "[]", []);

    if (!Array.isArray(parsed)) {
      continue;
    }

    parsed.forEach((job) => {
      if (job && typeof job === "object") {
        jobs.push(job);
      }
    });
  }

  return jobs;
}

function normalizeStatus(value) {
  const status = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (
    status.includes("COMPLETE") ||
    status === "INTERVIEW_COMPLETED"
  ) {
    return "COMPLETED";
  }

  if (
    status.includes("PENDING") ||
    status === "AWAITING_REVIEW"
  ) {
    return "PENDING";
  }

  if (
    status.includes("REVIEW") ||
    status === "UNDER_REVIEW"
  ) {
    return "REVIEWED";
  }

  if (
    status.includes("REJECT")
  ) {
    return "REJECTED";
  }

  if (
    status.includes("SELECT")
  ) {
    return "SELECTED";
  }

  return status || "PENDING";
}

function getSessionId(session) {
  return (
    session?.interviewId ||
    session?.sessionId ||
    session?.id ||
    session?.interviewSessionId ||
    session?.__storageKey?.replace(
      "campuslink_interview_session_",
      ""
    ) ||
    ""
  );
}

function getStudentEmail(session, application) {
  return (
    session?.studentEmail ||
    session?.student_email ||
    session?.student?.email ||
    application?.studentEmail ||
    application?.student_email ||
    application?.email ||
    ""
  );
}

function getStudentName(session, application, profile) {
  return (
    session?.studentName ||
    session?.student_name ||
    session?.student?.name ||
    application?.studentName ||
    application?.student_name ||
    application?.name ||
    profile?.name ||
    "Unknown Student"
  );
}

function getJobId(session, application) {
  return (
    session?.jobId ||
    session?.job_id ||
    session?.job?.id ||
    application?.jobId ||
    application?.job_id ||
    ""
  );
}

function getJobTitle(session, application, job) {
  return (
    session?.jobTitle ||
    session?.job_title ||
    session?.job?.title ||
    application?.jobTitle ||
    application?.job_title ||
    job?.title ||
    "Unknown Job"
  );
}

function getCompanyName(session, application, job) {
  return (
    session?.companyName ||
    session?.company_name ||
    session?.company?.name ||
    application?.companyName ||
    application?.company_name ||
    job?.companyName ||
    "Unknown Company"
  );
}

function getEvaluation(session) {
  return (
    session?.evaluation ||
    session?.finalEvaluation ||
    session?.performance ||
    session?.result ||
    null
  );
}

function getFeedback(session, evaluation) {
  return (
    session?.feedback ||
    session?.interviewFeedback ||
    evaluation?.feedback ||
    session?.review?.feedback ||
    ""
  );
}

function getStrengths(session, evaluation) {
  const value =
    session?.strengths ||
    evaluation?.strengths ||
    session?.review?.strengths ||
    [];

  return Array.isArray(value) ? value : [];
}

function getImprovementAreas(session, evaluation) {
  const value =
    session?.improvementAreas ||
    evaluation?.improvementAreas ||
    session?.review?.improvementAreas ||
    [];

  return Array.isArray(value) ? value : [];
}

function getScore(evaluation) {
  if (!evaluation) {
    return null;
  }

  const score =
    evaluation.percentage ??
    evaluation.score ??
    evaluation.finalScore ??
    evaluation.performanceScore ??
    null;

  if (score === null || score === undefined || score === "") {
    return null;
  }

  const numeric = Number(score);

  return Number.isFinite(numeric) ? numeric : null;
}

function getReviewStatus(session, evaluation) {
  return normalizeStatus(
    session?.feedbackStatus ||
      session?.reviewStatus ||
      evaluation?.status ||
      (getFeedback(session, evaluation)
        ? "REVIEWED"
        : "PENDING")
  );
}

function getDisplayDate(value) {
  if (!value) {
    return "Not available";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  } catch {
    return String(value);
  }
}

function formatStatus(value) {
  return String(value || "PENDING")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StudentFeedback() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const loadData = () => {
    const applications = readApplications();
    const sessions = readAllInterviewSessions();
    const profiles = readAllProfiles();
    const jobs = readAllJobs();

    const profileMap = new Map();

    profiles.forEach((profile) => {
      if (profile?.email) {
        profileMap.set(
          String(profile.email).toLowerCase(),
          profile
        );
      }
    });

    const jobMap = new Map();

    jobs.forEach((job) => {
      if (job?.id) {
        jobMap.set(String(job.id), job);
      }
    });

    const applicationMap = new Map();

    applications.forEach((application) => {
      if (application?.id) {
        applicationMap.set(
          String(application.id),
          application
        );
      }
    });

    const recordsMap = new Map();

    sessions.forEach((session) => {
      const sessionId = getSessionId(session);

      if (!sessionId) {
        return;
      }

      const application =
        applicationMap.get(
          String(session?.applicationId || "")
        ) ||
        applications.find(
          (item) =>
            String(item?.studentEmail || item?.email || "")
              .toLowerCase() ===
              String(
                session?.studentEmail ||
                  session?.student_email ||
                  session?.student?.email ||
                  ""
              ).toLowerCase() &&
            String(item?.jobId || "") ===
              String(
                session?.jobId ||
                  session?.job_id ||
                  session?.job?.id ||
                  ""
              )
        ) ||
        null;

      const studentEmail = getStudentEmail(
        session,
        application
      );

      const profile =
        profileMap.get(
          String(studentEmail).toLowerCase()
        ) || null;

      const jobId = getJobId(session, application);

      const job =
        jobMap.get(String(jobId)) ||
        jobs.find(
          (item) =>
            String(item?.id || "") === String(jobId)
        ) ||
        null;

      const evaluation = getEvaluation(session);
      const feedback = getFeedback(session, evaluation);
      const strengths = getStrengths(
        session,
        evaluation
      );
      const improvementAreas = getImprovementAreas(
        session,
        evaluation
      );

      const record = {
        ...session,
        __sessionId: sessionId,
        __application: application,
        __profile: profile,
        __job: job,
        __studentEmail: studentEmail,
        __studentName: getStudentName(
          session,
          application,
          profile
        ),
        __jobId: jobId,
        __jobTitle: getJobTitle(
          session,
          application,
          job
        ),
        __companyName: getCompanyName(
          session,
          application,
          job
        ),
        __evaluation: evaluation,
        __feedback: feedback,
        __strengths: strengths,
        __improvementAreas: improvementAreas,
        __score: getScore(evaluation),
        __reviewStatus: getReviewStatus(
          session,
          evaluation
        ),
      };

      const existing = recordsMap.get(
        String(sessionId)
      );

      if (!existing) {
        recordsMap.set(String(sessionId), record);
      } else {
        recordsMap.set(String(sessionId), {
          ...existing,
          ...record,
        });
      }
    });

    /*
     * Also include applications which have an interview
     * status but whose interview session has not yet been
     * stored.
     */
    applications.forEach((application) => {
      const applicationStatus = String(
        application?.status || ""
      ).toUpperCase();

      if (
        !applicationStatus.includes("INTERVIEW") &&
        !application?.interview
      ) {
        return;
      }

      const studentEmail =
        application?.studentEmail ||
        application?.email ||
        "";

      const profile =
        profileMap.get(
          String(studentEmail).toLowerCase()
        ) || null;

      const jobId = application?.jobId || "";

      const job =
        jobMap.get(String(jobId)) ||
        jobs.find(
          (item) =>
            String(item?.id || "") === String(jobId)
        ) ||
        null;

      const syntheticId =
        `APPLICATION-${application?.id || `${studentEmail}-${jobId}`}`;

      if (recordsMap.has(syntheticId)) {
        return;
      }

      const evaluation = null;

      recordsMap.set(syntheticId, {
        ...application,
        __sessionId: syntheticId,
        __application: application,
        __profile: profile,
        __job: job,
        __studentEmail: studentEmail,
        __studentName:
          application?.studentName ||
          profile?.name ||
          "Unknown Student",
        __jobId: jobId,
        __jobTitle:
          application?.jobTitle ||
          job?.title ||
          "Unknown Job",
        __companyName:
          application?.companyName ||
          job?.companyName ||
          "Unknown Company",
        __evaluation: evaluation,
        __feedback: "",
        __strengths: [],
        __improvementAreas: [],
        __score: null,
        __reviewStatus: "PENDING",
      });
    });

    const finalRecords = Array.from(
      recordsMap.values()
    ).sort((a, b) => {
      const first =
        new Date(
          a.updatedAt ||
            a.completedAt ||
            a.createdAt ||
            0
        ).getTime() || 0;

      const second =
        new Date(
          b.updatedAt ||
            b.completedAt ||
            b.createdAt ||
            0
        ).getTime() || 0;

      return second - first;
    });

    setRecords(finalRecords);
  };

  useEffect(() => {
    loadData();

    const handleStorage = () => loadData();

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "campuslink_interview_updated",
      loadData
    );

    window.addEventListener(
      "campuslink_feedback_updated",
      loadData
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_interview_updated",
        loadData
      );

      window.removeEventListener(
        "campuslink_feedback_updated",
        loadData
      );
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        record.__reviewStatus === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = [
        record.__studentName,
        record.__studentEmail,
        record.__jobTitle,
        record.__companyName,
        record.__sessionId,
        record.__jobId,
        record.__feedback,
        ...record.__strengths,
        ...record.__improvementAreas,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [records, search, statusFilter]);

  const summary = useMemo(() => {
    const scored = records.filter(
      (item) => item.__score !== null
    );

    const average =
      scored.length > 0
        ? scored.reduce(
            (total, item) => total + item.__score,
            0
          ) / scored.length
        : null;

    return {
      total: records.length,
      pending: records.filter(
        (item) => item.__reviewStatus === "PENDING"
      ).length,
      reviewed: records.filter(
        (item) => item.__reviewStatus === "REVIEWED"
      ).length,
      selected: records.filter(
        (item) =>
          item.__reviewStatus === "SELECTED"
      ).length,
      rejected: records.filter(
        (item) =>
          item.__reviewStatus === "REJECTED"
      ).length,
      average,
    };
  }, [records]);

  return (
    <div className="admin-student-feedback">
      <div className="student-feedback-header">
        <div>
          <div className="student-feedback-eyebrow">
            ADMIN CONTROL CENTER
          </div>

          <h1>Student Feedback</h1>

          <p>
            Review interview performance, AI feedback,
            strengths and improvement areas for students.
          </p>
        </div>

        <button
          type="button"
          className="student-feedback-refresh"
          onClick={loadData}
        >
          <Activity size={17} />
          Refresh
        </button>
      </div>

      <div className="student-feedback-summary">
        <SummaryCard
          icon={<MessageSquare size={20} />}
          label="Total Feedback"
          value={summary.total}
        />

        <SummaryCard
          icon={<Clock size={20} />}
          label="Pending Review"
          value={summary.pending}
        />

        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          label="Reviewed"
          value={summary.reviewed}
        />

        <SummaryCard
          icon={<BarChart3 size={20} />}
          label="Average Score"
          value={
            summary.average === null
              ? "--"
              : `${summary.average.toFixed(1)}%`
          }
        />
      </div>

      <div className="student-feedback-toolbar">
        <div className="student-feedback-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search student, job, company or feedback..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="student-feedback-filter"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="SELECTED">Selected</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="student-feedback-table-card">
        <div className="student-feedback-table-header">
          <div>
            <h2>Interview Feedback Records</h2>

            <span>
              Showing {filteredRecords.length} of{" "}
              {records.length} records
            </span>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="student-feedback-empty">
            <MessageSquare size={42} />

            <h3>No feedback records found</h3>

            <p>
              Completed student interviews and their
              feedback will appear here.
            </p>
          </div>
        ) : (
          <div className="student-feedback-table-wrapper">
            <table className="student-feedback-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Job / Company</th>
                  <th>Performance</th>
                  <th>Feedback</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.__sessionId}>
                    <td>
                      <div className="feedback-student">
                        <div className="feedback-avatar">
                          {record.__profile
                            ?.profilePhoto ? (
                            <img
                              src={
                                record.__profile
                                  .profilePhoto
                              }
                              alt={
                                record.__studentName
                              }
                            />
                          ) : (
                            <User size={18} />
                          )}
                        </div>

                        <div>
                          <strong>
                            {record.__studentName}
                          </strong>

                          <span>
                            {record.__studentEmail ||
                              "Email not available"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="feedback-job">
                        <strong>
                          {record.__jobTitle}
                        </strong>

                        <span>
                          {record.__companyName}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="feedback-score">
                        <strong>
                          {record.__score === null
                            ? "--"
                            : `${record.__score}%`}
                        </strong>

                        <span>
                          {record.__score === null
                            ? "Not evaluated"
                            : "Performance"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="feedback-preview">
                        {record.__feedback ? (
                          record.__feedback
                        ) : (
                          <span>
                            No feedback available
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`feedback-status status-${record.__reviewStatus.toLowerCase()}`}
                      >
                        {formatStatus(
                          record.__reviewStatus
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="feedback-view-btn"
                        onClick={() =>
                          setSelectedFeedback(
                            record
                          )
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

      {selectedFeedback && (
        <FeedbackModal
          record={selectedFeedback}
          onClose={() =>
            setSelectedFeedback(null)
          }
        />
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="student-feedback-stat">
      <div className="student-feedback-stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function FeedbackModal({ record, onClose }) {
  const evaluation = record.__evaluation;

  return (
    <div className="student-feedback-modal-backdrop">
      <div className="student-feedback-modal">
        <div className="student-feedback-modal-header">
          <div>
            <span>STUDENT FEEDBACK</span>

            <h2>{record.__studentName}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="student-feedback-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="student-feedback-modal-body">
          <section className="feedback-profile">
            <div className="feedback-detail-avatar">
              {record.__profile?.profilePhoto ? (
                <img
                  src={record.__profile.profilePhoto}
                  alt={record.__studentName}
                />
              ) : (
                <User size={27} />
              )}
            </div>

            <div className="feedback-profile-info">
              <h3>{record.__studentName}</h3>

              <p>
                {record.__studentEmail ||
                  "Email not available"}
              </p>

              <div className="feedback-profile-tags">
                {record.__profile?.degree && (
                  <span>
                    {record.__profile.degree}
                  </span>
                )}

                {record.__profile?.collegeName && (
                  <span>
                    {record.__profile.collegeName}
                  </span>
                )}

                {record.__profile?.cgpa && (
                  <span>
                    CGPA {record.__profile.cgpa}
                  </span>
                )}
              </div>
            </div>

            <span
              className={`feedback-status status-${record.__reviewStatus.toLowerCase()}`}
            >
              {formatStatus(
                record.__reviewStatus
              )}
            </span>
          </section>

          <div className="feedback-detail-grid">
            <section className="feedback-detail-card">
              <div className="feedback-card-title">
                <FileText size={19} />
                <h3>Interview</h3>
              </div>

              <div className="feedback-detail-list">
                <div>
                  <span>Session ID</span>
                  <strong>
                    {record.__sessionId}
                  </strong>
                </div>

                <div>
                  <span>Job</span>
                  <strong>
                    {record.__jobTitle}
                  </strong>
                </div>

                <div>
                  <span>Company</span>
                  <strong>
                    {record.__companyName}
                  </strong>
                </div>
              </div>
            </section>

            <section className="feedback-detail-card">
              <div className="feedback-card-title">
                <Clock size={19} />
                <h3>Session Date</h3>
              </div>

              <div className="feedback-detail-list">
                <div>
                  <span>Completed</span>

                  <strong>
                    {getDisplayDate(
                      record.completedAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Updated</span>

                  <strong>
                    {getDisplayDate(
                      record.updatedAt
                    )}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          <section className="feedback-score-card">
            <div>
              <span>Overall Performance</span>

              <strong>
                {record.__score === null
                  ? "--"
                  : `${record.__score}%`}
              </strong>
            </div>

            <div className="feedback-score-icon">
              <Award size={25} />
            </div>
          </section>

          {evaluation && (
            <section className="feedback-detail-card">
              <div className="feedback-card-title">
                <BarChart3 size={19} />
                <h3>Performance Breakdown</h3>
              </div>

              <div className="feedback-performance-grid">
                <PerformanceValue
                  label="Answered"
                  value={
                    evaluation.answered ??
                    "--"
                  }
                />

                <PerformanceValue
                  label="Correct"
                  value={
                    evaluation.correct ??
                    "--"
                  }
                />

                <PerformanceValue
                  label="Wrong"
                  value={
                    evaluation.wrong ??
                    "--"
                  }
                />

                <PerformanceValue
                  label="Skipped"
                  value={
                    evaluation.skipped ??
                    "--"
                  }
                />
              </div>
            </section>
          )}

          <section className="feedback-detail-card">
            <div className="feedback-card-title">
              <MessageSquare size={19} />
              <h3>AI / Interview Feedback</h3>
            </div>

            {record.__feedback ? (
              <div className="feedback-main-text">
                {record.__feedback}
              </div>
            ) : (
              <div className="feedback-not-available">
                <AlertCircle size={18} />

                <div>
                  <strong>
                    Feedback not available
                  </strong>

                  <span>
                    This interview does not currently
                    contain a generated feedback message.
                  </span>
                </div>
              </div>
            )}
          </section>

          <div className="feedback-detail-grid">
            <FeedbackList
              icon={<CheckCircle2 size={18} />}
              title="Strengths"
              items={record.__strengths}
              emptyText="No strengths recorded."
            />

            <FeedbackList
              icon={<AlertCircle size={18} />}
              title="Improvement Areas"
              items={record.__improvementAreas}
              emptyText="No improvement areas recorded."
            />
          </div>

          {Array.isArray(
            evaluation?.recommendations
          ) &&
            evaluation.recommendations.length > 0 && (
              <section className="feedback-detail-card">
                <div className="feedback-card-title">
                  <Star size={19} />
                  <h3>Recommendations</h3>
                </div>

                <ul className="feedback-recommendations">
                  {evaluation.recommendations.map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </section>
            )}
        </div>

        <div className="student-feedback-modal-footer">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function PerformanceValue({ label, value }) {
  return (
    <div className="feedback-performance-value">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FeedbackList({
  icon,
  title,
  items,
  emptyText,
}) {
  return (
    <section className="feedback-detail-card">
      <div className="feedback-card-title">
        {icon}
        <h3>{title}</h3>
      </div>

      {items.length === 0 ? (
        <div className="feedback-list-empty">
          {emptyText}
        </div>
      ) : (
        <ul className="feedback-list">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default StudentFeedback;