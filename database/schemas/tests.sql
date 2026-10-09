USE [campuslink];
GO

IF OBJECT_ID(N'dbo.tests', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.tests;
END;
GO

CREATE TABLE dbo.tests
(
    test_id INT IDENTITY(1,1) NOT NULL,

    job_id INT NULL,

    test_name NVARCHAR(200) NOT NULL,

    test_type NVARCHAR(50) NOT NULL,

    description NVARCHAR(MAX) NULL,

    difficulty_level NVARCHAR(30) NULL,

    total_questions INT NOT NULL
        CONSTRAINT DF_tests_total_questions
        DEFAULT (0),

    duration_minutes INT NULL,

    passing_score DECIMAL(5,2) NULL
        CONSTRAINT DF_tests_passing_score
        DEFAULT (70.00),

    is_active BIT NOT NULL
        CONSTRAINT DF_tests_is_active
        DEFAULT (1),

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_tests_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_tests_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_tests
        PRIMARY KEY (test_id),

    CONSTRAINT CK_tests_type
        CHECK (
            test_type IN
            (
                'SELF_ASSESSMENT',
                'MCQ',
                'TECHNICAL',
                'SKILL_ASSESSMENT'
            )
        ),

    CONSTRAINT CK_tests_difficulty
        CHECK (
            difficulty_level IS NULL
            OR difficulty_level IN
            (
                'EASY',
                'MEDIUM',
                'HARD',
                'ADAPTIVE'
            )
        ),

    CONSTRAINT CK_tests_total_questions
        CHECK (total_questions >= 0),

    CONSTRAINT CK_tests_duration
        CHECK (
            duration_minutes IS NULL
            OR duration_minutes > 0
        ),

    CONSTRAINT CK_tests_passing_score
        CHECK (
            passing_score IS NULL
            OR passing_score BETWEEN 0 AND 100
        )
);
GO

ALTER TABLE dbo.tests
ADD CONSTRAINT FK_tests_jobs
    FOREIGN KEY (job_id)
    REFERENCES dbo.jobs(job_id);
GO