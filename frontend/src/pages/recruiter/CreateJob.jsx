import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Code2,
  GraduationCap,
  MapPin,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./CreateJob.css";


function CreateJob() {
  const { user } = useAuth();

  const recruiterEmail =
    user?.email || "recruiter@campuslink.com";

  const jobsStorageKey =
    `campuslink_jobs_${recruiterEmail}`;


  const [job, setJob] = useState({
    title: "",
    companyName: "",
    description: "",
    location: "",
    employmentType: "Full Time",
    degree: "",
    minimumCGPA: "",
    experience: "",
    openings: "1",
    deadline: "",
    interviewRequired: true,
  });


  const [languages, setLanguages] =
    useState([]);

  const [skills, setSkills] =
    useState([]);

  const [languageInput, setLanguageInput] =
    useState("");

  const [skillInput, setSkillInput] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [saved, setSaved] =
    useState(false);


  /* =========================================
     LOAD COMPANY INFORMATION
  ========================================= */

  useEffect(() => {
    try {
      const companyKey =
        `campuslink_company_${recruiterEmail}`;

      const savedCompany =
        localStorage.getItem(companyKey);

      if (savedCompany) {
        const parsed =
          JSON.parse(savedCompany);

        setJob((previous) => ({
          ...previous,

          companyName:
            parsed.companyName || "",
        }));
      }
    } catch (error) {
      console.error(
        "Could not load company information:",
        error
      );
    }
  }, [recruiterEmail]);


  /* =========================================
     HANDLE INPUT
  ========================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setJob((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setMessage("");
    setSaved(false);
  };


  /* =========================================
     ADD LANGUAGE
  ========================================= */

  const addLanguage = () => {
    const value =
      languageInput.trim();

    if (!value) {
      return;
    }

    const alreadyExists =
      languages.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      );

    if (!alreadyExists) {
      setLanguages((previous) => [
        ...previous,
        value,
      ]);
    }

    setLanguageInput("");
  };


  const removeLanguage = (language) => {
    setLanguages((previous) =>
      previous.filter(
        (item) => item !== language
      )
    );
  };


  /* =========================================
     ADD SKILL
  ========================================= */

  const addSkill = () => {
    const value =
      skillInput.trim();

    if (!value) {
      return;
    }

    const alreadyExists =
      skills.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      );

    if (!alreadyExists) {
      setSkills((previous) => [
        ...previous,
        value,
      ]);
    }

    setSkillInput("");
  };


  const removeSkill = (skill) => {
    setSkills((previous) =>
      previous.filter(
        (item) => item !== skill
      )
    );
  };


  /* =========================================
     ENTER KEY FOR TAGS
  ========================================= */

  const handleLanguageKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addLanguage();
    }
  };


  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };


  /* =========================================
     VALIDATION
  ========================================= */

  const validateJob = () => {
    if (!job.title.trim()) {
      return "Please enter the job title.";
    }

    if (!job.companyName.trim()) {
      return "Please enter the company name.";
    }

    if (!job.description.trim()) {
      return "Please enter the job description.";
    }

    if (!job.location.trim()) {
      return "Please enter the job location.";
    }

    if (!job.degree.trim()) {
      return "Please enter the required degree.";
    }

    if (!job.minimumCGPA) {
      return "Please enter the minimum CGPA.";
    }

    if (
      Number(job.minimumCGPA) < 0 ||
      Number(job.minimumCGPA) > 10
    ) {
      return "CGPA must be between 0 and 10.";
    }

    if (!job.experience.trim()) {
      return "Please enter the experience requirement.";
    }

    if (
      !job.openings ||
      Number(job.openings) < 1
    ) {
      return "Openings must be at least 1.";
    }

    return null;
  };


  /* =========================================
     SAVE JOB
  ========================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError =
      validateJob();

    if (validationError) {
      setMessage(validationError);
      setSaved(false);
      return;
    }


    const newJob = {
      id:
        `JOB-${Date.now()}`,

      recruiterEmail,

      title:
        job.title.trim(),

      companyName:
        job.companyName.trim(),

      description:
        job.description.trim(),

      location:
        job.location.trim(),

      employmentType:
        job.employmentType,

      degree:
        job.degree.trim(),

      minimumCGPA:
        Number(job.minimumCGPA),

      experience:
        job.experience.trim(),

      openings:
        Number(job.openings),

      deadline:
        job.deadline,

      requiredLanguages:
        languages,

      technicalSkills:
        skills,

      interviewRequired:
        job.interviewRequired,

      createdAt:
        new Date().toISOString(),

      status:
        "ACTIVE",
    };


    try {
      const existingJobs =
        JSON.parse(
          localStorage.getItem(
            jobsStorageKey
          ) || "[]"
        );

      const jobs =
        Array.isArray(existingJobs)
          ? existingJobs
          : [];


      jobs.push(newJob);


      localStorage.setItem(
        jobsStorageKey,
        JSON.stringify(jobs)
      );


      setMessage(
        "Job created successfully."
      );

      setSaved(true);


      /* Reset form */

      setJob({
        title: "",
        companyName: job.companyName,
        description: "",
        location: "",
        employmentType: "Full Time",
        degree: "",
        minimumCGPA: "",
        experience: "",
        openings: "1",
        deadline: "",
        interviewRequired: true,
      });

      setLanguages([]);
      setSkills([]);
      setLanguageInput("");
      setSkillInput("");


    } catch (error) {
      console.error(
        "Could not save job:",
        error
      );

      setMessage(
        "Could not save the job."
      );

      setSaved(false);
    }
  };


  return (
    <div className="create-job-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="create-job-header">

        <div>

          <div className="create-job-eyebrow">
            RECRUITER PORTAL
          </div>

          <h1>
            Create Job
          </h1>

          <p>
            Create a job opening and define
            the requirements used to identify
            eligible students.
          </p>

        </div>


        <div className="create-job-header-icon">
          <BriefcaseBusiness size={30} />
        </div>

      </div>


      {/* =====================================
          MESSAGE
      ===================================== */}

      {message && (
        <div
          className={
            saved
              ? "create-job-message success"
              : "create-job-message error"
          }
        >
          {saved && (
            <CheckCircle2 size={18} />
          )}

          <span>
            {message}
          </span>
        </div>
      )}


      {/* =====================================
          FORM
      ===================================== */}

      <form
        className="create-job-card"
        onSubmit={handleSubmit}
      >

        {/* ===================================
            JOB INFORMATION
        =================================== */}

        <section className="create-job-section">

          <div className="create-job-section-heading">

            <div className="create-job-section-icon">
              <BriefcaseBusiness size={20} />
            </div>

            <div>
              <h2>
                Job Information
              </h2>

              <p>
                Basic information about the
                position.
              </p>
            </div>

          </div>


          <div className="create-job-grid">

            <div className="create-job-field">

              <label htmlFor="title">
                Job Title
                <span>*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Python Developer"
                value={job.title}
                onChange={handleChange}
              />

            </div>


            <div className="create-job-field">

              <label htmlFor="companyName">
                Company Name
                <span>*</span>
              </label>

              <input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Company name"
                value={job.companyName}
                onChange={handleChange}
              />

            </div>


            <div className="create-job-field">

              <label htmlFor="location">
                Location
                <span>*</span>
              </label>

              <div className="create-job-input-icon">

                <MapPin size={17} />

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Bengaluru, India"
                  value={job.location}
                  onChange={handleChange}
                />

              </div>

            </div>


            <div className="create-job-field">

              <label htmlFor="employmentType">
                Employment Type
              </label>

              <select
                id="employmentType"
                name="employmentType"
                value={job.employmentType}
                onChange={handleChange}
              >
                <option value="Full Time">
                  Full Time
                </option>

                <option value="Part Time">
                  Part Time
                </option>

                <option value="Internship">
                  Internship
                </option>

                <option value="Contract">
                  Contract
                </option>
              </select>

            </div>


            <div className="create-job-field">

              <label htmlFor="openings">
                Number of Openings
              </label>

              <div className="create-job-input-icon">

                <Users size={17} />

                <input
                  id="openings"
                  name="openings"
                  type="number"
                  min="1"
                  value={job.openings}
                  onChange={handleChange}
                />

              </div>

            </div>


            <div className="create-job-field">

              <label htmlFor="deadline">
                Application Deadline
              </label>

              <div className="create-job-input-icon">

                <CalendarDays size={17} />

                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={job.deadline}
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>


          <div className="create-job-field full-width">

            <label htmlFor="description">
              Job Description
              <span>*</span>
            </label>

            <textarea
              id="description"
              name="description"
              rows="6"
              placeholder="Describe the role, responsibilities and expectations..."
              value={job.description}
              onChange={handleChange}
            />

          </div>

        </section>


        {/* ===================================
            ELIGIBILITY REQUIREMENTS
        =================================== */}

        <section className="create-job-section">

          <div className="create-job-section-heading">

            <div className="create-job-section-icon">
              <GraduationCap size={20} />
            </div>

            <div>
              <h2>
                Eligibility Requirements
              </h2>

              <p>
                These requirements will be used
                by the eligibility engine.
              </p>
            </div>

          </div>


          <div className="create-job-grid">

            <div className="create-job-field">

              <label htmlFor="degree">
                Required Degree
                <span>*</span>
              </label>

              <input
                id="degree"
                name="degree"
                type="text"
                placeholder="e.g. B.Tech / B.E / MCA"
                value={job.degree}
                onChange={handleChange}
              />

            </div>


            <div className="create-job-field">

              <label htmlFor="minimumCGPA">
                Minimum CGPA
                <span>*</span>
              </label>

              <input
                id="minimumCGPA"
                name="minimumCGPA"
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="e.g. 7.0"
                value={job.minimumCGPA}
                onChange={handleChange}
              />

            </div>


            <div className="create-job-field">

              <label htmlFor="experience">
                Experience Requirement
                <span>*</span>
              </label>

              <input
                id="experience"
                name="experience"
                type="text"
                placeholder="e.g. 0-2 years"
                value={job.experience}
                onChange={handleChange}
              />

            </div>

          </div>

        </section>


        {/* ===================================
            PROGRAMMING LANGUAGES
        =================================== */}

        <section className="create-job-section">

          <div className="create-job-section-heading">

            <div className="create-job-section-icon">
              <Code2 size={20} />
            </div>

            <div>
              <h2>
                Programming Languages
              </h2>

              <p>
                Add languages required for this job.
              </p>
            </div>

          </div>


          <div className="create-job-tag-input">

            <input
              type="text"
              placeholder="e.g. Python"
              value={languageInput}
              onChange={(event) =>
                setLanguageInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleLanguageKeyDown
              }
            />

            <button
              type="button"
              onClick={addLanguage}
            >
              <Plus size={17} />
              Add
            </button>

          </div>


          {languages.length > 0 && (
            <div className="create-job-tags">

              {languages.map((language) => (
                <div
                  className="create-job-tag"
                  key={language}
                >

                  <span>
                    {language}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeLanguage(language)
                    }
                    aria-label={
                      `Remove ${language}`
                    }
                  >
                    <X size={14} />
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>


        {/* ===================================
            TECHNICAL SKILLS
        =================================== */}

        <section className="create-job-section">

          <div className="create-job-section-heading">

            <div className="create-job-section-icon">
              <Code2 size={20} />
            </div>

            <div>
              <h2>
                Technical Skills
              </h2>

              <p>
                Add the technical skills required
                for this position.
              </p>
            </div>

          </div>


          <div className="create-job-tag-input">

            <input
              type="text"
              placeholder="e.g. React"
              value={skillInput}
              onChange={(event) =>
                setSkillInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleSkillKeyDown
              }
            />

            <button
              type="button"
              onClick={addSkill}
            >
              <Plus size={17} />
              Add
            </button>

          </div>


          {skills.length > 0 && (
            <div className="create-job-tags">

              {skills.map((skill) => (
                <div
                  className="create-job-tag"
                  key={skill}
                >

                  <span>
                    {skill}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeSkill(skill)
                    }
                    aria-label={
                      `Remove ${skill}`
                    }
                  >
                    <X size={14} />
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>


        {/* ===================================
            INTERVIEW
        =================================== */}

        <section className="create-job-section">

          <div className="create-job-interview-option">

            <div>

              <h3>
                Interview Required
              </h3>

              <p>
                Enable an AI/recruiter interview
                after the assessment stage.
              </p>

            </div>


            <label className="create-job-switch">

              <input
                type="checkbox"
                name="interviewRequired"
                checked={
                  job.interviewRequired
                }
                onChange={handleChange}
              />

              <span />

            </label>

          </div>

        </section>


        {/* ===================================
            FOOTER
        =================================== */}

        <div className="create-job-footer">

          <div className="create-job-required">
            <span>*</span>
            Required fields
          </div>


          <button
            type="submit"
            className="create-job-save"
          >

            <Save size={18} />

            Create Job

          </button>

        </div>

      </form>

    </div>
  );
}


export default CreateJob;