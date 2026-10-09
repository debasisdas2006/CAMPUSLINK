import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle,
  Code2,
  MessageSquare,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

import "./Performance.css";


function Performance() {
  const skillScores = [
    {
      skill: "Python",
      score: 88,
      level: "Strong",
      icon: Code2,
    },
    {
      skill: "JavaScript",
      score: 82,
      level: "Strong",
      icon: Code2,
    },
    {
      skill: "React",
      score: 78,
      level: "Good",
      icon: Code2,
    },
    {
      skill: "SQL",
      score: 92,
      level: "Excellent",
      icon: BarChart3,
    },
    {
      skill: "Problem Solving",
      score: 84,
      level: "Strong",
      icon: Brain,
    },
    {
      skill: "Communication",
      score: 76,
      level: "Good",
      icon: MessageSquare,
    },
  ];


  const assessmentHistory = [
    {
      id: "TEST-001",
      title: "Python Programming Assessment",
      category: "Technical",
      date: "01 Oct 2026",
      questions: 20,
      score: 85,
      status: "Completed",
    },
    {
      id: "TEST-004",
      title: "SQL & Database Assessment",
      category: "Technical",
      date: "28 Sep 2026",
      questions: 20,
      score: 92,
      status: "Completed",
    },
    {
      id: "TEST-003",
      title: "React Development Assessment",
      category: "Technical",
      date: "25 Sep 2026",
      questions: 15,
      score: 78,
      status: "Completed",
    },
    {
      id: "TEST-005",
      title: "Problem Solving Assessment",
      category: "Aptitude",
      date: "22 Sep 2026",
      questions: 15,
      score: 84,
      status: "Completed",
    },
  ];


  const interviewHistory = [
    {
      id: "INT-001",
      company: "ABC Technologies",
      role: "Python Developer",
      date: "30 Sep 2026",
      score: 86,
      status: "Completed",
    },
    {
      id: "INT-002",
      company: "TechNova Solutions",
      role: "Full Stack Developer",
      date: "24 Sep 2026",
      score: 81,
      status: "Completed",
    },
  ];


  const averageAssessment =
    Math.round(
      assessmentHistory.reduce(
        (total, item) =>
          total + item.score,
        0
      ) /
        assessmentHistory.length
    );


  const averageInterview =
    Math.round(
      interviewHistory.reduce(
        (total, item) =>
          total + item.score,
        0
      ) /
        interviewHistory.length
    );


  return (
    <div className="performance-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="performance-header">

        <div>
          <span className="performance-eyebrow">
            STUDENT PERFORMANCE
          </span>

          <h1>
            Your Performance
          </h1>

          <p>
            Track your assessment results,
            interview performance and skill
            development.
          </p>
        </div>

        <div className="performance-header-icon">
          <TrendingUp size={30} />
        </div>

      </div>


      {/* =====================================
          TOP SCORE
      ===================================== */}

      <div className="performance-overview">

        <div className="overall-performance-card">

          <div className="overall-score-circle">

            <div>
              <strong>86%</strong>
              <span>Overall</span>
            </div>

          </div>

          <div className="overall-content">

            <span className="overall-label">
              OVERALL PERFORMANCE
            </span>

            <h2>
              Strong Performance
            </h2>

            <p>
              Your current performance shows
              good technical knowledge and
              interview readiness.
            </p>

            <div className="overall-progress">

              <div className="overall-progress-track">
                <div
                  style={{
                    width: "86%",
                  }}
                />
              </div>

              <span>
                86 / 100
              </span>

            </div>

          </div>

        </div>


        <div className="performance-summary-grid">

          <div className="performance-summary-card">

            <div className="summary-icon">
              <BookOpen size={20} />
            </div>

            <span>
              Assessment Average
            </span>

            <strong>
              {averageAssessment}%
            </strong>

            <small>
              Across {assessmentHistory.length} tests
            </small>

          </div>


          <div className="performance-summary-card">

            <div className="summary-icon">
              <Trophy size={20} />
            </div>

            <span>
              Interview Average
            </span>

            <strong>
              {averageInterview}%
            </strong>

            <small>
              Across {interviewHistory.length} interviews
            </small>

          </div>


          <div className="performance-summary-card">

            <div className="summary-icon">
              <Target size={20} />
            </div>

            <span>
              Job Match
            </span>

            <strong>
              92%
            </strong>

            <small>
              Current best match
            </small>

          </div>


          <div className="performance-summary-card">

            <div className="summary-icon">
              <Award size={20} />
            </div>

            <span>
              Skills Assessed
            </span>

            <strong>
              {skillScores.length}
            </strong>

            <small>
              Technical and soft skills
            </small>

          </div>

        </div>

      </div>


      {/* =====================================
          SKILLS
      ===================================== */}

      <section className="performance-section">

        <div className="section-heading">

          <div>
            <span>
              SKILL ANALYSIS
            </span>

            <h2>
              Your Skill Performance
            </h2>
          </div>

          <BarChart3 size={22} />

        </div>


        <div className="skill-performance-grid">

          {skillScores.map((item) => {

            const Icon =
              item.icon;

            return (
              <div
                className="skill-performance-card"
                key={item.skill}
              >

                <div className="skill-card-header">

                  <div className="skill-card-name">

                    <div className="skill-icon">
                      <Icon size={18} />
                    </div>

                    <div>
                      <strong>
                        {item.skill}
                      </strong>

                      <span>
                        {item.level}
                      </span>
                    </div>

                  </div>

                  <strong className="skill-score">
                    {item.score}%
                  </strong>

                </div>


                <div className="skill-progress-track">

                  <div
                    className="skill-progress-fill"
                    style={{
                      width: `${item.score}%`,
                    }}
                  />

                </div>

              </div>
            );
          })}

        </div>

      </section>


      {/* =====================================
          ASSESSMENT HISTORY
      ===================================== */}

      <section className="performance-section">

        <div className="section-heading">

          <div>
            <span>
              ASSESSMENT HISTORY
            </span>

            <h2>
              Recent Tests
            </h2>
          </div>

          <CheckCircle size={22} />

        </div>


        <div className="performance-table-wrapper">

          <table className="performance-table">

            <thead>
              <tr>
                <th>Assessment</th>
                <th>Category</th>
                <th>Date</th>
                <th>Questions</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {assessmentHistory.map(
                (item) => (
                  <tr key={item.id}>

                    <td>
                      <div className="table-title">
                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {item.id}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="category-badge">
                        {item.category}
                      </span>
                    </td>

                    <td>
                      {item.date}
                    </td>

                    <td>
                      {item.questions}
                    </td>

                    <td>
                      <strong className="score-text">
                        {item.score}%
                      </strong>
                    </td>

                    <td>
                      <span className="completed-badge">
                        <CheckCircle size={13} />
                        {item.status}
                      </span>
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =====================================
          INTERVIEW HISTORY
      ===================================== */}

      <section className="performance-section">

        <div className="section-heading">

          <div>
            <span>
              INTERVIEW HISTORY
            </span>

            <h2>
              Recent Interviews
            </h2>
          </div>

          <MessageSquare size={22} />

        </div>


        <div className="interview-performance-grid">

          {interviewHistory.map(
            (item) => (
              <div
                className="interview-performance-card"
                key={item.id}
              >

                <div className="interview-card-top">

                  <div>

                    <span>
                      {item.company}
                    </span>

                    <h3>
                      {item.role}
                    </h3>

                  </div>

                  <div className="interview-score">
                    {item.score}%
                  </div>

                </div>


                <div className="interview-card-bottom">

                  <span>
                    {item.date}
                  </span>

                  <span className="completed-badge">
                    <CheckCircle size={13} />
                    {item.status}
                  </span>

                </div>

              </div>
            )
          )}

        </div>

      </section>


      {/* =====================================
          IMPROVEMENT
      ===================================== */}

      <section className="improvement-card">

        <div className="improvement-icon">
          <TrendingUp size={23} />
        </div>

        <div>

          <span>
            AI PERFORMANCE INSIGHT
          </span>

          <h2>
            Continue improving your
            communication skills
          </h2>

          <p>
            Your technical assessment scores
            are strong. Regular interview
            practice can help improve
            communication and interview
            confidence.
          </p>

        </div>

      </section>

    </div>
  );
}


export default Performance;