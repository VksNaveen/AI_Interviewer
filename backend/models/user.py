from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Define Relationship with Profile
    profile = relationship("Profile", uselist=False, back_populates="user")

# Import Profile Here to Avoid Import Issues
from backend.models.profile import Profile
