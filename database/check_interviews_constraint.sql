EXEC(N'
USE campuslink;

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
    cutoff_score
FROM dbo.interviews
ORDER BY interview_id;
');