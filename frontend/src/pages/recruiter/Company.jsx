import { useEffect, useState } from "react";
import {
  Building2,
  Factory,
  Globe,
  Mail,
  MapPin,
  Save,
  User,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./Company.css";


function Company() {
  const { user } = useAuth();

  const recruiterEmail =
    user?.email || "recruiter@campuslink.com";

  const storageKey =
    `campuslink_company_${recruiterEmail}`;


  const [company, setCompany] = useState({
    companyName: "",
    recruiterName: "",
    email: recruiterEmail,
    industry: "",
    location: "",
    website: "",
    description: "",
  });


  const [message, setMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);


  /* =========================================
     LOAD COMPANY DATA
  ========================================= */

  useEffect(() => {
    try {
      const savedCompany =
        localStorage.getItem(storageKey);

      if (savedCompany) {
        const parsedCompany =
          JSON.parse(savedCompany);

        setCompany({
          companyName:
            parsedCompany.companyName || "",

          recruiterName:
            parsedCompany.recruiterName ||
            user?.name ||
            "",

          email:
            parsedCompany.email ||
            recruiterEmail,

          industry:
            parsedCompany.industry || "",

          location:
            parsedCompany.location || "",

          website:
            parsedCompany.website || "",

          description:
            parsedCompany.description || "",
        });
      } else {
        setCompany((previous) => ({
          ...previous,
          recruiterName:
            user?.name || "",
          email:
            recruiterEmail,
        }));
      }
    } catch (error) {
      console.error(
        "Could not load company information:",
        error
      );
    }
  }, [
    storageKey,
    recruiterEmail,
    user?.name,
  ]);


  /* =========================================
     HANDLE INPUT
  ========================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setCompany((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setIsSaved(false);
  };


  /* =========================================
     SAVE COMPANY
  ========================================= */

  const handleSave = (event) => {
    event.preventDefault();

    if (!company.companyName.trim()) {
      setMessage(
        "Please enter the company name."
      );
      return;
    }

    if (!company.industry.trim()) {
      setMessage(
        "Please enter the company industry."
      );
      return;
    }

    if (!company.location.trim()) {
      setMessage(
        "Please enter the company location."
      );
      return;
    }

    const companyData = {
      ...company,

      companyName:
        company.companyName.trim(),

      recruiterName:
        company.recruiterName.trim(),

      email:
        company.email.trim(),

      industry:
        company.industry.trim(),

      location:
        company.location.trim(),

      website:
        company.website.trim(),

      description:
        company.description.trim(),

      updatedAt:
        new Date().toISOString(),
    };


    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(companyData)
      );

      setCompany(companyData);

      setIsSaved(true);

      setMessage(
        "Company information saved successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Could not save company information:",
        error
      );

      setMessage(
        "Could not save company information."
      );
    }
  };


  return (
    <div className="company-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="company-header">

        <div>
          <div className="company-eyebrow">
            RECRUITER PORTAL
          </div>

          <h1>
            Company Profile
          </h1>

          <p>
            Manage your company information
            used for jobs, requirements and
            candidate recruitment.
          </p>
        </div>


        <div className="company-header-icon">
          <Building2 size={30} />
        </div>

      </div>


      {/* =====================================
          SUCCESS / ERROR MESSAGE
      ===================================== */}

      {message && (
        <div
          className={
            isSaved
              ? "company-message success"
              : "company-message error"
          }
        >
          {message}
        </div>
      )}


      {/* =====================================
          COMPANY FORM
      ===================================== */}

      <form
        className="company-card"
        onSubmit={handleSave}
      >

        <div className="company-card-heading">

          <div className="company-heading-icon">
            <Building2 size={22} />
          </div>

          <div>
            <h2>
              Company Information
            </h2>

            <p>
              Enter the details that recruiters
              and candidates will see.
            </p>
          </div>

        </div>


        {/* =================================
            BASIC INFORMATION
        ================================= */}

        <div className="company-section">

          <div className="company-section-title">
            Basic Information
          </div>


          <div className="company-form-grid">

            {/* Company Name */}

            <div className="company-field">

              <label htmlFor="companyName">
                Company Name
                <span>*</span>
              </label>

              <div className="company-input-wrapper">

                <Building2 size={18} />

                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Enter company name"
                  value={company.companyName}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* Industry */}

            <div className="company-field">

              <label htmlFor="industry">
                Industry
                <span>*</span>
              </label>

              <div className="company-input-wrapper">

                <Factory size={18} />

                <input
                  id="industry"
                  name="industry"
                  type="text"
                  placeholder="e.g. Software, Finance, Healthcare"
                  value={company.industry}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* Location */}

            <div className="company-field">

              <label htmlFor="location">
                Location
                <span>*</span>
              </label>

              <div className="company-input-wrapper">

                <MapPin size={18} />

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Bengaluru, India"
                  value={company.location}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* Website */}

            <div className="company-field">

              <label htmlFor="website">
                Website
              </label>

              <div className="company-input-wrapper">

                <Globe size={18} />

                <input
                  id="website"
                  name="website"
                  type="text"
                  placeholder="https://example.com"
                  value={company.website}
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>

        </div>


        {/* =================================
            RECRUITER INFORMATION
        ================================= */}

        <div className="company-section">

          <div className="company-section-title">
            Recruiter Information
          </div>


          <div className="company-form-grid">

            {/* Recruiter Name */}

            <div className="company-field">

              <label htmlFor="recruiterName">
                Recruiter Name
              </label>

              <div className="company-input-wrapper">

                <User size={18} />

                <input
                  id="recruiterName"
                  name="recruiterName"
                  type="text"
                  placeholder="Recruiter name"
                  value={company.recruiterName}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* Email */}

            <div className="company-field">

              <label htmlFor="email">
                Recruiter Email
              </label>

              <div className="company-input-wrapper">

                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={company.email}
                  readOnly
                />

              </div>

              <small>
                Email is connected to the
                recruiter account.
              </small>

            </div>

          </div>

        </div>


        {/* =================================
            DESCRIPTION
        ================================= */}

        <div className="company-section">

          <div className="company-section-title">
            Company Description
          </div>


          <div className="company-field">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows="6"
              placeholder="Describe your company, products, services, work culture and career opportunities..."
              value={company.description}
              onChange={handleChange}
            />

            <div className="company-character-count">
              {company.description.length}
              {" "}
              characters
            </div>

          </div>

        </div>


        {/* =================================
            SAVE BUTTON
        ================================= */}

        <div className="company-form-footer">

          <div className="company-required-note">
            <span>*</span>
            Required fields
          </div>


          <button
            type="submit"
            className="company-save-button"
          >
            <Save size={18} />

            {isSaved
              ? "Saved"
              : "Save Company"}
          </button>

        </div>

      </form>

    </div>
  );
}


export default Company;