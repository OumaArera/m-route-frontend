import { useState, useEffect } from "react";

const RESPONSES_URL = "https://m-route-backend.onrender.com/users/get-responses";
const REJECT_URL = "https://m-route-backend.onrender.com/users/reject/response";

const Responses = () => {
    const [responses, setResponses] = useState([]);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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

    const handleApprove = (id) => {
        console.log(id);
    };

    const handleReject = async (id, instruction_id, route_plan_id) => {
        setLoading(true);

        const rejectData = {
            "instruction_id": instruction_id,
            "route_plan_id": route_plan_id
        };

        try {
            const response = await fetch(`${REJECT_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(rejectData)
            });
            const data = await response.json();

            if (data.successful) {
                setMessage("Rejected successfully.");
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
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
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
                                onClick={() => handleApprove(response.id)}
                                className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleReject(response.id, response.instruction_id, response.route_plan_id)}
                                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                            >
                                Reject
                            </button>
                            {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Responses;
