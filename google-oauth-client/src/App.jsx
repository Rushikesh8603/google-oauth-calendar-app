import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const handleGoogleLogin = () => {
    const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = {
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,  // will go to->backend->/dashboard
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email openid",
      access_type: "offline",
      prompt: "consent",
    };
    const query = new URLSearchParams(params).toString();
    window.location.href = `${baseUrl}?${query}`;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onLogin={handleGoogleLogin} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
