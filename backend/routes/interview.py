from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel
from datetime import datetime
import os
import json
from langdetect import detect, DetectorFactory
from gtts import gTTS
from gtts.lang import tts_langs
from dotenv import load_dotenv

from backend.database import get_db
from backend.models.user import User
from backend.models.round_scores import MCQRoundScore, TechnicalRoundScore, SelfIntroductionScore
from backend.services.round_service import save_mcq_score, save_technical_score, save_intro_score, get_mcq_scores, get_technical_scores, get_self_intro_scores
from backend.services.auth_service import get_current_user

from groq import Groq
from langchain_groq import ChatGroq

DetectorFactory.seed = 0
router = APIRouter()

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY is not found. Please check your .env file.")

client = Groq(api_key=GROQ_API_KEY)
llm = ChatGroq(
    model='llama3-8b-8192',
    groq_api_key=GROQ_API_KEY,
    temperature=0.5
)

def generate_speech_from_text(text: str, file_name: str = "output_speech.mp3"):
    try:
        detected_lang = detect(text)
        available_languages = tts_langs()
        if detected_lang not in available_languages:
            detected_lang = "en"
        os.makedirs("static", exist_ok=True)
        full_path = os.path.join("static", file_name)
        tts = gTTS(text=text, lang=detected_lang)
        tts.save(full_path)
        return file_name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")


@router.post("/speechToText/")
async def speech_to_text_route(audio_file: UploadFile = File(...)):
    temp_wav_file = "temp_audio.wav"
    try:
        with open(temp_wav_file, "wb") as f:
            f.write(await audio_file.read())
        with open(temp_wav_file, "rb") as f:
            transcription = client.audio.transcriptions.create(
                file=("temp_audio.wav", f.read()),
                model="whisper-large-v3-turbo",
                response_format="json",
                language="en",
                temperature=0.0
            )
        transcribed_text = transcription.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")
    finally:
        if os.path.exists(temp_wav_file):
            os.remove(temp_wav_file)
    return {"transcription": transcribed_text}


@router.post("/textToSpeech/")
def text_to_speech_route(text: str):
    file_path = generate_speech_from_text(text)
    return {"speech_file": file_path}


class LlamaConversationRequest(BaseModel):
    prompt: str

@router.post("/llamaConversation/")
def llama_conversation(request: LlamaConversationRequest):
    try:
        response_text = llm.invoke(request.prompt)
        return {"response_text": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Llama processing error: {str(e)}")


@router.post("/startSelfIntroduction/")
async def start_self_introduction():
    try:
        prompt_text = (
            "Hello, I’m Voxa, your AI interview coach. You are about to begin the self-introduction round. "
            "You will have 30 seconds to speak. Please share your name, background, and career goals. Begin speaking after the beep."
        )
        speech_file = generate_speech_from_text(prompt_text, "intro_start.wav")
        return {"ai_prompt": speech_file}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate AI voice prompt.")


class StopSelfIntroductionRequest(BaseModel):
    transcription: str

@router.post("/stopSelfIntroduction/")
async def stop_self_introduction(
    request: StopSelfIntroductionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        feedback = get_self_intro_feedback_from_llama(request.transcription, db=db, user_id=current_user.id)
        closing_prompt = (
            "Thank you for your introduction. You may now proceed to the next round when you're ready."
        )
        speech_file = generate_speech_from_text(closing_prompt, "self_intro_stop.mp3")
        return {"closing_prompt": speech_file, "feedback": feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop self-introduction: {e}")


@router.post("/startTechnicalRound/")
async def start_technical_round():
    try:
        initial_prompt = (
            "Welcome to the technical round. I will ask you questions to assess your problem-solving and technical knowledge. "
            "Please answer confidently and clearly."
        )
        speech_file = generate_speech_from_text(initial_prompt, "technical_start.mp3")
        return {"ai_prompt": speech_file}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to start technical round.")


class GenerateTechQuestionRequest(BaseModel):
    prev_question: str = None
    prev_answer: str = None

prev_qa_list = []

@router.post("/generateTechQuestion/")
async def generate_technical_question(request: GenerateTechQuestionRequest):
    try:
        if request.prev_question and request.prev_answer:
            prev_qa_list.append({
                "question": request.prev_question,
                "answer": request.prev_answer
            })

        prompt = (
            f"Generate a short technical interview question related to software development. "
            f"Use simple wording and avoid repetition. Do not exceed 2 sentences.\n\n"
            f"Previous Q&A context: {prev_qa_list or 'None'}"
        )
        llama_response = llm.invoke(prompt)
        question_text = getattr(llama_response, "content", str(llama_response))
        speech_file = generate_speech_from_text(question_text, "technical_question.mp3")
        return {"new_question": question_text, "speech_file": speech_file}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate technical question.")


@router.post("/stopTechRound/")
async def stop_tech_round(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Stop the technical round, generate feedback, and return the closing prompt.
    """
    try:
        print(f"Stopping technical round for user: {current_user.id}")

        # Generate the closing prompt
        closing_prompt = "Awesome! You've wrapped up the technical round. Great job! Hit submit to head back to the dashboard."
        speech_file = generate_speech_from_text(closing_prompt, "technical_stop.mp3")
        print(f"✅ Generated speech file: {speech_file}")

        # Call the function to get feedback
        feedback = get_technical_feedback_from_llama(prev_qa_list, db=db, user_id=current_user.id)
        print(f"✅ Feedback from LLaMA: {feedback}")

        return {"closing_prompt": speech_file, "feedback": feedback}
    except Exception as e:
        print(f"❌ Error in /stopTechRound/: {e}")
        raise HTTPException(status_code=500, detail="Failed to stop technical round.")


@router.post("/startMCQRound/", tags=["Interview"])
async def start_mcq_round():
    try:
        prompt = (
            "Create 10 technical multiple-choice questions. Each question must include:\n"
            "- A concise question string\n"
            "- Exactly four unique options\n\n"
            "Return the result as a Python list of dicts like:\n"
            "[{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"]}, ...]"
        )
        llama_response = llm.invoke(prompt)
        questions = getattr(llama_response, "content", str(llama_response))
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating MCQs: {e}")


class SubmitMCQPayload(BaseModel):
    question: str
    answer: str

@router.post("/submitMCQ/")
async def submit_mcq(
    payload: List[SubmitMCQPayload],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit MCQ answers, evaluate them using LLaMA, and save the score and feedback.
    """
    try:
        # Construct the prompt for LLaMA
        prompt = (
            "Evaluate the following MCQ answers. For each:\n"
            "1. Check if the answer is correct.\n"
            "2. Return final result in JSON:\n"
            "{ \"score\": 8.0, \"feedback\": \"Strong performance on networking and fundamentals.\" }\n\n"
        )
        for response in payload:
            prompt += f"Question: {response.question}\nUser's Answer: {response.answer}\n\n"

        # Call LLaMA to evaluate the answers
        llama_response = llm.invoke(prompt)
        review = getattr(llama_response, "content", str(llama_response))

        print(f"✅ Raw LLaMA Response: {review}")  # Log the raw response

        # Validate and clean up the LLaMA response
        if not review.strip().startswith("{") or not review.strip().endswith("}"):
            print("❌ LLaMA response is not valid JSON. Attempting to fix...")
            review = review[review.find("{"):review.rfind("}") + 1]  # Extract the JSON part

        # Parse the response as JSON
        try:
            parsed = json.loads(review)  # Attempt to parse the response
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing LLaMA response as JSON: {e}")
            raise HTTPException(status_code=500, detail="Failed to parse LLaMA response as JSON.")

        # Save the score and feedback to the database
        save_mcq_score(user_id=current_user.id, total_score=parsed['score'], feedback=parsed['feedback'], db=db)

        return parsed
    except Exception as e:
        print(f"❌ Error in submitMCQ: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit MCQ round.")


def get_technical_feedback_from_llama(prev_qa_list: List[Dict[str, str]], db: Session, user_id: int):
    """
    Evaluate the user's technical round responses using LLaMA and save the scores.
    """
    try:
        if not prev_qa_list:
            print("❌ prev_qa_list is empty. Cannot generate feedback.")
            raise HTTPException(status_code=400, detail="No questions and answers provided for feedback.")

        # Construct the prompt for LLaMA
        prompt = (
    "You are evaluating a technical interview. Based on the candidate's answers, "
    "assign scores in the following categories:\n"
    "- communication_score (out of 10)"
    "- technical_knowledge_score (out of 10)"
    "- confidence_score (out of 10)"
    "Please analyze all answers together and provide just one overall score and one sentence of feedback (exactly 8 words).\n\n"
    "Final response should be ONLY in this exact JSON format:\n"
    "{\"communication_score\": 6.0, \"technical_knowledge_score\": 5.5, \"confidence_score\": 6.5, \"feedback\": \"Strong fundamentals, needs more depth and clarity.\"}\n\n"
    "Questions and Answers:\n"
)

        for qa in prev_qa_list:
            prompt += f"Question: {qa['question']}\nAnswer: {qa['answer']}\n\n"

        prompt += "Return response as a JSON object."

        print(f"📜 Prompt for LLaMA: {prompt}")

        # Call LLaMA to evaluate the responses
        llama_response = llm.invoke(prompt)

        # Extract the content from the response
        if hasattr(llama_response, "content"):
            evaluation_result = llama_response.content
        else:
            evaluation_result = str(llama_response)

        print(f"✅ Raw LLaMA Response: {evaluation_result}")

        # Parse the response as JSON
        try:
            evaluation_data = json.loads(evaluation_result)  # Parse JSON response
            comm_score = evaluation_data.get("communication_score", 0.0)
            tech_score = evaluation_data.get("technical_knowledge_score", 0.0)
            conf_score = evaluation_data.get("confidence_score", 0.0)
            feedback = evaluation_data.get("feedback", "No feedback provided.")
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing LLaMA response as JSON: {e}")
            raise HTTPException(status_code=500, detail="Failed to parse LLaMA response.")

        # Save the score to the database
        save_technical_score(
            user_id=user_id,
            comm=comm_score,
            tech=tech_score,
            conf=conf_score,
            feedback=feedback,
            db=db
        )

        return {
            "communication_score": comm_score,
            "technical_knowledge_score": tech_score,
            "confidence_score": conf_score,
            "feedback": feedback
        }

    except Exception as e:
        print(f"❌ Error in get_technical_feedback_from_llama(): {e}")
        raise HTTPException(status_code=500, detail=f"Error processing technical feedback: {e}")


def get_self_intro_feedback_from_llama(transcript: str, db: Session, user_id: int):
    try:
        prompt = (
            "Analyze the following self-introduction transcript. Score the candidate in JSON:\n"
            "- communication_score (out of 10)\n"
            "- confidence_score (out of 10)\n"
            "- professionalism_score (out of 10)\n"
            "- feedback (1 sentence)\n\n"
            f"Transcript:\n\"{transcript}\"\n\n"
            "Respond ONLY in this JSON format:\n"
            "{\"communication_score\": 8.5, \"confidence_score\": 9.0, "
            "\"professionalism_score\": 8.0, \"feedback\": \"Clear, confident and concise.\"}"
        )
        llama_response = llm.invoke(prompt)
        evaluation = json.loads(getattr(llama_response, "content", str(llama_response)))

        save_intro_score(
            user_id=user_id,
            comm=evaluation["communication_score"],
            conf=evaluation["confidence_score"],
            prof=evaluation["professionalism_score"],
            feedback=evaluation["feedback"],
            db=db
        )

        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in self-intro feedback: {e}")



@router.get("/interview/summary/")
async def interview_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the summary of the last 3 attempts for all interview rounds.
    """
    try:
        self_intro_scores = get_self_intro_scores(current_user.id, db)
        mcq_scores = get_mcq_scores(current_user.id, db)
        technical_scores = get_technical_scores(current_user.id, db)

        if not (self_intro_scores or mcq_scores or technical_scores):
            return {"message": "No interviews taken yet."}

        return {
            "self_intro": self_intro_scores,
            "mcq": mcq_scores,
            "technical": technical_scores,
        }
    except Exception as e:
        print(f"❌ Error in /interview/summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve interview summary.")


@router.post("/interview/overall-evaluation/")
async def overall_evaluation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate an overall evaluation score and feedback based on all rounds.
    """
    try:
        # Retrieve scores for all rounds
        self_intro_scores = get_self_intro_scores(current_user.id, db)
        mcq_scores = get_mcq_scores(current_user.id, db)
        technical_scores = get_technical_scores(current_user.id, db)

        if not (self_intro_scores or mcq_scores or technical_scores):
            raise HTTPException(status_code=400, detail="No interview data available for evaluation.")

        # Construct the prompt for LLaMA
        prompt = (
            "You are evaluating a mock interview process consisting of three rounds:\n"
            "- Self Introduction (assesses communication, confidence, and professionalism),\n"
            "- MCQ Round (assesses core technical concepts),\n"
            "- Technical Round (assesses applied knowledge, articulation, and confidence).\n\n"
            "Based on the candidate's scores and feedback from each round, assign a final interview performance score (0–100) "
            "and summarize performance in 1–2 sentences.\n\n"
            "Self Introduction Scores:\n"
            f"{self_intro_scores}\n\n"
            "MCQ Round Scores:\n"
            f"{mcq_scores}\n\n"
            "Technical Round Scores:\n"
            f"{technical_scores}\n\n"
            "Return ONLY in this JSON format:\n"
            "{\"overall_score\": 85, \"summary_feedback\": \"Excellent communication and solid technical skills. Could show more confidence under pressure.\"}"
        )

        print(f"📜 Prompt for LLaMA: {prompt}")

        # Call LLaMA to generate the overall evaluation
        llama_response = llm.invoke(prompt)
        evaluation = json.loads(getattr(llama_response, "content", str(llama_response)))

        return evaluation
    except Exception as e:
        print(f"❌ Error in /interview/overall-evaluation/: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate overall evaluation.")