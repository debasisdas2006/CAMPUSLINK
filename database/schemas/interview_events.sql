USE [campuslink];
GO

IF OBJECT_ID(N'dbo.interview_events', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.interview_events;
END;
GO

CREATE TABLE dbo.interview_events
(
    event_id INT IDENTITY(1,1) NOT NULL,

    interview_id INT NOT NULL,

    interview_question_id INT NULL,

    event_type NVARCHAR(50) NOT NULL,

    event_data NVARCHAR(MAX) NULL,

    difficulty_level NVARCHAR(30) NULL,

    event_timestamp DATETIME2 NOT NULL
        CONSTRAINT DF_interview_events_timestamp
        DEFAULT (SYSDATETIME()),

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_interview_events_created_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_interview_events
        PRIMARY KEY (event_id),

    CONSTRAINT CK_interview_events_type
        CHECK (
            event_type IN
            (
                'INTERVIEW_STARTED',
                'QUESTION_ASKED',
                'ANSWER_SUBMITTED',
                'ANSWER_EVALUATED',
                'DIFFICULTY_CHANGED',
                'QUESTION_SKIPPED',
                'INTERVIEW_PAUSED',
                'INTERVIEW_RESUMED',
                'INTERVIEW_COMPLETED',
                'INTERVIEW_CANCELLED'
            )
        ),

    CONSTRAINT CK_interview_events_difficulty
        CHECK (
            difficulty_level IS NULL
            OR difficulty_level IN
            (
                'EASY',
                'MEDIUM',
                'HARD'
            )
        )
);
GO

ALTER TABLE dbo.interview_events
ADD CONSTRAINT FK_interview_events_interviews
    FOREIGN KEY (interview_id)
    REFERENCES dbo.interviews(interview_id);
GO

ALTER TABLE dbo.interview_events
ADD CONSTRAINT FK_interview_events_questions
    FOREIGN KEY (interview_question_id)
    REFERENCES dbo.interview_questions(interview_question_id);
GO