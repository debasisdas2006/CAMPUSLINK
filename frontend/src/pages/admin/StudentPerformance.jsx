import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Search,
  RefreshCw,
  Eye,
  X,
  User,
  GraduationCap,
  Briefcase,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import "./StudentPerformance.css";

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace("%", "").trim();
    const parsed = Number(cleaned);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function getScore(record) {
  const possibleScores = [
    record?.percentage,
    record?.score,
    record?.performanceScore,
    record?.performance_score,
    record?.matchScore,
    record?.match_score,
    record?.finalScore,
    record?.final_score,
    record?.evaluation?.percentage,
    record?.evaluation?.score,
    record?.evaluation?.performanceScore,
    record?.result?.percentage,
    record?.result?.score,
  ];

  for (const value of possibleScores) {
    const score = toNumber(value);

    if (score !== null) {
      return Math.max(0, Math.min(100, score));
    }
  }

  return null;
}

function getStudentEmail(record) {
  return (
    record?.studentEmail ||
    record?.student_email ||
    record?.email ||
    record?.candidateEmail ||
    record?.candidate_email ||
    record?.student?.email ||
    record?.candidate?.email ||
    ""
  );
}

function getStudentName(record) {
  return (
    record?.studentName ||
    record?.student_name ||
    record?.name ||
    record?.candidateName ||
    record?.candidate_name ||
    record?.student?.name ||
    record?.candidate?.name ||
    ""
  );
}

function getStudentId(record) {
  return (
    record?.studentId ||
    record?.student_id ||
    record?.student?.id ||
    record?.candidateId ||
    record?.candidate_id ||
    ""
  );
}

function getJobName(record) {
  return (
    record?.jobTitle ||
    record?.job_title ||
    record?.jobRole ||
    record?.job_role ||
    record?.job?.title ||
    record?.job?.jobTitle ||
    record?.position ||
    ""
  );
}

function getCompanyName(record) {
  return (
    record?.companyName ||
    record?.company_name ||
    record?.company ||
    record?.job?.companyName ||
    record?.job?.company ||
    ""
  );
}

function getStatus(record) {
  return (
    record?.status ||
    record?.evaluation?.status ||
    record?.result?.status ||
    record?.performanceStatus ||
    ""
  );
}

function getPerformanceRecordsFromObject(
  value,
  sourceKey,
  output = []
) {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      getPerformanceRecordsFromObject(
        item,
        sourceKey,
        output
      );
    });

    return output;
  }

  if (!value || typeof value !== "object") {
    return output;
  }

  const score = getScore(value);

  const email = getStudentEmail(value);
  const name = getStudentName(value);

  const hasPerformanceInformation =
    score !== null ||
    Boolean(value.performance) ||
    Boolean(value.evaluation) ||
    Boolean(value.result) ||
    Boolean(value.performanceScore) ||
    Boolean(value.percentage) ||
    Boolean(value.score);

  if (
    hasPerformanceInformation &&
    (email || name || value.studentId || value.student)
  ) {
    output.push({
      ...value,
      sourceKey,
      score,
    });
  }

  Object.entries(value).forEach(
    ([key, child]) => {
      if (
        [
          "evaluation",
          "result",
          "performance",
          "answers",
          "questions",
        ].includes(key) &&
        child &&
        typeof child === "object"
      ) {
        getPerformanceRecordsFromObject(
          child,
          `${sourceKey}.${key}`,
          output
        );
      }
    }
  );

  return output;
}

function normalizeStudentPerformance(
  records,
  profiles
) {
  const profileMap = new Map();

  profiles.forEach((profile) => {
    const email = String(
      profile.email || ""
    )
      .trim()
      .toLowerCase();

    if (email) {
      profileMap.set(email, profile);
    }
  });

  const grouped = new Map();

  records.forEach((record, index) => {
    const email = String(
      getStudentEmail(record)
    )
      .trim()
      .toLowerCase();

    const studentId =
      getStudentId(record);

    const profile =
      email && profileMap.has(email)
        ? profileMap.get(email)
        : null;

    const name =
      getStudentName(record) ||
      profile?.name ||
      email ||
      studentId ||
      `Student ${index + 1}`;

    const key =
      email ||
      String(studentId || name)
        .trim()
        .toLowerCase();

    if (!key) return;

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        name,
        email:
          email ||
          profile?.email ||
          "",
        studentId:
          studentId ||
          profile?.id ||
          "",
        collegeName:
          profile?.collegeName ||
          record?.collegeName ||
          record?.college ||
          "",
        degree:
          profile?.degree ||
          record?.degree ||
          "",
        cgpa:
          profile?.cgpa ||
          record?.cgpa ||
          "",
        experience:
          profile?.experience ||
          record?.experience ||
          "",
        profilePhoto:
          profile?.profilePhoto ||
          "",
        scores: [],
        records: [],
        jobs: new Set(),
        companies: new Set(),
        latestDate: null,
      });
    }

    const student =
      grouped.get(key);

    const score = getScore(record);

    if (score !== null) {
      student.scores.push(score);
    }

    const job = getJobName(record);

    if (job) {
      student.jobs.add(job);
    }

    const company =
      getCompanyName(record);

    if (company) {
      student.companies.add(company);
    }

    const dateValue =
      record?.updatedAt ||
      record?.completedAt ||
      record?.evaluatedAt ||
      record?.createdAt ||
      record?.submittedAt ||
      record?.date ||
      null;

    if (dateValue) {
      const parsedDate =
        new Date(dateValue);

      if (
        !Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        if (
          !student.latestDate ||
          parsedDate >
            student.latestDate
        ) {
          student.latestDate =
            parsedDate;
        }
      }
    }

    student.records.push(record);
  });

  return Array.from(
    grouped.values()
  ).map((student) => {
    const scores =
      student.scores;

    const average =
      scores.length
        ? scores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) / scores.length
        : null;

    const best =
      scores.length
        ? Math.max(...scores)
        : null;

    const lowest =
      scores.length
        ? Math.min(...scores)
        : null;

    return {
      ...student,
      average,
      best,
      lowest,
      jobs: Array.from(
        student.jobs
      ),
      companies: Array.from(
        student.companies
      ),
    };
  });
}

function getPerformanceLevel(score) {
  if (score === null || score === undefined) {
    return "NOT EVALUATED";
  }

  if (score >= 80) {
    return "EXCELLENT";
  }

  if (score >= 70) {
    return "GOOD";
  }

  if (score >= 60) {
    return "AVERAGE";
  }

  return "NEEDS IMPROVEMENT";
}

function getPerformanceClass(score) {
  if (score === null || score === undefined) {
    return "not-evaluated";
  }

  if (score >= 80) {
    return "excellent";
  }

  if (score >= 70) {
    return "good";
  }

  if (score >= 60) {
    return "average";
  }

  return "needs-improvement";
}

function StudentPerformance() {
  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [performanceFilter, setPerformanceFilter] =
    useState("ALL");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const loadPerformance =
    () => {
      setLoading(true);

      const performanceRecords =
        [];

      const profiles = [];

      /*
       * Load registered users.
       */
      const registeredUsers =
        safeParse(
          localStorage.getItem(
            "campuslink_registered_users"
          ),
          []
        );

      if (
        Array.isArray(
          registeredUsers
        )
      ) {
        registeredUsers
          .filter(
            (user) =>
              String(
                user?.role || ""
              ).toLowerCase() ===
              "student"
          )
          .forEach((user) => {
            const email =
              String(
                user.email || ""
              )
                .trim()
                .toLowerCase();

            if (!email) return;

            const profile =
              safeParse(
                localStorage.getItem(
                  `campuslink_student_profile_${email}`
                ),
                null
              );

            profiles.push({
              ...(profile || {}),
              email:
                profile?.email ||
                user.email,
              name:
                profile?.name ||
                user.name ||
                "",
              id:
                profile?.id ||
                user.id ||
                "",
            });
          });
      }

      /*
       * Load all student profiles that
       * are directly stored in localStorage.
       */
      for (
        let index = 0;
        index < localStorage.length;
        index += 1
      ) {
        const key =
          localStorage.key(index);

        if (!key) continue;

        if (
          !key.startsWith(
            "campuslink_student_profile_"
          )
        ) {
          continue;
        }

        const parsed =
          safeParse(
            localStorage.getItem(key),
            null
          );

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          profiles.push(parsed);
        }
      }

      /*
       * Scan performance-related
       * localStorage records.
       */
      for (
        let index = 0;
        index < localStorage.length;
        index += 1
      ) {
        const key =
          localStorage.key(index);

        if (!key) continue;

        const lowerKey =
          key.toLowerCase();

        const looksLikePerformance =
          lowerKey.includes(
            "performance"
          ) ||
          lowerKey.includes(
            "evaluation"
          ) ||
          lowerKey.includes(
            "assessment"
          ) ||
          lowerKey.includes(
            "interview"
          ) ||
          lowerKey.includes(
            "test_result"
          ) ||
          lowerKey.includes(
            "test-results"
          ) ||
          lowerKey.includes(
            "result"
          );

        if (
          !looksLikePerformance
        ) {
          continue;
        }

        const parsed =
          safeParse(
            localStorage.getItem(key),
            null
          );

        if (
          parsed === null
        ) {
          continue;
        }

        getPerformanceRecordsFromObject(
          parsed,
          key,
          performanceRecords
        );
      }

      /*
       * Interview sessions can contain
       * evaluation information even if
       * their key does not explicitly
       * contain "performance".
       */
      for (
        let index = 0;
        index < localStorage.length;
        index += 1
      ) {
        const key =
          localStorage.key(index);

        if (
          !key ||
          !key.startsWith(
            "campuslink_interview_session_"
          )
        ) {
          continue;
        }

        const parsed =
          safeParse(
            localStorage.getItem(key),
            null
          );

        if (
          parsed === null
        ) {
          continue;
        }

        getPerformanceRecordsFromObject(
          parsed,
          key,
          performanceRecords
        );
      }

      const normalized =
        normalizeStudentPerformance(
          performanceRecords,
          profiles
        );

      /*
       * If performance records do not
       * exist yet, still show students
       * from their profiles so Admin can
       * see "Not Evaluated".
       */
      profiles.forEach(
        (profile, index) => {
          const email =
            String(
              profile.email || ""
            )
              .trim()
              .toLowerCase();

          const name =
            profile.name ||
            email ||
            `Student ${
              index + 1
            }`;

          const key =
            email ||
            String(name)
              .trim()
              .toLowerCase();

          if (!key) return;

          const exists =
            normalized.some(
              (student) =>
                student.key ===
                key
            );

          if (!exists) {
            normalized.push({
              key,
              name,
              email:
                profile.email ||
                "",
              studentId:
                profile.id ||
                "",
              collegeName:
                profile.collegeName ||
                "",
              degree:
                profile.degree ||
                "",
              cgpa:
                profile.cgpa ||
                "",
              experience:
                profile.experience ||
                "",
              profilePhoto:
                profile.profilePhoto ||
                "",
              scores: [],
              records: [],
              jobs: [],
              companies: [],
              average: null,
              best: null,
              lowest: null,
              latestDate: null,
            });
          }
        }
      );

      setStudents(normalized);
      setLoading(false);
    };

  useEffect(() => {
    loadPerformance();

    const handleStorage =
      () => loadPerformance();

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "campuslink_profile_updated",
      handleStorage
    );

    window.addEventListener(
      "campuslink_interview_updated",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_profile_updated",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_interview_updated",
        handleStorage
      );
    };
  }, []);

  const filteredStudents =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return students.filter(
        (student) => {
          const matchesSearch =
            !term ||
            [
              student.name,
              student.email,
              student.studentId,
              student.collegeName,
              student.degree,
              ...student.jobs,
              ...student.companies,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(term)
              );

          const level =
            getPerformanceLevel(
              student.average
            );

          const matchesPerformance =
            performanceFilter ===
              "ALL" ||
            level ===
              performanceFilter;

          return (
            matchesSearch &&
            matchesPerformance
          );
        }
      );
    }, [
      students,
      search,
      performanceFilter,
    ]);

  const evaluatedStudents =
    students.filter(
      (student) =>
        student.average !== null
    );

  const averagePlatformScore =
    evaluatedStudents.length
      ? evaluatedStudents.reduce(
          (sum, student) =>
            sum +
            student.average,
          0
        ) /
        evaluatedStudents.length
      : null;

  const excellentCount =
    students.filter(
      (student) =>
        student.average !== null &&
        student.average >= 80
    ).length;

  const needsImprovementCount =
    students.filter(
      (student) =>
        student.average !== null &&
        student.average < 60
    ).length;

  const handleCloseModal =
    () => {
      setSelectedStudent(null);
    };

  return (
    <div className="admin-student-performance-page">
      <div className="student-performance-header">
        <div>
          <div className="student-performance-eyebrow">
            ADMINISTRATION
          </div>

          <h1>
            Student Performance
          </h1>

          <p>
            Monitor assessment,
            interview, and overall
            student performance.
          </p>
        </div>

        <button
          type="button"
          className="student-performance-refresh"
          onClick={
            loadPerformance
          }
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "student-performance-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      <div className="student-performance-summary">
        <div className="performance-stat-card">
          <div className="performance-stat-icon">
            <GraduationCap size={21} />
          </div>

          <div>
            <span>
              Total Students
            </span>

            <strong>
              {students.length}
            </strong>
          </div>
        </div>

        <div className="performance-stat-card">
          <div className="performance-stat-icon">
            <BarChart3 size={21} />
          </div>

          <div>
            <span>
              Evaluated Students
            </span>

            <strong>
              {
                evaluatedStudents.length
              }
            </strong>
          </div>
        </div>

        <div className="performance-stat-card">
          <div className="performance-stat-icon">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>
              Platform Average
            </span>

            <strong>
              {averagePlatformScore !==
              null
                ? `${averagePlatformScore.toFixed(
                    1
                  )}%`
                : "—"}
            </strong>
          </div>
        </div>

        <div className="performance-stat-card">
          <div className="performance-stat-icon">
            <Award size={21} />
          </div>

          <div>
            <span>
              Excellent Performers
            </span>

            <strong>
              {excellentCount}
            </strong>
          </div>
        </div>
      </div>

      <div className="performance-secondary-stats">
        <div>
          <CheckCircle2 size={17} />
          <span>
            Strong Performance
          </span>
          <strong>
            {excellentCount}
          </strong>
        </div>

        <div>
          <AlertTriangle size={17} />
          <span>
            Needs Improvement
          </span>
          <strong>
            {needsImprovementCount}
          </strong>
        </div>

        <div>
          <User size={17} />
          <span>
            Showing
          </span>
          <strong>
            {filteredStudents.length}
          </strong>
        </div>
      </div>

      <div className="student-performance-toolbar">
        <div className="student-performance-search">
          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search student, email, college, degree..."
          />
        </div>

        <select
          value={
            performanceFilter
          }
          onChange={(event) =>
            setPerformanceFilter(
              event.target.value
            )
          }
          className="student-performance-select"
        >
          <option value="ALL">
            All Performance
          </option>

          <option value="EXCELLENT">
            Excellent
          </option>

          <option value="GOOD">
            Good
          </option>

          <option value="AVERAGE">
            Average
          </option>

          <option value="NEEDS IMPROVEMENT">
            Needs Improvement
          </option>

          <option value="NOT EVALUATED">
            Not Evaluated
          </option>
        </select>
      </div>

      <div className="student-performance-section">
        <div className="student-performance-section-header">
          <div>
            <h2>
              Student Performance Records
            </h2>

            <p>
              Review individual
              student performance
              information.
            </p>
          </div>

          <span>
            {filteredStudents.length}{" "}
            Students
          </span>
        </div>

        {filteredStudents.length ===
        0 ? (
          <div className="student-performance-empty">
            <div className="student-performance-empty-icon">
              <BarChart3 size={28} />
            </div>

            <h3>
              No performance
              records found
            </h3>

            <p>
              Performance records
              will appear here when
              students complete
              assessments or
              interviews.
            </p>

            {(search ||
              performanceFilter !==
                "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPerformanceFilter(
                    "ALL"
                  );
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="student-performance-table-wrapper">
            <table className="student-performance-table">
              <thead>
                <tr>
                  <th>
                    Student
                  </th>

                  <th>
                    Education
                  </th>

                  <th>
                    Evaluations
                  </th>

                  <th>
                    Average Score
                  </th>

                  <th>
                    Best Score
                  </th>

                  <th>
                    Performance
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(
                  (student) => {
                    const level =
                      getPerformanceLevel(
                        student.average
                      );

                    return (
                      <tr
                        key={
                          student.key
                        }
                      >
                        <td>
                          <div className="performance-student-cell">
                            <div className="performance-avatar">
                              {student.profilePhoto ? (
                                <img
                                  src={
                                    student.profilePhoto
                                  }
                                  alt={
                                    student.name
                                  }
                                />
                              ) : (
                                <User
                                  size={19}
                                />
                              )}
                            </div>

                            <div>
                              <strong>
                                {
                                  student.name
                                }
                              </strong>

                              <span>
                                {
                                  student.email
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="performance-education-cell">
                            <strong>
                              {
                                student.degree ||
                                "Degree not added"
                              }
                            </strong>

                            <span>
                              {
                                student.collegeName ||
                                "College not added"
                              }
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="performance-evaluation-count">
                            {
                              student
                                .scores
                                .length
                            }
                          </span>
                        </td>

                        <td>
                          <strong className="performance-score-value">
                            {student.average !==
                            null
                              ? `${student.average.toFixed(
                                  1
                                )}%`
                              : "—"}
                          </strong>
                        </td>

                        <td>
                          <span className="performance-best-score">
                            {student.best !==
                            null
                              ? `${student.best.toFixed(
                                  1
                                )}%`
                              : "—"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`performance-level-badge ${getPerformanceClass(
                              student.average
                            )}`}
                          >
                            {level}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="performance-view-button"
                            onClick={() =>
                              setSelectedStudent(
                                student
                              )
                            }
                          >
                            <Eye
                              size={16}
                            />

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
      </div>

      {selectedStudent && (
        <div
          className="student-performance-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseModal();
            }
          }}
        >
          <div className="student-performance-modal">
            <div className="student-performance-modal-header">
              <div>
                <span>
                  STUDENT PERFORMANCE
                </span>

                <h2>
                  {
                    selectedStudent.name
                  }
                </h2>
              </div>

              <button
                type="button"
                className="student-performance-close"
                onClick={
                  handleCloseModal
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="student-performance-modal-content">
              <div className="performance-profile-top">
                <div className="performance-profile-avatar">
                  {selectedStudent.profilePhoto ? (
                    <img
                      src={
                        selectedStudent.profilePhoto
                      }
                      alt={
                        selectedStudent.name
                      }
                    />
                  ) : (
                    <User
                      size={27}
                    />
                  )}
                </div>

                <div>
                  <h3>
                    {
                      selectedStudent.name
                    }
                  </h3>

                  <p>
                    {
                      selectedStudent.email ||
                      "Email not available"
                    }
                  </p>
                </div>
              </div>

              <div className="performance-detail-grid">
                <div className="performance-detail-card">
                  <span>
                    College
                  </span>

                  <strong>
                    {
                      selectedStudent.collegeName ||
                      "Not available"
                    }
                  </strong>
                </div>

                <div className="performance-detail-card">
                  <span>
                    Degree
                  </span>

                  <strong>
                    {
                      selectedStudent.degree ||
                      "Not available"
                    }
                  </strong>
                </div>

                <div className="performance-detail-card">
                  <span>
                    CGPA
                  </span>

                  <strong>
                    {
                      selectedStudent.cgpa ||
                      "Not available"
                    }
                  </strong>
                </div>

                <div className="performance-detail-card">
                  <span>
                    Experience
                  </span>

                  <strong>
                    {
                      selectedStudent.experience ||
                      "Not available"
                    }
                  </strong>
                </div>
              </div>

              <div className="performance-score-panel">
                <div>
                  <span>
                    Average Performance
                  </span>

                  <strong>
                    {selectedStudent.average !==
                    null
                      ? `${selectedStudent.average.toFixed(
                          1
                        )}%`
                      : "Not Evaluated"}
                  </strong>
                </div>

                <span
                  className={`performance-level-badge ${getPerformanceClass(
                    selectedStudent.average
                  )}`}
                >
                  {getPerformanceLevel(
                    selectedStudent.average
                  )}
                </span>
              </div>

              <div className="performance-metrics-grid">
                <div>
                  <span>
                    Evaluations
                  </span>

                  <strong>
                    {
                      selectedStudent
                        .scores
                        .length
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Best Score
                  </span>

                  <strong>
                    {selectedStudent.best !==
                    null
                      ? `${selectedStudent.best.toFixed(
                          1
                        )}%`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Lowest Score
                  </span>

                  <strong>
                    {selectedStudent.lowest !==
                    null
                      ? `${selectedStudent.lowest.toFixed(
                          1
                        )}%`
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="performance-record-section">
                <div className="performance-record-heading">
                  <div>
                    <h3>
                      Evaluation Records
                    </h3>

                    <p>
                      Assessment and
                      interview
                      performance records
                      available for this
                      student.
                    </p>
                  </div>
                </div>

                {selectedStudent
                  .records.length ===
                0 ? (
                  <div className="performance-no-records">
                    No completed
                    evaluation records
                    are available.
                  </div>
                ) : (
                  <div className="performance-record-list">
                    {selectedStudent.records.map(
                      (
                        record,
                        index
                      ) => {
                        const score =
                          getScore(
                            record
                          );

                        return (
                          <div
                            className="performance-record-item"
                            key={`${selectedStudent.key}-record-${index}`}
                          >
                            <div>
                              <strong>
                                {getJobName(
                                  record
                                ) ||
                                  "Student Evaluation"}
                              </strong>

                              <span>
                                {getCompanyName(
                                  record
                                ) ||
                                  getStatus(
                                    record
                                  ) ||
                                  "Evaluation Record"}
                              </span>
                            </div>

                            <div className="performance-record-score">
                              {score !==
                              null
                                ? `${score.toFixed(
                                    1
                                  )}%`
                                : "—"}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {selectedStudent.jobs
                .length > 0 && (
                <div className="performance-associated-section">
                  <h3>
                    Associated Jobs
                  </h3>

                  <div className="performance-tag-list">
                    {selectedStudent.jobs.map(
                      (job) => (
                        <span
                          key={job}
                        >
                          <Briefcase
                            size={13}
                          />

                          {job}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {selectedStudent.companies
                .length > 0 && (
                <div className="performance-associated-section">
                  <h3>
                    Associated Companies
                  </h3>

                  <div className="performance-tag-list">
                    {selectedStudent.companies.map(
                      (
                        company
                      ) => (
                        <span
                          key={
                            company
                          }
                        >
                          {company}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="student-performance-modal-footer">
              <button
                type="button"
                onClick={
                  handleCloseModal
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

export default StudentPerformance;