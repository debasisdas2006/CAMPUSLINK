import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  BriefcaseBusiness,
  RefreshCw,
  Search,
  X,
  UserRound,
  MapPin,
} from "lucide-react";

import "./Companies.css";

const USERS_KEY = "campuslink_registered_users";

function safeParse(value, fallback = null) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  const loadCompanies = () => {
    const companyMap = new Map();

    let users = safeParse(
      localStorage.getItem(USERS_KEY) || "[]",
      []
    );

    if (!Array.isArray(users)) {
      users = [];
    }

    /* =========================================
       LOAD RECRUITERS
    ========================================= */

    const recruiters = users.filter(
      (user) =>
        normalize(user.role) === "recruiter"
    );

    recruiters.forEach((recruiter) => {
      const recruiterEmail =
        String(recruiter.email || "").trim();

      if (!recruiterEmail) return;

      const jobsKey =
        `campuslink_jobs_${recruiterEmail}`;

      const requirementsKey =
        `campuslink_requirements_${recruiterEmail}`;

      const jobs = safeParse(
        localStorage.getItem(jobsKey) || "[]",
        []
      );

      const requirements = safeParse(
        localStorage.getItem(requirementsKey),
        null
      );

      const recruiterCompany =
        String(
          recruiter.company ||
          recruiter.companyName ||
          ""
        ).trim();

      if (recruiterCompany) {
        addCompany(
          companyMap,
          recruiterCompany,
          recruiter,
          jobs,
          requirements
        );
      }

      if (Array.isArray(jobs)) {
        jobs.forEach((job) => {
          const companyName =
            String(
              job.companyName ||
              recruiterCompany ||
              ""
            ).trim();

          if (!companyName) return;

          addCompany(
            companyMap,
            companyName,
            recruiter,
            jobs,
            requirements
          );
        });
      }
    });

    /* =========================================
       DISCOVER COMPANY DATA FROM LOCAL STORAGE
    ========================================= */

    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith("campuslink_company_")) {
        return;
      }

      const data = safeParse(
        localStorage.getItem(key),
        null
      );

      if (!data || typeof data !== "object") {
        return;
      }

      const companyName =
        String(
          data.companyName ||
          data.name ||
          data.company ||
          ""
        ).trim();

      if (!companyName) return;

      const existing =
        companyMap.get(normalize(companyName));

      if (existing) {
        existing.companyData = data;
      } else {
        companyMap.set(
          normalize(companyName),
          {
            id: `COMPANY-${companyMap.size + 1}`,
            name: companyName,
            recruiters: [],
            jobs: [],
            requirements: [],
            companyData: data,
          }
        );
      }
    });

    setCompanies(
      Array.from(companyMap.values()).sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      )
    );
  };

  const addCompany = (
    companyMap,
    companyName,
    recruiter,
    jobs,
    requirements
  ) => {
    const key = normalize(companyName);

    if (!companyMap.has(key)) {
      companyMap.set(key, {
        id: `COMPANY-${companyMap.size + 1}`,
        name: companyName,
        recruiters: [],
        jobs: [],
        requirements: [],
        companyData: null,
      });
    }

    const company =
      companyMap.get(key);

    const recruiterEmail =
      String(recruiter?.email || "")
        .trim()
        .toLowerCase();

    if (
      recruiterEmail &&
      !company.recruiters.some(
        (item) =>
          normalize(item.email) ===
          recruiterEmail
      )
    ) {
      company.recruiters.push({
        name:
          recruiter.name ||
          "Recruiter",
        email:
          recruiter.email,
      });
    }

    if (Array.isArray(jobs)) {
      jobs.forEach((job) => {
        const belongsToCompany =
          normalize(job.companyName) === key;

        if (!belongsToCompany) return;

        if (
          !company.jobs.some(
            (item) => item.id === job.id
          )
        ) {
          company.jobs.push(job);
        }
      });
    }

    if (
      requirements &&
      typeof requirements === "object"
    ) {
      const requirementExists =
        company.requirements.some(
          (item) =>
            normalize(item.email) ===
            recruiterEmail
        );

      if (!requirementExists) {
        company.requirements.push({
          email: recruiter.email,
          ...requirements,
        });
      }
    }
  };

  useEffect(() => {
    loadCompanies();

    const handleUpdate = () => {
      loadCompanies();
    };

    window.addEventListener(
      "campuslink_profile_updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "campuslink_profile_updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, []);

  const filteredCompanies = useMemo(() => {
    const query = normalize(search);

    if (!query) {
      return companies;
    }

    return companies.filter((company) => {
      const recruiterText =
        company.recruiters
          .map(
            (recruiter) =>
              `${recruiter.name} ${recruiter.email}`
          )
          .join(" ");

      const jobText =
        company.jobs
          .map(
            (job) =>
              `${job.title} ${job.location}`
          )
          .join(" ");

      return normalize(
        `${company.name} ${recruiterText} ${jobText}`
      ).includes(query);
    });
  }, [companies, search]);

  const totalJobs = companies.reduce(
    (total, company) =>
      total + company.jobs.length,
    0
  );

  const totalRecruiters = companies.reduce(
    (total, company) =>
      total + company.recruiters.length,
    0
  );

  return (
    <div className="admin-companies-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="admin-companies-header">

        <div>
          <div className="admin-companies-eyebrow">
            ADMINISTRATION
          </div>

          <h1>
            Manage Companies
          </h1>

          <p>
            View companies, recruiters and
            job postings across CampusLink.
          </p>
        </div>

        <button
          className="admin-companies-refresh"
          onClick={loadCompanies}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>


      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="admin-company-summary">

        <div className="admin-company-summary-card">

          <div className="admin-company-summary-icon">
            <Building2 size={22} />
          </div>

          <div>
            <span>
              Total Companies
            </span>

            <strong>
              {companies.length}
            </strong>
          </div>

        </div>


        <div className="admin-company-summary-card">

          <div className="admin-company-summary-icon">
            <UserRound size={22} />
          </div>

          <div>
            <span>
              Recruiters
            </span>

            <strong>
              {totalRecruiters}
            </strong>
          </div>

        </div>


        <div className="admin-company-summary-card">

          <div className="admin-company-summary-icon">
            <BriefcaseBusiness size={22} />
          </div>

          <div>
            <span>
              Job Postings
            </span>

            <strong>
              {totalJobs}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================
          SEARCH
      ===================================== */}

      <div className="admin-companies-filter">

        <div className="admin-company-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search company, recruiter or job..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

        </div>

      </div>


      {/* =====================================
          COMPANY LIST
      ===================================== */}

      {filteredCompanies.length === 0 ? (

        <div className="admin-companies-empty">

          <Building2 size={42} />

          <h3>
            No companies found
          </h3>

          <p>
            Companies will appear here when
            recruiters create company or job
            information.
          </p>

        </div>

      ) : (

        <div className="admin-company-grid">

          {filteredCompanies.map((company) => (

            <div
              className="admin-company-card"
              key={company.id}
            >

              <div className="admin-company-card-top">

                <div className="admin-company-logo">
                  <Building2 size={27} />
                </div>

                <div>
                  <h3>
                    {company.name}
                  </h3>

                  <span>
                    {company.jobs.length}{" "}
                    job
                    {company.jobs.length !== 1
                      ? "s"
                      : ""}{" "}
                    posted
                  </span>
                </div>

              </div>


              <div className="admin-company-stats">

                <div>
                  <UserRound size={16} />

                  <span>
                    {company.recruiters.length}
                    {" "}
                    Recruiter
                    {company.recruiters.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <div>
                  <BriefcaseBusiness size={16} />

                  <span>
                    {company.jobs.length}
                    {" "}
                    Job
                    {company.jobs.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

              </div>


              <button
                className="admin-company-view"
                onClick={() =>
                  setSelectedCompany(company)
                }
              >
                View Company Details
              </button>

            </div>

          ))}

        </div>

      )}


      {/* =====================================
          DETAILS MODAL
      ===================================== */}

      {selectedCompany && (

        <div
          className="admin-company-modal-overlay"
          onClick={() =>
            setSelectedCompany(null)
          }
        >

          <div
            className="admin-company-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-company-modal-header">

              <div>
                <div className="admin-company-modal-icon">
                  <Building2 size={25} />
                </div>

                <h2>
                  {selectedCompany.name}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedCompany(null)
                }
                aria-label="Close"
              >
                <X size={21} />
              </button>

            </div>


            {/* Recruiters */}

            <div className="admin-company-detail-section">

              <h3>
                Recruiters
              </h3>

              {selectedCompany.recruiters.length === 0 ? (

                <p className="admin-company-muted">
                  No recruiter information available.
                </p>

              ) : (

                <div className="admin-company-recruiters">

                  {selectedCompany.recruiters.map(
                    (recruiter, index) => (

                      <div
                        className="admin-company-recruiter"
                        key={`${recruiter.email}-${index}`}
                      >

                        <UserRound size={18} />

                        <div>
                          <strong>
                            {recruiter.name}
                          </strong>

                          <span>
                            {recruiter.email}
                          </span>
                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* Jobs */}

            <div className="admin-company-detail-section">

              <h3>
                Job Postings
              </h3>

              {selectedCompany.jobs.length === 0 ? (

                <p className="admin-company-muted">
                  No job postings available.
                </p>

              ) : (

                <div className="admin-company-jobs">

                  {selectedCompany.jobs.map(
                    (job, index) => (

                      <div
                        className="admin-company-job"
                        key={
                          job.id ||
                          `${job.title}-${index}`
                        }
                      >

                        <div>
                          <strong>
                            {job.title ||
                              "Untitled Job"}
                          </strong>

                          <span>
                            {job.location ||
                              "Location not specified"}
                          </span>
                        </div>

                        <BriefcaseBusiness
                          size={18}
                        />

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* Requirements */}

            {selectedCompany.requirements.length > 0 && (

              <div className="admin-company-detail-section">

                <h3>
                  Requirements
                </h3>

                <div className="admin-company-requirement-grid">

                  {selectedCompany.requirements.map(
                    (requirement, index) => (

                      <div
                        className="admin-company-requirement"
                        key={`${requirement.email}-${index}`}
                      >

                        <strong>
                          Degree
                        </strong>

                        <span>
                          {requirement.degree ||
                            "Not specified"}
                        </span>


                        <strong>
                          Minimum CGPA
                        </strong>

                        <span>
                          {requirement.minimumCGPA ||
                            "Not specified"}
                        </span>


                        <strong>
                          Experience
                        </strong>

                        <span>
                          {requirement.experience ||
                            "Not specified"}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Companies;