import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  Code2,
  GraduationCap,
  MapPin,
  Target,
  Users,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./JobDetails.css";


/* =====================================================
   STORAGE
===================================================== */

const APPLICATIONS_KEY =
  "campuslink_applications";

const NOTIFICATIONS_KEY =
  "campuslink_notifications";


/* =====================================================
   JOB DETAILS
===================================================== */

function JobDetails() {

  const navigate = useNavigate();

  const location = useLocation();

  const { jobId } = useParams();

  const { user } = useAuth();


  const [job, setJob] = useState(
    location.state?.job || null
  );

  const [studentProfile, setStudentProfile] =
    useState(null);


  /* =====================================================
     APPLICATION STATE
  ===================================================== */

  const [
    application,
    setApplication,
  ] = useState(null);


  const [
    applying,
    setApplying,
  ] = useState(false);


  /* =====================================================
     LOAD STUDENT PROFILE
  ===================================================== */

  useEffect(() => {

    if (!user?.email) {
      return;
    }

    try {

      const key =
        `campuslink_student_profile_${user.email}`;

      const saved =
        localStorage.getItem(key);

      if (saved) {

        setStudentProfile(
          JSON.parse(saved)
        );

      }

    } catch (error) {

      console.error(
        "Could not load student profile:",
        error
      );

    }

  }, [user]);


  /* =====================================================
     FIND JOB IF NOT PASSED THROUGH ROUTE STATE
  ===================================================== */

  useEffect(() => {

    if (job) {
      return;
    }

    try {

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

          const saved =
            JSON.parse(
              localStorage.getItem(key)
            );

          if (!Array.isArray(saved)) {
            continue;
          }

          const found =
            saved.find(
              (item) =>
                String(item?.id) ===
                String(jobId)
            );

          if (found) {

            setJob({
              ...found,
              source: "RECRUITER",
            });

            return;

          }

        } catch {
          // Ignore invalid localStorage entry
        }

      }

    } catch (error) {

      console.error(
        "Could not find job:",
        error
      );

    }

  }, [job, jobId]);


  /* =====================================================
     CHECK EXISTING APPLICATION
  ===================================================== */

  useEffect(() => {

    if (
      !jobId ||
      !user?.email
    ) {
      return;
    }

    try {

      const saved =
        JSON.parse(
          localStorage.getItem(
            APPLICATIONS_KEY
          ) || "[]"
        );

      if (!Array.isArray(saved)) {
        return;
      }

      const studentEmail =
        String(
          user.email
        )
          .trim()
          .toLowerCase();


      const existing =
        saved.find(
          (item) => {

            const applicationStudent =
              String(
                item?.studentId ||
                item?.studentEmail ||
                ""
              )
                .trim()
                .toLowerCase();


            return (
              String(item?.jobId) ===
                String(jobId) &&
              applicationStudent ===
                studentEmail
            );

          }
        );


      if (existing) {

        setApplication(
          existing
        );

      } else {

        setApplication(null);

      }

    } catch (error) {

      console.error(
        "Could not check existing application:",
        error
      );

    }

  }, [
    jobId,
    user?.email,
  ]);


  /* =====================================================
     HELPERS
  ===================================================== */

  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();


  const normalizeArray = (value) => {

    if (Array.isArray(value)) {

      return value
        .map(normalize)
        .filter(Boolean);

    }

    if (typeof value === "string") {

      return value
        .split(",")
        .map(normalize)
        .filter(Boolean);

    }

    return [];

  };


  /* =====================================================
     CALCULATE MATCH
  ===================================================== */

  const matchResult = useMemo(() => {

    if (
      !job ||
      !studentProfile
    ) {

      return {

        match:
          location.state?.match || 0,

        eligible:
          location.state?.eligible || false,

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

          passed: true,

          text:
            `Your CGPA ${studentCGPA} meets the required ${requiredCGPA}.`,

        });

      } else {

        reasons.push({

          passed: false,

          text:
            `Your CGPA ${studentCGPA} is below the required ${requiredCGPA}.`,

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

          passed: true,

          text:
            `Your experience meets the ${requiredExperience} year requirement.`,

        });

      } else {

        reasons.push({

          passed: false,

          text:
            `This position requires ${requiredExperience} year(s) of experience.`,

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
      requiredDegree !== "any"
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


      if (degreeMatches) {

        passedCriteria++;

        reasons.push({

          passed: true,

          text:
            "Your education matches the job requirement.",

        });

      } else {

        reasons.push({

          passed: false,

          text:
            `Required degree: ${job.degree}`,

        });

      }

    }


    /* =================================================
       LANGUAGES
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


      const matches =
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


      const ratio =
        matches.length /
        requiredLanguages.length;


      passedCriteria +=
        ratio;


      reasons.push({

        passed:
          matches.length ===
          requiredLanguages.length,

        partial:
          matches.length > 0 &&
          matches.length <
            requiredLanguages.length,

        text:
          `${matches.length}/${requiredLanguages.length} required programming language(s) matched.`,

      });

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


      const matches =
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


      const ratio =
        matches.length /
        requiredSkills.length;


      passedCriteria +=
        ratio;


      reasons.push({

        passed:
          matches.length ===
          requiredSkills.length,

        partial:
          matches.length > 0 &&
          matches.length <
            requiredSkills.length,

        text:
          `${matches.length}/${requiredSkills.length} required technical skill(s) matched.`,

      });

    }


    /* =================================================
       FINAL MATCH
    ================================================= */

    const match =
      totalCriteria > 0
        ? Math.round(
            (
              passedCriteria /
              totalCriteria
            ) * 100
          )
        : 100;


    const hardRequirementFailed =
      reasons.some(
        (item) =>
          !item.passed &&
          !item.partial &&
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


    return {

      match,

      eligible:
        !hardRequirementFailed &&
        match >= 60,

      reasons,

    };

  }, [
    job,
    studentProfile,
    location.state,
  ]);


  /* =====================================================
     CREATE RECRUITER NOTIFICATION
  ===================================================== */

  const createRecruiterNotification = (
    newApplication
  ) => {

    try {

      const saved =
        JSON.parse(
          localStorage.getItem(
            NOTIFICATIONS_KEY
          ) || "[]"
        );


      const notifications =
        Array.isArray(saved)
          ? saved
          : [];


      /*
        Different recruiter job implementations
        may store the recruiter email under
        different names. We support the common
        possibilities without changing the job
        structure.
      */

      const recruiterEmail =
        job?.recruiterEmail ||
        job?.recruiter_email ||
        job?.createdByEmail ||
        job?.createdBy ||
        job?.ownerEmail ||
        "";


      if (!recruiterEmail) {

        /*
          Application is still successfully saved.
          A recruiter notification will be possible
          once the job contains recruiter ownership.
        */

        return;

      }


      const notification = {

        notificationId:
          `NOTIF-${Date.now()}`,

        userId:
          recruiterEmail,

        userEmail:
          recruiterEmail,

        type:
          "JOB_APPLICATION_RECEIVED",

        title:
          "New Job Application",

        message:
          `${newApplication.studentName} applied for ${newApplication.jobTitle}.`,

        jobId:
          newApplication.jobId,

        applicationId:
          newApplication.applicationId,

        read:
          false,

        createdAt:
          new Date().toISOString(),

      };


      notifications.push(
        notification
      );


      localStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(
          notifications
        )
      );


      window.dispatchEvent(
        new Event(
          "campuslink_notification_updated"
        )
      );

    } catch (error) {

      console.error(
        "Could not create recruiter notification:",
        error
      );

    }

  };


  /* =====================================================
     APPLY FOR JOB
  ===================================================== */

  const handleApply = () => {

    if (
      !user?.email
    ) {

      alert(
        "Please log in before applying."
      );

      navigate("/login");

      return;

    }


    if (!job) {

      return;

    }


    if (
      !matchResult.eligible
    ) {

      return;

    }


    if (
      application
    ) {

      alert(
        "You have already applied for this job."
      );

      return;

    }


    if (applying) {
      return;
    }


    setApplying(true);


    try {

      const saved =
        JSON.parse(
          localStorage.getItem(
            APPLICATIONS_KEY
          ) || "[]"
        );


      const applications =
        Array.isArray(saved)
          ? saved
          : [];


      const studentEmail =
        String(
          user.email
        )
          .trim()
          .toLowerCase();


      /* ===============================================
         DOUBLE CHECK DUPLICATE
      =============================================== */

      const alreadyApplied =
        applications.find(
          (item) => {

            const itemStudent =
              String(
                item?.studentId ||
                item?.studentEmail ||
                ""
              )
                .trim()
                .toLowerCase();


            return (
              String(item?.jobId) ===
                String(jobId) &&
              itemStudent ===
                studentEmail
            );

          }
        );


      if (
        alreadyApplied
      ) {

        setApplication(
          alreadyApplied
        );

        alert(
          "You have already applied for this job."
        );

        setApplying(false);

        return;

      }


      /* ===============================================
         CREATE APPLICATION
      =============================================== */

      const newApplication = {

        applicationId:
          `APP-${Date.now()}`,

        jobId:
          job.id ||
          jobId,

        jobTitle:
          job.title ||
          "Job Position",

        companyId:
          job.companyId ||
          job.company_id ||
          "",

        companyName:
          job.companyName ||
          job.company ||
          "Company",

        studentId:
          user.email,

        studentEmail:
          user.email,

        studentName:
          studentProfile?.name ||
          user.name ||
          "CampusLink Student",

        appliedAt:
          new Date().toISOString(),

        status:
          "PENDING",

        matchScore:
          matchResult.match,

        recruiterDecision:
          "",

        rejectionReason:
          "",

        interview: {

          scheduled:
            false,

          date:
            "",

          time:
            "",

          duration:
            "",

          instructions:
            "",

        },

        finalDecision:
          "",

        finalDecisionReason:
          "",

      };


      /* ===============================================
         SAVE APPLICATION
      =============================================== */

      applications.push(
        newApplication
      );


      localStorage.setItem(
        APPLICATIONS_KEY,
        JSON.stringify(
          applications
        )
      );


      /* ===============================================
         UPDATE CURRENT PAGE
      =============================================== */

      setApplication(
        newApplication
      );


      /* ===============================================
         NOTIFY OTHER PAGES
      =============================================== */

      window.dispatchEvent(
        new Event(
          "campuslink_application_updated"
        )
      );


      /* ===============================================
         RECRUITER NOTIFICATION
      =============================================== */

      createRecruiterNotification(
        newApplication
      );


      /* ===============================================
         SUCCESS
      =============================================== */

      alert(
        "Application submitted successfully!"
      );

    } catch (error) {

      console.error(
        "Could not submit application:",
        error
      );

      alert(
        "Could not submit your application. Please try again."
      );

    } finally {

      setApplying(false);

    }

  };


  /* =====================================================
     JOB NOT FOUND
  ===================================================== */

  if (!job) {

    return (

      <div className="job-details-page">

        <div className="job-details-not-found">

          <div className="job-details-not-found-icon">

            <Briefcase
              size={30}
            />

          </div>

          <h1>
            Job Not Found
          </h1>

          <p>
            This job opportunity could not
            be found.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/jobs"
              )
            }
          >

            <ArrowLeft
              size={17}
            />

            Back to Jobs

          </button>

        </div>

      </div>

    );

  }


  /* =====================================================
     DATA
  ===================================================== */

  const languages =
    Array.isArray(
      job.requiredLanguages
    )
      ? job.requiredLanguages
      : [];


  const skills =
    Array.isArray(
      job.technicalSkills
    )
      ? job.technicalSkills
      : [];


  /* =====================================================
     ALREADY APPLIED
  ===================================================== */

  const hasApplied =
    Boolean(
      application
    );


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="job-details-page">


      {/* =================================================
          BACK
      ================================================= */}

      <button
        type="button"
        className="job-details-back"
        onClick={() =>
          navigate(
            "/student/jobs"
          )
        }
      >

        <ArrowLeft
          size={17}
        />

        Back to Jobs

      </button>


      {/* =================================================
          HEADER
      ================================================= */}

      <section className="job-details-hero">

        <div className="job-details-company-icon">

          <Building2
            size={30}
          />

        </div>


        <div className="job-details-title">

          <span>

            {job.source === "RECRUITER"
              ? "RECRUITER POSTED"
              : "CAREER OPPORTUNITY"}

          </span>

          <h1>
            {job.title}
          </h1>

          <p>
            {job.companyName ||
              "Company"}
          </p>

        </div>


        <div
          className={
            `job-details-match ${
              matchResult.match >= 80
                ? "excellent"
                : matchResult.match >= 60
                  ? "good"
                  : "low"
            }`
          }
        >

          <strong>
            {matchResult.match}%
          </strong>

          <span>
            Match
          </span>

        </div>

      </section>


      {/* =================================================
          META
      ================================================= */}

      <section className="job-details-meta">

        <div>

          <MapPin
            size={18}
          />

          <span>

            <small>
              Location
            </small>

            <strong>
              {job.location ||
                "Not specified"}
            </strong>

          </span>

        </div>


        <div>

          <Clock3
            size={18}
          />

          <span>

            <small>
              Employment
            </small>

            <strong>
              {job.employmentType ||
                "Full Time"}
            </strong>

          </span>

        </div>


        <div>

          <Users
            size={18}
          />

          <span>

            <small>
              Openings
            </small>

            <strong>
              {job.openings || 1}
            </strong>

          </span>

        </div>


        <div>

          <Briefcase
            size={18}
          />

          <span>

            <small>
              Experience
            </small>

            <strong>
              {job.experience || 0} year(s)
            </strong>

          </span>

        </div>

      </section>


      {/* =================================================
          ELIGIBILITY BANNER
      ================================================= */}

      <section
        className={
          matchResult.eligible
            ? "job-details-eligibility eligible"
            : "job-details-eligibility not-eligible"
        }
      >

        {matchResult.eligible ? (

          <CheckCircle2
            size={23}
          />

        ) : (

          <XCircle
            size={23}
          />

        )}


        <div>

          <strong>

            {matchResult.eligible
              ? "You are eligible for this position"
              : "Eligibility criteria are not fully matched"}

          </strong>

          <span>
            AI match score: {matchResult.match}%
          </span>

        </div>

      </section>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="job-details-grid">


        {/* =================================================
            LEFT
        ================================================= */}

        <main>


          {/* DESCRIPTION */}

          <section className="job-details-card">

            <div className="job-details-card-heading">

              <Briefcase
                size={19}
              />

              <h2>
                About This Position
              </h2>

            </div>

            <p className="job-description">

              {job.description ||
                "No job description has been provided for this position."}

            </p>

          </section>


          {/* REQUIREMENTS */}

          <section className="job-details-card">

            <div className="job-details-card-heading">

              <Target
                size={19}
              />

              <h2>
                Job Requirements
              </h2>

            </div>


            <div className="job-requirements-large">


              <div>

                <GraduationCap
                  size={18}
                />

                <span>

                  <small>
                    Minimum Degree
                  </small>

                  <strong>
                    {job.degree ||
                      "Any Degree"}
                  </strong>

                </span>

              </div>


              <div>

                <Target
                  size={18}
                />

                <span>

                  <small>
                    Minimum CGPA
                  </small>

                  <strong>
                    {job.minimumCGPA ||
                      "Not specified"}
                  </strong>

                </span>

              </div>


              <div>

                <Briefcase
                  size={18}
                />

                <span>

                  <small>
                    Experience
                  </small>

                  <strong>
                    {job.experience || 0} year(s)
                  </strong>

                </span>

              </div>


            </div>

          </section>


          {/* LANGUAGES */}

          <section className="job-details-card">

            <div className="job-details-card-heading">

              <Code2
                size={19}
              />

              <h2>
                Programming Languages
              </h2>

            </div>


            <div className="job-details-tags">

              {languages.length > 0 ? (

                languages.map(
                  (language) => (

                    <span
                      key={language}
                      className="language-tag"
                    >
                      {language}
                    </span>

                  )
                )

              ) : (

                <span className="no-requirements">
                  No specific language requirement
                </span>

              )}

            </div>

          </section>


          {/* TECHNICAL SKILLS */}

          <section className="job-details-card">

            <div className="job-details-card-heading">

              <Code2
                size={19}
              />

              <h2>
                Technical Skills
              </h2>

            </div>


            <div className="job-details-tags">

              {skills.length > 0 ? (

                skills.map(
                  (skill) => (

                    <span
                      key={skill}
                      className="skill-tag"
                    >
                      {skill}
                    </span>

                  )
                )

              ) : (

                <span className="no-requirements">
                  No specific technical skills listed
                </span>

              )}

            </div>

          </section>


          {/* MATCH ANALYSIS */}

          <section className="job-details-card">

            <div className="job-details-card-heading">

              <Target
                size={19}
              />

              <h2>
                Your Match Analysis
              </h2>

            </div>


            <div className="match-analysis-list">

              {matchResult.reasons.map(
                (reason, index) => (

                  <div
                    key={index}
                    className={
                      reason.passed
                        ? "analysis-item passed"
                        : reason.partial
                          ? "analysis-item partial"
                          : "analysis-item failed"
                    }
                  >

                    {reason.passed ? (

                      <CheckCircle2
                        size={17}
                      />

                    ) : (

                      <XCircle
                        size={17}
                      />

                    )}

                    <span>
                      {reason.text}
                    </span>

                  </div>

                )
              )}

            </div>

          </section>


        </main>


        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <aside>


          {/* =================================================
              APPLY CARD
          ================================================= */}

          <section className="job-apply-card">

            <div className="apply-score">

              <span>
                Your Match
              </span>

              <strong>
                {matchResult.match}%
              </strong>

            </div>


            <div className="apply-progress">

              <div
                style={{
                  width:
                    `${Math.min(
                      matchResult.match,
                      100
                    )}%`,
                }}
              />

            </div>


            <p>

              {hasApplied

                ? "Your application has been submitted. You can track its status from My Applications."

                : matchResult.eligible

                  ? "Your profile meets the current eligibility requirements."

                  : "Complete your profile and improve your skills to increase your match."

              }

            </p>


            {/* =================================================
                APPLY BUTTON
            ================================================= */}

            <button
              type="button"
              className={
                hasApplied
                  ? "disabled-apply-button"
                  : matchResult.eligible
                    ? "apply-button"
                    : "disabled-apply-button"
              }
              disabled={
                !matchResult.eligible ||
                hasApplied ||
                applying
              }
              onClick={
                handleApply
              }
            >

              {applying

                ? "Submitting..."

                : hasApplied

                  ? "Application Submitted"

                  : matchResult.eligible

                    ? "Apply for this Job"

                    : "Not Eligible"

              }

            </button>


            {/* =================================================
                VIEW APPLICATION
            ================================================= */}

            {hasApplied && (

              <button
                type="button"
                className="improve-profile-button"
                onClick={() =>
                  navigate(
                    "/student/applications"
                  )
                }
              >
                View My Applications
              </button>

            )}


            {/* =================================================
                IMPROVE PROFILE
            ================================================= */}

            {!matchResult.eligible &&
              !hasApplied && (

                <button
                  type="button"
                  className="improve-profile-button"
                  onClick={() =>
                    navigate(
                      "/student/profile"
                    )
                  }
                >
                  Improve My Profile
                </button>

              )}

          </section>


          {/* =================================================
              COMPANY
          ================================================= */}

          <section className="job-company-card">

            <div className="job-company-heading">

              <Building2
                size={19}
              />

              <h3>
                Company
              </h3>

            </div>

            <strong>
              {job.companyName ||
                "Company"}
            </strong>

            {job.location && (

              <span>

                <MapPin
                  size={14}
                />

                {job.location}

              </span>

            )}

          </section>


          {/* =================================================
              INTERVIEW
          ================================================= */}

          {job.interviewRequired && (

            <section className="job-interview-card">

              <div>

                <Target
                  size={19}
                />

                <strong>
                  Interview Required
                </strong>

              </div>

              <p>
                This position includes an
                interview stage after the
                application.
              </p>

            </section>

          )}

        </aside>

      </div>

    </div>

  );

}


export default JobDetails;