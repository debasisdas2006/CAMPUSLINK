USE [campuslink];
GO

IF OBJECT_ID(N'dbo.test_questions', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.test_questions;
END;
GO

CREATE TABLE dbo.test_questions
(
    question_id INT IDENTITY(1,1) NOT NULL,

    test_id INT NOT NULL,

    question_text NVARCHAR(MAX) NOT NULL,

    option_a NVARCHAR(500) NOT NULL,

    option_b NVARCHAR(500) NOT NULL,

    option_c NVARCHAR(500) NOT NULL,

    option_d NVARCHAR(500) NOT NULL,

    correct_option CHAR(1) NOT NULL,

    explanation NVARCHAR(MAX) NULL,

    difficulty_level NVARCHAR(30) NULL,

    skill_id INT NULL,

    question_order INT NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_test_questions_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_test_questions_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_test_questions
        PRIMARY KEY (question_id),

    CONSTRAINT CK_test_questions_correct_option
        CHECK (
            correct_option IN ('A', 'B', 'C', 'D')
        ),

    CONSTRAINT CK_test_questions_difficulty
        CHECK (
            difficulty_level IS NULL
            OR difficulty_level IN
            (
                'EASY',
                'MEDIUM',
                'HARD'
            )
        ),

    CONSTRAINT CK_test_questions_order
        CHECK (
            question_order IS NULL
            OR question_order > 0
        )
);
GO

ALTER TABLE dbo.test_questions
ADD CONSTRAINT FK_test_questions_tests
    FOREIGN KEY (test_id)
    REFERENCES dbo.tests(test_id);
GO

ALTER TABLE dbo.test_questions
ADD CONSTRAINT FK_test_questions_skills
    FOREIGN KEY (skill_id)
    REFERENCES dbo.skills(skill_id);
GO