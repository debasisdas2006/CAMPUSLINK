import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock3,
  Send,
} from "lucide-react";

import "./AssessmentTest.css";


function AssessmentTest() {
  const location = useLocation();
  const navigate = useNavigate();

  const assessment =
    location.state?.assessment || {
      id: "TEST-001",
      title: "Python Programming Assessment",
      skill: "Python",
      questions: 10,
      duration: 10,
    };


  const questions = useMemo(
    () => [
      {
        id: "Q1",
        question:
          "Which keyword is used to define a function in Python?",
        options: [
          "function",
          "def",
          "func",
          "define",
        ],
        answer: 1,
      },
      {
        id: "Q2",
        question:
          "Which of the following is a mutable data type in Python?",
        options: [
          "Tuple",
          "String",
          "List",
          "Integer",
        ],
        answer: 2,
      },
      {
        id: "Q3",
        question:
          "What does len() return for a list?",
        options: [
          "The last element",
          "The number of elements",
          "The memory size",
          "The data type",
        ],
        answer: 1,
      },
      {
        id: "Q4",
        question:
          "Which symbol is used for a comment in Python?",
        options: [
          "//",
          "/* */",
          "#",
          "<!-- -->",
        ],
        answer: 2,
      },
      {
        id: "Q5",
        question:
          "Which keyword is used to handle exceptions?",
        options: [
          "catch",
          "try",
          "error",
          "handle",
        ],
        answer: 1,
      },
      {
        id: "Q6",
        question:
          "Which collection stores key-value pairs?",
        options: [
          "List",
          "Tuple",
          "Set",
          "Dictionary",
        ],
        answer: 3,
      },
      {
        id: "Q7",
        question:
          "What is the output type of input() in Python?",
        options: [
          "Integer",
          "String",
          "Boolean",
          "Float",
        ],
        answer: 1,
      },
      {
        id: "Q8",
        question:
          "Which operator is used for exponentiation?",
        options: [
          "^",
          "**",
          "//",
          "%%",
        ],
        answer: 1,
      },
      {
        id: "Q9",
        question:
          "Which statement exits a loop immediately?",
        options: [
          "continue",
          "skip",
          "break",
          "exitloop",
        ],
        answer: 2,
      },
      {
        id: "Q10",
        question:
          "Which keyword creates a class in Python?",
        options: [
          "object",
          "class",
          "struct",
          "new",
        ],
        answer: 1,
      },
    ],
    []
  );


  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswers, setSelectedAnswers] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(assessment.duration * 60);


  const currentQuestion =
    questions[currentIndex];


  /* TIMER */

  useEffect(() => {
    if (submitted) {
      return;
    }

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer =
      setInterval(() => {
        setTimeLeft(
          (previous) =>
            previous - 1
        );
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timeLeft, submitted]);


  const formatTime = () => {
    const minutes =
      Math.floor(timeLeft / 60)
        .toString()
        .padStart(2, "0");

    const seconds =
      (timeLeft % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${seconds}`;
  };


  const handleSelectAnswer = (
    optionIndex
  ) => {
    setSelectedAnswers(
      (previous) => ({
        ...previous,
        [currentQuestion.id]:
          optionIndex,
      })
    );
  };


  const handleNext = () => {
    if (
      currentIndex <
      questions.length - 1
    ) {
      setCurrentIndex(
        (previous) =>
          previous + 1
      );
    }
  };


  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(
        (previous) =>
          previous - 1
      );
    }
  };


  const handleSubmit = () => {
    setSubmitted(true);
  };


  const score = questions.reduce(
    (total, question) => {
      return (
        total +
        (
          selectedAnswers[
            question.id
          ] === question.answer
            ? 1
            : 0
        )
      );
    },
    0
  );


  const percentage =
    Math.round(
      (score / questions.length) *
        100
    );


  if (submitted) {
    return (
      <div className="assessment-test-page">

        <div className="assessment-result-card">

          <div className="assessment-result-icon">
            <CheckCircle size={45} />
          </div>

          <span className="result-eyebrow">
            ASSESSMENT COMPLETED
          </span>

          <h1>
            {assessment.title}
          </h1>

          <p>
            Your assessment has been submitted
            successfully.
          </p>


          <div className="final-score">

            <strong>
              {percentage}%
            </strong>

            <span>
              Your Score
            </span>

          </div>


          <div className="result-details">

            <div>
              <span>
                Correct Answers
              </span>

              <strong>
                {score}
              </strong>
            </div>

            <div>
              <span>
                Total Questions
              </span>

              <strong>
                {questions.length}
              </strong>
            </div>

            <div>
              <span>
                Time Remaining
              </span>

              <strong>
                {formatTime()}
              </strong>
            </div>

          </div>


          <div className="result-note">

            <strong>
              Result Recorded
            </strong>

            <p>
              Your performance can be reviewed
              from the Performance section.
            </p>

          </div>


          <div className="result-actions">

            <button
              className="assessment-secondary-button"
              onClick={() =>
                navigate(
                  "/student/assessments"
                )
              }
            >
              <ArrowLeft size={17} />
              Back to Assessments
            </button>

            <button
              className="assessment-primary-button"
              onClick={() =>
                navigate(
                  "/student/performance"
                )
              }
            >
              View Performance
            </button>

          </div>

        </div>

      </div>
    );
  }


  return (
    <div className="assessment-test-page">

      {/* HEADER */}

      <div className="test-header">

        <button
          className="test-back-button"
          onClick={() =>
            navigate(
              "/student/assessments"
            )
          }
        >
          <ArrowLeft size={18} />
          Exit Test
        </button>


        <div className="test-title">

          <span>
            {assessment.skill}
          </span>

          <h1>
            {assessment.title}
          </h1>

        </div>


        <div className="test-timer">

          <Clock3 size={18} />

          <strong>
            {formatTime()}
          </strong>

        </div>

      </div>


      {/* PROGRESS */}

      <div className="test-progress-section">

        <div className="test-progress-top">

          <span>
            Question {currentIndex + 1}
            {" "}
            of{" "}
            {questions.length}
          </span>

          <span>
            {Math.round(
              ((currentIndex + 1) /
                questions.length) *
                100
            )}
            %
          </span>

        </div>

        <div className="test-progress-bar">

          <div
            style={{
              width: `${
                ((currentIndex + 1) /
                  questions.length) *
                100
              }%`,
            }}
          />

        </div>

      </div>


      {/* MAIN */}

      <div className="test-layout">

        <main className="question-area">

          <div className="question-test-card">

            <div className="question-test-number">
              Question {currentIndex + 1}
            </div>

            <h2>
              {currentQuestion.question}
            </h2>


            <div className="mcq-options">

              {currentQuestion.options.map(
                (option, index) => {

                  const selected =
                    selectedAnswers[
                      currentQuestion.id
                    ] === index;

                  return (
                    <button
                      key={option}
                      className={
                        selected
                          ? "mcq-option selected"
                          : "mcq-option"
                      }
                      onClick={() =>
                        handleSelectAnswer(
                          index
                        )
                      }
                    >

                      <span className="option-letter">
                        {String.fromCharCode(
                          65 + index
                        )}
                      </span>

                      <span>
                        {option}
                      </span>

                    </button>
                  );
                }
              )}

            </div>


            <div className="question-navigation">

              <button
                className="test-secondary-button"
                onClick={
                  handlePrevious
                }
                disabled={
                  currentIndex === 0
                }
              >
                Previous
              </button>


              {currentIndex ===
              questions.length - 1 ? (

                <button
                  className="test-submit-button"
                  onClick={
                    handleSubmit
                  }
                >
                  <Send size={17} />
                  Submit Test
                </button>

              ) : (

                <button
                  className="test-primary-button"
                  onClick={
                    handleNext
                  }
                >
                  Next Question
                </button>

              )}

            </div>

          </div>

        </main>


        {/* QUESTION NAVIGATOR */}

        <aside className="question-navigator">

          <h3>
            Questions
          </h3>

          <p>
            Select a question to review
            your answer.
          </p>

          <div className="question-number-grid">

            {questions.map(
              (question, index) => {

                const answered =
                  selectedAnswers[
                    question.id
                  ] !== undefined;

                return (
                  <button
                    key={question.id}
                    className={[
                      index ===
                        currentIndex
                        ? "current"
                        : "",
                      answered
                        ? "answered"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      setCurrentIndex(
                        index
                      )
                    }
                  >
                    {index + 1}
                  </button>
                );
              }
            )}

          </div>


          <div className="navigator-legend">

            <div>
              <span className="legend-current" />
              Current
            </div>

            <div>
              <span className="legend-answered" />
              Answered
            </div>

            <div>
              <span className="legend-unanswered" />
              Unanswered
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}


export default AssessmentTest;