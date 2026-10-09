USE campuslink;
GO

EXEC(N'
IF NOT EXISTS
(
    SELECT 1
    FROM dbo.colleges
    WHERE college_code = ''CL001''
)
BEGIN
    INSERT INTO dbo.colleges
    (
        user_id,
        college_name,
        college_code,
        address,
        city,
        state
    )
    VALUES
    (
        3,
        ''CampusLink Demo College'',
        ''CL001'',
        ''CampusLink Demo Address'',
        ''Bhubaneswar'',
        ''Odisha''
    );
END;
');
GO

EXEC(N'
SELECT
    college_id,
    user_id,
    college_name,
    college_code,
    address,
    city,
    state,
    created_at,
    updated_at
FROM dbo.colleges
ORDER BY college_id;
');
GO