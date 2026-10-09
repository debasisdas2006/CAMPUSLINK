EXEC(N'
USE campuslink;

DECLARE @student1 INT;
DECLARE @student2 INT;

DECLARE @application1 INT;
DECLARE @application4 INT;
DECLARE @application5 INT;

DECLARE @interview4 INT;
DECLARE @interview5 INT;
DECLARE @interview6 INT;

DECLARE @performance1 INT;
DECLARE @performance2 INT;


-- Get student IDs
SELECT @student1 = s.student_id
FROM dbo.students s
INNER JOIN dbo.users u
    ON u.user_id = s.user_id
WHERE u.user_id = 4;

SELECT @student2 = s.student_id
FROM dbo.students s
INNER JOIN dbo.users u
    ON u.user_id = s.user_id
WHERE u.user_id = 5;


-- Get application IDs
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


-- Get actual interview IDs
SELECT @interview4 = interview_id
FROM dbo.interviews
WHERE application_id = @application1;

SELECT @interview5 = interview_id
FROM dbo.interviews
WHERE application_id = @application4;

SELECT @interview6 = interview_id
FROM dbo.interviews
WHERE application_id = @application5;


-- Get performance result IDs
SELECT TOP 1
    @performance1 = performance_id
FROM dbo.performance_results
WHERE student_id = @student1
ORDER BY performance_id;

SELECT TOP 1
    @performance2 = performance_id
FROM dbo.performance_results
WHERE student_id = @student2
ORDER BY performance_id;


-- Student 1: interview feedback
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.feedback
    WHERE student_id = @student1
      AND interview_id = @interview4
      AND feedback_type = ''INTERVIEW''
)
BEGIN
    INSERT INTO dbo.feedback
    (
        student_id,
        application_id,
        interview_id,
        performance_id,
        feedback_type,
        overall_rating,
        strengths,
        weaknesses
    )
    VALUES
    (
        @student1,
        @application1,
        @interview4,
        @performance1,
        ''INTERVIEW'',
        4.20,
        ''Good Python fundamentals, problem-solving ability, and technical understanding.'',
        ''Needs improvement in communication clarity and advanced technical depth.''
    );
END;


-- Student 2: interview feedback for Full Stack Developer
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.feedback
    WHERE student_id = @student2
      AND interview_id = @interview5
      AND feedback_type = ''INTERVIEW''
)
BEGIN
    INSERT INTO dbo.feedback
    (
        student_id,
        application_id,
        interview_id,
        performance_id,
        feedback_type,
        overall_rating,
        strengths,
        weaknesses
    )
    VALUES
    (
        @student2,
        @application4,
        @interview5,
        @performance2,
        ''INTERVIEW'',
        4.40,
        ''Strong JavaScript, React, Node.js, and GitHub knowledge with good communication.'',
        ''Advanced system design and deeper backend concepts can be improved.''
    );
END;


-- Student 2: interview feedback for Frontend Developer
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.feedback
    WHERE student_id = @student2
      AND interview_id = @interview6
      AND feedback_type = ''INTERVIEW''
)
BEGIN
    INSERT INTO dbo.feedback
    (
        student_id,
        application_id,
        interview_id,
        performance_id,
        feedback_type,
        overall_rating,
        strengths,
        weaknesses
    )
    VALUES
    (
        @student2,
        @application5,
        @interview6,
        @performance2,
        ''INTERVIEW'',
        4.55,
        ''Strong frontend fundamentals, React knowledge, and technical communication.'',
        ''Can improve advanced frontend architecture and optimization concepts.''
    );
END;


-- Student 1: overall performance feedback
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.feedback
    WHERE student_id = @student1
      AND performance_id = @performance1
      AND feedback_type = ''PERFORMANCE''
)
BEGIN
    INSERT INTO dbo.feedback
    (
        student_id,
        application_id,
        interview_id,
        performance_id,
        feedback_type,
        overall_rating,
        strengths,
        weaknesses
    )
    VALUES
    (
        @student1,
        @application1,
        @interview4,
        @performance1,
        ''PERFORMANCE'',
        4.30,
        ''Good overall eligibility, Python skills, interview performance, and job matching.'',
        ''Communication and advanced technical depth should be strengthened.''
    );
END;


-- Student 2: overall performance feedback
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.feedback
    WHERE student_id = @student2
      AND performance_id = @performance2
      AND feedback_type = ''PERFORMANCE''
)
BEGIN
    INSERT INTO dbo.feedback
    (
        student_id,
        application_id,
        interview_id,
        performance_id,
        feedback_type,
        overall_rating,
        strengths,
        weaknesses
    )
    VALUES
    (
        @student2,
        @application4,
        @interview5,
        @performance2,
        ''PERFORMANCE'',
        4.60,
        ''Excellent technical performance, strong communication, eligibility, and job matching.'',
        ''Advanced technical depth can be improved further.''
    );
END;


-- Verification
SELECT
    feedback_id,
    student_id,
    application_id,
    interview_id,
    performance_id,
    feedback_type,
    overall_rating,
    strengths,
    weaknesses
FROM dbo.feedback
ORDER BY feedback_id;

');