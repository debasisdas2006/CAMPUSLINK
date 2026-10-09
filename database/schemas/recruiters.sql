USE [campuslink];
GO

CREATE TABLE dbo.recruiters
(
    recruiter_id INT IDENTITY(1,1) NOT NULL,

    user_id INT NOT NULL,

    first_name NVARCHAR(100) NOT NULL,

    last_name NVARCHAR(100) NULL,

    phone NVARCHAR(20) NULL,

    designation NVARCHAR(150) NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_recruiters_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_recruiters_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_recruiters
        PRIMARY KEY (recruiter_id),

    CONSTRAINT UQ_recruiters_user_id
        UNIQUE (user_id),

    CONSTRAINT FK_recruiters_users
        FOREIGN KEY (user_id)
        REFERENCES dbo.users(user_id)
);
GO