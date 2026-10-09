import { useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Target,
  TrendingUp,
  Award,
} from "lucide-react";

import "./SkillGap.css";

function SkillGap() {
  // Temporary frontend data.
  // Later this will come from the AI/ML API on port 8002.
  const skillData = {
    matchedSkills: [
      "Python",
      "SQL",
      "Git",
      "Problem Solving",
    ],

    missingSkills: [
      "React",
      "REST API",
      "Machine Learning",
    ],

    skillProgress: [
      {
        skill: "Python",
        score: 90,
        level: "Advanced",
      },
      {
        skill: "SQL",
        score: 75,
        level: "Intermediate",
      },
      {
        skill: "Git",
        score: 82,
        level: "Intermediate",
      },
      {
        skill: "React",
        score: 35,
        level: "Beginner",
      },
      {
        skill: "REST API",
        score: 45,
        level: "Beginner",
      },
      {
        skill: "Machine Learning",
        score: 28,
        level: "Beginner",
      },
    ],

    recommendations: [
      {
        skill: "React",
        priority: "HIGH",
        description:
          "Improve React fundamentals, components, hooks and state management.",
        reason:
          "Required by several frontend and full-stack job roles.",
      },
      {
        skill: "REST API",
        priority: "HIGH",
        description:
          "Learn API concepts, HTTP methods, JSON and frontend-backend integration.",
        reason:
          "Useful for connecting applications with backend services.",
      },
      {
        skill: "Machine Learning",
        priority: "MEDIUM",
        description:
          "Learn supervised learning, model evaluation and basic ML workflows.",
        reason:
          "Can improve your suitability for AI/ML-related positions.",
      },
    ],
  };

  const overallProgress = useMemo(() => {
    if (!skillData.skillProgress.length) {
      return 0;
    }

    const total = skillData.skillProgress.reduce(
      (sum, item) => sum + item.score,
      0
    );

    return Math.round(
      total / skillData.skillProgress.length
    );
  }, [skillData.skillProgress]);

  return (
    <div className="skill-gap-page">

      {/* HEADER */}
      <section className="skill-gap-header">
        <div>
          <span className="skill-gap-eyebrow">
            AI CAREER ANALYSIS
          </span>

          <h1>
            Skill Gap Analysis
          </h1>

          <p>
            Understand your current skills, identify missing
            skills and discover what you should learn next.
          </p>
        </div>

        <div className="overall-skill-card">
          <div className="overall-icon">
            <Target size={24} />
          </div>

          <div>
            <span>
              Overall Skill Progress
            </span>

            <strong>
              {overallProgress}%
            </strong>
          </div>
        </div>
      </section>


      {/* SUMMARY */}
      <section className="skill-summary-grid">

        <div className="skill-summary-card matched">
          <div className="summary-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>
              Matched Skills
            </span>

            <strong>
              {skillData.matchedSkills.length}
            </strong>
          </div>
        </div>


        <div className="skill-summary-card missing">
          <div className="summary-icon">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>
              Missing Skills
            </span>

            <strong>
              {skillData.missingSkills.length}
            </strong>
          </div>
        </div>


        <div className="skill-summary-card learning">
          <div className="summary-icon">
            <BookOpen size={22} />
          </div>

          <div>
            <span>
              Recommended Skills
            </span>

            <strong>
              {skillData.recommendations.length}
            </strong>
          </div>
        </div>


        <div className="skill-summary-card progress">
          <div className="summary-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>
              Average Progress
            </span>

            <strong>
              {overallProgress}%
            </strong>
          </div>
        </div>

      </section>


      {/* MATCHED + MISSING */}
      <section className="skill-section">

        <div className="section-heading">
          <div>
            <span className="section-label">
              JOB REQUIREMENT ANALYSIS
            </span>

            <h2>
              Your Skill Gap
            </h2>
          </div>
        </div>


        <div className="skill-gap-columns">

          {/* MATCHED */}
          <div className="skill-panel">

            <div className="panel-header">
              <div className="panel-title matched-title">
                <CheckCircle2 size={21} />

                <div>
                  <h3>
                    Matched Skills
                  </h3>

                  <p>
                    Skills you already have
                  </p>
                </div>
              </div>
            </div>


            <div className="skill-tags">

              {skillData.matchedSkills.map(
                (skill) => (
                  <div
                    className="skill-tag matched-tag"
                    key={skill}
                  >
                    <CheckCircle2 size={17} />

                    <span>
                      {skill}
                    </span>
                  </div>
                )
              )}

            </div>

          </div>


          {/* MISSING */}
          <div className="skill-panel">

            <div className="panel-header">
              <div className="panel-title missing-title">
                <AlertTriangle size={21} />

                <div>
                  <h3>
                    Missing Skills
                  </h3>

                  <p>
                    Skills recommended for improvement
                  </p>
                </div>
              </div>
            </div>


            <div className="skill-tags">

              {skillData.missingSkills.map(
                (skill) => (
                  <div
                    className="skill-tag missing-tag"
                    key={skill}
                  >
                    <AlertTriangle size={17} />

                    <span>
                      {skill}
                    </span>
                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </section>


      {/* SKILL PROGRESS */}
      <section className="skill-section">

        <div className="section-heading">
          <div>
            <span className="section-label">
              SKILL DEVELOPMENT
            </span>

            <h2>
              Skill Progress
            </h2>

            <p>
              Your current estimated proficiency in each skill.
            </p>
          </div>
        </div>


        <div className="progress-grid">

          {skillData.skillProgress.map(
            (item) => (
              <div
                className="skill-progress-card"
                key={item.skill}
              >

                <div className="progress-card-top">

                  <div>
                    <h3>
                      {item.skill}
                    </h3>

                    <span>
                      {item.level}
                    </span>
                  </div>

                  <strong>
                    {item.score}%
                  </strong>

                </div>


                <div className="progress-track">

                  <div
                    className="progress-fill"
                    style={{
                      width: `${item.score}%`,
                    }}
                  />

                </div>


                <div className="progress-footer">

                  <span>
                    Current proficiency
                  </span>

                  <span>
                    {item.score >= 80
                      ? "Strong"
                      : item.score >= 60
                        ? "Good"
                        : item.score >= 40
                          ? "Developing"
                          : "Needs improvement"}
                  </span>

                </div>

              </div>
            )
          )}

        </div>

      </section>


      {/* RECOMMENDATIONS */}
      <section className="skill-section">

        <div className="section-heading">
          <div>
            <span className="section-label">
              PERSONALIZED LEARNING
            </span>

            <h2>
              What You Should Learn
            </h2>

            <p>
              Recommended skills based on your current skill gap.
            </p>
          </div>
        </div>


        <div className="recommendation-grid">

          {skillData.recommendations.map(
            (item, index) => (
              <div
                className="recommendation-card"
                key={item.skill}
              >

                <div className="recommendation-top">

                  <div className="recommendation-number">
                    {index + 1}
                  </div>

                  <div className="recommendation-icon">
                    <Award size={21} />
                  </div>

                  <span
                    className={`priority-badge priority-${item.priority.toLowerCase()}`}
                  >
                    {item.priority}
                  </span>

                </div>


                <h3>
                  Learn {item.skill}
                </h3>

                <p className="recommendation-description">
                  {item.description}
                </p>


                <div className="recommendation-reason">

                  <Target size={16} />

                  <span>
                    {item.reason}
                  </span>

                </div>


                <button
                  type="button"
                  className="learn-button"
                >
                  <BookOpen size={17} />

                  Start Learning

                </button>

              </div>
            )
          )}

        </div>

      </section>

    </div>
  );
}

export default SkillGap;