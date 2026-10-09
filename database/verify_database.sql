EXEC(N'
USE campuslink;

PRINT ''========================================'';
PRINT ''CAMPUSLINK DATABASE VERIFICATION'';
PRINT ''========================================'';


/* 1. USERS */
PRINT ''--- USERS ---'';

SELECT
    COUNT(*) AS total_users
FROM dbo.users;


/* 2. COLLEGES */
PRINT ''--- COLLEGES ---'';

SELECT
    COUNT(*) AS total_colleges
FROM dbo.colleges;


/* 3. STUDENTS */
PRINT ''--- STUDENTS ---'';

SELECT
    COUNT(*) AS total_students
FROM dbo.students;


/* 4. STUDENT EDUCATION */
PRINT ''--- STUDENT EDUCATION ---'';

SELECT
    COUNT(*) AS total_education_records
FROM dbo.student_education;


/* 5. SKILLS */
PRINT ''--- SKILLS ---'';

SELECT
    COUNT(*) AS total_skills
FROM dbo.skills;


/* 6. STUDENT SKILLS */
PRINT ''--- STUDENT SKILLS ---'';

SELECT
    COUNT(*) AS total_student_skills
FROM dbo.student_skills;


/* 7. RECRUITERS */
PRINT ''--- RECRUITERS ---'';

SELECT
    COUNT(*) AS total_recruiters
FROM dbo.recruiters;


/* 8. COMPANIES */
PRINT ''--- COMPANIES ---'';

SELECT
    COUNT(*) AS total_companies
FROM dbo.companies;


/* 9. JOBS */
PRINT ''--- JOBS ---'';

SELECT
    COUNT(*) AS total_jobs
FROM dbo.jobs;


/* 10. APPLICATIONS */
PRINT ''--- APPLICATIONS ---'';

SELECT
    COUNT(*) AS total_applications
FROM dbo.applications;


/* 11. TESTS */
PRINT ''--- TESTS ---'';

SELECT
    COUNT(*) AS total_tests
FROM dbo.tests;


/* 12. TEST QUESTIONS */
PRINT ''--- TEST QUESTIONS ---'';

SELECT
    COUNT(*) AS total_test_questions
FROM dbo.test_questions;


/* 13. TEST ATTEMPTS */
PRINT ''--- TEST ATTEMPTS ---'';

SELECT
    COUNT(*) AS total_test_attempts
FROM dbo.test_attempts;


/* 14. INTERVIEWS */
PRINT ''--- INTERVIEWS ---'';

SELECT
    COUNT(*) AS total_interviews
FROM dbo.interviews;


/* 15. INTERVIEW QUESTIONS */
PRINT ''--- INTERVIEW QUESTIONS ---'';

SELECT
    COUNT(*) AS total_interview_questions
FROM dbo.interview_questions;


/* 16. INTERVIEW ANSWERS */
PRINT ''--- INTERVIEW ANSWERS ---'';

SELECT
    COUNT(*) AS total_interview_answers
FROM dbo.interview_answers;


/* 17. INTERVIEW EVENTS */
PRINT ''--- INTERVIEW EVENTS ---'';

SELECT
    COUNT(*) AS total_interview_events
FROM dbo.interview_events;


/* 18. PERFORMANCE */
PRINT ''--- PERFORMANCE RESULTS ---'';

SELECT
    COUNT(*) AS total_performance_results
FROM dbo.performance_results;


/* 19. FEEDBACK */
PRINT ''--- FEEDBACK ---'';

SELECT
    COUNT(*) AS total_feedback
FROM dbo.feedback;


/* ========================================
   DETAILED STUDENT VIEW
   ======================================== */

PRINT ''--- STUDENT SUMMARY ---'';

SELECT
    s.student_id,
    u.username,
    s.first_name,
    s.last_name,
    c.college_name,
    se.degree,
    se.specialization,
    se.cgpa,
    se.graduation_year
FROM dbo.students s
INNER JOIN dbo.users u
    ON u.user_id = s.user_id
INNER JOIN dbo.colleges c
    ON c.college_id = s.college_id
LEFT JOIN dbo.student_education se
    ON se.student_id = s.student_id
ORDER BY s.student_id;


/* ========================================
   JOB SUMMARY
   ======================================== */

PRINT ''--- JOB SUMMARY ---'';

SELECT
    j.job_id,
    j.job_title,
    c.company_name,
    j.minimum_cgpa,
    j.minimum_experience_years,
    j.interview_required,
    j.eligibility_cutoff,
    j.location
FROM dbo.jobs j
INNER JOIN dbo.companies c
    ON c.company_id = j.company_id
ORDER BY j.job_id;


/* ========================================
   APPLICATION SUMMARY
   ======================================== */

PRINT ''--- APPLICATION SUMMARY ---'';

SELECT
    a.application_id,
    s.first_name + '' '' + ISNULL(s.last_name, '''') AS student_name,
    j.job_title,
    a.application_status,
    a.eligibility_score,
    a.skill_match_score,
    a.job_match_score
FROM dbo.applications a
INNER JOIN dbo.students s
    ON s.student_id = a.student_id
INNER JOIN dbo.jobs j
    ON j.job_id = a.job_id
ORDER BY a.application_id;


/* ========================================
   INTERVIEW SUMMARY
   ======================================== */

PRINT ''--- INTERVIEW SUMMARY ---'';

SELECT
    i.interview_id,
    s.first_name + '' '' + ISNULL(s.last_name, '''') AS student_name,
    j.job_title,
    i.interview_type,
    i.interview_status,
    i.difficulty_level,
    i.total_questions,
    i.questions_answered,
    i.interview_score,
    i.cutoff_score
FROM dbo.interviews i
INNER JOIN dbo.students s
    ON s.student_id = i.student_id
INNER JOIN dbo.jobs j
    ON j.job_id = i.job_id
ORDER BY i.interview_id;


/* ========================================
   TEST SUMMARY
   ======================================== */

PRINT ''--- TEST SUMMARY ---'';

SELECT
    t.test_id,
    j.job_title,
    t.test_name,
    t.test_type,
    t.difficulty_level,
    t.total_questions,
    t.duration_minutes,
    t.passing_score,
    COUNT(tq.question_id) AS actual_questions
FROM dbo.tests t
INNER JOIN dbo.jobs j
    ON j.job_id = t.job_id
LEFT JOIN dbo.test_questions tq
    ON tq.test_id = t.test_id
GROUP BY
    t.test_id,
    j.job_title,
    t.test_name,
    t.test_type,
    t.difficulty_level,
    t.total_questions,
    t.duration_minutes,
    t.passing_score
ORDER BY t.test_id;


/* ========================================
   FINAL TABLE LIST
   ======================================== */

PRINT ''--- CAMPUSLINK TABLES ---'';

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = ''BASE TABLE''
ORDER BY TABLE_SCHEMA, TABLE_NAME;

');