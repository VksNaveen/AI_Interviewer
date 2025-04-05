from fastapi import APIRouter, File, UploadFile, HTTPException
import os
from dotenv import load_dotenv
from groq import Groq
from langchain_groq import ChatGroq
from typing import List
from pydantic import BaseModel

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

def generate_speech_from_text(text: str, file_name: str = "output_speech.wav"):
    try:
        os.makedirs("static", exist_ok=True)
        full_path = os.path.join("static", file_name)
        print(f"📝 Generating speech: '{text}' → {full_path}")

        response = client.audio.speech.create(
            model="playai-tts",
            voice="Fritz-PlayAI",
            input=text,
            response_format="wav"
        )

        response.write_to_file(full_path)
        print("✅ Audio written to file:", full_path)
        return file_name
    except Exception as e:
        print("🔥 ERROR in generate_speech_from_text():", e)
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
        prompt_text = "You have 30 seconds to complete your self-introduction. Please start!"
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
