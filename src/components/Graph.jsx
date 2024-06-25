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
import { ThreeDots } from 'react-loader-spinner'; // Assuming you're using react-loader-spinner

const TODAY_URL = 'https://m-route-backend.onrender.com/users/get/day/performance';
const DAY_URL = 'https://m-route-backend.onrender.com/users/get/performance';
const THISWEEK_URL = 'https://m-route-backend.onrender.com/users/get/week/performance';
const THISMONTH_URL = 'https://m-route-backend.onrender.com/users/get/month/performance';
const MONTHLY_URL = 'https://m-route-backend.onrender.com/users/get/monthly/performance';
const RANGE_URL = 'https://m-route-backend.onrender.com/users/get/range/performance';
const YEAR_URL = 'https://m-route-backend.onrender.com/users/get/year/performance';

const DynamicPerformanceChart = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [viewType, setViewType] = useState('today');
    const [date, setDate] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalAggregate, setTotalAggregate] = useState(0);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) setToken(JSON.parse(accessToken));
        if (userData) {
            const user = JSON.parse(userData);
            setUserId(user.id);
            if (user.username) {
                const capitalizedUsername = user.username.charAt(0).toUpperCase() + user.username.slice(1);
                setFirstName(capitalizedUsername);
            }
            if (user.last_name) setLastName(user.last_name);
        }
    }, []);

    const fetchPerformanceData = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            let response;
            switch (viewType) {
                case 'today':
                    response = await fetch(`${TODAY_URL}/${userId}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    break;
                case 'day':
                    response = await fetch(`${DAY_URL}?date=${date}&merch_id=${userId}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    break;
                case 'thisweek':
                    response = await fetch(`${THISWEEK_URL}/${userId}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    break;
                case 'thismonth':
                    response = await fetch(`${THISMONTH_URL}/${userId}`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    break;
                case 'monthly':
                    response = await fetch(`${MONTHLY_URL}?month=${month}&year=${year}&merch_id=${userId}`, {
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
                const total = calculateTotalAggregate(aggregatedData);
                setTotalAggregate(total);
            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error("Error fetching performance data:", error);
            setErrorMessage("Failed to fetch performance data.");
        } finally {
            setIsLoading(false);
        }
    };

    const aggregatePerformanceData = (performanceData, viewType) => {
        switch (viewType) {
            case 'today':
            case 'day':
                if (performanceData && performanceData.performance) {
                    return Object.keys(performanceData.performance).map(metric => ({
                        name: metric,
                        score: performanceData.performance[metric]
                    }));
                } else {
                    throw new Error("Invalid data structure for today/day view");
                }
            case 'thisweek':
            case 'thismonth':
            case 'monthly':
            case 'range':
                if (performanceData) {
                    return Object.keys(performanceData).map(metric => ({
                        name: metric,
                        score: performanceData[metric]
                    }));
                } else {
                    throw new Error("Invalid data structure for thisweek/thismonth/monthly/range view");
                }
            case 'year':
                if (performanceData) {
                    return Object.keys(performanceData).map(month => ({
                        name: month,
                        score: performanceData[month].total_performance
                    }));
                } else {
                    throw new Error("Invalid data structure for year view");
                }
            default:
                throw new Error("Invalid view type");
        }
    };

    const calculateTotalAggregate = (aggregatedData) => {
        return aggregatedData
            .filter(item => item.name !== 'total_performance')
            .reduce((acc, item) => acc + item.score, 0);
    };

    const renderCustomTooltip = ({ payload, label }) => {
        if (payload && payload.length) {
            return (
                <div className="custom-tooltip p-2 bg-white border rounded shadow-lg">
                    <p className="label font-bold">{`${label}`}</p>
                    <p className="intro">{`Score: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[90vh] bg-white p-4 rounded-lg shadow-lg mt-5">
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Performance Metrics</h2>
                <h3>Name: {firstName} {lastName}</h3>
                <h3>Total Aggregate: {totalAggregate}</h3>
                <br />
                <div className="mb-4">
                    <select
                        value={viewType}
                        onChange={(e) => setViewType(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="today">My Performance Today</option>
                        <option value="day">Search a Day's Performance</option>
                        <option value="thisweek">My Performance this Week</option>
                        <option value="thismonth">My Performance this Month</option>
                        <option value="monthly">Search a Month's Performance</option>
                        <option value="range">Search Performance in Range</option>
                        <option value="year">My Performance this Year</option>
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
                {viewType === 'monthly' && (
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
                        <h1>From: </h1>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="p-2 border rounded"
                        />
                        <h1>To: </h1>
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
                <div className="flex justify-center items-center h-full">
                    <ThreeDots color="#00BFFF" height={80} width={80} />
                </div>
            ) : errorMessage ? (
                <p className="text-center text-red-600">{errorMessage}</p>
            ) : (
                <ResponsiveContainer width="100%" height="70%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={renderCustomTooltip} />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default DynamicPerformanceChart;