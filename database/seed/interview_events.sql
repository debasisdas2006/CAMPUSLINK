EXEC(N'
USE campuslink;

DECLARE
    @InterviewId1 INT,
    @InterviewId2 INT,
    @InterviewId3 INT,
    @Question1 INT,
    @Question2 INT,
    @Question3 INT,
    @Question4 INT,
    @Question5 INT,
    @Question6 INT,
    @Question7 INT,
    @Question8 INT,
    @Question9 INT,
    @Question10 INT,
    @Question11 INT,
    @Question12 INT,
    @Question13 INT,
    @Question14 INT,
    @Question15 INT;


/* =========================================================
   GET INTERVIEW IDS
   ========================================================= */

SELECT @InterviewId1 = interview_id
FROM dbo.interviews
WHERE application_id = 1;

SELECT @InterviewId2 = interview_id
FROM dbo.interviews
WHERE application_id = 4;

SELECT @InterviewId3 = interview_id
FROM dbo.interviews
WHERE application_id = 5;


/* =========================================================
   GET QUESTION IDS
   ========================================================= */

SELECT @Question1 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId1
AND question_order = 1;

SELECT @Question2 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId1
AND question_order = 2;

SELECT @Question3 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId1
AND question_order = 3;

SELECT @Question4 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId1
AND question_order = 4;

SELECT @Question5 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId1
AND question_order = 5;


SELECT @Question6 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId2
AND question_order = 1;

SELECT @Question7 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId2
AND question_order = 2;

SELECT @Question8 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId2
AND question_order = 3;

SELECT @Question9 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId2
AND question_order = 4;

SELECT @Question10 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId2
AND question_order = 5;


SELECT @Question11 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId3
AND question_order = 1;

SELECT @Question12 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId3
AND question_order = 2;

SELECT @Question13 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId3
AND question_order = 3;

SELECT @Question14 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId3
AND question_order = 4;

SELECT @Question15 = interview_question_id
FROM dbo.interview_questions
WHERE interview_id = @InterviewId3
AND question_order = 5;


/* =========================================================
   INTERVIEW 1
   ========================================================= */

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.interview_events
    WHERE interview_id = @InterviewId1
)
BEGIN

    INSERT INTO dbo.interview_events
    (
        interview_id,
        interview_question_id,
        event_type,
        event_data,
        difficulty_level,
        event_timestamp
    )
    VALUES
    (
        @InterviewId1,
        NULL,
        ''INTERVIEW_STARTED'',
        ''AI interview started successfully'',
        ''MEDIUM'',
        ''2026-09-20 10:00:00''
    ),
    (
        @InterviewId1,
        @Question1,
        ''QUESTION_ASKED'',
        ''Python technical question presented'',
        ''EASY'',
        ''2026-09-20 10:02:00''
    ),
    (
        @InterviewId1,
        @Question2,
        ''QUESTION_ASKED'',
        ''Machine Learning technical question presented'',
        ''MEDIUM'',
        ''2026-09-20 10:07:00''
    ),
    (
        @InterviewId1,
        @Question3,
        ''QUESTION_ASKED'',
        ''Git technical question presented'',
        ''EASY'',
        ''2026-09-20 10:12:00''
    ),
    (
        @InterviewId1,
        @Question4,
        ''QUESTION_ASKED'',
        ''JavaScript technical question presented'',
        ''MEDIUM'',
        ''2026-09-20 10:17:00''
    ),
    (
        @InterviewId1,
        @Question5,
        ''QUESTION_ASKED'',
        ''React technical question presented'',
        ''MEDIUM'',
        ''2026-09-20 10:21:00''
    ),
    (
        @InterviewId1,
        NULL,
        ''INTERVIEW_COMPLETED'',
        ''AI interview completed successfully'',
        ''MEDIUM'',
        ''2026-09-20 10:25:00''
    );

END;


/* =========================================================
   INTERVIEW 2
   ========================================================= */

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.interview_events
    WHERE interview_id = @InterviewId2
)
BEGIN

    INSERT INTO dbo.interview_events
    (
        interview_id,
        interview_question_id,
        event_type,
        event_data,
        difficulty_level,
        event_timestamp
    )
    VALUES
    (
        @InterviewId2,
        NULL,
        ''INTERVIEW_STARTED'',
        ''AI interview started successfully'',
        ''MEDIUM'',
        ''2026-09-21 11:00:00''
    ),
    (
        @InterviewId2,
        @Question6,
        ''QUESTION_ASKED'',
        ''JavaScript technical question presented'',
        ''EASY'',
        ''2026-09-21 11:02:00''
    ),
    (
        @InterviewId2,
        @Question7,
        ''QUESTION_ASKED'',
        ''React technical question presented'',
        ''MEDIUM'',
        ''2026-09-21 11:07:00''
    ),
    (
        @InterviewId2,
        @Question8,
        ''QUESTION_ASKED'',
        ''Node.js technical question presented'',
        ''MEDIUM'',
        ''2026-09-21 11:12:00''
    ),
    (
        @InterviewId2,
        @Question9,
        ''QUESTION_ASKED'',
        ''GitHub technical question presented'',
        ''EASY'',
        ''2026-09-21 11:17:00''
    ),
    (
        @InterviewId2,
        @Question10,
        ''QUESTION_ASKED'',
        ''React technical question presented'',
        ''MEDIUM'',
        ''2026-09-21 11:22:00''
    ),
    (
        @InterviewId2,
        NULL,
        ''INTERVIEW_COMPLETED'',
        ''AI interview completed successfully'',
        ''MEDIUM'',
        ''2026-09-21 11:28:00''
    );

END;


/* =========================================================
   INTERVIEW 3
   ========================================================= */

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.interview_events
    WHERE interview_id = @InterviewId3
)
BEGIN

    INSERT INTO dbo.interview_events
    (
        interview_id,
        interview_question_id,
        event_type,
        event_data,
        difficulty_level,
        event_timestamp
    )
    VALUES
    (
        @InterviewId3,
        NULL,
        ''INTERVIEW_STARTED'',
        ''AI interview started successfully'',
        ''EASY'',
        ''2026-09-22 14:00:00''
    ),
    (
        @InterviewId3,
        @Question11,
        ''QUESTION_ASKED'',
        ''JavaScript technical question presented'',
        ''EASY'',
        ''2026-09-22 14:02:00''
    ),
    (
        @InterviewId3,
        @Question12,
        ''QUESTION_ASKED'',
        ''React technical question presented'',
        ''EASY'',
        ''2026-09-22 14:06:00''
    ),
    (
        @InterviewId3,
        @Question13,
        ''QUESTION_ASKED'',
        ''HTML technical question presented'',
        ''EASY'',
        ''2026-09-22 14:10:00''
    ),
    (
        @InterviewId3,
        @Question14,
        ''QUESTION_ASKED'',
        ''CSS technical question presented'',
        ''EASY'',
        ''2026-09-22 14:14:00''
    ),
    (
        @InterviewId3,
        @Question15,
        ''QUESTION_ASKED'',
        ''GitHub technical question presented'',
        ''EASY'',
        ''2026-09-22 14:17:00''
    ),
    (
        @InterviewId3,
        NULL,
        ''INTERVIEW_COMPLETED'',
        ''AI interview completed successfully'',
        ''EASY'',
        ''2026-09-22 14:20:00''
    );

END;


/* =========================================================
   VERIFY EVENTS
   ========================================================= */

SELECT
    event_id,
    interview_id,
    interview_question_id,
    event_type,
    event_data,
    difficulty_level,
    event_timestamp,
    created_at
FROM dbo.interview_events
ORDER BY interview_id, event_timestamp;


/* =========================================================
   COUNT EVENTS
   ========================================================= */

SELECT
    interview_id,
    COUNT(*) AS total_events
FROM dbo.interview_events
GROUP BY interview_id
ORDER BY interview_id;

');