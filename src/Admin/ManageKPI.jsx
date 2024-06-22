import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const KPIs_URL = "https://m-route-backend.onrender.com/users/all/kpis";
const UPDATE_KPI_URL = "https://m-route-backend.onrender.com/users/update/kp";

Modal.setAppElement("#root");

const ManageKPI = () => {
    const [token, setToken] = useState("");
    const [performance, setPerformance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKPI, setSelectedKPI] = useState(null);
    const [metricState, setMetricState] = useState({});

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
        setIsModalOpen(true);
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
        console.log("Data going to backend:");
        for (const [metric, values] of Object.entries(metricState)) {
            console.log(`Metric: ${metric}`);
            console.log(`Text: ${values.text}`);
            console.log(`Image: ${values.image}`);
        }
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
            if (data.status_code === 200) {
                // Update the performance state with the new data
                setPerformance((prevState) =>
                    prevState.map((kpi) =>
                        kpi.id === selectedKPI.id ? { ...kpi, performance_metric: metricState } : kpi
                    )
                );
                setIsModalOpen(false);
                fetchKPIs(); // Reload the data
            } else {
                console.error("Failed to update KPI:", data.message);
            }
        } catch (error) {
            console.error("Error updating KPI:", error);
        }
    };

    const handleDelete = () => {
        // Implement delete functionality if needed
        console.log("Delete KPI functionality");
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
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={() => setIsModalOpen(false)}
                    contentLabel="Manage KPI"
                    className="modal-container"
                    overlayClassName="modal-overlay"
                >
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
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
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-800 hover:bg-red-800 text-white px-4 py-2 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ManageKPI;
