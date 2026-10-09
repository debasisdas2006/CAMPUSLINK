import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./StudentProfile.css";


function StudentProfile() {

  const { user } = useAuth();

  const storageKey = user?.email
    ? `campuslink_student_profile_${user.email}`
    : null;


  /* =====================================================
     DEFAULT PROFILE
  ===================================================== */

  const defaultProfile = {
    name: user?.name || "",
    email: user?.email || "",
    collegeName: "",
    degree: "",
    cgpa: "",
    graduationYear: "",
    experience: "",
    languages: [],
    skills: [],
    profilePhoto: "",
  };


  /* =====================================================
     STATE
  ===================================================== */

  const [profile, setProfile] =
    useState(defaultProfile);

  const [editing, setEditing] =
    useState(true);

  const [languageInput, setLanguageInput] =
    useState("");

  const [skillInput, setSkillInput] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  useEffect(() => {

    if (!storageKey) {
      return;
    }

    try {

      const saved =
        localStorage.getItem(storageKey);

      if (saved) {

        const parsed =
          JSON.parse(saved);

        setProfile({
          ...defaultProfile,
          ...parsed,

          name:
            parsed.name ||
            user?.name ||
            "",

          email:
            parsed.email ||
            user?.email ||
            "",

          languages:
            Array.isArray(parsed.languages)
              ? parsed.languages
              : [],

          skills:
            Array.isArray(parsed.skills)
              ? parsed.skills
              : [],

          profilePhoto:
            parsed.profilePhoto ||
            "",
        });

        setEditing(false);

      } else {

        setProfile(defaultProfile);

      }

    } catch (err) {

      console.error(
        "Unable to load student profile:",
        err
      );

    }

  }, [
    storageKey,
    user?.name,
    user?.email,
  ]);


  /* =====================================================
     FIELD CHANGE
  ===================================================== */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");

  };


  /* =====================================================
     PROFILE PHOTO
     NO SIZE LIMIT
  ===================================================== */

  const handlePhotoUpload = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {

      setError(
        "Please select an image file."
      );

      return;
    }


    const reader =
      new FileReader();


    reader.onload = () => {

      setProfile((previous) => ({
        ...previous,
        profilePhoto:
          reader.result,
      }));

      setMessage("");

      setError("");

    };


    reader.onerror = () => {

      setError(
        "Unable to load the selected photo."
      );

    };


    reader.readAsDataURL(file);

    event.target.value = "";

  };


  /* =====================================================
     REMOVE PHOTO
  ===================================================== */

  const removePhoto = () => {

    setProfile((previous) => ({
      ...previous,
      profilePhoto: "",
    }));

    setMessage("");

  };


  /* =====================================================
     ADD LANGUAGE
  ===================================================== */

  const addLanguage = () => {

    const value =
      languageInput.trim();

    if (!value) {
      return;
    }

    const exists =
      profile.languages.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {

      setError(
        "This language is already added."
      );

      return;
    }

    setProfile((previous) => ({
      ...previous,

      languages: [
        ...previous.languages,
        value,
      ],
    }));

    setLanguageInput("");
    setError("");
    setMessage("");

  };


  /* =====================================================
     REMOVE LANGUAGE
  ===================================================== */

  const removeLanguage = (value) => {

    setProfile((previous) => ({
      ...previous,

      languages:
        previous.languages.filter(
          (item) => item !== value
        ),
    }));

  };


  /* =====================================================
     ADD SKILL
  ===================================================== */

  const addSkill = () => {

    const value =
      skillInput.trim();

    if (!value) {
      return;
    }

    const exists =
      profile.skills.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {

      setError(
        "This skill is already added."
      );

      return;
    }

    setProfile((previous) => ({
      ...previous,

      skills: [
        ...previous.skills,
        value,
      ],
    }));

    setSkillInput("");
    setError("");
    setMessage("");

  };


  /* =====================================================
     REMOVE SKILL
  ===================================================== */

  const removeSkill = (value) => {

    setProfile((previous) => ({
      ...previous,

      skills:
        previous.skills.filter(
          (item) => item !== value
        ),
    }));

  };


  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const saveProfile = (event) => {

    event.preventDefault();

    setError("");
    setMessage("");


    if (!profile.name.trim()) {

      setError(
        "Please enter your full name."
      );

      return;
    }


    if (!profile.collegeName.trim()) {

      setError(
        "Please enter your college name."
      );

      return;
    }


    if (
      profile.cgpa !== "" &&
      (
        Number(profile.cgpa) < 0 ||
        Number(profile.cgpa) > 10
      )
    ) {

      setError(
        "CGPA must be between 0 and 10."
      );

      return;
    }


    const profileData = {

      ...profile,

      name:
        profile.name.trim(),

      email:
        user?.email ||
        profile.email,

      collegeName:
        profile.collegeName.trim(),

      degree:
        profile.degree.trim(),

      experience:
        profile.experience.trim(),

      languages:
        profile.languages,

      skills:
        profile.skills,

      profilePhoto:
        profile.profilePhoto || "",

      updatedAt:
        new Date().toISOString(),

    };


    try {

      localStorage.setItem(
        storageKey,
        JSON.stringify(profileData)
      );


      setProfile(profileData);

      setEditing(false);

      setMessage(
        "Profile saved successfully."
      );


      /*
       * Tell Sidebar that the profile
       * has changed.
       */

      window.dispatchEvent(
        new Event(
          "campuslink_profile_updated"
        )
      );


    } catch (err) {

      console.error(
        "Profile save failed:",
        err
      );

      setError(
        "Unable to save the profile."
      );

    }

  };


  /* =====================================================
     PROFILE COMPLETION
  ===================================================== */

  const completion = useMemo(() => {

    const fields = [

      profile.name,

      profile.email,

      profile.collegeName,

      profile.degree,

      profile.cgpa,

      profile.graduationYear,

      profile.experience,

      profile.languages.length > 0
        ? "yes"
        : "",

      profile.skills.length > 0
        ? "yes"
        : "",

    ];


    const completed =
      fields.filter(
        Boolean
      ).length;


    return Math.round(
      (completed /
        fields.length) *
        100
    );

  }, [profile]);


  /* =====================================================
     INITIAL
  ===================================================== */

  const initial =
    profile.name
      ?.trim()
      .charAt(0)
      .toUpperCase() || "U";


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="student-profile-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="student-profile-header">

        <div>

          <div className="student-profile-kicker">
            STUDENT PROFILE
          </div>

          <h1>
            Build Your Career Profile
          </h1>

          <p>
            Keep your education, experience,
            skills and career information updated.
          </p>

        </div>


        {!editing && (

          <button
            type="button"
            className="profile-edit-button"
            onClick={() => {
              setEditing(true);
              setMessage("");
            }}
          >

            <Edit3 size={17} />

            Edit Profile

          </button>

        )}

      </div>


      {/* =================================================
          PROFILE SUMMARY
      ================================================= */}

      <div className="profile-summary-card">

        <div className="profile-summary-left">


          {/* PHOTO */}

          <div className="profile-avatar-wrapper">

            <div className="profile-avatar">

              {profile.profilePhoto ? (

                <img
                  src={
                    profile.profilePhoto
                  }
                  alt="Profile"
                />

              ) : (

                <span>
                  {initial}
                </span>

              )}

            </div>


            {editing && (

              <label
                htmlFor="profile-photo-upload"
                className="profile-camera-button"
                title="Upload profile photo"
              >

                <Camera
                  size={16}
                />

              </label>

            )}

            <input
              id="profile-photo-upload"
              type="file"
              accept="image/*"
              onChange={
                handlePhotoUpload
              }
              hidden
            />

          </div>


          {/* NAME */}

          <div className="profile-summary-info">

            <h2>
              {profile.name ||
                "Your Name"}
            </h2>

            <p>
              <Mail size={15} />

              {profile.email ||
                "Email address"}
            </p>

            <p>
              <MapPin size={15} />

              {profile.collegeName ||
                "College / University"}
            </p>

          </div>

        </div>


        {/* COMPLETION */}

        <div className="profile-completion">

          <div className="completion-top">

            <span>
              Profile Completion
            </span>

            <strong>
              {completion}%
            </strong>

          </div>

          <div className="completion-track">

            <div
              className="completion-fill"
              style={{
                width: `${completion}%`,
              }}
            />

          </div>

          <small>
            Complete your profile to improve
            job matching.
          </small>

        </div>

      </div>


      {/* =================================================
          PHOTO ACTION
      ================================================= */}

      {editing && (

        <div className="profile-photo-actions-row">

          <div>

            <strong>
              Profile Photo
            </strong>

            <span>
              Upload an image for your profile.
            </span>

          </div>


          <div className="photo-action-buttons">

            <label
              htmlFor="profile-photo-upload"
              className="photo-upload-button"
            >

              <Camera size={16} />

              Upload Photo

            </label>


            {profile.profilePhoto && (

              <button
                type="button"
                className="photo-remove-button"
                onClick={
                  removePhoto
                }
              >

                <Trash2 size={16} />

                Remove

              </button>

            )}

          </div>

        </div>

      )}


      {/* =================================================
          MESSAGES
      ================================================= */}

      {message && (

        <div className="profile-success-message">

          <CheckCircle2 size={17} />

          {message}

        </div>

      )}


      {error && (

        <div className="profile-error-message">

          {error}

        </div>

      )}


      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={saveProfile}
        className="student-profile-form"
      >


        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <section className="profile-section-card">

          <div className="profile-section-header">

            <div>

              <h2>
                Personal Information
              </h2>

              <p>
                Basic information about you.
              </p>

            </div>

          </div>


          <div className="profile-grid">


            <div className="profile-field">

              <label>
                Full Name
              </label>

              <input
                name="name"
                type="text"
                value={
                  profile.name
                }
                onChange={
                  handleChange
                }
                disabled={!editing}
                placeholder="Enter your full name"
              />

            </div>


            <div className="profile-field">

              <label>
                Email Address
              </label>

              <input
                name="email"
                type="email"
                value={
                  profile.email
                }
                disabled
              />

            </div>


            <div className="profile-field profile-field-full">

              <label>
                College / University
              </label>

              <input
                name="collegeName"
                type="text"
                value={
                  profile.collegeName
                }
                onChange={
                  handleChange
                }
                disabled={!editing}
                placeholder="Enter your college name"
              />

            </div>

          </div>

        </section>


        {/* =================================================
            EDUCATION
        ================================================= */}

        <section className="profile-section-card">

          <div className="profile-section-header">

            <div>

              <h2>
                Education
              </h2>

              <p>
                Add your academic details.
              </p>

            </div>

          </div>


          <div className="profile-grid">


            <div className="profile-field">

              <label>
                Degree
              </label>

              <input
                name="degree"
                type="text"
                value={
                  profile.degree
                }
                onChange={
                  handleChange
                }
                disabled={!editing}
                placeholder="B.Tech / BCA / MCA..."
              />

            </div>


            <div className="profile-field">

              <label>
                CGPA
              </label>

              <input
                name="cgpa"
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={
                  profile.cgpa
                }
                onChange={
                  handleChange
                }
                disabled={!editing}
                placeholder="8.50"
              />

            </div>


            <div className="profile-field">

              <label>
                Graduation Year
              </label>

              <input
                name="graduationYear"
                type="number"
                value={
                  profile.graduationYear
                }
                onChange={
                  handleChange
                }
                disabled={!editing}
                placeholder="2027"
              />

            </div>

          </div>

        </section>


        {/* =================================================
            EXPERIENCE
        ================================================= */}

        <section className="profile-section-card">

          <div className="profile-section-header">

            <div>

              <h2>
                Experience
              </h2>

              <p>
                Tell recruiters about your experience.
              </p>

            </div>

          </div>


          <div className="profile-grid">

            <div className="profile-field profile-field-full">

              <label>
                Experience
              </label>

              <input
                name="experience"
                type="text"
                value={
                  profile.experience
                }
                onChange={
                  handleChange
                }
                disabled={!editing}
                placeholder="Fresher / 1 year / 2 years..."
              />

            </div>

          </div>

        </section>


        {/* =================================================
            PROGRAMMING LANGUAGES
        ================================================= */}

        <section className="profile-section-card">

          <div className="profile-section-header">

            <div>

              <h2>
                Programming Languages
              </h2>

              <p>
                Add the programming languages you know.
              </p>

            </div>

          </div>


          {editing && (

            <div className="tag-input-row">

              <input
                type="text"
                value={
                  languageInput
                }
                onChange={(event) =>
                  setLanguageInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key ===
                    "Enter"
                  ) {

                    event.preventDefault();

                    addLanguage();

                  }

                }}
                placeholder="Python, Java, JavaScript..."
              />

              <button
                type="button"
                onClick={
                  addLanguage
                }
              >

                <Plus size={16} />

                Add

              </button>

            </div>

          )}


          <div className="profile-tags">

            {profile.languages.length === 0 ? (

              <span className="empty-tags">
                No programming languages added.
              </span>

            ) : (

              profile.languages.map(
                (language) => (

                  <span
                    className="profile-tag"
                    key={language}
                  >

                    {language}

                    {editing && (

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

                    )}

                  </span>

                )
              )

            )}

          </div>

        </section>


        {/* =================================================
            TECHNICAL SKILLS
        ================================================= */}

        <section className="profile-section-card">

          <div className="profile-section-header">

            <div>

              <h2>
                Technical Skills
              </h2>

              <p>
                Add your technical and professional skills.
              </p>

            </div>

          </div>


          {editing && (

            <div className="tag-input-row">

              <input
                type="text"
                value={
                  skillInput
                }
                onChange={(event) =>
                  setSkillInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key ===
                    "Enter"
                  ) {

                    event.preventDefault();

                    addSkill();

                  }

                }}
                placeholder="React, SQL, Machine Learning..."
              />

              <button
                type="button"
                onClick={
                  addSkill
                }
              >

                <Plus size={16} />

                Add

              </button>

            </div>

          )}


          <div className="profile-tags">

            {profile.skills.length === 0 ? (

              <span className="empty-tags">
                No technical skills added.
              </span>

            ) : (

              profile.skills.map(
                (skill) => (

                  <span
                    className="profile-tag"
                    key={skill}
                  >

                    {skill}

                    {editing && (

                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(
                            skill
                          )
                        }
                      >

                        <X size={13} />

                      </button>

                    )}

                  </span>

                )
              )

            )}

          </div>

        </section>


        {/* =================================================
            SAVE
        ================================================= */}

        {editing && (

          <div className="profile-save-area">

            <button
              type="submit"
              className="profile-save-button"
            >

              <Save size={18} />

              Save Profile

            </button>

          </div>

        )}

      </form>

    </div>

  );
}


export default StudentProfile;