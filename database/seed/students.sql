EXEC(N'
USE campuslink;

DECLARE @college_id INT;

SELECT @college_id = college_id
FROM dbo.colleges
WHERE college_code = ''CL001'';

IF @college_id IS NULL
BEGIN
    PRINT ''ERROR: College CL001 was not found.'';
    RETURN;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.students
    WHERE user_id = 4
)
BEGIN
    INSERT INTO dbo.students
    (
        user_id,
        college_id,
        first_name,
        last_name,
        phone,
        date_of_birth,
        gender,
        profile_summary,
        total_experience_years
    )
    VALUES
    (
        4,
        @college_id,
        ''Rahul'',
        ''Kumar'',
        ''9876543210'',
        ''2003-05-15'',
        ''Male'',
        ''Computer Science student interested in software development and AI/ML.'',
        0
    );
END;

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.students
    WHERE user_id = 5
)
BEGIN
    INSERT INTO dbo.students
    (
        user_id,
        college_id,
        first_name,
        last_name,
        phone,
        date_of_birth,
        gender,
        profile_summary,
        total_experience_years
    )
    VALUES
    (
        5,
        @college_id,
        ''Priya'',
        ''Das'',
        ''9876543211'',
        ''2003-08-20'',
        ''Female'',
        ''Computer Science student interested in web development and machine learning.'',
        0
    );
END;

SELECT
    student_id,
    user_id,
    college_id,
    first_name,
    last_name,
    phone,
    date_of_birth,
    gender,
    profile_summary,
    total_experience_years,
    created_at,
    updated_at
FROM dbo.students
ORDER BY student_id;
');