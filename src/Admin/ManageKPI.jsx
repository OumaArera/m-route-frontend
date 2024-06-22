import React, { useState, useEffect } from "react";

const KPIs_URL = "https://m-route-backend.onrender.com/users/all/kpis"

const ManageKPI = () => {
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [performance, setPerformance] = useState([]);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) setToken(JSON.parse(accessToken));
        if (userData) setUserId(JSON.parse(userData).id);

        fetchKPIs(); // Fetch KPIs when component mounts
    }, []);

    const fetchKPIs = async () => {
        try {
            const response = await fetch(KPIs_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.successful) {
                setPerformance(data.message);
            } else {
                console.error("Failed to fetch KPIs:", data.message);
            }
        } catch (error) {
            console.error("Error fetching KPIs:", error);
        }
    };

    const handleTextChange = async (kpiId, metric, newTextValue) => {
        // Dummy endpoint for updating text value
        try {
            const response = await fetch(`/update/kpi/${kpiId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ metric, text: newTextValue }),
            });
            const data = await response.json();
            if (data.successful) {
                // Update local state after successful update
                setPerformance(prevPerformance =>
                    prevPerformance.map(kpi =>
                        kpi.id === kpiId
                            ? {
                                  ...kpi,
                                  performance_metric: {
                                      ...kpi.performance_metric,
                                      [metric]: {
                                          ...kpi.performance_metric[metric],
                                          text: newTextValue,
                                      },
                                  },
                              }
                            : kpi
                    )
                );
            } else {
                console.error("Failed to update text value:", data.message);
            }
        } catch (error) {
            console.error("Error updating text value:", error);
        }
    };

    const handleDeleteKPI = async (kpiId) => {
        // Dummy endpoint for deleting KPI
        try {
            const response = await fetch(`/delete/kpi/${kpiId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.successful) {
                // Remove deleted KPI from local state
                setPerformance(prevPerformance =>
                    prevPerformance.filter(kpi => kpi.id !== kpiId)
                );
            } else {
                console.error("Failed to delete KPI:", data.message);
            }
        } catch (error) {
            console.error("Error deleting KPI:", error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Manage KPIs</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="py-2 px-3 text-left">No</th>
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
                                <td className="py-2 px-3">
                                    <select
                                        value={kpi.performance_metric[kpi.company_name].text}
                                        onChange={(e) =>
                                            handleTextChange(
                                                kpi.id,
                                                kpi.company_name,
                                                e.target.value
                                            )
                                        }
                                        className="border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value={true}>True</option>
                                        <option value={false}>False</option>
                                    </select>
                                </td>
                                <td className="py-2 px-3">{kpi.performance_metric[kpi.company_name].image.toString()}</td>
                                <td className="py-2 px-3">
                                    <button
                                        onClick={() => handleDeleteKPI(kpi.id)}
                                        className="bg-gray-800 hover:bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                        Delete
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
