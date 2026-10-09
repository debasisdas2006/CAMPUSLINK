import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  Eye,
  X,
  BookOpen,
  Users,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import "./StudentAssessments.css";

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function flattenQuestions(value, sourceKey = "") {
  const result = [];

  const visit = (item, inherited = {}) => {
    if (Array.isArray(item)) {
      item.forEach((child) => visit(child, inherited));
      return;
    }

    if (!item || typeof item !== "object") {
      return;
    }

    const questionText =
      item.question ||
      item.questionText ||
      item.text ||
      item.title ||
      "";

    const hasQuestion =
      typeof questionText === "string" &&
      questionText.trim().length > 0;

    if (hasQuestion) {
      result.push({
        ...item,
        question:
          typeof questionText === "string"
            ? questionText.trim()
            : String(questionText),

        questionId:
          item.questionId ||
          item.question_id ||
          item.id ||
          `QUESTION-${result.length + 1}`,

        skill:
          item.skill ||
          item.skillName ||
          item.topic ||
          item.category ||
          inherited.skill ||
          "General",

        difficulty:
          item.difficulty ||
          item.level ||
          inherited.difficulty ||
          "Not specified",

        source:
          item.source ||
          item.sourceName ||
          sourceKey ||
          inherited.source ||
          "Local Storage",
      });
    }

    Object.entries(item).forEach(([key, child]) => {
      if (
        [
          "question",
          "questionText",
          "text",
          "title",
          "options",
          "answers",
          "correctAnswer",
          "answer",
        ].includes(key)
      ) {
        return;
      }

      const nextInherited = {
        ...inherited,
        skill:
          item.skill ||
          item.skillName ||
          item.topic ||
          inherited.skill,

        difficulty:
          item.difficulty ||
          item.level ||
          inherited.difficulty,

        source:
          item.source ||
          item.sourceName ||
          inherited.source ||
          sourceKey,
      };

      if (
        Array.isArray(child) ||
        (child && typeof child === "object")
      ) {
        visit(child, nextInherited);
      }
    });
  };

  visit(value);

  return result;
}

function getOptions(question) {
  const options =
    question.options ||
    question.choices ||
    question.answers ||
    [];

  if (Array.isArray(options)) {
    return options.map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        return (
          item.text ||
          item.label ||
          item.value ||
          item.option ||
          ""
        );
      }

      return "";
    });
  }

  if (options && typeof options === "object") {
    return Object.values(options).map((item) =>
      typeof item === "string"
        ? item
        : item?.text ||
          item?.label ||
          item?.value ||
          ""
    );
  }

  return [];
}

function StudentAssessments() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAssessments = () => {
    setLoading(true);

    const collected = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key) continue;

      const lowerKey = key.toLowerCase();

      if (
        !lowerKey.includes("question") &&
        !lowerKey.includes("test") &&
        !lowerKey.includes("assessment")
      ) {
        continue;
      }

      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const parsed = safeParse(raw);

      if (parsed === null) continue;

      const extracted = flattenQuestions(parsed, key);

      extracted.forEach((question) => {
        collected.push({
          ...question,
          storageKey: key,
        });
      });
    }

    const unique = [];
    const seen = new Set();

    collected.forEach((question, index) => {
      const identity = [
        question.questionId,
        question.question,
        question.storageKey,
      ]
        .join("|")
        .toLowerCase();

      if (!seen.has(identity)) {
        seen.add(identity);

        unique.push({
          ...question,
          displayId:
            question.questionId ||
            `QUESTION-${index + 1}`,
        });
      }
    });

    setQuestions(unique);
    setLoading(false);
  };

  useEffect(() => {
    loadAssessments();

    const handleStorage = () => {
      loadAssessments();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        !term ||
        [
          question.question,
          question.skill,
          question.source,
          question.questionId,
          question.category,
          question.topic,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(term)
          );

      const questionDifficulty = String(
        question.difficulty || ""
      ).toUpperCase();

      const matchesDifficulty =
        difficulty === "ALL" ||
        questionDifficulty === difficulty;

      return (
        matchesSearch &&
        matchesDifficulty
      );
    });
  }, [questions, search, difficulty]);

  const skillCount = useMemo(() => {
    return new Set(
      questions
        .map((item) => item.skill)
        .filter(Boolean)
    ).size;
  }, [questions]);

  const sourceCount = useMemo(() => {
    return new Set(
      questions
        .map((item) => item.source)
        .filter(Boolean)
    ).size;
  }, [questions]);

  const difficultyCount = useMemo(() => {
    return new Set(
      questions
        .map((item) =>
          String(item.difficulty || "").toUpperCase()
        )
        .filter(Boolean)
    ).size;
  }, [questions]);

  return (
    <div className="admin-student-assessments-page">
      <div className="student-assessments-header">
        <div>
          <div className="student-assessments-eyebrow">
            ADMINISTRATION
          </div>

          <h1>Student Assessments</h1>

          <p>
            View and manage assessment questions used
            across the student testing system.
          </p>
        </div>

        <button
          type="button"
          className="student-assessments-refresh"
          onClick={loadAssessments}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "student-assessments-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      <div className="student-assessments-summary">
        <div className="student-assessment-stat-card">
          <div className="student-assessment-stat-icon">
            <ClipboardCheck size={21} />
          </div>

          <div>
            <span>Total Questions</span>
            <strong>{questions.length}</strong>
          </div>
        </div>

        <div className="student-assessment-stat-card">
          <div className="student-assessment-stat-icon">
            <BookOpen size={21} />
          </div>

          <div>
            <span>Skills / Topics</span>
            <strong>{skillCount}</strong>
          </div>
        </div>

        <div className="student-assessment-stat-card">
          <div className="student-assessment-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Question Sources</span>
            <strong>{sourceCount}</strong>
          </div>
        </div>

        <div className="student-assessment-stat-card">
          <div className="student-assessment-stat-icon">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Difficulty Levels</span>
            <strong>{difficultyCount}</strong>
          </div>
        </div>
      </div>

      <div className="student-assessments-toolbar">
        <div className="student-assessments-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search questions, skills, topics..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={difficulty}
          onChange={(event) =>
            setDifficulty(event.target.value)
          }
          className="student-assessments-select"
        >
          <option value="ALL">
            All Difficulties
          </option>

          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">
            Intermediate
          </option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      <div className="student-assessments-section">
        <div className="student-assessments-section-header">
          <div>
            <h2>Assessment Questions</h2>

            <p>
              Showing {filteredQuestions.length} of{" "}
              {questions.length} questions
            </p>
          </div>

          <div className="student-assessments-result-count">
            {filteredQuestions.length} Results
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="student-assessments-empty">
            <div className="student-assessments-empty-icon">
              <ClipboardCheck size={28} />
            </div>

            <h3>No assessment questions found</h3>

            <p>
              Assessment and test question data will
              appear here when available in the platform
              storage.
            </p>

            {(search || difficulty !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDifficulty("ALL");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="student-assessments-table-wrapper">
            <table className="student-assessments-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Skill / Topic</th>
                  <th>Difficulty</th>
                  <th>Options</th>
                  <th>Source</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredQuestions.map(
                  (question, index) => {
                    const options =
                      getOptions(question);

                    return (
                      <tr
                        key={`${question.displayId}-${index}`}
                      >
                        <td>
                          <div className="assessment-question-cell">
                            <span className="assessment-question-id">
                              {question.displayId}
                            </span>

                            <span className="assessment-question-text">
                              {question.question}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="assessment-skill-badge">
                            {question.skill ||
                              question.topic ||
                              "General"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`assessment-difficulty-badge ${String(
                              question.difficulty ||
                                "unknown"
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {question.difficulty ||
                              "Not specified"}
                          </span>
                        </td>

                        <td>
                          <span className="assessment-options-count">
                            {options.length || "—"}
                          </span>
                        </td>

                        <td>
                          <span className="assessment-source">
                            {question.source ||
                              "Local Storage"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="assessment-view-button"
                            onClick={() =>
                              setSelectedQuestion(
                                question
                              )
                            }
                          >
                            <Eye size={16} />
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

      {selectedQuestion && (
        <div
          className="student-assessment-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedQuestion(null);
            }
          }}
        >
          <div className="student-assessment-modal">
            <div className="student-assessment-modal-header">
              <div>
                <span>ASSESSMENT QUESTION</span>
                <h2>
                  {selectedQuestion.displayId ||
                    selectedQuestion.questionId}
                </h2>
              </div>

              <button
                type="button"
                className="student-assessment-close"
                onClick={() =>
                  setSelectedQuestion(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="student-assessment-modal-content">
              <div className="assessment-detail-row">
                <span>Question</span>

                <strong>
                  {selectedQuestion.question}
                </strong>
              </div>

              <div className="assessment-detail-grid">
                <div className="assessment-detail-box">
                  <span>Skill / Topic</span>

                  <strong>
                    {selectedQuestion.skill ||
                      selectedQuestion.topic ||
                      "General"}
                  </strong>
                </div>

                <div className="assessment-detail-box">
                  <span>Difficulty</span>

                  <strong>
                    {selectedQuestion.difficulty ||
                      "Not specified"}
                  </strong>
                </div>

                <div className="assessment-detail-box">
                  <span>Source</span>

                  <strong>
                    {selectedQuestion.source ||
                      "Local Storage"}
                  </strong>
                </div>

                <div className="assessment-detail-box">
                  <span>Question ID</span>

                  <strong>
                    {selectedQuestion.questionId ||
                      selectedQuestion.id ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="assessment-options-section">
                <div className="assessment-options-heading">
                  <h3>Options</h3>
                </div>

                {getOptions(
                  selectedQuestion
                ).length > 0 ? (
                  <div className="assessment-options-list">
                    {getOptions(
                      selectedQuestion
                    ).map((option, index) => (
                      <div
                        className="assessment-option"
                        key={`${option}-${index}`}
                      >
                        <span>
                          {String.fromCharCode(
                            65 + index
                          )}
                        </span>

                        <p>{option}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="assessment-no-options">
                    No MCQ options are available
                    for this record.
                  </div>
                )}
              </div>

              {selectedQuestion.correctAnswer && (
                <div className="assessment-answer-box">
                  <CheckCircle2 size={18} />

                  <div>
                    <span>Correct Answer</span>

                    <strong>
                      {typeof selectedQuestion.correctAnswer ===
                      "object"
                        ? selectedQuestion
                            .correctAnswer.text ||
                          selectedQuestion
                            .correctAnswer.label ||
                          JSON.stringify(
                            selectedQuestion.correctAnswer
                          )
                        : String(
                            selectedQuestion.correctAnswer
                          )}
                    </strong>
                  </div>
                </div>
              )}

              <div className="assessment-storage-info">
                <span>Storage Source</span>

                <code>
                  {selectedQuestion.storageKey ||
                    "Unknown"}
                </code>
              </div>
            </div>

            <div className="student-assessment-modal-footer">
              <button
                type="button"
                onClick={() =>
                  setSelectedQuestion(null)
              }
              className="student-assessment-modal-close-button"
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

export default StudentAssessments;