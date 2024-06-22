import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const DAY_URL = 'https://m-route-backend.onrender.com/users/get/performance';
const MONTH_URL = 'https://m-route-backend.onrender.com/users/get/monthly/performance';
const RANGE_URL = 'https://m-route-backend.onrender.com/users/get/range/performance';
const YEAR_URL = 'https://m-route-backend.onrender.com/users/get/year/performance';

const DynamicPerformanceChart = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [viewType, setViewType] = useState('day');
    const [date, setDate] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) setToken(JSON.parse(accessToken));
        if (userData) setUserId(JSON.parse(userData).id);
    }, []);

    const fetchPerformanceData = async () => {
        setIsLoading(true);
        try {
            let response;
            switch (viewType) {
                case 'day':
                    response = await fetch(`${DAY_URL}?date=${date}&merch_id=${userId}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    break;
                case 'month':
                    response = await fetch(`${MONTH_URL}?month=${month}&year=${year}&merch_id=${userId}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    break;
                case 'range':
                    response = await fetch(`${RANGE_URL}?start_date=${startDate}&end_date=${endDate}&merch_id=${userId}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    break;
                case 'year':
                    response = await fetch(`${YEAR_URL}/${userId}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    break;
                default:
                    throw new Error("Invalid view type");
            }

            const result = await response.json();

            if (result.status_code === 200) {
                const performanceData = result.message;
                const aggregatedData = aggregatePerformanceData(performanceData, viewType);
                setData(aggregatedData);
            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error("Error fetching performance data:", error);
            setErrorMessage("Failed to fetch performance data.");
        } finally {
            setIsLoading(false);
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const aggregatePerformanceData = (performanceData, viewType) => {
        if (viewType === 'year') {
            return Object.keys(performanceData).map(month => ({
                name: month,
                total_performance: performanceData[month].total_performance
            }));
        } else if (viewType === 'day') {
            return Object.keys(performanceData.performance).map(metric => ({
                name: metric,
                score: performanceData.performance[metric]
            }));
        } else {
            return Object.keys(performanceData).map(metric => ({
                name: metric,
                score: performanceData[metric]
            }));
        }
    };

    return (
        <div className="w-full h-[90vh] bg-white p-4 rounded-lg shadow-lg mt-5">
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Performance Metrics</h2>
                <div className="mb-4">
                    <select
                        value={viewType}
                        onChange={(e) => setViewType(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="day">Day</option>
                        <option value="month">Month</option>
                        <option value="range">Range</option>
                        <option value="year">Year</option>
                    </select>
                </div>
                {viewType === 'day' && (
                    <div className="mb-4">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="p-2 border rounded"
                        />
                    </div>
                )}
                {viewType === 'month' && (
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Month (MM)"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Year (YYYY)"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="p-2 border rounded"
                        />
                    </div>
                )}
                {viewType === 'range' && (
                    <div className="mb-4">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="p-2 border rounded"
                        />
                    </div>
                )}
                <button
                    onClick={fetchPerformanceData}
                    className="p-2 bg-blue-500 text-white rounded"
                >
                    Search
                </button>
            </div>

            {isLoading ? (
                <p className="text-center text-gray-600">Loading...</p>
            ) : errorMessage ? (
                <p className="text-center text-red-600">{errorMessage}</p>
            ) : (
                <ResponsiveContainer width="100%" height="70%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default DynamicPerformanceChart;
