import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  X,
  BarChart3,
  User,
  Briefcase,
  Building2,
  Video,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Target,
  MessageSquare,
  Award,
  TrendingUp,
} from "lucide-react";

import "./Evaluations.css";

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeStatus(status) {
  return String(status || "PENDING")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
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

function readProfile(email) {
  if (!email) return null;

  const profile = safeParse(
    localStorage.getItem(`campuslink_student_profile_${email}`),
    null
  );

  return profile && typeof profile === "object" ? profile : null;
}

function getStudentEmail(application) {
  return (
    application?.studentEmail ||
    application?.email ||
    application?.student?.email ||
    application?.userEmail ||
    ""
  );
}

function getJobId(application) {
  return (
    application?.jobId ||
    application?.job?.id ||
    application?.job_id ||
    ""
  );
}

function getStatusLabel(status) {
  const normalized = normalizeStatus(status);

  const labels = {
    PENDING: "Pending",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    INTERVIEW_COMPLETED: "Interview Completed",
    PENDING_REVIEW: "Pending Review",
    EVALUATED: "Evaluated",
    SELECTED: "Selected",
    REJECTED: "Rejected",
    NOT_SELECTED: "Not Selected",
  };

  return labels[normalized] || normalized.replace(/_/g, " ");
}

function getStatusClass(status) {
  const normalized = normalizeStatus(status);

  if (
    normalized === "COMPLETED" ||
    normalized === "INTERVIEW_COMPLETED" ||
    normalized === "EVALUATED"
  ) {
    return "completed";
  }

  if (normalized === "SELECTED") {
    return "selected";
  }

  if (
    normalized === "REJECTED" ||
    normalized === "NOT_SELECTED"
  ) {
    return "rejected";
  }

  if (
    normalized === "ACTIVE" ||
    normalized === "INTERVIEW_SCHEDULED"
  ) {
    return "active";
  }

  return "pending";
}

function getNumericPercentage(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return null;
  }

  return Math.max(0, Math.min(100, numeric));
}

function getEvaluationFromSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  return (
    session.evaluation ||
    session.finalEvaluation ||
    session.result ||
    session.performance ||
    null
  );
}

function getInterviewAnswers(session) {
  if (!session || typeof session !== "object") {
    return [];
  }

  if (Array.isArray(session.answers)) {
    return session.answers;
  }

  if (Array.isArray(session.responses)) {
    return session.responses;
  }

  if (session.answers && typeof session.answers === "object") {
    return Object.entries(session.answers).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
      })
    );
  }

  return [];
}

function getInterviewQuestions(session) {
  if (!session || typeof session !== "object") {
    return [];
  }

  return Array.isArray(session.questions)
    ? session.questions
    : [];
}

function getMonitoringEvents(session) {
  if (!session || typeof session !== "object") {
    return [];
  }

  if (Array.isArray(session.monitoringEvents)) {
    return session.monitoringEvents;
  }

  if (Array.isArray(session.aiMonitoringEvents)) {
    return session.aiMonitoringEvents;
  }

  if (Array.isArray(session.events)) {
    return session.events;
  }

  return [];
}

function getAllInterviewSessions() {
  const sessions = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith("campuslink_interview_session_")) {
      continue;
    }

    const session = safeParse(
      localStorage.getItem(key),
      null
    );

    if (!session || typeof session !== "object") {
      continue;
    }

    sessions.push(session);
  }

  return sessions;
}

function Evaluations() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedEvaluation, setSelectedEvaluation] =
    useState(null);

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
      Array.isArray(storedUsers)
        ? storedUsers
        : []
    );

    setJobs(getAllJobs());
    setSessions(getAllInterviewSessions());
  };

  useEffect(() => {
    loadData();

    const handleStorage = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener(
      "campuslink_interview_updated",
      handleStorage
    );

    window.addEventListener(
      "campuslink_interview_completed",
      handleStorage
    );

    window.addEventListener(
      "campuslink_application_updated",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_interview_updated",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_interview_completed",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_application_updated",
        handleStorage
      );
    };
  }, []);

  const evaluationRecords = useMemo(() => {
    const records = [];

    sessions.forEach((session, index) => {
      const studentEmail =
        session.studentEmail ||
        session.student?.email ||
        session.email ||
        "";

      const jobId =
        session.jobId ||
        session.job?.id ||
        "";

      const application = applications.find((item) => {
        const applicationEmail =
          getStudentEmail(item);

        const applicationJobId =
          getJobId(item);

        return (
          String(applicationEmail).toLowerCase() ===
            String(studentEmail).toLowerCase() &&
          String(applicationJobId).toLowerCase() ===
            String(jobId).toLowerCase()
        );
      });

      const profile = readProfile(studentEmail);

      const job = jobs.find(
        (item) =>
          String(item?.id || "").toLowerCase() ===
          String(jobId || "").toLowerCase()
      );

      const registeredUser = registeredUsers.find(
        (user) =>
          String(user?.email || "").toLowerCase() ===
          String(studentEmail).toLowerCase()
      );

      const evaluation =
        getEvaluationFromSession(session) || {};

      const applicationEvaluation =
        application?.evaluation ||
        application?.performance ||
        null;

      const mergedEvaluation = {
        ...(applicationEvaluation || {}),
        ...evaluation,
      };

      const percentage =
        getNumericPercentage(
          mergedEvaluation.percentage
        ) ??
        getNumericPercentage(
          mergedEvaluation.score
        ) ??
        getNumericPercentage(
          mergedEvaluation.performancePercentage
        ) ??
        getNumericPercentage(
          session.percentage
        ) ??
        getNumericPercentage(
          session.score
        );

      const answers = getInterviewAnswers(session);
      const questions = getInterviewQuestions(session);
      const monitoringEvents =
        getMonitoringEvents(session);

      const studentName =
        session.studentName ||
        session.student?.name ||
        application?.studentName ||
        application?.name ||
        profile?.name ||
        registeredUser?.name ||
        "Unknown Student";

      const jobTitle =
        session.jobTitle ||
        session.job?.title ||
        application?.jobTitle ||
        application?.jobRole ||
        job?.title ||
        "Job not specified";

      const companyName =
        session.companyName ||
        session.company ||
        application?.companyName ||
        job?.companyName ||
        registeredUser?.company ||
        "Company not specified";

      const status =
        mergedEvaluation.status ||
        session.status ||
        application?.status ||
        "PENDING_REVIEW";

      records.push({
        ...session,

        evaluationId:
          session.id ||
          session.interviewId ||
          `EVAL-${index + 1}`,

        studentEmail,
        studentName,

        jobId,
        jobTitle,
        companyName,

        profile,
        registeredUser,
        application,
        job,

        evaluation: mergedEvaluation,

        percentage,

        answers,
        questions,
        monitoringEvents,

        status,

        strengths: normalizeArray(
          mergedEvaluation.strengths
        ),

        improvementAreas: normalizeArray(
          mergedEvaluation.improvementAreas
        ),

        feedback:
          mergedEvaluation.feedback ||
          mergedEvaluation.overall ||
          mergedEvaluation.summary ||
          "",

        correct:
          mergedEvaluation.correct ??
          mergedEvaluation.correctAnswers ??
          null,

        wrong:
          mergedEvaluation.wrong ??
          mergedEvaluation.wrongAnswers ??
          null,

        skipped:
          mergedEvaluation.skipped ??
          mergedEvaluation.skippedAnswers ??
          null,

        answered:
          mergedEvaluation.answered ??
          null,

        total:
          mergedEvaluation.total ??
          questions.length,

        evaluatedAt:
          mergedEvaluation.evaluatedAt ||
          session.evaluatedAt ||
          session.completedAt ||
          null,
      });
    });

    return records;
  }, [
    sessions,
    applications,
    jobs,
    registeredUsers,
  ]);

  const filteredEvaluations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return evaluationRecords.filter((record) => {
      const searchableText = [
        record.studentName,
        record.studentEmail,
        record.jobTitle,
        record.companyName,
        record.jobId,
        record.evaluationId,
        record.status,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const normalized = normalizeStatus(
        record.status
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        normalized === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    evaluationRecords,
    search,
    statusFilter,
  ]);

  const summary = useMemo(() => {
    const total = evaluationRecords.length;

    const evaluated = evaluationRecords.filter(
      (record) =>
        record.percentage !== null ||
        ["EVALUATED", "COMPLETED", "INTERVIEW_COMPLETED"].includes(
          normalizeStatus(record.status)
        )
    ).length;

    const pending = evaluationRecords.filter(
      (record) =>
        ["PENDING", "PENDING_REVIEW"].includes(
          normalizeStatus(record.status)
        )
    ).length;

    const completed = evaluationRecords.filter(
      (record) =>
        ["COMPLETED", "INTERVIEW_COMPLETED", "EVALUATED"].includes(
          normalizeStatus(record.status)
        )
    ).length;

    const averageScores = evaluationRecords
      .map((record) => record.percentage)
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          !Number.isNaN(Number(value))
      );

    const average =
      averageScores.length > 0
        ? averageScores.reduce(
            (sum, value) => sum + Number(value),
            0
          ) / averageScores.length
        : null;

    return {
      total,
      evaluated,
      pending,
      completed,
      average,
    };
  }, [evaluationRecords]);

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  };

  const getPercentageClass = (percentage) => {
    if (percentage === null) {
      return "unknown";
    }

    if (percentage >= 75) {
      return "high";
    }

    if (percentage >= 50) {
      return "medium";
    }

    return "low";
  };

  return (
    <div className="admin-evaluations-page">
      <div className="evaluations-header">
        <div>
          <div className="evaluations-eyebrow">
            <BarChart3 size={16} />
            ADMIN PERFORMANCE CENTER
          </div>

          <h1>Evaluations</h1>

          <p>
            Review student interview performance, AI evaluation
            results, answers, feedback and monitoring information.
          </p>
        </div>

        <button
          className="evaluations-refresh"
          onClick={loadData}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="evaluation-summary-grid">
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <BarChart3 size={20} />
          </div>

          <div>
            <span>Total Evaluations</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Evaluated</span>
            <strong>{summary.evaluated}</strong>
          </div>
        </div>

        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Pending Review</span>
            <strong>{summary.pending}</strong>
          </div>
        </div>

        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Average Score</span>
            <strong>
              {summary.average === null
                ? "N/A"
                : `${Math.round(summary.average)}%`}
            </strong>
          </div>
        </div>
      </div>

      <div className="evaluation-toolbar">
        <div className="evaluation-search">
          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search student, job, company or evaluation ID..."
          />

          {search && (
            <button
              className="evaluation-clear"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="evaluation-filter">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Evaluations</option>
            <option value="PENDING">Pending</option>
            <option value="PENDING_REVIEW">
              Pending Review
            </option>
            <option value="EVALUATED">Evaluated</option>
            <option value="COMPLETED">Completed</option>
            <option value="INTERVIEW_COMPLETED">
              Interview Completed
            </option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="evaluations-content">
        <div className="evaluations-content-header">
          <div>
            <h2>Interview Evaluations</h2>

            <span>
              Showing {filteredEvaluations.length} of{" "}
              {evaluationRecords.length}
            </span>
          </div>
        </div>

        {filteredEvaluations.length === 0 ? (
          <div className="evaluations-empty">
            <BarChart3 size={45} />

            <h3>No evaluation records found</h3>

            <p>
              Completed student interview evaluation records will
              appear here.
            </p>
          </div>
        ) : (
          <div className="evaluations-table-wrapper">
            <table className="evaluations-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Answers</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvaluations.map((record) => (
                  <tr key={record.evaluationId}>
                    <td>
                      <div className="evaluation-person">
                        <div className="evaluation-avatar">
                          {record.studentName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {record.studentName}
                          </strong>

                          <span>
                            {record.studentEmail ||
                              "Email not available"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="evaluation-job">
                        <Briefcase size={15} />

                        <div>
                          <strong>
                            {record.jobTitle}
                          </strong>

                          <span>
                            {record.jobId ||
                              "Job ID unavailable"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="evaluation-company">
                        <Building2 size={15} />

                        <span>
                          {record.companyName}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`evaluation-score ${getPercentageClass(
                          record.percentage
                        )}`}
                      >
                        {record.percentage === null
                          ? "N/A"
                          : `${Math.round(
                              record.percentage
                            )}%`}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`evaluation-status ${getStatusClass(
                          record.status
                        )}`}
                      >
                        {getStatusLabel(record.status)}
                      </span>
                    </td>

                    <td>
                      <span className="answer-count">
                        {record.answered !== null &&
                        record.total
                          ? `${record.answered}/${record.total}`
                          : `${record.answers.length}/${record.questions.length || record.answers.length}`}
                      </span>
                    </td>

                    <td>
                      <button
                        className="evaluation-view-button"
                        onClick={() =>
                          setSelectedEvaluation(record)
                        }
                      >
                        View Evaluation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEvaluation && (
        <div
          className="evaluation-modal-overlay"
          onClick={() =>
            setSelectedEvaluation(null)
          }
        >
          <div
            className="evaluation-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="evaluation-modal-header">
              <div>
                <span className="evaluation-modal-eyebrow">
                  AI / INTERVIEW EVALUATION
                </span>

                <h2>
                  {selectedEvaluation.studentName}
                </h2>

                <p>
                  {selectedEvaluation.jobTitle} •{" "}
                  {selectedEvaluation.companyName}
                </p>
              </div>

              <button
                className="evaluation-modal-close"
                onClick={() =>
                  setSelectedEvaluation(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="evaluation-modal-body">
              <section className="evaluation-detail-section">
                <div className="evaluation-detail-title">
                  <BarChart3 size={18} />
                  <h3>Performance Overview</h3>
                </div>

                <div className="performance-overview">
                  <div className="performance-score-card">
                    <span>Performance Score</span>

                    <strong>
                      {selectedEvaluation.percentage ===
                      null
                        ? "N/A"
                        : `${Math.round(
                            selectedEvaluation.percentage
                          )}%`}
                    </strong>
                  </div>

                  <div className="performance-metric">
                    <span>Total Questions</span>
                    <strong>
                      {selectedEvaluation.total ||
                        selectedEvaluation.questions
                          .length ||
                        0}
                    </strong>
                  </div>

                  <div className="performance-metric">
                    <span>Answered</span>
                    <strong>
                      {selectedEvaluation.answered ??
                        selectedEvaluation.answers.length}
                    </strong>
                  </div>

                  <div className="performance-metric">
                    <span>Correct</span>
                    <strong>
                      {selectedEvaluation.correct ??
                        "N/A"}
                    </strong>
                  </div>

                  <div className="performance-metric">
                    <span>Wrong</span>
                    <strong>
                      {selectedEvaluation.wrong ??
                        "N/A"}
                    </strong>
                  </div>

                  <div className="performance-metric">
                    <span>Skipped</span>
                    <strong>
                      {selectedEvaluation.skipped ??
                        "N/A"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="evaluation-detail-section">
                <div className="evaluation-detail-title">
                  <User size={18} />
                  <h3>Student Information</h3>
                </div>

                <div className="evaluation-detail-grid">
                  <div>
                    <span>Name</span>
                    <strong>
                      {selectedEvaluation.studentName}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {selectedEvaluation.studentEmail ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>Degree</span>
                    <strong>
                      {selectedEvaluation.profile
                        ?.degree ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>CGPA</span>
                    <strong>
                      {selectedEvaluation.profile
                        ?.cgpa ||
                        "Not specified"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="evaluation-detail-section">
                <div className="evaluation-detail-title">
                  <Video size={18} />
                  <h3>Interview Information</h3>
                </div>

                <div className="evaluation-detail-grid">
                  <div>
                    <span>Evaluation ID</span>
                    <strong>
                      {selectedEvaluation.evaluationId}
                    </strong>
                  </div>

                  <div>
                    <span>Interview ID</span>
                    <strong>
                      {selectedEvaluation.id ||
                        selectedEvaluation.interviewId ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>
                      {getStatusLabel(
                        selectedEvaluation.status
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Evaluated / Completed</span>
                    <strong>
                      {formatDate(
                        selectedEvaluation.evaluatedAt
                      )}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="evaluation-detail-section">
                <div className="evaluation-detail-title">
                  <Target size={18} />
                  <h3>Feedback</h3>
                </div>

                <div className="evaluation-feedback">
                  {selectedEvaluation.feedback ? (
                    <p>
                      {selectedEvaluation.feedback}
                    </p>
                  ) : (
                    <p className="evaluation-muted">
                      No evaluation feedback has been recorded.
                    </p>
                  )}
                </div>
              </section>

              <section className="evaluation-detail-section">
                <div className="evaluation-detail-title">
                  <Award size={18} />
                  <h3>Strengths</h3>
                </div>

                {selectedEvaluation.strengths.length >
                0 ? (
                  <div className="evaluation-chip-list strength">
                    {selectedEvaluation.strengths.map(
                      (item, index) => (
                        <span key={`${item}-${index}`}>
                          {item}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <div className="evaluation-no-data">
                    <AlertCircle size={16} />
                    No strengths recorded.
                  </div>
                )}
              </section>

              <section className="evaluation-detail-section">
                <div className="evaluation-detail-title">
                  <TrendingUp size={18} />
                  <h3>Improvement Areas</h3>
                </div>

                {selectedEvaluation.improvementAreas
                  .length > 0 ? (
                  <div className="evaluation-chip-list improvement">
                    {selectedEvaluation.improvementAreas.map(
                      (item, index) => (
                        <span key={`${item}-${index}`}>
                          {item}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <div className="evaluation-no-data">
                    <AlertCircle size={16} />
                    No improvement areas recorded.
                  </div>
                )}
              </section>

              <section className="evaluation-detail-section">
                <div className="evaluation-detail-title">
                  <MessageSquare size={18} />
                  <h3>Student Answers</h3>
                </div>

                {selectedEvaluation.answers.length >
                0 ? (
                  <div className="answer-list">
                    {selectedEvaluation.answers.map(
                      (answer, index) => {
                        const question =
                          answer?.question ||
                          answer?.questionText ||
                          answer?.text ||
                          `Question ${index + 1}`;

                        const response =
                          answer?.answer ??
                          answer?.response ??
                          answer?.studentAnswer ??
                          answer?.selectedAnswer ??
                          "";

                        const answerStatus =
                          answer?.status ||
                          answer?.evaluationStatus ||
                          "";

                        return (
                          <div
                            className="answer-card"
                            key={
                              answer?.questionId ||
                              answer?.id ||
                              index
                            }
                          >
                            <div className="answer-card-top">
                              <span>
                                Q{index + 1}
                              </span>

                              {answerStatus && (
                                <small>
                                  {String(
                                    answerStatus
                                  ).replace(
                                    /_/g,
                                    " "
                                  )}
                                </small>
                              )}
                            </div>

                            <h4>{question}</h4>

                            <p>
                              {response ||
                                "No answer recorded."}
                            </p>

                            {answer?.correctAnswer && (
                              <div className="correct-answer">
                                <strong>
                                  Correct Answer:
                                </strong>

                                <span>
                                  {
                                    answer.correctAnswer
                                  }
                                </span>
                              </div>
                            )}

                            {answer?.isCorrect !==
                              undefined && (
                              <div
                                className={`answer-correctness ${
                                  answer.isCorrect
                                    ? "correct"
                                    : "incorrect"
                                }`}
                              >
                                {answer.isCorrect
                                  ? "Correct"
                                  : "Incorrect"}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="evaluation-no-data">
                    <MessageSquare size={16} />
                    No interview answers recorded.
                  </div>
                )}
              </section>

              <section className="evaluation-detail-section">
                <div className="evaluation-detail-title">
                  <AlertCircle size={18} />
                  <h3>AI Monitoring Events</h3>
                </div>

                {selectedEvaluation.monitoringEvents
                  .length > 0 ? (
                  <div className="monitoring-event-list">
                    {selectedEvaluation.monitoringEvents.map(
                      (event, index) => (
                        <div
                          className="monitoring-event"
                          key={index}
                        >
                          <div>
                            <strong>
                              {event?.type ||
                                event?.event ||
                                event?.name ||
                                "Monitoring Event"}
                            </strong>

                            <span>
                              {event?.message ||
                                event?.description ||
                                "AI monitoring event recorded."}
                            </span>
                          </div>

                          <small>
                            {formatDate(
                              event?.timestamp ||
                                event?.createdAt ||
                                event?.time
                            )}
                          </small>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="evaluation-no-data">
                    <AlertCircle size={16} />
                    No AI monitoring events recorded.
                  </div>
                )}
              </section>
            </div>

            <div className="evaluation-modal-footer">
              <button
                className="evaluation-close-button"
                onClick={() =>
                  setSelectedEvaluation(null)
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

export default Evaluations;