USE campuslink;
GO

IF OBJECT_ID('dbo.skills', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.skills
    (
        skill_id INT IDENTITY(1,1) NOT NULL,
        skill_name NVARCHAR(150) NOT NULL,
        skill_type NVARCHAR(50) NOT NULL,
        description NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT PK_skills
            PRIMARY KEY (skill_id),

        CONSTRAINT UQ_skills_name_type
            UNIQUE (skill_name, skill_type),

        CONSTRAINT CK_skills_type
            CHECK
            (
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
END;
GO


/* =========================================================
   PROGRAMMING LANGUAGES
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Python')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Python', 'PROGRAMMING_LANGUAGE', 'Python programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Java')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Java', 'PROGRAMMING_LANGUAGE', 'Java programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'JavaScript')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('JavaScript', 'PROGRAMMING_LANGUAGE', 'JavaScript programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'TypeScript')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('TypeScript', 'PROGRAMMING_LANGUAGE', 'TypeScript programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'C')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('C', 'PROGRAMMING_LANGUAGE', 'C programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'C++')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('C++', 'PROGRAMMING_LANGUAGE', 'C++ programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'C#')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('C#', 'PROGRAMMING_LANGUAGE', 'C# programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Go')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Go', 'PROGRAMMING_LANGUAGE', 'Go programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Rust')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Rust', 'PROGRAMMING_LANGUAGE', 'Rust programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'PHP')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('PHP', 'PROGRAMMING_LANGUAGE', 'PHP programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Ruby')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Ruby', 'PROGRAMMING_LANGUAGE', 'Ruby programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Kotlin')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Kotlin', 'PROGRAMMING_LANGUAGE', 'Kotlin programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Swift')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Swift', 'PROGRAMMING_LANGUAGE', 'Swift programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Dart')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Dart', 'PROGRAMMING_LANGUAGE', 'Dart programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'R')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('R', 'PROGRAMMING_LANGUAGE', 'R programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'MATLAB')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('MATLAB', 'PROGRAMMING_LANGUAGE', 'MATLAB programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Scala')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Scala', 'PROGRAMMING_LANGUAGE', 'Scala programming language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'SQL')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('SQL', 'PROGRAMMING_LANGUAGE', 'Structured Query Language');
GO


/* =========================================================
   TECHNICAL SKILLS
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'React')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('React', 'TECHNICAL_SKILL', 'React frontend library');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Node.js')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Node.js', 'TECHNICAL_SKILL', 'Node.js backend runtime');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Express.js')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Express.js', 'TECHNICAL_SKILL', 'Express.js backend framework');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'FastAPI')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('FastAPI', 'TECHNICAL_SKILL', 'FastAPI backend framework');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Microsoft SQL Server')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Microsoft SQL Server', 'TECHNICAL_SKILL', 'Microsoft SQL Server database');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'MongoDB')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('MongoDB', 'TECHNICAL_SKILL', 'MongoDB database');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Machine Learning')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Machine Learning', 'TECHNICAL_SKILL', 'Machine learning');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Deep Learning')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Deep Learning', 'TECHNICAL_SKILL', 'Deep learning');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Natural Language Processing')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Natural Language Processing', 'TECHNICAL_SKILL', 'Natural language processing');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Artificial Intelligence')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Artificial Intelligence', 'TECHNICAL_SKILL', 'Artificial intelligence');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'HTML')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('HTML', 'TECHNICAL_SKILL', 'HyperText Markup Language');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'CSS')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('CSS', 'TECHNICAL_SKILL', 'Cascading Style Sheets');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Tailwind CSS')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Tailwind CSS', 'TECHNICAL_SKILL', 'Tailwind CSS framework');
GO


/* =========================================================
   TOOLS
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Git')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Git', 'TOOL', 'Git version control');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'GitHub')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('GitHub', 'TOOL', 'GitHub source control platform');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Docker')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Docker', 'TOOL', 'Docker containerization');
GO


/* =========================================================
   SOFT SKILLS
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Communication')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Communication', 'SOFT_SKILL', 'Communication skill');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Problem Solving')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Problem Solving', 'SOFT_SKILL', 'Problem solving skill');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Teamwork')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Teamwork', 'SOFT_SKILL', 'Team collaboration skill');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE skill_name = 'Leadership')
INSERT INTO dbo.skills (skill_name, skill_type, description)
VALUES ('Leadership', 'SOFT_SKILL', 'Leadership skill');
GO


/* =========================================================
   FINAL CHECK
   ========================================================= */

SELECT
    skill_id,
    skill_name,
    skill_type,
    description
FROM dbo.skills
ORDER BY skill_type, skill_name;
GO

SELECT COUNT(*) AS TotalSkills
FROM dbo.skills;
GO

SELECT COUNT(*) AS ProgrammingLanguages
FROM dbo.skills
WHERE skill_type = 'PROGRAMMING_LANGUAGE';
GO

SELECT COUNT(*) AS TechnicalSkills
FROM dbo.skills
WHERE skill_type = 'TECHNICAL_SKILL';
GO

SELECT COUNT(*) AS Tools
FROM dbo.skills
WHERE skill_type = 'TOOL';
GO

SELECT COUNT(*) AS SoftSkills
FROM dbo.skills
WHERE skill_type = 'SOFT_SKILL';
GO