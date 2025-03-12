from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from backend.database import Base
import datetime

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_filename = Column(String(200), nullable=False)
    extracted_skills = Column(Text, nullable=True)
    job_recommendations = Column(Text, nullable=True)  # JSON format of job matches

    user = relationship("User", back_populates="resumes")