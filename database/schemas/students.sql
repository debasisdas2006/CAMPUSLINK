USE campuslink;
GO

CREATE TABLE students (
    student_id INT IDENTITY(1,1) PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    college_id INT NOT NULL,

    first_name NVARCHAR(100) NOT NULL,

    last_name NVARCHAR(100),

    phone NVARCHAR(20),

    date_of_birth DATE,

    gender NVARCHAR(20),

    profile_summary NVARCHAR(MAX),

    total_experience_years DECIMAL(4,2) NOT NULL DEFAULT 0,

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_students_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT FK_students_colleges
        FOREIGN KEY (college_id)
        REFERENCES colleges(college_id)
);
GO