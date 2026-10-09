EXEC(N'
USE campuslink;

SELECT
    i.interview_id,
    i.application_id,
    i.student_id,
    i.job_id,
    i.interview_type,
    i.interview_status,
    i.difficulty_level,
    i.total_questions,
    i.questions_answered,
    i.interview_score,
    i.cutoff_score
FROM dbo.interviews AS i
ORDER BY i.interview_id;

SELECT
    iq.interview_question_id,
    iq.interview_id,
    iq.question_order,
    iq.question_type,
    iq.difficulty_level,
    LEFT(iq.question_text, 80) AS question_text
FROM dbo.interview_questions AS iq
ORDER BY iq.interview_id, iq.question_order;

SELECT
    ia.answer_id,
    ia.interview_question_id,
    ia.student_id,
    ia.answer_score,
    ia.technical_score,
    ia.correctness_score,
    ia.relevance_score,
    ia.communication_score,
    ia.evaluation_status
FROM dbo.interview_answers AS ia
ORDER BY ia.answer_id;
');