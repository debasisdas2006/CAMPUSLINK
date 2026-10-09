import { useEffect, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  GraduationCap,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./Login.css";


function Login() {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    user,
    login,
    isAuthenticated,
  } = useAuth();


  /* =====================================================
     FORM STATE
     ===================================================== */

  const [role, setRole] =
    useState("student");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  /* =====================================================
     REGISTER SUCCESS MESSAGE
     ===================================================== */

  useEffect(() => {

    const registeredEmail =
      location.state?.registeredEmail;

    const registeredRole =
      location.state?.registeredRole;


    if (registeredEmail) {

      setEmail(
        registeredEmail
      );

      setSuccessMessage(
        "Account created successfully. Please login."
      );


      if (registeredRole) {

        setRole(
          registeredRole
        );
      }


      /*
       * Remove navigation state after reading it.
       */

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }

  }, [location.state]);


  /* =====================================================
     IF ALREADY AUTHENTICATED
     ===================================================== */

  useEffect(() => {

    if (!isAuthenticated || !user) {
      return;
    }


    /*
     * If the user is already logged in,
     * send them to their correct dashboard.
     */

    if (user.role === "student") {

      navigate(
        "/student",
        { replace: true }
      );

    } else if (user.role === "recruiter") {

      navigate(
        "/recruiter",
        { replace: true }
      );

    } else if (user.role === "admin") {

      navigate(
        "/admin",
        { replace: true }
      );
    }

  }, [
    isAuthenticated,
    user,
    navigate,
  ]);


  /* =====================================================
     ROLE CHANGE
     ===================================================== */

  const handleRoleChange = (
    event
  ) => {

    setRole(
      event.target.value
    );

    setError("");
  };


  /* =====================================================
     LOGIN
     ===================================================== */

  const handleSubmit = async(
    event
  ) => {

    event.preventDefault();

    setError("");
    setSuccessMessage("");


    const cleanEmail =
      email.trim();


    if (!cleanEmail) {

      setError(
        "Please enter your email address."
      );

      return;
    }


    if (!password) {

      setError(
        "Please enter your password."
      );

      return;
    }


    /*
     * AuthContext now checks:
     *
     * 1. Demo users
     * 2. Registered users
     *
     * This means the same account can login
     * again after logout.
     */

    const result =
  await login(
    cleanEmail,
    password,
    role
  );

    if (!result.success) {

      setError(
        result.message ||
        "Invalid email, password, or role."
      );

      return;
    }


    /*
     * IMPORTANT:
     *
     * Do NOT use window.location.href here.
     *
     * React Router should handle navigation.
     *
     * This also prevents the CampusLink animation
     * from restarting after login.
     */

    if (result.user.role === "student") {

      navigate(
        "/student",
        { replace: true }
      );

    } else if (
      result.user.role === "recruiter"
    ) {

      navigate(
        "/recruiter",
        { replace: true }
      );

    } else if (
      result.user.role === "admin"
    ) {

      navigate(
        "/admin",
        { replace: true }
      );
    }
  };


  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <main className="login-page">


      {/* =================================================
          LEFT BRAND SIDE
          ================================================= */}

      <section className="login-brand-panel">

        <div className="login-brand">

          <div className="login-brand-icon">

            <GraduationCap size={42} />

          </div>


          <div className="login-brand-name">

            CAMPUS<span>LINK</span>

          </div>


          <div className="login-brand-subtitle">

            AI CAREER PLATFORM

          </div>

        </div>


        <div className="login-hero-content">

          <h1>

            Welcome Back

          </h1>


          <p>

            Login to continue your
            career journey.

          </p>

        </div>

      </section>


      {/* =================================================
          RIGHT LOGIN CARD
          ================================================= */}

      <section className="login-form-panel">

        <div className="login-card">


          <div className="login-card-icon">

            <LogIn size={32} />

          </div>


          <h2>

            Login

          </h2>


          <p className="login-card-subtitle">

            Access your CAMPUSLINK account.

          </p>


          {/* =============================================
              FORM
              ============================================= */}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >


            {/* ===========================================
                SUCCESS MESSAGE
                =========================================== */}

            {successMessage && (

              <div className="login-success">

                {successMessage}

              </div>

            )}


            {/* ===========================================
                ERROR
                =========================================== */}

            {error && (

              <div className="login-error">

                {error}

              </div>

            )}


            {/* ===========================================
                ROLE
                =========================================== */}

            <div className="login-field">

              <label htmlFor="login-role">

                Login As

              </label>


              <select
                id="login-role"
                className="login-select"
                value={role}
                onChange={handleRoleChange}
              >

                <option value="student">
                  Student
                </option>

                <option value="recruiter">
                  Recruiter
                </option>

                <option value="admin">
                  Admin
                </option>

              </select>

            </div>


            {/* ===========================================
                EMAIL
                =========================================== */}

            <div className="login-field">

              <label htmlFor="login-email">

                Email Address

              </label>


              <div className="login-input-wrapper">

                <Mail
                  className="login-input-icon"
                  size={20}
                />


                <input
                  id="login-email"
                  className="login-input"
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

            <div className="login-field">

              <label htmlFor="login-password">

                Password

              </label>


              <div className="login-input-wrapper">

                <Lock
                  className="login-input-icon"
                  size={20}
                />


                <input
                  id="login-password"
                  className="login-input"
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />


                <button
                  type="button"
                  className="login-password-toggle"
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
                LOGIN BUTTON
                =========================================== */}

            <button
              type="submit"
              className="login-submit"
            >

              <LogIn size={20} />

              <span>
                Login
              </span>

            </button>

          </form>


          {/* =============================================
              CREATE ACCOUNT
              ============================================= */}

          <div className="login-create-account">

            <span>
              Don't have an account?
            </span>


            <Link
              to="/register"
              className="create-account-link"
            >

              <UserPlus size={16} />

              Create Account

            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}


export default Login;