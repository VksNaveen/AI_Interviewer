from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base  # ✅ Correct import


class UserInterview(Base):
    __tablename__ = "user_interviews"

    id = Column(Integer, primary_key=True, index=True)  # Unique interview ID
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Foreign key to users table
    interview_attempt = Column(Integer, nullable=False)  # Attempt number for the interview
    date = Column(DateTime, default=datetime.utcnow)  # Date of the interview
    self_intro_response = Column(Text, nullable=True)  # Self-introduction response text
    questions = Column(Text, nullable=False)  # JSON string to store questions
    answers = Column(Text, nullable=False)  # JSON string to store answers

    # Relationship to the User model (if needed)
    user = relationship("User", back_populates="interviews")
