USE [campuslink];
GO

IF OBJECT_ID(N'dbo.interviews', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.interviews;
END;
GO

CREATE TABLE dbo.interviews
(
    interview_id INT IDENTITY(1,1) NOT NULL,

    student_id INT NOT NULL,

    job_id INT NOT NULL,

    application_id INT NULL,

    interviewer_user_id INT NULL,

    interview_type NVARCHAR(50) NOT NULL
        CONSTRAINT DF_interviews_type
        DEFAULT ('AI'),

    interview_status NVARCHAR(30) NOT NULL
        CONSTRAINT DF_interviews_status
        DEFAULT ('SCHEDULED'),

    difficulty_level NVARCHAR(30) NULL,

    total_questions INT NOT NULL
        CONSTRAINT DF_interviews_total_questions
        DEFAULT (0),

    questions_answered INT NOT NULL
        CONSTRAINT DF_interviews_questions_answered
        DEFAULT (0),

    interview_score DECIMAL(5,2) NULL,

    cutoff_score DECIMAL(5,2) NULL,

    started_at DATETIME2 NULL,

    completed_at DATETIME2 NULL,

    feedback_summary NVARCHAR(MAX) NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_interviews_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_interviews_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_interviews
        PRIMARY KEY (interview_id),

    CONSTRAINT CK_interviews_type
        CHECK (
            interview_type IN
            (
                'AI',
                'LIVE',
                'AI_ASSISTED'
            )
        ),

    CONSTRAINT CK_interviews_status
        CHECK (
            interview_status IN
            (
                'SCHEDULED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED',
                'ABANDONED'
            )
        ),

    CONSTRAINT CK_interviews_difficulty
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

    CONSTRAINT CK_interviews_total_questions
        CHECK (total_questions >= 0),

    CONSTRAINT CK_interviews_questions_answered
        CHECK (
            questions_answered >= 0
            AND questions_answered <= total_questions
        ),

    CONSTRAINT CK_interviews_score
        CHECK (
            interview_score IS NULL
            OR interview_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_interviews_cutoff
        CHECK (
            cutoff_score IS NULL
            OR cutoff_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_interviews_completed_time
        CHECK (
            completed_at IS NULL
            OR started_at IS NULL
            OR completed_at >= started_at
        )
);
GO

ALTER TABLE dbo.interviews
ADD CONSTRAINT FK_interviews_students
    FOREIGN KEY (student_id)
    REFERENCES dbo.students(student_id);
GO

ALTER TABLE dbo.interviews
ADD CONSTRAINT FK_interviews_jobs
    FOREIGN KEY (job_id)
    REFERENCES dbo.jobs(job_id);
GO

ALTER TABLE dbo.interviews
ADD CONSTRAINT FK_interviews_applications
    FOREIGN KEY (application_id)
    REFERENCES dbo.applications(application_id);
GO

ALTER TABLE dbo.interviews
ADD CONSTRAINT FK_interviews_interviewer_user
    FOREIGN KEY (interviewer_user_id)
    REFERENCES dbo.users(user_id);
GO