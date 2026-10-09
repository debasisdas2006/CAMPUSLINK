import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  UserRound,
  GraduationCap,
  Briefcase,
  Code2,
  Eye,
  Video,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./Candidates.css";


/*
============================================================
DEFAULT RECRUITER REQUIREMENTS
============================================================

These are the same defaults used by Requirements.jsx.

This prevents candidates from becoming
0% / Not Eligible simply because the recruiter
has not yet saved requirements.
*/

const DEFAULT_RECRUITER_REQUIREMENTS = {
  degree: "B.Tech",
  minimumCGPA: "6.0",
  experience: "0",
  minimumMatchScore: "60",
  interviewRequired: true,
  requiredLanguages: [],
  technicalSkills: [],
  additionalCriteria: "",
};


/*
============================================================
HELPER FUNCTIONS
============================================================
*/


function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}


function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (
          item &&
          typeof item === "object"
        ) {
          return (
            item.name ||
            item.label ||
            item.value ||
            item.skill ||
            item.language ||
            item.title ||
            ""
          );
        }

        return item;
      })
      .map((item) =>
        String(item ?? "").trim()
      )
      .filter(Boolean);
  }


  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }


  return [];
}


/*
============================================================
NUMBER PARSING
============================================================
*/

function getNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }


  const directNumber =
    Number(value);


  if (
    Number.isFinite(
      directNumber
    )
  ) {
    return directNumber;
  }


  /*
    Also support values such as:

    "8.4 CGPA"
    "8.4/10"
    "6.5"
  */

  const text =
    String(value);


  const match =
    text.match(
      /(\d+(?:\.\d+)?)/
    );


  return match
    ? Number(match[1])
    : 0;
}


/*
============================================================
EXPERIENCE PARSING
============================================================
*/


function getExperienceYears(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }


  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }


  const text =
    normalizeText(value);


  if (
    text === "fresher" ||
    text === "freshers" ||
    text === "none" ||
    text === "no experience" ||
    text === "no exp" ||
    text === "0" ||
    text === "0 year" ||
    text === "0 years"
  ) {
    return 0;
  }


  const match =
    text.match(
      /(\d+(?:\.\d+)?)/
    );


  return match
    ? Number(match[1])
    : 0;
}


/*
============================================================
DEGREE MATCHING
============================================================
*/


function normalizeDegree(value) {
  let text =
    normalizeText(value);


  /*
    Convert common full degree names
    into the same representation.
  */

  text =
    text
      .replace(
        /bachelor of technology/g,
        "btech"
      )
      .replace(
        /bachelor technology/g,
        "btech"
      )
      .replace(
        /master of technology/g,
        "mtech"
      )
      .replace(
        /master technology/g,
        "mtech"
      )
      .replace(
        /bachelor of computer applications/g,
        "bca"
      )
      .replace(
        /master of computer applications/g,
        "mca"
      )
      .replace(
        /bachelor of science/g,
        "bsc"
      )
      .replace(
        /master of science/g,
        "msc"
      );


  return text
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/-/g, "")
    .replace(/\s+/g, "");
}


function degreeMatches(
  studentDegree,
  requiredDegree
) {
  const student =
    normalizeDegree(
      studentDegree
    );


  const required =
    normalizeDegree(
      requiredDegree
    );


  if (
    !required ||
    required === "any" ||
    required === "anydegree"
  ) {
    return true;
  }


  if (!student) {
    return false;
  }


  /*
    Examples:

    B.Tech       -> btech
    B Tech       -> btech
    B.Tech CSE   -> btechcse
    Bachelor of Technology
                 -> btech

    Therefore:

    B.Tech CSE satisfies B.Tech.
  */

  return (
    student === required ||
    student.includes(required) ||
    required.includes(student)
  );
}


/*
============================================================
TEXT / SKILL MATCHING
============================================================
*/


function valueMatches(
  studentValue,
  requiredValue
) {
  const student =
    normalizeText(
      studentValue
    );

  const required =
    normalizeText(
      requiredValue
    );


  if (!required) {
    return true;
  }


  if (!student) {
    return false;
  }


  return (
    student === required ||
    student.includes(required) ||
    required.includes(student)
  );
}


/*
============================================================
PROFILE PHOTO
============================================================
*/


function getProfilePhoto(profile) {
  if (!profile) {
    return "";
  }


  const possiblePhoto =
    profile.profilePhoto ||
    profile.profile_photo ||
    profile.photo ||
    profile.photoUrl ||
    profile.avatar ||
    "";


  return typeof possiblePhoto === "string"
    ? possiblePhoto.trim()
    : "";
}


/*
============================================================
GET STUDENT PROFILE
============================================================
*/


function getStudentProfile(
  email
) {
  if (!email) {
    return null;
  }


  const cleanEmail =
    String(email).trim();


  const lowerEmail =
    cleanEmail.toLowerCase();


  /*
    StudentProfile.jsx saves the current
    profile here first.
  */

  const keys = [
    `campuslink_student_profile_${cleanEmail}`,
    `campuslink_student_profile_${lowerEmail}`,

    /*
      Older profile locations.
    */
    `campuslink_profile_${cleanEmail}`,
    `campuslink_profile_${lowerEmail}`,

    `campuslink_student_${cleanEmail}`,
    `campuslink_student_${lowerEmail}`,
  ];


  for (const key of keys) {
    try {
      const raw =
        localStorage.getItem(key);


      if (!raw) {
        continue;
      }


      const profile =
        JSON.parse(raw);


      if (
        profile &&
        typeof profile === "object"
      ) {
        return profile;
      }
    } catch {
      /*
        Continue searching.
      */
    }
  }


  /*
    Final fallback:
    Search all localStorage entries
    for a profile with matching email.
  */

  try {
    for (
      let index = 0;
      index < localStorage.length;
      index += 1
    ) {
      const key =
        localStorage.key(index);


      if (!key) {
        continue;
      }


      if (
        !key.includes("profile") &&
        !key.includes("student")
      ) {
        continue;
      }


      const raw =
        localStorage.getItem(key);


      if (!raw) {
        continue;
      }


      try {
        const profile =
          JSON.parse(raw);


        if (
          !profile ||
          typeof profile !== "object"
        ) {
          continue;
        }


        const profileEmail =
          String(
            profile.email || ""
          )
            .trim()
            .toLowerCase();


        if (
          profileEmail &&
          profileEmail === lowerEmail
        ) {
          return profile;
        }
      } catch {
        /*
          Ignore invalid JSON.
        */
      }
    }
  } catch {
    /*
      Ignore storage errors.
    */
  }


  return null;
}


/*
============================================================
GET RECRUITER REQUIREMENTS
============================================================
*/


function getRecruiterRequirements(
  email
) {
  if (!email) {
    return {
      ...DEFAULT_RECRUITER_REQUIREMENTS,
    };
  }


  const cleanEmail =
    String(email).trim();


  const lowerEmail =
    cleanEmail.toLowerCase();


  const keys = [
    `campuslink_requirements_${cleanEmail}`,
    `campuslink_requirements_${lowerEmail}`,
  ];


  for (const key of keys) {
    try {
      const raw =
        localStorage.getItem(key);


      if (!raw) {
        continue;
      }


      const requirements =
        JSON.parse(raw);


      if (
        requirements &&
        typeof requirements === "object"
      ) {
        return {
          ...DEFAULT_RECRUITER_REQUIREMENTS,
          ...requirements,

          /*
            Keep empty arrays if recruiter
            intentionally selected none.
          */
          requiredLanguages:
            Array.isArray(
              requirements.requiredLanguages
            )
              ? requirements.requiredLanguages
              : [],

          technicalSkills:
            Array.isArray(
              requirements.technicalSkills
            )
              ? requirements.technicalSkills
              : [],
        };
      }
    } catch {
      /*
        Continue.
      */
    }
  }


  /*
    No saved requirements found.

    Use the same defaults as Requirements.jsx
    instead of returning null and forcing 0%.
  */

  return {
    ...DEFAULT_RECRUITER_REQUIREMENTS,
  };
}


/*
============================================================
CALCULATE CANDIDATE MATCH
============================================================
*/


function calculateCandidateMatch(
  profile,
  requirements
) {
  if (!profile) {
    return {
      score: 0,
      eligible: false,
    };
  }


  /*
    Safety fallback.
  */

  const activeRequirements =
    requirements || {
      ...DEFAULT_RECRUITER_REQUIREMENTS,
    };


  /*
  ----------------------------------------------------------
  STUDENT DATA
  ----------------------------------------------------------
  */

  const studentDegree =
    String(
      profile.degree || ""
    ).trim();


  const studentCGPA =
    getNumber(
      profile.cgpa
    );


  const studentExperience =
    getExperienceYears(
      profile.experience
    );


  const studentLanguages =
    normalizeArray(
      profile.languages
    );


  const studentSkills =
    normalizeArray(
      profile.skills
    );


  /*
  ----------------------------------------------------------
  RECRUITER REQUIREMENTS
  ----------------------------------------------------------
  */

  const requiredDegree =
    String(
      activeRequirements.degree || ""
    ).trim();


  const minimumCGPA =
    getNumber(
      activeRequirements.minimumCGPA
    );


  const minimumExperience =
    getExperienceYears(
      activeRequirements.experience
    );


  const requiredLanguages =
    normalizeArray(
      activeRequirements.requiredLanguages
    );


  const requiredSkills =
    normalizeArray(
      activeRequirements.technicalSkills
    );


  const minimumMatchScore =
    getNumber(
      activeRequirements.minimumMatchScore
    );


  /*
  ----------------------------------------------------------
  DEGREE
  ----------------------------------------------------------
  */

  let degreeEligible = true;
  let degreeScore = 1;


  if (
    requiredDegree &&
    normalizeText(
      requiredDegree
    ) !== "any" &&
    normalizeText(
      requiredDegree
    ) !== "any degree"
  ) {
    degreeEligible =
      degreeMatches(
        studentDegree,
        requiredDegree
      );


    degreeScore =
      degreeEligible
        ? 1
        : 0;
  }


  /*
  ----------------------------------------------------------
  CGPA
  ----------------------------------------------------------
  */

  let cgpaEligible = true;
  let cgpaScore = 1;


  if (
    minimumCGPA > 0
  ) {
    cgpaEligible =
      studentCGPA >=
      minimumCGPA;


    /*
      A student below the minimum still
      receives a partial score instead of
      immediately becoming 0%.
    */

    cgpaScore =
      Math.min(
        studentCGPA /
          minimumCGPA,
        1
      );
  }


  /*
  ----------------------------------------------------------
  EXPERIENCE
  ----------------------------------------------------------
  */

  let experienceEligible =
    true;

  let experienceScore = 1;


  if (
    minimumExperience > 0
  ) {
    experienceEligible =
      studentExperience >=
      minimumExperience;


    experienceScore =
      Math.min(
        studentExperience /
          minimumExperience,
        1
      );
  }


  /*
  ----------------------------------------------------------
  LANGUAGES
  ----------------------------------------------------------
  */

  let languageEligible =
    true;

  let languageScore = 1;


  if (
    requiredLanguages.length > 0
  ) {
    let matchedCount = 0;


    requiredLanguages.forEach(
      (requiredLanguage) => {
        const matched =
          studentLanguages.some(
            (studentLanguage) =>
              valueMatches(
                studentLanguage,
                requiredLanguage
              )
          );


        if (matched) {
          matchedCount += 1;
        }
      }
    );


    languageScore =
      matchedCount /
      requiredLanguages.length;


    languageEligible =
      matchedCount ===
      requiredLanguages.length;
  }


  /*
  ----------------------------------------------------------
  TECHNICAL SKILLS
  ----------------------------------------------------------
  */

  let skillEligible = true;
  let skillScore = 1;


  if (
    requiredSkills.length > 0
  ) {
    /*
      Check both skills and programming
      languages.

      Example:

      Student:
        languages = ["Python"]

      Recruiter:
        technicalSkills = ["Python"]

      This is considered a match.
    */

    const studentTechnicalValues = [
      ...studentSkills,
      ...studentLanguages,
    ];


    let matchedCount = 0;


    requiredSkills.forEach(
      (requiredSkill) => {
        const matched =
          studentTechnicalValues.some(
            (studentSkill) =>
              valueMatches(
                studentSkill,
                requiredSkill
              )
          );


        if (matched) {
          matchedCount += 1;
        }
      }
    );


    skillScore =
      matchedCount /
      requiredSkills.length;


    skillEligible =
      matchedCount ===
      requiredSkills.length;
  }


  /*
  ----------------------------------------------------------
  CALCULATE MATCH SCORE
  ----------------------------------------------------------
  */

  const scoreParts = [
    degreeScore,
    cgpaScore,
    experienceScore,
    languageScore,
    skillScore,
  ];


  const totalScore =
    scoreParts.reduce(
      (total, value) =>
        total + value,
      0
    );


  let score =
    Math.round(
      (totalScore /
        scoreParts.length) *
        100
    );


  score =
    Math.max(
      0,
      Math.min(
        100,
        score
      )
    );


  /*
  ----------------------------------------------------------
  ELIGIBILITY
  ----------------------------------------------------------
  */

  const requirementsMatched =
    degreeEligible &&
    cgpaEligible &&
    experienceEligible &&
    languageEligible &&
    skillEligible;


  const minimumScorePassed =
    minimumMatchScore <= 0 ||
    score >= minimumMatchScore;


  const eligible =
    requirementsMatched &&
    minimumScorePassed;


  return {
    score,
    eligible,
  };
}


/*
============================================================
BUILD REAL CANDIDATE
============================================================
*/


function buildCandidate(
  student,
  profile,
  requirements
) {
  const email =
    String(
      student?.email ||
        profile?.email ||
        ""
    ).trim();


  const match =
    calculateCandidateMatch(
      profile,
      requirements
    );


  return {
    id:
      student?.id ||
      `STUDENT-${email}`,


    name:
      profile?.name ||
      profile?.fullName ||
      profile?.full_name ||
      profile?.studentName ||
      student?.name ||
      "CampusLink Student",


    email,


    college:
      profile?.collegeName ||
      profile?.college ||
      "",


    degree:
      profile?.degree ||
      "",


    branch:
      profile?.branch ||
      "",


    cgpa:
      getNumber(
        profile?.cgpa
      ),


    experience:
      getExperienceYears(
        profile?.experience
      ),


    matchScore:
      match.score,


    eligible:
      match.eligible,


    languages:
      normalizeArray(
        profile?.languages
      ),


    skills:
      normalizeArray(
        profile?.skills
      ),


    /*
      IMPORTANT:
      Keep the student's actual
      profile picture with the candidate.
    */

    profilePhoto:
      getProfilePhoto(
        profile
      ),


    interviewStatus:
      "NOT_STARTED",


    profile,
  };
}


/*
============================================================
COMPONENT
============================================================
*/


function Candidates() {
  const { user } = useAuth();

  const navigate =
    useNavigate();


  const [candidates, setCandidates] =
    useState([]);


  const [search, setSearch] =
    useState("");


  const [filter, setFilter] =
    useState("ALL");


  const [selectedCandidate, setSelectedCandidate] =
    useState(null);


  /*
  ============================================
  DEMO CANDIDATES
  ============================================
  */

  const demoCandidates = [
    {
      id: "STU-001",
      name: "Rahul Sharma",
      email: "rahul@example.com",
      college: "ABC Engineering College",
      degree: "B.Tech",
      branch: "Computer Science",
      cgpa: 8.4,
      experience: 1,
      matchScore: 92,
      eligible: true,
      profilePhoto: "",
      languages: [
        "Python",
        "JavaScript",
      ],
      skills: [
        "React",
        "Node.js",
        "SQL",
        "Git",
      ],
      interviewStatus:
        "NOT_STARTED",
    },


    {
      id: "STU-002",
      name: "Priya Das",
      email: "priya@example.com",
      college: "Tech University",
      degree: "B.Tech",
      branch: "Information Technology",
      cgpa: 8.9,
      experience: 2,
      matchScore: 95,
      eligible: true,
      profilePhoto: "",
      languages: [
        "Python",
        "Java",
      ],
      skills: [
        "Django",
        "REST API",
        "SQL",
        "Git",
      ],
      interviewStatus:
        "COMPLETED",
    },


    {
      id: "STU-003",
      name: "Arjun Patel",
      email: "arjun@example.com",
      college: "National Institute of Technology",
      degree: "B.Tech",
      branch: "Computer Science",
      cgpa: 7.8,
      experience: 0,
      matchScore: 84,
      eligible: true,
      profilePhoto: "",
      languages: [
        "JavaScript",
        "TypeScript",
      ],
      skills: [
        "React",
        "Next.js",
        "MongoDB",
      ],
      interviewStatus:
        "IN_PROGRESS",
    },


    {
      id: "STU-004",
      name: "Sneha Roy",
      email: "sneha@example.com",
      college: "City College",
      degree: "BCA",
      branch: "Computer Applications",
      cgpa: 7.2,
      experience: 0,
      matchScore: 72,
      eligible: false,
      profilePhoto: "",
      languages: [
        "Java",
        "Python",
      ],
      skills: [
        "HTML",
        "CSS",
        "JavaScript",
      ],
      interviewStatus:
        "NOT_STARTED",
    },


    {
      id: "STU-005",
      name: "Amit Kumar",
      email: "amit@example.com",
      college: "Engineering Institute",
      degree: "MCA",
      branch: "Computer Applications",
      cgpa: 8.1,
      experience: 2,
      matchScore: 88,
      eligible: true,
      profilePhoto: "",
      languages: [
        "Python",
        "JavaScript",
      ],
      skills: [
        "FastAPI",
        "React",
        "PostgreSQL",
        "Docker",
      ],
      interviewStatus:
        "NOT_STARTED",
    },


    {
      id: "STU-006",
      name: "Neha Singh",
      email: "neha@example.com",
      college: "Modern College",
      degree: "B.Tech",
      branch: "Electronics",
      cgpa: 6.7,
      experience: 0,
      matchScore: 64,
      eligible: false,
      profilePhoto: "",
      languages: [
        "C",
        "C++",
      ],
      skills: [
        "C++",
        "Embedded Systems",
      ],
      interviewStatus:
        "NOT_STARTED",
    },
  ];


  /*
  ============================================
  LOAD REAL CANDIDATES
  ============================================
  */

  useEffect(() => {
    if (!user?.email) {
      return;
    }


    /*
    --------------------------------------------------------
    GET RECRUITER REQUIREMENTS
    --------------------------------------------------------
    */

    const requirements =
      getRecruiterRequirements(
        user.email
      );


    /*
    --------------------------------------------------------
    GET REGISTERED USERS
    --------------------------------------------------------
    */

    let registeredUsers = [];


    try {
      const savedUsers =
        localStorage.getItem(
          "campuslink_registered_users"
        );


      if (savedUsers) {
        const parsed =
          JSON.parse(
            savedUsers
          );


        if (
          Array.isArray(parsed)
        ) {
          registeredUsers =
            parsed;
        }
      }
    } catch (error) {
      console.error(
        "Could not load registered users:",
        error
      );
    }


    /*
    --------------------------------------------------------
    ONLY STUDENTS
    --------------------------------------------------------
    */

    const students =
      registeredUsers.filter(
        (item) =>
          normalizeText(
            item?.role
          ) === "student"
      );


    /*
    --------------------------------------------------------
    FIND ALL CURRENT STUDENT PROFILES
    --------------------------------------------------------
    */

    const profileStudents =
      [];


    try {
      for (
        let index = 0;
        index < localStorage.length;
        index += 1
      ) {
        const key =
          localStorage.key(index);


        if (!key) {
          continue;
        }


        if (
          !key.startsWith(
            "campuslink_student_profile_"
          )
        ) {
          continue;
        }


        try {
          const raw =
            localStorage.getItem(
              key
            );


          if (!raw) {
            continue;
          }


          const profile =
            JSON.parse(raw);


          if (
            profile &&
            profile.email
          ) {
            profileStudents.push(
              profile
            );
          }
        } catch {
          /*
            Ignore invalid profile.
          */
        }
      }
    } catch {
      /*
        Ignore localStorage errors.
      */
    }


    /*
    --------------------------------------------------------
    COMBINE USERS + PROFILES
    --------------------------------------------------------
    */

    const studentMap =
      new Map();


    students.forEach(
      (student) => {
        const email =
          String(
            student?.email ||
              ""
          )
            .trim()
            .toLowerCase();


        if (email) {
          studentMap.set(
            email,
            student
          );
        }
      }
    );


    profileStudents.forEach(
      (profile) => {
        const email =
          String(
            profile?.email ||
              ""
          )
            .trim()
            .toLowerCase();


        if (!email) {
          return;
        }


        /*
          If profile exists but account
          is not inside registered_users,
          still include it.
        */

        if (
          !studentMap.has(email)
        ) {
          studentMap.set(
            email,
            {
              id:
                `STUDENT-${email}`,

              email:
                profile.email,

              role:
                "student",

              name:
                profile.name ||
                "CampusLink Student",
            }
          );
        }
      }
    );


    /*
    --------------------------------------------------------
    BUILD REAL CANDIDATES
    --------------------------------------------------------
    */

    const realCandidates =
      Array.from(
        studentMap.values()
      )
        .map(
          (student) => {
            const email =
              String(
                student?.email ||
                  ""
              ).trim();


            if (!email) {
              return null;
            }


            const profile =
              getStudentProfile(
                email
              );


            if (!profile) {
              return null;
            }


            return buildCandidate(
              student,
              profile,
              requirements
            );
          }
        )
        .filter(Boolean);


    /*
    --------------------------------------------------------
    IMPORTANT
    --------------------------------------------------------

    If actual student profiles exist,
    use them.

    Only fall back to the old saved
    candidate/demo data when there are
    no real student profiles.
    */

    if (
      realCandidates.length > 0
    ) {
      setCandidates(
        realCandidates
      );

      return;
    }


    /*
    --------------------------------------------------------
    OLD SAVED CANDIDATES
    --------------------------------------------------------
    */

    try {
      const saved =
        localStorage.getItem(
          "campuslink_candidates"
        );


      if (saved) {
        const parsed =
          JSON.parse(saved);


        if (
          Array.isArray(parsed)
        ) {
          setCandidates(
            parsed
          );

          return;
        }
      }
    } catch (error) {
      console.error(
        "Could not load candidates:",
        error
      );
    }


    /*
    --------------------------------------------------------
    DEMO FALLBACK
    --------------------------------------------------------
    */

    setCandidates(
      demoCandidates
    );
  }, [user?.email]);


  /*
  ============================================
  REFRESH WHEN STUDENT PROFILE CHANGES
  ============================================
  */

  useEffect(() => {
    const handleProfileUpdate =
      () => {
        if (!user?.email) {
          return;
        }


        const requirements =
          getRecruiterRequirements(
            user.email
          );


        const updatedCandidates =
          [];


        try {
          for (
            let index = 0;
            index < localStorage.length;
            index += 1
          ) {
            const key =
              localStorage.key(
                index
              );


            if (
              !key ||
              !key.startsWith(
                "campuslink_student_profile_"
              )
            ) {
              continue;
            }


            const raw =
              localStorage.getItem(
                key
              );


            if (!raw) {
              continue;
            }


            const profile =
              JSON.parse(raw);


            if (
              !profile ||
              !profile.email
            ) {
              continue;
            }


            const student = {
              id:
                `STUDENT-${profile.email}`,

              email:
                profile.email,

              role:
                "student",

              name:
                profile.name ||
                "CampusLink Student",
            };


            updatedCandidates.push(
              buildCandidate(
                student,
                profile,
                requirements
              )
            );
          }
        } catch (error) {
          console.error(
            "Could not refresh candidate profiles:",
            error
          );
        }


        if (
          updatedCandidates.length > 0
        ) {
          setCandidates(
            updatedCandidates
          );
        }
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
  }, [user?.email]);


  /*
  ============================================
  FILTER CANDIDATES
  ============================================
  */

  const filteredCandidates =
    useMemo(() => {

      const searchText =
        search
          .trim()
          .toLowerCase();


      return candidates.filter(
        (candidate) => {

          const matchesSearch =
            !searchText ||
            candidate.name
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            candidate.email
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            candidate.college
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            candidate.degree
              ?.toLowerCase()
              .includes(
                searchText
              );


          let matchesFilter =
            true;


          if (
            filter === "ELIGIBLE"
          ) {
            matchesFilter =
              candidate.eligible ===
              true;
          }


          if (
            filter ===
            "NOT_ELIGIBLE"
          ) {
            matchesFilter =
              candidate.eligible ===
              false;
          }


          if (
            filter ===
            "HIGH_MATCH"
          ) {
            matchesFilter =
              Number(
                candidate.matchScore ||
                  0
              ) >= 80;
          }


          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );

    }, [
      candidates,
      search,
      filter,
    ]);


  /*
  ============================================
  STATISTICS
  ============================================
  */

  const totalCandidates =
    candidates.length;


  const eligibleCandidates =
    candidates.filter(
      (candidate) =>
        candidate.eligible
    ).length;


  const highMatchCandidates =
    candidates.filter(
      (candidate) =>
        Number(
          candidate.matchScore ||
            0
        ) >= 80
    ).length;


  const interviewedCandidates =
    candidates.filter(
      (candidate) =>
        candidate.interviewStatus ===
        "COMPLETED"
    ).length;


  /*
  ============================================
  START INTERVIEW
  ============================================
  */

  const handleStartInterview = (
    candidate
  ) => {

    navigate(
      "/recruiter/interviews",
      {
        state: {
          candidate,
        },
      }
    );
  };


  /*
  ============================================
  RENDER
  ============================================
  */

  return (
    <div className="candidates-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="candidates-header">

        <div>

          <div className="candidates-eyebrow">
            RECRUITER
          </div>

          <h1>
            Candidates
          </h1>

          <p>
            Review students, eligibility,
            skills and AI job-match scores.
          </p>

        </div>

        <div className="candidates-header-icon">
          <Users size={28} />
        </div>

      </div>


      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="candidate-stat-grid">

        <div className="candidate-stat-card">

          <div className="candidate-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>
              Total Candidates
            </span>

            <strong>
              {totalCandidates}
            </strong>
          </div>

        </div>


        <div className="candidate-stat-card">

          <div className="candidate-stat-icon">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>
              Eligible
            </span>

            <strong>
              {eligibleCandidates}
            </strong>
          </div>

        </div>


        <div className="candidate-stat-card">

          <div className="candidate-stat-icon">
            <Briefcase size={21} />
          </div>

          <div>
            <span>
              80%+ Match
            </span>

            <strong>
              {highMatchCandidates}
            </strong>
          </div>

        </div>


        <div className="candidate-stat-card">

          <div className="candidate-stat-icon">
            <Video size={21} />
          </div>

          <div>
            <span>
              Interviews Completed
            </span>

            <strong>
              {interviewedCandidates}
            </strong>
          </div>

        </div>

      </div>


      {/* ======================================
          FILTER BAR
      ====================================== */}

      <div className="candidates-filter-card">

        <div className="candidates-search">

          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search candidates..."
          />

        </div>


        <div className="candidate-filter-buttons">

          <button
            className={
              filter === "ALL"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("ALL")
            }
          >
            <Filter size={15} />
            All
          </button>


          <button
            className={
              filter === "ELIGIBLE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("ELIGIBLE")
            }
          >
            Eligible
          </button>


          <button
            className={
              filter === "HIGH_MATCH"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("HIGH_MATCH")
            }
          >
            80%+ Match
          </button>


          <button
            className={
              filter === "NOT_ELIGIBLE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "NOT_ELIGIBLE"
              )
            }
          >
            Not Eligible
          </button>

        </div>

      </div>


      {/* ======================================
          CANDIDATE LIST
      ====================================== */}

      {filteredCandidates.length === 0 ? (

        <div className="no-candidates">

          <UserRound size={34} />

          <h2>
            No Candidates Found
          </h2>

          <p>
            Try changing your search
            or filter.
          </p>

        </div>

      ) : (

        <div className="candidate-list">

          {filteredCandidates.map(
            (candidate) => (

              <div
                className="candidate-card"
                key={candidate.id}
              >

                {/* Candidate header */}

                <div className="candidate-main">

                  <div className="candidate-avatar">

                    {candidate.profilePhoto ? (
                      <img
                        src={
                          candidate.profilePhoto
                        }
                        alt={
                          candidate.name ||
                          "Student"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "inherit",
                          display: "block",
                        }}
                      />
                    ) : (
                      candidate.name
                        ?.charAt(0)
                        .toUpperCase()
                    )}

                  </div>


                  <div className="candidate-info">

                    <div className="candidate-name-row">

                      <h2>
                        {candidate.name}
                      </h2>

                      {candidate.eligible ? (

                        <span className="eligibility-badge eligible">
                          <CheckCircle
                            size={13}
                          />
                          Eligible
                        </span>

                      ) : (

                        <span className="eligibility-badge not-eligible">
                          <XCircle
                            size={13}
                          />
                          Not Eligible
                        </span>

                      )}

                    </div>

                    <p>
                      {candidate.email}
                    </p>

                    <span className="candidate-id">
                      ID: {candidate.id}
                    </span>

                  </div>


                  {/* Match score */}

                  <div className="candidate-match">

                    <span>
                      AI Match
                    </span>

                    <strong>
                      {candidate.matchScore}%
                    </strong>

                  </div>

                </div>


                {/* Candidate details */}

                <div className="candidate-details">

                  <div className="candidate-detail">

                    <GraduationCap size={17} />

                    <div>
                      <small>
                        Education
                      </small>

                      <strong>
                        {candidate.degree}
                      </strong>

                      <span>
                        {candidate.branch}
                      </span>
                    </div>

                  </div>


                  <div className="candidate-detail">

                    <UserRound size={17} />

                    <div>
                      <small>
                        College
                      </small>

                      <strong>
                        {candidate.college}
                      </strong>
                    </div>

                  </div>


                  <div className="candidate-detail">

                    <Briefcase size={17} />

                    <div>
                      <small>
                        Experience
                      </small>

                      <strong>
                        {candidate.experience}{" "}
                        year
                        {candidate.experience ===
                        1
                          ? ""
                          : "s"}
                      </strong>
                    </div>

                  </div>


                  <div className="candidate-detail">

                    <GraduationCap size={17} />

                    <div>
                      <small>
                        CGPA
                      </small>

                      <strong>
                        {candidate.cgpa}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* Languages */}

                <div className="candidate-skills">

                  <div className="candidate-skill-group">

                    <div className="skill-heading">
                      <Code2 size={15} />
                      Programming Languages
                    </div>

                    <div className="candidate-tags">

                      {candidate.languages?.map(
                        (language) => (
                          <span
                            key={language}
                          >
                            {language}
                          </span>
                        )
                      )}

                    </div>

                  </div>


                  <div className="candidate-skill-group">

                    <div className="skill-heading">
                      <Code2 size={15} />
                      Technical Skills
                    </div>

                    <div className="candidate-tags">

                      {candidate.skills?.map(
                        (skill) => (
                          <span
                            key={skill}
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                </div>


                {/* Actions */}

                <div className="candidate-actions">

                  <div className="interview-status">

                    <span>
                      Interview:
                    </span>

                    <strong
                      className={
                        candidate.interviewStatus
                          ?.toLowerCase()
                      }
                    >
                      {candidate.interviewStatus
                        ?.replace(
                          "_",
                          " "
                        )}
                    </strong>

                  </div>


                  <div className="candidate-action-buttons">

                    <button
                      className="candidate-view-button"
                      onClick={() =>
                        setSelectedCandidate(
                          candidate
                        )
                      }
                    >
                      <Eye size={16} />
                      View Profile
                    </button>


                    {candidate.eligible && (
                      <button
                        className="candidate-interview-button"
                        onClick={() =>
                          handleStartInterview(
                            candidate
                          )
                        }
                      >
                        <Video size={16} />
                        Start Interview
                      </button>
                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {/* ======================================
          PROFILE MODAL
      ====================================== */}

      {selectedCandidate && (

        <div
          className="candidate-modal-overlay"
          onClick={() =>
            setSelectedCandidate(null)
          }
        >

          <div
            className="candidate-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="candidate-modal-header">

              <div className="candidate-modal-person">

                <div className="candidate-avatar large">

                  {selectedCandidate.profilePhoto ? (
                    <img
                      src={
                        selectedCandidate.profilePhoto
                      }
                      alt={
                        selectedCandidate.name ||
                        "Student"
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "inherit",
                        display: "block",
                      }}
                    />
                  ) : (
                    selectedCandidate.name
                      ?.charAt(0)
                      .toUpperCase()
                  )}

                </div>

                <div>

                  <h2>
                    {selectedCandidate.name}
                  </h2>

                  <p>
                    {selectedCandidate.email}
                  </p>

                </div>

              </div>


              <button
                className="modal-close-button"
                onClick={() =>
                  setSelectedCandidate(
                    null
                  )
                }
              >
                ×
              </button>

            </div>


            <div className="candidate-modal-body">

              <div className="modal-score-box">

                <span>
                  AI Job Match
                </span>

                <strong>
                  {selectedCandidate.matchScore}%
                </strong>

                <small>
                  Based on profile,
                  skills and job requirements.
                </small>

              </div>


              <div className="modal-information-grid">

                <div>
                  <small>
                    Student ID
                  </small>

                  <strong>
                    {selectedCandidate.id}
                  </strong>
                </div>


                <div>
                  <small>
                    College
                  </small>

                  <strong>
                    {selectedCandidate.college}
                  </strong>
                </div>


                <div>
                  <small>
                    Degree
                  </small>

                  <strong>
                    {selectedCandidate.degree}
                  </strong>
                </div>


                <div>
                  <small>
                    Branch
                  </small>

                  <strong>
                    {selectedCandidate.branch}
                  </strong>
                </div>


                <div>
                  <small>
                    CGPA
                  </small>

                  <strong>
                    {selectedCandidate.cgpa}
                  </strong>
                </div>


                <div>
                  <small>
                    Experience
                  </small>

                  <strong>
                    {selectedCandidate.experience}{" "}
                    years
                  </strong>
                </div>

              </div>


              <div className="modal-skill-section">

                <h3>
                  Programming Languages
                </h3>

                <div className="candidate-tags">

                  {selectedCandidate.languages?.map(
                    (language) => (
                      <span
                        key={language}
                      >
                        {language}
                      </span>
                    )
                  )}

                </div>

              </div>


              <div className="modal-skill-section">

                <h3>
                  Technical Skills
                </h3>

                <div className="candidate-tags">

                  {selectedCandidate.skills?.map(
                    (skill) => (
                      <span
                        key={skill}
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

            </div>


            <div className="candidate-modal-footer">

              <button
                className="candidate-view-button"
                onClick={() =>
                  setSelectedCandidate(
                    null
                  )
                }
              >
                Close
              </button>


              {selectedCandidate.eligible && (
                <button
                  className="candidate-interview-button"
                  onClick={() =>
                    handleStartInterview(
                      selectedCandidate
                    )
                  }
                >
                  <Video size={16} />
                  Start Interview
                </button>
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default Candidates;