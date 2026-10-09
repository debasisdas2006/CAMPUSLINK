EXEC(N'
USE campuslink;

DECLARE @rahul_id INT;
DECLARE @priya_id INT;

SELECT @rahul_id = student_id
FROM dbo.students
WHERE user_id = 4;

SELECT @priya_id = student_id
FROM dbo.students
WHERE user_id = 5;


-- =========================================================
-- RAHUL KUMAR SKILLS
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @rahul_id
      AND s.skill_name = ''Python''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @rahul_id,
        skill_id,
        ''ADVANCED'',
        2,
        1
    FROM dbo.skills
    WHERE skill_name = ''Python''
      AND skill_type = ''PROGRAMMING_LANGUAGE'';
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @rahul_id
      AND s.skill_name = ''Java''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @rahul_id,
        skill_id,
        ''INTERMEDIATE'',
        1,
        0
    FROM dbo.skills
    WHERE skill_name = ''Java''
      AND skill_type = ''PROGRAMMING_LANGUAGE'';
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @rahul_id
      AND s.skill_name = ''React''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @rahul_id,
        skill_id,
        ''INTERMEDIATE'',
        1,
        0
    FROM dbo.skills
    WHERE skill_name = ''React''
      AND skill_type = ''TECHNICAL_SKILL'';
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @rahul_id
      AND s.skill_name = ''Machine Learning''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @rahul_id,
        skill_id,
        ''INTERMEDIATE'',
        1,
        0
    FROM dbo.skills
    WHERE skill_name = ''Machine Learning''
      AND skill_type = ''TECHNICAL_SKILL'';
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @rahul_id
      AND s.skill_name = ''Git''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @rahul_id,
        skill_id,
        ''INTERMEDIATE'',
        2,
        0
    FROM dbo.skills
    WHERE skill_name = ''Git''
      AND skill_type = ''TOOL'';
END;


-- =========================================================
-- PRIYA DAS SKILLS
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @priya_id
      AND s.skill_name = ''Python''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @priya_id,
        skill_id,
        ''ADVANCED'',
        2,
        1
    FROM dbo.skills
    WHERE skill_name = ''Python''
      AND skill_type = ''PROGRAMMING_LANGUAGE'';
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @priya_id
      AND s.skill_name = ''JavaScript''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @priya_id,
        skill_id,
        ''ADVANCED'',
        2,
        1
    FROM dbo.skills
    WHERE skill_name = ''JavaScript''
      AND skill_type = ''PROGRAMMING_LANGUAGE'';
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @priya_id
      AND s.skill_name = ''React''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @priya_id,
        skill_id,
        ''ADVANCED'',
        2,
        0
    FROM dbo.skills
    WHERE skill_name = ''React''
      AND skill_type = ''TECHNICAL_SKILL'';
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @priya_id
      AND s.skill_name = ''Node.js''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @priya_id,
        skill_id,
        ''INTERMEDIATE'',
        1,
        0
    FROM dbo.skills
    WHERE skill_name = ''Node.js''
      AND skill_type = ''TECHNICAL_SKILL'';
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_skills ss
    INNER JOIN dbo.skills s
        ON ss.skill_id = s.skill_id
    WHERE ss.student_id = @priya_id
      AND s.skill_name = ''GitHub''
)
BEGIN
    INSERT INTO dbo.student_skills
    (
        student_id,
        skill_id,
        proficiency_level,
        years_of_experience,
        is_primary
    )
    SELECT
        @priya_id,
        skill_id,
        ''INTERMEDIATE'',
        2,
        0
    FROM dbo.skills
    WHERE skill_name = ''GitHub''
      AND skill_type = ''TOOL'';
END;


-- =========================================================
-- VERIFY
-- =========================================================

SELECT
    ss.student_skill_id,
    ss.student_id,
    s.skill_name,
    s.skill_type,
    ss.proficiency_level,
    ss.years_of_experience,
    ss.is_primary
FROM dbo.student_skills ss
INNER JOIN dbo.skills s
    ON ss.skill_id = s.skill_id
ORDER BY ss.student_id, s.skill_type, s.skill_name;
');