from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.database import Base
from pydantic import BaseModel, EmailStr

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)  # Corrected column name

    # Define Relationship with Profile
    profile = relationship("Profile", uselist=False, back_populates="user")

class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str
    fullname: str

# Import Profile Here to Avoid Import Issues
from backend.models.profile import Profile
