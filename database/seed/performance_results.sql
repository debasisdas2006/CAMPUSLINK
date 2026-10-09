EXEC(N'
USE campuslink;

DECLARE @student1 INT;
DECLARE @student2 INT;

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


-- Student 1 performance
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.performance_results
    WHERE student_id = @student1
)
BEGIN
    INSERT INTO dbo.performance_results
    (
        student_id,
        correctness_score,
        communication_score,
        interview_score,
        test_score,
        eligibility_score,
        job_match_score,
        overall_score,
        performance_level,
        strengths,
        weaknesses,
        recommendations
    )
    VALUES
    (
        @student1,
        88.00,
        84.00,
        82.00,
        86.00,
        95.00,
        90.00,
        87.50,
        ''GOOD'',
        ''Strong Python knowledge, good technical understanding, and strong eligibility profile.'',
        ''Communication and explanation depth can be improved.'',
        ''Practice technical interview questions and improve concise technical communication.''
    );
END;


-- Student 2 performance
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.performance_results
    WHERE student_id = @student2
)
BEGIN
    INSERT INTO dbo.performance_results
    (
        student_id,
        correctness_score,
        communication_score,
        interview_score,
        test_score,
        eligibility_score,
        job_match_score,
        overall_score,
        performance_level,
        strengths,
        weaknesses,
        recommendations
    )
    VALUES
    (
        @student2,
        93.00,
        91.00,
        88.00,
        92.00,
        95.00,
        94.00,
        92.17,
        ''EXCELLENT'',
        ''Strong technical performance, communication, eligibility, and job matching.'',
        ''Can further improve advanced technical depth.'',
        ''Continue advanced technical practice and participate in challenging interview scenarios.''
    );
END;


-- Verify inserted records
SELECT
    student_id,
    correctness_score,
    communication_score,
    interview_score,
    test_score,
    eligibility_score,
    job_match_score,
    overall_score,
    performance_level,
    strengths,
    weaknesses,
    recommendations
FROM dbo.performance_results
WHERE student_id IN (@student1, @student2)
ORDER BY student_id;

');