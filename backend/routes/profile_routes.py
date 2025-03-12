from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.profile import Profile
from backend.models.user import User
from backend.services.auth_service import verify_jwt_token, get_current_user
from pydantic import BaseModel
from typing import List, Optional
import os

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
        return {"message": "Profile not found", "skills": []}

    return profile

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
    experience: Optional[int] = Form(None),
    skills: Optional[str] = Form(None),
    preferred_role: Optional[str] = Form(None),
    interest_area: Optional[str] = Form(None),
    education: Optional[str] = Form(None),
    degree: Optional[str] = Form(None),
    certifications: Optional[str] = Form(None),
    projects: Optional[str] = Form(None),
    linkedin: Optional[str] = Form(None),
    github: Optional[str] = Form(None),
    expected_salary: Optional[int] = Form(None),
    location_preference: Optional[str] = Form(None),
    resume: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    profile.experience = experience if experience is not None else profile.experience
    profile.skills = skills if skills else profile.skills
    profile.preferred_role = preferred_role if preferred_role else profile.preferred_role
    profile.interest_area = interest_area if interest_area else profile.interest_area
    profile.education = education if education else profile.education
    profile.degree = degree if degree else profile.degree
    profile.certifications = certifications if certifications else profile.certifications
    profile.projects = projects if projects else profile.projects
    profile.linkedin = linkedin if linkedin else profile.linkedin
    profile.github = github if github else profile.github
    profile.expected_salary = expected_salary if expected_salary is not None else profile.expected_salary
    profile.location_preference = location_preference if location_preference else profile.location_preference

    if resume:
        resume_path = os.path.join(UPLOAD_FOLDER, resume.filename)
        with open(resume_path, "wb") as f:
            f.write(resume.file.read())
        profile.resume_filename = resume.filename  

    db.commit()
    return {"message": "Profile updated successfully"}
