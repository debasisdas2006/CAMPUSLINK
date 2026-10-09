USE [campuslink];
GO

IF OBJECT_ID(N'dbo.companies', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.companies;
END;
GO

CREATE TABLE dbo.companies
(
    company_id INT IDENTITY(1,1) NOT NULL,

    recruiter_id INT NOT NULL,

    company_name NVARCHAR(200) NOT NULL,

    company_code NVARCHAR(100) NOT NULL,

    industry NVARCHAR(150) NULL,

    description NVARCHAR(MAX) NULL,

    website NVARCHAR(500) NULL,

    address NVARCHAR(500) NULL,

    city NVARCHAR(100) NULL,

    state NVARCHAR(100) NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_companies_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_companies_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_companies
        PRIMARY KEY (company_id),

    CONSTRAINT UQ_companies_company_code
        UNIQUE (company_code)
);
GO

ALTER TABLE dbo.companies
ADD CONSTRAINT FK_companies_recruiters
    FOREIGN KEY (recruiter_id)
    REFERENCES dbo.recruiters(recruiter_id);
GO