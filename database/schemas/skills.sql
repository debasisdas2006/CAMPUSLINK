USE [campuslink];
GO

CREATE TABLE dbo.skills
(
    skill_id INT IDENTITY(1,1) NOT NULL,

    skill_name NVARCHAR(150) NOT NULL,

    skill_type NVARCHAR(50) NOT NULL,

    description NVARCHAR(500) NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_skills_created_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_skills
        PRIMARY KEY (skill_id),

    CONSTRAINT UQ_skills_name_type
        UNIQUE (skill_name, skill_type),

    CONSTRAINT CK_skills_type
        CHECK (
            skill_type IN
            (
                'PROGRAMMING_LANGUAGE',
                'TECHNICAL_SKILL',
                'SOFT_SKILL',
                'TOOL',
                'OTHER'
            )
        )
);
GO