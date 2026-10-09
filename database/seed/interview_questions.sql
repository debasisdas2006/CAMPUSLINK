
EXEC(N'
USE campuslink;

-- =========================================================
-- INTERVIEW 1
-- Finds the interview using application_id = 1
-- =========================================================

DECLARE @InterviewID1 INT;

SELECT @InterviewID1 = interview_id
FROM dbo.interviews
WHERE application_id = 1;

IF @InterviewID1 IS NOT NULL
BEGIN

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID1
          AND question_order = 1
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID1,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''Python''),
            ''What is the difference between a list and a tuple in Python?'',
            ''TECHNICAL'',
            ''EASY'',
            1,
            ''A list is mutable while a tuple is immutable. Lists use square brackets and tuples use parentheses.'',
            120
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID1
          AND question_order = 2
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID1,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''Python''),
            ''What is a Python dictionary and how is it used?'',
            ''TECHNICAL'',
            ''EASY'',
            2,
            ''A dictionary stores data as key-value pairs and allows values to be accessed using their keys.'',
            120
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID1
          AND question_order = 3
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID1,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''Machine Learning''),
            ''What is the difference between supervised and unsupervised learning?'',
            ''TECHNICAL'',
            ''MEDIUM'',
            3,
            ''Supervised learning uses labeled data, while unsupervised learning works with unlabeled data to discover patterns or structures.'',
            150
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID1
          AND question_order = 4
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID1,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''Git''),
            ''Why is Git useful in software development?'',
            ''TECHNICAL'',
            ''EASY'',
            4,
            ''Git is a version control system used to track code changes, collaborate with other developers, and maintain project history.'',
            120
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID1
          AND question_order = 5
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID1,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''Python''),
            ''Explain exception handling in Python.'',
            ''TECHNICAL'',
            ''MEDIUM'',
            5,
            ''Python handles exceptions using try, except, else, and finally blocks so that errors can be handled without terminating the entire program unexpectedly.'',
            150
        );
    END;

END;


-- =========================================================
-- INTERVIEW 2
-- Finds the interview using application_id = 4
-- =========================================================

DECLARE @InterviewID2 INT;

SELECT @InterviewID2 = interview_id
FROM dbo.interviews
WHERE application_id = 4;

IF @InterviewID2 IS NOT NULL
BEGIN

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID2
          AND question_order = 1
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID2,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''JavaScript''),
            ''What is the difference between let, const, and var in JavaScript?'',
            ''TECHNICAL'',
            ''EASY'',
            1,
            ''var has function scope, while let and const have block scope. A let variable can be reassigned, whereas a const variable cannot be reassigned.'',
            150
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID2
          AND question_order = 2
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID2,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''React''),
            ''What is a React component?'',
            ''TECHNICAL'',
            ''EASY'',
            2,
            ''A React component is a reusable building block that defines part of a user interface and can receive data through props.'',
            120
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID2
          AND question_order = 3
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID2,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''Node.js''),
            ''What is Node.js and why is it used?'',
            ''TECHNICAL'',
            ''MEDIUM'',
            3,
            ''Node.js is a JavaScript runtime built on Chrome V8 that allows JavaScript to run outside the browser and is commonly used for backend services.'',
            150
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID2
          AND question_order = 4
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID2,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''JavaScript''),
            ''What is an API and how does a frontend application use it?'',
            ''TECHNICAL'',
            ''MEDIUM'',
            4,
            ''An API provides a way for applications to communicate. A frontend can send HTTP requests to a backend API and receive data in formats such as JSON.'',
            150
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID2
          AND question_order = 5
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID2,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''React''),
            ''What is the purpose of React state?'',
            ''TECHNICAL'',
            ''MEDIUM'',
            5,
            ''State stores data that can change during the lifetime of a component and causes the component to re-render when updated.'',
            150
        );
    END;

END;


-- =========================================================
-- INTERVIEW 3
-- Finds the interview using application_id = 5
-- =========================================================

DECLARE @InterviewID3 INT;

SELECT @InterviewID3 = interview_id
FROM dbo.interviews
WHERE application_id = 5;

IF @InterviewID3 IS NOT NULL
BEGIN

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID3
          AND question_order = 1
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID3,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''React''),
            ''What is the Virtual DOM in React?'',
            ''TECHNICAL'',
            ''EASY'',
            1,
            ''The Virtual DOM is an in-memory representation of the UI that React uses to determine efficient updates to the actual DOM.'',
            120
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID3
          AND question_order = 2
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID3,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''JavaScript''),
            ''What is the difference between == and === in JavaScript?'',
            ''TECHNICAL'',
            ''EASY'',
            2,
            ''The == operator performs type conversion before comparison, while === compares both value and type without implicit conversion.'',
            120
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID3
          AND question_order = 3
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID3,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''HTML''),
            ''What is the purpose of semantic HTML?'',
            ''TECHNICAL'',
            ''EASY'',
            3,
            ''Semantic HTML uses meaningful elements such as header, nav, main, section, and footer to describe the structure and meaning of content.'',
            120
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID3
          AND question_order = 4
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID3,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''CSS''),
            ''What is responsive web design?'',
            ''TECHNICAL'',
            ''MEDIUM'',
            4,
            ''Responsive design allows a website layout to adapt to different screen sizes and devices using flexible layouts, media queries, and responsive units.'',
            150
        );
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_questions
        WHERE interview_id = @InterviewID3
          AND question_order = 5
    )
    BEGIN
        INSERT INTO dbo.interview_questions
        (
            interview_id,
            skill_id,
            question_text,
            question_type,
            difficulty_level,
            question_order,
            expected_answer,
            time_limit_seconds
        )
        VALUES
        (
            @InterviewID3,
            (SELECT skill_id FROM dbo.skills WHERE skill_name = ''GitHub''),
            ''Why is GitHub useful for software development teams?'',
            ''TECHNICAL'',
            ''EASY'',
            5,
            ''GitHub hosts Git repositories and supports collaboration through branches, pull requests, code review, and issue tracking.'',
            120
        );
    END;

END;


-- =========================================================
-- VERIFICATION
-- =========================================================

SELECT
    iq.interview_question_id,
    iq.interview_id,
    iq.skill_id,
    s.skill_name,
    iq.question_text,
    iq.question_type,
    iq.difficulty_level,
    iq.question_order,
    iq.time_limit_seconds
FROM dbo.interview_questions iq
LEFT JOIN dbo.skills s
    ON iq.skill_id = s.skill_id
ORDER BY iq.interview_id, iq.question_order;
');