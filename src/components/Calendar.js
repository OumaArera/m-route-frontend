import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';

function Calendar({ userData }) {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [staffNo, setStaffNo] = useState("");
  const [status, setStatus] = useState("pending");
  const [token, setToken] = useState(null);
  const session = useSession();
  const supabase = useSupabaseClient();
  const { isLoading } = useSessionContext();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    setToken(accessToken);
  }, []);

  if (isLoading) {
    return <></>;
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const formatDate = (date) => {
    if (!date) {
      return null;
    }
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-GB', options).replace(',', '');
  };

  async function createCalendarEvent() {
    console.log("Creating calendar event");
    const event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  
    console.log(event);
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + session.provider_token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create calendar event:", errorData);
        throw new Error(errorData.message || "Failed to create calendar event.");
      }
  
      const eventData = await response.json();
  
      const formattedStartDate = formatDate(start);
      const formattedEndDate = formatDate(end);
      console.log("Formatted Start Date:", formattedStartDate);
      console.log("Formatted End Date:", formattedEndDate);
  
      const data = {
        manager_id: userData.id,
        date_range: {
          start_date: formattedStartDate,
          end_date: formattedEndDate
        },
        instructions: eventDescription,
        status: status.toLowerCase(), // Ensure status is lowercase
        staff_no: parseInt(staffNo), // Parse staffNo to integer
      };
  
      console.log("Data to be sent to backend:", data);
  
      const routePlanResponse = await fetch("https://m-route-backend.onrender.com/users/route-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
  
      if (!routePlanResponse.ok) {
        const errorData = await routePlanResponse.json();
        console.error("Failed to create route plan:", errorData);
        throw new Error(errorData.message || "Failed to create route plan.");
      }
  
      const routePlanData = await routePlanResponse.json();
      console.log(routePlanData);
      alert("Event created! Please check your Google Calendar.");
    } catch (error) {
      console.error("Error creating event or route plan:", error);
      alert(`Failed to create calendar event or route plan: ${error.message}`);
    }
  }
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 lg:px-8">
      {session ? (
        <>
          <h2 className="text-2xl font-semibold mb-4">Hello, {userData.username}</h2>
          <h3 className="text-xl font-semibold mb-4">Route Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full max-w-3xl">
            <div>
              <p className="text-lg font-semibold">Set start time and date</p>
              <input
                type="datetime-local"
                className="border border-gray-300 rounded p-2 w-full mb-2"
                onChange={(e) => setStart(new Date(e.target.value))}
                value={start.toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <p className="text-lg font-semibold">Deadline: date and time</p>
              <input
                type="datetime-local"
                className="border border-gray-300 rounded p-2 w-full mb-2"
                onChange={(e) => setEnd(new Date(e.target.value))}
                value={end.toISOString().slice(0, 16)}
              />
            </div>
          </div>
          <p className="text-lg font-semibold mb-2">Route name</p>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full mb-2 max-w-lg"
            onChange={(e) => setEventName(e.target.value)}
          />
          <p className="text-lg font-semibold mb-2">Route instructions</p>
          <textarea
            className="border border-gray-300 rounded p-2 w-full mb-2 max-w-lg"
            rows="4"
            onChange={(e) => setEventDescription(e.target.value)}
          ></textarea>
          <p className="text-lg font-semibold mb-2">Staff No</p>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full mb-2 max-w-lg"
            onChange={(e) => setStaffNo(e.target.value)}
          />

          <p className="text-lg font-semibold mb-2">Status</p>
          <div className="flex mb-4">
            <button
              className={`py-2 px-4 mr-2 rounded ${status === 'pending' ? 'bg-gray-900 text-white' : 'bg-gray-300'}`}
              onClick={() => setStatus('pending')}
            >
              Pending
            </button>
            <button
              className={`py-2 px-4 rounded ${status === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setStatus('complete')}
            >
              Complete
            </button>
          </div>

          <hr className="w-full mb-4" />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-2 max-w-lg"
            onClick={() => createCalendarEvent()}
          >
            Create Calendar Event
          </button>
          <p></p>
          <button
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded w-full mb-2 max-w-lg"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </>
      ) : (
        <div className="flex items-center justify-center px-4">
          <button
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-8 rounded-full"
            onClick={() => googleSignIn()}
          >
            Sign In With Google
          </button>
        </div>
      )}
    </div>
  );
}

export default Calendar;
