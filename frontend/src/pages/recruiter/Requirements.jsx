import { useEffect, useState } from "react";
import {
  GraduationCap,
  Briefcase,
  Code2,
  Brain,
  Video,
  Save,
  Plus,
  X,
  CheckCircle,
  Target,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./Requirements.css";


function Requirements() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    degree: "B.Tech",
    minimumCGPA: "6.0",
    experience: "0",
    minimumMatchScore: "60",
    interviewRequired: true,
    requiredLanguages: [],
    technicalSkills: [],
    additionalCriteria: "",
  });

  const [languageInput, setLanguageInput] =
    useState("");

  const [skillInput, setSkillInput] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("success");


  /*
  ============================================
  LOAD SAVED REQUIREMENTS
  ============================================
  */

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    try {
      const storageKey =
        `campuslink_requirements_${user.email}`;

      const saved =
        JSON.parse(
          localStorage.getItem(storageKey) || "null"
        );

      if (saved && typeof saved === "object") {
        setForm({
          degree:
            saved.degree || "B.Tech",

          minimumCGPA:
            saved.minimumCGPA || "6.0",

          experience:
            saved.experience || "0",

          minimumMatchScore:
            saved.minimumMatchScore || "60",

          interviewRequired:
            saved.interviewRequired !== false,

          requiredLanguages:
            Array.isArray(
              saved.requiredLanguages
            )
              ? saved.requiredLanguages
              : [],

          technicalSkills:
            Array.isArray(
              saved.technicalSkills
            )
              ? saved.technicalSkills
              : [],

          additionalCriteria:
            saved.additionalCriteria || "",
        });
      }

    } catch (error) {
      console.error(
        "Could not load requirements:",
        error
      );
    }
  }, [user?.email]);


  /*
  ============================================
  HANDLE INPUT
  ============================================
  */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setMessage("");
  };


  /*
  ============================================
  ADD LANGUAGE
  ============================================
  */

  const addLanguage = () => {
    const value =
      languageInput.trim();

    if (!value) {
      return;
    }

    const exists =
      form.requiredLanguages.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {
      setLanguageInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      requiredLanguages: [
        ...previous.requiredLanguages,
        value,
      ],
    }));

    setLanguageInput("");
    setMessage("");
  };


  /*
  ============================================
  REMOVE LANGUAGE
  ============================================
  */

  const removeLanguage = (language) => {
    setForm((previous) => ({
      ...previous,
      requiredLanguages:
        previous.requiredLanguages.filter(
          (item) => item !== language
        ),
    }));
  };


  /*
  ============================================
  ADD TECHNICAL SKILL
  ============================================
  */

  const addSkill = () => {
    const value =
      skillInput.trim();

    if (!value) {
      return;
    }

    const exists =
      form.technicalSkills.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {
      setSkillInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      technicalSkills: [
        ...previous.technicalSkills,
        value,
      ],
    }));

    setSkillInput("");
    setMessage("");
  };


  /*
  ============================================
  REMOVE SKILL
  ============================================
  */

  const removeSkill = (skill) => {
    setForm((previous) => ({
      ...previous,
      technicalSkills:
        previous.technicalSkills.filter(
          (item) => item !== skill
        ),
    }));
  };


  /*
  ============================================
  ENTER KEY
  ============================================
  */

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


  /*
  ============================================
  SAVE
  ============================================
  */

  const handleSave = (event) => {
    event.preventDefault();

    setMessage("");

    const cgpa =
      Number(form.minimumCGPA);

    const experience =
      Number(form.experience);

    const matchScore =
      Number(form.minimumMatchScore);


    if (
      !form.degree.trim()
    ) {
      setMessage(
        "Please enter the required degree."
      );

      setMessageType("error");
      return;
    }


    if (
      Number.isNaN(cgpa) ||
      cgpa < 0 ||
      cgpa > 10
    ) {
      setMessage(
        "Minimum CGPA must be between 0 and 10."
      );

      setMessageType("error");
      return;
    }


    if (
      Number.isNaN(experience) ||
      experience < 0
    ) {
      setMessage(
        "Experience cannot be negative."
      );

      setMessageType("error");
      return;
    }


    if (
      Number.isNaN(matchScore) ||
      matchScore < 0 ||
      matchScore > 100
    ) {
      setMessage(
        "Minimum match score must be between 0 and 100."
      );

      setMessageType("error");
      return;
    }


    if (!user?.email) {
      setMessage(
        "Recruiter session not found."
      );

      setMessageType("error");
      return;
    }


    const requirementsData = {
      ...form,

      minimumCGPA:
        String(cgpa),

      experience:
        String(experience),

      minimumMatchScore:
        String(matchScore),

      updatedAt:
        new Date().toISOString(),
    };


    localStorage.setItem(
      `campuslink_requirements_${user.email}`,
      JSON.stringify(
        requirementsData
      )
    );


    setMessage(
      "Recruiter requirements saved successfully."
    );

    setMessageType("success");
  };


  return (
    <div className="requirements-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="requirements-header">

        <div>

          <div className="requirements-eyebrow">
            RECRUITER
          </div>

          <h1>
            Candidate Requirements
          </h1>

          <p>
            Define the eligibility and selection
            criteria for your recruitment process.
          </p>

        </div>

        <div className="requirements-header-icon">
          <Target size={28} />
        </div>

      </div>


      {/* =====================================
          MESSAGE
      ===================================== */}

      {message && (
        <div
          className={`requirements-message ${
            messageType
          }`}
        >

          {messageType === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <X size={18} />
          )}

          <span>
            {message}
          </span>

        </div>
      )}


      <form
        className="requirements-form"
        onSubmit={handleSave}
      >

        {/* =================================
            BASIC ELIGIBILITY
        ================================= */}

        <section className="requirements-card">

          <div className="requirements-card-heading">

            <div className="requirements-section-icon">
              <GraduationCap size={21} />
            </div>

            <div>

              <h2>
                Basic Eligibility
              </h2>

              <p>
                Set the minimum academic and
                experience requirements.
              </p>

            </div>

          </div>


          <div className="requirements-grid">

            <div className="requirement-field">

              <label>
                Required Degree
              </label>

              <select
                name="degree"
                value={form.degree}
                onChange={handleChange}
              >
                <option value="Any Degree">
                  Any Degree
                </option>

                <option value="B.Tech">
                  B.Tech
                </option>

                <option value="B.E">
                  B.E
                </option>

                <option value="BCA">
                  BCA
                </option>

                <option value="MCA">
                  MCA
                </option>

                <option value="M.Tech">
                  M.Tech
                </option>

                <option value="M.E">
                  M.E
                </option>

                <option value="B.Sc">
                  B.Sc
                </option>

                <option value="M.Sc">
                  M.Sc
                </option>
              </select>

            </div>


            <div className="requirement-field">

              <label>
                Minimum CGPA
              </label>

              <input
                type="number"
                name="minimumCGPA"
                value={form.minimumCGPA}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
                placeholder="Example: 6.0"
              />

              <small>
                Scale: 0.0 - 10.0
              </small>

            </div>


            <div className="requirement-field">

              <label>
                Minimum Experience
              </label>

              <input
                type="number"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="Years"
              />

              <small>
                Enter 0 for freshers.
              </small>

            </div>


            <div className="requirement-field">

              <label>
                Minimum Match Score
              </label>

              <input
                type="number"
                name="minimumMatchScore"
                value={form.minimumMatchScore}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                placeholder="Example: 60"
              />

              <small>
                Required AI job-match percentage.
              </small>

            </div>

          </div>

        </section>


        {/* =================================
            PROGRAMMING LANGUAGES
        ================================= */}

        <section className="requirements-card">

          <div className="requirements-card-heading">

            <div className="requirements-section-icon">
              <Code2 size={21} />
            </div>

            <div>

              <h2>
                Programming Languages
              </h2>

              <p>
                Add the programming languages required
                for this recruitment.
              </p>

            </div>

          </div>


          <div className="tag-input-row">

            <input
              type="text"
              value={languageInput}
              onChange={(event) =>
                setLanguageInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleLanguageKeyDown
              }
              placeholder="Example: Python"
            />

            <button
              type="button"
              onClick={addLanguage}
            >
              <Plus size={17} />
              Add
            </button>

          </div>


          <div className="requirements-tags">

            {form.requiredLanguages.length ===
            0 ? (

              <span className="no-tags">
                No programming language added yet.
              </span>

            ) : (

              form.requiredLanguages.map(
                (language) => (

                  <span
                    className="requirement-tag"
                    key={language}
                  >

                    {language}

                    <button
                      type="button"
                      onClick={() =>
                        removeLanguage(
                          language
                        )
                      }
                    >
                      <X size={13} />
                    </button>

                  </span>

                )
              )

            )}

          </div>

        </section>


        {/* =================================
            TECHNICAL SKILLS
        ================================= */}

        <section className="requirements-card">

          <div className="requirements-card-heading">

            <div className="requirements-section-icon">
              <Brain size={21} />
            </div>

            <div>

              <h2>
                Technical Skills
              </h2>

              <p>
                Define the technical skills that
                candidates should have.
              </p>

            </div>

          </div>


          <div className="tag-input-row">

            <input
              type="text"
              value={skillInput}
              onChange={(event) =>
                setSkillInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleSkillKeyDown
              }
              placeholder="Example: React"
            />

            <button
              type="button"
              onClick={addSkill}
            >
              <Plus size={17} />
              Add
            </button>

          </div>


          <div className="requirements-tags">

            {form.technicalSkills.length ===
            0 ? (

              <span className="no-tags">
                No technical skill added yet.
              </span>

            ) : (

              form.technicalSkills.map(
                (skill) => (

                  <span
                    className="requirement-tag"
                    key={skill}
                  >

                    {skill}

                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(skill)
                      }
                    >
                      <X size={13} />
                    </button>

                  </span>

                )
              )

            )}

          </div>

        </section>


        {/* =================================
            INTERVIEW REQUIREMENT
        ================================= */}

        <section className="requirements-card">

          <div className="requirements-card-heading">

            <div className="requirements-section-icon">
              <Video size={21} />
            </div>

            <div>

              <h2>
                Interview Requirements
              </h2>

              <p>
                Configure whether the selected
                candidates must complete an AI interview.
              </p>

            </div>

          </div>


          <label className="toggle-row">

            <div>

              <strong>
                AI Interview Required
              </strong>

              <span>
                Candidates will need to complete
                the interview process.
              </span>

            </div>

            <input
              type="checkbox"
              name="interviewRequired"
              checked={
                form.interviewRequired
              }
              onChange={handleChange}
            />

            <span className="toggle-switch">
              <span />
            </span>

          </label>

        </section>


        {/* =================================
            ADDITIONAL CRITERIA
        ================================= */}

        <section className="requirements-card">

          <div className="requirements-card-heading">

            <div className="requirements-section-icon">
              <Briefcase size={21} />
            </div>

            <div>

              <h2>
                Additional Selection Criteria
              </h2>

              <p>
                Add any additional requirements
                for recruiters or candidates.
              </p>

            </div>

          </div>


          <textarea
            name="additionalCriteria"
            value={
              form.additionalCriteria
            }
            onChange={handleChange}
            rows="5"
            placeholder="Example: Candidate should be willing to relocate, should have strong communication skills, or should be available for immediate joining."
          />

        </section>


        {/* =================================
            SAVE
        ================================= */}

        <div className="requirements-submit">

          <button
            type="submit"
            className="save-requirements-button"
          >
            <Save size={18} />
            Save Requirements
          </button>

        </div>

      </form>

    </div>
  );
}


export default Requirements;