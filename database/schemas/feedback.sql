USE [campuslink];
GO

IF OBJECT_ID(N'dbo.feedback', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.feedback;
END;
GO

CREATE TABLE dbo.feedback
(
    feedback_id INT IDENTITY(1,1) NOT NULL,

    student_id INT NOT NULL,

    application_id INT NULL,

    interview_id INT NULL,

    performance_id INT NULL,

    feedback_type NVARCHAR(50) NOT NULL,

    overall_rating DECIMAL(5,2) NULL,

    strengths NVARCHAR(MAX) NULL,

    weaknesses NVARCHAR(MAX) NULL,

    technical_feedback NVARCHAR(MAX) NULL,

    communication_feedback NVARCHAR(MAX) NULL,

    improvement_suggestions NVARCHAR(MAX) NULL,

    ai_generated BIT NOT NULL
        CONSTRAINT DF_feedback_ai_generated
        DEFAULT (1),

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_feedback_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_feedback_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_feedback
        PRIMARY KEY (feedback_id),

    CONSTRAINT CK_feedback_type
        CHECK (
            feedback_type IN
            (
                'INTERVIEW',
                'TEST',
                'PERFORMANCE',
                'JOB_MATCH',
                'GENERAL'
            )
        ),

    CONSTRAINT CK_feedback_rating
        CHECK (
            overall_rating IS NULL
            OR overall_rating BETWEEN 0 AND 100
        )
);
GO

ALTER TABLE dbo.feedback
ADD CONSTRAINT FK_feedback_students
    FOREIGN KEY (student_id)
    REFERENCES dbo.students(student_id);
GO

ALTER TABLE dbo.feedback
ADD CONSTRAINT FK_feedback_applications
    FOREIGN KEY (application_id)
    REFERENCES dbo.applications(application_id);
GO

ALTER TABLE dbo.feedback
ADD CONSTRAINT FK_feedback_interviews
    FOREIGN KEY (interview_id)
    REFERENCES dbo.interviews(interview_id);
GO

ALTER TABLE dbo.feedback
ADD CONSTRAINT FK_feedback_performance
    FOREIGN KEY (performance_id)
    REFERENCES dbo.performance_results(performance_id);
GO