import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import "../../src/MCQRound.css"; // Import the updated CSS file

const MCQRound = () => {
  const [questions, setQuestions] = useState([]); // Store the list of MCQs
  const [currentSlide, setCurrentSlide] = useState(1); // Track the current slide (1 or 2)
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Store selected answers
  const [timer, setTimer] = useState(1200); // 20-minute countdown timer

  const navigate = useNavigate(); // ✅ Initialize navigate

  useEffect(() => {
    // Fetch MCQs from the backend on component mount
    fetchQuestions();

    // Start the 20-minute timer
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleSubmit(); // Auto-submit when the timer reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown); // Cleanup the timer
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/startMCQRound/", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Extract and parse the questions string
      const rawQuestions = data.questions;
      const jsonStartIndex = rawQuestions.indexOf("["); // Find the start of the JSON array
      const jsonEndIndex = rawQuestions.lastIndexOf("]") + 1; // Find the end of the JSON array
      const questionsString = rawQuestions.slice(jsonStartIndex, jsonEndIndex); // Extract the JSON array as a string
      const parsedQuestions = JSON.parse(questionsString); // Parse the JSON string

      // Add unique IDs to each question
      const questionsWithIds = parsedQuestions.map((question, index) => ({
        ...question,
        id: index + 1,
      }));

      setQuestions(questionsWithIds); // Update the questions state
    } catch (error) {
      console.error("Error fetching MCQs:", error);
    }
  };

  const handleAnswerSelect = (questionId, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: option,
    });
  };

  const handleNextSlide = () => {
    setCurrentSlide(2); // Move to Slide 2
  };

  const handleSubmit = async () => {
    try {
      // Prepare the payload with questions and selected answers
      const payload = questions.map((question) => ({
        question: question.question,
        answer: selectedAnswers[question.id] || "", // Use an empty string if no answer is selected
      }));

      console.log("Payload being sent:", payload);

      // Validate payload before sending
      if (payload.length === 0) {
        console.error("No questions or answers to submit!");
        return;
      }

      // Call the submitMCQ API
      const response = await fetch("http://localhost:8000/api/submitMCQ/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error details from server:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("MCQ round submitted successfully!");

      // Navigate to the technical round page
      navigate("/technical-round"); // ✅ Use navigate to redirect
    } catch (error) {
      console.error("Error submitting MCQ round:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const getTimerColor = () => {
    if (timer > 600) return "green"; // More than 10 minutes
    if (timer > 300) return "orange"; // Between 10 and 5 minutes
    return "red"; // Less than 5 minutes
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  if (questions.length === 0) {
    return <div id="mcq-loading">Loading questions...</div>;
  }

  const slideQuestions =
    currentSlide === 1 ? questions.slice(0, 5) : questions.slice(5, 10);

  return (
    <div id="mcq-container">
      <main id="mcq-main-content">
        <h1 id="mcq-heading">MCQ Round</h1>
        <p id="mcq-timer" style={{ color: getTimerColor() }}>
          Time remaining: {formatTime(timer)}
        </p>
        <p id="mcq-progress">You’ve answered {answeredCount}/10 questions</p>

        <div id="mcq-questions">
          {slideQuestions.map((question) => (
            <div key={question.id} className="mcq-question-block">
              <p className="mcq-question-text">
                {question.id}. {question.question}
              </p>
              <ul className="mcq-options">
                {question.options.map((option, index) => (
                  <li
                    key={index}
                    className={`mcq-option ${
                      selectedAnswers[question.id] === option ? "mcq-selected" : ""
                    }`}
                    onClick={() => handleAnswerSelect(question.id, option)}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div id="mcq-navigation">
          {currentSlide === 1 && (
            <button className="mcq-next-button" onClick={handleNextSlide}>
              Next
            </button>
          )}
          {currentSlide === 2 && (
            <button className="mcq-submit-button" onClick={handleSubmit}>
              Submit
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default MCQRound;