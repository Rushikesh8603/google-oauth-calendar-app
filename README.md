# Google OAuth Calendar Integration App

A full-stack web application that enables users to log in securely with their Google account using OAuth 2.0 and view their upcoming Google Calendar events. Built using **React (frontend)** and **FastAPI (backend)**, this project demonstrates secure authentication, token exchange, and third-party API integration.

---

## 🚀 Features

- Google OAuth 2.0 login
- Access token + refresh token handling
- Display Google Calendar events on a dashboard
- Secure token exchange and backend validation
- Organized frontend/backend folder structure

---

## 🛠️ Tech Stack

- **Frontend:** React, Axios, Vite
- **Backend:** FastAPI, OAuthlib, Pydantic
- **Auth:** Google OAuth 2.0
- **Others:** JWT, dotenv, HTTPOnly cookies

---

## 📁 Folder Structure

google-oauth-calendar-app/
├── frontend/ # React frontend
│ └── ...
├── backend/ # FastAPI backend
│ └── ...
└── README.md


---

## 🧑‍💻 How to Run the Project Locally

### 1. Clone the Repository

git clone https://github.com/Rushikesh8603/google-oauth-calendar-app.git
cd google-oauth-calendar-app



2. Backend (FastAPI)
🔧 Setup

cd backend
python -m venv venv
source venv/bin/activate  # Use `venv\Scripts\activate` on Windows
pip install -r requirements.txt


🔑 Create .env file

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=http://localhost:8000/callback
FRONTEND_URL=http://localhost:5173



▶️ Run Backend

uvicorn main:app --reload



3. Frontend (React)
🔧 Setup

cd frontend
npm install


▶️ Run Frontend

npm run dev
Access frontend at: http://localhost:5173


🔐 Google OAuth Setup
Go to Google Cloud Console

Create a new project & OAuth credentials

Set:

Authorized redirect URI: http://localhost:8000/callback

Authorized JavaScript origin: http://localhost:5173

Copy Client ID and Client Secret to your .env file



📅 API Used
Google Calendar API
API Docs
Used to fetch user’s upcoming events after authentication


📸 Demo

Watch Demo   https://youtu.be/UCR5bZ7TyG8?si=eXzynsU_pyLrFXFm


🧑‍💻 Author
Rushikesh Patare








