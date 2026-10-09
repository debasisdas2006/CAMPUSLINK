EXEC(N'
USE campuslink;

-- =========================================================
-- INTERVIEW ANSWERS SEED DATA
-- =========================================================

DECLARE @InterviewID1 INT;
DECLARE @InterviewID2 INT;
DECLARE @InterviewID3 INT;

SELECT @InterviewID1 = interview_id
FROM dbo.interviews
WHERE application_id = 1;

SELECT @InterviewID2 = interview_id
FROM dbo.interviews
WHERE application_id = 4;

SELECT @InterviewID3 = interview_id
FROM dbo.interviews
WHERE application_id = 5;


-- =========================================================
-- INTERVIEW 1 - Student 1
-- Python Developer
-- =========================================================

IF @InterviewID1 IS NOT NULL
BEGIN

    -- Question 1
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 1
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            1,
            ''A list is mutable, so we can add, remove or change elements. A tuple is immutable and cannot be changed after creation.'',
            ''TEXT'',
            90.00,
            90.00,
            95.00,
            90.00,
            85.00,
            ''Correctly explained the main difference between lists and tuples. The answer is concise and relevant.'',
            ''EVALUATED'',
            ''2026-09-20 10:04:00'',
            ''2026-09-20 10:04:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 1;
    END;


    -- Question 2
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 2
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            1,
            ''A dictionary stores information using key-value pairs. We can access a value by providing its key, and dictionaries are useful for storing related data.'',
            ''TEXT'',
            88.00,
            88.00,
            90.00,
            90.00,
            84.00,
            ''Good explanation of dictionary key-value storage and usage. Adding an example would make the answer stronger.'',
            ''EVALUATED'',
            ''2026-09-20 10:08:00'',
            ''2026-09-20 10:08:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 2;
    END;


    -- Question 3
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 3
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            1,
            ''Supervised learning uses labeled training data where the expected output is known. Unsupervised learning uses unlabeled data to discover patterns such as clusters.'',
            ''TEXT'',
            82.00,
            85.00,
            82.00,
            85.00,
            76.00,
            ''Correctly distinguished supervised and unsupervised learning. The explanation could include more examples of algorithms.'',
            ''EVALUATED'',
            ''2026-09-20 10:13:00'',
            ''2026-09-20 10:13:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 3;
    END;


    -- Question 4
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 4
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            1,
            ''Git tracks changes in source code and allows developers to work together using branches, commits and merges. It also keeps a history of project changes.'',
            ''TEXT'',
            86.00,
            88.00,
            88.00,
            90.00,
            78.00,
            ''Good understanding of Git and its role in collaborative development.'',
            ''EVALUATED'',
            ''2026-09-20 10:17:00'',
            ''2026-09-20 10:17:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 4;
    END;


    -- Question 5
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 5
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            1,
            ''Python exception handling uses try and except blocks to catch errors. The else block runs when there is no exception and finally can be used for cleanup operations.'',
            ''TEXT'',
            80.00,
            82.00,
            82.00,
            84.00,
            72.00,
            ''The core exception handling concepts are correct. The answer could explain specific exception types with an example.'',
            ''EVALUATED'',
            ''2026-09-20 10:22:00'',
            ''2026-09-20 10:22:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID1
          AND iq.question_order = 5;
    END;

END;


-- =========================================================
-- INTERVIEW 2 - Student 2
-- Full Stack Developer
-- =========================================================

IF @InterviewID2 IS NOT NULL
BEGIN

    -- Question 1
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 1
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''var is function scoped, while let and const are block scoped. let can be reassigned but const cannot be reassigned.'',
            ''TEXT'',
            92.00,
            94.00,
            95.00,
            93.00,
            86.00,
            ''Excellent explanation of JavaScript variable declarations and their scope and reassignment behavior.'',
            ''EVALUATED'',
            ''2026-09-21 11:04:00'',
            ''2026-09-21 11:04:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 1;
    END;


    -- Question 2
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 2
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''A React component is a reusable part of a user interface. It can receive information through props and maintain its own state when required.'',
            ''TEXT'',
            90.00,
            92.00,
            92.00,
            92.00,
            82.00,
            ''Strong understanding of React components, props and state.'',
            ''EVALUATED'',
            ''2026-09-21 11:09:00'',
            ''2026-09-21 11:09:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 2;
    END;


    -- Question 3
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 3
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''Node.js is a JavaScript runtime based on the V8 engine. It allows JavaScript to run on the server and is commonly used to build backend APIs and applications.'',
            ''TEXT'',
            88.00,
            90.00,
            92.00,
            90.00,
            78.00,
            ''Correctly explained Node.js and its use for backend development.'',
            ''EVALUATED'',
            ''2026-09-21 11:14:00'',
            ''2026-09-21 11:14:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 3;
    END;


    -- Question 4
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 4
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''An API allows the frontend and backend to communicate. The frontend sends HTTP requests such as GET or POST and receives data, often in JSON format.'',
            ''TEXT'',
            94.00,
            94.00,
            95.00,
            95.00,
            88.00,
            ''Excellent explanation of frontend-backend communication through APIs.'',
            ''EVALUATED'',
            ''2026-09-21 11:19:00'',
            ''2026-09-21 11:19:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 4;
    END;


    -- Question 5
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 5
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''React state stores data that can change during the lifetime of a component. Updating state causes React to render the component again with the updated data.'',
            ''TEXT'',
            86.00,
            88.00,
            90.00,
            90.00,
            76.00,
            ''Correctly explained the purpose of React state and its relationship with rendering.'',
            ''EVALUATED'',
            ''2026-09-21 11:24:00'',
            ''2026-09-21 11:24:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID2
          AND iq.question_order = 5;
    END;

END;


-- =========================================================
-- INTERVIEW 3 - Student 2
-- Frontend Developer
-- =========================================================

IF @InterviewID3 IS NOT NULL
BEGIN

    -- Question 1
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 1
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''The Virtual DOM is a lightweight in-memory representation of the actual DOM. React compares changes and updates the real DOM efficiently.'',
            ''TEXT'',
            92.00,
            93.00,
            94.00,
            94.00,
            84.00,
            ''Clear and correct explanation of the Virtual DOM concept.'',
            ''EVALUATED'',
            ''2026-09-22 14:04:00'',
            ''2026-09-22 14:04:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 1;
    END;


    -- Question 2
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 2
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''The == operator allows type conversion before comparing values, while === checks both the value and the data type without type conversion.'',
            ''TEXT'',
            95.00,
            95.00,
            97.00,
            96.00,
            90.00,
            ''Excellent and precise explanation of loose and strict equality in JavaScript.'',
            ''EVALUATED'',
            ''2026-09-22 14:08:00'',
            ''2026-09-22 14:08:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 2;
    END;


    -- Question 3
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 3
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''Semantic HTML uses meaningful elements such as header, nav, main and footer. These elements describe the purpose of the content and improve structure and accessibility.'',
            ''TEXT'',
            91.00,
            90.00,
            94.00,
            94.00,
            84.00,
            ''Good understanding of semantic HTML and its benefits for structure and accessibility.'',
            ''EVALUATED'',
            ''2026-09-22 14:12:00'',
            ''2026-09-22 14:12:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 3;
    END;


    -- Question 4
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 4
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''Responsive web design makes a website adapt to different screen sizes and devices using flexible layouts, media queries and responsive units.'',
            ''TEXT'',
            93.00,
            93.00,
            94.00,
            95.00,
            86.00,
            ''Strong explanation of responsive design techniques and their purpose.'',
            ''EVALUATED'',
            ''2026-09-22 14:16:00'',
            ''2026-09-22 14:16:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 4;
    END;


    -- Question 5
    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.interview_answers ia
        INNER JOIN dbo.interview_questions iq
            ON ia.interview_question_id = iq.interview_question_id
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 5
    )
    BEGIN
        INSERT INTO dbo.interview_answers
        (
            interview_question_id,
            student_id,
            answer_text,
            answer_type,
            answer_score,
            technical_score,
            correctness_score,
            relevance_score,
            communication_score,
            ai_feedback,
            evaluation_status,
            answered_at,
            evaluated_at
        )
        SELECT
            iq.interview_question_id,
            2,
            ''GitHub provides online hosting for Git repositories and supports collaboration through branches, pull requests, code reviews and issue tracking.'',
            ''TEXT'',
            90.00,
            91.00,
            92.00,
            93.00,
            82.00,
            ''Correctly described the main collaboration features provided by GitHub.'',
            ''EVALUATED'',
            ''2026-09-22 14:19:00'',
            ''2026-09-22 14:19:30''
        FROM dbo.interview_questions iq
        WHERE iq.interview_id = @InterviewID3
          AND iq.question_order = 5;
    END;

END;


-- =========================================================
-- VERIFICATION
-- =========================================================

SELECT
    ia.answer_id,
    ia.interview_question_id,
    ia.student_id,
    iq.interview_id,
    iq.question_order,
    ia.answer_type,
    ia.answer_score,
    ia.technical_score,
    ia.correctness_score,
    ia.relevance_score,
    ia.communication_score,
    ia.evaluation_status,
    ia.answered_at,
    ia.evaluated_at
FROM dbo.interview_answers ia
INNER JOIN dbo.interview_questions iq
    ON ia.interview_question_id = iq.interview_question_id
ORDER BY iq.interview_id, iq.question_order;
');