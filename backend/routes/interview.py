from fastapi import APIRouter, File, UploadFile, HTTPException
import os
from dotenv import load_dotenv
from groq import Groq
from langchain_groq import ChatGroq
from typing import List
from pydantic import BaseModel
from gtts import gTTS
from langdetect import detect, DetectorFactory
from gtts.lang import tts_langs
import os
import ast
import platform

# Fix deterministic output for langdetect
DetectorFactory.seed = 0

# Load .env variables
load_dotenv()

router = APIRouter()

# Setup Groq Client
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
        # Detect language
        detected_lang = detect(text)
        available_languages = tts_langs()

        # Check if detected language is supported by gTTS
        if detected_lang not in available_languages:
            print(f"⚠️ Detected language '{detected_lang}' is not supported by gTTS. Defaulting to English.")
            detected_lang = "en"

        print(f"✅ Detected Language: {available_languages[detected_lang]} ({detected_lang})")

        # Generate speech using gTTS
        os.makedirs("static", exist_ok=True)
        full_path = os.path.join("static", file_name)
        tts = gTTS(text=text, lang=detected_lang)
        tts.save(full_path)

        print(f"✅ Audio file generated: {full_path}")
        return file_name
    except Exception as e:
        print(f"❌ Error in generate_speech_from_text(): {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")


# 1. Speech-to-Text
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

# 2. Text-to-Speech (Optional Utility)
@router.post("/textToSpeech/")
def text_to_speech_route(text: str):
    file_path = generate_speech_from_text(text)
    return {"speech_file": file_path}

# 3. Llama Conversation
class LlamaConversationRequest(BaseModel):
    prompt: str

@router.post("/llamaConversation/")
def llama_conversation(request: LlamaConversationRequest):
    try:
        response_text = llm.invoke(request.prompt)
        return {"response_text": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Llama processing error: {str(e)}")

# 4. Start Self Introduction
@router.post("/startSelfIntroduction/")
async def start_self_introduction():
    try:
        prompt_text = "   Hello, I'm Voxa, your AI interview coach for today's mock interview. I'll be guiding you through a series of interview rounds designed to assess your skills and experience. Let's get started!! You have 30 seconds to complete your self-introduction. Please start!"
        speech_file = generate_speech_from_text(prompt_text, "intro_start.wav")
        print(f"✅ Generated file: {speech_file}")
        return {"ai_prompt": speech_file}
    except Exception as e:
        print(f"🔥 ERROR in /startSelfIntroduction/: {e}")  # <== Add this
        raise HTTPException(status_code=500, detail="Failed to generate AI voice prompt.")

# 5. Stop Self Introduction
@router.post("/stopSelfIntroduction/")
def stop_self_intro():
    try:
        closing_prompt = "Your self-introduction is done now. You can click on Next to start your technical round."
        speech_file = generate_speech_from_text(closing_prompt, "intro_stop.wav")
        return {"closing_prompt": speech_file}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate closing prompt.")



# 6. Start Technical Round
@router.post("/startTechnicalRound/")
async def start_technical_round():
    try:
        # Use Llama to generate the initial prompt for the technical round
        initial_prompt = (
            "Hey, Hello again now we will get started the technical round to get to know about your technical skills!."
        )
        print(f"📜 Prompt for Llama: {initial_prompt}")

        # Convert the introduction to speech
        speech_file = generate_speech_from_text(initial_prompt, "technical_start.mp3")
        print(f"🎵 Generated speech file: {speech_file}")

        return {"ai_prompt": speech_file}
    except Exception as e:
        print(f"❌ Error in /startTechnicalRound/: {e}")
        raise HTTPException(status_code=500, detail="Failed to start technical round.")

# 7. Generate Technical Question
class GenerateTechQuestionRequest(BaseModel):
    prev_question: str = None
    prev_answer: str = None

# Global list to store previous questions and answers
prev_qa_list = []

@router.post("/generateTechQuestion/")
async def generate_technical_question(request: GenerateTechQuestionRequest):
    try:
        # Append the previous question and answer to the global list
        if request.prev_question and request.prev_answer:
            prev_qa_list.append({
                "question": request.prev_question,
                "answer": request.prev_answer
            })
            print(f"📜 Updated prev_qa_list: {prev_qa_list}")

        # Delete the previous technical question audio file if it exists
        previous_file = "static/technical_question.mp3"
        if os.path.exists(previous_file):
            os.remove(previous_file)
            print(f"🗑️ Deleted previous file: {previous_file}")

        # Use Llama to generate a new question based on the previous question and answer
        prompt = (
            f"Based on the previous question and answer, generate a new and unique technical question. and do not use more than 3 sentances. "
            f"Previous question and asnwer list: {prev_qa_list or 'None'}. "
        )
        print(f"📜 Prompt for Llama: {prompt}")

        # Call Llama to generate the question
        llama_response = llm.invoke(prompt)

        # Extract the content from the AIMessage object
        if hasattr(llama_response, "content"):
            question_text = llama_response.content
        else:
            question_text = str(llama_response)  # Fallback to string conversion if content is not present

        print(f"✅ Llama-generated question: {question_text}")

        # Convert the generated question to speech
        speech_file = generate_speech_from_text(question_text, "technical_question.mp3")
        print(f"🎵 Generated speech file: {speech_file}")

        return {"new_question": question_text, "speech_file": speech_file}
    except Exception as e:
        print(f"❌ Error in /generateTechQuestion/: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate technical question.")

# 8. Stop Technical Round
@router.post("/stopTechRound/")
def stop_technical_round():
    try:
        closing_prompt = "Your technical round is done now. Please click on the Next button to move forward."
        speech_file = generate_speech_from_text(closing_prompt, "technical_stop.mp3")

        return {"closing_prompt": speech_file}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to stop technical round.")
    

@router.get("/test-mcq")
def test_mcq():
    return {"message": "MCQ route is working"}


# ✅ POST /startMCQRound
@router.post("/startMCQRound/", tags=["Interview"])
async def start_mcq_round():
    try:
        print("Starting MCQ Round...")  # Debugging
        prompt = (
            "Generate 10 technical multiple-choice questions. Each question should include "
            "a question text and exactly 4 options. Format the result as a list of dictionaries: "
            "[{\"question\": ..., \"options\": [...]}, ...]"
        )

        print("Sending prompt to LLaMA...")
        llama_response = llm.invoke(prompt)
        print("Raw LLaMA response:", llama_response)

        # Get the response as a string
        questions = getattr(llama_response, "content", str(llama_response))
        print("Returning questions as string:", questions)

        # Wrap the string in a JSON object
        return {"questions": questions}

    except Exception as e:
        print("Error in start_mcq_round:", e)
        raise HTTPException(status_code=500, detail=f"Error generating questions: {e}")


# ✅ Models
class MCQResponse(BaseModel):
    id: int
    question: str
    options: List[str]
    selected_answer: str

class SubmitMCQPayload(BaseModel):
    responses: List[MCQResponse]


# ✅ POST /submitMCQ
@router.post("/submitMCQ/")
async def submit_mcq(payload: SubmitMCQPayload):
    try:
        prompt = (
            "Here are 10 MCQs and the user's answers. Please review them and return a feedback summary "
            "including correct/incorrect flags and suggestions if possible.\n\nQuestions and Answers:\n"
        )

        for response in payload.responses:
            prompt += (
                f"Question: {response.question}\n"
                f"Options: {', '.join(response.options)}\n"
                f"User's Answer: {response.selected_answer}\n\n"
            )

        llama_response = llm.invoke(prompt)
        review = getattr(llama_response, "content", str(llama_response))

        return {"review": review}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing responses: {e}")
