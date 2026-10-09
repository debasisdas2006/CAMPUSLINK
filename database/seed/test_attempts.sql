EXEC(N'
USE campuslink;

DECLARE @student1 INT;
DECLARE @student2 INT;

DECLARE @test1 INT;
DECLARE @test2 INT;
DECLARE @test3 INT;
DECLARE @test4 INT;

DECLARE @application1 INT;
DECLARE @application4 INT;
DECLARE @application5 INT;


-- Get actual student IDs
SELECT @student1 = student_id
FROM dbo.students
WHERE user_id = 4;

SELECT @student2 = student_id
FROM dbo.students
WHERE user_id = 5;


-- Get actual test IDs
SELECT @test1 = test_id
FROM dbo.tests
WHERE job_id = 1
  AND test_name = ''Python Developer Assessment'';

SELECT @test2 = test_id
FROM dbo.tests
WHERE job_id = 2
  AND test_name = ''Full Stack Developer Assessment'';

SELECT @test3 = test_id
FROM dbo.tests
WHERE job_id = 3
  AND test_name = ''Machine Learning Engineer Assessment'';

SELECT @test4 = test_id
FROM dbo.tests
WHERE job_id = 4
  AND test_name = ''Frontend Developer Assessment'';


-- Get actual application IDs
SELECT @application1 = application_id
FROM dbo.applications
WHERE student_id = @student1
  AND job_id = 1;

SELECT @application4 = application_id
FROM dbo.applications
WHERE student_id = @student2
  AND job_id = 2;

SELECT @application5 = application_id
FROM dbo.applications
WHERE student_id = @student2
  AND job_id = 4;


---------------------------------------------------------
-- Student 1 - Python Developer
---------------------------------------------------------

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.test_attempts
    WHERE test_id = @test1
      AND student_id = @student1
)
BEGIN
    INSERT INTO dbo.test_attempts
    (
        test_id,
        student_id,
        application_id,
        started_at,
        completed_at,
        total_questions,
        correct_answers,
        score
    )
    VALUES
    (
        @test1,
        @student1,
        @application1,
        ''2026-09-18 10:00:00'',
        ''2026-09-18 10:28:00'',
        20,
        17,
        85.00
    );
END;


---------------------------------------------------------
-- Student 2 - Full Stack Developer
---------------------------------------------------------

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.test_attempts
    WHERE test_id = @test2
      AND student_id = @student2
)
BEGIN
    INSERT INTO dbo.test_attempts
    (
        test_id,
        student_id,
        application_id,
        started_at,
        completed_at,
        total_questions,
        correct_answers,
        score
    )
    VALUES
    (
        @test2,
        @student2,
        @application4,
        ''2026-09-19 11:00:00'',
        ''2026-09-19 11:27:00'',
        20,
        19,
        95.00
    );
END;


---------------------------------------------------------
-- Student 2 - Frontend Developer
---------------------------------------------------------

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.test_attempts
    WHERE test_id = @test4
      AND student_id = @student2
)
BEGIN
    INSERT INTO dbo.test_attempts
    (
        test_id,
        student_id,
        application_id,
        started_at,
        completed_at,
        total_questions,
        correct_answers,
        score
    )
    VALUES
    (
        @test4,
        @student2,
        @application5,
        ''2026-09-20 14:00:00'',
        ''2026-09-20 14:25:00'',
        20,
        18,
        90.00
    );
END;


---------------------------------------------------------
-- Student 1 - Machine Learning Engineer
---------------------------------------------------------

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.test_attempts
    WHERE test_id = @test3
      AND student_id = @student1
)
BEGIN
    INSERT INTO dbo.test_attempts
    (
        test_id,
        student_id,
        application_id,
        started_at,
        completed_at,
        total_questions,
        correct_answers,
        score
    )
    VALUES
    (
        @test3,
        @student1,
        NULL,
        ''2026-09-21 15:00:00'',
        ''2026-09-21 15:38:00'',
        25,
        20,
        80.00
    );
END;


---------------------------------------------------------
-- Verification
---------------------------------------------------------

SELECT
    ta.attempt_id,
    ta.test_id,
    t.test_name,
    ta.student_id,
    ta.application_id,
    ta.started_at,
    ta.completed_at,
    ta.total_questions,
    ta.correct_answers,
    ta.score
FROM dbo.test_attempts ta
INNER JOIN dbo.tests t
    ON t.test_id = ta.test_id
ORDER BY ta.attempt_id;

');