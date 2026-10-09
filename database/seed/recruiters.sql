EXEC(N'
USE campuslink;

-- =========================================================
-- RECRUITER 1
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.recruiters
    WHERE user_id = 2
)
BEGIN
    INSERT INTO dbo.recruiters
    (
        user_id,
        first_name,
        last_name,
        phone,
        designation
    )
    VALUES
    (
        2,
        ''Amit'',
        ''Sharma'',
        ''9876500001'',
        ''HR Manager''
    );
END;


-- =========================================================
-- RECRUITER 2
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.recruiters
    WHERE user_id = 6
)
BEGIN
    INSERT INTO dbo.recruiters
    (
        user_id,
        first_name,
        last_name,
        phone,
        designation
    )
    VALUES
    (
        6,
        ''Sneha'',
        ''Patel'',
        ''9876500002'',
        ''Technical Recruiter''
    );
END;


-- =========================================================
-- VERIFY
-- =========================================================

SELECT
    recruiter_id,
    user_id,
    first_name,
    last_name,
    phone,
    designation,
    created_at,
    updated_at
FROM dbo.recruiters
ORDER BY recruiter_id;
');