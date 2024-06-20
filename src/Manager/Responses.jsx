import { useState, useEffect } from "react";

const RESPONSES_URL = "https://m-route-backend.onrender.com/users/get-responses";
const REJECT_URL = "https://m-route-backend.onrender.com/users/reject/response";

const Responses = () => {
    const [responses, setResponses] = useState([]);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);

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

        const rejectData ={
            "instruction_id": instruction_id,
            "route_plan_id": route_plan_id
        }

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
                setResponses(responses.filter(response => response.id !== id));
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
        <div className="responses-container">
            {loading && <div>Loading...</div>}
            {error && <div className="error-message">{error}</div>}
            {responses.map((response) => (
                <div key={response.id} className="response-card">
                    <p><strong>Date:</strong> {response.date_time}</p>
                    <p><strong>Merchandiser:</strong> {response.merchandiser}</p>
                    <div className="response-details">
                        {Object.entries(response.response).map(([kpi, details], index) => (
                            <div key={index} className="response-detail">
                                <h4>{kpi}</h4>
                                <p>{details.text}</p>
                                {details.image && <img src={details.image} alt={`${kpi} image`} />}
                            </div>
                        ))}
                    </div>
                    <div className="response-actions">
                        <button onClick={() => handleApprove(response.id)}>Approve</button>
                        <button onClick={() => handleReject(response.id, response.instruction_id, response.route_plan_id)}>Reject</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Responses;
