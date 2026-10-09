USE [campuslink];
GO

IF OBJECT_ID(N'dbo.applications', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.applications;
END;
GO

CREATE TABLE dbo.applications
(
    application_id INT IDENTITY(1,1) NOT NULL,

    student_id INT NOT NULL,

    job_id INT NOT NULL,

    application_status NVARCHAR(30) NOT NULL
        CONSTRAINT DF_applications_status
        DEFAULT ('APPLIED'),

    eligibility_score DECIMAL(5,2) NULL,

    skill_match_score DECIMAL(5,2) NULL,

    job_match_score DECIMAL(5,2) NULL,

    applied_at DATETIME2 NOT NULL
        CONSTRAINT DF_applications_applied_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_applications_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_applications
        PRIMARY KEY (application_id),

    CONSTRAINT UQ_applications_student_job
        UNIQUE (student_id, job_id),

    CONSTRAINT CK_applications_status
        CHECK (
            application_status IN
            (
                'APPLIED',
                'ELIGIBLE',
                'NOT_ELIGIBLE',
                'SHORTLISTED',
                'INTERVIEW',
                'SELECTED',
                'REJECTED',
                'WITHDRAWN'
            )
        ),

    CONSTRAINT CK_applications_eligibility_score
        CHECK (
            eligibility_score IS NULL
            OR eligibility_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_applications_skill_match_score
        CHECK (
            skill_match_score IS NULL
            OR skill_match_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_applications_job_match_score
        CHECK (
            job_match_score IS NULL
            OR job_match_score BETWEEN 0 AND 100
        )
);
GO

ALTER TABLE dbo.applications
ADD CONSTRAINT FK_applications_students
    FOREIGN KEY (student_id)
    REFERENCES dbo.students(student_id);
GO

ALTER TABLE dbo.applications
ADD CONSTRAINT FK_applications_jobs
    FOREIGN KEY (job_id)
    REFERENCES dbo.jobs(job_id);
GO