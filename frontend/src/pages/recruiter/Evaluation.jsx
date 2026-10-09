import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Award,
  Brain,
  CheckCircle,
  Code2,
  MessageSquare,
  ShieldCheck,
  Target,
  UserRound,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./Evaluation.css";

const APPLICATIONS_KEY =
  "campuslink_applications";

const INTERVIEW_SESSION_PREFIX =
  "campuslink_interview_session_";

/*
 * =========================================================
 * SAFE JSON
 * =========================================================
 */

function readJson(
  key,
  fallback = null
) {
  try {
    const value =
      localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(
      `Could not read ${key}:`,
      error
    );

    return fallback;
  }
}

/*
 * =========================================================
 * NORMALIZE EMAIL
 * =========================================================
 */

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/*
 * =========================================================
 * STUDENT PROFILE
 * =========================================================
 */

function getStudentProfile(
  email
) {
  if (!email) {
    return null;
  }

  const originalEmail =
    String(email).trim();

  const cleanEmail =
    originalEmail.toLowerCase();

  const keys = [
    `campuslink_student_profile_${originalEmail}`,
    `campuslink_student_profile_${cleanEmail}`,
  ];

  for (
    const key of [
      ...new Set(keys),
    ]
  ) {
    try {
      const saved =
        localStorage.getItem(key);

      if (!saved) {
        continue;
      }

      const profile =
        JSON.parse(saved);

      if (profile) {
        return profile;
      }
    } catch (error) {
      console.warn(
        "Could not load student profile:",
        error
      );
    }
  }

  return null;
}

/*
 * =========================================================
 * INTERVIEW SESSION
 * =========================================================
 */

function getInterviewSession(
  sessionId
) {
  if (!sessionId) {
    return null;
  }

  return readJson(
    `${INTERVIEW_SESSION_PREFIX}${sessionId}`,
    null
  );
}

/*
 * =========================================================
 * SESSION ID
 * =========================================================
 */

function getApplicationSessionId(
  application
) {
  if (!application) {
    return "";
  }

  return String(
    application?.interview
      ?.sessionId ||
      application?.interview
        ?.interviewSessionId ||
      application?.interviewSessionId ||
      application?.sessionId ||
      ""
  ).trim();
}

/*
 * =========================================================
 * ANSWER EVALUATOR
 * =========================================================
 *
 * This is also used for old interview sessions that were
 * created before the correctness fields were added.
 */

function evaluateStoredAnswer(
  question,
  answer
) {
  const studentAnswer =
    String(answer || "")
      .trim()
      .toLowerCase();

  if (!studentAnswer) {
    return {
      isCorrect: false,
      score: 0,
      status: "NOT_ANSWERED",
      matchedKeywords: [],
    };
  }

  const keywords =
    Array.isArray(
      question?.acceptedKeywords
    )
      ? question.acceptedKeywords
      : [];

  const matchedKeywords =
    keywords.filter(
      (keyword) =>
        studentAnswer.includes(
          String(
            keyword
          ).toLowerCase()
        )
    );

  const minimumRequired =
    keywords.length > 0
      ? Math.max(
          1,
          Math.ceil(
            keywords.length *
              0.5
          )
        )
      : 1;

  const isCorrect =
    matchedKeywords.length >=
    minimumRequired;

  const score =
    keywords.length > 0
      ? Math.round(
          (matchedKeywords.length /
            keywords.length) *
            100
        )
      : isCorrect
        ? 100
        : 0;

  return {
    isCorrect,

    score,

    status:
      isCorrect
        ? "CORRECT"
        : "WRONG",

    matchedKeywords,
  };
}

/*
 * =========================================================
 * LOAD COMPLETED APPLICATIONS
 * =========================================================
 */

function loadCompletedApplications() {
  const applications =
    readJson(
      APPLICATIONS_KEY,
      []
    );

  if (!Array.isArray(applications)) {
    return [];
  }

  return applications
    .filter(
      (application) =>
        String(
          application?.status ||
            ""
        )
          .trim()
          .toUpperCase() ===
        "INTERVIEW_COMPLETED"
    )
    .map(
      (application) => {
        const studentEmail =
          application?.studentEmail ||
          application?.student
            ?.email ||
          "";

        const profile =
          getStudentProfile(
            studentEmail
          );

        const sessionId =
          getApplicationSessionId(
            application
          );

        const session =
          getInterviewSession(
            sessionId
          );

        return {
          application,

          profile,

          session,

          sessionId,
        };
      }
    )
    .filter(
      (item) =>
        item.application ||
        item.session
    );
}

/*
 * =========================================================
 * BUILD CANDIDATE
 * =========================================================
 */

function buildCandidate(
  item
) {
  const application =
    item?.application ||
    {};

  const profile =
    item?.profile ||
    {};

  const session =
    item?.session ||
    {};

  const student =
    session?.student ||
    {};

  const studentEmail =
    application?.studentEmail ||
    student?.email ||
    profile?.email ||
    "";

  const studentName =
    application?.studentName ||
    student?.name ||
    profile?.name ||
    "Unknown Student";

  return {
    id:
      application?.studentId ||
      student?.id ||
      studentEmail ||
      `STUDENT-${Date.now()}`,

    name:
      studentName,

    email:
      studentEmail,

    college:
      application?.college ||
      profile?.collegeName ||
      "",

    degree:
      application?.degree ||
      profile?.degree ||
      "",

    branch:
      application?.branch ||
      profile?.branch ||
      "",

    cgpa:
      application?.cgpa ??
      profile?.cgpa ??
      "",

    experience:
      application?.experience ??
      profile?.experience ??
      "",

    matchScore:
      application?.matchScore ??
      application?.jobMatchScore ??
      application?.finalMatchScore ??
      0,

    jobTitle:
      application?.jobTitle ||
      session?.application
        ?.jobTitle ||
      session?.interview
        ?.role ||
      "",

    companyName:
      application?.companyName ||
      session?.application
        ?.companyName ||
      "",

    applicationId:
      application?.applicationId ||
      application?.id ||
      "",

    sessionId:
      item?.sessionId ||
      "",

    profilePhoto:
      profile?.profilePhoto ||
      "",
  };
}

/*
 * =========================================================
 * GET SESSION ANSWERS
 * =========================================================
 */

function getSessionAnswers(
  session
) {
  if (!session) {
    return [];
  }

  const questions =
    Array.isArray(
      session.questions
    )
      ? session.questions
      : [];

  return questions.map(
    (
      question,
      index
    ) => {
      const answer =
        question?.answer ??
        question?.response ??
        question?.studentAnswer ??
        "";

      const hasAnswer =
        Boolean(
          String(answer).trim()
        );

      const evaluation =
        question?.evaluation ||
        evaluateStoredAnswer(
          question,
          answer
        );

      return {
        questionId:
          question?.questionId ||
          question?.id ||
          `Q${String(
            index + 1
          ).padStart(3, "0")}`,

        question:
          question?.question ||
          question?.text ||
          "Interview question",

        skill:
          question?.skill ||
          question?.category ||
          "Technical",

        difficulty:
          question?.difficulty ||
          "Medium",

        answer,

        status:
          question?.status ||
          (hasAnswer
            ? "ANSWERED"
            : "SKIPPED"),

        evaluation,

        correctAnswer:
          question?.correctAnswer ||
          "",

        matchedKeywords:
          evaluation?.matchedKeywords ||
          [],
      };
    }
  );
}

/*
 * =========================================================
 * CALCULATE REAL METRICS
 * =========================================================
 */

function calculateMetrics(
  session,
  answers
) {
  const total =
    answers.length;

  const answered =
    answers.filter(
      (item) =>
        String(
          item?.status || ""
        ).toUpperCase() ===
          "ANSWERED" &&
        Boolean(
          String(
            item?.answer || ""
          ).trim()
        )
    ).length;

  const skipped =
    answers.filter(
      (item) =>
        String(
          item?.status || ""
        ).toUpperCase() ===
        "SKIPPED"
    ).length;

  /*
   * ACTUAL CORRECT ANSWERS
   */
  const correct =
    answers.filter(
      (item) =>
        item?.evaluation
          ?.isCorrect === true
    ).length;

  /*
   * ACTUAL WRONG ANSWERS
   */
  const wrong =
    answers.filter(
      (item) =>
        String(
          item?.status || ""
        ).toUpperCase() ===
          "ANSWERED" &&
        item?.evaluation
          ?.isCorrect !== true
    ).length;

  /*
   * Overall score:
   *
   * correct / total
   *
   * NOT answered / total
   */
  const calculatedOverall =
    total > 0
      ? Math.round(
          (correct / total) *
            100
        )
      : 0;

  const storedOverall =
    Number(
      session?.evaluation
        ?.overall ??
        session?.evaluation
          ?.overallScore
    );

  const overall =
    Number.isFinite(
      storedOverall
    )
      ? storedOverall
      : calculatedOverall;

  /*
   * Technical questions
   */
  const technicalQuestions =
    answers.filter(
      (item) =>
        [
          "python",
          "sql",
          "javascript",
          "java",
          "c++",
          "technical",
        ].includes(
          String(
            item?.skill || ""
          )
            .trim()
            .toLowerCase()
        )
    );

  const technicalCorrect =
    technicalQuestions.filter(
      (item) =>
        item?.evaluation
          ?.isCorrect === true
    ).length;

  const technical =
    technicalQuestions.length >
    0
      ? Math.round(
          (technicalCorrect /
            technicalQuestions.length) *
            100
        )
      : overall;

  /*
   * Problem solving
   */
  const problemSolvingQuestions =
    answers.filter(
      (item) => {
        const skill =
          String(
            item?.skill || ""
          )
            .trim()
            .toLowerCase();

        return (
          skill !==
            "project" &&
          skill !==
            "communication"
        );
      }
    );

  const problemSolvingCorrect =
    problemSolvingQuestions.filter(
      (item) =>
        item?.evaluation
          ?.isCorrect === true
    ).length;

  const problemSolving =
    problemSolvingQuestions.length >
    0
      ? Math.round(
          (problemSolvingCorrect /
            problemSolvingQuestions.length) *
            100
        )
      : overall;

  /*
   * Temporary communication score.
   *
   * This should eventually be generated by
   * the AI/ML evaluator.
   */
  const communication =
    answered > 0
      ? Math.round(
          (correct /
            answered) *
            100
        )
      : 0;

  /*
   * Temporary confidence score.
   *
   * Real confidence requires voice/video
   * analysis from the AI/ML service.
   */
  const confidence =
    total > 0
      ? Math.round(
          (answered /
            total) *
            100
        )
      : 0;

  /*
   * Monitoring
   */
  const monitoringEvents =
    Array.isArray(
      session?.monitoring
        ?.events
    )
      ? session.monitoring
          .events
      : [];

  const violationCount =
    Number(
      session?.monitoring
        ?.violationCount
    ) || 0;

  const monitoring =
    violationCount > 0
      ? Math.max(
          0,
          100 -
            violationCount *
              10
        )
      : 100;

  return {
    overall:
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            overall
          )
        )
      ),

    technical:
      Math.max(
        0,
        Math.min(
          100,
          technical
        )
      ),

    communication:
      Math.max(
        0,
        Math.min(
          100,
          communication
        )
      ),

    problemSolving:
      Math.max(
        0,
        Math.min(
          100,
          problemSolving
        )
      ),

    confidence:
      Math.max(
        0,
        Math.min(
          100,
          confidence
        )
      ),

    monitoring,

    answered,

    correct,

    wrong,

    skipped,

    total,

    monitoringEvents,

    violationCount,
  };
}

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

function Evaluation() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const [
    completedCandidates,
    setCompletedCandidates,
  ] = useState([]);

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /*
   * Load evaluations.
   */
  const loadEvaluations =
    () => {
      setLoading(true);

      const completed =
        loadCompletedApplications();

      setCompletedCandidates(
        completed
      );

      const stateCandidate =
        location.state
          ?.candidate;

      const stateApplicationId =
        location.state
          ?.applicationId ||
        stateCandidate
          ?.applicationId ||
        "";

      const stateStudentEmail =
        normalizeEmail(
          location.state
            ?.studentEmail ||
            stateCandidate
              ?.email ||
            ""
        );

      const stateSessionId =
        location.state
          ?.sessionId ||
        stateCandidate
          ?.sessionId ||
        "";

      const foundIndex =
        completed.findIndex(
          (item) => {
            const application =
              item.application ||
              {};

            const candidate =
              buildCandidate(
                item
              );

            const applicationId =
              application
                ?.applicationId ||
              application?.id ||
              "";

            if (
              stateApplicationId &&
              String(
                applicationId
              ) ===
                String(
                  stateApplicationId
                )
            ) {
              return true;
            }

            if (
              stateSessionId &&
              item.sessionId ===
                stateSessionId
            ) {
              return true;
            }

            if (
              stateStudentEmail &&
              normalizeEmail(
                candidate.email
              ) ===
                stateStudentEmail
            ) {
              return true;
            }

            return false;
          }
        );

      if (
        foundIndex >= 0
      ) {
        setSelectedIndex(
          foundIndex
        );
      } else {
        setSelectedIndex(0);
      }

      setLoading(false);
    };

  useEffect(() => {
    loadEvaluations();

    const handleUpdate =
      () => {
        loadEvaluations();
      };

    window.addEventListener(
      "campuslink_interview_session_updated",
      handleUpdate
    );

    window.addEventListener(
      "campuslink_application_updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "campuslink_interview_session_updated",
        handleUpdate
      );

      window.removeEventListener(
        "campuslink_application_updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, [
    location.state,
    user?.email,
  ]);

  /*
   * Current candidate.
   */
  const currentItem =
    completedCandidates[
      selectedIndex
    ] || null;

  const candidate =
    currentItem
      ? buildCandidate(
          currentItem
        )
      : null;

  const answers =
    useMemo(
      () =>
        getSessionAnswers(
          currentItem?.session
        ),
      [currentItem]
    );

  const metrics =
    useMemo(
      () =>
        calculateMetrics(
          currentItem?.session,
          answers
        ),
      [
        currentItem,
        answers,
      ]
    );

  /*
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (loading) {
    return (
      <div className="evaluation-page">
        <div className="evaluation-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                RECRUITER
              </span>

              <h2>
                Loading interview evaluations...
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =======================================================
   * NO INTERVIEWS
   * =======================================================
   */

  if (
    !candidate ||
    completedCandidates.length ===
      0
  ) {
    return (
      <div className="evaluation-page">
        <div className="evaluation-header">
          <div>
            <button
              className="evaluation-back-button"
              onClick={() =>
                navigate(
                  "/recruiter/applications"
                )
              }
            >
              <ArrowLeft
                size={18}
              />

              Applications
            </button>

            <h1>
              Interview Evaluation
            </h1>

            <p>
              Review completed student interviews
              and their AI-generated evaluation.
            </p>
          </div>
        </div>

        <section className="evaluation-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                NO COMPLETED INTERVIEWS
              </span>

              <h2>
                No candidate evaluation is available yet
              </h2>
            </div>
          </div>

          <p>
            Completed student interviews will appear
            here automatically after the student finishes
            the interview.
          </p>
        </section>
      </div>
    );
  }

  /*
   * =======================================================
   * MAIN
   * =======================================================
   */

  return (
    <div className="evaluation-page">
      {/* HEADER */}

      <div className="evaluation-header">
        <div>
          <button
            className="evaluation-back-button"
            onClick={() =>
              navigate(
                "/recruiter/applications"
              )
            }
          >
            <ArrowLeft
              size={18}
            />

            Applications
          </button>

          <h1>
            Interview Evaluation
          </h1>

          <p>
            Review the candidate's interview performance,
            answers and AI-generated evaluation.
          </p>
        </div>

        <div className="evaluation-completed-badge">
          <CheckCircle
            size={17}
          />

          Interview Completed
        </div>
      </div>

      {/* CANDIDATE SELECTOR */}

      {completedCandidates.length >
        1 && (
        <section className="evaluation-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                COMPLETED INTERVIEWS
              </span>

              <h2>
                Select Candidate
              </h2>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap:
                "wrap",
            }}
          >
            {completedCandidates.map(
              (
                item,
                index
              ) => {
                const itemCandidate =
                  buildCandidate(
                    item
                  );

                return (
                  <button
                    key={
                      itemCandidate.applicationId ||
                      itemCandidate.sessionId ||
                      itemCandidate.email ||
                      index
                    }
                    onClick={() =>
                      setSelectedIndex(
                        index
                      )
                    }
                    style={{
                      padding:
                        "10px 16px",

                      borderRadius:
                        "10px",

                      border:
                        index ===
                        selectedIndex
                          ? "2px solid #4f8cff"
                          : "1px solid rgba(255,255,255,0.15)",

                      background:
                        index ===
                        selectedIndex
                          ? "rgba(79,140,255,0.15)"
                          : "rgba(255,255,255,0.04)",

                      color:
                        "#ffffff",

                      cursor:
                        "pointer",
                    }}
                  >
                    {
                      itemCandidate.name
                    }
                  </button>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* CANDIDATE */}

      <section className="evaluation-candidate-card">
        <div className="evaluation-avatar">
          {candidate.profilePhoto ? (
            <img
              src={
                candidate.profilePhoto
              }
              alt={
                candidate.name
              }
              style={{
                width:
                  "100%",
                height:
                  "100%",
                objectFit:
                  "cover",
                borderRadius:
                  "50%",
                display:
                  "block",
              }}
              onError={(
                event
              ) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <UserRound
              size={30}
            />
          )}
        </div>

        <div className="evaluation-candidate-info">
          <h2>
            {candidate.name}
          </h2>

          <p>
            {candidate.email}
          </p>

          <div className="evaluation-candidate-meta">
            {candidate.degree && (
              <span>
                {candidate.degree}
              </span>
            )}

            {candidate.branch && (
              <span>
                {candidate.branch}
              </span>
            )}

            {candidate.cgpa !==
              "" && (
              <span>
                CGPA{" "}
                {
                  candidate.cgpa
                }
              </span>
            )}

            {candidate.experience !==
              "" && (
              <span>
                {
                  candidate.experience
                }{" "}
                experience
              </span>
            )}
          </div>
        </div>

        <div className="evaluation-match">
          <span>
            AI Job Match
          </span>

          <strong>
            {candidate.matchScore}%
          </strong>
        </div>
      </section>

      {/* OVERALL */}

      <section className="overall-evaluation">
        <div className="overall-score-section">
          <div className="score-circle">
            <div>
              <strong>
                {metrics.overall}%
              </strong>

              <span>
                Overall
              </span>
            </div>
          </div>

          <div className="overall-score-text">
            <span className="section-label">
              FINAL PERFORMANCE
            </span>

            <h2>
              Interview Performance
            </h2>

            <p>
              This evaluation is based on the
              selected student's completed interview
              session.
            </p>
          </div>
        </div>

        <div className="score-summary">
          <div>
            <span>
              Questions
            </span>

            <strong>
              {metrics.total}
            </strong>
          </div>

          <div>
            <span>
              Answered
            </span>

            <strong>
              {metrics.answered}
            </strong>
          </div>

          <div>
            <span>
              Correct
            </span>

            <strong>
              {metrics.correct}
            </strong>
          </div>

          <div>
            <span>
              Wrong
            </span>

            <strong>
              {metrics.wrong}
            </strong>
          </div>

          <div>
            <span>
              Skipped
            </span>

            <strong>
              {metrics.skipped}
            </strong>
          </div>
        </div>
      </section>

      {/* PERFORMANCE */}

      <section className="evaluation-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              AI ANALYSIS
            </span>

            <h2>
              Performance Breakdown
            </h2>
          </div>

          <Brain
            size={24}
          />
        </div>

        <div className="metric-grid">
          <MetricCard
            icon={
              <Code2
                size={21}
              />
            }
            title="Technical Skills"
            score={
              metrics.technical
            }
          />

          <MetricCard
            icon={
              <MessageSquare
                size={21}
              />
            }
            title="Communication"
            score={
              metrics.communication
            }
          />

          <MetricCard
            icon={
              <Target
                size={21}
              />
            }
            title="Problem Solving"
            score={
              metrics.problemSolving
            }
          />

          <MetricCard
            icon={
              <Award
                size={21}
              />
            }
            title="Confidence"
            score={
              metrics.confidence
            }
          />
        </div>
      </section>

      {/* QUESTIONS */}

      <section className="evaluation-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              INTERVIEW RECORD
            </span>

            <h2>
              Questions & Answers
            </h2>
          </div>
        </div>

        <div className="answers-list">
          {answers.length ===
          0 ? (
            <div className="answer-card">
              <div className="candidate-answer">
                <span>
                  Interview Answers
                </span>

                <p className="no-answer">
                  No interview questions or answers
                  were stored for this session.
                </p>
              </div>
            </div>
          ) : (
            answers.map(
              (
                item,
                index
              ) => {
                const answered =
                  item.status !==
                    "SKIPPED" &&
                  Boolean(
                    String(
                      item.answer ||
                        ""
                    ).trim()
                  );

                const correct =
                  item?.evaluation
                    ?.isCorrect ===
                  true;

                return (
                  <div
                    className="answer-card"
                    key={
                      item.questionId ||
                      index
                    }
                  >
                    <div className="answer-card-header">
                      <div className="question-number">
                        Q
                        {index +
                          1}
                      </div>

                      <div className="answer-question">
                        <span>
                          {
                            item.skill
                          }
                        </span>

                        <h3>
                          {
                            item.question
                          }
                        </h3>
                      </div>

                      <div
                        className={
                          !answered
                            ? "answer-status skipped"
                            : correct
                              ? "answer-status answered"
                              : "answer-status wrong"
                        }
                      >
                        {!answered ? (
                          <>
                            <XCircle
                              size={15}
                            />

                            Skipped
                          </>
                        ) : correct ? (
                          <>
                            <CheckCircle
                              size={15}
                            />

                            Correct
                          </>
                        ) : (
                          <>
                            <XCircle
                              size={15}
                            />

                            Wrong
                          </>
                        )}
                      </div>
                    </div>

                    <div className="candidate-answer">
                      <span>
                        Candidate Answer
                      </span>

                      {answered ? (
                        <p>
                          {
                            item.answer
                          }
                        </p>
                      ) : (
                        <p className="no-answer">
                          No answer was recorded
                          for this question.
                        </p>
                      )}
                    </div>

                    {answered &&
                      !correct &&
                      item.correctAnswer && (
                        <div
                          className="candidate-answer"
                          style={{
                            marginTop:
                              "14px",
                          }}
                        >
                          <span>
                            Expected Answer
                          </span>

                          <p>
                            {
                              item.correctAnswer
                            }
                          </p>
                        </div>
                      )}

                    {answered && (
                      <div
                        className="candidate-answer"
                        style={{
                          marginTop:
                            "14px",
                        }}
                      >
                        <span>
                          Answer Score
                        </span>

                        <p>
                          {
                            item
                              ?.evaluation
                              ?.score ??
                            0
                          }
                          %
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
            )
          )}
        </div>
      </section>

      {/* MONITORING */}

      <section className="evaluation-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              AI MONITORING
            </span>

            <h2>
              Interview Monitoring
            </h2>
          </div>

          <ShieldCheck
            size={24}
          />
        </div>

        <div className="monitoring-evaluation-grid">
          <div className="monitoring-score-card">
            <div className="monitoring-score-icon">
              <ShieldCheck
                size={25}
              />
            </div>

            <div>
              <span>
                Monitoring Score
              </span>

              <strong>
                {metrics.monitoring}%
              </strong>
            </div>
          </div>

          <div className="monitoring-check">
            <CheckCircle
              size={19}
            />

            <div>
              <strong>
                Camera Monitoring
              </strong>

              <span>
                {currentItem?.session
                  ?.media
                  ?.cameraConnected
                  ? "Camera session was active."
                  : "Camera status was not recorded."}
              </span>
            </div>
          </div>

          <div className="monitoring-check">
            <CheckCircle
              size={19}
            />

            <div>
              <strong>
                Face Monitoring
              </strong>

              <span>
                {metrics
                  .monitoringEvents
                  .length >
                0
                  ? `${metrics.monitoringEvents.length} AI monitoring event(s) recorded.`
                  : "No AI monitoring events recorded."}
              </span>
            </div>
          </div>

          <div className="monitoring-check">
            <CheckCircle
              size={19}
            />

            <div>
              <strong>
                Session Events
              </strong>

              <span>
                {metrics.violationCount >
                0
                  ? `${metrics.violationCount} monitoring violation(s) recorded.`
                  : "No critical monitoring violation recorded."}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEEDBACK */}

      <section className="evaluation-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              AI-GENERATED FEEDBACK
            </span>

            <h2>
              Final Feedback
            </h2>
          </div>
        </div>

        <div className="feedback-grid">
          <div className="feedback-card strengths">
            <div className="feedback-card-title">
              <CheckCircle
                size={19}
              />

              <h3>
                Strengths
              </h3>
            </div>

            <ul>
              {currentItem?.session
                ?.evaluation
                ?.strengths
                ?.length >
              0 ? (
                currentItem.session.evaluation.strengths.map(
                  (
                    strength,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                    >
                      {
                        strength
                      }
                    </li>
                  )
                )
              ) : (
                <li>
                  {metrics.correct >
                  0
                    ? `${metrics.correct} of ${metrics.total} interview questions were answered correctly.`
                    : "No interview questions were evaluated as correct."}
                </li>
              )}
            </ul>
          </div>

          <div className="feedback-card improvements">
            <div className="feedback-card-title">
              <Target
                size={19}
              />

              <h3>
                Areas to Improve
              </h3>
            </div>

            <ul>
              {currentItem?.session
                ?.evaluation
                ?.improvementAreas
                ?.length >
              0 ? (
                currentItem.session.evaluation.improvementAreas.map(
                  (
                    item,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                    >
                      {item}
                    </li>
                  )
                )
              ) : (
                <li>
                  {metrics.wrong >
                  0
                    ? `${metrics.wrong} interview question(s) were answered incorrectly.`
                    : "No incorrect answers were recorded."}
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* ACTIONS */}

      <section className="evaluation-actions">
        <button
          className="evaluation-secondary-button"
          onClick={() =>
            navigate(
              "/recruiter/applications"
            )
          }
        >
          <ArrowLeft
            size={18}
          />

          Back to Applications
        </button>

        <button
          className="evaluation-primary-button"
          onClick={() =>
            navigate(
              "/recruiter/applications"
            )
          }
        >
          <Award
            size={18}
          />

          Back to Final Decision
        </button>
      </section>
    </div>
  );
}

/*
 * =========================================================
 * METRIC CARD
 * =========================================================
 */

function MetricCard({
  icon,
  title,
  score,
}) {
  const scoreClass =
    score >= 80
      ? "evaluation-score-high"
      : score >= 60
        ? "evaluation-score-medium"
        : "evaluation-score-low";

  return (
    <div className="metric-card">
      <div className="metric-icon">
        {icon}
      </div>

      <div className="metric-content">
        <div className="metric-top">
          <span>
            {title}
          </span>

          <strong
            className={
              scoreClass
            }
          >
            {score}%
          </strong>
        </div>

        <div className="metric-bar">
          <div
            className="metric-bar-fill"
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  100,
                  score
                )
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Evaluation;