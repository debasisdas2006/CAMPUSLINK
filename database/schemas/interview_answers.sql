USE [campuslink];
GO

IF OBJECT_ID(N'dbo.interview_answers', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.interview_answers;
END;
GO

CREATE TABLE dbo.interview_answers
(
    answer_id INT IDENTITY(1,1) NOT NULL,

    interview_question_id INT NOT NULL,

    student_id INT NOT NULL,

    answer_text NVARCHAR(MAX) NULL,

    answer_type NVARCHAR(30) NOT NULL
        CONSTRAINT DF_interview_answers_type
        DEFAULT ('TEXT'),

    answer_score DECIMAL(5,2) NULL,

    technical_score DECIMAL(5,2) NULL,

    correctness_score DECIMAL(5,2) NULL,

    relevance_score DECIMAL(5,2) NULL,

    communication_score DECIMAL(5,2) NULL,

    ai_feedback NVARCHAR(MAX) NULL,

    evaluation_status NVARCHAR(30) NOT NULL
        CONSTRAINT DF_interview_answers_evaluation_status
        DEFAULT ('PENDING'),

    answered_at DATETIME2 NULL,

    evaluated_at DATETIME2 NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_interview_answers_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_interview_answers_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_interview_answers
        PRIMARY KEY (answer_id),

    CONSTRAINT UQ_interview_answers_question_student
        UNIQUE (interview_question_id, student_id),

    CONSTRAINT CK_interview_answers_type
        CHECK (
            answer_type IN
            (
                'TEXT',
                'CODE',
                'AUDIO',
                'VIDEO'
            )
        ),

    CONSTRAINT CK_interview_answers_score
        CHECK (
            answer_score IS NULL
            OR answer_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_interview_answers_technical_score
        CHECK (
            technical_score IS NULL
            OR technical_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_interview_answers_correctness_score
        CHECK (
            correctness_score IS NULL
            OR correctness_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_interview_answers_relevance_score
        CHECK (
            relevance_score IS NULL
            OR relevance_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_interview_answers_communication_score
        CHECK (
            communication_score IS NULL
            OR communication_score BETWEEN 0 AND 100
        ),

    CONSTRAINT CK_interview_answers_evaluation_status
        CHECK (
            evaluation_status IN
            (
                'PENDING',
                'EVALUATED',
                'FAILED'
            )
        ),

    CONSTRAINT CK_interview_answers_evaluated_time
        CHECK (
            evaluated_at IS NULL
            OR answered_at IS NULL
            OR evaluated_at >= answered_at
        )
);
GO

ALTER TABLE dbo.interview_answers
ADD CONSTRAINT FK_interview_answers_questions
    FOREIGN KEY (interview_question_id)
    REFERENCES dbo.interview_questions(interview_question_id);
GO

ALTER TABLE dbo.interview_answers
ADD CONSTRAINT FK_interview_answers_students
    FOREIGN KEY (student_id)
    REFERENCES dbo.students(student_id);
GO