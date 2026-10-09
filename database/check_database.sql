USE campuslink;
GO

SELECT
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
USE campuslink;
GO

EXEC sp_help 'students';
GO
USE campuslink;
GO

SELECT
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS ChildTable,
    OBJECT_NAME(fk.referenced_object_id) AS ParentTable
FROM sys.foreign_keys AS fk
WHERE OBJECT_NAME(fk.parent_object_id) IN ('students', 'colleges');
GO
USE campuslink;
GO

SELECT DB_NAME() AS CurrentDatabase;
GO

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
USE campuslink;
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN ('users', 'colleges', 'students');
GO
USE campuslink;
GO

SELECT
    DB_NAME() AS CurrentDatabase;
GO

SELECT
    s.name AS SchemaName,
    t.name AS TableName,
    t.object_id AS ObjectID
FROM sys.tables AS t
INNER JOIN sys.schemas AS s
    ON t.schema_id = s.schema_id
WHERE t.name IN ('users', 'colleges', 'students');
GO
USE campuslink;
GO

SELECT
    c.name AS ColumnName,
    c.column_id AS ColumnID,
    ty.name AS DataType,
    c.is_nullable AS IsNullable
FROM sys.columns AS c
INNER JOIN sys.tables AS t
    ON c.object_id = t.object_id
INNER JOIN sys.schemas AS s
    ON t.schema_id = s.schema_id
INNER JOIN sys.types AS ty
    ON c.user_type_id = ty.user_type_id
WHERE s.name = 'dbo'
  AND t.name = 'students'
ORDER BY c.column_id;
GO

SELECT
    kc.name AS ConstraintName,
    kc.type_desc AS ConstraintType
FROM sys.key_constraints AS kc
INNER JOIN sys.tables AS t
    ON kc.parent_object_id = t.object_id
INNER JOIN sys.schemas AS s
    ON t.schema_id = s.schema_id
WHERE s.name = 'dbo'
  AND t.name = 'students';
GO
USE campuslink;
GO

SELECT
    kc.name AS ConstraintName,
    kc.type_desc AS ConstraintType
FROM sys.key_constraints AS kc
INNER JOIN sys.tables AS t
    ON kc.parent_object_id = t.object_id
INNER JOIN sys.schemas AS s
    ON t.schema_id = s.schema_id
WHERE s.name = 'dbo'
  AND t.name = 'students';
GO
USE campuslink;
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
USE campuslink;
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
USE [campuslink];
GO

SELECT
    DB_NAME() AS CurrentDatabase,
    OBJECT_ID(N'dbo.recruiters', N'U') AS RecruitersObjectID;
GO

SELECT
    s.name AS SchemaName,
    t.name AS TableName
FROM sys.tables AS t
INNER JOIN sys.schemas AS s
    ON t.schema_id = s.schema_id
WHERE t.name = 'recruiters';
GO
USE [campuslink];
GO

SELECT
    DB_NAME() AS CurrentDatabase,
    OBJECT_ID(N'dbo.students', N'U') AS StudentsObjectID,
    OBJECT_ID(N'dbo.skills', N'U') AS SkillsObjectID;
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'student_skills';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'applications';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'tests';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'test_questions';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'test_attempts';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'interviews';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'interview_questions';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'interview_answers';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'interview_events';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'performance_results';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'feedback';
GO
USE [campuslink];
GO

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'admins';
GO
USE [campuslink];
GO

/* ============================================
   1. CHECK ALL TABLES
   ============================================ */

SELECT
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;
GO


/* ============================================
   2. CHECK TABLE COUNT
   ============================================ */

SELECT
    COUNT(*) AS TotalTables
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo';
GO


/* ============================================
   3. CHECK PRIMARY KEYS
   ============================================ */

SELECT
    TABLE_NAME,
    CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE CONSTRAINT_TYPE = 'PRIMARY KEY'
  AND TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;
GO


/* ============================================
   4. CHECK FOREIGN KEYS
   ============================================ */

SELECT
    fk.name AS ForeignKeyName,
    OBJECT_SCHEMA_NAME(fk.parent_object_id) AS ChildSchema,
    OBJECT_NAME(fk.parent_object_id) AS ChildTable,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ChildColumn,
    OBJECT_SCHEMA_NAME(fk.referenced_object_id) AS ParentSchema,
    OBJECT_NAME(fk.referenced_object_id) AS ParentTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ParentColumn
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc
    ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_SCHEMA_NAME(fk.parent_object_id) = 'dbo'
ORDER BY ChildTable, ForeignKeyName;
GO
USE [campuslink];
GO

SELECT
    c.COLUMN_NAME,
    c.DATA_TYPE,
    c.IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE c.TABLE_SCHEMA = 'dbo'
  AND c.TABLE_NAME = 'jobs'
ORDER BY c.ORDINAL_POSITION;
GO
USE [campuslink];
GO

SELECT
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS ChildTable,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ChildColumn,
    OBJECT_NAME(fk.referenced_object_id) AS ParentTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ParentColumn
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc
    ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) = 'jobs'
ORDER BY fk.name;
GO
USE [campuslink];
GO

SELECT
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS ChildTable,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ChildColumn,
    OBJECT_NAME(fk.referenced_object_id) AS ParentTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ParentColumn
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc
    ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) = 'jobs'
ORDER BY fk.name;
GO
USE [campuslink];
GO

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;
GO
USE campuslink;
GO

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'student_skills'
ORDER BY ORDINAL_POSITION;
GO

SELECT
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS ChildTable,
    OBJECT_NAME(fk.referenced_object_id) AS ParentTable
FROM sys.foreign_keys fk
WHERE OBJECT_NAME(fk.parent_object_id) = 'student_skills';
GO
USE campuslink;
GO

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'student_education'
ORDER BY ORDINAL_POSITION;
GO
USE campuslink;
GO

SELECT
    c.column_id,
    c.name AS column_name,
    t.name AS data_type,
    c.max_length,
    c.is_nullable,
    c.is_identity
FROM sys.columns c
INNER JOIN sys.types t
    ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.colleges')
ORDER BY c.column_id;
GO
EXEC(N'
USE campuslink;

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = ''dbo''
  AND TABLE_NAME = ''tests''
ORDER BY ORDINAL_POSITION;
');
EXEC(N'
USE campuslink;

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = ''dbo''
  AND TABLE_NAME = ''tests''
ORDER BY ORDINAL_POSITION;
');
EXEC(N'
USE campuslink;

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = ''dbo''
  AND TABLE_NAME = ''tests''
ORDER BY ORDINAL_POSITION;
');
EXEC(N'
USE campuslink;

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = ''dbo''
  AND TABLE_NAME = ''tests''
ORDER BY ORDINAL_POSITION;
');
EXEC(N'
USE campuslink;

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = ''dbo''
  AND TABLE_NAME = ''tests''
ORDER BY ORDINAL_POSITION;
');
SELECT 
    name,
    state_desc
FROM sys.databases
WHERE name = 'campuslink';

USE campuslink;

SELECT 
    TABLE_SCHEMA,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
USE campuslink;

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM dbo.users
UNION ALL
SELECT 'colleges', COUNT(*) FROM dbo.colleges
UNION ALL
SELECT 'students', COUNT(*) FROM dbo.students
UNION ALL
SELECT 'student_education', COUNT(*) FROM dbo.student_education
UNION ALL
SELECT 'skills', COUNT(*) FROM dbo.skills
UNION ALL
SELECT 'student_skills', COUNT(*) FROM dbo.student_skills
UNION ALL
SELECT 'recruiters', COUNT(*) FROM dbo.recruiters
UNION ALL
SELECT 'companies', COUNT(*) FROM dbo.companies
UNION ALL
SELECT 'jobs', COUNT(*) FROM dbo.jobs
UNION ALL
SELECT 'applications', COUNT(*) FROM dbo.applications
UNION ALL
SELECT 'tests', COUNT(*) FROM dbo.tests
UNION ALL
SELECT 'test_questions', COUNT(*) FROM dbo.test_questions
UNION ALL
SELECT 'test_attempts', COUNT(*) FROM dbo.test_attempts
UNION ALL
SELECT 'interviews', COUNT(*) FROM dbo.interviews
UNION ALL
SELECT 'interview_questions', COUNT(*) FROM dbo.interview_questions
UNION ALL
SELECT 'interview_answers', COUNT(*) FROM dbo.interview_answers
UNION ALL
SELECT 'interview_events', COUNT(*) FROM dbo.interview_events
UNION ALL
SELECT 'performance_results', COUNT(*) FROM dbo.performance_results
UNION ALL
SELECT 'feedback', COUNT(*) FROM dbo.feedback
ORDER BY table_name;
USE campuslink;

SELECT
    s.student_id,
    s.first_name,
    s.last_name,
    e.degree,
    e.cgpa,
    e.graduation_year
FROM dbo.students s
INNER JOIN dbo.student_education e
    ON s.student_id = e.student_id;
    USE campuslink;

SELECT *
FROM dbo.students;
USE campuslink;

SELECT *
FROM dbo.student_education;
USE campuslink;

SELECT student_id
FROM dbo.students;

SELECT student_id
FROM dbo.student_education;

USE campuslink;

SELECT
    DB_NAME() AS database_name,
    (SELECT COUNT(*) FROM dbo.students) AS students_count,
    (SELECT COUNT(*) FROM dbo.student_education) AS education_count;
    USE campuslink;

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'student_education'
ORDER BY ORDINAL_POSITION;
USE campuslink;

SELECT
    student_id,
    user_id,
    first_name,
    last_name
FROM dbo.students
ORDER BY student_id;
USE campuslink;

SELECT *
FROM dbo.student_education
ORDER BY education_id;
USE campuslink;

SELECT
    s.student_id,
    s.first_name,
    s.last_name,
    e.degree,
    e.specialization,
    e.cgpa,
    e.maximum_cgpa,
    e.graduation_year,
    e.start_year,
    e.end_year
FROM dbo.students s
INNER JOIN dbo.student_education e
    ON s.student_id = e.student_id
ORDER BY s.student_id;