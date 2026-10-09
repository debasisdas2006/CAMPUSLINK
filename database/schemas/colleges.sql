USE campuslink;
GO

CREATE TABLE colleges (
    college_id INT IDENTITY(1,1) PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    college_name NVARCHAR(200) NOT NULL,

    college_code NVARCHAR(50) NOT NULL UNIQUE,

    address NVARCHAR(500),

    city NVARCHAR(100),

    state NVARCHAR(100),

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_colleges_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);
GO