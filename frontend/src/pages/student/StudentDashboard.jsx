import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  User,
  Briefcase,
  ClipboardCheck,
  Code2,
  Video,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "./StudentDashboard.css";


function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();


  /* =========================================================
     GET FULL STUDENT NAME
  ========================================================= */

  const displayName = useMemo(() => {

    let fullName = "";

    /*
      First try the logged-in user.
    */
    if (user?.name) {
      fullName = String(user.name).trim();
    }


    /*
      Then check the saved student profile.
      This is important because the profile may contain
      "Debasis Das" while the login session contains only "Das".
    */

    if (user?.email) {

      try {

        const savedProfile =
          localStorage.getItem(
            `campuslink_student_profile_${user.email}`
          );

        if (savedProfile) {

          const profile =
            JSON.parse(savedProfile);

          const profileName =
            profile?.fullName ||
            profile?.name ||
            "";

          if (
            String(profileName).trim()
          ) {
            fullName =
              String(profileName).trim();
          }
        }

      } catch (error) {

        console.error(
          "Could not load student profile name:",
          error
        );

      }

    }


    return fullName || "Student";

  }, [user]);


  /* =========================================================
     DASHBOARD STATS
  ========================================================= */

  const stats = [
    {
      title: "Profile Completion",
      value: "92%",
      icon: User,
      color: "blue",
      path: "/student/profile",
    },
    {
      title: "Eligible Jobs",
      value: "12",
      icon: Briefcase,
      color: "green",
      path: "/student/jobs",
    },
    {
      title: "Assessment Score",
      value: "84%",
      icon: ClipboardCheck,
      color: "purple",
      path: "/student/assessments",
    },
    {
      title: "Interview Score",
      value: "81%",
      icon: Video,
      color: "orange",
      path: "/student/performance",
    },
  ];


  /* =========================================================
     RECOMMENDED JOBS
  ========================================================= */

  const recommendedJobs = [
    {
      id: 1,
      title: "Python Developer",
      company: "ABC Technologies",
      location: "Bangalore / Remote",
      match: 92,
      skills: [
        "Python",
        "SQL",
        "FastAPI",
      ],
      missing: "Docker",
    },

    {
      id: 2,
      title: "Full Stack Developer",
      company: "TechNova Solutions",
      location: "Hyderabad",
      match: 87,
      skills: [
        "React",
        "JavaScript",
        "SQL",
      ],
      missing: "Node.js",
    },

    {
      id: 3,
      title: "Machine Learning Engineer",
      company: "AI Labs",
      location: "Pune / Remote",
      match: 81,
      skills: [
        "Python",
        "Machine Learning",
        "SQL",
      ],
      missing: "TensorFlow",
    },
  ];


  /* =========================================================
     QUICK ACTIONS
  ========================================================= */

  const quickActions = [
    {
      title: "Complete Profile",
      description:
        "Improve your job matching accuracy",
      icon: User,
      path: "/student/profile",
    },

    {
      title: "Take Assessment",
      description:
        "Test your technical skills",
      icon: ClipboardCheck,
      path: "/student/assessments",
    },

    {
      title: "Practice Interview",
      description:
        "Practice questions by skill",
      icon: Code2,
      path: "/student/practice",
    },

    {
      title: "Start AI Interview",
      description:
        "Take an AI-powered interview",
      icon: Video,
      path: "/student/ai-interview",
    },
  ];


  /* =========================================================
     VIEW
  ========================================================= */

  return (
    <div className="student-dashboard">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="student-header">

        <div>

          <p className="dashboard-label">
            STUDENT PORTAL
          </p>

          <h1>
            Welcome, {displayName} 👋
          </h1>

          <p className="dashboard-subtitle">
            Track your career progress, discover
            opportunities and improve your interview
            performance.
          </p>

        </div>


        <button
          type="button"
          className="profile-button"
          onClick={() =>
            navigate("/student/profile")
          }
        >
          <User size={18} />

          View Profile
        </button>

      </header>


      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="stats-grid">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (

            <button
              type="button"
              className="stat-card"
              key={stat.title}
              onClick={() =>
                navigate(stat.path)
              }
            >

              <div
                className={`stat-icon ${stat.color}`}
              >
                <Icon size={22} />
              </div>


              <div className="stat-content">

                <span>
                  {stat.title}
                </span>

                <strong>
                  {stat.value}
                </strong>

              </div>


              <ChevronRight
                className="stat-arrow"
                size={20}
              />

            </button>

          );

        })}

      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="dashboard-content">


        {/* ===================================================
            RECOMMENDED JOBS
        =================================================== */}

        <section
          className="dashboard-card jobs-section"
        >

          <div className="section-header">

            <div>

              <span className="section-label">
                AI JOB MATCHING
              </span>

              <h2>
                Recommended Jobs
              </h2>

              <p>
                Jobs matched with your skills,
                education and experience.
              </p>

            </div>


            <button
              type="button"
              className="text-button"
              onClick={() =>
                navigate("/student/jobs")
              }
            >

              View All

              <ChevronRight size={17} />

            </button>

          </div>


          {/* =================================================
              JOB LIST
          ================================================= */}

          <div className="jobs-list">

            {recommendedJobs.map((job) => (

              <article
                className="job-item"
                key={job.id}
              >


                {/* JOB INFORMATION */}

                <div className="job-main">

                  <div className="company-logo">
                    {job.company.charAt(0)}
                  </div>


                  <div className="job-information">

                    <h3>
                      {job.title}
                    </h3>

                    <p className="company-name">
                      {job.company}
                    </p>

                    <p className="job-location">
                      {job.location}
                    </p>

                  </div>

                </div>


                {/* MATCH */}

                <div className="job-match">

                  <div className="match-circle">
                    {job.match}%
                  </div>

                  <span>
                    MATCH
                  </span>

                </div>


                {/* SKILLS */}

                <div className="job-skills">

                  {job.skills.map((skill) => (

                    <span
                      className="skill-tag matched"
                      key={skill}
                    >

                      <CheckCircle2
                        size={13}
                      />

                      {skill}

                    </span>

                  ))}


                  <span className="skill-tag missing">

                    <AlertCircle
                      size={13}
                    />

                    {job.missing}

                  </span>

                </div>


                {/* VIEW JOB */}

                <div className="job-action">

                  <button
                    type="button"
                    className="job-button"
                    onClick={() =>
                      navigate(
                        `/student/jobs/${job.id}`
                      )
                    }
                  >

                    View Job

                    <ChevronRight
                      size={16}
                    />

                  </button>

                </div>


              </article>

            ))}

          </div>

        </section>


        {/* ===================================================
            RIGHT COLUMN
        =================================================== */}

        <div className="dashboard-side">


          {/* CAREER READINESS */}

          <section
            className="dashboard-card career-card"
          >

            <div className="section-label">
              CAREER READINESS
            </div>

            <h2>
              84%
            </h2>

            <p>
              Overall performance
            </p>


            <div className="progress-track">

              <div
                className="progress-value"
                style={{
                  width: "84%",
                }}
              />

            </div>


            <div className="career-details">

              <span>

                <TrendingUp
                  size={15}
                />

                Improving

              </span>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/student/performance"
                  )
                }
              >
                View Performance
              </button>

            </div>

          </section>


          {/* QUICK ACTIONS */}

          <section
            className="dashboard-card actions-card"
          >

            <div className="section-header compact">

              <div>

                <div className="section-label">
                  GET STARTED
                </div>

                <h2>
                  Quick Actions
                </h2>

              </div>

            </div>


            <div className="quick-actions">

              {quickActions.map((action) => {

                const Icon = action.icon;

                return (

                  <button
                    type="button"
                    className="quick-action"
                    key={action.title}
                    onClick={() =>
                      navigate(action.path)
                    }
                  >

                    <div className="quick-icon">

                      <Icon size={19} />

                    </div>


                    <div className="quick-text">

                      <strong>
                        {action.title}
                      </strong>

                      <span>
                        {action.description}
                      </span>

                    </div>


                    <ChevronRight
                      size={17}
                    />

                  </button>

                );

              })}

            </div>

          </section>

        </div>

      </div>


      {/* =====================================================
          BOTTOM CARDS
      ===================================================== */}

      <section className="bottom-grid">


        {/* PRACTICE */}

        <button
          type="button"
          className="bottom-card"
          onClick={() =>
            navigate("/student/practice")
          }
        >

          <div className="bottom-icon">

            <Code2 size={22} />

          </div>


          <div>

            <span>
              SKILL PRACTICE
            </span>

            <h3>
              Practice Interview Questions
            </h3>

            <p>
              Choose a skill and difficulty level
              to practice random questions.
            </p>

          </div>


          <ChevronRight size={20} />

        </button>


        {/* FEEDBACK */}

        <button
          type="button"
          className="bottom-card"
          onClick={() =>
            navigate("/student/feedback")
          }
        >

          <div className="bottom-icon">

            <MessageSquare size={22} />

          </div>


          <div>

            <span>
              AI FEEDBACK
            </span>

            <h3>
              Review Your Interview Feedback
            </h3>

            <p>
              Understand your strengths and areas
              that need improvement.
            </p>

          </div>


          <ChevronRight size={20} />

        </button>

      </section>

    </div>
  );
}


export default StudentDashboard;