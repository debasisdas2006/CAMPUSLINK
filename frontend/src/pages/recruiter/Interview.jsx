import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle,
  Clock3,
  Eye,
  FileText,
  Mic,
  MicOff,
  Play,
  Send,
  ShieldCheck,
  SkipForward,
  UserRound,
} from "lucide-react";

import InterviewTimer from "../../components/interview/InterviewTimer";
import MonitoringStatus from "../../components/interview/MonitoringStatus";

import "./Interview.css";


/* =========================================================
   STORAGE
========================================================= */

const ACTIVE_SESSION_KEY =
  "campuslink_active_interview_session";

const INTERVIEW_STORAGE_PREFIX =
  "campuslink_interview_session_";


/* =========================================================
   HELPERS
========================================================= */

function getCandidateId(candidate) {
  return (
    candidate?.id ||
    candidate?.candidateId ||
    candidate?.email ||
    "UNKNOWN-CANDIDATE"
  );
}


function getCandidateName(candidate) {
  return (
    candidate?.name ||
    candidate?.fullName ||
    "Selected Candidate"
  );
}


function getCandidateEmail(candidate) {
  return candidate?.email || "";
}


function readActiveSession() {
  try {
    const raw =
      localStorage.getItem(
        ACTIVE_SESSION_KEY
      );

    if (!raw) return null;

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "Could not read active interview session:",
      error
    );

    return null;
  }
}


function readInterviewSession(sessionId) {
  if (!sessionId) return null;

  try {
    const raw =
      localStorage.getItem(
        `${INTERVIEW_STORAGE_PREFIX}${sessionId}`
      );

    if (!raw) return null;

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "Could not read interview session:",
      error
    );

    return null;
  }
}


function getLatestSession() {
  const activeSession =
    readActiveSession();

  if (!activeSession) {
    return null;
  }

  if (
    typeof activeSession === "string"
  ) {
    return readInterviewSession(
      activeSession
    );
  }

  if (
    activeSession.sessionId
  ) {
    return (
      readInterviewSession(
        activeSession.sessionId
      ) || activeSession
    );
  }

  return activeSession;
}


function getAnswerForQuestion(
  session,
  question
) {
  if (!session || !question) {
    return null;
  }

  const answers =
    Array.isArray(session.answers)
      ? session.answers
      : [];

  return (
    answers.find(
      (item) =>
        item.questionId ===
        (question.id ||
          question.questionId)
    ) || null
  );
}


function getMonitoringEvents(session) {
  if (!session) return [];

  if (
    Array.isArray(
      session.monitoring?.events
    )
  ) {
    return session.monitoring.events;
  }

  if (
    Array.isArray(session.monitoringEvents)
  ) {
    return session.monitoringEvents;
  }

  return [];
}


/* =========================================================
   COMPONENT
========================================================= */

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  const candidateFromState =
    location.state?.candidate || null;


  /* =======================================================
     CANDIDATE
  ======================================================= */

  const [candidate] = useState(
    candidateFromState
  );


  /* =======================================================
     SESSION
  ======================================================= */

  const [interviewSession, setInterviewSession] =
    useState(() =>
      getLatestSession()
    );


  const [interviewStarted, setInterviewStarted] =
    useState(
      interviewSession?.status ===
        "ACTIVE"
    );


  const [interviewCompleted, setInterviewCompleted] =
    useState(
      interviewSession?.status ===
        "COMPLETED"
    );


  /* =======================================================
     MONITORING
  ======================================================= */

  const [monitoringEvents, setMonitoringEvents] =
    useState(() =>
      getMonitoringEvents(
        interviewSession
      )
    );


  /* =======================================================
     STATUS
  ======================================================= */

  const [statusMessage, setStatusMessage] =
    useState(
      interviewSession
        ? "Student interview session loaded."
        : "Waiting for student interview session."
    );


  /* =======================================================
     SESSION POLLING
     
     Student AIInterview updates localStorage.
     We periodically read the session so recruiter
     can see updated answers/status in the same browser.
  ======================================================= */

  useEffect(() => {
    const refreshSession = () => {
      const latest =
        getLatestSession();

      if (!latest) {
        return;
      }

      setInterviewSession(
        latest
      );

      setInterviewStarted(
        latest.status === "ACTIVE"
      );

      setInterviewCompleted(
        latest.status === "COMPLETED"
      );

      setMonitoringEvents(
        getMonitoringEvents(
          latest
        )
      );

      if (
        latest.status ===
        "ACTIVE"
      ) {
        setStatusMessage(
          "Student interview is currently active."
        );
      } else if (
        latest.status ===
        "COMPLETED"
      ) {
        setStatusMessage(
          "Student interview has been completed."
        );
      } else {
        setStatusMessage(
          "Student interview session loaded."
        );
      }
    };


    refreshSession();


    const interval =
      window.setInterval(
        refreshSession,
        1000
      );


    const handleStorage = (
      event
    ) => {
      if (
        event.key ===
          ACTIVE_SESSION_KEY ||
        (
          event.key &&
          event.key.startsWith(
            INTERVIEW_STORAGE_PREFIX
          )
        )
      ) {
        refreshSession();
      }
    };


    window.addEventListener(
      "storage",
      handleStorage
    );


    window.addEventListener(
      "campuslink_interview_session_updated",
      refreshSession
    );


    return () => {
      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_interview_session_updated",
        refreshSession
      );
    };
  }, []);


  /* =======================================================
     CURRENT QUESTIONS
  ======================================================= */

  const questions = useMemo(() => {
    if (
      Array.isArray(
        interviewSession?.questions
      ) &&
      interviewSession.questions.length
    ) {
      return interviewSession.questions;
    }

    return [];
  }, [interviewSession]);


  const currentQuestionIndex =
    Number.isInteger(
      interviewSession?.currentQuestionIndex
    )
      ? interviewSession.currentQuestionIndex
      : 0;


  const currentQuestion =
    questions[
      Math.min(
        currentQuestionIndex,
        Math.max(
          questions.length - 1,
          0
        )
      )
    ] || null;


  /* =======================================================
     CURRENT ANSWER
  ======================================================= */

  const currentAnswer =
    getAnswerForQuestion(
      interviewSession,
      currentQuestion
    );


  /* =======================================================
     CANDIDATE DATA
  ======================================================= */

  const sessionCandidate =
    interviewSession?.candidate ||
    null;


  const displayedCandidate =
    candidate ||
    sessionCandidate ||
    {
      id:
        interviewSession?.candidateId ||
        "",
      name:
        interviewSession?.candidateName ||
        "Student",
      email:
        interviewSession?.candidateEmail ||
        "",
    };


  /* =======================================================
     MEDIA STATUS
     
     IMPORTANT:
     These are STUDENT media states.
     Recruiter does not access getUserMedia().
  ======================================================= */

  const studentCameraEnabled =
    Boolean(
      interviewSession?.media
        ?.cameraConnected
    );


  const studentMicrophoneEnabled =
    Boolean(
      interviewSession?.media
        ?.microphoneConnected
    );


  /* =======================================================
     MONITORING STATUS
  ======================================================= */

  const aiMonitoringStatus =
    interviewSession?.monitoring
      ?.status ||
    "WAITING";


  const violationCount =
    Number(
      interviewSession?.monitoring
        ?.violationCount || 0
    );


  const lastMonitoringEvent =
    interviewSession?.monitoring
      ?.lastEvent ||
    null;


  /* =======================================================
     ANSWERS
  ======================================================= */

  const answers =
    Array.isArray(
      interviewSession?.answers
    )
      ? interviewSession.answers
      : [];


  const answeredCount =
    answers.filter(
      (item) =>
        item.status ===
        "ANSWERED"
    ).length;


  const skippedCount =
    answers.filter(
      (item) =>
        item.status ===
        "SKIPPED"
    ).length;


  /* =======================================================
     START / MONITOR
     
     Recruiter does not start camera.
     Recruiter only changes local monitoring state.
  ======================================================= */

  const handleStartMonitoring = () => {
    const latest =
      getLatestSession();

    if (!latest) {
      setStatusMessage(
        "Waiting for the student to join the interview."
      );

      return;
    }


    setInterviewSession(
      latest
    );


    if (
      latest.status ===
      "ACTIVE"
    ) {
      setInterviewStarted(
        true
      );

      setStatusMessage(
        "Student interview is active. Monitoring started."
      );

      return;
    }


    if (
      latest.status ===
      "COMPLETED"
    ) {
      setInterviewCompleted(
        true
      );

      setStatusMessage(
        "This interview has already been completed."
      );

      return;
    }


    setStatusMessage(
      "Student has not started the interview yet."
    );
  };


  /* =======================================================
     END / RETURN
  ======================================================= */

  const handleBack = () => {
    navigate(
      "/recruiter/candidates"
    );
  };


  /* =======================================================
     EVALUATION
  ======================================================= */

  const handleEvaluation = () => {
    navigate(
      "/recruiter/evaluation",
      {
        state: {
          candidate:
            displayedCandidate,
          answers,
          questions,
          interviewSession,
        },
      }
    );
  };


  /* =======================================================
     NO CANDIDATE / SESSION
  ======================================================= */

  if (
    !candidate &&
    !interviewSession
  ) {
    return (
      <div className="recruiter-interview-page">

        <div className="interview-empty-state">

          <div className="empty-icon">
            <UserRound size={34} />
          </div>

          <h2>
            Waiting for Student Interview
          </h2>

          <p>
            No active student interview
            session is available yet.
            Select a candidate and wait
            for the student to join.
          </p>

          <button
            className="interview-primary-button"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back to Candidates
          </button>

        </div>

      </div>
    );
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="recruiter-interview-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="interview-page-header">

        <div>

          <button
            className="interview-back-button"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Candidates
          </button>


          <div className="interview-title-row">

            <div>

              <h1>
                Interview Monitoring
              </h1>

              <p>
                Monitor the student's live
                AI-assisted interview session.
              </p>

            </div>


            <div className="live-badge">

              <span className="live-dot" />

              {interviewStarted
                ? "LIVE MONITORING"
                : interviewCompleted
                ? "INTERVIEW COMPLETED"
                : "WAITING FOR STUDENT"}

            </div>

          </div>

        </div>

      </div>


      {/* =========================================
          COMPLETED
      ========================================= */}

      {interviewCompleted ? (

        <div className="interview-completed-card">

          <div className="completed-icon">
            <CheckCircle size={42} />
          </div>


          <h2>
            Interview Completed
          </h2>


          <p>
            The interview session for{" "}
            <strong>
              {getCandidateName(
                displayedCandidate
              )}
            </strong>{" "}
            has been completed.
          </p>


          <div className="completed-summary">

            <div>

              <span>
                Candidate
              </span>

              <strong>
                {getCandidateName(
                  displayedCandidate
                )}
              </strong>

            </div>


            <div>

              <span>
                Questions
              </span>

              <strong>
                {questions.length}
              </strong>

            </div>


            <div>

              <span>
                Answers Recorded
              </span>

              <strong>
                {answeredCount}
              </strong>

            </div>


            <div>

              <span>
                AI Events
              </span>

              <strong>
                {monitoringEvents.length}
              </strong>

            </div>

          </div>


          <div className="completed-actions">

            <button
              className="interview-secondary-button"
              onClick={handleBack}
            >
              <ArrowLeft size={18} />
              Back to Candidates
            </button>


            <button
              className="interview-primary-button"
              onClick={handleEvaluation}
            >
              View Evaluation
              <Send size={18} />
            </button>

          </div>

        </div>

      ) : (

        <div className="interview-workspace">

          {/* =======================================
              LEFT SIDE
          ======================================= */}

          <div className="interview-main-column">


            {/* =====================================
                CANDIDATE
            ===================================== */}

            <div className="candidate-interview-card">

              <div className="candidate-avatar">
                <UserRound size={30} />
              </div>


              <div className="candidate-interview-info">

                <h2>
                  {getCandidateName(
                    displayedCandidate
                  )}
                </h2>


                <p>
                  {getCandidateEmail(
                    displayedCandidate
                  )}
                </p>


                <div className="candidate-meta">

                  {displayedCandidate.degree && (
                    <span>
                      {
                        displayedCandidate.degree
                      }
                    </span>
                  )}


                  {displayedCandidate.branch && (
                    <span>
                      {
                        displayedCandidate.branch
                      }
                    </span>
                  )}


                  {displayedCandidate.cgpa && (
                    <span>
                      CGPA{" "}
                      {
                        displayedCandidate.cgpa
                      }
                    </span>
                  )}


                  {displayedCandidate.experience && (
                    <span>
                      {
                        displayedCandidate.experience
                      }
                    </span>
                  )}

                </div>

              </div>


              <div className="candidate-match">

                <strong>
                  {displayedCandidate.matchScore ??
                    0}
                  %
                </strong>

                <span>
                  AI Match
                </span>

              </div>

            </div>


            {/* =====================================
                STUDENT CAMERA
            ===================================== */}

            <div className="camera-card">

              <div className="camera-card-header">

                <div>

                  <h3>
                    Student Live Camera
                  </h3>

                  <span>
                    Student camera status and
                    monitoring preview
                  </span>

                </div>


                <div
                  className={
                    studentCameraEnabled
                      ? "camera-status active"
                      : "camera-status"
                  }
                >

                  <span />

                  {studentCameraEnabled
                    ? "Student Camera On"
                    : "Student Camera Off"}

                </div>

              </div>


              <div className="camera-preview">

                {studentCameraEnabled ? (

                  <div className="camera-placeholder">

                    <Eye size={48} />

                    <h3>
                      Student Camera Connected
                    </h3>

                    <p>
                      The student's camera is
                      active. The actual remote
                      video stream requires the
                      backend/WebRTC connection.
                    </p>

                  </div>

                ) : (

                  <div className="camera-placeholder">

                    <CameraOff size={48} />

                    <h3>
                      Student Camera Not Connected
                    </h3>

                    <p>
                      Waiting for the student
                      to enable the camera.
                    </p>

                  </div>

                )}

              </div>


              <div className="camera-controls">

                <div className="media-indicator">

                  {studentCameraEnabled ? (
                    <Camera size={18} />
                  ) : (
                    <CameraOff size={18} />
                  )}

                  <span>
                    {studentCameraEnabled
                      ? "Student Camera Ready"
                      : "Student Camera Off"}
                  </span>

                </div>


                <div className="media-indicator">

                  {studentMicrophoneEnabled ? (
                    <Mic size={18} />
                  ) : (
                    <MicOff size={18} />
                  )}

                  <span>
                    {studentMicrophoneEnabled
                      ? "Student Microphone Ready"
                      : "Student Microphone Off"}
                  </span>

                </div>

              </div>

            </div>


            {/* =====================================
                QUESTION + STUDENT ANSWER
            ===================================== */}

            <div className="question-card">

              {currentQuestion ? (

                <>

                  <div className="question-header">

                    <div>

                      <span className="question-label">

                        Question{" "}
                        {currentQuestionIndex + 1}
                        {" "}of{" "}
                        {questions.length}

                      </span>


                      <h2>
                        {
                          currentQuestion.question
                        }
                      </h2>

                    </div>


                    <div className="question-tags">

                      {currentQuestion.skill && (
                        <span>
                          {
                            currentQuestion.skill
                          }
                        </span>
                      )}


                      {currentQuestion.difficulty && (
                        <span>
                          {
                            currentQuestion.difficulty
                          }
                        </span>
                      )}

                    </div>

                  </div>


                  <div
                    style={{
                      marginTop: "20px",
                      padding: "18px",
                      borderRadius: "12px",
                      background:
                        "rgba(255,255,255,0.04)",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px",
                        fontWeight: 600,
                      }}
                    >
                      <FileText size={18} />

                      Student Answer
                    </div>


                    {currentAnswer ? (

                      <p
                        style={{
                          margin: 0,
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {currentAnswer.answer ||
                          "Student did not provide an answer."}
                      </p>

                    ) : (

                      <p
                        style={{
                          margin: 0,
                          opacity: 0.65,
                        }}
                      >
                        Waiting for the student's
                        answer...
                      </p>

                    )}

                  </div>


                  <div className="question-actions">

                    <button
                      className="skip-button"
                      disabled
                    >
                      <SkipForward size={18} />
                      Student Controls Question
                    </button>


                    <button
                      className="next-button"
                      disabled
                    >
                      {currentAnswer
                        ? "Answer Received"
                        : "Waiting for Answer"}

                      <Send size={18} />
                    </button>

                  </div>

                </>

              ) : (

                <div
                  style={{
                    padding: "30px 10px",
                    textAlign: "center",
                  }}
                >

                  <FileText
                    size={42}
                  />

                  <h3>
                    Waiting for Interview Questions
                  </h3>

                  <p>
                    Questions will appear here
                    when the student interview
                    session is active.
                  </p>

                </div>

              )}

            </div>


            {/* =====================================
                AI MONITORING EVENTS
            ===================================== */}

            <div className="question-card">

              <div className="question-header">

                <div>

                  <span className="question-label">
                    AI MONITORING
                  </span>

                  <h2>
                    Student Monitoring Events
                  </h2>

                </div>


                <div className="question-tags">

                  <span>
                    {violationCount} Events
                  </span>

                </div>

              </div>


              {monitoringEvents.length === 0 ? (

                <div
                  style={{
                    padding: "20px 0",
                    opacity: 0.7,
                  }}
                >
                  <Activity size={20} />

                  <p>
                    No AI monitoring events
                    recorded yet.
                  </p>
                </div>

              ) : (

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >

                  {monitoringEvents
                    .slice()
                    .reverse()
                    .slice(0, 8)
                    .map(
                      (event, index) => (
                        <div
                          key={
                            event.id ||
                            event.timestamp ||
                            index
                          }
                          style={{
                            display: "flex",
                            alignItems:
                              "flex-start",
                            gap: "12px",
                            padding: "12px",
                            borderRadius:
                              "10px",
                            background:
                              "rgba(255,255,255,0.04)",
                          }}
                        >

                          <ShieldCheck
                            size={18}
                          />

                          <div>

                            <strong>
                              {event.type ||
                                event.event ||
                                "Monitoring Event"}
                            </strong>

                            <p
                              style={{
                                margin:
                                  "4px 0 0",
                                opacity: 0.7,
                              }}
                            >
                              {event.message ||
                                event.description ||
                                "AI monitoring event detected."}
                            </p>

                          </div>

                        </div>
                      )
                    )}

                </div>

              )}

            </div>

          </div>


          {/* =======================================
              RIGHT SIDE
          ======================================= */}

          <aside className="interview-side-column">


            {/* =====================================
                TIMER
            ===================================== */}

            <div className="side-card">

              <div className="side-card-title">

                <Clock3 size={18} />

                Interview Timer

              </div>


              <div className="timer-box">

                {interviewStarted ? (

                  <InterviewTimer
                    running={true}
                  />

                ) : (

                  <div className="timer-placeholder">
                    00:00
                  </div>

                )}

              </div>

            </div>


            {/* =====================================
                STUDENT MEDIA STATUS
            ===================================== */}

            <div className="side-card">

              <div className="side-card-title">

                <ShieldCheck size={18} />

                Student Monitoring

              </div>


              <MonitoringStatus
                cameraEnabled={
                  studentCameraEnabled
                }
                microphoneEnabled={
                  studentMicrophoneEnabled
                }
                interviewStarted={
                  interviewStarted
                }
              />

            </div>


            {/* =====================================
                AI STATUS
            ===================================== */}

            <div className="side-card">

              <div className="side-card-title">

                <Activity size={18} />

                AI Monitoring Status

              </div>


              <div className="session-status">

                <span
                  className={
                    aiMonitoringStatus ===
                    "ACTIVE"
                      ? "status-dot active"
                      : "status-dot"
                  }
                />

                <span>
                  {aiMonitoringStatus}
                </span>

              </div>


              <div
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  opacity: 0.75,
                }}
              >
                Monitoring events:{" "}
                <strong>
                  {monitoringEvents.length}
                </strong>
              </div>


              <div
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  opacity: 0.75,
                }}
              >
                Alerts:{" "}
                <strong>
                  {violationCount}
                </strong>
              </div>

            </div>


            {/* =====================================
                LAST EVENT
            ===================================== */}

            <div className="side-card">

              <div className="side-card-title">

                <AlertCircle size={18} />

                Latest AI Event

              </div>


              <div className="session-status">

                <span className="status-dot" />

                <span>

                  {lastMonitoringEvent?.message ||
                    lastMonitoringEvent?.type ||
                    "No monitoring event yet."}

                </span>

              </div>

            </div>


            {/* =====================================
                SESSION STATUS
            ===================================== */}

            <div className="side-card">

              <div className="side-card-title">

                <Eye size={18} />

                Session Status

              </div>


              <div className="session-status">

                <span
                  className={
                    interviewStarted
                      ? "status-dot active"
                      : "status-dot"
                  }
                />

                <span>
                  {statusMessage}
                </span>

              </div>

            </div>


            {/* =====================================
                MONITOR BUTTON
            ===================================== */}

            {!interviewStarted &&
              !interviewCompleted && (

                <button
                  className="start-interview-button"
                  onClick={
                    handleStartMonitoring
                  }
                >

                  <Play size={20} />

                  Start Monitoring

                </button>

              )}


            {/* =====================================
                EVALUATION
            ===================================== */}

            {interviewCompleted && (

              <button
                className="start-interview-button"
                onClick={handleEvaluation}
              >

                <Send size={20} />

                View Evaluation

              </button>

            )}

          </aside>

        </div>

      )}

    </div>
  );
}


export default Interview;