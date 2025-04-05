import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaMicrophone, FaRobot } from "react-icons/fa"; // Import microphone and AI voice icons
import { useNavigate } from "react-router-dom";
import "../../src/SelfIntroduction.css"; // Ensure this CSS file matches the ProfileUpdate page styling

const SelfIntroduction = () => {
  const [status, setStatus] = useState("Loading...");
  const [timer, setTimer] = useState(30);
  const [isRecording, setIsRecording] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false); // For blinking effect
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  const BACKEND_URL = "http://localhost:8000/api";

  useEffect(() => {
    initiateSelfIntro();
  }, []);

  const initiateSelfIntro = async () => {
    try {
      setStatus("Starting self-introduction...");
      setIsBlinking(true); // Start blinking effect

      const startRes = await axios.post(`${BACKEND_URL}/startSelfIntroduction/`);
      const startFile = startRes.data.ai_prompt;
      const startAudio = new Audio(`http://localhost:8000/static/${startFile}`);
      startAudio.play();

      startAudio.onended = async () => {
        setIsBlinking(false); // Stop blinking effect
        setStatus("Recording your introduction...");
        setIsRecording(true);
        await startRecording();

        setTimeout(async () => {
          const audioBlob = await stopRecording();

          const formData = new FormData();
          formData.append("audio_file", audioBlob, "intro.wav");

          const sttRes = await axios.post(`${BACKEND_URL}/speechToText/`, formData);
          const transcription = sttRes.data.transcription;

          const llamaRes = await axios.post(`${BACKEND_URL}/llamaConversation/`, {
            prompt: `Please memorize this self-introduction: ${transcription}`,
          });

          setIsBlinking(true); // Start blinking effect for stopSelfIntroduction
          const stopRes = await axios.post(`${BACKEND_URL}/stopSelfIntroduction/`);
          const stopFile = stopRes.data.closing_prompt;
          const stopAudio = new Audio(`http://localhost:8000/static/${stopFile}`);
          stopAudio.play();

          stopAudio.onended = () => {
            setIsBlinking(false); // Stop blinking effect
            setIsNextEnabled(true);
          };

          setStatus("Self-introduction completed!");
        }, 30000);
      };
    } catch (error) {
      console.error("Error during self-introduction:", error);
      setStatus("Error occurred during self-introduction");
      setIsBlinking(false); // Stop blinking effect in case of error
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.start();

    let countdown = 30;
    const interval = setInterval(() => {
      countdown -= 1;
      setTimer(countdown);
      if (countdown <= 0) clearInterval(interval);
    }, 1000);
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

  const handleNext = () => {
    if (isNextEnabled) {
      navigate("/technical-round");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="top-nav">
        <div className="nav-bar">
          <button className="nav-button" onClick={() => navigate("/dashboard")}>
            Home
          </button>
          <h1 className="nav-title">AI INTERVIEW PREPARATION COACH</h1>
          <div className="nav-links">
            <button className="nav-button" onClick={() => navigate("/profile-update")}>
              Profile
            </button>
            <button className="nav-button" onClick={() => navigate("/")}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <h1 className="page-heading">Self Introduction</h1>

        <div className="ai-interaction-container">
          <FaRobot
            size={150}
            className={`ai-icon ${isBlinking ? "blinking" : ""}`} // AI voice icon with blinking effect
          />
          <p className="status-text">{status}</p>
          <div className="mic-container">
            <FaMicrophone
              size={80}
              color={isRecording ? "red" : "black"}
              className={`mic-icon ${isRecording ? "recording" : ""}`}
            />
          </div>
          {isRecording && <p className="timer">Time remaining: {timer}s</p>}
        </div>

        <div className="next-button-container">
          <button
            className={`next-button ${isNextEnabled ? "" : "disabled"}`}
            onClick={handleNext}
            disabled={!isNextEnabled}
          >
            NEXT
          </button>
        </div>
      </main>
    </div>
  );
};

export default SelfIntroduction;