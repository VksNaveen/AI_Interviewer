from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    experience = Column(Integer, nullable=True)
    skills = Column(Text, nullable=True)  # Store JSON-encoded list of skills
    preferred_role = Column(String(100), nullable=True)
    interest_area = Column(String(100), nullable=True)
    education = Column(String(200), nullable=True)
    degree = Column(String(100), nullable=True)
    certifications = Column(Text, nullable=True)
    projects = Column(Text, nullable=True)
    linkedin = Column(String(200), nullable=True)
    github = Column(String(200), nullable=True)
    expected_salary = Column(Integer, nullable=True)
    location_preference = Column(String(50), nullable=True)
    resume_filename = Column(String(200), nullable=True)

    user = relationship("User", back_populates="profile")
