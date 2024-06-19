import React, { useEffect, useState } from "react";
import moment from 'moment';

const ROUTES_URL = "https://m-route-backend.onrender.com/users/merchandisers/routes";
const RESPONSE_URL = "https://m-route-backend.onrender.com/users/post/response";

const MerchRoutePlans = () => {
    const [routePlans, setRoutePlans] = useState([]);
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState("");
    const [error, setError] = useState("");
    const [notification, setNotification] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [responses, setResponses] = useState({}); // State to manage form responses

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");
        setToken(JSON.parse(accessToken));
        if (userData) {
            setUserId(JSON.parse(userData).id);
        }
    }, []);

    useEffect(() => {
        if (token && userId) {
            fetchData();
        }
    }, [token, userId]);

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`${ROUTES_URL}/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.successful) {
                setRoutePlans(data.message);
                setIsLoading(false);
            } else {
                setError(data.message);
                setTimeout(() => {
                    setError("");
                }, 5000);
            }
        } catch (error) {
            console.error('Error fetching route plans:', error);
            setError("There was an error retrieving your routes.");
            setTimeout(() => {
                setError("");
            }, 5000);
        }
    };

    const handleStatusChange = (planId, instructionId, status, facility, managerId) => {
        setSelectedPlan({ planId, instructionId, status, facility, managerId });
        setShowForm(true);
    };

    const handleSubmitResponse = async (responses) => {
        try {
            const response = await fetch(RESPONSE_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    response: responses,
                    merchandiser_id: userId,
                    manager_id: selectedPlan.managerId,
                    date_time: new Date(),
                    status: "pending",
                })
            });
            console.log(`Responses: ${responses}`);
            console.log(`Merchandiser ID: ${userId}`);
            console.log(`Manager ID: ${manager_id}`);
            console.log(`Current Time: ${new Date()}`);

            const data = await response.json();

            if (data.successful) {
                setNotification(data.message);
                setTimeout(() => {
                    setNotification("");
                }, 5000);
                setShowForm(false);
                setSelectedPlan({});
                await fetchData();
            } else {
                setError(data.message);
                setTimeout(() => {
                    setError("");
                }, 5000);
            }
        } catch (error) {
            console.error('Error sending response:', error);
            setError("There was an error sending the response.");
            setTimeout(() => {
                setError("");
            }, 5000);
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        await handleSubmitResponse(responses);
    };

    const handleResponseChange = (event) => {
        const { name, value, files } = event.target;
        setResponses(prevResponses => ({
            ...prevResponses,
            [name]: files ? { file: files[0], text: value } : { text: value }
        }));
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8">Route Plans</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {notification && <div className="text-green-500 mb-4">{notification}</div>}
            {isLoading ? (
                <div className="text-center text-xl">Loading...</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Facility</th>
                                    <th className="py-2 px-4 border-b">Instructions</th>
                                    <th className="py-2 px-4 border-b">Start Date</th>
                                    <th className="py-2 px-4 border-b">End Date</th>
                                    <th className="py-2 px-4 border-b">Status</th>
                                    <th className="py-2 px-4 border-b">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {routePlans.flatMap(plan => {
                                    const instructions = JSON.parse(plan.instructions);
                                    return instructions.filter(instruction => !instruction.responded).map(instruction => (
                                        <tr key={`${plan.id}-${instruction.id}`} className="even:bg-gray-100">
                                            <td className="py-2 px-4 border-b">{instruction.facility_name}</td>
                                            <td className="py-2 px-4 border-b">
                                                <ul>
                                                    {instruction.instructions.map((inst, index) => (
                                                        <li key={index}>{inst}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="py-2 px-4 border-b">{moment(plan.start_date).format('YYYY-MM-DD')}</td>
                                            <td className="py-2 px-4 border-b">{moment(plan.end_date).format('YYYY-MM-DD')}</td>
                                            <td className="py-2 px-4 border-b">{instruction.status}</td>
                                            <td className="py-2 px-4 border-b">
                                                <button
                                                    className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                                                    onClick={() => handleStatusChange(plan.id, instruction.id, instruction.status, instruction.facility_name, plan.manager_id)}
                                                >
                                                    Respond
                                                </button>
                                            </td>
                                        </tr>
                                    ));
                                })}
                            </tbody>
                        </table>
                    </div>
                    {showForm && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="bg-white p-8 border border-gray-200 rounded shadow-lg">
                                <h2 className="text-xl mb-4">Respond to Instruction</h2>
                                <form onSubmit={handleFormSubmit}>
                                    {/* Render form fields for each instruction */}
                                    {Object.keys(selectedPlan).map((key, index) => (
                                        <div key={index}>
                                            <label className="block font-medium">{key}:</label>
                                            <input
                                                type="text"
                                                name={`${key}.text`}
                                                value={responses[key]?.text || ''}
                                                onChange={handleResponseChange}
                                                className="border border-gray-300 rounded py-2 px-4 w-full"
                                            />
                                            <input
                                                type="file"
                                                name={`${key}.image`}
                                                accept="image/*"
                                                onChange={handleResponseChange}
                                                className="border border-gray-300 rounded py-2 px-4 w-full"
                                            />
                                        </div>
                                    ))}
                                    <div className="flex justify-end space-x-4 mt-4">
                                        <button
                                            type="button"
                                            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MerchRoutePlans;
