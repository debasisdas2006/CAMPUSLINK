EXEC(N'
USE campuslink;

DECLARE @test1 INT;
DECLARE @test2 INT;
DECLARE @test3 INT;
DECLARE @test4 INT;


-- Get actual test IDs
SELECT @test1 = test_id
FROM dbo.tests
WHERE job_id = 1
  AND test_name = ''Python Developer Assessment'';

SELECT @test2 = test_id
FROM dbo.tests
WHERE job_id = 2
  AND test_name = ''Full Stack Developer Assessment'';

SELECT @test3 = test_id
FROM dbo.tests
WHERE job_id = 3
  AND test_name = ''Machine Learning Engineer Assessment'';

SELECT @test4 = test_id
FROM dbo.tests
WHERE job_id = 4
  AND test_name = ''Frontend Developer Assessment'';


/* =========================================================
   PYTHON DEVELOPER - 5 QUESTIONS
   ========================================================= */

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.test_questions
    WHERE test_id = @test1
)
BEGIN

    INSERT INTO dbo.test_questions
    (
        test_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation
    )
    VALUES

    (
        @test1,
        ''Which keyword is used to define a function in Python?'',
        ''function'',
        ''def'',
        ''func'',
        ''define'',
        ''B'',
        ''The def keyword is used to define a function in Python.''
    ),

    (
        @test1,
        ''Which data structure stores key-value pairs in Python?'',
        ''List'',
        ''Tuple'',
        ''Dictionary'',
        ''Set'',
        ''C'',
        ''A dictionary stores data as key-value pairs.''
    ),

    (
        @test1,
        ''Which library is commonly used for numerical array operations in Python?'',
        ''NumPy'',
        ''Flask'',
        ''Django'',
        ''Requests'',
        ''A'',
        ''NumPy provides efficient numerical arrays and mathematical operations.''
    ),

    (
        @test1,
        ''Which HTTP method is commonly used to retrieve data from an API?'',
        ''POST'',
        ''PUT'',
        ''GET'',
        ''DELETE'',
        ''C'',
        ''GET is commonly used to retrieve data from a server or API.''
    ),

    (
        @test1,
        ''Which command initializes a Git repository?'',
        ''git start'',
        ''git init'',
        ''git create'',
        ''git repository'',
        ''B'',
        ''git init initializes a new Git repository.''
    );

END;


/* =========================================================
   FULL STACK DEVELOPER - 5 QUESTIONS
   ========================================================= */

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.test_questions
    WHERE test_id = @test2
)
BEGIN

    INSERT INTO dbo.test_questions
    (
        test_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation
    )
    VALUES

    (
        @test2,
        ''Which keyword declares a block-scoped variable in JavaScript?'',
        ''var'',
        ''let'',
        ''define'',
        ''variable'',
        ''B'',
        ''let declares a block-scoped variable in JavaScript.''
    ),

    (
        @test2,
        ''Which React hook is commonly used to manage component state?'',
        ''useEffect'',
        ''useState'',
        ''useFetch'',
        ''useRoute'',
        ''B'',
        ''useState is the standard React hook for managing component state.''
    ),

    (
        @test2,
        ''Which technology is commonly used to run JavaScript on the server?'',
        ''Node.js'',
        ''React'',
        ''HTML'',
        ''CSS'',
        ''A'',
        ''Node.js provides a JavaScript runtime for server-side applications.''
    ),

    (
        @test2,
        ''Which SQL clause is used to filter rows?'',
        ''ORDER BY'',
        ''GROUP BY'',
        ''WHERE'',
        ''JOIN'',
        ''C'',
        ''WHERE filters rows based on a specified condition.''
    ),

    (
        @test2,
        ''Which Git command uploads local commits to a remote repository?'',
        ''git pull'',
        ''git clone'',
        ''git push'',
        ''git fetch'',
        ''C'',
        ''git push uploads local commits to a remote repository.''
    );

END;


/* =========================================================
   MACHINE LEARNING ENGINEER - 5 QUESTIONS
   ========================================================= */

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.test_questions
    WHERE test_id = @test3
)
BEGIN

    INSERT INTO dbo.test_questions
    (
        test_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation
    )
    VALUES

    (
        @test3,
        ''Which type of learning uses labeled training data?'',
        ''Supervised learning'',
        ''Unsupervised learning'',
        ''Reinforcement learning'',
        ''Random learning'',
        ''A'',
        ''Supervised learning trains models using labeled examples.''
    ),

    (
        @test3,
        ''Which metric is commonly used for classification accuracy?'',
        ''Accuracy'',
        ''Mean squared error'',
        ''R-squared'',
        ''Mean absolute error'',
        ''A'',
        ''Accuracy measures the proportion of correctly classified predictions.''
    ),

    (
        @test3,
        ''Which technique helps reduce overfitting in machine learning?'',
        ''Regularization'',
        ''Increasing noise'',
        ''Removing validation data'',
        ''Increasing model complexity without limits'',
        ''A'',
        ''Regularization penalizes overly complex models and can reduce overfitting.''
    ),

    (
        @test3,
        ''Which Python library is widely used for machine learning?'',
        ''Scikit-learn'',
        ''BeautifulSoup'',
        ''Tkinter'',
        ''PyGame'',
        ''A'',
        ''Scikit-learn provides many machine learning algorithms and utilities.''
    ),

    (
        @test3,
        ''What is the main purpose of a test dataset?'',
        ''Train the model'',
        ''Tune every model parameter'',
        ''Evaluate final model performance'',
        ''Create new features only'',
        ''C'',
        ''The test dataset is used to evaluate the final model on unseen data.''
    );

END;


/* =========================================================
   FRONTEND DEVELOPER - 5 QUESTIONS
   ========================================================= */

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.test_questions
    WHERE test_id = @test4
)
BEGIN

    INSERT INTO dbo.test_questions
    (
        test_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation
    )
    VALUES

    (
        @test4,
        ''Which HTML element is used to create a hyperlink?'',
        ''<link>'',
        ''<a>'',
        ''<href>'',
        ''<url>'',
        ''B'',
        ''The <a> element creates hyperlinks in HTML.''
    ),

    (
        @test4,
        ''Which CSS property changes the text color?'',
        ''font-color'',
        ''text-color'',
        ''color'',
        ''foreground'',
        ''C'',
        ''The color property controls the text color in CSS.''
    ),

    (
        @test4,
        ''Which technology is used to build component-based user interfaces?'',
        ''React'',
        ''SQL'',
        ''Docker'',
        ''Git'',
        ''A'',
        ''React is a library for building component-based user interfaces.''
    ),

    (
        @test4,
        ''Which CSS layout system is useful for one-dimensional layouts?'',
        ''Flexbox'',
        ''SQL Grid'',
        ''DOM'',
        ''JSON'',
        ''A'',
        ''Flexbox is designed primarily for one-dimensional layouts.''
    ),

    (
        @test4,
        ''Which language adds behavior and interactivity to web pages?'',
        ''HTML'',
        ''CSS'',
        ''JavaScript'',
        ''SQL'',
        ''C'',
        ''JavaScript is commonly used to add behavior and interactivity to web pages.''
    );

END;


/* =========================================================
   VERIFICATION
   ========================================================= */

SELECT
    tq.question_id,
    tq.test_id,
    t.test_name,
    tq.question_text,
    tq.correct_option
FROM dbo.test_questions tq
INNER JOIN dbo.tests t
    ON t.test_id = tq.test_id
ORDER BY tq.test_id, tq.question_id;

');