from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import Base, engine
from backend.routes import auth, profile_routes

app = FastAPI()

# ✅ Initialize Database
def init_db():
    print("📢 Initializing Database...")
    Base.metadata.create_all(bind=engine)

init_db()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include Routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(profile_routes.router, prefix="/profile", tags=["Profile Management"])


@app.get("/")
def home():
    return {"message": "Welcome to AI Interviewer API!"}

for route in app.routes:
    print(route.path, route.methods)
