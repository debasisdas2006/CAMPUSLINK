import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  GraduationCap,
  Mail,
  X,
  RefreshCw,
} from "lucide-react";

import "./Students.css";

const REGISTERED_USERS_KEY = "campuslink_registered_users";

function safeParse(value, fallback = []) {
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch {
    return fallback;
  }
}

function getRegisteredStudents() {
  const users = safeParse(
    localStorage.getItem(REGISTERED_USERS_KEY) || "[]",
    []
  );

  return Array.isArray(users)
    ? users.filter(
        (user) =>
          String(user?.role || "").toLowerCase() ===
          "student"
      )
    : [];
}

function getStudentProfile(email) {
  if (!email) return null;

  const originalEmail = String(email).trim();
  const cleanEmail = originalEmail.toLowerCase();

  const keys = [
    `campuslink_student_profile_${originalEmail}`,
    `campuslink_student_profile_${cleanEmail}`,
  ];

  for (const key of [...new Set(keys)]) {
    try {
      const saved = localStorage.getItem(key);

      if (!saved) continue;

      const profile = JSON.parse(saved);

      if (profile && typeof profile === "object") {
        return profile;
      }
    } catch (error) {
      console.warn(
        "Could not load student profile:",
        error
      );
    }
  }

  return null;
}

function buildStudents() {
  const registeredStudents = getRegisteredStudents();

  const studentMap = new Map();

  registeredStudents.forEach((student) => {
    const email = String(student?.email || "")
      .trim()
      .toLowerCase();

    if (!email) return;

    const profile = getStudentProfile(email);

    studentMap.set(email, {
      ...student,
      ...(profile || {}),
      email: student.email || profile?.email || email,
      name:
        profile?.name ||
        student.name ||
        "CampusLink Student",
      profilePhoto: profile?.profilePhoto || "",
      collegeName: profile?.collegeName || "",
      degree: profile?.degree || "",
      cgpa: profile?.cgpa || "",
      graduationYear: profile?.graduationYear || "",
      experience: profile?.experience || "",
      languages: Array.isArray(profile?.languages)
        ? profile.languages
        : [],
      skills: Array.isArray(profile?.skills)
        ? profile.skills
        : [],
    });
  });

  /*
   * Also discover profiles that may exist even if
   * the student account was not created through the
   * current registration flow.
   */
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("campuslink_student_profile_")) {
      return;
    }

    const profile = safeParse(
      localStorage.getItem(key) || "null",
      null
    );

    if (!profile || typeof profile !== "object") return;

    const email = String(profile.email || "")
      .trim()
      .toLowerCase();

    if (!email) return;

    if (!studentMap.has(email)) {
      studentMap.set(email, {
        id: profile.id || `STUDENT-${Date.now()}`,
        role: "student",
        email: profile.email,
        name: profile.name || "CampusLink Student",
        profilePhoto: profile.profilePhoto || "",
        collegeName: profile.collegeName || "",
        degree: profile.degree || "",
        cgpa: profile.cgpa || "",
        graduationYear: profile.graduationYear || "",
        experience: profile.experience || "",
        languages: Array.isArray(profile.languages)
          ? profile.languages
          : [],
        skills: Array.isArray(profile.skills)
          ? profile.skills
          : [],
      });
    }
  });

  return Array.from(studentMap.values());
}

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStudents = () => {
    setStudents(buildStudents());
  };

  useEffect(() => {
    loadStudents();

    const handleUpdate = () => {
      loadStudents();
    };

    window.addEventListener("storage", handleUpdate);

    window.addEventListener(
      "campuslink_profile_updated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleUpdate
      );

      window.removeEventListener(
        "campuslink_profile_updated",
        handleUpdate
      );
    };
  }, [refreshKey]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) => {
      const searchableText = [
        student.name,
        student.email,
        student.collegeName,
        student.degree,
        student.experience,
        ...(student.languages || []),
        ...(student.skills || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [students, search]);

  const handleRefresh = () => {
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="admin-students-page">
      <div className="admin-students-header">
        <div>
          <div className="admin-students-eyebrow">
            <Users size={16} />
            STUDENT MANAGEMENT
          </div>

          <h1>Manage Students</h1>

          <p>
            View registered students and their
            CampusLink profile information.
          </p>
        </div>

        <button
          type="button"
          className="admin-students-refresh"
          onClick={handleRefresh}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="admin-students-summary">
        <div className="admin-students-summary-card">
          <div className="admin-students-summary-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total Students</span>
            <strong>{students.length}</strong>
          </div>
        </div>

        <div className="admin-students-summary-card">
          <div className="admin-students-summary-icon">
            <GraduationCap size={21} />
          </div>

          <div>
            <span>Profiles Available</span>
            <strong>
              {
                students.filter(
                  (student) =>
                    student.collegeName ||
                    student.degree ||
                    student.skills?.length
                ).length
              }
            </strong>
          </div>
        </div>
      </div>

      <div className="admin-students-toolbar">
        <div className="admin-students-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, email, college, degree or skill..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <span className="admin-students-count">
          Showing {filteredStudents.length} of{" "}
          {students.length}
        </span>
      </div>

      <section className="admin-students-list">
        {filteredStudents.length === 0 ? (
          <div className="admin-students-empty">
            <Users size={42} />

            <h2>No students found</h2>

            <p>
              {search
                ? "Try a different search term."
                : "No student accounts or profiles are available yet."}
            </p>
          </div>
        ) : (
          filteredStudents.map((student, index) => (
            <div
              className="admin-student-card"
              key={
                student.email ||
                student.id ||
                `student-${index}`
              }
            >
              <div className="admin-student-avatar">
                {student.profilePhoto ? (
                  <img
                    src={student.profilePhoto}
                    alt={student.name}
                  />
                ) : (
                  <UserRound size={25} />
                )}
              </div>

              <div className="admin-student-main">
                <h3>{student.name}</h3>

                <div className="admin-student-email">
                  <Mail size={14} />
                  {student.email}
                </div>

                <div className="admin-student-meta">
                  {student.degree && (
                    <span>
                      <GraduationCap size={14} />
                      {student.degree}
                    </span>
                  )}

                  {student.collegeName && (
                    <span>
                      {student.collegeName}
                    </span>
                  )}

                  {student.cgpa && (
                    <span>
                      CGPA: {student.cgpa}
                    </span>
                  )}
                </div>
              </div>

              <div className="admin-student-actions">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedStudent(student)
                  }
                >
                  View Profile
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {selectedStudent && (
        <div
          className="admin-student-modal-overlay"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="admin-student-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-student-modal-header">
              <div>
                <span>STUDENT PROFILE</span>
                <h2>{selectedStudent.name}</h2>
              </div>

              <button
                type="button"
                className="admin-student-close"
                onClick={() =>
                  setSelectedStudent(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-student-profile-top">
              <div className="admin-student-profile-avatar">
                {selectedStudent.profilePhoto ? (
                  <img
                    src={selectedStudent.profilePhoto}
                    alt={selectedStudent.name}
                  />
                ) : (
                  <UserRound size={30} />
                )}
              </div>

              <div>
                <h3>{selectedStudent.name}</h3>

                <p>{selectedStudent.email}</p>
              </div>
            </div>

            <div className="admin-student-details">
              <div>
                <span>College</span>
                <strong>
                  {selectedStudent.collegeName ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Degree</span>
                <strong>
                  {selectedStudent.degree ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>CGPA</span>
                <strong>
                  {selectedStudent.cgpa ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Graduation Year</span>
                <strong>
                  {selectedStudent.graduationYear ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Experience</span>
                <strong>
                  {selectedStudent.experience ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Account Role</span>
                <strong>Student</strong>
              </div>
            </div>

            <div className="admin-student-profile-section">
              <h3>Programming Languages</h3>

              {selectedStudent.languages?.length ? (
                <div className="admin-student-tags">
                  {selectedStudent.languages.map(
                    (language) => (
                      <span key={language}>
                        {language}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p>No languages added.</p>
              )}
            </div>

            <div className="admin-student-profile-section">
              <h3>Technical Skills</h3>

              {selectedStudent.skills?.length ? (
                <div className="admin-student-tags">
                  {selectedStudent.skills.map(
                    (skill) => (
                      <span key={skill}>{skill}</span>
                    )
                  )}
                </div>
              ) : (
                <p>No technical skills added.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;