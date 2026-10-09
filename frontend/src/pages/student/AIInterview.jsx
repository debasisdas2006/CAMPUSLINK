import { useEffect, useRef, useState } from "react";
import {
  Video,
  Mic,
  MicOff,
  Play,
  CheckCircle2,
  SkipForward,
  Send,
  RotateCcw,
  AlertCircle,
  Camera,
  CameraOff,
  ShieldCheck,
  Activity,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import MonitoringStatus from "../../components/interview/MonitoringStatus";
import InterviewTimer from "../../components/interview/InterviewTimer";
import "./AIInterview.css";

const ACTIVE_SESSION_KEY =
  "campuslink_active_interview_session";

const SESSION_PREFIX =
  "campuslink_interview_session_";

const APPLICATIONS_KEY =
  "campuslink_applications";

const NOTIFICATIONS_KEY =
  "campuslink_notifications";

const CURRENT_APPLICATION_KEY =
  "campuslink_current_interview_application";

/*
 * ============================================================
 * DEMO INTERVIEW QUESTIONS
 * ============================================================
 *
 * Existing questions are preserved.
 *
 * Only additional evaluation information has been added:
 * - correctAnswer
 * - acceptedKeywords
 *
 * This is currently a local/demo evaluator.
 * Later the AI/ML backend can replace this evaluation logic.
 */
const DEMO_QUESTIONS = [
  {
    questionId: "Q001",
    skill: "Python",
    difficulty: "Easy",
    question:
      "What is the difference between a Python list and a tuple?",

    correctAnswer:
      "A list is mutable while a tuple is immutable. Lists use square brackets and tuples use parentheses.",

    acceptedKeywords: [
      "list",
      "tuple",
      "mutable",
      "immutable",
    ],
  },

  {
    questionId: "Q002",
    skill: "Python",
    difficulty: "Medium",
    question:
      "Explain exception handling in Python.",

    correctAnswer:
      "Python exception handling uses try, except, else and finally blocks to handle runtime errors.",

    acceptedKeywords: [
      "try",
      "except",
      "exception",
      "finally",
    ],
  },

  {
    questionId: "Q003",
    skill: "Python",
    difficulty: "Medium",
    question:
      "How can you remove duplicate values from a Python list?",

    correctAnswer:
      "You can use a set to remove duplicates, or use another approach such as a loop while preserving order.",

    acceptedKeywords: [
      "set",
      "duplicate",
      "remove",
      "list",
    ],
  },

  {
    questionId: "Q004",
    skill: "SQL",
    difficulty: "Medium",
    question:
      "What is the difference between INNER JOIN and LEFT JOIN?",

    correctAnswer:
      "INNER JOIN returns matching rows from both tables, while LEFT JOIN returns all rows from the left table and matching rows from the right table.",

    acceptedKeywords: [
      "inner join",
      "left join",
      "matching",
      "left table",
    ],
  },

  {
    questionId: "Q005",
    skill: "Project",
    difficulty: "Medium",
    question:
      "Explain one technical project you have worked on and describe your contribution.",

    correctAnswer:
      "The answer should clearly describe a technical project, the technology used, and the student's individual contribution.",

    acceptedKeywords: [
      "project",
      "developed",
      "implemented",
      "technology",
      "contribution",
    ],
  },
];

/*
 * ============================================================
 * SAFE JSON PARSER
 * ============================================================
 */
function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/*
 * ============================================================
 * ANSWER EVALUATION
 * ============================================================
 *
 * This prevents completely invalid answers such as:
 *
 * rfwetrwewt
 * rwerwer
 * abcxyz
 *
 * from receiving 100%.
 *
 * IMPORTANT:
 * This is a temporary local/demo evaluator.
 *
 * The real AI/ML backend can later replace this function
 * with semantic answer evaluation.
 */
function evaluateInterviewAnswer(question, answer) {
  const normalizedAnswer = String(answer || "")
    .trim()
    .toLowerCase();

  if (!normalizedAnswer) {
    return {
      isCorrect: false,
      score: 0,
      status: "NOT_ANSWERED",
      matchedKeywords: [],
    };
  }

  const keywords = Array.isArray(
    question?.acceptedKeywords
  )
    ? question.acceptedKeywords
    : [];

  if (keywords.length === 0) {
    return {
      isCorrect: false,
      score: 0,
      status: "WRONG",
      matchedKeywords: [],
    };
  }

  const matchedKeywords = keywords.filter(
    (keyword) =>
      normalizedAnswer.includes(
        String(keyword).toLowerCase()
      )
  );

  /*
   * At least 50% of the important keywords
   * must be present for this demo evaluator
   * to mark the answer as correct.
   */
  const minimumRequired = Math.max(
    1,
    Math.ceil(keywords.length * 0.5)
  );

  const isCorrect =
    matchedKeywords.length >= minimumRequired;

  const score = Math.round(
    (matchedKeywords.length / keywords.length) *
      100
  );

  return {
    isCorrect,
    score,
    status: isCorrect ? "CORRECT" : "WRONG",
    matchedKeywords,
  };
}

/*
 * ============================================================
 * Find the application that started the interview.
 * ============================================================
 */
function getCurrentInterviewApplication() {
  try {
    const savedApplication = safeParse(
      localStorage.getItem(
        CURRENT_APPLICATION_KEY
      ),
      null
    );

    if (!savedApplication) {
      return null;
    }

    let application = {
      ...savedApplication,
    };

    /*
     * If recruiterEmail already exists, keep it.
     */
    if (
      application.recruiterEmail &&
      String(application.recruiterEmail).trim()
    ) {
      return application;
    }

    /*
     * Find recruiter/job information from the job storage.
     *
     * CreateJob stores jobs as:
     *
     * campuslink_jobs_<recruiterEmail>
     */
    const jobId =
      application.jobId ||
      application.job?.id ||
      application.job?.jobId ||
      "";

    if (!jobId) {
      console.warn(
        "Interview application has no jobId:",
        application
      );

      return application;
    }

    const storageKeys = Object.keys(localStorage);

    const jobStorageKeys = storageKeys.filter(
      (key) =>
        key.startsWith("campuslink_jobs_")
    );

    for (const key of jobStorageKeys) {
      const jobs = safeParse(
        localStorage.getItem(key),
        []
      );

      if (!Array.isArray(jobs)) {
        continue;
      }

      const matchedJob = jobs.find(
        (job) =>
          String(job?.id || "").trim() ===
          String(jobId).trim()
      );

      if (!matchedJob) {
        continue;
      }

      const recruiterEmail =
        matchedJob.recruiterEmail ||
        key.replace(
          "campuslink_jobs_",
          ""
        );

      application = {
        ...application,

        applicationId:
          application.applicationId ||
          application.id ||
          "",

        jobId:
          application.jobId ||
          matchedJob.id ||
          "",

        jobTitle:
          application.jobTitle ||
          matchedJob.title ||
          "",

        companyName:
          application.companyName ||
          matchedJob.companyName ||
          "",

        recruiterEmail:
          application.recruiterEmail ||
          recruiterEmail ||
          "",
      };

      console.log(
        "MATCHED JOB FOR INTERVIEW:",
        matchedJob
      );

      console.log(
        "RECRUITER EMAIL FOUND:",
        application.recruiterEmail
      );

      return application;
    }

    console.warn(
      "Could not find recruiter job for jobId:",
      jobId
    );

    return application;
  } catch (error) {
    console.error(
      "Could not load current interview application:",
      error
    );

    return null;
  }
}

/*
 * ============================================================
 * Create the initial interview session.
 * ============================================================
 */
function createInitialSession(user, application) {
  const sessionId =
    `INTSESSION-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

  const role =
    application?.jobTitle ||
    application?.job?.title ||
    "AI Technical Interview";

  return {
    sessionId,

    student: {
      id: user?.id || user?.email || "",
      name: user?.name || "Student",
      email: user?.email || "",
    },

    application: {
      applicationId:
        application?.applicationId ||
        application?.id ||
        "",

      jobId:
        application?.jobId ||
        application?.job?.id ||
        "",

      jobTitle:
        application?.jobTitle ||
        application?.job?.title ||
        role,

      companyName:
        application?.companyName ||
        application?.company ||
        application?.job?.companyName ||
        "",

      recruiterEmail:
        application?.recruiterEmail ||
        application?.recruiter?.email ||
        application?.job?.recruiterEmail ||
        "",
    },

    interview: {
      role,
      difficulty: "Medium",
      status: "CREATED",
      currentQuestionIndex: 0,
      startedAt: null,
      completedAt: null,
      elapsedSeconds: 0,
    },

    media: {
      cameraConnected: false,
      microphoneConnected: false,
    },

    monitoring: {
      status: "READY",
      events: [],
      violationCount: 0,
      lastEvent: null,
    },

    questions: DEMO_QUESTIONS.map(
      (question) => ({
        ...question,

        answer: "",

        status: "NOT_ANSWERED",

        answeredAt: null,

        /*
         * Added evaluation storage.
         */
        evaluation: {
          isCorrect: false,
          score: 0,
          status: "NOT_ANSWERED",
          matchedKeywords: [],
        },
      })
    ),

    evaluation: {
      status: "NOT_STARTED",
      percentage: 0,
      overall: 0,
      answered: 0,
      correct: 0,
      wrong: 0,
      skipped: 0,
      total: DEMO_QUESTIONS.length,
      evaluatedAt: null,
      feedback: "",
      strengths: [],
      improvementAreas: [],
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function saveInterviewSession(session) {
  if (!session?.sessionId) {
    return;
  }

  const updatedSession = {
    ...session,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    `${SESSION_PREFIX}${updatedSession.sessionId}`,
    JSON.stringify(updatedSession)
  );

  localStorage.setItem(
    ACTIVE_SESSION_KEY,
    JSON.stringify(updatedSession)
  );

  window.dispatchEvent(
    new CustomEvent(
      "campuslink_interview_session_updated"
    )
  );
}

/*
 * ============================================================
 * Add an AI monitoring event.
 * ============================================================
 */
function addMonitoringEvent(
  session,
  type,
  message,
  violation = false
) {
  const event = {
    eventId:
      `EVENT-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,

    type,

    message,

    violation,

    timestamp:
      new Date().toISOString(),
  };

  const events = [
    ...(session?.monitoring?.events || []),
    event,
  ];

  return {
    ...session,

    monitoring: {
      ...(session?.monitoring || {}),

      status: violation
        ? "WARNING"
        : "MONITORING",

      events,

      violationCount:
        Number(
          session?.monitoring?.violationCount || 0
        ) + (violation ? 1 : 0),

      lastEvent: event,
    },
  };
}

/*
 * ============================================================
 * Update the application after the student finishes.
 * ============================================================
 */
function markApplicationInterviewCompleted(
  session,
  performance
) {
  try {
    const saved = safeParse(
      localStorage.getItem(APPLICATIONS_KEY),
      []
    );

    if (!Array.isArray(saved)) {
      return;
    }

    const applicationId =
      session?.application?.applicationId || "";

    const sessionId =
      session?.sessionId || "";

    if (!applicationId) {
      console.warn(
        "No applicationId found in interview session."
      );

      return;
    }

    const updated = saved.map(
      (application) => {
        const currentId =
          application?.applicationId ||
          application?.id ||
          "";

        if (
          String(currentId) !==
          String(applicationId)
        ) {
          return application;
        }

        return {
          ...application,

          status: "INTERVIEW_COMPLETED",

          interviewSessionId: sessionId,

          interviewCompletedAt:
            new Date().toISOString(),

          interview: {
            ...(application.interview || {}),

            scheduled:
              application.interview?.scheduled ??
              true,

            completed: true,

            completedAt:
              new Date().toISOString(),

            sessionId,

            performance,
          },

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

    localStorage.setItem(
      APPLICATIONS_KEY,
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new CustomEvent(
        "campuslink_application_updated"
      )
    );

    console.log(
      "APPLICATION UPDATED TO INTERVIEW_COMPLETED:",
      applicationId
    );
  } catch (error) {
    console.error(
      "Could not update application after interview:",
      error
    );
  }
}

/*
 * ============================================================
 * Send notification to recruiter.
 * ============================================================
 */
function notifyRecruiterInterviewCompleted(
  session,
  performance
) {
  try {
    /*
     * First try the email already stored
     * inside the interview session.
     */
    let recruiterEmail = String(
      session?.application?.recruiterEmail || ""
    )
      .trim()
      .toLowerCase();

    /*
     * If it is missing, search the recruiter's jobs.
     */
    if (!recruiterEmail) {
      const jobId =
        session?.application?.jobId || "";

      if (jobId) {
        const storageKeys =
          Object.keys(localStorage);

        const jobStorageKeys =
          storageKeys.filter((key) =>
            key.startsWith("campuslink_jobs_")
          );

        for (const key of jobStorageKeys) {
          const jobs = safeParse(
            localStorage.getItem(key),
            []
          );

          if (!Array.isArray(jobs)) {
            continue;
          }

          const matchedJob = jobs.find(
            (job) =>
              String(job?.id || "")
                .trim() ===
              String(jobId).trim()
          );

          if (matchedJob) {
            recruiterEmail = String(
              matchedJob.recruiterEmail ||
                key.replace(
                  "campuslink_jobs_",
                  ""
                ) ||
                ""
            )
              .trim()
              .toLowerCase();

            console.log(
              "Recruiter email recovered from job:",
              recruiterEmail
            );

            break;
          }
        }
      }
    }

    console.log(
      "INTERVIEW COMPLETED SESSION:",
      session
    );

    console.log(
      "RECRUITER EMAIL:",
      recruiterEmail
    );

    if (!recruiterEmail) {
      console.warn(
        "INTERVIEW COMPLETED NOTIFICATION NOT SENT: recruiter email is missing."
      );

      return false;
    }

    const saved = safeParse(
      localStorage.getItem(NOTIFICATIONS_KEY),
      []
    );

    const notifications =
      Array.isArray(saved)
        ? saved
        : [];

    /*
     * Avoid duplicate notifications.
     */
    const alreadyExists =
      notifications.some(
        (notification) =>
          notification.type ===
            "INTERVIEW_COMPLETED" &&
          String(
            notification.sessionId || ""
          ) ===
            String(session?.sessionId || "")
      );

    if (alreadyExists) {
      console.log(
        "Interview completion notification already exists."
      );

      return true;
    }

    const studentName =
      session?.student?.name ||
      "Student";

    const studentEmail =
      session?.student?.email ||
      "";

    const applicationId =
      session?.application?.applicationId ||
      "";

    const jobId =
      session?.application?.jobId ||
      "";

    const jobTitle =
      session?.application?.jobTitle ||
      session?.interview?.role ||
      "Interview";

    const companyName =
      session?.application?.companyName ||
      "";

    const notification = {
      notificationId:
        `NOTIF-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)
          .toUpperCase()}`,

      type: "INTERVIEW_COMPLETED",

      userEmail:
        recruiterEmail,

      userRole:
        "recruiter",

      title:
        "Interview Completed",

      message:
        `${studentName} has completed the interview for ${jobTitle}${
          companyName
            ? ` at ${companyName}`
            : ""
        }. The interview answers and AI monitoring data are ready for review.`,

      studentName,

      studentEmail,

      applicationId,

      jobId,

      jobTitle,

      companyName,

      sessionId:
        session?.sessionId || "",

      performance,

      createdAt:
        new Date().toISOString(),

      read: false,
    };

    notifications.push(notification);

    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(notifications)
    );

    window.dispatchEvent(
      new CustomEvent(
        "campuslink_notification_updated"
      )
    );

    console.log(
      "RECRUITER INTERVIEW COMPLETED NOTIFICATION CREATED:",
      notification
    );

    return true;
  } catch (error) {
    console.error(
      "Could not create recruiter interview notification:",
      error
    );

    return false;
  }
}

function AIInterview() {
  const { user } = useAuth();

  const [stage, setStage] =
    useState("setup");

  const [session, setSession] =
    useState(null);

  const [answer, setAnswer] =
    useState("");

  const [mediaError, setMediaError] =
    useState("");

  const [cameraEnabled, setCameraEnabled] =
    useState(false);

  const [microphoneEnabled, setMicrophoneEnabled] =
    useState(false);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [currentApplication, setCurrentApplication] =
    useState(null);

  const streamRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const finishingRef =
    useRef(false);

  /*
   * Load scheduled application.
   */
  useEffect(() => {
    const application =
      getCurrentInterviewApplication();

    setCurrentApplication(application);
  }, []);

  /*
   * Create session.
   */
  useEffect(() => {
    if (stage !== "setup") {
      return;
    }

    if (!user) {
      return;
    }

    if (session) {
      return;
    }

    const application =
      currentApplication ||
      getCurrentInterviewApplication();

    const initialSession =
      createInitialSession(
        user,
        application
      );

    setSession(initialSession);
  }, [
    user,
    currentApplication,
    stage,
    session,
  ]);

  /*
   * Attach camera stream to video.
   *
   * This is intentionally kept after the stream
   * exists and the interview stage is active.
   */
  useEffect(() => {
    if (stage !== "interview") {
      return;
    }

    if (!streamRef.current) {
      return;
    }

    if (!videoRef.current) {
      return;
    }

    const video =
      videoRef.current;

    video.srcObject =
      streamRef.current;

    video.muted = true;

    video.playsInline = true;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.warn(
          "Camera video autoplay was blocked:",
          error
        );
      }
    };

    playVideo();

    return () => {
      if (
        video.srcObject ===
        streamRef.current
      ) {
        video.srcObject = null;
      }
    };
  }, [stage]);

  /*
   * Keep timer.
   */
  useEffect(() => {
    if (stage !== "interview") {
      return;
    }

    const interval =
      window.setInterval(() => {
        setElapsedSeconds(
          (previous) =>
            previous + 1
        );
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [stage]);

  /*
   * Sync timer into session.
   */
  useEffect(() => {
    if (!session) {
      return;
    }

    if (
      session.interview?.status !==
      "ACTIVE"
    ) {
      return;
    }

    const updated = {
      ...session,

      interview: {
        ...session.interview,
        elapsedSeconds,
      },
    };

    setSession(updated);
    saveInterviewSession(updated);
  }, [elapsedSeconds]);

  /*
   * Monitor camera/microphone track ending.
   */
  useEffect(() => {
    const stream =
      streamRef.current;

    if (!stream) {
      return;
    }

    const tracks =
      stream.getTracks();

    const handleTrackEnded = (
      event
    ) => {
      if (!session) {
        return;
      }

      const track =
        event.target;

      const type =
        track.kind === "video"
          ? "CAMERA_DISCONNECTED"
          : "MICROPHONE_DISCONNECTED";

      const message =
        track.kind === "video"
          ? "Student camera was disconnected."
          : "Student microphone was disconnected.";

      const updated =
        addMonitoringEvent(
          session,
          type,
          message,
          true
        );

      setSession(updated);

      saveInterviewSession(
        updated
      );

      if (
        track.kind === "video"
      ) {
        setCameraEnabled(false);
      }

      if (
        track.kind === "audio"
      ) {
        setMicrophoneEnabled(
          false
        );
      }
    };

    tracks.forEach((track) => {
      track.addEventListener(
        "ended",
        handleTrackEnded
      );
    });

    return () => {
      tracks.forEach((track) => {
        track.removeEventListener(
          "ended",
          handleTrackEnded
        );
      });
    };
  }, [session, streamRef.current]);

  /*
   * Monitor tab visibility.
   */
  useEffect(() => {
    if (stage !== "interview") {
      return;
    }

    const handleVisibility =
      () => {
        if (!session) {
          return;
        }

        if (
          document.hidden
        ) {
          const updated =
            addMonitoringEvent(
              session,
              "TAB_SWITCH",
              "Interview page became hidden.",
              true
            );

          setSession(updated);

          saveInterviewSession(
            updated
          );
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [stage, session]);

  /*
   * Start student camera + microphone.
   */
  const startMedia = async () => {
    setMediaError("");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera and microphone are not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: true,
          }
        );

      streamRef.current =
        stream;

      setCameraEnabled(true);
      setMicrophoneEnabled(true);

      const updated = {
        ...session,

        media: {
          cameraConnected: true,
          microphoneConnected: true,
        },

        monitoring: {
          ...session.monitoring,
          status: "MONITORING",
        },
      };

      setSession(updated);

      saveInterviewSession(
        updated
      );
    } catch (error) {
      console.error(
        "Could not access camera/microphone:",
        error
      );

      setMediaError(
        "Camera and microphone permission is required to start the AI interview."
      );
    }
  };

  /*
   * Stop media.
   */
  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    setCameraEnabled(false);
    setMicrophoneEnabled(false);
  };

  /*
   * Start interview.
   */
  const startInterview = async () => {
    if (!session) {
      return;
    }

    if (!cameraEnabled) {
      await startMedia();

      /*
       * getUserMedia is asynchronous.
       * Give the browser a moment before
       * moving into the interview screen.
       */
      await new Promise(
        (resolve) =>
          setTimeout(resolve, 250)
      );
    }

    const application =
      currentApplication ||
      getCurrentInterviewApplication();

    const startedAt =
      new Date().toISOString();

    const updated = {
      ...session,

      application: {
        ...session.application,

        ...(application || {}),

        recruiterEmail:
          application?.recruiterEmail ||
          session.application
            ?.recruiterEmail ||
          "",
      },

      interview: {
        ...session.interview,

        status: "ACTIVE",

        startedAt,

        currentQuestionIndex: 0,
      },

      monitoring: {
        ...session.monitoring,

        status: "MONITORING",
      },
    };

    const eventUpdated =
      addMonitoringEvent(
        updated,
        "INTERVIEW_STARTED",
        "AI interview started successfully.",
        false
      );

    setSession(eventUpdated);

    saveInterviewSession(
      eventUpdated
    );

    setStage("interview");
  };

  /*
   * Current question.
   */
  const currentQuestion =
    session?.questions?.[
      session?.interview
        ?.currentQuestionIndex || 0
    ];

  /*
   * ============================================================
   * Save current answer.
   * ============================================================
   *
   * ADDITION:
   * The answer is now evaluated before being saved.
   *
   * Existing answer/status structure remains.
   */
  const saveCurrentAnswer = () => {
    if (!session) {
      return session;
    }

    const index =
      session.interview
        .currentQuestionIndex;

    const trimmedAnswer =
      answer.trim();

    const updatedQuestions =
      session.questions.map(
        (question, questionIndex) => {
          if (questionIndex !== index) {
            return question;
          }

          /*
           * Empty answer remains NOT_ANSWERED.
           */
          if (!trimmedAnswer) {
            return {
              ...question,

              answer: "",

              status:
                question.status ===
                "SKIPPED"
                  ? "SKIPPED"
                  : "NOT_ANSWERED",

              answeredAt:
                question.status ===
                "SKIPPED"
                  ? null
                  : question.answeredAt,

              evaluation: {
                isCorrect: false,
                score: 0,
                status:
                  question.status ===
                  "SKIPPED"
                    ? "SKIPPED"
                    : "NOT_ANSWERED",
                matchedKeywords: [],
              },
            };
          }

          /*
           * Evaluate actual answer.
           */
          const evaluation =
            evaluateInterviewAnswer(
              question,
              trimmedAnswer
            );

          return {
            ...question,

            answer:
              trimmedAnswer,

            /*
             * Keep ANSWERED here because the
             * student did provide an answer.
             *
             * Correct/Wrong is stored separately
             * inside evaluation.
             */
            status: "ANSWERED",

            answeredAt:
              new Date().toISOString(),

            evaluation,
          };
        }
      );

    return {
      ...session,

      questions:
        updatedQuestions,
    };
  };

  /*
   * Move to next question.
   */
  const nextQuestion = () => {
    if (!session) {
      return;
    }

    const answeredSession =
      saveCurrentAnswer();

    const currentIndex =
      answeredSession.interview
        .currentQuestionIndex;

    if (
      currentIndex >=
      answeredSession.questions.length -
        1
    ) {
      finishInterview(
        answeredSession
      );

      return;
    }

    const nextIndex =
      currentIndex + 1;

    const updated = {
      ...answeredSession,

      interview: {
        ...answeredSession.interview,

        currentQuestionIndex:
          nextIndex,
      },
    };

    setSession(updated);

    setAnswer(
      updated.questions[
        nextIndex
      ]?.answer || ""
    );

    saveInterviewSession(
      updated
    );
  };

  /*
   * ============================================================
   * Skip question.
   * ============================================================
   *
   * IMPORTANT:
   * The old version marked the question SKIPPED,
   * then nextQuestion() called saveCurrentAnswer(),
   * which could overwrite SKIPPED.
   *
   * This version preserves SKIPPED.
   */
  const skipQuestion = () => {
    if (!session) {
      return;
    }

    const currentIndex =
      session.interview
        .currentQuestionIndex;

    const updatedQuestions =
      session.questions.map(
        (question, index) =>
          index === currentIndex
            ? {
                ...question,

                status: "SKIPPED",

                answer: "",

                answeredAt: null,

                evaluation: {
                  isCorrect: false,
                  score: 0,
                  status: "SKIPPED",
                  matchedKeywords: [],
                },
              }
            : question
      );

    const skippedSession = {
      ...session,

      questions:
        updatedQuestions,
    };

    /*
     * If this is the final question,
     * finish directly.
     */
    if (
      currentIndex >=
      skippedSession.questions.length - 1
    ) {
      finishInterview(
        skippedSession
      );

      return;
    }

    const nextIndex =
      currentIndex + 1;

    const updated = {
      ...skippedSession,

      interview: {
        ...skippedSession.interview,

        currentQuestionIndex:
          nextIndex,
      },
    };

    setSession(updated);

    setAnswer(
      updated.questions[
        nextIndex
      ]?.answer || ""
    );

    saveInterviewSession(
      updated
    );
  };

  /*
   * ============================================================
   * Finish interview.
   * ============================================================
   */
  const finishInterview = (
    providedSession = null
  ) => {
    if (finishingRef.current) {
      return;
    }

    finishingRef.current = true;

    try {
      let workingSession =
        providedSession ||
        session;

      /*
       * Make sure final answer is saved
       * before calculating performance.
       */
      if (
        workingSession &&
        workingSession.interview
          ?.status === "ACTIVE"
      ) {
        const index =
          workingSession.interview
            .currentQuestionIndex;

        const currentStoredQuestion =
          workingSession.questions[index];

        const updatedQuestions =
          workingSession.questions.map(
            (question, questionIndex) => {
              if (
                questionIndex !== index
              ) {
                return question;
              }

              /*
               * If the question was already skipped,
               * preserve SKIPPED.
               */
              if (
                question.status ===
                "SKIPPED"
              ) {
                return {
                  ...question,

                  answer: "",

                  status: "SKIPPED",

                  answeredAt: null,

                  evaluation: {
                    isCorrect: false,
                    score: 0,
                    status: "SKIPPED",
                    matchedKeywords: [],
                  },
                };
              }

              const finalAnswer =
                answer.trim();

              /*
               * If there is no final answer,
               * preserve NOT_ANSWERED.
               */
              if (!finalAnswer) {
                return {
                  ...question,

                  answer: "",

                  status:
                    question.status ===
                    "ANSWERED"
                      ? "ANSWERED"
                      : "NOT_ANSWERED",

                  answeredAt:
                    question.answeredAt,

                  evaluation:
                    question.evaluation ||
                    {
                      isCorrect: false,
                      score: 0,
                      status:
                        question.status ===
                        "ANSWERED"
                          ? "WRONG"
                          : "NOT_ANSWERED",
                      matchedKeywords: [],
                    },
                };
              }

              /*
               * Evaluate final answer.
               */
              const evaluation =
                evaluateInterviewAnswer(
                  question,
                  finalAnswer
                );

              return {
                ...question,

                answer:
                  finalAnswer,

                status: "ANSWERED",

                answeredAt:
                  new Date().toISOString(),

                evaluation,
              };
            }
          );

        workingSession = {
          ...workingSession,

          questions:
            updatedQuestions,
        };
      }

      const completedAt =
        new Date().toISOString();

      /*
       * ========================================================
       * REAL PERFORMANCE CALCULATION
       * ========================================================
       *
       * Answered is NOT the same as Correct.
       */
      const answered =
        workingSession.questions.filter(
          (question) =>
            question.status ===
            "ANSWERED"
        ).length;

      const correct =
        workingSession.questions.filter(
          (question) =>
            question.evaluation
              ?.isCorrect === true
        ).length;

      const wrong =
        workingSession.questions.filter(
          (question) =>
            question.status ===
              "ANSWERED" &&
            question.evaluation
              ?.isCorrect !== true
        ).length;

      const skipped =
        workingSession.questions.filter(
          (question) =>
            question.status ===
            "SKIPPED"
        ).length;

      const total =
        workingSession.questions.length;

      /*
       * Performance is based on CORRECT answers.
       *
       * Example:
       *
       * 5 questions
       * 5 answered
       * 0 correct
       *
       * Performance = 0%
       */
      const percentage =
        total > 0
          ? Math.round(
              (correct / total) *
                100
            )
          : 0;

      /*
       * Build simple feedback data.
       */
      const strengths = [];

      const improvementAreas = [];

      const skills = {};

      workingSession.questions.forEach(
        (question) => {
          const skill =
            question.skill ||
            "Technical";

          if (!skills[skill]) {
            skills[skill] = {
              correct: 0,
              total: 0,
            };
          }

          skills[skill].total += 1;

          if (
            question.evaluation
              ?.isCorrect
          ) {
            skills[skill].correct += 1;
          }
        }
      );

      Object.entries(skills).forEach(
        ([skill, result]) => {
          const skillPercentage =
            result.total > 0
              ? Math.round(
                  (result.correct /
                    result.total) *
                    100
                )
              : 0;

          if (
            skillPercentage >= 70
          ) {
            strengths.push(skill);
          } else {
            improvementAreas.push(
              skill
            );
          }
        }
      );

      const feedback =
        percentage >= 70
          ? "The student demonstrated satisfactory performance in the evaluated interview questions."
          : "The interview shows areas that require further improvement based on the evaluated answers.";

      const finalSession = {
        ...workingSession,

        interview: {
          ...workingSession.interview,

          status: "COMPLETED",

          completedAt,

          elapsedSeconds,
        },

        monitoring: {
          ...workingSession.monitoring,

          status: "COMPLETED",
        },

        evaluation: {
          status:
            "PENDING_REVIEW",

          percentage,

          overall: percentage,

          answered,

          correct,

          wrong,

          skipped,

          total,

          evaluatedAt: null,

          feedback,

          strengths,

          improvementAreas,
        },
      };

      /*
       * Very important:
       * save the final evaluation before
       * notifying recruiter.
       */
      const completedWithEvent =
        addMonitoringEvent(
          finalSession,
          "INTERVIEW_COMPLETED",
          "Student completed the AI interview.",
          false
        );

      saveInterviewSession(
        completedWithEvent
      );

      /*
       * Update React state.
       */
      setSession(
        completedWithEvent
      );

      /*
       * Update application status.
       */
      markApplicationInterviewCompleted(
        completedWithEvent,
        percentage
      );

      /*
       * Notify recruiter.
       */
      console.log(
        "INTERVIEW COMPLETED SESSION:",
        completedWithEvent
      );

      console.log(
        "RECRUITER EMAIL:",
        completedWithEvent
          ?.application
          ?.recruiterEmail
      );

      const notificationCreated =
        notifyRecruiterInterviewCompleted(
          completedWithEvent,
          percentage
        );

      console.log(
        "RECRUITER NOTIFICATION CREATED:",
        notificationCreated
      );

      /*
       * Remove temporary scheduled
       * application after the interview
       * has been completed.
       */
      localStorage.removeItem(
        CURRENT_APPLICATION_KEY
      );

      stopMedia();

      setStage("complete");
    } catch (error) {
      console.error(
        "Could not finish interview:",
        error
      );

      finishingRef.current = false;
    }
  };

  /*
   * Restart current answer.
   */
  const resetAnswer = () => {
    setAnswer("");
  };

  /*
   * Format seconds.
   */
  const formatSeconds = (
    seconds
  ) => {
    const safeSeconds =
      Math.max(
        0,
        Number(seconds || 0)
      );

    const minutes =
      Math.floor(
        safeSeconds / 60
      );

    const remaining =
      safeSeconds % 60;

    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      remaining
    ).padStart(2, "0")}`;
  };

  /*
   * ============================================================
   * SETUP SCREEN
   * ============================================================
   */
  if (stage === "setup") {
    return (
      <div className="ai-interview-page">
        <div className="ai-interview-header">
          <div>
            <h1>
              AI Interview
            </h1>

            <p>
              Complete your AI-monitored
              technical interview.
            </p>
          </div>
        </div>

        <div className="interview-setup-card">
          <div className="setup-icon">
            <ShieldCheck
              size={44}
            />
          </div>

          <h2>
            Student Interview
          </h2>

          <p>
            You are the interview
            participant. Your camera and
            microphone will be used during
            the interview.
          </p>

          {currentApplication && (
            <div
              className="scheduled-interview-info"
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "12px",
                background:
                  "rgba(59, 130, 246, 0.08)",
                border:
                  "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <strong>
                Scheduled Interview
              </strong>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                <div>
                  <strong>
                    Company:
                  </strong>{" "}
                  {currentApplication.companyName ||
                    "Company"}
                </div>

                <div>
                  <strong>
                    Job:
                  </strong>{" "}
                  {currentApplication.jobTitle ||
                    "Interview"}
                </div>

                {currentApplication
                  .interview
                  ?.date && (
                  <div>
                    <strong>
                      Date:
                    </strong>{" "}
                    {
                      currentApplication
                        .interview
                        .date
                    }
                  </div>
                )}

                {currentApplication
                  .interview
                  ?.time && (
                  <div>
                    <strong>
                      Time:
                    </strong>{" "}
                    {
                      currentApplication
                        .interview
                        .time
                    }
                  </div>
                )}

                {currentApplication
                  .interview
                  ?.duration && (
                  <div>
                    <strong>
                      Duration:
                    </strong>{" "}
                    {
                      currentApplication
                        .interview
                        .duration
                    }{" "}
                    minutes
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="media-permission-area">
            <div className="media-status-row">
              <div>
                {cameraEnabled ? (
                  <Camera
                    size={20}
                  />
                ) : (
                  <CameraOff
                    size={20}
                  />
                )}

                <span>
                  Camera
                </span>
              </div>

              <strong>
                {cameraEnabled
                  ? "Ready"
                  : "Not connected"}
              </strong>
            </div>

            <div className="media-status-row">
              <div>
                {microphoneEnabled ? (
                  <Mic
                    size={20}
                  />
                ) : (
                  <MicOff
                    size={20}
                  />
                )}

                <span>
                  Microphone
                </span>
              </div>

              <strong>
                {microphoneEnabled
                  ? "Ready"
                  : "Not connected"}
              </strong>
            </div>
          </div>

          {mediaError && (
            <div className="interview-error">
              <AlertCircle
                size={20}
              />

              <span>
                {mediaError}
              </span>
            </div>
          )}

          <div className="setup-actions">
            {!cameraEnabled && (
              <button
                className="primary-btn"
                onClick={startMedia}
              >
                <Video
                  size={18}
                />

                Enable Camera &
                Microphone
              </button>
            )}

            {cameraEnabled && (
              <button
                className="primary-btn"
                onClick={startInterview}
              >
                <Play
                  size={18}
                />

                Start Interview
              </button>
            )}
          </div>

          <div className="setup-note">
            <ShieldCheck
              size={18}
            />

            <span>
              The recruiter monitors your
              interview. The recruiter does
              not use their own camera or
              microphone.
            </span>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * COMPLETION SCREEN
   * ============================================================
   */
  if (stage === "complete") {
    const percentage =
      session?.evaluation
        ?.percentage || 0;

    const answered =
      session?.evaluation
        ?.answered || 0;

    const total =
      session?.evaluation
        ?.total ||
      session?.questions?.length ||
      0;

    return (
      <div className="ai-interview-page">
        <div className="interview-complete-card">
          <div className="complete-icon">
            <CheckCircle2
              size={58}
            />
          </div>

          <h1>
            Interview Completed
          </h1>

          <p>
            Your AI interview has been
            completed successfully.
          </p>

          <div className="completion-stats">
            <div>
              <strong>
                {percentage}%
              </strong>

              <span>
                Performance
              </span>
            </div>

            <div>
              <strong>
                {answered}/{total}
              </strong>

              <span>
                Answered
              </span>
            </div>

            <div>
              <strong>
                {formatSeconds(
                  session?.interview
                    ?.elapsedSeconds
                )}
              </strong>

              <span>
                Duration
              </span>
            </div>
          </div>

          <div className="completion-message">
            <CheckCircle2
              size={20}
            />

            <span>
              Your interview answers and AI
              monitoring data are ready for
              recruiter review.
            </span>
          </div>

          <div className="completion-message">
            <BellIconFallback />

            <span>
              Recruiter notified about
              interview completion.
            </span>
          </div>

          <div className="session-id">
            <span>
              Interview Session ID
            </span>

            <strong>
              {session?.sessionId}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * INTERVIEW SCREEN
   * ============================================================
   */
  return (
    <div className="ai-interview-page">
      <div className="ai-interview-header">
        <div>
          <h1>
            AI Interview
          </h1>

          <p>
            {session?.application
              ?.companyName
              ? `${session.application.companyName} • `
              : ""}
            {session?.interview
              ?.role || "Technical Interview"}
          </p>
        </div>

        <div className="interview-header-timer">
          <Activity
            size={20}
          />

          {formatSeconds(
            elapsedSeconds
          )}
        </div>
      </div>

      <div className="interview-main-grid">
        <div className="interview-video-section">
          <div className="student-video-card">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="student-camera-video"
            />

            {!cameraEnabled && (
              <div className="camera-placeholder">
                <CameraOff
                  size={48}
                />

                <span>
                  Camera is not connected
                </span>
              </div>
            )}

            <div className="video-overlay">
              <div className="participant-name">
                {session?.student
                  ?.name ||
                  "Student"}
              </div>

              <div className="media-indicators">
                {cameraEnabled ? (
                  <Camera
                    size={18}
                  />
                ) : (
                  <CameraOff
                    size={18}
                  />
                )}

                {microphoneEnabled ? (
                  <Mic
                    size={18}
                  />
                ) : (
                  <MicOff
                    size={18}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="monitoring-panel">
            <MonitoringStatus
              status={
                session?.monitoring
                  ?.status || "MONITORING"
              }
              events={
                session?.monitoring
                  ?.events || []
              }
              violationCount={
                session?.monitoring
                  ?.violationCount || 0
              }
            />
          </div>
        </div>

        <div className="interview-question-section">
          <div className="question-progress">
            Question{" "}
            {(session?.interview
              ?.currentQuestionIndex ||
              0) + 1}{" "}
            of{" "}
            {session?.questions
              ?.length || 0}
          </div>

          <div className="question-card">
            <div className="question-meta">
              <span>
                {currentQuestion?.skill ||
                  "Technical"}
              </span>

              <span>
                {currentQuestion?.difficulty ||
                  "Medium"}
              </span>
            </div>

            <h2>
              {currentQuestion?.question}
            </h2>
          </div>

          <div className="answer-section">
            <label>
              Your Answer
            </label>

            <textarea
              value={answer}
              onChange={(event) =>
                setAnswer(
                  event.target.value
                )
              }
              placeholder="Type your answer here..."
              rows={8}
            />
          </div>

          <div className="question-actions">
            <button
              className="secondary-btn"
              onClick={resetAnswer}
            >
              <RotateCcw
                size={17}
              />

              Reset
            </button>

            <button
              className="secondary-btn"
              onClick={skipQuestion}
            >
              <SkipForward
                size={17}
              />

              Skip
            </button>

            <button
              className="primary-btn"
              onClick={nextQuestion}
            >
              <Send
                size={17}
              />

              {session?.interview
                ?.currentQuestionIndex ===
              session?.questions?.length -
                1
                ? "Finish Interview"
                : "Submit & Next"}
            </button>
          </div>
        </div>
      </div>

      <div className="interview-footer-note">
        <ShieldCheck
          size={18}
        />

        <span>
          AI monitoring is active. The
          recruiter can monitor your live
          interview session, answers and
          monitoring events.
        </span>
      </div>
    </div>
  );
}

/*
 * Small fallback icon so the completion
 * screen does not depend on another icon.
 */
function BellIconFallback() {
  return (
    <Activity
      size={20}
    />
  );
}

export default AIInterview;