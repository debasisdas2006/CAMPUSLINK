EXEC(N'
USE campuslink;

-- =========================================================
-- JOB 1: Python Developer
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.jobs
    WHERE job_title = ''Python Developer''
      AND company_id =
      (
          SELECT company_id
          FROM dbo.companies
          WHERE company_code = ''TECH001''
      )
)
BEGIN
    INSERT INTO dbo.jobs
    (
        company_id,
        recruiter_id,
        job_title,
        job_description,
        degree_required,
        minimum_cgpa,
        minimum_experience_years,
        required_languages,
        required_skills,
        interview_required,
        interview_cutoff,
        eligibility_cutoff,
        location,
        employment_type,
        salary_min,
        salary_max,
        application_deadline,
        is_active
    )
    VALUES
    (
        (SELECT company_id FROM dbo.companies WHERE company_code = ''TECH001''),
        (SELECT recruiter_id FROM dbo.recruiters WHERE user_id = 2),

        ''Python Developer'',

        ''Develop and maintain Python-based applications and backend services.'',

        ''B.Tech Computer Science'',

        7.50,

        0,

        ''Python, SQL'',

        ''Python, Machine Learning, FastAPI, Git'',

        1,

        60,

        60,

        ''Bhubaneswar'',

        ''Full Time'',

        400000,

        700000,

        ''2027-03-31'',

        1
    );
END;


-- =========================================================
-- JOB 2: Full Stack Developer
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.jobs
    WHERE job_title = ''Full Stack Developer''
      AND company_id =
      (
          SELECT company_id
          FROM dbo.companies
          WHERE company_code = ''TECH001''
      )
)
BEGIN
    INSERT INTO dbo.jobs
    (
        company_id,
        recruiter_id,
        job_title,
        job_description,
        degree_required,
        minimum_cgpa,
        minimum_experience_years,
        required_languages,
        required_skills,
        interview_required,
        interview_cutoff,
        eligibility_cutoff,
        location,
        employment_type,
        salary_min,
        salary_max,
        application_deadline,
        is_active
    )
    VALUES
    (
        (SELECT company_id FROM dbo.companies WHERE company_code = ''TECH001''),
        (SELECT recruiter_id FROM dbo.recruiters WHERE user_id = 2),

        ''Full Stack Developer'',

        ''Build and maintain modern web applications using JavaScript and React.'',

        ''B.Tech Computer Science'',

        7.00,

        0,

        ''JavaScript, SQL'',

        ''JavaScript, React, Node.js, GitHub'',

        1,

        65,

        60,

        ''Bhubaneswar'',

        ''Full Time'',

        450000,

        800000,

        ''2027-04-15'',

        1
    );
END;


-- =========================================================
-- JOB 3: Machine Learning Engineer
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.jobs
    WHERE job_title = ''Machine Learning Engineer''
      AND company_id =
      (
          SELECT company_id
          FROM dbo.companies
          WHERE company_code = ''DATA001''
      )
)
BEGIN
    INSERT INTO dbo.jobs
    (
        company_id,
        recruiter_id,
        job_title,
        job_description,
        degree_required,
        minimum_cgpa,
        minimum_experience_years,
        required_languages,
        required_skills,
        interview_required,
        interview_cutoff,
        eligibility_cutoff,
        location,
        employment_type,
        salary_min,
        salary_max,
        application_deadline,
        is_active
    )
    VALUES
    (
        (SELECT company_id FROM dbo.companies WHERE company_code = ''DATA001''),
        (SELECT recruiter_id FROM dbo.recruiters WHERE user_id = 6),

        ''Machine Learning Engineer'',

        ''Develop machine learning models and data-driven applications.'' ,

        ''B.Tech Computer Science'',

        8.00,

        0,

        ''Python, SQL'',

        ''Python, Machine Learning, Deep Learning, Artificial Intelligence, Git'',

        1,

        70,

        65,

        ''Bhubaneswar'',

        ''Full Time'',

        500000,

        900000,

        ''2027-04-30'',

        1
    );
END;


-- =========================================================
-- JOB 4: Frontend Developer
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.jobs
    WHERE job_title = ''Frontend Developer''
      AND company_id =
      (
          SELECT company_id
          FROM dbo.companies
          WHERE company_code = ''DATA001''
      )
)
BEGIN
    INSERT INTO dbo.jobs
    (
        company_id,
        recruiter_id,
        job_title,
        job_description,
        degree_required,
        minimum_cgpa,
        minimum_experience_years,
        required_languages,
        required_skills,
        interview_required,
        interview_cutoff,
        eligibility_cutoff,
        location,
        employment_type,
        salary_min,
        salary_max,
        application_deadline,
        is_active
    )
    VALUES
    (
        (SELECT company_id FROM dbo.companies WHERE company_code = ''DATA001''),
        (SELECT recruiter_id FROM dbo.recruiters WHERE user_id = 6),

        ''Frontend Developer'',

        ''Develop responsive user interfaces using modern frontend technologies.'',

        ''B.Tech Computer Science'',

        7.00,

        0,

        ''JavaScript, TypeScript'',

        ''JavaScript, TypeScript, React, HTML, CSS, Tailwind CSS, GitHub'',

        1,

        60,

        60,

        ''Bhubaneswar'',

        ''Full Time'',

        400000,

        750000,

        ''2027-05-15'',

        1
    );
END;


-- =========================================================
-- VERIFY JOBS
-- =========================================================

SELECT
    job_id,
    company_id,
    recruiter_id,
    job_title,
    degree_required,
    minimum_cgpa,
    minimum_experience_years,
    required_languages,
    required_skills,
    interview_required,
    interview_cutoff,
    eligibility_cutoff,
    location,
    employment_type,
    salary_min,
    salary_max,
    application_deadline,
    is_active
FROM dbo.jobs
ORDER BY job_id;
');