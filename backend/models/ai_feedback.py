from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from backend.database import Base
import datetime

class AI_Feedback(Base):
    __tablename__ = "ai_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    interview_id = Column(Integer, ForeignKey("mock_interviews.id"))
    feedback_text = Column(Text, nullable=False)
    improvement_tips = Column(Text, nullable=True)

    user = relationship("User")
    interview = relationship("MockInterview")