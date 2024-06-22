import React, { useState, useEffect } from "react";

const CREATE_KPI_URL = "https://m-route-backend.onrender.com/users/create/kpi";

const KeyPerformanceIndicators = () => {
    const [sectorName, setSectorName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [performanceMetrics, setPerformanceMetrics] = useState([]);
    const [userId, setUserId] = useState("");
    const [token, setToken] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) setToken(JSON.parse(accessToken));
        if (userData) setUserId(JSON.parse(userData).id);
    }, []);

    const addKPI = () => {
        setPerformanceMetrics([...performanceMetrics, { metric: "", text: false, image: false }]);
    };

    const handleKPIMetricChange = (index, field, value) => {
        const newMetrics = [...performanceMetrics];
        newMetrics[index][field] = value;
        setPerformanceMetrics(newMetrics);
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setLoading(true);

        const kpiData = {
            sector_name: sectorName,
            company_name: companyName,
            admin_id: userId,
            performance_metric: performanceMetrics.reduce((acc, metric) => {
                acc[metric.metric] = { text: metric.text, image: metric.image };
                return acc;
            }, {})
        };
        console.table(kpiData);
        console.log(kpiData);

        try {
            const response = await fetch(CREATE_KPI_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(kpiData)
            });
            const data = await response.json();
            if (data.status_code === 201) {
                setMessage(data.message);
                setCompanyName("");
                setSectorName("");
                setPerformanceMetrics([]);
                setTimeout(() => setMessage(""), 5000);
            } else if (data.status_code === 400) {
                setError(data.message);
                setTimeout(() => setError(""), 5000);
            } else {
                setError("There was an error creating the KPIs");
                console.log(data.message);
                setTimeout(() => setError(""), 5000);
            }
        } catch (error) {
            console.error(error);
            setError("Failed, there was an error creating the KPIs");
            setTimeout(() => setError(""), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sector Name:</label>
                    <input
                        type="text"
                        value={sectorName}
                        placeholder="Sector Name e.g Consumer Packaging Goods"
                        onChange={(e) => setSectorName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name:</label>
                    <input
                        type="text"
                        value={companyName}
                        placeholder="Company Name e.g Mash Industries"
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Key Performance Indicators:</label>
                    {performanceMetrics.map((metric, index) => (
                        <div key={index} className="space-y-2">
                            <input
                                type="text"
                                placeholder="KPI Metric e.g Shelf Space"
                                value={metric.metric}
                                onChange={(e) => handleKPIMetricChange(index, "metric", e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                            />
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={metric.text}
                                        onChange={(e) => handleKPIMetricChange(index, "text", e.target.checked)}
                                        className="mr-2"
                                    />
                                    Text
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={metric.image}
                                        onChange={(e) => handleKPIMetricChange(index, "image", e.target.checked)}
                                        className="mr-2"
                                    />
                                    Image
                                </label>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addKPI} className="mt-2 bg-gray-800 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        Add KPI
                    </button>
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}
                <button type="submit" className="bg-gray-800 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Submit
                </button>
                {loading && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default KeyPerformanceIndicators;
