import React, { useState, useEffect } from "react";

const RESPONSES_URL = "https://m-route-backend.onrender.com/users/get-responses";
const REJECT_URL = "https://m-route-backend.onrender.com/users/reject/response";
const APPROVE_RESPONSE_URL = "https://m-route-backend.onrender.com/users/approve/response";

const Responses = () => {
    const [responses, setResponses] = useState([]);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectData, setRejectData] = useState({ id: "", instruction_id: "", route_plan_id: "", merchandiser_id: "", message: "" });

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) setToken(JSON.parse(accessToken));
        if (userData) setUserId(JSON.parse(userData).id);
    }, []);

    useEffect(() => {
        if (token && userId) {
            getResponses();
        }
    }, [token, userId]);

    const getResponses = async () => {
        setLoading(true);

        try {
            const response = await fetch(`${RESPONSES_URL}/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();

            if (data.successful) {
                setResponses(data.message);
            } else {
                setError(data.message);
                setTimeout(() => setError(""), 5000);
            }
        } catch (error) {
            setError(`There was an error: ${error}`);
            setTimeout(() => setError(""), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, instruction_id, route_plan_id) => {
        setIsLoading(true);
        const approveResponse = {
            response_id: id,
            instruction_id: instruction_id,
            route_plan_id: route_plan_id
        };
        console.log(`Response ID: ${id}`);
        console.log(`Instructions ID: ${instruction_id}`);
        console.log(`Route Plan ID: ${route_plan_id}`);

        try {
            const response = await fetch(APPROVE_RESPONSE_URL, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(approveResponse)
            });

            const data = await response.json();

            if (data.successful) {
                setMessage(data.message);
                setTimeout(() => setMessage(""), 5000);
                getResponses();
            } else {
                setError(data.message);
                setTimeout(() => setError(""), 5000);
            }
        } catch (error) {
            setError(`There was an error: ${error}`);
            setTimeout(() => setError(""), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
    
        const { id, instruction_id, route_plan_id, merchandiser_id, message } = rejectData;
    
        const rejectPayload = {
            instruction_id,
            route_plan_id,
            message,
            manager_id: userId,
            merchandiser_id
        };
    
        try {
            const response = await fetch(`${REJECT_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(rejectPayload)
            });
            const data = await response.json();
    
            if (data.successful) {
                setMessage(data.message);
                setResponses((prevResponses) => prevResponses.filter((response) => response.id !== id));
                setTimeout(() => setMessage(""), 5000);
                getResponses();
            } else {
                setError(data.message);
                setTimeout(() => setError(""), 5000);
            }
        } catch (error) {
            setError(`There was an error: ${error}`);
            setTimeout(() => setError(""), 5000);
        } finally {
            setIsLoading(false);
            setShowRejectModal(false);
        }
    };

    const openRejectModal = (id, instruction_id, route_plan_id, merchandiser_id) => {
        setRejectData({ id, instruction_id, route_plan_id, merchandiser_id, message: "" });
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
    };

    const handleRejectInputChange = (e) => {
        const { name, value } = e.target;
        setRejectData((prevData) => ({ ...prevData, [name]: value }));
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8">Responses</h1>
            {loading ? (
                <div className="text-center text-xl">Loading...</div>
            ) : (
                <>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {responses.map((response) => (
                            <div key={response.id} className="bg-white p-4 border border-gray-200 rounded shadow-md">
                                <p><strong>Date:</strong> {response.date_time}</p>
                                <p><strong>Merchandiser:</strong> {response.merchandiser}</p>
                                <div className="response-details">
                                    {Object.entries(response.response).map(([kpi, details], index) => (
                                        <div key={index} className="mb-4">
                                            <h4 className="font-bold">{kpi}</h4>
                                            <p>{details.text}</p>
                                            {details.image && details.image !== "null" && (
                                                <img
                                                    src={details.image}
                                                    alt={`${kpi} image`}
                                                    className="mt-2 max-w-full h-auto rounded"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => handleApprove(response.id, response.instruction_id, response.route_plan_id)}
                                        className="bg-gray-900 text-white py-1 px-3 rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => openRejectModal(response.id, response.instruction_id, response.route_plan_id, response.merchandiser_id)}
                                        className="bg-gray-900 text-white py-1 px-3 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {isLoading && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
                        </div>
                    )}
                </>
            )}
            {message && <p className="text-green-500 text-xs italic mt-4">{message}</p>}

            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={closeRejectModal}>
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">Provide Reason</h2>
                        <textarea
                            name="message"
                            value={rejectData.message}
                            onChange={handleRejectInputChange}
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                            placeholder="Enter rejection reason"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleReject}
                                className="bg-gray-800 hover:bg-red-800 text-white px-4 py-2 rounded mr-2"
                            >
                                Send
                            </button>
                            <button
                                onClick={closeRejectModal}
                                className="bg-gray-800 hover:bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Responses;


