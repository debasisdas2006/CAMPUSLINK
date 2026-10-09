USE [campuslink];
GO

IF OBJECT_ID(N'dbo.interview_questions', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.interview_questions;
END;
GO

CREATE TABLE dbo.interview_questions
(
    interview_question_id INT IDENTITY(1,1) NOT NULL,

    interview_id INT NOT NULL,

    skill_id INT NULL,

    question_text NVARCHAR(MAX) NOT NULL,

    question_type NVARCHAR(50) NOT NULL
        CONSTRAINT DF_interview_questions_type
        DEFAULT ('TECHNICAL'),

    difficulty_level NVARCHAR(30) NOT NULL
        CONSTRAINT DF_interview_questions_difficulty
        DEFAULT ('MEDIUM'),

    question_order INT NOT NULL,

    expected_answer NVARCHAR(MAX) NULL,

    time_limit_seconds INT NULL,

    asked_at DATETIME2 NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_interview_questions_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_interview_questions_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_interview_questions
        PRIMARY KEY (interview_question_id),

    CONSTRAINT UQ_interview_questions_order
        UNIQUE (interview_id, question_order),

    CONSTRAINT CK_interview_questions_type
        CHECK (
            question_type IN
            (
                'TECHNICAL',
                'BEHAVIORAL',
                'CODING',
                'PROJECT',
                'GENERAL'
            )
        ),

    CONSTRAINT CK_interview_questions_difficulty
        CHECK (
            difficulty_level IN
            (
                'EASY',
                'MEDIUM',
                'HARD'
            )
        ),

    CONSTRAINT CK_interview_questions_order
        CHECK (question_order > 0),

    CONSTRAINT CK_interview_questions_time_limit
        CHECK (
            time_limit_seconds IS NULL
            OR time_limit_seconds > 0
        )
);
GO

ALTER TABLE dbo.interview_questions
ADD CONSTRAINT FK_interview_questions_interviews
    FOREIGN KEY (interview_id)
    REFERENCES dbo.interviews(interview_id);
GO

ALTER TABLE dbo.interview_questions
ADD CONSTRAINT FK_interview_questions_skills
    FOREIGN KEY (skill_id)
    REFERENCES dbo.skills(skill_id);
GO