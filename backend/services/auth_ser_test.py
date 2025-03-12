import os
from dotenv import dotenv_values

# ✅ Reference the `.env` file from the root directory
env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")

# ✅ Load environment variables safely
env_values = dotenv_values(env_path)

DATABASE_URL = env_values.get("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ ERROR: DATABASE_URL is missing! Check your `.env` file.")

print(f"📢 DATABASE_URL Loaded: {DATABASE_URL}")
