SELECT
    @@SERVERNAME AS ServerName,
    @@VERSION AS SQLServerVersion;

SELECT
    DB_NAME() AS CurrentDatabase;
    USE [campuslink];
GO

SELECT
    DB_NAME() AS CurrentDatabase,
    OBJECT_ID(N'dbo.students', N'U') AS StudentsObjectID,
    OBJECT_ID(N'dbo.skills', N'U') AS SkillsObjectID;
GO