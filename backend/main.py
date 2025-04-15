# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database import Base, engine
from backend.routes import auth, profile_routes
from backend.routes.interview import router as interview_router

app = FastAPI()

# ✅ Initialize DB
def init_db():
    print("📢 Initializing Database...")
    Base.metadata.create_all(bind=engine)

init_db()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Static Files
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(profile_routes.router, prefix="/profile", tags=["Profile Management"])
app.include_router(interview_router, prefix="/api", tags=["Interview"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Interview Preparation API"}
