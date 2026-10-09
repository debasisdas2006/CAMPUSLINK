import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  Code2,
  GraduationCap,
  MapPin,
  Search,
  Target,
  Users,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./Jobs.css";


function Jobs() {

  const navigate = useNavigate();
  const { user } = useAuth();


  /* =====================================================
     STATE
  ===================================================== */

  const [jobs, setJobs] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  const [studentProfile, setStudentProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  /* =====================================================
     LOAD STUDENT PROFILE
  ===================================================== */

  useEffect(() => {

    if (!user?.email) {
      setStudentProfile(null);
      return;
    }

    try {

      const storageKey =
        `campuslink_student_profile_${user.email}`;

      const savedProfile =
        localStorage.getItem(storageKey);

      if (savedProfile) {

        const parsedProfile =
          JSON.parse(savedProfile);

        setStudentProfile(parsedProfile);

      } else {

        setStudentProfile({
          fullName:
            user.name || "",
          email:
            user.email || "",
          college:
            user.college || "",
          degree: "",
          branch: "",
          cgpa: "",
          graduationYear: "",
          experience: "",
          previousRole: "",
          programmingLanguages: [],
          technicalSkills: [],
        });

      }

    } catch (error) {

      console.error(
        "Could not load student profile:",
        error
      );

      setStudentProfile(null);
    }

  }, [user]);


  /* =====================================================
     LOAD ALL RECRUITER JOBS
     
     Every recruiter stores jobs using:
     
     campuslink_jobs_<recruiter-email>
     
     We collect all of them for students.
  ===================================================== */

  useEffect(() => {

    const loadJobs = () => {

      setLoading(true);

      try {

        const allJobs = [];

        for (
          let index = 0;
          index < localStorage.length;
          index++
        ) {

          const key =
            localStorage.key(index);

          if (
            !key ||
            !key.startsWith(
              "campuslink_jobs_"
            )
          ) {
            continue;
          }

          try {

            const stored =
              localStorage.getItem(key);

            const recruiterJobs =
              JSON.parse(stored);

            if (
              Array.isArray(
                recruiterJobs
              )
            ) {

              recruiterJobs.forEach(
                (job) => {

                  if (!job) {
                    return;
                  }

                  allJobs.push({
                    ...job,
                    source:
                      "RECRUITER",
                  });

                }
              );

            }

          } catch (error) {

            console.error(
              "Could not read jobs from:",
              key,
              error
            );

          }

        }


        /* =================================================
           DEMO JOBS

           Keep these so the page does not become empty
           before recruiters create real jobs.
        ================================================= */

        const demoJobs = [

          {
            id:
              "DEMO-001",

            title:
              "Python Developer",

            companyName:
              "ABC Technologies",

            location:
              "Bangalore",

            employmentType:
              "Full Time",

            degree:
              "B.Tech / B.E.",

            minimumCGPA:
              7,

            experience:
              1,

            openings:
              5,

            requiredLanguages:
              ["Python"],

            technicalSkills:
              ["Django", "SQL"],

            description:
              "Python development role involving backend development and API integration.",

            status:
              "ACTIVE",

            source:
              "DEMO",
          },


          {
            id:
              "DEMO-002",

            title:
              "Full Stack Developer",

            companyName:
              "TechNova Solutions",

            location:
              "Hyderabad",

            employmentType:
              "Full Time",

            degree:
              "B.Tech / B.E.",

            minimumCGPA:
              7,

            experience:
              1,

            openings:
              3,

            requiredLanguages:
              ["JavaScript", "Python"],

            technicalSkills:
              ["React", "Node.js", "SQL"],

            description:
              "Full stack development role working with modern web technologies.",

            status:
              "ACTIVE",

            source:
              "DEMO",
          },


          {
            id:
              "DEMO-003",

            title:
              "Machine Learning Engineer",

            companyName:
              "AI Labs",

            location:
              "Pune",

            employmentType:
              "Full Time",

            degree:
              "B.Tech / B.E.",

            minimumCGPA:
              7.5,

            experience:
              1,

            openings:
              2,

            requiredLanguages:
              ["Python"],

            technicalSkills:
              [
                "Machine Learning",
                "Python",
                "SQL",
              ],

            description:
              "Machine learning role focused on model development and data processing.",

            status:
              "ACTIVE",

            source:
              "DEMO",
          },


          {
            id:
              "DEMO-004",

            title:
              "Java Developer",

            companyName:
              "CloudWorks",

            location:
              "Chennai",

            employmentType:
              "Full Time",

            degree:
              "B.Tech / B.E.",

            minimumCGPA:
              7,

            experience:
              2,

            openings:
              4,

            requiredLanguages:
              ["Java"],

            technicalSkills:
              ["Spring Boot", "SQL"],

            description:
              "Java backend development opportunity.",

            status:
              "ACTIVE",

            source:
              "DEMO",
          },


          {
            id:
              "DEMO-005",

            title:
              "Frontend Developer",

            companyName:
              "WebSphere Technologies",

            location:
              "Bangalore",

            employmentType:
              "Full Time",

            degree:
              "B.Tech / B.E.",

            minimumCGPA:
              7,

            experience:
              0,

            openings:
              5,

            requiredLanguages:
              ["JavaScript"],

            technicalSkills:
              ["React", "HTML", "CSS"],

            description:
              "Frontend development role using React and modern web technologies.",

            status:
              "ACTIVE",

            source:
              "DEMO",
          },


          {
            id:
              "DEMO-006",

            title:
              "Data Analyst",

            companyName:
              "DataCore",

            location:
              "Mumbai",

            employmentType:
              "Full Time",

            degree:
              "B.Tech / B.E.",

            minimumCGPA:
              6.5,

            experience:
              0,

            openings:
              3,

            requiredLanguages:
              ["Python", "SQL"],

            technicalSkills:
              [
                "SQL",
                "Excel",
                "Data Analysis",
              ],

            description:
              "Analyze business data and generate actionable insights.",

            status:
              "ACTIVE",

            source:
              "DEMO",
          },

        ];


        /* =================================================
           REMOVE DEMO JOB IF SAME REAL JOB EXISTS
        ================================================= */

        const realJobIds =
          new Set(
            allJobs.map(
              (job) =>
                String(
                  job.id || ""
                )
            )
          );


        const filteredDemoJobs =
          demoJobs.filter(
            (job) =>
              !realJobIds.has(
                String(job.id)
              )
          );


        const combinedJobs = [
          ...allJobs,
          ...filteredDemoJobs,
        ];


        /* Newest jobs first */

        combinedJobs.sort(
          (a, b) => {

            const dateA =
              new Date(
                a.createdAt || 0
              ).getTime();

            const dateB =
              new Date(
                b.createdAt || 0
              ).getTime();

            return dateB - dateA;
          }
        );


        setJobs(combinedJobs);

      } catch (error) {

        console.error(
          "Could not load jobs:",
          error
        );

        setJobs([]);

      } finally {

        setLoading(false);

      }

    };


    loadJobs();


    /* =================================================
       UPDATE WHEN TAB / PAGE DATA CHANGES
    ================================================= */

    window.addEventListener(
      "storage",
      loadJobs
    );


    return () => {

      window.removeEventListener(
        "storage",
        loadJobs
      );

    };

  }, []);


  /* =====================================================
     NORMALIZE TEXT
  ===================================================== */

  const normalize =
    (value) =>
      String(value || "")
        .trim()
        .toLowerCase();


  /* =====================================================
     CONVERT ARRAY
  ===================================================== */

  const normalizeArray =
    (value) => {

      if (Array.isArray(value)) {

        return value
          .map(normalize)
          .filter(Boolean);

      }

      if (
        typeof value === "string"
      ) {

        return value
          .split(",")
          .map(normalize)
          .filter(Boolean);

      }

      return [];

    };


  /* =====================================================
     STUDENT MATCH CALCULATION
  ===================================================== */

  const calculateJobMatch =
    (job) => {

      if (!studentProfile) {

        return {
          match: 0,
          eligible: false,
          reasons: [],
        };

      }


      let totalCriteria = 0;

      let passedCriteria = 0;

      const reasons = [];


      /* =================================================
         CGPA
      ================================================= */

      const studentCGPA =
        Number(
          studentProfile.cgpa || 0
        );

      const requiredCGPA =
        Number(
          job.minimumCGPA || 0
        );


      if (
        requiredCGPA > 0
      ) {

        totalCriteria++;

        if (
          studentCGPA >=
          requiredCGPA
        ) {

          passedCriteria++;

          reasons.push({
            type: "PASS",
            text:
              `CGPA ${studentCGPA} meets minimum ${requiredCGPA}`,
          });

        } else {

          reasons.push({
            type: "FAIL",
            text:
              `CGPA ${studentCGPA} is below minimum ${requiredCGPA}`,
          });

        }

      }


      /* =================================================
         EXPERIENCE
      ================================================= */

      const studentExperience =
        Number(
          studentProfile.experience || 0
        );

      const requiredExperience =
        Number(
          job.experience || 0
        );


      if (
        requiredExperience > 0
      ) {

        totalCriteria++;

        if (
          studentExperience >=
          requiredExperience
        ) {

          passedCriteria++;

          reasons.push({
            type: "PASS",
            text:
              `Experience ${studentExperience} year(s) meets requirement`,
          });

        } else {

          reasons.push({
            type: "FAIL",
            text:
              `Experience requirement: ${requiredExperience} year(s)`,
          });

        }

      }


      /* =================================================
         DEGREE
      ================================================= */

      const requiredDegree =
        normalize(
          job.degree
        );

      const studentDegree =
        normalize(
          studentProfile.degree
        );


      if (
        requiredDegree &&
        requiredDegree !==
          "any"
      ) {

        totalCriteria++;

        const degreeMatches =
          !studentDegree ||
          requiredDegree.includes(
            studentDegree
          ) ||
          studentDegree.includes(
            requiredDegree
          );


        if (
          degreeMatches
        ) {

          passedCriteria++;

          reasons.push({
            type: "PASS",
            text:
              "Education requirement matched",
          });

        } else {

          reasons.push({
            type: "FAIL",
            text:
              `Required degree: ${job.degree}`,
          });

        }

      }


      /* =================================================
         PROGRAMMING LANGUAGES
      ================================================= */

      const requiredLanguages =
        normalizeArray(
          job.requiredLanguages ||
          job.languages
        );

      const studentLanguages =
        normalizeArray(
          studentProfile.programmingLanguages ||
          studentProfile.languages
        );


      if (
        requiredLanguages.length > 0
      ) {

        totalCriteria++;

        const languageMatches =
          requiredLanguages.filter(
            (required) =>
              studentLanguages.some(
                (studentLanguage) =>
                  studentLanguage.includes(
                    required
                  ) ||
                  required.includes(
                    studentLanguage
                  )
              )
          );


        const languageRatio =
          languageMatches.length /
          requiredLanguages.length;


        if (
          languageMatches.length > 0
        ) {

          passedCriteria +=
            languageRatio;

          reasons.push({
            type:
              languageRatio >= 1
                ? "PASS"
                : "PARTIAL",

            text:
              `${languageMatches.length}/${requiredLanguages.length} required language(s) matched`,
          });

        } else {

          reasons.push({
            type: "FAIL",
            text:
              "Required programming languages not matched",
          });

        }

      }


      /* =================================================
         TECHNICAL SKILLS
      ================================================= */

      const requiredSkills =
        normalizeArray(
          job.technicalSkills ||
          job.skills
        );

      const studentSkills =
        normalizeArray(
          studentProfile.technicalSkills ||
          studentProfile.skills
        );


      if (
        requiredSkills.length > 0
      ) {

        totalCriteria++;

        const skillMatches =
          requiredSkills.filter(
            (required) =>
              studentSkills.some(
                (studentSkill) =>
                  studentSkill.includes(
                    required
                  ) ||
                  required.includes(
                    studentSkill
                  )
              )
          );


        const skillRatio =
          skillMatches.length /
          requiredSkills.length;


        if (
          skillMatches.length > 0
        ) {

          passedCriteria +=
            skillRatio;

          reasons.push({
            type:
              skillRatio >= 1
                ? "PASS"
                : "PARTIAL",

            text:
              `${skillMatches.length}/${requiredSkills.length} technical skill(s) matched`,
          });

        } else {

          reasons.push({
            type: "FAIL",
            text:
              "Technical skill requirements not matched",
          });

        }

      }


      /* =================================================
         CALCULATE FINAL MATCH
      ================================================= */

      let match = 0;


      if (
        totalCriteria > 0
      ) {

        match =
          Math.round(
            (
              passedCriteria /
              totalCriteria
            ) * 100
          );

      } else {

        match = 100;

      }


      /* =================================================
         ELIGIBILITY
         
         Hard requirements:
         - CGPA
         - Experience
         - Degree
         
         Skill/language matching contributes to score.
      ================================================= */

      const hardRequirementFailed =
        reasons.some(
          (item) =>
            item.type === "FAIL" &&
            (
              item.text
                .toLowerCase()
                .includes("cgpa") ||
              item.text
                .toLowerCase()
                .includes("experience") ||
              item.text
                .toLowerCase()
                .includes("degree")
            )
        );


      const eligible =
        !hardRequirementFailed &&
        match >= 60;


      return {
        match,
        eligible,
        reasons,
      };

    };


  /* =====================================================
     ADD MATCH INFORMATION TO JOBS
  ===================================================== */

  const jobsWithMatch =
    useMemo(() => {

      return jobs.map(
        (job) => {

          const result =
            calculateJobMatch(job);

          return {
            ...job,
            calculatedMatch:
              result.match,
            calculatedEligible:
              result.eligible,
            matchReasons:
              result.reasons,
          };

        }
      );

    }, [jobs, studentProfile]);


  /* =====================================================
     FILTER JOBS
  ===================================================== */

  const filteredJobs =
    useMemo(() => {

      const search =
        normalize(
          searchTerm
        );


      return jobsWithMatch.filter(
        (job) => {

          const matchesSearch =
            !search ||
            normalize(
              job.title
            ).includes(search) ||
            normalize(
              job.companyName
            ).includes(search) ||
            normalize(
              job.location
            ).includes(search) ||
            normalizeArray(
              job.technicalSkills
            ).some(
              (skill) =>
                skill.includes(search)
            );


          if (!matchesSearch) {
            return false;
          }


          if (
            filter === "ELIGIBLE"
          ) {

            return job.calculatedEligible;

          }


          if (
            filter === "MATCH_80"
          ) {

            return (
              job.calculatedMatch >=
              80
            );

          }


          if (
            filter === "NOT_ELIGIBLE"
          ) {

            return !job.calculatedEligible;

          }


          return true;

        }
      );

    }, [
      jobsWithMatch,
      searchTerm,
      filter,
    ]);


  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalJobs =
    jobsWithMatch.length;

  const eligibleJobs =
    jobsWithMatch.filter(
      (job) =>
        job.calculatedEligible
    ).length;

  const highMatchJobs =
    jobsWithMatch.filter(
      (job) =>
        job.calculatedMatch >= 80
    ).length;


  /* =====================================================
     MATCH CLASS
  ===================================================== */

  const getMatchClass =
    (score) => {

      if (score >= 80) {
        return "excellent";
      }

      if (score >= 60) {
        return "good";
      }

      return "low";

    };


  /* =====================================================
     VIEW JOB
  ===================================================== */

  const handleViewDetails =
    (job) => {

      /*
       * JobDetails page can use this state later.
       */

      navigate(
        `/student/jobs/${job.id}`,
        {
          state: {
            job,
            match:
              job.calculatedMatch,
            eligible:
              job.calculatedEligible,
          },
        }
      );

    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (
      <div className="student-jobs-page">

        <div className="jobs-loading">

          <div className="jobs-loading-spinner" />

          <p>
            Loading job opportunities...
          </p>

        </div>

      </div>
    );

  }


  return (

    <div className="student-jobs-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <section className="jobs-header">

        <div>

          <div className="jobs-kicker">
            CAREER OPPORTUNITIES
          </div>

          <h1>
            Job Opportunities
          </h1>

          <p>
            Discover jobs matched with your
            education, skills and experience.
          </p>

        </div>


        <div className="jobs-header-icon">

          <Briefcase
            size={27}
          />

        </div>

      </section>


      {/* =================================================
          PROFILE WARNING
      ================================================= */}

      {!studentProfile && (

        <div className="jobs-profile-warning">

          <Target
            size={18}
          />

          <div>

            <strong>
              Complete your profile
            </strong>

            <span>
              Add your degree, CGPA, experience
              and skills to calculate accurate
              job eligibility and match percentage.
            </span>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/profile"
              )
            }
          >
            Complete Profile
          </button>

        </div>

      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="jobs-stat-grid">


        <div className="jobs-stat-card">

          <div className="jobs-stat-icon blue">

            <Briefcase
              size={19}
            />

          </div>

          <div>

            <span>
              Total Jobs
            </span>

            <strong>
              {totalJobs}
            </strong>

          </div>

        </div>


        <div className="jobs-stat-card">

          <div className="jobs-stat-icon green">

            <CheckCircle2
              size={19}
            />

          </div>

          <div>

            <span>
              Eligible Jobs
            </span>

            <strong>
              {eligibleJobs}
            </strong>

          </div>

        </div>


        <div className="jobs-stat-card">

          <div className="jobs-stat-icon purple">

            <Target
              size={19}
            />

          </div>

          <div>

            <span>
              80%+ Matches
            </span>

            <strong>
              {highMatchJobs}
            </strong>

          </div>

        </div>


      </section>


      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <section className="jobs-controls">

        <div className="jobs-search">

          <Search
            size={18}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search jobs, companies, skills..."
          />

        </div>


        <div className="jobs-filters">

          <button
            type="button"
            className={
              filter === "ALL"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("ALL")
            }
          >
            All
          </button>


          <button
            type="button"
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
            type="button"
            className={
              filter === "MATCH_80"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("MATCH_80")
            }
          >
            80%+ Match
          </button>


          <button
            type="button"
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

      </section>


      {/* =================================================
          JOB LIST
      ================================================= */}

      {filteredJobs.length === 0 ? (

        <section className="jobs-empty">

          <div className="jobs-empty-icon">

            <Briefcase
              size={30}
            />

          </div>

          <h2>
            No Jobs Found
          </h2>

          <p>
            No job opportunities match your
            current search or filter.
          </p>

          <button
            type="button"
            onClick={() => {

              setSearchTerm("");
              setFilter("ALL");

            }}
          >
            Clear Filters
          </button>

        </section>

      ) : (

        <section className="jobs-list">

          {filteredJobs.map(
            (job) => (

              <article
                className="job-card"
                key={job.id}
              >


                {/* =================================================
                    JOB HEADER
                ================================================= */}

                <div className="job-card-header">

                  <div className="job-title-area">

                    <div className="job-company-icon">

                      <Building2
                        size={20}
                      />

                    </div>

                    <div>

                      <h2>
                        {job.title}
                      </h2>

                      <p>
                        {job.companyName ||
                          "Company"}
                      </p>

                    </div>

                  </div>


                  <div
                    className={
                      `job-match-score ${
                        getMatchClass(
                          job.calculatedMatch
                        )
                      }`
                    }
                  >

                    <strong>
                      {job.calculatedMatch}%
                    </strong>

                    <span>
                      Match
                    </span>

                  </div>

                </div>


                {/* =================================================
                    JOB META
                ================================================= */}

                <div className="job-meta">

                  <span>

                    <MapPin
                      size={15}
                    />

                    {job.location ||
                      "Location not specified"}

                  </span>


                  <span>

                    <Clock3
                      size={15}
                    />

                    {job.employmentType ||
                      "Full Time"}

                  </span>


                  <span>

                    <Users
                      size={15}
                    />

                    {job.openings ||
                      1}{" "}
                    Opening
                    {Number(
                      job.openings || 1
                    ) !== 1
                      ? "s"
                      : ""}

                  </span>

                </div>


                {/* =================================================
                    ELIGIBILITY
                ================================================= */}

                <div
                  className={
                    job.calculatedEligible
                      ? "job-eligibility eligible"
                      : "job-eligibility not-eligible"
                  }
                >

                  {job.calculatedEligible ? (

                    <>
                      <CheckCircle2
                        size={16}
                      />

                      <span>
                        You are eligible
                        for this position
                      </span>
                    </>

                  ) : (

                    <>
                      <XCircle
                        size={16}
                      />

                      <span>
                        Eligibility criteria
                        not fully matched
                      </span>
                    </>

                  )}

                </div>


                {/* =================================================
                    REQUIREMENTS
                ================================================= */}

                <div className="job-requirements">


                  <div className="job-requirement">

                    <GraduationCap
                      size={15}
                    />

                    <div>

                      <small>
                        Degree
                      </small>

                      <strong>
                        {job.degree ||
                          "Any Degree"}
                      </strong>

                    </div>

                  </div>


                  <div className="job-requirement">

                    <Target
                      size={15}
                    />

                    <div>

                      <small>
                        Minimum CGPA
                      </small>

                      <strong>
                        {job.minimumCGPA ||
                          "Not specified"}
                      </strong>

                    </div>

                  </div>


                  <div className="job-requirement">

                    <Briefcase
                      size={15}
                    />

                    <div>

                      <small>
                        Experience
                      </small>

                      <strong>
                        {job.experience ||
                          0}{" "}
                        year
                        {Number(
                          job.experience || 0
                        ) !== 1
                          ? "s"
                          : ""}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    SKILLS
                ================================================= */}

                <div className="job-skills">

                  <div className="job-skills-title">

                    <Code2
                      size={15}
                    />

                    <span>
                      Required Skills
                    </span>

                  </div>


                  <div className="job-skill-tags">

                    {normalizeArray(
                      job.technicalSkills
                    ).map(
                      (skill) => (

                        <span
                          key={skill}
                          className="job-skill-tag"
                        >
                          {skill}
                        </span>

                      )
                    )}


                    {normalizeArray(
                      job.requiredLanguages
                    ).map(
                      (language) => (

                        <span
                          key={language}
                          className="job-language-tag"
                        >
                          {language}
                        </span>

                      )
                    )}

                  </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="job-card-footer">

                  <div>

                    {job.source ===
                    "RECRUITER" ? (

                      <span className="job-source real">

                        <CheckCircle2
                          size={13}
                        />

                        Recruiter Posted

                      </span>

                    ) : (

                      <span className="job-source">

                        Demo Opportunity

                      </span>

                    )}

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      handleViewDetails(
                        job
                      )
                    }
                  >
                    View Details
                  </button>

                </div>

              </article>

            )
          )}

        </section>

      )}

    </div>

  );
}


export default Jobs;