EXEC(N'
USE campuslink;

-- =========================================================
-- STUDENT 1 APPLICATIONS
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.applications
    WHERE student_id = 1
      AND job_id = 1
)
BEGIN
    INSERT INTO dbo.applications
    (
        student_id,
        job_id,
        application_status,
        eligibility_score,
        skill_match_score,
        job_match_score
    )
    VALUES
    (
        1,
        1,
        ''ELIGIBLE'',
        95.00,
        85.00,
        90.00
    );
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.applications
    WHERE student_id = 1
      AND job_id = 2
)
BEGIN
    INSERT INTO dbo.applications
    (
        student_id,
        job_id,
        application_status,
        eligibility_score,
        skill_match_score,
        job_match_score
    )
    VALUES
    (
        1,
        2,
        ''ELIGIBLE'',
        90.00,
        45.00,
        67.50
    );
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.applications
    WHERE student_id = 1
      AND job_id = 3
)
BEGIN
    INSERT INTO dbo.applications
    (
        student_id,
        job_id,
        application_status,
        eligibility_score,
        skill_match_score,
        job_match_score
    )
    VALUES
    (
        1,
        3,
        ''ELIGIBLE'',
        90.00,
        75.00,
        82.50
    );
END;


-- =========================================================
-- STUDENT 2 APPLICATIONS
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.applications
    WHERE student_id = 2
      AND job_id = 2
)
BEGIN
    INSERT INTO dbo.applications
    (
        student_id,
        job_id,
        application_status,
        eligibility_score,
        skill_match_score,
        job_match_score
    )
    VALUES
    (
        2,
        2,
        ''ELIGIBLE'',
        95.00,
        90.00,
        92.50
    );
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.applications
    WHERE student_id = 2
      AND job_id = 4
)
BEGIN
    INSERT INTO dbo.applications
    (
        student_id,
        job_id,
        application_status,
        eligibility_score,
        skill_match_score,
        job_match_score
    )
    VALUES
    (
        2,
        4,
        ''ELIGIBLE'',
        95.00,
        95.00,
        95.00
    );
END;


IF NOT EXISTS
(
    SELECT 1
    FROM dbo.applications
    WHERE student_id = 2
      AND job_id = 3
)
BEGIN
    INSERT INTO dbo.applications
    (
        student_id,
        job_id,
        application_status,
        eligibility_score,
        skill_match_score,
        job_match_score
    )
    VALUES
    (
        2,
        3,
        ''ELIGIBLE'',
        95.00,
        50.00,
        72.50
    );
END;


-- =========================================================
-- VERIFY APPLICATIONS
-- =========================================================

SELECT
    application_id,
    student_id,
    job_id,
    application_status,
    eligibility_score,
    skill_match_score,
    job_match_score,
    applied_at,
    updated_at
FROM dbo.applications
ORDER BY application_id;
');