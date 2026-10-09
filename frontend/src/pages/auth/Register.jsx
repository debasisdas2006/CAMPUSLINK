import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  GraduationCap,
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./Register.css";


function Register() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const [role, setRole] = useState("student");

  const [studentName, setStudentName] = useState("");
  const [collegeName, setCollegeName] = useState("");

  const [recruiterName, setRecruiterName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  /* =====================================================
     ROLE CHANGE
     ===================================================== */

  const changeRole = (selectedRole) => {
    setRole(selectedRole);

    setError("");

    setStudentName("");
    setCollegeName("");

    setRecruiterName("");
    setCompanyName("");

    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(false);
  };


  /* =====================================================
     REGISTER
     ===================================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const cleanEmail =
      email.trim().toLowerCase();


    /* ===================================================
       STUDENT VALIDATION
       =================================================== */

    if (role === "student") {

      if (!studentName.trim()) {
        setError(
          "Please enter your student name."
        );
        return;
      }

      if (!collegeName.trim()) {
        setError(
          "Please enter your college name."
        );
        return;
      }

    }


    /* ===================================================
       RECRUITER VALIDATION
       =================================================== */

    if (role === "recruiter") {

      if (!recruiterName.trim()) {
        setError(
          "Please enter your recruiter name."
        );
        return;
      }

      if (!companyName.trim()) {
        setError(
          "Please enter your company name."
        );
        return;
      }

    }


    /* ===================================================
       COMMON VALIDATION
       =================================================== */

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }


    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }


    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }


    setLoading(true);


    /* ===================================================
       READ REGISTERED USERS
       =================================================== */

    let registeredUsers = [];

    try {

      registeredUsers = JSON.parse(
        localStorage.getItem(
          "campuslink_registered_users"
        ) || "[]"
      );

      if (!Array.isArray(registeredUsers)) {
        registeredUsers = [];
      }

    } catch (storageError) {

      console.error(
        "Could not read registered users:",
        storageError
      );

      registeredUsers = [];
    }


    /* ===================================================
       DUPLICATE EMAIL
       =================================================== */

    const alreadyExists =
      registeredUsers.some(
        (existingUser) =>
          existingUser.email?.toLowerCase() ===
          cleanEmail
      );


    if (alreadyExists) {

      setLoading(false);

      setError(
        "This email is already registered. Please login."
      );

      return;
    }


    /* ===================================================
       CREATE USER
       =================================================== */

    const newUser = {

      id:
        `USER-${Date.now()}`,

      role,

      name:
        role === "student"
          ? studentName.trim()
          : recruiterName.trim(),

      email:
        cleanEmail,

      password,

      college:
        role === "student"
          ? collegeName.trim()
          : "",

      company:
        role === "recruiter"
          ? companyName.trim()
          : "",

      createdAt:
        new Date().toISOString(),
    };


    /* ===================================================
       SAVE ACCOUNT
       =================================================== */

    registeredUsers.push(newUser);

    localStorage.setItem(
      "campuslink_registered_users",
      JSON.stringify(registeredUsers)
    );


    /* ===================================================
       SAVE STUDENT PROFILE
       =================================================== */

    if (role === "student") {

      const studentProfile = {

        id: newUser.id,

        name: newUser.name,

        email: newUser.email,

        college: newUser.college,

        degree: "",

        cgpa: "",

        experience: "",

        skills: [],

        programmingLanguages: [],

        role: "student",

      };


      localStorage.setItem(
        `campuslink_student_profile_${cleanEmail}`,
        JSON.stringify(studentProfile)
      );

    }


    /* ===================================================
       VERY IMPORTANT
       
       REGISTRATION IS NOT LOGIN.
       
       Clear any existing authenticated user.
       =================================================== */

    logout();


    setLoading(false);


    /* ===================================================
       GO DIRECTLY TO LOGIN
       
       Password is deliberately NOT sent.
       User must enter password manually.
       =================================================== */

    navigate("/login", {
      replace: true,

      state: {
        registeredEmail:
          cleanEmail,

        registeredRole:
          role,
      },
    });
  };


  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <main className="register-page">

      {/* =================================================
          LEFT SIDE
          ================================================= */}

      <section className="register-brand-panel">

        <div className="register-brand">

          <div className="register-brand-icon">
            <GraduationCap size={43} />
          </div>

          <div className="register-brand-name">
            CAMPUS<span>LINK</span>
          </div>

          <div className="register-brand-subtitle">
            AI CAREER PLATFORM
          </div>

        </div>


        <div className="register-hero-content">

          <div className="register-hero-label">
            <UserPlus size={18} />
            <span>
              CREATE YOUR ACCOUNT
            </span>
          </div>

          <h1>
            Start your
            <br />
            career journey.
          </h1>

          <p>
            Connect your skills, education and
            opportunities with intelligent
            AI-powered career guidance.
          </p>


          <div className="register-features">

            <div>
              ✓ Build your professional profile
            </div>

            <div>
              ✓ Discover suitable opportunities
            </div>

            <div>
              ✓ Practice for interviews
            </div>

            <div>
              ✓ Improve your career performance
            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          RIGHT SIDE
          ================================================= */}

      <section className="register-form-panel">

        <div className="register-card">

          {/* =============================================
              BACK TO LOGIN
              ============================================= */}

          <Link
            to="/login"
            className="register-back-link"
          >
            <ArrowLeft size={17} />
            <span>
              Back to Login
            </span>
          </Link>


          {/* =============================================
              HEADER
              ============================================= */}

          <div className="register-card-icon">
            <UserPlus size={34} />
          </div>

          <h2>
            Create Account
          </h2>

          <p className="register-card-subtitle">
            Join CAMPUSLINK and start
            your career journey.
          </p>


          {/* =============================================
              ROLE SELECTOR
              ============================================= */}

          <div className="register-role-box">

            <button
              type="button"
              className={
                role === "student"
                  ? "register-role active"
                  : "register-role"
              }
              onClick={() =>
                changeRole("student")
              }
            >

              <User size={19} />

              <span>
                Student
              </span>

            </button>


            <button
              type="button"
              className={
                role === "recruiter"
                  ? "register-role active"
                  : "register-role"
              }
              onClick={() =>
                changeRole("recruiter")
              }
            >

              <Building2 size={19} />

              <span>
                Recruiter
              </span>

            </button>

          </div>


          {/* =============================================
              FORM
              ============================================= */}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}


            {/* ===========================================
                STUDENT NAME
                =========================================== */}

            {role === "student" && (
              <>

                <div className="register-field">

                  <label htmlFor="student-name">
                    Student Name
                  </label>

                  <div className="register-input-wrapper">

                    <User
                      className="register-input-icon"
                      size={20}
                    />

                    <input
                      id="student-name"
                      className="register-input"
                      type="text"
                      value={studentName}
                      onChange={(event) =>
                        setStudentName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />

                  </div>

                </div>


                {/* COLLEGE */}

                <div className="register-field">

                  <label htmlFor="college-name">
                    College Name
                  </label>

                  <div className="register-input-wrapper">

                    <GraduationCap
                      className="register-input-icon"
                      size={20}
                    />

                    <input
                      id="college-name"
                      className="register-input"
                      type="text"
                      value={collegeName}
                      onChange={(event) =>
                        setCollegeName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your college name"
                    />

                  </div>

                </div>

              </>
            )}


            {/* ===========================================
                RECRUITER
                =========================================== */}

            {role === "recruiter" && (
              <>

                <div className="register-field">

                  <label htmlFor="recruiter-name">
                    Recruiter Name
                  </label>

                  <div className="register-input-wrapper">

                    <User
                      className="register-input-icon"
                      size={20}
                    />

                    <input
                      id="recruiter-name"
                      className="register-input"
                      type="text"
                      value={recruiterName}
                      onChange={(event) =>
                        setRecruiterName(
                          event.target.value
                        )
                      }
                      placeholder="Enter recruiter name"
                    />

                  </div>

                </div>


                <div className="register-field">

                  <label htmlFor="company-name">
                    Company Name
                  </label>

                  <div className="register-input-wrapper">

                    <Building2
                      className="register-input-icon"
                      size={20}
                    />

                    <input
                      id="company-name"
                      className="register-input"
                      type="text"
                      value={companyName}
                      onChange={(event) =>
                        setCompanyName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your company name"
                    />

                  </div>

                </div>

              </>
            )}


            {/* ===========================================
                EMAIL
                =========================================== */}

            <div className="register-field">

              <label htmlFor="register-email">
                Email Address
              </label>

              <div className="register-input-wrapper">

                <Mail
                  className="register-input-icon"
                  size={20}
                />

                <input
                  id="register-email"
                  className="register-input"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                />

              </div>

            </div>


            {/* ===========================================
                PASSWORD
                =========================================== */}

            <div className="register-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="register-input-wrapper">

                <Lock
                  className="register-input-icon"
                  size={20}
                />

                <input
                  id="register-password"
                  className="register-input password-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>


            {/* ===========================================
                CONFIRM PASSWORD
                =========================================== */}

            <div className="register-field">

              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>

              <div className="register-input-wrapper">

                <Lock
                  className="register-input-icon"
                  size={20}
                />

                <input
                  id="register-confirm-password"
                  className="register-input password-input"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>


            {/* ===========================================
                SUBMIT
                =========================================== */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >

              <UserPlus size={20} />

              <span>
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </span>

            </button>

          </form>


          {/* =============================================
              LOGIN LINK
              ============================================= */}

          <div className="register-login-row">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}


export default Register;