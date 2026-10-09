import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Briefcase,
  Code2,
  Languages,
  Award,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./CandidateDetails.css";

function CandidateDetails() {
  const navigate = useNavigate();

  const { studentId } =
    useParams();

  /*
   * Temporary demo profile.
   *
   * Later this will be loaded from:
   *
   * GET /api/recruiter/candidates/:studentId
   *
   * The backend must verify that the
   * recruiter has permission to view
   * this student.
   */

  const student = {
    id: studentId || "STU001",

    name: "Rahul Sharma",

    email: "rahul@student.com",

    college:
      "ABC Engineering College",

    degree:
      "B.Tech Computer Science",

    cgpa: "8.7",

    experience:
      "1 Year",

    languages: [
      "English",
      "Hindi",
      "Odia",
    ],

    skills: [
      "Python",
      "React",
      "SQL",
      "Machine Learning",
      "FastAPI",
      "Git",
    ],

    matchScore: 92,

    eligibility: "Eligible",

    matchedRequirements: [
      "Degree requirement satisfied",
      "Minimum CGPA satisfied",
      "Python skill matched",
      "React skill matched",
      "SQL skill matched",
      "Experience requirement satisfied",
    ],
  };

  return (
    <div className="candidate-details-page">

      {/* ==================================
          BACK
      ================================== */}

      <button
        type="button"
        className="candidate-back-button"
        onClick={() =>
          navigate("/recruiter/candidates")
        }
      >
        <ArrowLeft size={17} />

        Back to Candidates
      </button>

      {/* ==================================
          HEADER
      ================================== */}

      <div className="candidate-profile-header">

        <div className="profile-avatar-large">
          {student.name
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="profile-header-info">

          <div className="profile-badge">
            STUDENT PROFILE
          </div>

          <h1>
            {student.name}
          </h1>

          <p>
            {student.degree}
          </p>

          <span>
            Student ID: {student.id}
          </span>

        </div>

        <div className="profile-match-box">

          <TrendingUp size={22} />

          <strong>
            {student.matchScore}%
          </strong>

          <span>
            Job Match
          </span>

        </div>

      </div>

      {/* ==================================
          BASIC INFORMATION
      ================================== */}

      <div className="profile-section">

        <div className="section-heading">

          <h2>
            Student Information
          </h2>

          <p>
            Academic and professional
            information provided by the student.
          </p>

        </div>

        <div className="profile-info-grid">

          <div className="profile-info-card">

            <Mail size={19} />

            <div>
              <span>
                Email
              </span>

              <strong>
                {student.email}
              </strong>
            </div>

          </div>

          <div className="profile-info-card">

            <GraduationCap size={19} />

            <div>
              <span>
                College
              </span>

              <strong>
                {student.college}
              </strong>
            </div>

          </div>

          <div className="profile-info-card">

            <Award size={19} />

            <div>
              <span>
                CGPA
              </span>

              <strong>
                {student.cgpa}
              </strong>
            </div>

          </div>

          <div className="profile-info-card">

            <Briefcase size={19} />

            <div>
              <span>
                Experience
              </span>

              <strong>
                {student.experience}
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* ==================================
          SKILLS
      ================================== */}

      <div className="profile-section">

        <div className="section-heading">

          <h2>
            Technical Skills
          </h2>

          <p>
            Skills listed by the student.
          </p>

        </div>

        <div className="profile-skills">

          {student.skills.map(
            (skill) => (
              <span key={skill}>
                <Code2 size={15} />
                {skill}
              </span>
            )
          )}

        </div>

      </div>

      {/* ==================================
          LANGUAGES
      ================================== */}

      <div className="profile-section">

        <div className="section-heading">

          <h2>
            Languages
          </h2>

          <p>
            Languages listed in the student's
            profile.
          </p>

        </div>

        <div className="profile-languages">

          {student.languages.map(
            (language) => (
              <span key={language}>
                <Languages size={15} />
                {language}
              </span>
            )
          )}

        </div>

      </div>

      {/* ==================================
          ELIGIBILITY
      ================================== */}

      <div className="profile-section">

        <div className="section-heading">

          <h2>
            Eligibility & Requirements
          </h2>

          <p>
            How the student matches the
            recruiter's job requirements.
          </p>

        </div>

        <div className="eligibility-card">

          <div className="eligibility-status">

            <CheckCircle2 size={22} />

            <div>

              <strong>
                {student.eligibility}
              </strong>

              <span>
                Student satisfies the
                current job requirements.
              </span>

            </div>

          </div>

          <div className="matched-requirements">

            {student.matchedRequirements.map(
              (requirement) => (
                <div
                  className="matched-item"
                  key={requirement}
                >
                  <CheckCircle2 size={16} />

                  <span>
                    {requirement}
                  </span>
                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* ==================================
          ACTIONS
      ================================== */}

      <div className="profile-actions">

        <button
          type="button"
          className="primary-profile-button"
          onClick={() =>
            navigate(
              `/recruiter/interviews?studentId=${student.id}`
            )
          }
        >
          Start Interview
        </button>

        <button
          type="button"
          className="secondary-profile-button"
          onClick={() =>
            navigate("/recruiter/candidates")
          }
        >
          Back
        </button>

      </div>

    </div>
  );
}

export default CandidateDetails;