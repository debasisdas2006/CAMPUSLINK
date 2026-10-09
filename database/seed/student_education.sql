EXEC(N'
USE campuslink;

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_education
    WHERE student_id =
    (
        SELECT student_id
        FROM dbo.students
        WHERE user_id = 4
    )
)
BEGIN
    INSERT INTO dbo.student_education
    (
        student_id,
        education_level,
        degree,
        specialization,
        institution_name,
        university_name,
        cgpa,
        maximum_cgpa,
        graduation_year,
        start_year,
        end_year
    )
    VALUES
    (
        (SELECT student_id FROM dbo.students WHERE user_id = 4),
        ''UNDERGRADUATE'',
        ''B.Tech'',
        ''Computer Science and Engineering'',
        ''CampusLink Demo College'',
        ''BPUT'',
        8.50,
        10.00,
        2027,
        2023,
        2027
    );
END;

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.student_education
    WHERE student_id =
    (
        SELECT student_id
        FROM dbo.students
        WHERE user_id = 5
    )
)
BEGIN
    INSERT INTO dbo.student_education
    (
        student_id,
        education_level,
        degree,
        specialization,
        institution_name,
        university_name,
        cgpa,
        maximum_cgpa,
        graduation_year,
        start_year,
        end_year
    )
    VALUES
    (
        (SELECT student_id FROM dbo.students WHERE user_id = 5),
        ''UNDERGRADUATE'',
        ''B.Tech'',
        ''Computer Science and Engineering'',
        ''CampusLink Demo College'',
        ''BPUT'',
        8.90,
        10.00,
        2027,
        2023,
        2027
    );
END;

SELECT
    education_id,
    student_id,
    education_level,
    degree,
    specialization,
    institution_name,
    university_name,
    cgpa,
    maximum_cgpa,
    graduation_year,
    start_year,
    end_year,
    created_at,
    updated_at
FROM dbo.student_education
ORDER BY education_id;
');