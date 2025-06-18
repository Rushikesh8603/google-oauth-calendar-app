// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [freeStatus, setFreeStatus] = useState(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    const idToken = params.get("id_token");

    if (token && idToken) {
      setAccessToken(token);
      setUser(jwtDecode(idToken));
      fetchEvents(token);
    }
  }, []);

  const fetchEvents = async (token) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/calendar/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch calendar events", err);
    }
  };

  const checkAvailability = async () => {
    if (!date || !startTime || !endTime) {
      alert("Please fill in date, start time, and end time.");
      return;
    }

    // Step 1: Create Date objects in local time
    const startLocal = new Date(`${date}T${startTime}`);
    const endLocal = new Date(`${date}T${endTime}`);

    // Step 2: Convert to UTC ISO strings
    const startISOString = startLocal.toISOString();
    const endISOString = endLocal.toISOString();

    try {
      const res = await axios.get("http://127.0.0.1:8000/api/calendar/freebusy", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          start: startISOString,
          end: endISOString,
        },
      });
      setFreeStatus(res.data.available ? "✅ Slot is FREE" : "❌ Slot is BUSY");
    } catch (err) {
      console.error("Error checking availability", err);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          📅 Google Calendar Dashboard
        </h1>

        {user && (
          <div className="bg-blue-100 p-4 rounded-xl mb-6 shadow">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.sub}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block mb-2 font-semibold text-gray-700">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block mb-2 font-semibold text-gray-700">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <button
            onClick={checkAvailability}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl"
          >
            🔍 Check Availability
          </button>

          {freeStatus && (
            <p className="text-lg font-semibold mt-4 text-center text-blue-800">
              {freeStatus}
            </p>
          )}
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>

        {events.length ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.map((event) => {
              const startTime = event.start?.dateTime || event.start?.date;
              const startDate = new Date(startTime);
              const isPast = startDate < new Date();

              return (
                <li
                  key={event.id}
                  className={`p-5 rounded-2xl shadow transition transform hover:scale-[1.02] ${isPast
                    ? "bg-gray-100 text-gray-500"
                    : "bg-gradient-to-tr from-blue-200 via-white to-blue-100 text-gray-800"
                    }`}
                >
                  <div className="mb-2 text-lg font-semibold">
                    {event.summary || "(No Title)"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {startDate.toLocaleString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">No events found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
