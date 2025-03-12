from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import dotenv_values

# ✅ Reference the `.env` file from the root directory
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")

# ✅ Load environment variables safely
env_values = dotenv_values(env_path)

DATABASE_URL = env_values.get("DATABASE_URL")


# ✅ Debugging output
print(f"📢 DATABASE_URL Loaded: {DATABASE_URL}")

if not DATABASE_URL:
    raise ValueError("❌ ERROR: DATABASE_URL is not set! Check your .env file.")

# ✅ Initialize database connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ✅ Dependency function for getting DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
