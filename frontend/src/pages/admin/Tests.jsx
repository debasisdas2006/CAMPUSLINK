import { useMemo, useState } from "react";
import {
  FileQuestion,
  Search,
  RefreshCw,
  Eye,
  X,
  CheckCircle2,
  Circle,
} from "lucide-react";

import "./Tests.css";

const readJSON = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const getQuestionCollections = () => {
  const collections = [];

  Object.keys(localStorage).forEach((key) => {
    if (
      !key.includes("question") &&
      !key.includes("test")
    ) {
      return;
    }

    const data = readJSON(key, null);

    if (!data) return;

    if (Array.isArray(data)) {
      data.forEach((question, index) => {
        if (
          typeof question === "object" &&
          question !== null
        ) {
          collections.push({
            ...question,
            __source: key,
            __index: index,
          });
        }
      });
    } else if (typeof data === "object") {
      collections.push({
        ...data,
        __source: key,
      });
    }
  });

  return collections;
};

const normalizeOptions = (question) => {
  if (Array.isArray(question?.options)) {
    return question.options;
  }

  if (Array.isArray(question?.choices)) {
    return question.choices;
  }

  return [];
};

const getQuestionText = (question) => {
  return (
    question?.question ||
    question?.questionText ||
    question?.text ||
    question?.title ||
    "Question text unavailable"
  );
};

const getCorrectAnswer = (question) => {
  return (
    question?.correctAnswer ??
    question?.correct_answer ??
    question?.answer ??
    question?.correctOption ??
    null
  );
};

function Tests() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("ALL");
  const [selectedQuestion, setSelectedQuestion] =
    useState(null);

  const questions = useMemo(
    () => getQuestionCollections(),
    [refreshKey]
  );

  const skills = useMemo(() => {
    const values = new Set();

    questions.forEach((question) => {
      const skill =
        question?.skill ||
        question?.category ||
        question?.topic;

      if (skill) {
        values.add(String(skill));
      }
    });

    return ["ALL", ...Array.from(values).sort()];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return questions.filter((question) => {
      const text = getQuestionText(question);

      const skill = String(
        question?.skill ||
          question?.category ||
          question?.topic ||
          ""
      );

      const matchesSearch =
        !searchValue ||
        text.toLowerCase().includes(searchValue) ||
        skill.toLowerCase().includes(searchValue);

      const matchesSkill =
        skillFilter === "ALL" ||
        skill === skillFilter;

      return matchesSearch && matchesSkill;
    });
  }, [questions, search, skillFilter]);

  return (
    <div className="admin-tests-page">
      <div className="tests-header">
        <div>
          <div className="tests-eyebrow">
            ADMIN / TEST MANAGEMENT
          </div>

          <h1>Manage Tests</h1>

          <p>
            Monitor CampusLink assessment and interview
            question data.
          </p>
        </div>

        <button
          className="tests-refresh-button"
          onClick={() =>
            setRefreshKey((value) => value + 1)
          }
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <section className="tests-summary-grid">
        <div className="tests-summary-card">
          <div className="tests-summary-icon">
            <FileQuestion size={22} />
          </div>

          <div>
            <span>Total Questions</span>
            <strong>{questions.length}</strong>
          </div>
        </div>

        <div className="tests-summary-card">
          <div className="tests-summary-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Question Sources</span>
            <strong>
              {
                new Set(
                  questions.map(
                    (question) => question.__source
                  )
                ).size
              }
            </strong>
          </div>
        </div>

        <div className="tests-summary-card">
          <div className="tests-summary-icon">
            <Circle size={22} />
          </div>

          <div>
            <span>Skills / Topics</span>
            <strong>
              {Math.max(skills.length - 1, 0)}
            </strong>
          </div>
        </div>
      </section>

      <section className="tests-toolbar">
        <div className="tests-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search questions or skills..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={skillFilter}
          onChange={(event) =>
            setSkillFilter(event.target.value)
          }
        >
          {skills.map((skill) => (
            <option key={skill} value={skill}>
              {skill === "ALL"
                ? "All Skills"
                : skill}
            </option>
          ))}
        </select>
      </section>

      <section className="tests-panel">
        <div className="tests-panel-header">
          <div>
            <span>QUESTION BANK</span>
            <h2>
              {filteredQuestions.length} Questions
            </h2>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="tests-empty">
            <FileQuestion size={38} />

            <h3>No questions found</h3>

            <p>
              No assessment question data was found in
              the current frontend storage.
            </p>
          </div>
        ) : (
          <div className="tests-table-wrapper">
            <table className="tests-table">
              <thead>
                <tr>
                  <th>#</th>
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
                      normalizeOptions(question);

                    return (
                      <tr
                        key={`${question.__source}-${question.__index ?? index}`}
                      >
                        <td>{index + 1}</td>

                        <td className="question-cell">
                          {getQuestionText(question)}
                        </td>

                        <td>
                          {question?.skill ||
                            question?.category ||
                            question?.topic ||
                            "—"}
                        </td>

                        <td>
                          {question?.difficulty ||
                            "—"}
                        </td>

                        <td>{options.length || "—"}</td>

                        <td className="source-cell">
                          {question.__source}
                        </td>

                        <td>
                          <button
                            className="view-question-button"
                            onClick={() =>
                              setSelectedQuestion(
                                question
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

      {selectedQuestion && (
        <div
          className="question-modal-overlay"
          onClick={() => setSelectedQuestion(null)}
        >
          <div
            className="question-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="question-modal-header">
              <div>
                <span>QUESTION DETAILS</span>
                <h2>MCQ Question</h2>
              </div>

              <button
                onClick={() =>
                  setSelectedQuestion(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="question-modal-body">
              <div className="question-detail-block">
                <label>Question</label>

                <p>
                  {getQuestionText(
                    selectedQuestion
                  )}
                </p>
              </div>

              <div className="question-detail-grid">
                <div>
                  <label>Skill / Topic</label>
                  <strong>
                    {selectedQuestion?.skill ||
                      selectedQuestion?.category ||
                      selectedQuestion?.topic ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <label>Difficulty</label>
                  <strong>
                    {selectedQuestion?.difficulty ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="question-detail-block">
                <label>Options</label>

                <div className="question-options">
                  {normalizeOptions(
                    selectedQuestion
                  ).length === 0 ? (
                    <p>No options available.</p>
                  ) : (
                    normalizeOptions(
                      selectedQuestion
                    ).map((option, index) => (
                      <div
                        className="question-option"
                        key={index}
                      >
                        <span>
                          {String.fromCharCode(
                            65 + index
                          )}
                        </span>

                        <p>
                          {typeof option ===
                          "object"
                            ? option?.text ||
                              option?.label ||
                              option?.value ||
                              JSON.stringify(
                                option
                              )
                            : option}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="question-detail-block">
                <label>Correct Answer</label>

                <div className="correct-answer-box">
                  {getCorrectAnswer(
                    selectedQuestion
                  ) !== null
                    ? String(
                        getCorrectAnswer(
                          selectedQuestion
                        )
                      )
                    : "Not available"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tests;