USE [campuslink];
GO

IF OBJECT_ID(N'dbo.test_attempts', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.test_attempts;
END;
GO

CREATE TABLE dbo.test_attempts
(
    attempt_id INT IDENTITY(1,1) NOT NULL,

    test_id INT NOT NULL,

    student_id INT NOT NULL,

    application_id INT NULL,

    started_at DATETIME2 NOT NULL
        CONSTRAINT DF_test_attempts_started_at
        DEFAULT (SYSDATETIME()),

    completed_at DATETIME2 NULL,

    total_questions INT NOT NULL,

    correct_answers INT NOT NULL
        CONSTRAINT DF_test_attempts_correct_answers
        DEFAULT (0),

    score DECIMAL(5,2) NULL,

    percentage DECIMAL(5,2) NULL,

    attempt_status NVARCHAR(30) NOT NULL
        CONSTRAINT DF_test_attempts_status
        DEFAULT ('IN_PROGRESS'),

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_test_attempts_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_test_attempts_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_test_attempts
        PRIMARY KEY (attempt_id),

    CONSTRAINT CK_test_attempts_total_questions
        CHECK (total_questions > 0),

    CONSTRAINT CK_test_attempts_correct_answers
        CHECK (
            correct_answers >= 0
            AND correct_answers <= total_questions
        ),

    CONSTRAINT CK_test_attempts_score
        CHECK (
            score IS NULL
            OR score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_test_attempts_percentage
        CHECK (
            percentage IS NULL
            OR percentage BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_test_attempts_status
        CHECK (
            attempt_status IN
            (
                'IN_PROGRESS',
                'COMPLETED',
                'ABANDONED',
                'PASSED',
                'FAILED'
            )
        ),

    CONSTRAINT CK_test_attempts_completed_time
        CHECK (
            completed_at IS NULL
            OR completed_at >= started_at
        )
);
GO

ALTER TABLE dbo.test_attempts
ADD CONSTRAINT FK_test_attempts_tests
    FOREIGN KEY (test_id)
    REFERENCES dbo.tests(test_id);
GO

ALTER TABLE dbo.test_attempts
ADD CONSTRAINT FK_test_attempts_students
    FOREIGN KEY (student_id)
    REFERENCES dbo.students(student_id);
GO

ALTER TABLE dbo.test_attempts
ADD CONSTRAINT FK_test_attempts_applications
    FOREIGN KEY (application_id)
    REFERENCES dbo.applications(application_id);
GO