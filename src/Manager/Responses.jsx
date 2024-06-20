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

        try {
            const response = await fetch(REJECT_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    response_id: id,
                    route_plan_id,
                    instruction_id,
                    status: "rejected"
                })
            });

            const data = await response.json();

            if (data.successful) {
                setResponses((prevResponses) =>
                    prevResponses.filter((response) => response.id !== id)
                );
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
        <>
            {error && (
                <div className="text-white text-center text-xl mb-4 py-4 bg-red-500">
                    {error}
                </div>
            )}
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">
                                Merchandiser
                            </th>
                            <th scope="col" className="py-3 px-6">
                                Response
                            </th>
                            <th scope="col" className="py-3 px-6">
                                Status
                            </th>
                            <th scope="col" className="py-3 px-6">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="4" className="py-4 px-6 text-center">
                                    Loading responses...
                                </td>
                            </tr>
                        )}
                        {responses.map((response) => (
                            <tr
                                key={response.id}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                            >
                                <td className="py-4 px-6">
                                    {response.merchandiser}
                                </td>
                                <td className="py-4 px-6">
                                    {Object.entries(response.response).map(
                                        ([category, data]) => (
                                            <div key={category}>
                                                <p>
                                                    <strong>{category}</strong>:{" "}
                                                    {data.text}
                                                </p>
                                                {data.image && (
                                                    <img
                                                        src={data.image}
                                                        alt={category}
                                                        className="mt-2 h-32 w-32"
                                                    />
                                                )}
                                            </div>
                                        )
                                    )}
                                </td>
                                <td className="py-4 px-6">{response.status}</td>
                                <td className="py-4 px-6">
                                    <button
                                        onClick={() => handleApprove(response.id)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleReject(
                                                response.id,
                                                response.instruction_id,
                                                response.route_plan_id
                                            )
                                        }
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Responses;
