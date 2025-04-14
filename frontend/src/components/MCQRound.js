import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/SelfIntroduction.css"; // Reuse the same CSS file

const MCQRound = () => {
  const [questions, setQuestions] = useState([]); // Store the list of MCQs
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the current question
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Store selected answers
  const [timer, setTimer] = useState(10); // Timer for each question
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch MCQs from the backend or use a static list
    fetchQuestions();
  }, []);

  useEffect(() => {
    // Start a 10-second timer for each question
    if (currentQuestionIndex < questions.length) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            handleNext(); // Auto-submit the current question
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown); // Cleanup the timer
    }
  }, [currentQuestionIndex, questions]);

  const fetchQuestions = async () => {
    try {
      // Replace with your backend API call
      const response = await fetch("http://localhost:8000/api/getMCQs");
      const data = await response.json();
      setQuestions(data.questions || []); // Assuming the API returns a `questions` array
    } catch (error) {
      console.error("Error fetching MCQs:", error);
      setQuestions([
        // Static fallback questions
        {
          id: 1,
          question: "What is the capital of France?",
          options: ["Paris", "London", "Berlin", "Madrid"],
        },
        {
          id: 2,
          question: "Which programming language is used for web development?",
          options: ["Python", "JavaScript", "C++", "Java"],
        },
        // Add more static questions as needed
      ]);
    }
  };

  const handleAnswerSelect = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentQuestionIndex].id]: option,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(10); // Reset the timer for the next question
    } else {
      handleSubmit(); // Submit answers after the last question
    }
  };

  const handleSubmit = async () => {
    try {
      // Submit the answers to the backend
      const response = await fetch("http://localhost:8000/api/submitMCQs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      const result = await response.json();
      console.log("Submission result:", result);

      // Navigate to the next phase or show a success message
      navigate("/results"); // Replace with the actual next route
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="dashboard-container">
      <header className="toolbar">
        <div className="toolbar-logo">
          <img src="/AI_INT.png" alt="Logo" className="logo" />
        </div>
        <div className="toolbar-title">AI INTERVIEW PREPARATION COACH</div>
        <div className="toolbar-links">
          <button className="toolbar-link" onClick={() => navigate("/dashboard")}>
            Home
          </button>
          <button className="toolbar-link" onClick={() => navigate("/profile-update")}>
            Profile
          </button>
          <button className="toolbar-link" onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <h1 className="page-heading">MCQ Round</h1>

        <div className="mcq-container">
          <p className="question-text">{currentQuestion.question}</p>
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  selectedAnswers[currentQuestion.id] === option ? "selected" : ""
                }`}
                onClick={() => handleAnswerSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="timer">Time remaining: {timer}s</p>
        </div>

        <div className="navigation-buttons">
          {currentQuestionIndex < questions.length - 1 && (
            <button className="next-button gradient-button" onClick={handleNext}>
              Next
            </button>
          )}
          {currentQuestionIndex === questions.length - 1 && (
            <button className="submit-button gradient-button" onClick={handleSubmit}>
              Submit
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default MCQRound;