import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  Target,
  TrendingUp,
  Trophy,
  Video,
  Zap,
} from "lucide-react";

import { useState } from "react";

import "./Feedback.css";


function Feedback() {

  const [activeTab, setActiveTab] =
    useState("overview");


  /* =====================================================
     DEMO AI FEEDBACK DATA

     Later this will come from the AI/ML API.
  ===================================================== */

  const feedbackData = {

    overallScore: 86,

    interviewScore: 84,

    assessmentScore: 88,

    jobMatchScore: 92,


    strengths: [
      {
        title: "Technical Knowledge",
        score: 90,
        description:
          "You demonstrated strong understanding of programming fundamentals and technical concepts.",
      },

      {
        title: "Problem Solving",
        score: 87,
        description:
          "You were able to approach technical problems logically and explain your reasoning.",
      },

      {
        title: "Communication",
        score: 82,
        description:
          "Your answers were generally clear and relevant to the questions.",
      },

      {
        title: "Programming Skills",
        score: 91,
        description:
          "Your programming fundamentals show good readiness for technical roles.",
      },
    ],


    improvements: [
      {
        skill: "React",
        current: 35,
        target: 75,
        priority: "HIGH",
        description:
          "Improve React components, hooks, state management and frontend architecture.",
      },

      {
        skill: "REST API",
        current: 45,
        target: 75,
        priority: "HIGH",
        description:
          "Practice HTTP methods, API integration, JSON handling and authentication.",
      },

      {
        skill: "Machine Learning",
        current: 28,
        target: 65,
        priority: "MEDIUM",
        description:
          "Strengthen supervised learning, model evaluation and ML workflow concepts.",
      },
    ],


    interviewFeedback: [
      {
        question:
          "Explain the difference between a Python list and tuple.",
        result: "GOOD",
        comment:
          "Your answer correctly identified the main difference in mutability.",
      },

      {
        question:
          "How do you handle exceptions in Python?",
        result: "GOOD",
        comment:
          "You correctly discussed try, except and finally blocks.",
      },

      {
        question:
          "How would you remove duplicate values from a list?",
        result: "IMPROVE",
        comment:
          "Your approach worked, but the explanation could be more structured.",
      },

      {
        question:
          "Explain INNER JOIN and LEFT JOIN in SQL.",
        result: "GOOD",
        comment:
          "You demonstrated a good understanding of SQL joins.",
      },

      {
        question:
          "Tell us about a technical project you worked on.",
        result: "IMPROVE",
        comment:
          "Try using a structured explanation covering problem, technology, implementation and result.",
      },
    ],


    recommendations: [
      {
        icon: BookOpen,
        title: "Practice React",
        description:
          "Complete React component and hooks practice questions.",
        action:
          "/student/practice",
      },

      {
        icon: Target,
        title: "Improve REST API Skills",
        description:
          "Practice frontend-backend API integration concepts.",
        action:
          "/student/practice",
      },

      {
        icon: Video,
        title: "Practice Interviews",
        description:
          "Take another AI interview and improve answer structure.",
        action:
          "/student/ai-interview",
      },

      {
        icon: BarChart3,
        title: "Review Your Performance",
        description:
          "Check your detailed performance and skill scores.",
        action:
          "/student/performance",
      },
    ],
  };


  /* =====================================================
     TAB DATA
  ===================================================== */

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
    },

    {
      id: "interview",
      label: "Interview Feedback",
      icon: Video,
    },

    {
      id: "improvements",
      label: "Improvement Areas",
      icon: Target,
    },
  ];


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleRecommendation = (path) => {
    window.location.href = path;
  };


  /* =====================================================
     SCORE COLOR
  ===================================================== */

  const getScoreClass = (score) => {

    if (score >= 85) {
      return "feedback-score-excellent";
    }

    if (score >= 70) {
      return "feedback-score-good";
    }

    return "feedback-score-low";
  };


  return (
    <div className="student-feedback-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <section className="feedback-header">

        <div>

          <div className="feedback-kicker">
            AI CAREER ANALYSIS
          </div>

          <h1>
            Your Feedback
          </h1>

          <p>
            Review your assessment and interview
            performance with AI-powered improvement
            recommendations.
          </p>

        </div>


        <div className="feedback-header-badge">

          <Zap size={17} />

          <span>
            AI Generated
          </span>

        </div>

      </section>


      {/* =================================================
          OVERALL SCORE
      ================================================= */}

      <section className="feedback-score-section">

        <div className="feedback-main-score-card">

          <div className="feedback-score-circle">

            <div className="feedback-score-circle-inner">

              <strong>
                {feedbackData.overallScore}%
              </strong>

              <span>
                Overall
              </span>

            </div>

          </div>


          <div className="feedback-score-content">

            <div className="feedback-score-label">
              OVERALL PERFORMANCE
            </div>

            <h2>
              Strong Career Readiness
            </h2>

            <p>
              Your current performance shows a good
              foundation for technical job opportunities.
              Focus on the identified skill gaps to
              improve your job readiness.
            </p>


            <div className="feedback-score-meta">

              <span>
                <CheckCircle2 size={15} />
                Technical foundation
              </span>

              <span>
                <TrendingUp size={15} />
                Improvement potential
              </span>

              <span>
                <Award size={15} />
                Interview readiness
              </span>

            </div>

          </div>

        </div>


        {/* SCORE MINI CARDS */}

        <div className="feedback-mini-scores">

          <div className="feedback-mini-card">

            <div className="feedback-mini-icon blue">
              <BookOpen size={19} />
            </div>

            <span>
              Assessment
            </span>

            <strong>
              {feedbackData.assessmentScore}%
            </strong>

          </div>


          <div className="feedback-mini-card">

            <div className="feedback-mini-icon purple">
              <Video size={19} />
            </div>

            <span>
              Interview
            </span>

            <strong>
              {feedbackData.interviewScore}%
            </strong>

          </div>


          <div className="feedback-mini-card">

            <div className="feedback-mini-icon green">
              <Target size={19} />
            </div>

            <span>
              Job Match
            </span>

            <strong>
              {feedbackData.jobMatchScore}%
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          TABS
      ================================================= */}

      <div className="feedback-tabs">

        {tabs.map((tab) => {

          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id
                  ? "feedback-tab active"
                  : "feedback-tab"
              }
              onClick={() =>
                setActiveTab(tab.id)
              }
            >

              <Icon size={17} />

              <span>
                {tab.label}
              </span>

            </button>
          );

        })}

      </div>


      {/* =================================================
          OVERVIEW
      ================================================= */}

      {activeTab === "overview" && (

        <div className="feedback-content-grid">


          {/* STRENGTHS */}

          <section className="feedback-panel">

            <div className="feedback-panel-header">

              <div className="feedback-panel-icon green">
                <Trophy size={18} />
              </div>

              <div>

                <h2>
                  Your Strengths
                </h2>

                <p>
                  Areas where you are performing well.
                </p>

              </div>

            </div>


            <div className="feedback-strength-list">

              {feedbackData.strengths.map(
                (item) => (

                  <div
                    className="feedback-strength-item"
                    key={item.title}
                  >

                    <div className="feedback-strength-top">

                      <div>

                        <strong>
                          {item.title}
                        </strong>

                        <p>
                          {item.description}
                        </p>

                      </div>

                      <span
                        className={
                          `feedback-strength-score ${
                            getScoreClass(
                              item.score
                            )
                          }`
                        }
                      >
                        {item.score}%
                      </span>

                    </div>


                    <div className="feedback-progress">

                      <div
                        className="feedback-progress-fill"
                        style={{
                          width:
                            `${item.score}%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* AI SUMMARY */}

          <section className="feedback-panel">

            <div className="feedback-panel-header">

              <div className="feedback-panel-icon blue">
                <MessageSquare size={18} />
              </div>

              <div>

                <h2>
                  AI Performance Summary
                </h2>

                <p>
                  Personalized feedback based on
                  your recent performance.
                </p>

              </div>

            </div>


            <div className="feedback-ai-summary">

              <div className="feedback-ai-summary-icon">
                <Lightbulb size={22} />
              </div>

              <p>
                You have a strong foundation in
                programming and technical problem
                solving. Your assessment performance
                indicates that you understand many
                core concepts.
              </p>

              <p>
                The main opportunity for improvement
                is expanding your practical skills in
                React, REST APIs and Machine Learning.
                Structured interview answers can also
                improve your communication score.
              </p>

              <p>
                Continue practicing skill-specific
                questions and complete additional AI
                interviews to track your progress.
              </p>

            </div>

          </section>


          {/* RECOMMENDATIONS */}

          <section className="feedback-panel feedback-panel-full">

            <div className="feedback-panel-header">

              <div className="feedback-panel-icon orange">
                <Lightbulb size={18} />
              </div>

              <div>

                <h2>
                  Recommended Next Steps
                </h2>

                <p>
                  Actions that can help improve your
                  career readiness.
                </p>

              </div>

            </div>


            <div className="feedback-recommendations">

              {feedbackData.recommendations.map(
                (item) => {

                  const Icon = item.icon;

                  return (
                    <button
                      type="button"
                      className="feedback-recommendation"
                      key={item.title}
                      onClick={() =>
                        handleRecommendation(
                          item.action
                        )
                      }
                    >

                      <div className="feedback-recommendation-icon">
                        <Icon size={19} />
                      </div>

                      <div className="feedback-recommendation-content">

                        <strong>
                          {item.title}
                        </strong>

                        <p>
                          {item.description}
                        </p>

                      </div>

                      <ChevronRight size={18} />

                    </button>
                  );

                }
              )}

            </div>

          </section>

        </div>

      )}


      {/* =================================================
          INTERVIEW FEEDBACK
      ================================================= */}

      {activeTab === "interview" && (

        <section className="feedback-panel feedback-interview-panel">

          <div className="feedback-panel-header">

            <div className="feedback-panel-icon purple">
              <Video size={18} />
            </div>

            <div>

              <h2>
                AI Interview Feedback
              </h2>

              <p>
                Question-by-question feedback from
                your latest interview.
              </p>

            </div>

          </div>


          <div className="feedback-interview-summary">

            <div>
              <span>
                Interview Score
              </span>

              <strong>
                {feedbackData.interviewScore}%
              </strong>
            </div>

            <div>
              <span>
                Questions
              </span>

              <strong>
                {feedbackData.interviewFeedback.length}
              </strong>
            </div>

            <div>
              <span>
                Strong Answers
              </span>

              <strong>
                {
                  feedbackData.interviewFeedback
                    .filter(
                      (item) =>
                        item.result === "GOOD"
                    )
                    .length
                }
              </strong>
            </div>

          </div>


          <div className="feedback-question-list">

            {feedbackData.interviewFeedback.map(
              (item, index) => (

                <div
                  className="feedback-question-item"
                  key={index}
                >

                  <div className="feedback-question-number">
                    {index + 1}
                  </div>


                  <div className="feedback-question-content">

                    <h3>
                      {item.question}
                    </h3>

                    <p>
                      {item.comment}
                    </p>

                  </div>


                  <span
                    className={
                      item.result === "GOOD"
                        ? "answer-result good"
                        : "answer-result improve"
                    }
                  >
                    {item.result === "GOOD"
                      ? "Good"
                      : "Improve"}
                  </span>

                </div>

              )
            )}

          </div>

        </section>

      )}


      {/* =================================================
          IMPROVEMENTS
      ================================================= */}

      {activeTab === "improvements" && (

        <section className="feedback-panel">

          <div className="feedback-panel-header">

            <div className="feedback-panel-icon orange">
              <Target size={18} />
            </div>

            <div>

              <h2>
                Improvement Areas
              </h2>

              <p>
                Skills that can increase your career
                readiness when improved.
              </p>

            </div>

          </div>


          <div className="feedback-improvement-list">

            {feedbackData.improvements.map(
              (item) => (

                <div
                  className="feedback-improvement-card"
                  key={item.skill}
                >

                  <div className="feedback-improvement-top">

                    <div>

                      <h3>
                        {item.skill}
                      </h3>

                      <p>
                        {item.description}
                      </p>

                    </div>

                    <span
                      className={
                        `feedback-priority ${
                          item.priority.toLowerCase()
                        }`
                      }
                    >
                      {item.priority}
                    </span>

                  </div>


                  <div className="feedback-improvement-score">

                    <div>

                      <span>
                        Current Level
                      </span>

                      <strong>
                        {item.current}%
                      </strong>

                    </div>


                    <div>

                      <span>
                        Target
                      </span>

                      <strong>
                        {item.target}%
                      </strong>

                    </div>

                  </div>


                  <div className="feedback-improvement-progress">

                    <div
                      className="feedback-improvement-current"
                      style={{
                        width:
                          `${item.current}%`,
                      }}
                    />

                    <div
                      className="feedback-improvement-target"
                      style={{
                        left:
                          `${item.target}%`,
                      }}
                    />

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      handleRecommendation(
                        "/student/practice"
                      )
                    }
                  >
                    Practice This Skill
                    <ChevronRight size={16} />
                  </button>

                </div>

              )
            )}

          </div>

        </section>

      )}


      {/* =================================================
          FOOTER NOTE
      ================================================= */}

      <div className="feedback-footer-note">

        <Zap size={16} />

        <span>
          AI feedback shown here is currently demo
          data. It will be connected to the CampusLink
          AI/ML evaluation API during backend integration.
        </span>

      </div>

    </div>
  );
}

export default Feedback;