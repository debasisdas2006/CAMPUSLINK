USE campuslink;
GO

/* =========================================================
   USERS
   ========================================================= */

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.users
    WHERE username = 'student1'
)
BEGIN
    INSERT INTO dbo.users
    (
        username,
        email,
        password_hash,
        role,
        is_active
    )
    VALUES
    (
        'student1',
        'student1@campuslink.com',
        'demo_hash_student1',
        'STUDENT',
        1
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.users
    WHERE username = 'student2'
)
BEGIN
    INSERT INTO dbo.users
    (
        username,
        email,
        password_hash,
        role,
        is_active
    )
    VALUES
    (
        'student2',
        'student2@campuslink.com',
        'demo_hash_student2',
        'STUDENT',
        1
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.users
    WHERE username = 'recruiter1'
)
BEGIN
    INSERT INTO dbo.users
    (
        username,
        email,
        password_hash,
        role,
        is_active
    )
    VALUES
    (
        'recruiter1',
        'recruiter1@campuslink.com',
        'demo_hash_recruiter1',
        'RECRUITER',
        1
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.users
    WHERE username = 'admin1'
)
BEGIN
    INSERT INTO dbo.users
    (
        username,
        email,
        password_hash,
        role,
        is_active
    )
    VALUES
    (
        'admin1',
        'admin1@campuslink.com',
        'demo_hash_admin1',
        'ADMIN',
        1
    );
END;
GO


/* =========================================================
   VERIFY
   ========================================================= */

SELECT
    user_id,
    username,
    email,
    role,
    is_active
FROM dbo.users
ORDER BY user_id;
GO