USE [campuslink];
GO

-- Remove the table if a previous failed attempt created it
IF OBJECT_ID(N'dbo.student_education', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.student_education;
END;
GO

-- Create the table WITHOUT the foreign key first
CREATE TABLE dbo.student_education
(
    education_id INT IDENTITY(1,1) NOT NULL,

    student_id INT NOT NULL,

    education_level NVARCHAR(50) NOT NULL,

    degree NVARCHAR(150) NOT NULL,

    specialization NVARCHAR(150) NULL,

    institution_name NVARCHAR(200) NULL,

    university_name NVARCHAR(200) NULL,

    cgpa DECIMAL(4,2) NULL,

    maximum_cgpa DECIMAL(4,2) NOT NULL
        CONSTRAINT DF_student_education_maximum_cgpa
        DEFAULT (10.00),

    graduation_year INT NULL,

    start_year INT NULL,

    end_year INT NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_student_education_created_at
        DEFAULT (SYSDATETIME()),

    updated_at DATETIME2 NOT NULL
        CONSTRAINT DF_student_education_updated_at
        DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_student_education
        PRIMARY KEY (education_id),

    CONSTRAINT CK_student_education_cgpa
        CHECK (cgpa IS NULL OR cgpa >= 0),

    CONSTRAINT CK_student_education_max_cgpa
        CHECK (maximum_cgpa > 0)
);
GO

-- Add the foreign key separately
ALTER TABLE dbo.student_education
ADD CONSTRAINT FK_student_education_students
    FOREIGN KEY (student_id)
    REFERENCES dbo.students(student_id);
GO