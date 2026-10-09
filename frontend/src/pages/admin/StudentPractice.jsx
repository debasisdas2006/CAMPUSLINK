import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  RefreshCw,
  Eye,
  X,
  Brain,
  Code2,
  Layers3,
  CheckCircle2,
  ListChecks,
} from "lucide-react";

import "./StudentPractice.css";

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeOption(option) {
  if (typeof option === "string") {
    return option;
  }

  if (option && typeof option === "object") {
    return (
      option.text ||
      option.label ||
      option.value ||
      option.option ||
      option.answer ||
      ""
    );
  }

  return "";
}

function getOptions(question) {
  const possibleOptions =
    question?.options ||
    question?.choices ||
    question?.answers ||
    question?.mcqOptions ||
    [];

  if (Array.isArray(possibleOptions)) {
    return possibleOptions
      .map(normalizeOption)
      .filter(Boolean);
  }

  if (
    possibleOptions &&
    typeof possibleOptions === "object"
  ) {
    return Object.values(possibleOptions)
      .map(normalizeOption)
      .filter(Boolean);
  }

  return [];
}

function extractQuestions(
  value,
  sourceKey,
  result = [],
  inherited = {}
) {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      extractQuestions(
        item,
        sourceKey,
        result,
        inherited
      );
    });

    return result;
  }

  if (!value || typeof value !== "object") {
    return result;
  }

  const questionText =
    value.question ||
    value.questionText ||
    value.text ||
    value.prompt ||
    "";

  const hasQuestion =
    typeof questionText === "string" &&
    questionText.trim().length > 0;

  if (hasQuestion) {
    result.push({
      ...value,

      question:
        questionText.trim(),

      questionId:
        value.questionId ||
        value.question_id ||
        value.id ||
        `PRACTICE-${result.length + 1}`,

      skill:
        value.skill ||
        value.skillName ||
        value.topic ||
        value.category ||
        inherited.skill ||
        "General",

      topic:
        value.topic ||
        value.category ||
        value.skill ||
        inherited.topic ||
        "General",

      difficulty:
        value.difficulty ||
        value.level ||
        inherited.difficulty ||
        "Not specified",

      source:
        value.source ||
        value.sourceName ||
        sourceKey,

      storageKey:
        sourceKey,
    });
  }

  Object.entries(value).forEach(
    ([key, child]) => {
      if (
        [
          "question",
          "questionText",
          "text",
          "prompt",
          "options",
          "choices",
          "answers",
          "mcqOptions",
          "correctAnswer",
          "correct_answer",
        ].includes(key)
      ) {
        return;
      }

      if (
        Array.isArray(child) ||
        (child &&
          typeof child === "object")
      ) {
        extractQuestions(
          child,
          sourceKey,
          result,
          {
            ...inherited,

            skill:
              value.skill ||
              value.skillName ||
              value.topic ||
              inherited.skill,

            topic:
              value.topic ||
              value.category ||
              inherited.topic,

            difficulty:
              value.difficulty ||
              value.level ||
              inherited.difficulty,

            source:
              value.source ||
              value.sourceName ||
              inherited.source,
          }
        );
      }
    }
  );

  return result;
}

function getCorrectAnswer(question) {
  return (
    question?.correctAnswer ??
    question?.correct_answer ??
    question?.answer ??
    question?.correctOption ??
    question?.correct_option ??
    question?.solution ??
    null
  );
}

function getDifficultyClass(
  difficulty
) {
  const value = String(
    difficulty || "unknown"
  )
    .toLowerCase()
    .replace(/\s+/g, "-");

  if (
    value === "easy" ||
    value === "beginner"
  ) {
    return "easy";
  }

  if (
    value === "medium" ||
    value === "intermediate"
  ) {
    return "medium";
  }

  if (
    value === "hard" ||
    value === "advanced"
  ) {
    return "hard";
  }

  return "unknown";
}

function StudentPractice() {
  const [questions, setQuestions] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("ALL");

  const [skillFilter, setSkillFilter] =
    useState("ALL");

  const [selectedQuestion, setSelectedQuestion] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const loadPracticeQuestions =
    () => {
      setLoading(true);

      const collected = [];

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

        /*
         * Practice-specific storage
         * is preferred, but question
         * storage is also inspected
         * because practice questions
         * may be stored together with
         * generated questions.
         */
        if (
          !lowerKey.includes(
            "practice"
          ) &&
          !lowerKey.includes(
            "question"
          )
        ) {
          continue;
        }

        const raw =
          localStorage.getItem(key);

        if (!raw) continue;

        const parsed =
          safeParse(raw);

        if (parsed === null) {
          continue;
        }

        extractQuestions(
          parsed,
          key,
          collected
        );
      }

      /*
       * Remove duplicate records.
       */
      const unique = [];
      const seen = new Set();

      collected.forEach(
        (question, index) => {
          const identity = [
            question.questionId,
            question.question,
            question.skill,
            question.storageKey,
          ]
            .join("|")
            .toLowerCase();

          if (seen.has(identity)) {
            return;
          }

          seen.add(identity);

          unique.push({
            ...question,
            displayId:
              question.questionId ||
              `PRACTICE-${index + 1}`,
          });
        }
      );

      setQuestions(unique);
      setLoading(false);
    };

  useEffect(() => {
    loadPracticeQuestions();

    const handleStorage =
      () => loadPracticeQuestions();

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "campuslink_practice_updated",
      handleStorage
    );

    window.addEventListener(
      "campuslink_questions_updated",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_practice_updated",
        handleStorage
      );

      window.removeEventListener(
        "campuslink_questions_updated",
        handleStorage
      );
    };
  }, []);

  const skills = useMemo(() => {
    const values =
      questions
        .map(
          (question) =>
            question.skill ||
            question.topic
        )
        .filter(Boolean);

    return Array.from(
      new Set(values)
    ).sort((a, b) =>
      String(a).localeCompare(
        String(b)
      )
    );
  }, [questions]);

  const filteredQuestions =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return questions.filter(
        (question) => {
          const searchable = [
            question.question,
            question.skill,
            question.topic,
            question.source,
            question.questionId,
            question.category,
          ]
            .filter(Boolean)
            .map((value) =>
              String(value).toLowerCase()
            );

          const matchesSearch =
            !term ||
            searchable.some(
              (value) =>
                value.includes(term)
            );

          const normalizedDifficulty =
            String(
              question.difficulty ||
                ""
            ).toUpperCase();

          const matchesDifficulty =
            difficulty === "ALL" ||
            normalizedDifficulty ===
              difficulty;

          const questionSkill =
            String(
              question.skill ||
                question.topic ||
                ""
            );

          const matchesSkill =
            skillFilter === "ALL" ||
            questionSkill ===
              skillFilter;

          return (
            matchesSearch &&
            matchesDifficulty &&
            matchesSkill
          );
        }
      );
    }, [
      questions,
      search,
      difficulty,
      skillFilter,
    ]);

  const totalOptions =
    useMemo(() => {
      return questions.reduce(
        (total, question) =>
          total +
          getOptions(question).length,
        0
      );
    }, [questions]);

  const questionsWithAnswers =
    useMemo(() => {
      return questions.filter(
        (question) =>
          getCorrectAnswer(
            question
          ) !== null &&
          getCorrectAnswer(
            question
          ) !== undefined &&
          String(
            getCorrectAnswer(
              question
            )
          ).trim() !== ""
      ).length;
    }, [questions]);

  const easyQuestions =
    questions.filter(
      (question) => {
        const value = String(
          question.difficulty ||
            ""
        ).toLowerCase();

        return (
          value === "easy" ||
          value === "beginner"
        );
      }
    ).length;

  const advancedQuestions =
    questions.filter(
      (question) => {
        const value = String(
          question.difficulty ||
            ""
        ).toLowerCase();

        return (
          value === "hard" ||
          value === "advanced"
        );
      }
    ).length;

  return (
    <div className="admin-student-practice-page">
      <div className="student-practice-header">
        <div>
          <div className="student-practice-eyebrow">
            ADMINISTRATION
          </div>

          <h1>
            Student Practice
          </h1>

          <p>
            Monitor the skill-wise
            practice questions
            available to students.
          </p>
        </div>

        <button
          type="button"
          className="student-practice-refresh"
          onClick={
            loadPracticeQuestions
          }
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "student-practice-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      <div className="student-practice-summary">
        <div className="practice-stat-card">
          <div className="practice-stat-icon">
            <BookOpen size={21} />
          </div>

          <div>
            <span>
              Practice Questions
            </span>

            <strong>
              {questions.length}
            </strong>
          </div>
        </div>

        <div className="practice-stat-card">
          <div className="practice-stat-icon">
            <Layers3 size={21} />
          </div>

          <div>
            <span>
              Skills / Topics
            </span>

            <strong>
              {skills.length}
            </strong>
          </div>
        </div>

        <div className="practice-stat-card">
          <div className="practice-stat-icon">
            <ListChecks size={21} />
          </div>

          <div>
            <span>
              Questions With Answers
            </span>

            <strong>
              {questionsWithAnswers}
            </strong>
          </div>
        </div>

        <div className="practice-stat-card">
          <div className="practice-stat-icon">
            <Code2 size={21} />
          </div>

          <div>
            <span>
              Total Options
            </span>

            <strong>
              {totalOptions}
            </strong>
          </div>
        </div>
      </div>

      <div className="practice-secondary-stats">
        <div>
          <Brain size={17} />

          <span>
            Easy / Beginner
          </span>

          <strong>
            {easyQuestions}
          </strong>
        </div>

        <div>
          <Code2 size={17} />

          <span>
            Hard / Advanced
          </span>

          <strong>
            {advancedQuestions}
          </strong>
        </div>

        <div>
          <BookOpen size={17} />

          <span>
            Showing
          </span>

          <strong>
            {filteredQuestions.length}
          </strong>
        </div>
      </div>

      <div className="student-practice-toolbar">
        <div className="student-practice-search">
          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search questions, skills, topics..."
          />
        </div>

        <select
          className="student-practice-select"
          value={skillFilter}
          onChange={(event) =>
            setSkillFilter(
              event.target.value
            )
          }
        >
          <option value="ALL">
            All Skills
          </option>

          {skills.map((skill) => (
            <option
              key={skill}
              value={skill}
            >
              {skill}
            </option>
          ))}
        </select>

        <select
          className="student-practice-select difficulty-select"
          value={difficulty}
          onChange={(event) =>
            setDifficulty(
              event.target.value
            )
          }
        >
          <option value="ALL">
            All Difficulties
          </option>

          <option value="EASY">
            Easy
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="HARD">
            Hard
          </option>

          <option value="BEGINNER">
            Beginner
          </option>

          <option value="INTERMEDIATE">
            Intermediate
          </option>

          <option value="ADVANCED">
            Advanced
          </option>
        </select>
      </div>

      <div className="student-practice-section">
        <div className="student-practice-section-header">
          <div>
            <h2>
              Practice Question Bank
            </h2>

            <p>
              Questions available
              for student skill
              practice.
            </p>
          </div>

          <span>
            {filteredQuestions.length}{" "}
            Questions
          </span>
        </div>

        {filteredQuestions.length ===
        0 ? (
          <div className="student-practice-empty">
            <div className="student-practice-empty-icon">
              <BookOpen size={28} />
            </div>

            <h3>
              No practice questions
              found
            </h3>

            <p>
              Practice questions
              will appear here when
              they are generated or
              stored by the student
              practice system.
            </p>

            {(search ||
              difficulty !==
                "ALL" ||
              skillFilter !==
                "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDifficulty(
                    "ALL"
                  );
                  setSkillFilter(
                    "ALL"
                  );
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="student-practice-table-wrapper">
            <table className="student-practice-table">
              <thead>
                <tr>
                  <th>
                    Question
                  </th>

                  <th>
                    Skill
                  </th>

                  <th>
                    Difficulty
                  </th>

                  <th>
                    Options
                  </th>

                  <th>
                    Answer
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredQuestions.map(
                  (
                    question,
                    index
                  ) => {
                    const options =
                      getOptions(
                        question
                      );

                    const answer =
                      getCorrectAnswer(
                        question
                      );

                    return (
                      <tr
                        key={`${question.displayId}-${index}`}
                      >
                        <td>
                          <div className="practice-question-cell">
                            <span className="practice-question-id">
                              {
                                question.displayId
                              }
                            </span>

                            <strong>
                              {
                                question.question
                              }
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="practice-skill-badge">
                            {question.skill ||
                              question.topic ||
                              "General"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`practice-difficulty-badge ${getDifficultyClass(
                              question.difficulty
                            )}`}
                          >
                            {question.difficulty ||
                              "Not specified"}
                          </span>
                        </td>

                        <td>
                          <span className="practice-option-count">
                            {options.length ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          {answer !==
                            null &&
                          answer !==
                            undefined &&
                          String(
                            answer
                          ).trim() ? (
                            <span className="practice-answer-available">
                              <CheckCircle2
                                size={14}
                              />

                              Available
                            </span>
                          ) : (
                            <span className="practice-answer-unavailable">
                              Not available
                            </span>
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="practice-view-button"
                            onClick={() =>
                              setSelectedQuestion(
                                question
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

      {selectedQuestion && (
        <div
          className="student-practice-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedQuestion(
                null
              );
            }
          }}
        >
          <div className="student-practice-modal">
            <div className="student-practice-modal-header">
              <div>
                <span>
                  STUDENT PRACTICE
                </span>

                <h2>
                  {
                    selectedQuestion.displayId
                  }
                </h2>
              </div>

              <button
                type="button"
                className="student-practice-close"
                onClick={() =>
                  setSelectedQuestion(
                    null
                  )
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="student-practice-modal-content">
              <div className="practice-question-detail">
                <span>
                  Question
                </span>

                <strong>
                  {
                    selectedQuestion.question
                  }
                </strong>
              </div>

              <div className="practice-detail-grid">
                <div>
                  <span>
                    Skill
                  </span>

                  <strong>
                    {selectedQuestion.skill ||
                      selectedQuestion.topic ||
                      "General"}
                  </strong>
                </div>

                <div>
                  <span>
                    Difficulty
                  </span>

                  <strong>
                    {selectedQuestion.difficulty ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>
                    Question ID
                  </span>

                  <strong>
                    {
                      selectedQuestion.questionId
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Source
                  </span>

                  <strong>
                    {
                      selectedQuestion.source ||
                      "Local Storage"
                    }
                  </strong>
                </div>
              </div>

              <div className="practice-options-section">
                <h3>
                  Options
                </h3>

                {getOptions(
                  selectedQuestion
                ).length > 0 ? (
                  <div className="practice-options-list">
                    {getOptions(
                      selectedQuestion
                    ).map(
                      (
                        option,
                        index
                      ) => (
                        <div
                          className="practice-option"
                          key={`${option}-${index}`}
                        >
                          <span>
                            {String.fromCharCode(
                              65 +
                                index
                            )}
                          </span>

                          <p>
                            {option}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="practice-no-options">
                    This practice
                    question does
                    not contain
                    MCQ options.
                  </div>
                )}
              </div>

              {getCorrectAnswer(
                selectedQuestion
              ) !== null &&
                getCorrectAnswer(
                  selectedQuestion
                ) !==
                  undefined &&
                String(
                  getCorrectAnswer(
                    selectedQuestion
                  )
                ).trim() && (
                  <div className="practice-correct-answer">
                    <CheckCircle2
                      size={19}
                    />

                    <div>
                      <span>
                        Correct Answer
                      </span>

                      <strong>
                        {typeof getCorrectAnswer(
                          selectedQuestion
                        ) ===
                        "object"
                          ? getCorrectAnswer(
                              selectedQuestion
                            ).text ||
                            getCorrectAnswer(
                              selectedQuestion
                            ).label ||
                            JSON.stringify(
                              getCorrectAnswer(
                                selectedQuestion
                              )
                            )
                          : String(
                              getCorrectAnswer(
                                selectedQuestion
                              )
                            )}
                      </strong>
                    </div>
                  </div>
                )}

              <div className="practice-storage-info">
                <span>
                  Storage Source
                </span>

                <code>
                  {
                    selectedQuestion.storageKey
                  }
                </code>
              </div>
            </div>

            <div className="student-practice-modal-footer">
              <button
                type="button"
                onClick={() =>
                  setSelectedQuestion(
                    null
                  )
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

export default StudentPractice;