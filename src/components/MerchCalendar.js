import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

const ROUTES_URL = "https://m-route-backend.onrender.com/users/route-plans";

// Initialize localizer for React Big Calendar with moment.js
const localizer = momentLocalizer(moment);

const MerchCalendar = ({ userData }) => {
    const [events, setEvents] = useState([]);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        setToken(JSON.parse(accessToken));
    }, []);

    useEffect(() => {
        if (token && userData.id) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${ROUTES_URL}/${userData.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch events');
                    }
                    const data = await response.json();
                    if (data.successful) {
                        // Transform fetched data into the format expected by React Big Calendar
                        const formattedEvents = data.message.flatMap(event => {
                            const instructions = JSON.parse(event.instructions);
                            return instructions.map(instruction => ({
                                title: instruction.instructions,
                                start: moment(instruction.start, 'YYYY-MM-DDTHH:mm').toDate(),
                                end: moment(instruction.end, 'YYYY-MM-DDTHH:mm').toDate(),
                            }));
                        });
                        setEvents(formattedEvents);
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    console.error('Error fetching events:', error);
                }
            };
            fetchData();
        }
    }, [token, userData.id]); // Depend on token and userData.id

    return (
        <div className="calendar-container w-screen h-screen p-4">
            <div className="max-w-full overflow-auto h-full">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    className="react-big-calendar"
                    style={{ height: '100%' }}
                />
            </div>
        </div>
    );
};

export default MerchCalendar;



