import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/auth/Unauthorized";

import DashboardLayout from "../components/layout/DashboardLayout";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import Resume from "../pages/common/Resume";
import ContactUs from "../pages/common/ContactUs";

/* =========================================================
   STUDENT PAGES
========================================================= */

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentProfile from "../pages/student/StudentProfile";
import Jobs from "../pages/student/Jobs";
import JobDetails from "../pages/student/JobDetails";
import Assessments from "../pages/student/Assessments";
import AssessmentTest from "../pages/student/AssessmentTest";
import Performance from "../pages/student/Performance";
import Practice from "../pages/student/Practice";
import SkillGap from "../pages/student/SkillGap";
import AIInterview from "../pages/student/AIInterview";
import Feedback from "../pages/student/Feedback";
import MyApplications from "../pages/student/MyApplications";
import StudentNotifications from "../pages/student/Notifications";

/* =========================================================
   RECRUITER PAGES
========================================================= */

import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import Company from "../pages/recruiter/Company";
import CreateJob from "../pages/recruiter/CreateJob";
import RecruiterJobs from "../pages/recruiter/Jobs";
import RecruiterRequirements from "../pages/recruiter/Requirements";
import RecruiterCandidates from "../pages/recruiter/Candidates";
import RecruiterInterview from "../pages/recruiter/Interview";
import RecruiterEvaluation from "../pages/recruiter/Evaluation";
import RecruiterApplications from "../pages/recruiter/Applications";
import RecruiterNotifications from "../pages/recruiter/Notifications";

/* =========================================================
   ADMIN PAGES
========================================================= */

/* Main Admin */
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminModule from "../pages/admin/AdminModule";

/* Student Management */
import AdminStudents from "../pages/admin/Students";
import AdminStudentProfiles from "../pages/admin/StudentProfiles";
import AdminStudentJobs from "../pages/admin/StudentJobs";
import AdminStudentAssessments from "../pages/admin/StudentAssessments";
import AdminStudentPerformance from "../pages/admin/StudentPerformance";
import AdminStudentPractice from "../pages/admin/StudentPractice";
import AdminStudentInterviews from "../pages/admin/StudentInterviews";
import AdminStudentFeedback from "../pages/admin/StudentFeedback";

/* Recruiter Management */
import AdminRecruiters from "../pages/admin/Recruiters";
import AdminCompanies from "../pages/admin/Companies";
import AdminRecruiterJobs from "../pages/admin/RecruiterJobs";
import AdminRequirements from "../pages/admin/Requirements";
import AdminCandidates from "../pages/admin/Candidates";

/* Recruitment Management */
import AdminApplications from "../pages/admin/Applications";
import AdminInterviews from "../pages/admin/Interviews";
import AdminEvaluations from "../pages/admin/Evaluations";

/* General Admin */
import AdminJobs from "../pages/admin/Jobs";
import AdminTests from "../pages/admin/Tests";

/* AI / ML */
import AdminAI_ML from "../pages/admin/AI ML";

/* System */
import AdminReports from "../pages/admin/Reports";
import AdminAccessControl from "../pages/admin/AccessControl";
import AdminNotifications from "../pages/admin/Notifications";


function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />


        {/* =====================================================
            PROTECTED ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route element={<DashboardLayout />}>

            {/* =================================================
                COMMON ROUTES
            ================================================= */}

            <Route
              path="/resume"
              element={<Resume />}
            />

            <Route
              path="/contact-us"
              element={<ContactUs />}
            />


            {/* =================================================
                STUDENT ROUTES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRole="student"
                />
              }
            >

              <Route
                path="/student"
                element={<StudentDashboard />}
              />

              <Route
                path="/student/profile"
                element={<StudentProfile />}
              />

              <Route
                path="/student/jobs"
                element={<Jobs />}
              />

              <Route
                path="/student/jobs/:jobId"
                element={<JobDetails />}
              />

              <Route
                path="/student/assessments"
                element={<Assessments />}
              />

              <Route
                path="/student/assessments/:testId"
                element={<AssessmentTest />}
              />

              <Route
                path="/student/performance"
                element={<Performance />}
              />

              <Route
                path="/student/practice"
                element={<Practice />}
              />

              <Route
                path="/student/skill-gap"
                element={<SkillGap />}
              />

              <Route
                path="/student/ai-interview"
                element={<AIInterview />}
              />

              <Route
                path="/student/feedback"
                element={<Feedback />}
              />

              <Route
                path="/student/applications"
                element={<MyApplications />}
              />

              <Route
                path="/student/notifications"
                element={<StudentNotifications />}
              />

            </Route>


            {/* =================================================
                RECRUITER ROUTES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRole="recruiter"
                />
              }
            >

              <Route
                path="/recruiter"
                element={<RecruiterDashboard />}
              />

              <Route
                path="/recruiter/company"
                element={<Company />}
              />

              <Route
                path="/recruiter/jobs"
                element={<RecruiterJobs />}
              />

              <Route
                path="/recruiter/jobs/create"
                element={<CreateJob />}
              />

              <Route
                path="/recruiter/requirements"
                element={<RecruiterRequirements />}
              />

              <Route
                path="/recruiter/applications"
                element={<RecruiterApplications />}
              />

              <Route
                path="/recruiter/candidates"
                element={<RecruiterCandidates />}
              />

              <Route
                path="/recruiter/interviews"
                element={<RecruiterInterview />}
              />

              <Route
                path="/recruiter/evaluation"
                element={<RecruiterEvaluation />}
              />

              <Route
                path="/recruiter/notifications"
                element={<RecruiterNotifications />}
              />

            </Route>


            {/* =================================================
                ADMIN ROUTES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRole="admin"
                />
              }
            >

              {/* =================================================
                  ADMIN MAIN
              ================================================= */}

              <Route
                path="/admin"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/module"
                element={<AdminModule />}
              />


              {/* =================================================
                  STUDENT MANAGEMENT
              ================================================= */}

              <Route
                path="/admin/students"
                element={<AdminStudents />}
              />

              <Route
                path="/admin/student-profiles"
                element={<AdminStudentProfiles />}
              />

              <Route
                path="/admin/student-jobs"
                element={<AdminStudentJobs />}
              />

              <Route
                path="/admin/student-assessments"
                element={<AdminStudentAssessments />}
              />

              <Route
                path="/admin/student-performance"
                element={<AdminStudentPerformance />}
              />

              <Route
                path="/admin/student-practice"
                element={<AdminStudentPractice />}
              />

              <Route
                path="/admin/student-interviews"
                element={<AdminStudentInterviews />}
              />

              <Route
                path="/admin/student-feedback"
                element={<AdminStudentFeedback />}
              />


              {/* =================================================
                  RECRUITER MANAGEMENT
              ================================================= */}

              <Route
                path="/admin/recruiters"
                element={<AdminRecruiters />}
              />

              <Route
                path="/admin/companies"
                element={<AdminCompanies />}
              />

              <Route
                path="/admin/recruiter-jobs"
                element={<AdminRecruiterJobs />}
              />

              <Route
                path="/admin/requirements"
                element={<AdminRequirements />}
              />

              <Route
                path="/admin/candidates"
                element={<AdminCandidates />}
              />


              {/* =================================================
                  APPLICATION MANAGEMENT
              ================================================= */}

              <Route
                path="/admin/applications"
                element={<AdminApplications />}
              />


              {/* =================================================
                  INTERVIEW MANAGEMENT
              ================================================= */}

              <Route
                path="/admin/interviews"
                element={<AdminInterviews />}
              />


              {/* =================================================
                  EVALUATION MANAGEMENT
              ================================================= */}

              <Route
                path="/admin/evaluations"
                element={<AdminEvaluations />}
              />


              {/* =================================================
                  JOB MANAGEMENT
              ================================================= */}

              <Route
                path="/admin/jobs"
                element={<AdminJobs />}
              />


              {/* =================================================
                  TEST MANAGEMENT
              ================================================= */}

              <Route
                path="/admin/tests"
                element={<AdminTests />}
              />


              {/* =================================================
                  AI / ML CONFIGURATION
              ================================================= */}

              <Route
                path="/admin/ai-ml"
                element={<AdminAI_ML />}
              />


              {/* =================================================
                  REPORTS
              ================================================= */}

              <Route
                path="/admin/reports"
                element={<AdminReports />}
              />


              {/* =================================================
                  ACCESS CONTROL
              ================================================= */}

              <Route
                path="/admin/access-control"
                element={<AdminAccessControl />}
              />


              {/* =================================================
                  NOTIFICATIONS
              ================================================= */}

              <Route
                path="/admin/notifications"
                element={<AdminNotifications />}
              />

            </Route>

          </Route>

        </Route>


        {/* =====================================================
            UNKNOWN ROUTE
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default AppRoutes;