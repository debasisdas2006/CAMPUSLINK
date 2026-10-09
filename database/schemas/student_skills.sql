USE campuslink;
GO

IF OBJECT_ID('dbo.student_skills', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.student_skills
    (
        student_skill_id INT IDENTITY(1,1) NOT NULL,

        student_id INT NOT NULL,

        skill_id INT NOT NULL,

        proficiency_level NVARCHAR(30) NULL,

        years_of_experience DECIMAL(4,2) NULL,

        is_primary BIT NOT NULL
            CONSTRAINT DF_student_skills_is_primary
            DEFAULT (0),

        created_at DATETIME2 NOT NULL
            CONSTRAINT DF_student_skills_created_at
            DEFAULT (SYSDATETIME()),

        updated_at DATETIME2 NOT NULL
            CONSTRAINT DF_student_skills_updated_at
            DEFAULT (SYSDATETIME()),

        CONSTRAINT PK_student_skills
            PRIMARY KEY (student_skill_id),

        CONSTRAINT UQ_student_skills_student_skill
            UNIQUE (student_id, skill_id),

        CONSTRAINT CK_student_skills_experience
            CHECK
            (
                years_of_experience IS NULL
                OR years_of_experience >= 0
            ),

        CONSTRAINT CK_student_skills_proficiency
            CHECK
            (
                proficiency_level IS NULL
                OR proficiency_level IN
                (
                    'BEGINNER',
                    'INTERMEDIATE',
                    'ADVANCED',
                    'EXPERT'
                )
            )
    );
END;
GO