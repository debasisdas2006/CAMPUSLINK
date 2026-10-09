import {
  LayoutDashboard,
  User,
  Briefcase,
  Target,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  Video,
  MessageSquare,
  Building2,
  FilePlus2,
  Settings,
  Users,
  ClipboardList,
  Brain,
  FileText,
  ShieldCheck,
  LogOut,
  Contact,
  Bell,
  ClipboardList as ApplicationsIcon,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import "./Sidebar.css";


function Sidebar() {

  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();


  /* =====================================================
     ROLE
  ===================================================== */

  const role =
    String(
      user?.role || "student"
    )
      .trim()
      .toLowerCase();


  /* =====================================================
     PROFILE DATA
  ===================================================== */

  const [
    profileData,
    setProfileData,
  ] = useState(null);


  /* =====================================================
     LOAD PROFILE FROM LOCAL STORAGE
  ===================================================== */

  const loadProfileData = () => {

    if (
      role !== "student" ||
      !user?.email
    ) {

      setProfileData(null);

      return;

    }


    try {

      const storageKey =
        `campuslink_student_profile_${user.email}`;


      const savedProfile =
        localStorage.getItem(
          storageKey
        );


      if (!savedProfile) {

        setProfileData(null);

        return;

      }


      const parsedProfile =
        JSON.parse(
          savedProfile
        );


      if (
        parsedProfile &&
        typeof parsedProfile === "object"
      ) {

        setProfileData(
          parsedProfile
        );

      } else {

        setProfileData(null);

      }

    } catch (error) {

      console.error(
        "Could not load sidebar profile:",
        error
      );

      setProfileData(null);

    }

  };


  /* =====================================================
     LOAD WHEN USER CHANGES
  ===================================================== */

  useEffect(() => {

    loadProfileData();

  }, [
    role,
    user?.email,
  ]);


  /* =====================================================
     LISTEN FOR PROFILE UPDATE
  ===================================================== */

  useEffect(() => {

    const handleProfileUpdate =
      () => {

        loadProfileData();

      };


    window.addEventListener(
      "campuslink_profile_updated",
      handleProfileUpdate
    );


    return () => {

      window.removeEventListener(
        "campuslink_profile_updated",
        handleProfileUpdate
      );

    };

  }, [
    role,
    user?.email,
  ]);


  /* =====================================================
     FULL DISPLAY NAME
  ===================================================== */

  const displayName = (() => {

    if (
      role === "student" &&
      profileData
    ) {

      const savedName =
        profileData.name ||
        profileData.fullName ||
        "";

      if (
        String(savedName).trim()
      ) {

        return String(
          savedName
        ).trim();

      }

    }


    return (
      String(
        user?.name || ""
      ).trim() ||
      "CampusLink User"
    );

  })();


  /* =====================================================
     PROFILE PHOTO
  ===================================================== */

  const profilePhoto =
    role === "student"
      ? profileData?.profilePhoto || ""
      : "";


  /* =====================================================
     AVATAR LETTER
  ===================================================== */

  const avatarLetter =
    displayName
      .charAt(0)
      .toUpperCase() ||
    "U";


  /* =====================================================
     STUDENT NAVIGATION
  ===================================================== */

  const studentNavigation = [

    {
      label: "Dashboard",
      path: "/student",
      icon: LayoutDashboard,
    },

    {
      label: "Profile",
      path: "/student/profile",
      icon: User,
    },

    {
      label: "Jobs",
      path: "/student/jobs",
      icon: Briefcase,
    },

    {
      label: "Job Matches",
      path: "/student/jobs",
      icon: Target,
    },

    /* =================================================
       NEW: STUDENT APPLICATIONS
    ================================================= */

    {
      label: "My Applications",
      path: "/student/applications",
      icon: ApplicationsIcon,
    },

    {
      label: "Assessments",
      path: "/student/assessments",
      icon: ClipboardCheck,
    },

    {
      label: "Performance",
      path: "/student/performance",
      icon: BarChart3,
    },

    {
      label: "Practice",
      path: "/student/practice",
      icon: BookOpen,
    },

    {
      label: "Skill Gap",
      path: "/student/skill-gap",
      icon: Target,
    },

    {
      label: "AI Interview",
      path: "/student/ai-interview",
      icon: Video,
    },

    {
      label: "Feedback",
      path: "/student/feedback",
      icon: MessageSquare,
    },

    /* =================================================
       EXISTING RESUME
    ================================================= */

    {
      label: "My Resume",
      path: "/resume",
      icon: FileText,
    },

    /* =================================================
       NEW: STUDENT NOTIFICATIONS
    ================================================= */

    {
      label: "Notifications",
      path: "/student/notifications",
      icon: Bell,
    },

    {
      label: "Contact Us",
      path: "/contact-us",
      icon: Contact,
    },

  ];


  /* =====================================================
     RECRUITER NAVIGATION
  ===================================================== */

  const recruiterNavigation = [

    {
      label: "Dashboard",
      path: "/recruiter",
      icon: LayoutDashboard,
    },

    {
      label: "Company",
      path: "/recruiter/company",
      icon: Building2,
    },

    {
      label: "Jobs",
      path: "/recruiter/jobs",
      icon: Briefcase,
    },

    {
      label: "Create Job",
      path: "/recruiter/jobs/create",
      icon: FilePlus2,
    },

    {
      label: "Requirements",
      path: "/recruiter/requirements",
      icon: Settings,
    },

    /* =================================================
       NEW: RECRUITER APPLICATIONS
    ================================================= */

    {
      label: "Applications",
      path: "/recruiter/applications",
      icon: ApplicationsIcon,
    },

    {
      label: "Candidates",
      path: "/recruiter/candidates",
      icon: Users,
    },

    {
      label: "Interviews",
      path: "/recruiter/interviews",
      icon: Video,
    },

    {
      label: "Evaluation",
      path: "/recruiter/evaluation",
      icon: BarChart3,
    },

    {
      label: "Candidate Resumes",
      path: "/resume",
      icon: FileText,
    },

    /* =================================================
       NEW: RECRUITER NOTIFICATIONS
    ================================================= */

    {
      label: "Notifications",
      path: "/recruiter/notifications",
      icon: Bell,
    },

    {
      label: "Contact Us",
      path: "/contact-us",
      icon: Contact,
    },

  ];


  /* =====================================================
     ADMIN NAVIGATION
  ===================================================== */

  const adminNavigation = [

    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },

    {
      label: "Students",
      path: "/admin/students",
      icon: Users,
    },

    {
      label: "Student Profiles",
      path: "/admin/student-profiles",
      icon: User,
    },

    {
      label: "Student Jobs",
      path: "/admin/student-jobs",
      icon: Briefcase,
    },

    {
      label: "Student Assessments",
      path: "/admin/student-assessments",
      icon: ClipboardCheck,
    },

    {
      label: "Student Performance",
      path: "/admin/student-performance",
      icon: BarChart3,
    },

    {
      label: "Student Practice",
      path: "/admin/student-practice",
      icon: BookOpen,
    },

    {
      label: "Student Interviews",
      path: "/admin/student-interviews",
      icon: Video,
    },

    {
      label: "Student Feedback",
      path: "/admin/student-feedback",
      icon: MessageSquare,
    },

    {
      label: "Recruiters",
      path: "/admin/recruiters",
      icon: Users,
    },

    {
      label: "Companies",
      path: "/admin/companies",
      icon: Building2,
    },

    {
      label: "Recruiter Jobs",
      path: "/admin/recruiter-jobs",
      icon: Briefcase,
    },

    {
      label: "Requirements",
      path: "/admin/requirements",
      icon: Settings,
    },

    /* =================================================
       ADMIN APPLICATIONS
    ================================================= */

    {
      label: "Applications",
      path: "/admin/applications",
      icon: ApplicationsIcon,
    },

    {
      label: "Candidates",
      path: "/admin/candidates",
      icon: Users,
    },

    {
      label: "Interviews",
      path: "/admin/interviews",
      icon: Video,
    },

    {
      label: "Evaluations",
      path: "/admin/evaluations",
      icon: BarChart3,
    },

    {
      label: "Jobs",
      path: "/admin/jobs",
      icon: Briefcase,
    },

    {
      label: "Tests",
      path: "/admin/tests",
      icon: ClipboardList,
    },

    {
      label: "AI/ML Configuration",
      path: "/admin/ai-ml",
      icon: Brain,
    },

    {
      label: "Reports",
      path: "/admin/reports",
      icon: FileText,
    },

    {
      label: "Access Control",
      path: "/admin/access-control",
      icon: ShieldCheck,
    },

    {
      label: "All Resumes",
      path: "/resume",
      icon: FileText,
    },

    /* =================================================
       ADMIN NOTIFICATIONS
    ================================================= */

    {
      label: "Notifications",
      path: "/admin/notifications",
      icon: Bell,
    },

    {
      label: "Contact Us",
      path: "/contact-us",
      icon: Contact,
    },

  ];


  /* =====================================================
     SELECT NAVIGATION
  ===================================================== */

  let navigation = [];


  if (
    role === "student"
  ) {

    navigation =
      studentNavigation;

  } else if (
    role === "recruiter"
  ) {

    navigation =
      recruiterNavigation;

  } else if (
    role === "admin"
  ) {

    navigation =
      adminNavigation;

  }


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <aside className="sidebar">


      {/* =================================================
          BRAND
      ================================================= */}

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          C
        </div>


        <div className="sidebar-brand-text">

          <h2>
            CAMPUSLINK
          </h2>

          <span>
            Career Intelligence Platform
          </span>

        </div>

      </div>


      {/* =================================================
          USER
      ================================================= */}

      <div className="sidebar-user">


        {/* =================================================
            USER PHOTO / AVATAR
        ================================================= */}

        <div
          className="sidebar-user-avatar"
          style={{
            overflow: "hidden",
            padding: 0,
          }}
        >

          {profilePhoto ? (

            <img
              src={profilePhoto}
              alt={displayName}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                borderRadius: "inherit",
              }}

              onError={(event) => {

                event.currentTarget.style.display =
                  "none";

              }}

            />

          ) : (

            <span>
              {avatarLetter}
            </span>

          )}

        </div>


        {/* =================================================
            USER INFORMATION
        ================================================= */}

        <div className="sidebar-user-info">

          <strong>
            {displayName}
          </strong>

          <span>

            {role
              .charAt(0)
              .toUpperCase() +
              role.slice(1)}

          </span>

        </div>

      </div>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="sidebar-navigation">


        <div className="sidebar-section-title">

          {role === "student"
            ? "STUDENT"
            : role === "recruiter"
              ? "RECRUITER"
              : "ADMIN"}

        </div>


        {navigation.map(
          (
            item,
            index
          ) => {

            const Icon =
              item.icon;


            return (

              <NavLink
                key={`${item.path}-${index}`}
                to={item.path}

                end={
                  item.path ===
                    "/student" ||
                  item.path ===
                    "/recruiter" ||
                  item.path ===
                    "/admin"
                }

                className={({
                  isActive,
                }) =>
                  `sidebar-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >

                <Icon
                  size={19}
                  strokeWidth={2}
                />

                <span>
                  {item.label}
                </span>

              </NavLink>

            );

          }
        )}

      </nav>


      {/* =================================================
          LOGOUT
      ================================================= */}

      <div className="sidebar-bottom">

        <button
          type="button"
          className="sidebar-logout"
          onClick={
            handleLogout
          }
        >

          <LogOut
            size={19}
            strokeWidth={2}
          />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>

  );

}


export default Sidebar;