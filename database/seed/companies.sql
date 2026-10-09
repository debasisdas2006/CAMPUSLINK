EXEC(N'
USE campuslink;

-- =========================================================
-- COMPANY 1
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.companies
    WHERE company_code = ''TECH001''
)
BEGIN
    INSERT INTO dbo.companies
    (
        recruiter_id,
        company_name,
        company_code,
        industry,
        description,
        website,
        address,
        city,
        state
    )
    VALUES
    (
        (SELECT recruiter_id
         FROM dbo.recruiters
         WHERE user_id = 2),

        ''TechNova Solutions'',
        ''TECH001'',
        ''Information Technology'',
        ''Software development and technology solutions company.'',
        ''https://technova.example.com'',
        ''Tech Park, Bhubaneswar'',
        ''Bhubaneswar'',
        ''Odisha''
    );
END;


-- =========================================================
-- COMPANY 2
-- =========================================================

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.companies
    WHERE company_code = ''DATA001''
)
BEGIN
    INSERT INTO dbo.companies
    (
        recruiter_id,
        company_name,
        company_code,
        industry,
        description,
        website,
        address,
        city,
        state
    )
    VALUES
    (
        (SELECT recruiter_id
         FROM dbo.recruiters
         WHERE user_id = 6),

        ''DataCore Technologies'',
        ''DATA001'',
        ''Software and Data Analytics'',
        ''Technology company focused on software, data engineering and AI solutions.'',
        ''https://datacore.example.com'',
        ''Infocity, Bhubaneswar'',
        ''Bhubaneswar'',
        ''Odisha''
    );
END;


-- =========================================================
-- VERIFY
-- =========================================================

SELECT
    company_id,
    recruiter_id,
    company_name,
    company_code,
    industry,
    description,
    website,
    address,
    city,
    state,
    created_at,
    updated_at
FROM dbo.companies
ORDER BY company_id;
');