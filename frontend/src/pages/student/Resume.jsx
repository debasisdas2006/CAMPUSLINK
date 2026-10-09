import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  File,
} from "lucide-react";

import "./Resume.css";

function Resume() {
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("campuslink_user") || "null"
  );

  const email = user?.email || "guest";

  const storageKey =
    `campuslink_resume_${email}`;

  /* =====================================================
     LOAD RESUME
  ===================================================== */

  useEffect(() => {
    try {
      const savedResume =
        localStorage.getItem(storageKey);

      if (savedResume) {
        setResume(JSON.parse(savedResume));
      }
    } catch (error) {
      console.error(
        "Unable to load resume:",
        error
      );
    }
  }, [storageKey]);


  /* =====================================================
     UPLOAD RESUME
  ===================================================== */

  const handleUpload = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setError("");


    /* =================================================
       ALLOWED FILE TYPES
    ================================================= */

    const allowedTypes = [
      "application/pdf",

      "application/msword",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];

    const fileName =
      file.name.toLowerCase();

    const hasValidExtension =
      allowedExtensions.some(
        (extension) =>
          fileName.endsWith(extension)
      );

    const hasValidType =
      allowedTypes.includes(
        file.type
      );

    if (
      !hasValidType &&
      !hasValidExtension
    ) {
      setError(
        "Please upload a PDF, DOC or DOCX resume."
      );

      event.target.value = "";

      return;
    }


    /* =================================================
       READ FILE
    ================================================= */

    const reader =
      new FileReader();

    reader.onload = () => {

      try {

        const resumeData = {
          name: file.name,

          size: file.size,

          type:
            file.type ||
            "application/octet-stream",

          uploadedAt:
            new Date().toISOString(),

          data:
            reader.result,
        };


        localStorage.setItem(
          storageKey,
          JSON.stringify(
            resumeData
          )
        );


        setResume(
          resumeData
        );

        setMessage(
          "Resume uploaded successfully."
        );

      } catch (error) {

        console.error(
          "Resume save error:",
          error
        );

        setError(
          "Resume could not be saved. The file may be too large."
        );
      }
    };


    reader.onerror = () => {

      setError(
        "Unable to read the selected resume."
      );

    };


    reader.readAsDataURL(file);

    event.target.value = "";
  };


  /* =====================================================
     DELETE RESUME
  ===================================================== */

  const handleDelete = () => {

    const confirmed =
      window.confirm(
        "Are you sure you want to remove your resume?"
      );

    if (!confirmed) {
      return;
    }


    localStorage.removeItem(
      storageKey
    );

    setResume(null);

    setMessage(
      "Resume removed successfully."
    );

    setError("");
  };


  /* =====================================================
     DOWNLOAD RESUME
  ===================================================== */

  const handleDownload = () => {

    if (!resume?.data) {
      return;
    }

    const link =
      document.createElement("a");

    link.href =
      resume.data;

    link.download =
      resume.name ||
      "CampusLink-Resume";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };


  /* =====================================================
     FORMAT FILE SIZE
  ===================================================== */

  const formatFileSize = (bytes) => {

    if (!bytes) {
      return "Unknown size";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };


  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  return (
    <div className="resume-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="resume-header">

        <div>

          <div className="resume-eyebrow">
            CAREER DOCUMENTS
          </div>

          <h1>
            My Resume
          </h1>

          <p>
            Upload and manage your resume for
            job applications and recruiter review.
          </p>

        </div>

        <div className="resume-header-icon">

          <FileText
            size={28}
          />

        </div>

      </div>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="resume-content">


        {/* =================================================
            UPLOAD CARD
        ================================================= */}

        <section className="resume-upload-card">

          <div className="resume-section-heading">

            <div className="resume-section-icon">

              <Upload
                size={20}
              />

            </div>

            <div>

              <h2>
                Upload Resume
              </h2>

              <p>
                Keep your latest resume available
                for recruiters.
              </p>

            </div>

          </div>


          <label
            htmlFor="resume-upload"
            className="resume-upload-area"
          >

            <div className="resume-upload-icon">

              <Upload
                size={30}
              />

            </div>

            <h3>
              {resume
                ? "Replace your resume"
                : "Upload your resume"}
            </h3>

            <p>
              Click here to select your
              resume file
            </p>

            <span>
              PDF, DOC or DOCX
            </span>

            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={
                handleUpload
              }
            />

          </label>


          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (

            <div className="resume-message success">

              <CheckCircle2
                size={17}
              />

              <span>
                {message}
              </span>

            </div>

          )}


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (

            <div className="resume-message error">

              <AlertCircle
                size={17}
              />

              <span>
                {error}
              </span>

            </div>

          )}

        </section>


        {/* =================================================
            CURRENT RESUME
        ================================================= */}

        <section className="resume-current-card">

          <div className="resume-section-heading">

            <div className="resume-section-icon">

              <FileText
                size={20}
              />

            </div>

            <div>

              <h2>
                Current Resume
              </h2>

              <p>
                Your resume currently stored
                in CAMPUSLINK.
              </p>

            </div>

          </div>


          {resume ? (

            <div className="resume-file-card">

              <div className="resume-file-icon">

                <File
                  size={25}
                />

              </div>


              <div className="resume-file-information">

                <h3>
                  {resume.name}
                </h3>

                <p>
                  {formatFileSize(
                    resume.size
                  )}
                  {" • "}
                  Uploaded{" "}
                  {formatDate(
                    resume.uploadedAt
                  )}
                </p>

              </div>


              <div className="resume-file-actions">

                <button
                  type="button"
                  className="resume-action-button download"
                  onClick={
                    handleDownload
                  }
                >

                  <Download
                    size={17}
                  />

                  <span>
                    Download
                  </span>

                </button>


                <button
                  type="button"
                  className="resume-action-button delete"
                  onClick={
                    handleDelete
                  }
                >

                  <Trash2
                    size={17}
                  />

                  <span>
                    Remove
                  </span>

                </button>

              </div>

            </div>

          ) : (

            <div className="resume-empty">

              <FileText
                size={38}
              />

              <h3>
                No resume uploaded
              </h3>

              <p>
                Upload your resume so recruiters
                can review your career information.
              </p>

            </div>

          )}

        </section>


        {/* =================================================
            INFORMATION
        ================================================= */}

        <section className="resume-info-card">

          <div className="resume-info-icon">
            <CheckCircle2
              size={20}
            />
          </div>

          <div>

            <h3>
              Resume Ready
            </h3>

            <p>
              Keep your resume updated with your
              latest education, skills, projects
              and experience.
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Resume;