from fastapi import APIRouter, File, UploadFile, HTTPException
import os
from dotenv import load_dotenv
from groq import Groq
from langchain_groq import ChatGroq
from typing import List, Dict
from pydantic import BaseModel
from gtts import gTTS
from langdetect import detect, DetectorFactory
from gtts.lang import tts_langs
import os
import ast
import platform
import json
import pinecone
from sentence_transformers import SentenceTransformer
from llama_cpp import Llama
import random
from pinecone import Pinecone, ServerlessSpec
from fastapi import Query

# Initialize Pinecone with your API key
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))

# Create or connect to index
index_name = 'mockinterviewvector'
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=384,  # or 768 depending on your embedding model
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-west-2")
    )

# Connect to the index
index = pc.Index(index_name)
# Fix deterministic output for langdetect
DetectorFactory.seed = 0

# Load .env variables
load_dotenv()

router = APIRouter()

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

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
class StopSelfIntroductionRequest(BaseModel):
    transcription: str

@router.post("/stopSelfIntroduction/")
async def stop_self_introduction(request: StopSelfIntroductionRequest):
    """
    Stop the self-introduction and evaluate the user's transcript.

    Args:
        request (StopSelfIntroductionRequest): The transcription of the user's self-introduction.

    Returns:
        Dict: A dictionary containing evaluation scores and feedback.
    """
    try:
        # Get the transcription from the request
        transcription = request.transcription

        # Call the helper function to evaluate the transcript
        feedback = get_self_intro_feedback_from_llama(transcription)

        # Generate the closing prompt audio
        closing_prompt = "Your self-introduction is complete. Please proceed to the next round."
        speech_file = generate_speech_from_text(closing_prompt, "self_intro_stop.mp3")
        print("feedback: ", feedback)
        return {"closing_prompt": speech_file}

    except Exception as e:
        print(f"❌ Error in /stopSelfIntroduction/: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop self-introduction: {e}")

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
        feedback = get_technical_feedback_from_llama(prev_qa_list)  # Call the function to get feedback
        return {"closing_prompt": speech_file,"feedback": feedback}
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

# ✅ Updated Model
class SubmitMCQPayload(BaseModel):
    question: str
    answer: str

# ✅ POST /submitMCQ
@router.post("/submitMCQ/")
async def submit_mcq(payload: List[SubmitMCQPayload]):
    try:
        prompt = (
            "Task: Review the following 10 MCQ answers submitted by a user. Based on correctness:\n"
            "1. Calculate and return the score (out of 10).\n"
            "2. Give one sentence (in just 5 words) of feedback summarizing the user’s performance — mention what they’re good at or what to improve.\n"
            "Format the response as:\n"
            "'score: 4, feedback: feedback in 5 words'\n\n"
        )

        for response in payload:
            prompt += (
                f"Question: {response.question}\n"
                f"User's Answer: {response.answer}\n\n"
            )

        print("📜 Final Prompt for LLaMA:", prompt)
        print("Sending prompt to LLaMA for review...")

        llama_response = llm.invoke(prompt)

        # Extract the content from the response
        if hasattr(llama_response, "content"):
            review = llama_response.content
        else:
            review = str(llama_response)

        print("✅ Review from LLaMA:", review)
        return review  # Return the raw string response

    except Exception as e:
        print(f"❌ Error in submitMCQ: {e}")
        return f"Error: {e}"

def get_technical_feedback_from_llama(prev_qa_list: List[Dict[str, str]]):
    """
    Evaluate the user's technical round responses using LLaMA.

    Args:
        prev_qa_list (List[Dict[str, str]]): A list of dictionaries containing question-answer pairs.
    """
    try:
        # Construct the prompt for LLaMA
        prompt = (
            "Evaluate the following technical interview responses and score the candidate based on: Questions and Answers given by candiate and on below\n"
            "1. Communication Score (out of 10) – clarity of explanation.\n"
            "2. Technical Knowledge Score (out of 10) – accuracy and understanding.\n"
            "3. Confidence Score (out of 10) – completeness and assertiveness of the answer.\n\n"
            "Provide a one-sentence feedback summarizing the overall performance.\n\n"
            "Questions and Answers:\n"
        )

        for qa in prev_qa_list:
            prompt += f"Question: {qa['question']}\nAnswer: {qa['answer']}\n\n"

        prompt += "Return response as a string."

        print(f"📜 Prompt for LLaMA: {prompt}")

        # Call LLaMA to evaluate the responses
        llama_response = llm.invoke(prompt)

        # Extract the content from the response
        if hasattr(llama_response, "content"):
            evaluation_result = llama_response.content
        else:
            evaluation_result = str(llama_response)

        print(f"✅ Raw LLaMA Response: {evaluation_result}")
        return evaluation_result  # Return the raw string response

    except Exception as e:
        print(f"❌ Error in get_technical_feedback_from_llama(): {e}")
        return f"Error: {e}"

import json
from typing import Dict
from fastapi import HTTPException

def get_self_intro_feedback_from_llama(transcript: str):
    """
    Evaluate the user's self-introduction transcript using LLaMA.

    Args:
        transcript (str): The user's self-introduction transcript.
    """
    try:
        # Construct the prompt for LLaMA
        prompt = (
            "Evaluate the following self-introduction transcript from a candidate and return:\n"
            "- communication_score (out of 10)\n"
            "- confidence_score (out of 10)\n"
            "- professionalism_score (out of 10)\n"
            "- feedback (in 1 sentence)\n\n"
            f"Transcript:\n\"{transcript}\"\n\n"
            "Return response as a string."
        )

        print(f"📜 Prompt for LLaMA: {prompt}")

        # Call LLaMA to evaluate the transcript
        llama_response = llm.invoke(prompt)

        # Extract the content from the response
        if hasattr(llama_response, "content"):
            evaluation_result = llama_response.content
        else:
            evaluation_result = str(llama_response)

        print(f"✅ Raw LLaMA Response: {evaluation_result}")
        return evaluation_result  # Return the raw string response

    except Exception as e:
        print(f"❌ Error in get_self_intro_feedback_from_llama(): {e}")
        return f"Error: {e}"

class RoleRequest(BaseModel):
    role: str

@router.post("/generateQuestionsForRole/") #Rag Implemented Technical Questions
async def generate_questions_for_role(request: RoleRequest):
    print(f"🔍 Function called for role: {request.role}")  # Debugging line
    try:
        # Step 1: Embed role and query Pinecone
        print(f"🔍 Retrieving relevant data for role: {request.role}")
        query_embedding = embedding_model.encode(request.role).tolist()
        results = index.query(vector=query_embedding, top_k=5, include_metadata=True)
        print(f"🔍 Pinecone query result: {results}")

        # Step 2: Collect questions from metadata
        retrieved_context = []
        for match in results["matches"]:
            question = match["metadata"].get("question")
            if question:
                retrieved_context.append(question)

        if not retrieved_context:
            raise HTTPException(status_code=404, detail="No relevant data found for the given role.")

        # Step 3: Format context and build prompt
        print(f"📝 Generating questions using LLaMA for role: {request.role}")
        context_str = "\n".join(f"- {q}" for q in retrieved_context)
        prompt = (
            f"You are an AI assistant tasked with generating 5 technical questions for the role of '{request.role}'. "
        )

        # Step 4: Generate response
        llama_response = llm.invoke(prompt)  # Use invoke for Llama
        print(f"📝 Llama response: {llama_response}")

        # Step 5: Extract generated text
        if hasattr(llama_response, "content"):
            questions = llama_response.content.strip()
        else:
            questions = str(llama_response).strip()

        print(f"✅ Generated questions: {questions}")
        return {"questions": questions}

    except Exception as e:
        print(f"❌ Error in /generateQuestionsForRole/: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions for role: {str(e)}")

@router.post("/mcqrag/") #Rag Implemented MCQs
async def generate_questions_for_role(request: RoleRequest):
    print(f"🔍 Function called for role: {request.role}")  # Debugging line
    try:
        # Step 1: Embed role and query Pinecone
        print(f"🔍 Retrieving relevant data for role: {request.role}")
        query_embedding = embedding_model.encode(request.role).tolist()
        results = index.query(vector=query_embedding, top_k=5, include_metadata=True)
        print(f"🔍 Pinecone query result: {results}")

        # Step 2: Collect questions from metadata
        retrieved_context = []
        for match in results["matches"]:
            question = match["metadata"].get("question")
            if question:
                retrieved_context.append(question)

        if not retrieved_context:
            raise HTTPException(status_code=404, detail="No relevant data found for the given role.")

        # Step 3: Format context and build prompt
        print(f"📝 Generating questions using LLaMA for role: {request.role}")
        context_str = "\n".join(f"- {q}" for q in retrieved_context)
        prompt = (
            f"You are an AI assistant tasked with generating 10 technical questions for the role of '{request.role}'. "
            f"Use the following context to guide your question generation:\n\n"
            f"{context_str}\n\n"
            f"Format the result as a list of dictionaries like this:\n"
            f"[{{'question': '...', 'options': ['A', 'B', 'C', 'D']}}, ...]"
        )

        # Step 4: Generate response
        llama_response = llm.invoke(prompt)  # Use invoke for Llama
        print(f"📝 Llama response: {llama_response}")

        # Step 5: Extract generated text
        if hasattr(llama_response, "content"):
            questions = llama_response.content.strip()
        else:
            questions = str(llama_response).strip()

        print(f"✅ Generated questions: {questions}")
        return {"questions": questions}

    except Exception as e:
        print(f"❌ Error in /generateQuestionsForRole/: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions for role: {str(e)}")

# Request body model for answers
class UserAnswer(BaseModel):
    question: str
    answer: str

class MCQScoreResponse(BaseModel):
    total_questions: int
    correct_answers: int
    score_percentage: float

@router.post("/mcqScores/")
async def mcq_scores(user_answers: List[UserAnswer], role: str):
    print(f"🔍 Scoring user answers for role: {role}")  # Debugging line
    try:
        # Debugging check if user_answers is received correctly
        print(f"Received user_answers: {user_answers}")

        # Placeholder logic to simulate scoring
        total_questions = len(user_answers)
        correct_answers = 0  # Logic for checking answers goes here
        score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

        response = MCQScoreResponse(
            total_questions=total_questions,
            correct_answers=correct_answers,
            score_percentage=score_percentage
        )

        return response

    except Exception as e:
        print(f"❌ Error in /mcqScores/: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to score answers for role: {str(e)}")
class FeedbackRequest(BaseModel):
    question: str
    user_answer: str

@router.post("/generateFeedbackForAnswer/") #Rag Implemented Feedback
async def generate_feedback_for_answer(request: FeedbackRequest):
    try:
        print(f"🎤 Received answer for feedback: {request.user_answer}")

        # Step 1: Embed the user's answer
        user_embedding = embedding_model.encode(request.user_answer).tolist()
        
        # Step 2: Query Pinecone for similar expert answers
        results = index.query(vector=user_embedding, top_k=5, include_metadata=True)
        print(f"🔍 Pinecone results: {results}")
        
        # Step 3: Extract ideal answers
        retrieved_context = "\n".join(
            f"- {match['metadata']['answer']}" 
            for match in results["matches"] 
            if "answer" in match["metadata"]
        )

        if not retrieved_context:
            raise HTTPException(status_code=404, detail="No relevant feedback data found.")

        # Step 4: Build prompt
        prompt = f"""
        You are an AI interview coach.

        The candidate was asked: "{request.question}"

        Candidate's response:
        "{request.user_answer}"

        Here are similar expert answers:
        {retrieved_context}

        Please provide clear, constructive feedback comparing the candidate’s response to the expert responses. 
        Mention:
        - How well the answer aligns with best practices
        - What is good about the response
        - What can be improved
        Be concise and actionable.
        Keep it second person perspective.
        """

        # Step 5: Generate feedback using LLaMA
        llama_response = llm.invoke(prompt)
        feedback = llama_response.content if hasattr(llama_response, "content") else str(llama_response)

        print(f"✅ Feedback: {feedback}")
        return {"feedback": feedback}

    except Exception as e:
        print(f"❌ Error generating feedback: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating feedback: {str(e)}")


