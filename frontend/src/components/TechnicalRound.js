import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaMicrophone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../src/SelfIntroduction.css";

const TechnicalRound = () => {
  const [status, setStatus] = useState("Loading...");
  const [timer, setTimer] = useState(10);
  const [isRecording, setIsRecording] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [prevQA, setPrevQA] = useState({ prev_question: "", prev_answer: "" });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isNextVisible, setIsNextVisible] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  const BACKEND_URL = "http://localhost:8000/api";

  useEffect(() => {
    startTechnicalRound();
  }, []);

  useEffect(() => {
    if (questionCount > 0 && questionCount < 6) {
      askQuestion();
    }
  }, [questionCount]);

  const startTechnicalRound = async () => {
    try {
      setStatus("Starting technical round...");
      const startRes = await axios.post(`${BACKEND_URL}/startTechnicalRound/`);
      const startFile = startRes.data.ai_prompt;
      const startAudio = new Audio(`http://localhost:8000/static/${startFile}?t=${Date.now()}`);
      setIsPlayingAudio(true);
      startAudio.play();

      startAudio.onended = () => {
        setIsPlayingAudio(false);
        setStatus("Technical round started. Preparing first question...");
        askQuestion();
      };
    } catch (error) {
      console.error("Error during startTechnicalRound:", error);
      setStatus("Error occurred during technical round preparation");
    }
  };

  const askQuestion = async () => {
    if (questionCount >= 5) {
      stopTechnicalRound();
      return;
    }

    try {
      setStatus(`Asking question ${questionCount + 1}...`);
      const questionRes = await axios.post(`${BACKEND_URL}/generateTechQuestion/`, prevQA);
      const questionText = questionRes.data.new_question;
      const questionFile = questionRes.data.speech_file;

      const questionAudio = new Audio(`http://localhost:8000/static/${questionFile}?t=${Date.now()}`);
      setIsPlayingAudio(true);
      questionAudio.play();

      questionAudio.onended = () => {
        setIsPlayingAudio(false);
        setStatus(`Recording answer for question ${questionCount + 1}...`);
        startRecording();

        let countdown = 10;
        setTimer(countdown);
        const timerInterval = setInterval(() => {
          countdown -= 1;
          setTimer(countdown);
          if (countdown <= 0) {
            clearInterval(timerInterval);
            stopRecordingAndProceed(questionText);
          }
        }, 1000);
      };
    } catch (error) {
      console.error("Error during generateTechQuestion:", error);
      setStatus("Error occurred while generating question");
    }
  };

  const stopRecordingAndProceed = async (questionText) => {
    try {
      const audioBlob = await stopRecording();

      const formData = new FormData();
      formData.append("audio_file", audioBlob, `answer_${questionCount + 1}.wav`);
      const sttRes = await axios.post(`${BACKEND_URL}/speechToText/`, formData);
      const transcription = sttRes.data.transcription;

      console.log("Question: ", questionText);
      console.log("Transcription: ", transcription);
      setPrevQA({ prev_question: questionText, prev_answer: transcription });

      setQuestionCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error during stopRecordingAndProceed:", error);
      setStatus("Error occurred while processing the answer");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setStatus("Error accessing microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        resolve(audioBlob);
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    });
  };

  const stopTechnicalRound = async () => {
    try {
      setStatus("Stopping technical round...");
      const stopRes = await axios.post(`${BACKEND_URL}/stopTechRound/`);
      const stopFile = stopRes.data.closing_prompt;
      const stopAudio = new Audio(`http://localhost:8000/static/${stopFile}?t=${Date.now()}`);
      setIsPlayingAudio(true);
      stopAudio.play();

      stopAudio.onended = () => {
        setIsPlayingAudio(false);
        setStatus("Technical round completed!");
        setIsNextVisible(true);
      };
    } catch (error) {
      console.error("Error during stopTechnicalRound:", error);
      setStatus("Error occurred while stopping technical round");
    }
  };

  const handleNext = () => {
    navigate("/dashboard"); // Navigate to the dashboard or next page
  };

  return (
    <div className="dashboard-container">
      <header className="toolbar">
        <div className="toolbar-logo">
          <img src="/AI_INT.png" alt="Logo" className="logo" />
        </div>
        <div className="toolbar-title">AI INTERVIEW PREPARATION COACH</div>
        <div className="toolbar-links">
          <button className="toolbar-link" onClick={() => navigate("/dashboard")}>Home</button>
          <button className="toolbar-link" onClick={() => navigate("/profile-update")}>Profile</button>
          <button className="toolbar-link" onClick={() => navigate("/")}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <h1 className="page-heading">Technical Round</h1>

        <div className="ai-interaction-container">
          <div className="ai-icon-container">
            <div className={`ai-icon ${isPlayingAudio ? "blinking" : ""}`}></div>
          </div>
          <p className="status-text">{status}</p>
          <div className="mic-container">
            <FaMicrophone size={80} color={isRecording ? "red" : "black"} className={`mic-icon ${isRecording ? "recording" : ""}`} />
          </div>
          {isRecording && <p className="timer">Time remaining: {timer}s</p>}
        </div>

        {isNextVisible && (
          <div className="next-button-container">
            <button className="next-button" onClick={handleNext}>SUBMIT</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TechnicalRound;
