import React, { useState, useEffect } from "react";

const KPIs_URL = "https://m-route-backend.onrender.com/users/all/kpis";

const ManageKPI = () => {
    const [token, setToken] = useState("");
    const [performance, setPerformance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
            setToken(JSON.parse(accessToken));
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchKPIs();
        }
    }, [token]);

    const fetchKPIs = async () => {
        try {
            const response = await fetch(KPIs_URL, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch KPIs: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status_code === 200) {
                setPerformance(data.message);
            } else {
                console.error("Failed to fetch KPIs:", data.message);
            }
        } catch (error) {
            console.error("Error fetching KPIs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextChange = async (kpiId, metric, newTextValue) => {
        console.log("Hello world");
    };

    const handleManageKPI = async (kpiId) => {
        console.log("Hello world");
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Manage KPIs</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="py-2 px-3 text-left">No</th>
                            <th className="py-2 px-3 text-left">Company Name</th>
                            <th className="py-2 px-3 text-left">Sector Name</th>
                            <th className="py-2 px-3 text-left">Metric</th>
                            <th className="py-2 px-3 text-left">Text</th>
                            <th className="py-2 px-3 text-left">Image</th>
                            <th className="py-2 px-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performance.map((kpi, index) => (
                            <tr key={kpi.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                <td className="py-2 px-3">{index + 1}</td>
                                <td className="py-2 px-3">{kpi.company_name}</td>
                                <td className="py-2 px-3">{kpi.sector_name}</td>
                                <td className="py-2 px-3">
                                    {Object.keys(kpi.performance_metric).map(metric => (
                                        <div key={metric}>
                                            <strong>{metric}</strong>
                                        </div>
                                    ))}
                                </td>
                                <td className="py-2 px-3">
                                    {Object.keys(kpi.performance_metric).map(metric => (
                                        <div key={metric}>
                                            {kpi.performance_metric[metric].text.toString()}
                                        </div>
                                    ))}
                                </td>
                                <td className="py-2 px-3">
                                    {Object.keys(kpi.performance_metric).map(metric => (
                                        <div key={metric}>
                                            {kpi.performance_metric[metric].image.toString()}
                                        </div>
                                    ))}
                                </td>
                                <td className="py-2 px-3">
                                    <button
                                        onClick={() => handleManageKPI(kpi.id)}
                                        className="bg-gray-800 hover:bg-blue-600 text-white px-3 py-1 rounded"
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageKPI;
