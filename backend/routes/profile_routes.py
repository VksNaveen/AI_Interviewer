from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.profile import Profile
from backend.models.user import User
from backend.services.auth_service import verify_jwt_token, get_current_user
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ Define Token Model
class TokenModel(BaseModel):
    token: str

# ✅ Define Profile Update Model
class ProfileUpdateModel(BaseModel):
    experience: Optional[int] = None
    skills: Optional[List[str]] = None
    preferred_role: Optional[str] = None
    interest_area: Optional[str] = None
    education: Optional[str] = None
    degree: Optional[str] = None
    certifications: Optional[str] = None
    projects: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    expected_salary: Optional[int] = None
    location_preference: Optional[str] = None

# ✅ GET Profile (For React, Using Token in Headers)
@router.get("/", tags=["Profile Management"])
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        return {"message": "Profile not found"}

    return {
        "user_id": profile.user_id,
        "company_experience": profile.company_experience,
        "skills": profile.skills,
        "preferred_role": profile.preferred_role,
        "education": profile.education,
        "certifications": profile.certifications,
        "resume_file": profile.resume_file,
    }

# ✅ POST Profile (For Postman Testing, Using JSON Token)
@router.post("/", tags=["Profile Management"])
def get_profile_with_token(token_data: TokenModel, db: Session = Depends(get_db)):
    token = token_data.token
    payload = verify_jwt_token(token)

    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Token")

    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        return {"message": "Profile not found", "skills": []}

    return profile

# ✅ PUT Profile (Update Profile)
@router.put("/", tags=["Profile Management"])
def update_profile(
    company_experience: list[dict] = Form(...),
    skills: list[str] = Form(...),
    preferred_role: str = Form(...),
    education: list[dict] = Form(...),
    certifications: list[str] = Form(...),
    resume: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        # Create a new profile if it doesn't exist
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    # Update profile fields
    profile.company_experience = company_experience
    profile.skills = skills
    profile.preferred_role = preferred_role
    profile.education = education
    profile.certifications = certifications

    # Handle resume upload
    if resume:
        resume_path = f"uploads/resumes/{resume.filename}"
        with open(resume_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        profile.resume_file = resume_path

    db.commit()
    return {"message": "Profile updated successfully"}

@router.put("/updateProfile/", tags=["Profile Management"])
async def update_profile(
    company_experience: list[dict] = Form(...),  # List of company experience
    skills: list[str] = Form(...),  # List of skills
    preferred_role: str = Form(...),  # Preferred role
    education: list[dict] = Form(...),  # List of education details
    certifications: list[str] = Form(...),  # List of certifications
    resume: UploadFile = File(None),  # Resume file
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Fetch the profile for the current user
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            # Create a new profile if it doesn't exist
            profile = Profile(user_id=current_user.id)
            db.add(profile)

        # Update profile fields
        profile.company_experience = company_experience
        profile.skills = skills
        profile.preferred_role = preferred_role
        profile.education = education
        profile.certifications = certifications

        # Handle resume upload
        if resume:
            resume_path = f"uploads/resumes/{resume.filename}"
            with open(resume_path, "wb") as buffer:
                shutil.copyfileobj(resume.file, buffer)
            profile.resume_file = resume_path

        # Commit changes to the database
        db.commit()
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", tags=["Profile Management"])
def create_profile(
    company_experience: list[dict] = Form(...),
    skills: list[str] = Form(...),
    preferred_role: str = Form(...),
    education: list[dict] = Form(...),
    certifications: list[str] = Form(...),
    resume: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    # Create a new profile
    profile = Profile(
        user_id=current_user.id,
        company_experience=company_experience,
        skills=skills,
        preferred_role=preferred_role,
        education=education,
        certifications=certifications,
    )

    # Handle resume upload
    if resume:
        resume_path = f"uploads/resumes/{resume.filename}"
        with open(resume_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        profile.resume_file = resume_path

    db.add(profile)
    db.commit()
    return {"message": "Profile created successfully"}
