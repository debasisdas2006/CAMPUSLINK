import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Mic,
  Search,
  ShieldCheck,
  User,
  Video,
  X,
  AlertTriangle,
} from "lucide-react";

import "./StudentInterviews.css";

const INTERVIEW_PREFIX = "campuslink_interview_session_";
const APPLICATIONS_KEY = "campuslink_applications";

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readAllInterviewSessions() {
  const sessions = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith(INTERVIEW_PREFIX)) {
      continue;
    }

    const raw = localStorage.getItem(key);

    if (!raw) {
      continue;
    }

    const parsed = safeParse(raw);

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

function readApplications() {
  const parsed = safeParse(
    localStorage.getItem(APPLICATIONS_KEY) || "[]",
    []
  );

  return Array.isArray(parsed) ? parsed : [];
}

function readStudentProfile(email) {
  if (!email) {
    return null;
  }

  return safeParse(
    localStorage.getItem(
      `campuslink_student_profile_${String(email).toLowerCase()}`
    ) || "null",
    null
  );
}

function readJobsForRecruiter(recruiterEmail) {
  if (!recruiterEmail) {
    return [];
  }

  const parsed = safeParse(
    localStorage.getItem(`campuslink_jobs_${recruiterEmail}`) || "[]",
    []
  );

  return Array.isArray(parsed) ? parsed : [];
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
  const status = String(value || "UNKNOWN")
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
    status.includes("ACTIVE") ||
    status === "IN_PROGRESS" ||
    status === "ONGOING"
  ) {
    return "ACTIVE";
  }

  if (
    status.includes("SCHEDULE") ||
    status === "ASSIGNED"
  ) {
    return "SCHEDULED";
  }

  if (
    status.includes("CANCEL")
  ) {
    return "CANCELLED";
  }

  return status || "UNKNOWN";
}

function getSessionId(session) {
  return (
    session?.interviewId ||
    session?.sessionId ||
    session?.id ||
    session?.interviewSessionId ||
    session?.__storageKey?.replace(INTERVIEW_PREFIX, "") ||
    "UNKNOWN"
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

function getQuestions(session) {
  if (Array.isArray(session?.questions)) {
    return session.questions;
  }

  if (Array.isArray(session?.questionList)) {
    return session.questionList;
  }

  if (Array.isArray(session?.interviewQuestions)) {
    return session.interviewQuestions;
  }

  return [];
}

function getAnswers(session) {
  if (Array.isArray(session?.answers)) {
    return session.answers;
  }

  if (Array.isArray(session?.responses)) {
    return session.responses;
  }

  if (Array.isArray(session?.answerList)) {
    return session.answerList;
  }

  return [];
}

function getMonitoringEvents(session) {
  if (Array.isArray(session?.monitoringEvents)) {
    return session.monitoringEvents;
  }

  if (Array.isArray(session?.monitoring_events)) {
    return session.monitoring_events;
  }

  if (Array.isArray(session?.events)) {
    return session.events;
  }

  if (Array.isArray(session?.aiEvents)) {
    return session.aiEvents;
  }

  return [];
}

function getEvaluation(session) {
  return (
    session?.evaluation ||
    session?.finalEvaluation ||
    session?.result ||
    session?.performance ||
    null
  );
}

function getSchedule(session, application) {
  const interview =
    session?.interview ||
    session?.schedule ||
    application?.interview ||
    {};

  return {
    date:
      session?.scheduledDate ||
      session?.date ||
      interview?.date ||
      "",
    time:
      session?.scheduledTime ||
      session?.time ||
      interview?.time ||
      "",
    duration:
      session?.duration ||
      interview?.duration ||
      "",
    instructions:
      session?.instructions ||
      interview?.instructions ||
      "",
  };
}

function getDisplayDate(value) {
  if (!value) {
    return "Not available";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function formatStatus(status) {
  return String(status || "UNKNOWN")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getQuestionText(question) {
  if (typeof question === "string") {
    return question;
  }

  return (
    question?.question ||
    question?.text ||
    question?.questionText ||
    "Question not available"
  );
}

function getQuestionId(question, index) {
  if (typeof question === "string") {
    return `Q${index + 1}`;
  }

  return (
    question?.question_id ||
    question?.questionId ||
    question?.id ||
    `Q${index + 1}`
  );
}

function getAnswerText(answer) {
  if (typeof answer === "string") {
    return answer;
  }

  return (
    answer?.answer ||
    answer?.response ||
    answer?.text ||
    answer?.studentAnswer ||
    "No answer"
  );
}

function getAnswerQuestionId(answer, index) {
  if (typeof answer === "string") {
    return `Q${index + 1}`;
  }

  return (
    answer?.question_id ||
    answer?.questionId ||
    answer?.id ||
    `Q${index + 1}`
  );
}

function StudentInterviews() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInterview, setSelectedInterview] = useState(null);

  const loadData = () => {
    const applications = readApplications();
    const jobs = readAllJobs();

    const applicationMap = new Map();

    applications.forEach((application) => {
      const key =
        application?.id ||
        `${application?.studentEmail || application?.email || ""}-${
          application?.jobId || ""
        }`;

      applicationMap.set(String(key), application);
    });

    const jobMap = new Map();

    jobs.forEach((job) => {
      if (job?.id) {
        jobMap.set(String(job.id), job);
      }
    });

    const sessions = readAllInterviewSessions();

    const dedupe = new Map();

    sessions.forEach((session) => {
      const sessionId = getSessionId(session);

      const application =
        applicationMap.get(String(session?.applicationId || "")) ||
        applications.find(
          (item) =>
            String(item?.id || "") === String(session?.applicationId || "")
        ) ||
        applications.find(
          (item) =>
            String(item?.studentEmail || item?.email || "").toLowerCase() ===
              String(
                session?.studentEmail ||
                  session?.student_email ||
                  session?.student?.email ||
                  ""
              ).toLowerCase() &&
            String(item?.jobId || "") ===
              String(session?.jobId || session?.job_id || "")
        ) ||
        null;

      const jobId = getJobId(session, application);

      const job =
        jobMap.get(String(jobId)) ||
        jobs.find((item) => String(item?.id || "") === String(jobId)) ||
        null;

      const studentEmail = getStudentEmail(session, application);
      const profile = readStudentProfile(studentEmail);

      const status = normalizeStatus(
        session?.status ||
          session?.interviewStatus ||
          session?.state ||
          application?.status
      );

      const schedule = getSchedule(session, application);

      const record = {
        ...session,
        __sessionId: sessionId,
        __application: application,
        __job: job,
        __profile: profile,
        __studentEmail: studentEmail,
        __studentName: getStudentName(session, application, profile),
        __jobId: jobId,
        __jobTitle: getJobTitle(session, application, job),
        __companyName: getCompanyName(session, application, job),
        __status: status,
        __schedule: schedule,
        __questions: getQuestions(session),
        __answers: getAnswers(session),
        __events: getMonitoringEvents(session),
        __evaluation: getEvaluation(session),
      };

      const existing = dedupe.get(String(sessionId));

      if (!existing) {
        dedupe.set(String(sessionId), record);
      } else {
        dedupe.set(String(sessionId), {
          ...existing,
          ...record,
        });
      }
    });

    const finalRecords = Array.from(dedupe.values()).sort((a, b) => {
      const first =
        new Date(
          a.updatedAt ||
            a.completedAt ||
            a.startedAt ||
            a.createdAt ||
            0
        ).getTime() || 0;

      const second =
        new Date(
          b.updatedAt ||
            b.completedAt ||
            b.startedAt ||
            b.createdAt ||
            0
        ).getTime() || 0;

      return second - first;
    });

    setRecords(finalRecords);
  };

  useEffect(() => {
    loadData();

    const handleStorage = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("campuslink_interview_updated", loadData);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "campuslink_interview_updated",
        loadData
      );
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        record.__status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = [
        record.__sessionId,
        record.__studentName,
        record.__studentEmail,
        record.__jobTitle,
        record.__companyName,
        record.__jobId,
        record.__status,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [records, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: records.length,
      scheduled: records.filter(
        (item) => item.__status === "SCHEDULED"
      ).length,
      active: records.filter(
        (item) => item.__status === "ACTIVE"
      ).length,
      completed: records.filter(
        (item) => item.__status === "COMPLETED"
      ).length,
    };
  }, [records]);

  return (
    <div className="admin-student-interviews">
      <div className="student-interviews-header">
        <div>
          <div className="student-interviews-eyebrow">
            ADMIN CONTROL CENTER
          </div>

          <h1>Student Interviews</h1>

          <p>
            Monitor student interview sessions, answers, AI monitoring
            events and interview evaluations.
          </p>
        </div>

        <button
          type="button"
          className="student-interviews-refresh"
          onClick={loadData}
        >
          <Activity size={17} />
          Refresh
        </button>
      </div>

      <div className="student-interviews-summary">
        <div className="student-interview-stat">
          <div className="student-interview-stat-icon">
            <Video size={20} />
          </div>

          <div>
            <span>Total Interviews</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="student-interview-stat">
          <div className="student-interview-stat-icon">
            <Calendar size={20} />
          </div>

          <div>
            <span>Scheduled</span>
            <strong>{summary.scheduled}</strong>
          </div>
        </div>

        <div className="student-interview-stat">
          <div className="student-interview-stat-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>Active</span>
            <strong>{summary.active}</strong>
          </div>
        </div>

        <div className="student-interview-stat">
          <div className="student-interview-stat-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{summary.completed}</strong>
          </div>
        </div>
      </div>

      <div className="student-interviews-toolbar">
        <div className="student-interviews-search">
          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, job, company or interview ID..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="student-interviews-filter"
        >
          <option value="ALL">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="UNKNOWN">Unknown</option>
        </select>
      </div>

      <div className="student-interviews-table-card">
        <div className="student-interviews-table-header">
          <div>
            <h2>Interview Sessions</h2>
            <span>
              Showing {filteredRecords.length} of {records.length} sessions
            </span>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="student-interviews-empty">
            <Video size={42} />
            <h3>No interview sessions found</h3>

            <p>
              Interview sessions created by the student interview flow
              will appear here.
            </p>
          </div>
        ) : (
          <div className="student-interviews-table-wrapper">
            <table className="student-interviews-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Job / Company</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.__sessionId}>
                    <td>
                      <div className="student-interview-student">
                        <div className="student-interview-avatar">
                          {record.__profile?.profilePhoto ? (
                            <img
                              src={record.__profile.profilePhoto}
                              alt={record.__studentName}
                            />
                          ) : (
                            <User size={18} />
                          )}
                        </div>

                        <div>
                          <strong>{record.__studentName}</strong>

                          <span>
                            {record.__studentEmail ||
                              "Email not available"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="student-interview-job">
                        <strong>{record.__jobTitle}</strong>
                        <span>{record.__companyName}</span>
                      </div>
                    </td>

                    <td>
                      <div className="student-interview-schedule">
                        {record.__schedule.date ? (
                          <>
                            <span>
                              <Calendar size={14} />
                              {record.__schedule.date}
                            </span>

                            {record.__schedule.time && (
                              <span>
                                <Clock size={14} />
                                {record.__schedule.time}
                              </span>
                            )}
                          </>
                        ) : (
                          <span>Not scheduled</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`student-interview-status status-${record.__status.toLowerCase()}`}
                      >
                        {formatStatus(record.__status)}
                      </span>
                    </td>

                    <td>
                      <div className="student-interview-activity">
                        <span>
                          <FileText size={14} />
                          {record.__questions.length} Q
                        </span>

                        <span>
                          <Mic size={14} />
                          {record.__answers.length} A
                        </span>

                        <span>
                          <ShieldCheck size={14} />
                          {record.__events.length}
                        </span>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="student-interview-view-btn"
                        onClick={() =>
                          setSelectedInterview(record)
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

      {selectedInterview && (
        <InterviewDetailsModal
          record={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}

function InterviewDetailsModal({ record, onClose }) {
  const profile = record.__profile;
  const questions = record.__questions;
  const answers = record.__answers;
  const events = record.__events;
  const evaluation = record.__evaluation;
  const schedule = record.__schedule;

  const answerMap = new Map();

  answers.forEach((answer, index) => {
    answerMap.set(
      String(getAnswerQuestionId(answer, index)),
      answer
    );
  });

  return (
    <div className="student-interview-modal-backdrop">
      <div className="student-interview-modal">
        <div className="student-interview-modal-header">
          <div>
            <span>INTERVIEW SESSION</span>
            <h2>{record.__sessionId}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="student-interview-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="student-interview-modal-body">
          <section className="interview-detail-profile">
            <div className="interview-detail-avatar">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={record.__studentName}
                />
              ) : (
                <User size={28} />
              )}
            </div>

            <div className="interview-detail-profile-main">
              <h3>{record.__studentName}</h3>

              <p>{record.__studentEmail || "Email not available"}</p>

              <div className="interview-detail-tags">
                {profile?.degree && (
                  <span>{profile.degree}</span>
                )}

                {profile?.collegeName && (
                  <span>{profile.collegeName}</span>
                )}

                {profile?.cgpa && (
                  <span>CGPA {profile.cgpa}</span>
                )}
              </div>
            </div>

            <span
              className={`student-interview-status status-${record.__status.toLowerCase()}`}
            >
              {formatStatus(record.__status)}
            </span>
          </section>

          <div className="interview-detail-grid">
            <section className="interview-detail-card">
              <div className="interview-detail-card-title">
                <BriefcaseIcon />
                <h3>Job Information</h3>
              </div>

              <div className="interview-detail-list">
                <div>
                  <span>Job</span>
                  <strong>{record.__jobTitle}</strong>
                </div>

                <div>
                  <span>Company</span>
                  <strong>{record.__companyName}</strong>
                </div>

                <div>
                  <span>Job ID</span>
                  <strong>{record.__jobId || "N/A"}</strong>
                </div>
              </div>
            </section>

            <section className="interview-detail-card">
              <div className="interview-detail-card-title">
                <Calendar size={19} />
                <h3>Schedule</h3>
              </div>

              <div className="interview-detail-list">
                <div>
                  <span>Date</span>
                  <strong>
                    {schedule.date || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Time</span>
                  <strong>
                    {schedule.time || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Duration</span>
                  <strong>
                    {schedule.duration
                      ? `${schedule.duration} minutes`
                      : "Not available"}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          {schedule.instructions && (
            <section className="interview-detail-card">
              <div className="interview-detail-card-title">
                <FileText size={19} />
                <h3>Interview Instructions</h3>
              </div>

              <p className="interview-detail-instructions">
                {schedule.instructions}
              </p>
            </section>
          )}

          <section className="interview-detail-card">
            <div className="interview-detail-card-title">
              <Video size={19} />
              <h3>Interview Questions & Answers</h3>

              <span className="detail-count">
                {questions.length} Questions
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="detail-empty">
                No questions recorded for this session.
              </div>
            ) : (
              <div className="interview-question-list">
                {questions.map((question, index) => {
                  const questionId = String(
                    getQuestionId(question, index)
                  );

                  const answer = answerMap.get(questionId);

                  return (
                    <div
                      className="interview-question-item"
                      key={`${questionId}-${index}`}
                    >
                      <div className="interview-question-number">
                        Q{index + 1}
                      </div>

                      <div className="interview-question-content">
                        <strong>
                          {getQuestionText(question)}
                        </strong>

                        {typeof question === "object" &&
                          question?.skill && (
                            <span className="question-skill">
                              {question.skill}
                            </span>
                          )}

                        <div className="interview-answer-box">
                          <span>Student Answer</span>

                          <p>
                            {answer
                              ? getAnswerText(answer)
                              : "No answer recorded"}
                          </p>
                        </div>

                        {typeof answer === "object" &&
                          answer?.status && (
                            <span className="answer-status">
                              {formatStatus(answer.status)}
                            </span>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="interview-detail-card">
            <div className="interview-detail-card-title">
              <ShieldCheck size={19} />
              <h3>AI Monitoring Events</h3>

              <span className="detail-count">
                {events.length} Events
              </span>
            </div>

            {events.length === 0 ? (
              <div className="detail-empty">
                No AI monitoring events recorded.
              </div>
            ) : (
              <div className="monitoring-event-list">
                {events.map((event, index) => {
                  const eventType =
                    typeof event === "string"
                      ? event
                      : event?.type ||
                        event?.event ||
                        event?.name ||
                        "Monitoring Event";

                  const timestamp =
                    typeof event === "object"
                      ? event?.timestamp ||
                        event?.time ||
                        event?.createdAt
                      : "";

                  return (
                    <div
                      className="monitoring-event"
                      key={`${eventType}-${index}`}
                    >
                      <div className="monitoring-event-icon">
                        {String(eventType)
                          .toLowerCase()
                          .includes("face") ? (
                          <Camera size={17} />
                        ) : (
                          <AlertTriangle size={17} />
                        )}
                      </div>

                      <div>
                        <strong>
                          {formatStatus(eventType)}
                        </strong>

                        {timestamp && (
                          <span>
                            {getDisplayDate(timestamp)}
                          </span>
                        )}

                        {typeof event === "object" &&
                          event?.message && (
                            <p>{event.message}</p>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="interview-detail-card">
            <div className="interview-detail-card-title">
              <Activity size={19} />
              <h3>AI Evaluation</h3>
            </div>

            {!evaluation ? (
              <div className="detail-pending">
                <Clock size={19} />

                <div>
                  <strong>Evaluation not available</strong>
                  <span>
                    The interview may still be awaiting AI evaluation
                    or recruiter review.
                  </span>
                </div>
              </div>
            ) : (
              <div className="evaluation-overview">
                <div className="evaluation-score">
                  <span>Performance</span>

                  <strong>
                    {evaluation.percentage ??
                      evaluation.score ??
                      evaluation.finalScore ??
                      "--"}
                    {(
                      evaluation.percentage ??
                      evaluation.score ??
                      evaluation.finalScore
                    ) !== undefined &&
                    (
                      evaluation.percentage ??
                      evaluation.score ??
                      evaluation.finalScore
                    ) !== null
                      ? "%"
                      : ""}
                  </strong>
                </div>

                <div className="evaluation-stats">
                  <div>
                    <span>Answered</span>
                    <strong>
                      {evaluation.answered ?? "--"}
                    </strong>
                  </div>

                  <div>
                    <span>Correct</span>
                    <strong>
                      {evaluation.correct ?? "--"}
                    </strong>
                  </div>

                  <div>
                    <span>Wrong</span>
                    <strong>
                      {evaluation.wrong ?? "--"}
                    </strong>
                  </div>

                  <div>
                    <span>Skipped</span>
                    <strong>
                      {evaluation.skipped ?? "--"}
                    </strong>
                  </div>
                </div>

                {evaluation.feedback && (
                  <div className="evaluation-feedback">
                    <span>Feedback</span>
                    <p>{evaluation.feedback}</p>
                  </div>
                )}

                {Array.isArray(evaluation.strengths) &&
                  evaluation.strengths.length > 0 && (
                    <div className="evaluation-list">
                      <span>Strengths</span>

                      <ul>
                        {evaluation.strengths.map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {Array.isArray(
                  evaluation.improvementAreas
                ) &&
                  evaluation.improvementAreas.length > 0 && (
                    <div className="evaluation-list">
                      <span>Improvement Areas</span>

                      <ul>
                        {evaluation.improvementAreas.map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </section>

          <section className="interview-detail-card session-meta-card">
            <div className="interview-detail-card-title">
              <Clock size={19} />
              <h3>Session Information</h3>
            </div>

            <div className="session-meta-grid">
              <div>
                <span>Created</span>
                <strong>
                  {getDisplayDate(record.createdAt)}
                </strong>
              </div>

              <div>
                <span>Started</span>
                <strong>
                  {getDisplayDate(record.startedAt)}
                </strong>
              </div>

              <div>
                <span>Completed</span>
                <strong>
                  {getDisplayDate(record.completedAt)}
                </strong>
              </div>

              <div>
                <span>Last Updated</span>
                <strong>
                  {getDisplayDate(record.updatedAt)}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <div className="student-interview-modal-footer">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function BriefcaseIcon() {
  return (
    <span className="briefcase-icon">
      <FileText size={19} />
    </span>
  );
}

export default StudentInterviews;