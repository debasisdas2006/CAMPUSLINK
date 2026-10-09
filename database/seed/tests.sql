EXEC(N'
USE campuslink;

-- Python Developer test
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.tests
    WHERE job_id = 1
      AND test_name = ''Python Developer Assessment''
)
BEGIN
    INSERT INTO dbo.tests
    (
        job_id,
        test_name,
        test_type,
        description,
        difficulty_level,
        total_questions,
        duration_minutes,
        passing_score
    )
    VALUES
    (
        1,
        ''Python Developer Assessment'',
        ''TECHNICAL'',
        ''Technical assessment covering Python, SQL, Machine Learning, FastAPI, and Git fundamentals.'',
        ''MEDIUM'',
        20,
        30,
        60.00
    );
END;


-- Full Stack Developer test
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.tests
    WHERE job_id = 2
      AND test_name = ''Full Stack Developer Assessment''
)
BEGIN
    INSERT INTO dbo.tests
    (
        job_id,
        test_name,
        test_type,
        description,
        difficulty_level,
        total_questions,
        duration_minutes,
        passing_score
    )
    VALUES
    (
        2,
        ''Full Stack Developer Assessment'',
        ''TECHNICAL'',
        ''Technical assessment covering JavaScript, React, Node.js, GitHub, and SQL fundamentals.'',
        ''MEDIUM'',
        20,
        30,
        60.00
    );
END;


-- Machine Learning Engineer test
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.tests
    WHERE job_id = 3
      AND test_name = ''Machine Learning Engineer Assessment''
)
BEGIN
    INSERT INTO dbo.tests
    (
        job_id,
        test_name,
        test_type,
        description,
        difficulty_level,
        total_questions,
        duration_minutes,
        passing_score
    )
    VALUES
    (
        3,
        ''Machine Learning Engineer Assessment'',
        ''TECHNICAL'',
        ''Technical assessment covering Python, Machine Learning, Deep Learning, Artificial Intelligence, SQL, and Git.'',
        ''HARD'',
        25,
        40,
        65.00
    );
END;


-- Frontend Developer test
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.tests
    WHERE job_id = 4
      AND test_name = ''Frontend Developer Assessment''
)
BEGIN
    INSERT INTO dbo.tests
    (
        job_id,
        test_name,
        test_type,
        description,
        difficulty_level,
        total_questions,
        duration_minutes,
        passing_score
    )
    VALUES
    (
        4,
        ''Frontend Developer Assessment'',
        ''TECHNICAL'',
        ''Technical assessment covering JavaScript, TypeScript, React, HTML, CSS, Tailwind CSS, and GitHub.'',
        ''MEDIUM'',
        20,
        30,
        60.00
    );
END;


-- Verification
SELECT
    test_id,
    job_id,
    test_name,
    test_type,
    description,
    difficulty_level,
    total_questions,
    duration_minutes,
    passing_score
FROM dbo.tests
ORDER BY test_id;

');