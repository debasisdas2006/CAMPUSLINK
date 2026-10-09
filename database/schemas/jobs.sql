USE [campuslink];
GO

/* =========================================================
   CAMPUSLINK - JOBS TABLE
   ========================================================= */

/* ---------------------------------------------------------
   1. Create jobs table if it does not already exist
   --------------------------------------------------------- */

IF OBJECT_ID(N'dbo.jobs', N'U') IS NULL
BEGIN

    CREATE TABLE dbo.jobs
    (
        job_id INT IDENTITY(1,1) NOT NULL,

        company_id INT NOT NULL,
        recruiter_id INT NOT NULL,

        job_title NVARCHAR(200) NOT NULL,
        job_description NVARCHAR(MAX) NULL,

        degree_required NVARCHAR(200) NULL,

        minimum_cgpa DECIMAL(4,2) NULL,

        minimum_experience_years DECIMAL(4,2) NOT NULL
            CONSTRAINT DF_jobs_minimum_experience_years
            DEFAULT (0),

        required_languages NVARCHAR(MAX) NULL,
        required_skills NVARCHAR(MAX) NULL,

        interview_required BIT NOT NULL
            CONSTRAINT DF_jobs_interview_required
            DEFAULT (1),

        interview_cutoff DECIMAL(5,2) NULL,

        eligibility_cutoff DECIMAL(5,2) NULL
            CONSTRAINT DF_jobs_eligibility_cutoff
            DEFAULT (70.00),

        location NVARCHAR(200) NULL,

        employment_type NVARCHAR(50) NULL,

        salary_min DECIMAL(12,2) NULL,
        salary_max DECIMAL(12,2) NULL,

        application_deadline DATE NULL,

        is_active BIT NOT NULL
            CONSTRAINT DF_jobs_is_active
            DEFAULT (1),

        created_at DATETIME2 NOT NULL
            CONSTRAINT DF_jobs_created_at
            DEFAULT (SYSDATETIME()),

        updated_at DATETIME2 NOT NULL
            CONSTRAINT DF_jobs_updated_at
            DEFAULT (SYSDATETIME()),

        CONSTRAINT PK_jobs
            PRIMARY KEY (job_id),

        CONSTRAINT CK_jobs_minimum_cgpa
            CHECK (
                minimum_cgpa IS NULL
                OR minimum_cgpa >= 0
            ),

        CONSTRAINT CK_jobs_minimum_experience
            CHECK (
                minimum_experience_years >= 0
            ),

        CONSTRAINT CK_jobs_interview_cutoff
            CHECK (
                interview_cutoff IS NULL
                OR interview_cutoff BETWEEN 0 AND 100
            ),

        CONSTRAINT CK_jobs_eligibility_cutoff
            CHECK (
                eligibility_cutoff IS NULL
                OR eligibility_cutoff BETWEEN 0 AND 100
            ),

        CONSTRAINT CK_jobs_salary
            CHECK (
                salary_min IS NULL
                OR salary_max IS NULL
                OR salary_max >= salary_min
            )
    );

END;
GO


/* ---------------------------------------------------------
   2. Add company foreign key if missing
   --------------------------------------------------------- */

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_jobs_companies'
      AND parent_object_id = OBJECT_ID(N'dbo.jobs')
)
BEGIN

    ALTER TABLE dbo.jobs
    ADD CONSTRAINT FK_jobs_companies
        FOREIGN KEY (company_id)
        REFERENCES dbo.companies(company_id);

END;
GO


/* ---------------------------------------------------------
   3. Add recruiter foreign key if missing
   --------------------------------------------------------- */

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_jobs_recruiters'
      AND parent_object_id = OBJECT_ID(N'dbo.jobs')
)
BEGIN

    ALTER TABLE dbo.jobs
    ADD CONSTRAINT FK_jobs_recruiters
        FOREIGN KEY (recruiter_id)
        REFERENCES dbo.recruiters(recruiter_id);

END;
GO


/* ---------------------------------------------------------
   4. Verify JOBS columns
   --------------------------------------------------------- */

SELECT
    c.COLUMN_NAME,
    c.DATA_TYPE,
    c.IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE c.TABLE_SCHEMA = 'dbo'
  AND c.TABLE_NAME = 'jobs'
ORDER BY c.ORDINAL_POSITION;
GO


/* ---------------------------------------------------------
   5. Verify JOBS foreign keys
   --------------------------------------------------------- */

SELECT
    fk.name AS ForeignKeyName,

    OBJECT_NAME(fk.parent_object_id) AS ChildTable,

    COL_NAME(
        fkc.parent_object_id,
        fkc.parent_column_id
    ) AS ChildColumn,

    OBJECT_NAME(fk.referenced_object_id) AS ParentTable,

    COL_NAME(
        fkc.referenced_object_id,
        fkc.referenced_column_id
    ) AS ParentColumn

FROM sys.foreign_keys fk

INNER JOIN sys.foreign_key_columns fkc
    ON fk.object_id = fkc.constraint_object_id

WHERE OBJECT_NAME(fk.parent_object_id) = 'jobs'

ORDER BY fk.name;
GO


/* ---------------------------------------------------------
   6. Verify JOBS table exists
   --------------------------------------------------------- */

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'jobs';
GO