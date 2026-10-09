EXEC(N'
USE campuslink;

-- =========================================================
-- INTERVIEW 1
-- Student 1 -> Python Developer
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.interviews
    WHERE application_id = 1
)
BEGIN
    INSERT INTO dbo.interviews
    (
        student_id,
        job_id,
        application_id,
        interviewer_user_id,
        interview_type,
        interview_status,
        difficulty_level,
        total_questions,
        questions_answered,
        interview_score,
        cutoff_score,
        started_at,
        completed_at,
        feedback_summary
    )
    VALUES
    (
        1,
        1,
        1,
        2,
        ''AI'',
        ''COMPLETED'',
        ''MEDIUM'',
        5,
        5,
        82.00,
        60.00,
        ''2026-09-20 10:00:00'',
        ''2026-09-20 10:25:00'',
        ''Good understanding of Python and programming fundamentals.''
    );
END;


-- =========================================================
-- INTERVIEW 2
-- Student 2 -> Full Stack Developer
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.interviews
    WHERE application_id = 4
)
BEGIN
    INSERT INTO dbo.interviews
    (
        student_id,
        job_id,
        application_id,
        interviewer_user_id,
        interview_type,
        interview_status,
        difficulty_level,
        total_questions,
        questions_answered,
        interview_score,
        cutoff_score,
        started_at,
        completed_at,
        feedback_summary
    )
    VALUES
    (
        2,
        2,
        4,
        6,
        ''AI'',
        ''COMPLETED'',
        ''MEDIUM'',
        5,
        5,
        88.00,
        65.00,
        ''2026-09-21 11:00:00'',
        ''2026-09-21 11:28:00'',
        ''Strong performance in JavaScript, React and web development.''
    );
END;


-- =========================================================
-- INTERVIEW 3
-- Student 2 -> Frontend Developer
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.interviews
    WHERE application_id = 5
)
BEGIN
    INSERT INTO dbo.interviews
    (
        student_id,
        job_id,
        application_id,
        interviewer_user_id,
        interview_type,
        interview_status,
        difficulty_level,
        total_questions,
        questions_answered,
        interview_score,
        cutoff_score,
        started_at,
        completed_at,
        feedback_summary
    )
    VALUES
    (
        2,
        4,
        5,
        6,
        ''AI'',
        ''COMPLETED'',
        ''EASY'',
        5,
        5,
        91.00,
        60.00,
        ''2026-09-22 14:00:00'',
        ''2026-09-22 14:20:00'',
        ''Excellent frontend development knowledge and communication.''
    );
END;


-- =========================================================
-- VERIFY INTERVIEWS
-- =========================================================

SELECT
    interview_id,
    student_id,
    job_id,
    application_id,
    interviewer_user_id,
    interview_type,
    interview_status,
    difficulty_level,
    total_questions,
    questions_answered,
    interview_score,
    cutoff_score,
    started_at,
    completed_at,
    feedback_summary,
    created_at,
    updated_at
FROM dbo.interviews
ORDER BY interview_id;
');