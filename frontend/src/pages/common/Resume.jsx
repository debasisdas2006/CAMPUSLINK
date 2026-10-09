import {
  CheckCircle2,
  Download,
  FileText,
  Search,
  Trash2,
  Upload,
  User,
  Eye,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import "./Resume.css";


/* =========================================================
   INDEXEDDB
========================================================= */

const DB_NAME = "campuslink_resume_database";
const DB_VERSION = 1;
const STORE_NAME = "resumes";


function openResumeDatabase() {

  return new Promise((resolve, reject) => {

    const request =
      indexedDB.open(
        DB_NAME,
        DB_VERSION
      );


    request.onupgradeneeded = () => {

      const db =
        request.result;


      if (
        !db.objectStoreNames.contains(
          STORE_NAME
        )
      ) {

        db.createObjectStore(
          STORE_NAME,
          {
            keyPath: "email",
          }
        );

      }

    };


    request.onsuccess = () => {

      resolve(
        request.result
      );

    };


    request.onerror = () => {

      reject(
        request.error
      );

    };

  });

}


/* =========================================================
   SAVE RESUME
========================================================= */

function saveResumeRecord(record) {

  return openResumeDatabase()
    .then((db) => {

      return new Promise(
        (resolve, reject) => {

          const transaction =
            db.transaction(
              STORE_NAME,
              "readwrite"
            );

          const store =
            transaction.objectStore(
              STORE_NAME
            );


          const request =
            store.put(record);


          request.onsuccess = () => {
            resolve();
          };


          request.onerror = () => {
            reject(
              request.error
            );
          };

        }
      );

    });

}


/* =========================================================
   GET ONE RESUME
========================================================= */

function getResumeRecord(email) {

  return openResumeDatabase()
    .then((db) => {

      return new Promise(
        (resolve, reject) => {

          const transaction =
            db.transaction(
              STORE_NAME,
              "readonly"
            );

          const store =
            transaction.objectStore(
              STORE_NAME
            );


          const request =
            store.get(email);


          request.onsuccess = () => {

            resolve(
              request.result ||
              null
            );

          };


          request.onerror = () => {

            reject(
              request.error
            );

          };

        }
      );

    });

}


/* =========================================================
   GET ALL RESUMES
========================================================= */

function getAllResumeRecords() {

  return openResumeDatabase()
    .then((db) => {

      return new Promise(
        (resolve, reject) => {

          const transaction =
            db.transaction(
              STORE_NAME,
              "readonly"
            );

          const store =
            transaction.objectStore(
              STORE_NAME
            );


          const request =
            store.getAll();


          request.onsuccess = () => {

            resolve(
              Array.isArray(
                request.result
              )
                ? request.result
                : []
            );

          };


          request.onerror = () => {

            reject(
              request.error
            );

          };

        }
      );

    });

}


/* =========================================================
   DELETE RESUME
========================================================= */

function deleteResumeRecord(email) {

  return openResumeDatabase()
    .then((db) => {

      return new Promise(
        (resolve, reject) => {

          const transaction =
            db.transaction(
              STORE_NAME,
              "readwrite"
            );

          const store =
            transaction.objectStore(
              STORE_NAME
            );


          const request =
            store.delete(email);


          request.onsuccess = () => {
            resolve();
          };


          request.onerror = () => {

            reject(
              request.error
            );

          };

        }
      );

    });

}


/* =========================================================
   FORMAT FILE SIZE
========================================================= */

function formatFileSize(bytes) {

  if (!bytes) {
    return "0 KB";
  }


  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];


  const index =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );


  return (
    `${
      (
        bytes /
        Math.pow(
          1024,
          index
        )
      ).toFixed(1)
    } ${units[index]}`
  );

}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

  if (!value) {
    return "Not available";
  }


  try {

    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );

  } catch {

    return "Not available";

  }

}


/* =========================================================
   SAFE LOCAL STORAGE JSON
========================================================= */

function readLocalStorageJSON(key) {

  try {

    const raw =
      localStorage.getItem(key);


    if (!raw) {
      return null;
    }


    const parsed =
      JSON.parse(raw);


    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return parsed;
    }

  } catch {
    /*
      Ignore malformed localStorage.
    */
  }


  return null;

}


/* =========================================================
   GET STUDENT PROFILE
========================================================= */

function getStudentProfile(email) {

  if (!email) {
    return null;
  }


  const cleanEmail =
    String(email)
      .trim();


  const lowerEmail =
    cleanEmail.toLowerCase();


  /*
    IMPORTANT:

    StudentProfile.jsx stores the
    current student profile here.
  */

  const keys = [

    `campuslink_student_profile_${cleanEmail}`,

    `campuslink_student_profile_${lowerEmail}`,

    /*
      Older locations.
    */

    `campuslink_profile_${cleanEmail}`,

    `campuslink_profile_${lowerEmail}`,

    `campuslink_student_${cleanEmail}`,

    `campuslink_student_${lowerEmail}`,
  ];


  for (
    const key of keys
  ) {

    const profile =
      readLocalStorageJSON(
        key
      );


    if (
      profile &&
      typeof profile === "object"
    ) {

      return profile;

    }

  }


  /*
    Final fallback:
    Search all localStorage entries
    for matching email.
  */

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


      if (!key) {
        continue;
      }


      if (
        !key.includes("profile") &&
        !key.includes("student")
      ) {
        continue;
      }


      const profile =
        readLocalStorageJSON(
          key
        );


      if (
        !profile ||
        typeof profile !== "object"
      ) {
        continue;
      }


      const profileEmail =
        String(
          profile.email ||
          ""
        )
          .trim()
          .toLowerCase();


      if (
        profileEmail &&
        profileEmail ===
          lowerEmail
      ) {

        return profile;

      }

    }

  } catch {
    /*
      Ignore localStorage errors.
    */
  }


  return null;

}


/* =========================================================
   GET REGISTERED USER
========================================================= */

function getRegisteredUser(email) {

  if (!email) {
    return null;
  }


  const lowerEmail =
    String(email)
      .trim()
      .toLowerCase();


  try {

    const savedUsers =
      localStorage.getItem(
        "campuslink_registered_users"
      );


    if (!savedUsers) {
      return null;
    }


    const parsed =
      JSON.parse(
        savedUsers
      );


    if (
      !Array.isArray(parsed)
    ) {
      return null;
    }


    const user =
      parsed.find(
        (item) =>
          String(
            item?.email ||
            ""
          )
            .trim()
            .toLowerCase() ===
          lowerEmail
      );


    return user || null;

  } catch {

    return null;

  }

}


/* =========================================================
   GET STUDENT FULL NAME
=========================================================

Priority:

1. StudentProfile.jsx profile
2. Registered user
3. Auth user
4. CampusLink Student
========================================================= */

function getStudentFullName(
  email,
  authUser
) {

  const profile =
    getStudentProfile(
      email
    );


  if (
    profile &&
    typeof profile === "object"
  ) {

    /*
      Check the current Student Profile
      name fields first.
    */

    const fullName =
      profile.name ||
      profile.fullName ||
      profile.full_name ||
      profile.studentName ||
      profile.student_name ||
      profile.displayName ||
      profile.display_name;


    if (
      typeof fullName === "string" &&
      fullName.trim()
    ) {

      return fullName.trim();

    }


    /*
      Support first + last name.
    */

    const firstName =
      profile.firstName ||
      profile.first_name ||
      "";


    const lastName =
      profile.lastName ||
      profile.last_name ||
      "";


    const combinedName =
      `${firstName} ${lastName}`.trim();


    if (combinedName) {
      return combinedName;
    }

  }


  /*
    Registered account fallback.
  */

  const registeredUser =
    getRegisteredUser(
      email
    );


  if (
    registeredUser
  ) {

    const registeredName =
      registeredUser.name ||
      registeredUser.fullName ||
      registeredUser.full_name ||
      registeredUser.displayName;


    if (
      typeof registeredName === "string" &&
      registeredName.trim()
    ) {

      return registeredName.trim();

    }

  }


  /*
    AuthContext fallback.
  */

  const authName =
    authUser?.name ||
    authUser?.fullName ||
    authUser?.full_name ||
    authUser?.displayName;


  if (
    typeof authName === "string" &&
    authName.trim()
  ) {

    return authName.trim();

  }


  return "CampusLink Student";

}


/* =========================================================
   REPAIR RESUME NAME
========================================================= */

async function repairResumeName(
  record,
  authUser
) {

  if (!record?.email) {
    return record;
  }


  const correctName =
    getStudentFullName(
      record.email,
      authUser
    );


  if (
    !correctName
  ) {
    return record;
  }


  const currentName =
    String(
      record.name ||
      ""
    ).trim();


  /*
    Existing old data may contain:

    Das

    while the real Student Profile
    contains:

    Debasis Das
  */

  if (
    currentName ===
    correctName
  ) {
    return record;
  }


  const repairedRecord = {
    ...record,
    name: correctName,
  };


  try {

    await saveResumeRecord(
      repairedRecord
    );

  } catch (error) {

    console.error(
      "Could not repair resume name:",
      error
    );

  }


  return repairedRecord;

}


/* =========================================================
   REPAIR ALL RESUME NAMES
========================================================= */

async function repairAllResumeNames(
  records,
  authUser
) {

  if (
    !Array.isArray(records)
  ) {
    return [];
  }


  const repaired =
    await Promise.all(
      records.map(
        (record) =>
          repairResumeName(
            record,
            authUser
          )
      )
    );


  return repaired;

}


/* =========================================================
   MAIN COMPONENT
========================================================= */

function Resume() {

  const {
    user,
  } = useAuth();


  const fileInputRef =
    useRef(null);


  const role =
    String(
      user?.role || "student"
    ).toLowerCase();


  const isStudent =
    role === "student";


  const pageTitle =
    isStudent
      ? "My Resume"
      : role === "admin"
        ? "All Student Resumes"
        : "Candidate Resumes";


  const pageDescription =
    isStudent
      ? "Upload your latest resume so recruiters can review your profile."
      : "Review resumes uploaded by CampusLink students.";


  const [
    currentResume,
    setCurrentResume,
  ] = useState(null);


  const [
    resumes,
    setResumes,
  ] = useState([]);


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    uploading,
    setUploading,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    profileVersion,
    setProfileVersion,
  ] = useState(0);


  /* =========================================================
     PROFILE / RESUME UPDATE EVENT
  ========================================================= */

  useEffect(() => {

    const handleProfileUpdate =
      () => {

        setProfileVersion(
          (value) =>
            value + 1
        );

      };


    window.addEventListener(
      "campuslink_profile_updated",
      handleProfileUpdate
    );


    window.addEventListener(
      "campuslink_resume_updated",
      handleProfileUpdate
    );


    return () => {

      window.removeEventListener(
        "campuslink_profile_updated",
        handleProfileUpdate
      );


      window.removeEventListener(
        "campuslink_resume_updated",
        handleProfileUpdate
      );

    };

  }, []);


  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {

    let active = true;


    async function loadData() {

      try {

        if (
          isStudent &&
          user?.email
        ) {

          const record =
            await getResumeRecord(
              user.email
            );


          if (!active) {
            return;
          }


          if (record) {

            /*
              Repair old stored name immediately.

              This is the important fix for
              "Das" being displayed instead of
              the complete student name.
            */

            const repairedRecord =
              await repairResumeName(
                record,
                user
              );


            if (!active) {
              return;
            }


            setCurrentResume(
              repairedRecord
            );

          } else {

            setCurrentResume(
              null
            );

          }

        } else {

          const records =
            await getAllResumeRecords();


          if (!active) {
            return;
          }


          /*
            Repair all existing resume
            records so recruiters/admin
            see the correct student names.
          */

          const repairedRecords =
            await repairAllResumeNames(
              records,
              user
            );


          if (!active) {
            return;
          }


          setResumes(
            repairedRecords
          );

        }

      } catch (error) {

        console.error(
          "Could not load resumes:",
          error
        );


        if (
          active
        ) {

          setMessage(
            "Could not load the resume data."
          );

        }

      }

    }


    loadData();


    return () => {

      active = false;

    };

  }, [
    isStudent,
    user?.email,
    user?.role,
    profileVersion,
  ]);


  /* =========================================================
     UPLOAD
  ========================================================= */

  const handleFileSelect =
    async (
      event
    ) => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      setMessage("");


      /*
        Allowed file types.
      */

      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];


      const validExtensions = [
        ".pdf",
        ".doc",
        ".docx",
      ];


      const lowerName =
        file.name.toLowerCase();


      const extensionValid =
        validExtensions.some(
          (extension) =>
            lowerName.endsWith(
              extension
            )
        );


      if (
        !validTypes.includes(
          file.type
        ) &&
        !extensionValid
      ) {

        setMessage(
          "Please upload a PDF, DOC or DOCX resume."
        );


        event.target.value =
          "";


        return;

      }


      /*
        8 MB limit.
      */

      const maxSize =
        8 * 1024 * 1024;


      if (
        file.size >
        maxSize
      ) {

        setMessage(
          "Resume size must be 8 MB or smaller."
        );


        event.target.value =
          "";


        return;

      }


      if (
        !user?.email
      ) {

        setMessage(
          "Please log in before uploading your resume."
        );


        return;

      }


      setUploading(
        true
      );


      try {

        /*
          IMPORTANT:

          Always use the current Student Profile
          name instead of only user.name.
        */

        const correctStudentName =
          getStudentFullName(
            user.email,
            user
          );


        const record = {

          email:
            user.email,

          name:
            correctStudentName,

          fileName:
            file.name,

          fileType:
            file.type,

          fileSize:
            file.size,

          uploadedAt:
            new Date().toISOString(),

          blob:
            file,

        };


        await saveResumeRecord(
          record
        );


        const saved =
          await getResumeRecord(
            user.email
          );


        const repaired =
          await repairResumeName(
            saved,
            user
          );


        setCurrentResume(
          repaired
        );


        setMessage(
          "Resume uploaded successfully."
        );


        window.dispatchEvent(
          new Event(
            "campuslink_resume_updated"
          )
        );

      } catch (error) {

        console.error(
          "Resume upload failed:",
          error
        );


        setMessage(
          "Resume upload failed. Please try again."
        );

      } finally {

        setUploading(
          false
        );


        event.target.value =
          "";

      }

    };


  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete =
    async () => {

      if (
        !user?.email
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          "Delete your uploaded resume?"
        );


      if (!confirmed) {
        return;
      }


      try {

        await deleteResumeRecord(
          user.email
        );


        setCurrentResume(
          null
        );


        setMessage(
          "Resume deleted."
        );


        window.dispatchEvent(
          new Event(
            "campuslink_resume_updated"
          )
        );

      } catch (error) {

        console.error(
          "Could not delete resume:",
          error
        );


        setMessage(
          "Could not delete the resume."
        );

      }

    };


  /* =========================================================
     OPEN RESUME
  ========================================================= */

  const handleViewResume =
    (record) => {

      if (
        !record?.blob
      ) {
        setMessage(
          "Resume file is not available."
        );

        return;

      }


      try {

        const url =
          URL.createObjectURL(
            record.blob
          );


        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );


        setTimeout(
          () => {

            URL.revokeObjectURL(
              url
            );

          },
          60000
        );

      } catch (error) {

        console.error(
          "Could not open resume:",
          error
        );


        setMessage(
          "Could not open the resume file."
        );

      }

    };


  /* =========================================================
     DOWNLOAD
  ========================================================= */

  const handleDownloadResume =
    (record) => {

      if (
        !record?.blob
      ) {
        setMessage(
          "Resume file is not available."
        );

        return;

      }


      try {

        const url =
          URL.createObjectURL(
            record.blob
          );


        const anchor =
          document.createElement(
            "a"
          );


        anchor.href =
          url;


        anchor.download =
          record.fileName ||
          "resume";


        document.body.appendChild(
          anchor
        );


        anchor.click();


        anchor.remove();


        setTimeout(
          () => {

            URL.revokeObjectURL(
              url
            );

          },
          3000
        );

      } catch (error) {

        console.error(
          "Could not download resume:",
          error
        );


        setMessage(
          "Could not download the resume."
        );

      }

    };


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredResumes =
    resumes.filter(
      (record) => {

        const search =
          searchTerm
            .trim()
            .toLowerCase();


        if (!search) {
          return true;
        }


        return (

          String(
            record.name || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            record.email || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            record.fileName || ""
          )
            .toLowerCase()
            .includes(search)

        );

      }
    );


  /* =========================================================
     STUDENT VIEW
  ========================================================= */

  if (isStudent) {

    return (

      <div className="resume-page">


        {/* HEADER */}

        <header className="resume-header">

          <div>

            <div className="resume-kicker">
              CAREER DOCUMENTS
            </div>

            <h1>
              My Resume
            </h1>

            <p>
              Upload your latest resume so
              recruiters can review your
              qualifications and experience.
            </p>

          </div>


          <div className="resume-header-icon">
            <FileText size={27} />
          </div>

        </header>


        {/* UPLOAD */}

        <section className="resume-upload-card">

          <div className="resume-upload-icon">
            <Upload size={29} />
          </div>


          <div className="resume-upload-content">

            <h2>
              Upload Your Resume
            </h2>

            <p>
              Supported formats: PDF, DOC and DOCX.
              Maximum file size: 8 MB.
            </p>


            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={
                handleFileSelect
              }
              hidden
            />


            <button
              type="button"
              className="resume-upload-button"
              disabled={uploading}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              <Upload size={17} />

              {uploading
                ? "Uploading..."
                : currentResume
                  ? "Replace Resume"
                  : "Choose Resume"}

            </button>

          </div>

        </section>


        {/* MESSAGE */}

        {message && (

          <div className="resume-message">

            <CheckCircle2 size={17} />

            <span>
              {message}
            </span>

          </div>

        )}


        {/* CURRENT RESUME */}

        <section className="resume-section">

          <div className="resume-section-heading">

            <div>

              <h2>
                Current Resume
              </h2>

              <p>
                This resume is available to
                recruiters reviewing your profile.
              </p>

            </div>

          </div>


          {currentResume ? (

            <article className="resume-current-card">

              <div className="resume-file-icon">
                <FileText size={24} />
              </div>


              <div className="resume-file-info">

                <strong>
                  {currentResume.fileName}
                </strong>

                <span>

                  {formatFileSize(
                    currentResume.fileSize
                  )}

                  {" · "}

                  Uploaded{" "}

                  {formatDate(
                    currentResume.uploadedAt
                  )}

                </span>

              </div>


              <div className="resume-actions">

                <button
                  type="button"
                  onClick={() =>
                    handleViewResume(
                      currentResume
                    )
                  }
                >

                  <Eye size={16} />

                  View

                </button>


                <button
                  type="button"
                  onClick={() =>
                    handleDownloadResume(
                      currentResume
                    )
                  }
                >

                  <Download size={16} />

                  Download

                </button>


                <button
                  type="button"
                  className="resume-delete-button"
                  onClick={
                    handleDelete
                  }
                >

                  <Trash2 size={16} />

                  Delete

                </button>

              </div>

            </article>

          ) : (

            <div className="resume-empty">

              <FileText size={29} />

              <h3>
                No Resume Uploaded
              </h3>

              <p>
                Upload your resume to make it
                available to recruiters.
              </p>

            </div>

          )}

        </section>


        {/* NOTE */}

        <div className="resume-note">

          <FileText size={16} />

          <span>
            Your resume is stored locally in this
            frontend prototype. During backend
            integration, it will be stored securely
            through the CampusLink backend.
          </span>

        </div>

      </div>

    );

  }


  /* =========================================================
     RECRUITER / ADMIN VIEW
  ========================================================= */

  return (

    <div className="resume-page">


      {/* HEADER */}

      <header className="resume-header">

        <div>

          <div className="resume-kicker">
            RECRUITMENT DOCUMENTS
          </div>

          <h1>
            {pageTitle}
          </h1>

          <p>
            {pageDescription}
          </p>

        </div>


        <div className="resume-header-icon">
          <FileText size={27} />
        </div>

      </header>


      {/* STATS */}

      <div className="resume-stats">

        <div>

          <span>
            Uploaded Resumes
          </span>

          <strong>
            {resumes.length}
          </strong>

        </div>


        <div>

          <span>
            Student Profiles
          </span>

          <strong>
            {resumes.length}
          </strong>

        </div>

      </div>


      {/* SEARCH */}

      <div className="resume-search">

        <Search size={18} />

        <input
          type="text"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
          placeholder="Search student name, email or resume..."
        />

      </div>


      {/* LIST */}

      <section className="resume-section">

        <div className="resume-section-heading">

          <div>

            <h2>
              Student Resumes
            </h2>

            <p>
              View or download resumes uploaded
              by students.
            </p>

          </div>

          <span className="resume-count-badge">
            {filteredResumes.length}
          </span>

        </div>


        {filteredResumes.length === 0 ? (

          <div className="resume-empty">

            <FileText size={29} />

            <h3>
              No Resumes Found
            </h3>

            <p>
              Student resumes will appear here
              after they upload their documents.
            </p>

          </div>

        ) : (

          <div className="resume-list">

            {filteredResumes.map(
              (record) => (

                <article
                  className="resume-candidate-card"
                  key={
                    record.email
                  }
                >

                  <div className="resume-candidate-avatar">

                    {(
                      record.name ||
                      "S"
                    )
                      .charAt(0)
                      .toUpperCase()}

                  </div>


                  <div className="resume-candidate-info">

                    <h3>
                      {record.name ||
                        "Student"}
                    </h3>

                    <p>
                      {record.email}
                    </p>


                    <div className="resume-file-line">

                      <FileText
                        size={14}
                      />

                      <span>
                        {record.fileName}
                      </span>

                      <span>
                        {formatFileSize(
                          record.fileSize
                        )}
                      </span>

                    </div>


                    <small>
                      Uploaded{" "}

                      {formatDate(
                        record.uploadedAt
                      )}

                    </small>

                  </div>


                  <div className="resume-candidate-actions">

                    <button
                      type="button"
                      onClick={() =>
                        handleViewResume(
                          record
                        )
                      }
                    >

                      <Eye size={16} />

                      View

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadResume(
                          record
                        )
                      }
                    >

                      <Download size={16} />

                      Download

                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>


      <div className="resume-note">

        <User size={16} />

        <span>
          Recruiters can review student resumes
          here. Backend storage will later make
          resumes available across different devices.
        </span>

      </div>

    </div>

  );

}


export default Resume;