import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaMicrophone, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../src/SelfIntroduction.css";

const SelfIntroduction = () => {
  const [status, setStatus] = useState("Loading...");
  const [timer, setTimer] = useState(30);
  const [isRecording, setIsRecording] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [audio, setAudio] = useState(null);
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
      setIsBlinking(true);

      const startRes = await axios.post(`${BACKEND_URL}/startSelfIntroduction/`);
      const startFile = startRes.data.ai_prompt;
      const startAudio = new Audio(`http://localhost:8000/static/${startFile}`);
      setAudio(startAudio);

      startAudio.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });

      startAudio.onended = async () => {
        setIsBlinking(false);
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

          setIsBlinking(true);
          const stopRes = await axios.post(`${BACKEND_URL}/stopSelfIntroduction/`);
          const stopFile = stopRes.data.closing_prompt;
          const stopAudio = new Audio(`http://localhost:8000/static/${stopFile}`);
          stopAudio.play();

          stopAudio.onended = () => {
            setIsBlinking(false);
            setIsNextEnabled(true);
          };

          setStatus("Self-introduction completed!");
        }, 30000);
      };
    } catch (error) {
      console.error("Error during self-introduction:", error);
      setStatus("Error occurred during self-introduction");
      setIsBlinking(false);
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
      navigate("/mcq-round");
    }
  };

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
        <h1 className="page-heading">Self Introduction</h1>

        <div className="ai-interaction-container">
          <FaRobot
            size={150}
            className={`ai-icon ${isBlinking ? "blinking" : ""}`}
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