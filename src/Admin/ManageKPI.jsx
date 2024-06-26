import React, { useState, useEffect } from "react";

const KPIs_URL = "https://m-route-backend.onrender.com/users/all/kpis";
const UPDATE_KPI_URL = "https://m-route-backend.onrender.com/users/update/kpi";
const DELETE_KPI_URL = "https://m-route-backend.onrender.com/users/delete/kpi";

const ManageKPI = () => {
    const [token, setToken] = useState("");
    const [performance, setPerformance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedKPI, setSelectedKPI] = useState(null);
    const [metricState, setMetricState] = useState({});
    const [loading, setLoading] = useState(false);

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

    const handleManageKPI = (kpi) => {
        setSelectedKPI(kpi);
        setMetricState(kpi.performance_metric);
    };

    const handleCheckboxChange = (metric, key) => {
        setMetricState((prevState) => ({
            ...prevState,
            [metric]: {
                ...prevState[metric],
                [key]: !prevState[metric][key]
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${UPDATE_KPI_URL}/${selectedKPI.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ performance_metric: metricState })
            });
            if (!response.ok) {
                throw new Error(`Failed to update KPI: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status_code === 201) {
                setPerformance((prevState) =>
                    prevState.map((kpi) =>
                        kpi.id === selectedKPI.id ? { ...kpi, performance_metric: metricState } : kpi
                    )
                );
                setSelectedKPI(null);
                fetchKPIs();
            } else {
                console.error("Failed to update KPI:", data.message);
            }
        } catch (error) {
            console.error("Error updating KPI:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedKPI) return;
        setLoading(true);
        try {
            const response = await fetch(`${DELETE_KPI_URL}/${selectedKPI.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to delete KPI: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status_code === 200) {
                setPerformance((prevState) =>
                    prevState.filter((kpi) => kpi.id !== selectedKPI.id)
                );
                setSelectedKPI(null);
            } else {
                console.error("Failed to delete KPI:", data.message);
            }
        } catch (error) {
            console.error("Error deleting KPI:", error);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = (e) => {
        if (e.target === e.currentTarget) {
            setSelectedKPI(null);
        }
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
                                    {Object.keys(kpi.performance_metric).map((metric) => (
                                        <div key={metric}>
                                            <strong>{metric}</strong>
                                        </div>
                                    ))}
                                </td>
                                <td className="py-2 px-3">
                                    {Object.keys(kpi.performance_metric).map((metric) => (
                                        <div key={metric}>
                                            {kpi.performance_metric[metric].text.toString()}
                                        </div>
                                    ))}
                                </td>
                                <td className="py-2 px-3">
                                    {Object.keys(kpi.performance_metric).map((metric) => (
                                        <div key={metric}>
                                            {kpi.performance_metric[metric].image.toString()}
                                        </div>
                                    ))}
                                </td>
                                <td className="py-2 px-3">
                                    <button
                                        onClick={() => handleManageKPI(kpi)}
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

            {selectedKPI && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={closeModal}>
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">Manage KPI</h2>
                        {Object.keys(metricState).map((metric) => (
                            <div key={metric} className="mb-4">
                                <h3 className="font-semibold">{metric}</h3>
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={metricState[metric].text}
                                        onChange={() => handleCheckboxChange(metric, "text")}
                                    />
                                    <span className="ml-2">Text</span>
                                </label>
                                <label className="inline-flex items-center ml-4">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={metricState[metric].image}
                                        onChange={() => handleCheckboxChange(metric, "image")}
                                    />
                                    <span className="ml-2">Image</span>
                                </label>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                className="bg-gray-800 hover:bg-blue-800 text-white px-4 py-2 rounded mr-2"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setSelectedKPI(null)}
                                className="bg-gray-800 hover:bg-red-800 text-white px-4 py-2 rounded"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-gray-800 hover:bg-red-800 text-white px-4 py-2 rounded ml-2"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    {loading && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageKPI;
