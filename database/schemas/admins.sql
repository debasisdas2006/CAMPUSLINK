USE [campuslink];
GO

IF OBJECT_ID(N'dbo.admins', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.admins;
END;
GO

CREATE TABLE dbo.admins
(
    admin_id INT IDENTITY(1,1) NOT NULL,

    user_id INT NOT NULL,

    first_name NVARCHAR(100) NOT NULL,

    last_name NVARCHAR(100) NULL,

    phone NVARCHAR(20) NULL,

    designation NVARCHAR(150) NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_admins_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_admins_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_admins
        PRIMARY KEY (admin_id),

    CONSTRAINT UQ_admins_user_id
        UNIQUE (user_id)
);
GO

ALTER TABLE dbo.admins
ADD CONSTRAINT FK_admins_users
    FOREIGN KEY (user_id)
    REFERENCES dbo.users(user_id);
GO