import {
  LayoutDashboard,
  Users,
  UserRound,
  Building2,
  Briefcase,
  Settings,
  ClipboardList,
  Video,
  BarChart3,
  BookOpen,
  MessageSquare,
  Brain,
  FileText,
  ShieldCheck,
  Bell,
  FileSearch,
  UserCheck,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./AdminModule.css";

function AdminModule() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Dashboard",
      description:
        "View complete CAMPUSLINK platform overview and system activity.",
      icon: LayoutDashboard,
      path: "/admin",
      category: "Platform",
    },

    {
      title: "Student Management",
      description:
        "Manage students, profiles, performance, assessments and practice.",
      icon: GraduationCap,
      category: "Students",
      children: [
        {
          title: "Students",
          description: "Manage registered student accounts.",
          icon: Users,
          path: "/admin/students",
        },
        {
          title: "Student Profiles",
          description: "View complete student profile information.",
          icon: UserRound,
          path: "/admin/student-profiles",
        },
        {
          title: "Student Jobs",
          description: "Monitor jobs available to students.",
          icon: Briefcase,
          path: "/admin/student-jobs",
        },
        {
          title: "Student Assessments",
          description: "Monitor student assessment activity.",
          icon: ClipboardCheck,
          path: "/admin/student-assessments",
        },
        {
          title: "Student Performance",
          description: "Review student performance information.",
          icon: BarChart3,
          path: "/admin/student-performance",
        },
        {
          title: "Student Practice",
          description: "Review practice questions and activities.",
          icon: BookOpen,
          path: "/admin/student-practice",
        },
        {
          title: "Student Interviews",
          description: "Monitor student interview sessions.",
          icon: Video,
          path: "/admin/student-interviews",
        },
        {
          title: "Student Feedback",
          description: "Review interview and performance feedback.",
          icon: MessageSquare,
          path: "/admin/student-feedback",
        },
      ],
    },

    {
      title: "Recruiter Management",
      description:
        "Manage recruiters, companies, jobs, requirements and candidates.",
      icon: UserCheck,
      category: "Recruiters",
      children: [
        {
          title: "Recruiters",
          description: "Manage recruiter accounts.",
          icon: Users,
          path: "/admin/recruiters",
        },
        {
          title: "Companies",
          description: "Manage registered companies.",
          icon: Building2,
          path: "/admin/companies",
        },
        {
          title: "Recruiter Jobs",
          description: "Monitor recruiter-created jobs.",
          icon: Briefcase,
          path: "/admin/recruiter-jobs",
        },
        {
          title: "Requirements",
          description: "Review recruiter job requirements.",
          icon: Settings,
          path: "/admin/requirements",
        },
        {
          title: "Candidates",
          description: "Review candidates across recruitment activities.",
          icon: Users,
          path: "/admin/candidates",
        },
      ],
    },

    {
      title: "Recruitment Management",
      description:
        "Monitor applications, interviews and candidate evaluations.",
      icon: ClipboardList,
      category: "Recruitment",
      children: [
        {
          title: "Applications",
          description: "Monitor student job applications.",
          icon: ClipboardList,
          path: "/admin/applications",
        },
        {
          title: "Interviews",
          description: "Monitor all interview sessions.",
          icon: Video,
          path: "/admin/interviews",
        },
        {
          title: "Evaluations",
          description: "Review interview evaluations and results.",
          icon: BarChart3,
          path: "/admin/evaluations",
        },
      ],
    },

    {
      title: "Test Management",
      description:
        "Manage assessment, interview and practice question data.",
      icon: ClipboardCheck,
      category: "Testing",
      children: [
        {
          title: "Tests",
          description: "Manage platform test data.",
          icon: ClipboardList,
          path: "/admin/tests",
        },
        {
          title: "Student Assessments",
          description: "Review student assessment records.",
          icon: ClipboardCheck,
          path: "/admin/student-assessments",
        },
        {
          title: "Student Practice",
          description: "Review practice question activity.",
          icon: BookOpen,
          path: "/admin/student-practice",
        },
      ],
    },

    {
      title: "AI / ML Management",
      description:
        "Control AI matching, interview evaluation and monitoring configuration.",
      icon: Brain,
      category: "Artificial Intelligence",
      children: [
        {
          title: "AI / ML Configuration",
          description:
            "Configure AI matching, evaluation and monitoring settings.",
          icon: Brain,
          path: "/admin/ai-ml",
        },
        {
          title: "AI Evaluations",
          description:
            "Review AI-generated interview performance.",
          icon: BarChart3,
          path: "/admin/evaluations",
        },
      ],
    },

    {
      title: "System Management",
      description:
        "Control access, reports, resumes and platform notifications.",
      icon: ShieldCheck,
      category: "System",
      children: [
        {
          title: "Reports",
          description: "View platform-level reports.",
          icon: FileText,
          path: "/admin/reports",
        },
        {
          title: "Access Control",
          description: "Manage user platform access.",
          icon: ShieldCheck,
          path: "/admin/access-control",
        },
        {
          title: "All Resumes",
          description: "Access student resumes available to administrators.",
          icon: FileSearch,
          path: "/resume",
        },
        {
          title: "Notifications",
          description: "Monitor platform notifications.",
          icon: Bell,
          path: "/admin/notifications",
        },
      ],
    },
  ];

  const openPage = (path) => {
    navigate(path);
  };

  return (
    <div className="admin-module-page">
      {/* HEADER */}

      <div className="admin-module-header">
        <div className="admin-module-header-content">
          <div className="admin-module-main-icon">
            <ShieldCheck size={28} />
          </div>

          <div>
            <div className="admin-module-label">
              CAMPUSLINK ADMIN
            </div>

            <h1>Admin Module</h1>

            <p>
              Complete administrative control center for
              students, recruiters, jobs, interviews,
              AI/ML and platform management.
            </p>
          </div>
        </div>

        <div className="admin-module-security">
          <ShieldCheck size={17} />
          <span>Administrator Access</span>
        </div>
      </div>

      {/* PLATFORM STRUCTURE */}

      <div className="admin-module-intro">
        <div>
          <h2>Administration Center</h2>

          <p>
            Select a management area below to access and
            control the corresponding CAMPUSLINK records.
          </p>
        </div>

        <div className="admin-module-count">
          {sections.length} Modules
        </div>
      </div>

      {/* MODULE GROUPS */}

      <div className="admin-module-groups">
        {sections.map((section) => {
          const SectionIcon = section.icon;

          return (
            <section
              className="admin-module-group"
              key={section.title}
            >
              <div className="admin-module-group-header">
                <div className="admin-module-group-title">
                  <div className="admin-module-group-icon">
                    <SectionIcon size={20} />
                  </div>

                  <div>
                    <span>{section.category}</span>
                    <h3>{section.title}</h3>
                  </div>
                </div>

                {section.path && (
                  <button
                    type="button"
                    className="admin-module-open-btn"
                    onClick={() =>
                      openPage(section.path)
                    }
                  >
                    Open
                  </button>
                )}
              </div>

              <p className="admin-module-group-description">
                {section.description}
              </p>

              {section.children && (
                <div className="admin-module-items">
                  {section.children.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <button
                        type="button"
                        className="admin-module-item"
                        key={item.title}
                        onClick={() =>
                          openPage(item.path)
                        }
                      >
                        <div className="admin-module-item-icon">
                          <ItemIcon size={18} />
                        </div>

                        <div className="admin-module-item-content">
                          <h4>{item.title}</h4>

                          <p>
                            {item.description}
                          </p>
                        </div>

                        <span className="admin-module-item-arrow">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ADMIN RESPONSIBILITY */}

      <div className="admin-module-footer">
        <div className="admin-module-footer-icon">
          <Brain size={21} />
        </div>

        <div>
          <h3>AI / ML Integration</h3>

          <p>
            AI configuration controls the AI/ML services
            used for job matching, recommendation,
            interview evaluation and monitoring. The AI/ML
            processing service runs separately from this
            Admin interface.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            openPage("/admin/ai-ml")
          }
        >
          AI Configuration
        </button>
      </div>
    </div>
  );
}

export default AdminModule;