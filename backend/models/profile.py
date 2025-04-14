from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    company_experience = Column(JSON, nullable=True)  # List of company experience
    skills = Column(JSON, nullable=True)  # List of skills
    preferred_role = Column(String, nullable=True)
    education = Column(JSON, nullable=True)  # List of education details
    certifications = Column(JSON, nullable=True)  # List of certifications
    resume_file = Column(String, nullable=True)  # Path to the uploaded resume

    user = relationship("User", back_populates="profile")