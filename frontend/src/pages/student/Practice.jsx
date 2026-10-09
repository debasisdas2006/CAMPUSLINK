import { useMemo, useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Code2,
  Database,
  RotateCcw,
  Trophy,
  Zap,
} from "lucide-react";

import "./Practice.css";


const QUESTION_BANK = {
  Python: [
    {
      question: "Which keyword is used to define a function in Python?",
      options: ["function", "def", "func", "method"],
      answer: 1,
    },
    {
      question: "Which data type is mutable in Python?",
      options: ["Tuple", "String", "List", "Integer"],
      answer: 2,
    },
    {
      question: "What does len() return?",
      options: [
        "Memory size",
        "Number of elements",
        "Data type",
        "Last element",
      ],
      answer: 1,
    },
    {
      question: "Which symbol starts a Python comment?",
      options: ["//", "#", "/*", "--"],
      answer: 1,
    },
    {
      question: "Which keyword is used to create a class?",
      options: ["object", "class", "struct", "new"],
      answer: 1,
    },
  ],

  JavaScript: [
    {
      question: "Which keyword declares a block-scoped variable?",
      options: ["var", "let", "define", "variable"],
      answer: 1,
    },
    {
      question: "Which method converts JSON text into an object?",
      options: [
        "JSON.parse()",
        "JSON.convert()",
        "JSON.object()",
        "JSON.decode()",
      ],
      answer: 0,
    },
    {
      question: "Which operator checks strict equality?",
      options: ["=", "==", "===", "!="],
      answer: 2,
    },
    {
      question: "Which method adds an item to the end of an array?",
      options: ["push()", "add()", "append()", "insert()"],
      answer: 0,
    },
    {
      question: "Which keyword creates a constant?",
      options: ["constant", "fixed", "const", "static"],
      answer: 2,
    },
  ],

  React: [
    {
      question: "Which library is commonly used to build React user interfaces?",
      options: ["React", "Django", "Spring", "Laravel"],
      answer: 0,
    },
    {
      question: "Which hook is used to manage local component state?",
      options: ["useEffect", "useState", "useRoute", "useFetch"],
      answer: 1,
    },
    {
      question: "Which hook is commonly used for side effects?",
      options: ["useState", "useEffect", "useData", "useAction"],
      answer: 1,
    },
    {
      question: "What is JSX?",
      options: [
        "A database",
        "A JavaScript syntax extension",
        "A CSS framework",
        "A backend server",
      ],
      answer: 1,
    },
    {
      question: "Which prop helps identify list elements uniquely?",
      options: ["id", "indexOnly", "key", "unique"],
      answer: 2,
    },
  ],

  SQL: [
    {
      question: "Which SQL command retrieves data?",
      options: ["GET", "SELECT", "FETCH", "READ"],
      answer: 1,
    },
    {
      question: "Which clause filters rows?",
      options: ["WHERE", "FILTER", "HAVING_ONLY", "ROWS"],
      answer: 0,
    },
    {
      question: "Which command adds a new row?",
      options: ["ADD", "INSERT", "CREATE", "APPEND"],
      answer: 1,
    },
    {
      question: "Which clause sorts query results?",
      options: ["SORT BY", "ORDER BY", "GROUP BY", "ARRANGE"],
      answer: 1,
    },
    {
      question: "Which function counts rows?",
      options: ["TOTAL()", "COUNT()", "ROWS()", "NUMBER()"],
      answer: 1,
    },
  ],

  Java: [
    {
      question: "Which keyword is used to create a class in Java?",
      options: ["class", "struct", "define", "object"],
      answer: 0,
    },
    {
      question: "Which method is the entry point of a Java application?",
      options: [
        "start()",
        "run()",
        "main()",
        "execute()",
      ],
      answer: 2,
    },
    {
      question: "Which keyword prevents inheritance?",
      options: ["static", "final", "private", "constant"],
      answer: 1,
    },
    {
      question: "Which collection stores key-value pairs?",
      options: ["ArrayList", "HashMap", "Stack", "Queue"],
      answer: 1,
    },
    {
      question: "Java source code is compiled into?",
      options: [
        "Machine code only",
        "Bytecode",
        "HTML",
        "SQL",
      ],
      answer: 1,
    },
  ],

  "Problem Solving": [
    {
      question: "What should generally be done first when solving a programming problem?",
      options: [
        "Write random code",
        "Understand the requirements",
        "Delete the input",
        "Choose a framework",
      ],
      answer: 1,
    },
    {
      question: "Which structure follows First In First Out?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      answer: 1,
    },
    {
      question: "Which structure follows Last In First Out?",
      options: ["Queue", "Stack", "Array", "Graph"],
      answer: 1,
    },
    {
      question: "Binary search requires the data to be?",
      options: [
        "Random",
        "Sorted",
        "Encrypted",
        "Duplicated",
      ],
      answer: 1,
    },
    {
      question: "What is a good way to handle a complex problem?",
      options: [
        "Ignore it",
        "Break it into smaller problems",
        "Remove all requirements",
        "Avoid testing",
      ],
      answer: 1,
    },
  ],
};


const SKILLS = [
  {
    name: "Python",
    icon: Code2,
    description: "Practice Python programming concepts.",
  },
  {
    name: "JavaScript",
    icon: Code2,
    description: "Practice JavaScript fundamentals.",
  },
  {
    name: "React",
    icon: Zap,
    description: "Practice React and frontend concepts.",
  },
  {
    name: "SQL",
    icon: Database,
    description: "Practice SQL and database concepts.",
  },
  {
    name: "Java",
    icon: Code2,
    description: "Practice Java programming concepts.",
  },
  {
    name: "Problem Solving",
    icon: Brain,
    description: "Improve logical and problem-solving skills.",
  },
];


function shuffleQuestions(items) {
  return [...items]
    .sort(() => Math.random() - 0.5);
}


function Practice() {
  const [selectedSkill, setSelectedSkill] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [score, setScore] =
    useState(0);

  const [answered, setAnswered] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);


  const currentQuestion =
    questions[currentIndex];


  const progress = useMemo(() => {
    if (!questions.length) {
      return 0;
    }

    return Math.round(
      ((currentIndex + 1) /
        questions.length) *
        100
    );
  }, [
    currentIndex,
    questions.length,
  ]);


  const startPractice = (skill) => {
    const randomQuestions =
      shuffleQuestions(
        QUESTION_BANK[skill.name]
      );

    setSelectedSkill(skill);
    setQuestions(randomQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswered(false);
    setCompleted(false);
  };


  const handleAnswer = (index) => {
    if (answered) {
      return;
    }

    setSelectedAnswer(index);
    setAnswered(true);

    if (
      index === currentQuestion.answer
    ) {
      setScore(
        (previous) =>
          previous + 1
      );
    }
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

      setSelectedAnswer(null);
      setAnswered(false);
      return;
    }

    setCompleted(true);
  };


  const restartPractice = () => {
    if (!selectedSkill) {
      return;
    }

    startPractice(selectedSkill);
  };


  const backToSkills = () => {
    setSelectedSkill(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswered(false);
    setCompleted(false);
  };


  /* ======================================
     SKILL SELECTION
  ====================================== */

  if (!selectedSkill) {
    return (
      <div className="practice-page">

        <div className="practice-header">

          <div>
            <span className="practice-eyebrow">
              INTERVIEW PREPARATION
            </span>

            <h1>
              Skill Practice
            </h1>

            <p>
              Choose a skill and practice
              randomly selected questions
              to prepare for interviews.
            </p>
          </div>

          <div className="practice-header-icon">
            <Brain size={30} />
          </div>

        </div>


        <div className="practice-info-card">

          <div className="practice-info-icon">
            <Trophy size={21} />
          </div>

          <div>
            <strong>
              Practice before your interview
            </strong>

            <p>
              Questions are randomly selected
              so you can practice the same skill
              multiple times.
            </p>
          </div>

        </div>


        <div className="practice-section-title">

          <div>
            <span>
              SELECT SKILL
            </span>

            <h2>
              What do you want to practice?
            </h2>
          </div>

        </div>


        <div className="practice-skill-grid">

          {SKILLS.map((skill) => {

            const Icon = skill.icon;

            return (
              <button
                className="practice-skill-card"
                key={skill.name}
                onClick={() =>
                  startPractice(skill)
                }
              >

                <div className="practice-skill-icon">
                  <Icon size={23} />
                </div>

                <div className="practice-skill-content">

                  <h3>
                    {skill.name}
                  </h3>

                  <p>
                    {skill.description}
                  </p>

                  <span>
                    5 practice questions
                    <ArrowRight size={14} />
                  </span>

                </div>

              </button>
            );
          })}

        </div>

      </div>
    );
  }


  /* ======================================
     RESULT
  ====================================== */

  if (completed) {
    const percentage =
      Math.round(
        (score / questions.length) *
          100
      );

    return (
      <div className="practice-page">

        <div className="practice-result">

          <div className="practice-result-icon">
            <Trophy size={42} />
          </div>

          <span className="practice-result-eyebrow">
            PRACTICE COMPLETE
          </span>

          <h1>
            {selectedSkill.name}
          </h1>

          <p>
            You completed this practice session.
          </p>


          <div className="practice-result-score">

            <strong>
              {percentage}%
            </strong>

            <span>
              Practice Score
            </span>

          </div>


          <div className="practice-result-stats">

            <div>
              <span>
                Correct
              </span>

              <strong>
                {score}
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
                Accuracy
              </span>

              <strong>
                {percentage}%
              </strong>
            </div>

          </div>


          <div className="practice-result-actions">

            <button
              className="practice-secondary-button"
              onClick={backToSkills}
            >
              Choose Another Skill
            </button>

            <button
              className="practice-primary-button"
              onClick={restartPractice}
            >
              <RotateCcw size={16} />
              Practice Again
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* ======================================
     QUESTION
  ====================================== */

  return (
    <div className="practice-page">

      <div className="practice-question-header">

        <button
          className="practice-back-button"
          onClick={backToSkills}
        >
          Choose Skill
        </button>

        <div className="practice-question-title">

          <span>
            {selectedSkill.name}
          </span>

          <h1>
            Practice Question
          </h1>

        </div>

        <div className="practice-question-count">
          {currentIndex + 1} /{" "}
          {questions.length}
        </div>

      </div>


      <div className="practice-progress">

        <div>
          <span>
            Progress
          </span>

          <strong>
            {progress}%
          </strong>
        </div>

        <div className="practice-progress-track">
          <div
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

      </div>


      <div className="practice-question-card">

        <div className="practice-question-number">
          Question {currentIndex + 1}
        </div>

        <h2>
          {currentQuestion.question}
        </h2>


        <div className="practice-options">

          {currentQuestion.options.map(
            (option, index) => {

              let className =
                "practice-option";

              if (answered) {
                if (
                  index ===
                  currentQuestion.answer
                ) {
                  className +=
                    " correct";
                } else if (
                  index ===
                    selectedAnswer &&
                  index !==
                    currentQuestion.answer
                ) {
                  className +=
                    " incorrect";
                }
              } else if (
                index === selectedAnswer
              ) {
                className +=
                  " selected";
              }

              return (
                <button
                  key={option}
                  className={className}
                  onClick={() =>
                    handleAnswer(index)
                  }
                  disabled={answered}
                >

                  <span className="practice-option-letter">
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  <span>
                    {option}
                  </span>

                  {answered &&
                    index ===
                      currentQuestion.answer && (
                      <CheckCircle
                        size={18}
                        className="practice-correct-icon"
                      />
                    )}

                </button>
              );
            }
          )}

        </div>


        {answered && (
          <div
            className={
              selectedAnswer ===
              currentQuestion.answer
                ? "practice-feedback correct-feedback"
                : "practice-feedback incorrect-feedback"
            }
          >
            {selectedAnswer ===
            currentQuestion.answer
              ? "Correct! Keep going."
              : "Not quite. Review the correct answer and continue practicing."}
          </div>
        )}


        <div className="practice-question-actions">

          <span>
            {answered
              ? "Answer selected"
              : "Select an answer"}
          </span>

          <button
            className="practice-next-button"
            disabled={!answered}
            onClick={handleNext}
          >
            {currentIndex ===
            questions.length - 1
              ? "Finish Practice"
              : "Next Question"}

            <ArrowRight size={17} />
          </button>

        </div>

      </div>

    </div>
  );
}


export default Practice;