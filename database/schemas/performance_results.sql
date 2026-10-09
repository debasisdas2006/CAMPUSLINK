USE [campuslink];
GO

IF OBJECT_ID(N'dbo.performance_results', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.performance_results;
END;
GO

CREATE TABLE dbo.performance_results
(
    performance_id INT IDENTITY(1,1) NOT NULL,

    student_id INT NOT NULL,

    application_id INT NULL,

    interview_id INT NULL,

    test_attempt_id INT NULL,

    skill_score DECIMAL(5,2) NULL,

    technical_score DECIMAL(5,2) NULL,

    correctness_score DECIMAL(5,2) NULL,

    communication_score DECIMAL(5,2) NULL,

    interview_score DECIMAL(5,2) NULL,

    test_score DECIMAL(5,2) NULL,

    eligibility_score DECIMAL(5,2) NULL,

    job_match_score DECIMAL(5,2) NULL,

    overall_score DECIMAL(5,2) NULL,

    performance_level NVARCHAR(30) NULL,

    strengths NVARCHAR(MAX) NULL,

    weaknesses NVARCHAR(MAX) NULL,

    recommendations NVARCHAR(MAX) NULL,

    evaluated_at DATETIME2 NOT NULL
        CONSTRAINT DF_performance_results_evaluated_at
        DEFAULT (SYSDATETIME()),

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_performance_results_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_performance_results_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_performance_results
        PRIMARY KEY (performance_id),

    CONSTRAINT CK_performance_results_skill_score
        CHECK (
            skill_score IS NULL
            OR skill_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_performance_results_technical_score
        CHECK (
            technical_score IS NULL
            OR technical_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_performance_results_correctness_score
        CHECK (
            correctness_score IS NULL
            OR correctness_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_performance_results_communication_score
        CHECK (
            communication_score IS NULL
            OR communication_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_performance_results_interview_score
        CHECK (
            interview_score IS NULL
            OR interview_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_performance_results_test_score
        CHECK (
            test_score IS NULL
            OR test_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_performance_results_eligibility_score
        CHECK (
            eligibility_score IS NULL
            OR eligibility_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_performance_results_job_match_score
        CHECK (
            job_match_score IS NULL
            OR job_match_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_performance_results_overall_score
        CHECK (
            overall_score IS NULL
            OR overall_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_performance_results_level
        CHECK (
            performance_level IS NULL
            OR performance_level IN
            (
                'EXCELLENT',
                'GOOD',
                'AVERAGE',
                'NEEDS_IMPROVEMENT'
            )
        )
);
GO

ALTER TABLE dbo.performance_results
ADD CONSTRAINT FK_performance_results_students
    FOREIGN KEY (student_id)
    REFERENCES dbo.students(student_id);
GO

ALTER TABLE dbo.performance_results
ADD CONSTRAINT FK_performance_results_applications
    FOREIGN KEY (application_id)
    REFERENCES dbo.applications(application_id);
GO

ALTER TABLE dbo.performance_results
ADD CONSTRAINT FK_performance_results_interviews
    FOREIGN KEY (interview_id)
    REFERENCES dbo.interviews(interview_id);
GO

ALTER TABLE dbo.performance_results
ADD CONSTRAINT FK_performance_results_test_attempts
    FOREIGN KEY (test_attempt_id)
    REFERENCES dbo.test_attempts(attempt_id);
GO