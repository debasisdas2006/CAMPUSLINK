import { useMemo, useState } from "react";
import {
  Video,
  Search,
  RefreshCw,
  Eye,
  X,
  CalendarDays,
  Clock3,
  UserRound,
  BriefcaseBusiness,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "./Interviews.css";

const readJSON = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const getApplications = () => {
  const applications = readJSON(
    "campuslink_applications",
    []
  );

  return Array.isArray(applications) ? applications : [];
};

const getInterviewSessions = () => {
  const sessions = [];

  Object.keys(localStorage).forEach((key) => {
    if (
      !key.startsWith("campuslink_interview_session_")
    ) {
      return;
    }

    const data = readJSON(key, null);

    if (!data || typeof data !== "object") return;

    sessions.push({
      ...data,
      __source: key,
    });
  });

  return sessions;
};

const getStudentProfile = (email) => {
  if (!email) return null;

  return readJSON(
    `campuslink_student_profile_${email}`,
    null
  );
};

const getAllJobs = () => {
  const jobs = [];

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("campuslink_jobs_")) return;

    const data = readJSON(key, []);

    if (!Array.isArray(data)) return;

    data.forEach((job) => {
      if (!job?.id) return;

      jobs.push({
        ...job,
        recruiterEmail:
          job.recruiterEmail ||
          key.replace("campuslink_jobs_", ""),
      });
    });
  });

  const uniqueJobs = new Map();

  jobs.forEach((job) => {
    uniqueJobs.set(job.id, job);
  });

  return Array.from(uniqueJobs.values());
};

const getStatusClass = (status) => {
  const normalized = String(
    status || ""
  ).toUpperCase();

  if (
    normalized === "COMPLETED" ||
    normalized === "INTERVIEW_COMPLETED"
  ) {
    return "status-completed";
  }

  if (
    normalized === "ACTIVE" ||
    normalized === "IN_PROGRESS"
  ) {
    return "status-active";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "REJECTED"
  ) {
    return "status-cancelled";
  }

  return "status-scheduled";
};

function Interviews() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [selectedInterview, setSelectedInterview] =
    useState(null);

  const data = useMemo(() => {
    const applications = getApplications();
    const sessions = getInterviewSessions();
    const jobs = getAllJobs();

    const jobMap = new Map(
      jobs.map((job) => [job.id, job])
    );

    const applicationInterviews = applications
      .filter((application) => {
        return (
          application?.interview?.scheduled ||
          String(application?.status || "")
            .toUpperCase()
            .includes("INTERVIEW")
        );
      })
      .map((application) => {
        const job =
          jobMap.get(application.jobId) || {};

        const studentEmail =
          application.studentEmail ||
          application.email ||
          application.userEmail ||
          "";

        const profile =
          getStudentProfile(studentEmail);

        return {
          id:
            application.interview?.sessionId ||
            application.sessionId ||
            `APP-${application.id || Date.now()}`,
          applicationId:
            application.id || application.applicationId,
          studentEmail,
          studentName:
            application.studentName ||
            profile?.name ||
            "Unknown Student",
          studentProfile: profile,
          jobId:
            application.jobId ||
            application.job?.id ||
            "",
          jobTitle:
            application.jobTitle ||
            application.job?.title ||
            job.title ||
            "Unknown Job",
          companyName:
            application.companyName ||
            application.company ||
            application.job?.companyName ||
            job.companyName ||
            "Unknown Company",
          recruiterEmail:
            application.recruiterEmail ||
            job.recruiterEmail ||
            "",
          status:
            application.status ||
            "INTERVIEW_SCHEDULED",
          scheduledDate:
            application.interview?.date || "",
          scheduledTime:
            application.interview?.time || "",
          duration:
            application.interview?.duration || "",
          instructions:
            application.interview?.instructions || "",
          source: "Application",
          raw: application,
        };
      });

    const sessionInterviews = sessions.map(
      (session) => {
        const profile = getStudentProfile(
          session.studentEmail
        );

        const job = jobMap.get(session.jobId) || {};

        return {
          id:
            session.id ||
            session.sessionId ||
            session.__source,
          applicationId:
            session.applicationId || "",
          studentEmail:
            session.studentEmail || "",
          studentName:
            session.studentName ||
            profile?.name ||
            "Unknown Student",
          studentProfile: profile,
          jobId: session.jobId || "",
          jobTitle:
            session.jobTitle ||
            job.title ||
            "Unknown Job",
          companyName:
            session.companyName ||
            job.companyName ||
            "Unknown Company",
          recruiterEmail:
            session.recruiterEmail ||
            job.recruiterEmail ||
            "",
          status:
            session.status ||
            "CREATED",
          scheduledDate:
            session.scheduledDate ||
            session.date ||
            "",
          scheduledTime:
            session.scheduledTime ||
            session.time ||
            "",
          duration:
            session.duration || "",
          instructions:
            session.instructions || "",
          questions: Array.isArray(
            session.questions
          )
            ? session.questions
            : [],
          currentQuestionIndex:
            session.currentQuestionIndex ?? 0,
          evaluation:
            session.evaluation || null,
          monitoringEvents:
            Array.isArray(
              session.monitoringEvents
            )
              ? session.monitoringEvents
              : [],
          source: "Interview Session",
          raw: session,
        };
      }
    );

    const combined = [
      ...applicationInterviews,
      ...sessionInterviews,
    ];

    const unique = new Map();

    combined.forEach((interview) => {
      const key =
        interview.id ||
        `${interview.studentEmail}-${interview.jobId}`;

      if (!unique.has(key)) {
        unique.set(key, interview);
      } else {
        const existing = unique.get(key);

        unique.set(key, {
          ...existing,
          ...interview,
          studentProfile:
            interview.studentProfile ||
            existing.studentProfile,
        });
      }
    });

    return Array.from(unique.values());
  }, [refreshKey]);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.filter((interview) => {
      const searchable = [
        interview.studentName,
        interview.studentEmail,
        interview.jobTitle,
        interview.companyName,
        interview.status,
        interview.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const normalizedStatus = String(
        interview.status || ""
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const completedCount = data.filter((item) =>
    [
      "COMPLETED",
      "INTERVIEW_COMPLETED",
    ].includes(
      String(item.status || "").toUpperCase()
    )
  ).length;

  const activeCount = data.filter((item) =>
    ["ACTIVE", "IN_PROGRESS"].includes(
      String(item.status || "").toUpperCase()
    )
  ).length;

  const scheduledCount = data.filter((item) =>
    [
      "CREATED",
      "SCHEDULED",
      "INTERVIEW_SCHEDULED",
    ].includes(
      String(item.status || "").toUpperCase()
    )
  ).length;

  return (
    <div className="admin-interviews-page">
      <div className="interviews-header">
        <div>
          <div className="interviews-eyebrow">
            ADMIN / INTERVIEW MONITORING
          </div>

          <h1>Monitor Interviews</h1>

          <p>
            Monitor student interview sessions,
            schedules, completion status and AI
            monitoring activity.
          </p>
        </div>

        <button
          className="interviews-refresh-button"
          onClick={() =>
            setRefreshKey((value) => value + 1)
          }
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <section className="interviews-summary-grid">
        <div className="interview-summary-card">
          <div className="interview-summary-icon">
            <Video size={22} />
          </div>

          <div>
            <span>Total Interviews</span>
            <strong>{data.length}</strong>
          </div>
        </div>

        <div className="interview-summary-card">
          <div className="interview-summary-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>Scheduled</span>
            <strong>{scheduledCount}</strong>
          </div>
        </div>

        <div className="interview-summary-card">
          <div className="interview-summary-icon">
            <Activity size={22} />
          </div>

          <div>
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="interview-summary-card">
          <div className="interview-summary-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>
      </section>

      <section className="interviews-toolbar">
        <div className="interviews-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search student, job, company or interview ID..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="ALL">All Statuses</option>
          <option value="CREATED">Created</option>
          <option value="SCHEDULED">
            Scheduled
          </option>
          <option value="INTERVIEW_SCHEDULED">
            Interview Scheduled
          </option>
          <option value="ACTIVE">Active</option>
          <option value="IN_PROGRESS">
            In Progress
          </option>
          <option value="COMPLETED">
            Completed
          </option>
          <option value="INTERVIEW_COMPLETED">
            Interview Completed
          </option>
          <option value="CANCELLED">
            Cancelled
          </option>
        </select>
      </section>

      <section className="interviews-panel">
        <div className="interviews-panel-header">
          <div>
            <span>INTERVIEW SESSIONS</span>

            <h2>
              {filteredInterviews.length} Sessions
            </h2>
          </div>

          <Video size={22} />
        </div>

        {filteredInterviews.length === 0 ? (
          <div className="interviews-empty">
            <Video size={40} />

            <h3>No interview sessions found</h3>

            <p>
              Scheduled or active interview records
              will appear here.
            </p>
          </div>
        ) : (
          <div className="interviews-table-wrapper">
            <table className="interviews-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Job / Company</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>AI Monitoring</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredInterviews.map(
                  (interview) => {
                    const monitoringCount =
                      interview.monitoringEvents
                        ?.length || 0;

                    return (
                      <tr key={interview.id}>
                        <td>
                          <div className="student-table-cell">
                            <div className="student-avatar">
                              {interview.studentProfile
                                ?.profilePhoto ? (
                                <img
                                  src={
                                    interview
                                      .studentProfile
                                      .profilePhoto
                                  }
                                  alt={
                                    interview.studentName
                                  }
                                />
                              ) : (
                                interview.studentName
                                  ?.charAt(0)
                                  ?.toUpperCase() || "S"
                              )}
                            </div>

                            <div>
                              <strong>
                                {interview.studentName}
                              </strong>

                              <span>
                                {interview.studentEmail ||
                                  "Email unavailable"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="job-table-cell">
                            <strong>
                              {interview.jobTitle}
                            </strong>

                            <span>
                              {interview.companyName}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="schedule-cell">
                            <span>
                              <CalendarDays
                                size={14}
                              />
                              {interview.scheduledDate ||
                                "Not scheduled"}
                            </span>

                            <span>
                              <Clock3 size={14} />
                              {interview.scheduledTime ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`interview-status ${getStatusClass(
                              interview.status
                            )}`}
                          >
                            {String(
                              interview.status ||
                                "UNKNOWN"
                            )
                              .replaceAll("_", " ")
                              .toLowerCase()
                              .replace(
                                /\b\w/g,
                                (letter) =>
                                  letter.toUpperCase()
                              )}
                          </span>
                        </td>

                        <td>
                          <div className="monitoring-cell">
                            <Activity size={15} />

                            <span>
                              {monitoringCount} event
                              {monitoringCount === 1
                                ? ""
                                : "s"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <button
                            className="view-interview-button"
                            onClick={() =>
                              setSelectedInterview(
                                interview
                              )
                            }
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedInterview && (
        <div
          className="interview-modal-overlay"
          onClick={() =>
            setSelectedInterview(null)
          }
        >
          <div
            className="interview-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="interview-modal-header">
              <div>
                <span>INTERVIEW DETAILS</span>

                <h2>
                  {selectedInterview.jobTitle}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedInterview(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="interview-modal-body">
              <div className="interview-detail-profile">
                <div className="large-student-avatar">
                  {selectedInterview.studentProfile
                    ?.profilePhoto ? (
                    <img
                      src={
                        selectedInterview
                          .studentProfile
                          .profilePhoto
                      }
                      alt={
                        selectedInterview.studentName
                      }
                    />
                  ) : (
                    selectedInterview.studentName
                      ?.charAt(0)
                      ?.toUpperCase() || "S"
                  )}
                </div>

                <div>
                  <h3>
                    {selectedInterview.studentName}
                  </h3>

                  <p>
                    {selectedInterview.studentEmail ||
                      "Email unavailable"}
                  </p>

                  <span>
                    Interview ID:{" "}
                    {selectedInterview.id}
                  </span>
                </div>
              </div>

              <div className="interview-detail-grid">
                <div className="interview-detail-card">
                  <UserRound size={17} />

                  <div>
                    <label>Student</label>
                    <strong>
                      {selectedInterview.studentName}
                    </strong>
                  </div>
                </div>

                <div className="interview-detail-card">
                  <BriefcaseBusiness size={17} />

                  <div>
                    <label>Company</label>
                    <strong>
                      {selectedInterview.companyName}
                    </strong>
                  </div>
                </div>

                <div className="interview-detail-card">
                  <CalendarDays size={17} />

                  <div>
                    <label>Date</label>
                    <strong>
                      {selectedInterview.scheduledDate ||
                        "Not scheduled"}
                    </strong>
                  </div>
                </div>

                <div className="interview-detail-card">
                  <Clock3 size={17} />

                  <div>
                    <label>Time / Duration</label>
                    <strong>
                      {selectedInterview
                        .scheduledTime ||
                        "—"}{" "}
                      {selectedInterview.duration
                        ? `• ${selectedInterview.duration} min`
                        : ""}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="interview-detail-section">
                <label>Status</label>

                <span
                  className={`interview-status ${getStatusClass(
                    selectedInterview.status
                  )}`}
                >
                  {String(
                    selectedInterview.status ||
                      "UNKNOWN"
                  )
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(
                      /\b\w/g,
                      (letter) => letter.toUpperCase()
                    )}
                </span>
              </div>

              <div className="interview-detail-section">
                <label>Questions</label>

                <strong>
                  {selectedInterview.questions
                    ?.length || "Not available"}
                </strong>
              </div>

              <div className="interview-detail-section">
                <label>AI Monitoring Events</label>

                {selectedInterview
                  .monitoringEvents?.length ? (
                  <div className="monitoring-events-list">
                    {selectedInterview.monitoringEvents.map(
                      (event, index) => {
                        const eventName =
                          typeof event === "string"
                            ? event
                            : event?.type ||
                              event?.event ||
                              "Monitoring Event";

                        const eventTime =
                          typeof event === "object"
                            ? event?.timestamp ||
                              event?.time ||
                              ""
                            : "";

                        return (
                          <div
                            className="monitoring-event"
                            key={index}
                          >
                            <Activity size={15} />

                            <div>
                              <strong>
                                {String(
                                  eventName
                                )
                                  .replaceAll(
                                    "_",
                                    " "
                                  )
                                  .replace(
                                    /\b\w/g,
                                    (letter) =>
                                      letter.toUpperCase()
                                  )}
                              </strong>

                              {eventTime && (
                                <span>
                                  {eventTime}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="no-monitoring">
                    <AlertCircle size={17} />

                    <span>
                      No AI monitoring events recorded.
                    </span>
                  </div>
                )}
              </div>

              {selectedInterview.evaluation && (
                <div className="interview-detail-section">
                  <label>Evaluation</label>

                  <div className="evaluation-summary">
                    <strong>
                      {selectedInterview.evaluation
                        .percentage ??
                        selectedInterview.evaluation
                          .overall ??
                        "—"}
                      %
                    </strong>

                    <span>
                      {selectedInterview.evaluation
                        .status ||
                        "Evaluation available"}
                    </span>
                  </div>
                </div>
              )}

              {selectedInterview.instructions && (
                <div className="interview-detail-section">
                  <label>Instructions</label>

                  <p className="instructions-text">
                    {selectedInterview.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interviews;