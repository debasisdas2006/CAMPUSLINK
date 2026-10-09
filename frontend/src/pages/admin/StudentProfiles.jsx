import { useEffect, useMemo, useState } from "react";
import { Search, User, X } from "lucide-react";
import "./StudentProfiles.css";

function safeParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function StudentProfiles() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = () => {
    const users = safeParse(
      localStorage.getItem("campuslink_registered_users") || "[]",
      []
    );

    const registeredStudents = Array.isArray(users)
      ? users.filter(
          (user) =>
            String(user?.role || "").toLowerCase() === "student"
        )
      : [];

    const profileStudents = [];

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);

      if (!key || !key.startsWith("campuslink_student_profile_")) {
        continue;
      }

      const profile = safeParse(
        localStorage.getItem(key) || "{}",
        {}
      );

      if (profile && typeof profile === "object") {
        profileStudents.push(profile);
      }
    }

    const combined = [
      ...registeredStudents.map((student) => {
        const email = String(student?.email || "").toLowerCase();

        const profile = profileStudents.find(
          (item) =>
            String(item?.email || "").toLowerCase() === email
        );

        return {
          ...student,
          ...profile,
          email: student?.email || profile?.email || "",
          name: profile?.name || student?.name || "Student",
        };
      }),
      ...profileStudents.filter((profile) => {
        const email = String(profile?.email || "").toLowerCase();

        return !registeredStudents.some(
          (student) =>
            String(student?.email || "").toLowerCase() === email
        );
      }),
    ];

    const uniqueStudents = [];

    combined.forEach((student) => {
      const email = String(student?.email || "").toLowerCase();

      const exists = uniqueStudents.some(
        (item) =>
          String(item?.email || "").toLowerCase() === email &&
          email !== ""
      );

      if (!exists) {
        uniqueStudents.push(student);
      }
    });

    setStudents(uniqueStudents);
  };

  useEffect(() => {
    loadStudents();

    const handleStorage = () => loadStudents();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "campuslink_profile_updated",
      handleStorage
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "campuslink_profile_updated",
        handleStorage
      );
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) => {
      const text = [
        student?.name,
        student?.email,
        student?.collegeName,
        student?.degree,
        student?.cgpa,
        student?.graduationYear,
        student?.experience,
        ...(Array.isArray(student?.languages)
          ? student.languages
          : []),
        ...(Array.isArray(student?.skills)
          ? student.skills
          : []),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [students, search]);

  return (
    <div className="admin-student-profiles-page">
      <div className="student-profiles-header">
        <div>
          <p className="student-profiles-eyebrow">
            ADMINISTRATION
          </p>

          <h1>Student Profiles</h1>

          <p>
            View student education, skills, experience and profile
            information.
          </p>
        </div>

        <div className="student-profiles-count">
          <User size={20} />
          <span>{students.length}</span>
        </div>
      </div>

      <div className="student-profiles-toolbar">
        <div className="student-profiles-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search student, college, degree or skill..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="student-profiles-empty">
          <User size={42} />

          <h3>No student profiles found</h3>

          <p>
            Student profiles will appear here after students create
            their profiles.
          </p>
        </div>
      ) : (
        <div className="student-profiles-grid">
          {filteredStudents.map((student, index) => {
            const skills = Array.isArray(student?.skills)
              ? student.skills
              : [];

            const languages = Array.isArray(student?.languages)
              ? student.languages
              : [];

            return (
              <div
                className="student-profile-card"
                key={
                  student?.email ||
                  student?.id ||
                  `student-${index}`
                }
              >
                <div className="student-profile-card-top">
                  <div className="student-profile-avatar">
                    {student?.profilePhoto ? (
                      <img
                        src={student.profilePhoto}
                        alt={student?.name || "Student"}
                      />
                    ) : (
                      String(student?.name || "S")
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <div>
                    <h3>{student?.name || "Student"}</h3>

                    <p>
                      {student?.email || "Email not available"}
                    </p>
                  </div>
                </div>

                <div className="student-profile-card-info">
                  <div>
                    <span>College</span>
                    <strong>
                      {student?.collegeName || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Degree</span>
                    <strong>
                      {student?.degree || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>CGPA</span>
                    <strong>
                      {student?.cgpa || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Experience</span>
                    <strong>
                      {student?.experience || "Fresher"}
                    </strong>
                  </div>
                </div>

                <div className="student-profile-tags">
                  {skills.slice(0, 4).map((skill, skillIndex) => (
                    <span key={`${skill}-${skillIndex}`}>
                      {skill}
                    </span>
                  ))}

                  {skills.length === 0 &&
                    languages.slice(0, 2).map(
                      (language, languageIndex) => (
                        <span
                          key={`${language}-${languageIndex}`}
                        >
                          {language}
                        </span>
                      )
                    )}
                </div>

                <button
                  type="button"
                  className="student-profile-view-button"
                  onClick={() => setSelectedStudent(student)}
                >
                  View Full Profile
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedStudent && (
        <div
          className="student-profile-modal-overlay"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="student-profile-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="student-profile-modal-close"
              onClick={() => setSelectedStudent(null)}
            >
              <X size={20} />
            </button>

            <div className="student-profile-modal-header">
              <div className="student-profile-modal-avatar">
                {selectedStudent?.profilePhoto ? (
                  <img
                    src={selectedStudent.profilePhoto}
                    alt={selectedStudent?.name || "Student"}
                  />
                ) : (
                  String(selectedStudent?.name || "S")
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div>
                <h2>
                  {selectedStudent?.name || "Student"}
                </h2>

                <p>
                  {selectedStudent?.email ||
                    "Email not available"}
                </p>
              </div>
            </div>

            <div className="student-profile-modal-details">
              <div>
                <span>College</span>
                <strong>
                  {selectedStudent?.collegeName ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Degree</span>
                <strong>
                  {selectedStudent?.degree || "Not provided"}
                </strong>
              </div>

              <div>
                <span>CGPA</span>
                <strong>
                  {selectedStudent?.cgpa || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Graduation Year</span>
                <strong>
                  {selectedStudent?.graduationYear ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Experience</span>
                <strong>
                  {selectedStudent?.experience || "Fresher"}
                </strong>
              </div>

              <div>
                <span>Languages</span>
                <strong>
                  {Array.isArray(selectedStudent?.languages) &&
                  selectedStudent.languages.length > 0
                    ? selectedStudent.languages.join(", ")
                    : "Not provided"}
                </strong>
              </div>

              <div className="student-profile-modal-full">
                <span>Technical Skills</span>
                <strong>
                  {Array.isArray(selectedStudent?.skills) &&
                  selectedStudent.skills.length > 0
                    ? selectedStudent.skills.join(", ")
                    : "Not provided"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfiles;