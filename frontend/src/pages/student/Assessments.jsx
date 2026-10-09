import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock3,
  FileQuestion,
  Play,
  Trophy,
  CheckCircle,
} from "lucide-react";

import "./Assessments.css";


function Assessments() {
  const navigate = useNavigate();

  const [selectedFilter, setSelectedFilter] =
    useState("ALL");


  const assessments = [
    {
      id: "TEST-001",
      title: "Python Programming Assessment",
      skill: "Python",
      questions: 20,
      duration: 20,
      difficulty: "Medium",
      category: "Technical",
      attempts: 1,
      bestScore: 85,
      status: "AVAILABLE",
    },
    {
      id: "TEST-002",
      title: "JavaScript Fundamentals",
      skill: "JavaScript",
      questions: 20,
      duration: 20,
      difficulty: "Medium",
      category: "Technical",
      attempts: 0,
      bestScore: null,
      status: "AVAILABLE",
    },
    {
      id: "TEST-003",
      title: "React Development Assessment",
      skill: "React",
      questions: 15,
      duration: 15,
      difficulty: "Hard",
      category: "Technical",
      attempts: 2,
      bestScore: 78,
      status: "AVAILABLE",
    },
    {
      id: "TEST-004",
      title: "SQL & Database Assessment",
      skill: "SQL",
      questions: 20,
      duration: 20,
      difficulty: "Medium",
      category: "Technical",
      attempts: 1,
      bestScore: 92,
      status: "AVAILABLE",
    },
    {
      id: "TEST-005",
      title: "Problem Solving Assessment",
      skill: "Problem Solving",
      questions: 15,
      duration: 15,
      difficulty: "Hard",
      category: "Aptitude",
      attempts: 0,
      bestScore: null,
      status: "AVAILABLE",
    },
    {
      id: "TEST-006",
      title: "Communication Skills Assessment",
      skill: "Communication",
      questions: 15,
      duration: 15,
      difficulty: "Easy",
      category: "Soft Skills",
      attempts: 0,
      bestScore: null,
      status: "AVAILABLE",
    },
  ];


  const filteredAssessments =
    selectedFilter === "ALL"
      ? assessments
      : assessments.filter(
          (item) =>
            item.category === selectedFilter
        );


  const handleStartTest = (assessment) => {
    navigate(
      `/student/assessments/${assessment.id}`,
      {
        state: {
          assessment,
        },
      }
    );
  };


  return (
    <div className="assessments-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="assessments-header">

        <div>

          <span className="assessment-eyebrow">
            STUDENT ASSESSMENTS
          </span>

          <h1>
            Self Assessment Tests
          </h1>

          <p>
            Test your technical knowledge and
            prepare yourself for company interviews.
          </p>

        </div>

        <div className="assessment-header-icon">
          <BookOpen size={30} />
        </div>

      </div>


      {/* ======================================
          STATS
      ====================================== */}

      <div className="assessment-stats">

        <div className="assessment-stat-card">

          <div className="assessment-stat-icon">
            <FileQuestion size={21} />
          </div>

          <div>
            <span>
              Available Tests
            </span>

            <strong>
              {assessments.length}
            </strong>
          </div>

        </div>


        <div className="assessment-stat-card">

          <div className="assessment-stat-icon">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>
              Tests Attempted
            </span>

            <strong>
              {
                assessments.filter(
                  (item) =>
                    item.attempts > 0
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="assessment-stat-card">

          <div className="assessment-stat-icon">
            <Trophy size={21} />
          </div>

          <div>
            <span>
              Best Score
            </span>

            <strong>
              92%
            </strong>
          </div>

        </div>

      </div>


      {/* ======================================
          FILTER
      ====================================== */}

      <div className="assessment-filters">

        {[
          "ALL",
          "Technical",
          "Aptitude",
          "Soft Skills",
        ].map((filter) => (

          <button
            key={filter}
            className={
              selectedFilter === filter
                ? "assessment-filter active"
                : "assessment-filter"
            }
            onClick={() =>
              setSelectedFilter(filter)
            }
          >
            {filter === "ALL"
              ? "All Tests"
              : filter}
          </button>

        ))}

      </div>


      {/* ======================================
          TEST LIST
      ====================================== */}

      <div className="assessment-grid">

        {filteredAssessments.map(
          (assessment) => (

            <div
              className="assessment-card"
              key={assessment.id}
            >

              <div className="assessment-card-top">

                <div className="assessment-icon">
                  <BookOpen size={22} />
                </div>

                <span
                  className={`difficulty ${assessment.difficulty.toLowerCase()}`}
                >
                  {assessment.difficulty}
                </span>

              </div>


              <h2>
                {assessment.title}
              </h2>

              <p className="assessment-skill">
                Skill: {assessment.skill}
              </p>


              <div className="assessment-details">

                <div>
                  <FileQuestion size={16} />
                  <span>
                    {assessment.questions} Questions
                  </span>
                </div>

                <div>
                  <Clock3 size={16} />
                  <span>
                    {assessment.duration} Minutes
                  </span>
                </div>

              </div>


              <div className="assessment-result">

                <div>
                  <span>
                    Attempts
                  </span>

                  <strong>
                    {assessment.attempts}
                  </strong>
                </div>

                <div>
                  <span>
                    Best Score
                  </span>

                  <strong>
                    {assessment.bestScore !== null
                      ? `${assessment.bestScore}%`
                      : "--"}
                  </strong>
                </div>

              </div>


              <button
                className="start-assessment-button"
                onClick={() =>
                  handleStartTest(assessment)
                }
              >
                <Play size={17} />
                Start Assessment
              </button>

            </div>

          )
        )}

      </div>


      {filteredAssessments.length === 0 && (

        <div className="no-assessments">
          No assessments found.
        </div>

      )}

    </div>
  );
}


export default Assessments;