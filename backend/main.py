from fastapi import FastAPI, Request , Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os
import requests
import psycopg2
import jwt




app = FastAPI()

# ✅ Allow your frontend (React app) to access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ Load environment variables from .env file
load_dotenv(dotenv_path=".env") 

# ✅ Read credentials from environment
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
DATABASE_URL = os.getenv("DATABASE_URL")



# ✅ Connect to PostgreSQL
def get_connection():
    return psycopg2.connect(DATABASE_URL)

# ✅ Create table on startup
@app.on_event("startup")
def create_user_tokens_table():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_tokens (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            access_token TEXT,
            refresh_token TEXT,
            id_token TEXT,
            token_expiry TIMESTAMP DEFAULT NOW()
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

# ✅ Save tokens to database
def save_token(email, access_token, refresh_token, id_token):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO user_tokens (email, access_token, refresh_token, id_token, token_expiry)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (email) DO UPDATE SET
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            id_token = EXCLUDED.id_token,
            token_expiry = EXCLUDED.token_expiry;
    """, (
        email,
        access_token,
        refresh_token,
        id_token,
        datetime.utcnow() + timedelta(seconds=3600)
    ))
    conn.commit()
    cur.close()
    conn.close()

@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.get("/api/auth/google/callback")
def google_callback(code: str):
    token_url = "https://oauth2.googleapis.com/token"    #This is the Google OAuth 2.0 Token Endpoint.
                                                         #Convert the short-lived authorization code (sent from Google) into:
                                                         #access_token → used to call Google APIs (like Calendar)
                                                         # id_token → JWT containing user info
                                                         # refresh_token → used to get new access_token when it expires
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    response = requests.post(token_url, data=data)
    tokens = response.json()

    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    id_token = tokens.get("id_token")

    decoded = jwt.decode(id_token, options={"verify_signature": False})
    email = decoded.get("email")

    save_token(email, access_token, refresh_token, id_token)

    redirect_url = f"http://localhost:5173/dashboard?access_token={access_token}&id_token={id_token}"
    return RedirectResponse(url=redirect_url)



@app.get("/api/calendar/freebusy")
def check_free_busy(request: Request, start: str = Query(...), end: str = Query(...)):
    """
    Check if user is free between `start` and `end` (ISO 8601 format required).
    Example: start="2025-06-17T15:00:00Z", end="2025-06-17T16:00:00Z"
    """

    access_token = request.headers.get("Authorization")

    if not access_token:
        return JSONResponse(status_code=401, content={"error": "Access token required"})

    if access_token.startswith("Bearer "):
        access_token = access_token.split(" ")[1]

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    body = {
        "timeMin": start,
        "timeMax": end,
        "timeZone": "Asia/Kolkata",
        "items": [{"id": "primary"}]
    }

    response = requests.post("https://www.googleapis.com/calendar/v3/freeBusy", headers=headers, json=body)

    if response.status_code == 200:
        data = response.json()
        busy_slots = data.get("calendars", {}).get("primary", {}).get("busy", [])
        return {
            "available": len(busy_slots) == 0,
            "busy_slots": busy_slots
        }
    else:
        return JSONResponse(
            status_code=response.status_code,
            content={"error": "Google API error", "details": response.json()}
        )
    


@app.get("/api/calendar/events")
def get_calendar_events(request: Request):
    print("yeeeee iam here in this call")
    access_token = request.headers.get("Authorization")

    if not access_token:
        return JSONResponse(status_code=401, content={"error": "Access token required"})

    if access_token.startswith("Bearer "):
        access_token = access_token.split(" ")[1]

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    calendar_url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    response = requests.get(calendar_url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch events", "details": response.json()}