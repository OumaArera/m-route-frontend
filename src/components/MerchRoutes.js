import React, { useEffect, useState, useMemo } from "react";
import moment from 'moment';

const ROUTES_URL = "https://m-route-backend.onrender.com/users/route-plans";
const NOTIFICATIONS_URL = "https://m-route-backend.onrender.com/users/send-notifications"; 
const USERS_URL = "https://m-route-backend.onrender.com/users"; 
const UPDATE_STATUS_URL = "https://m-route-backend.onrender.com/users/change-route-status";

const MerchRoutePlans = () => {
    const [routePlans, setRoutePlans] = useState([]);
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState("");
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({});
    const [notificationsData, setNotificationsData] = useState({})
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(USERS_URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (data.status_code === 200) {
                setManagers(data.message.filter(user => user.role === 'manager' && user.status === 'active'));

            } else if(data.status_code === 404) {
                setError(data.message);
                    setTimeout(() => {
                        setError("");
                    }, 5000)
            }
        } catch (error) {
            console.log("Error fetching users:", error);
            setError(error);
                    setTimeout(() => {
                        setError("");
                    }, 5000)
        }
    };

    const managerOptions = useMemo(() => (
        managers.map(manager => (
            <option key={manager.id} value={manager.staff_no}>
                {manager.first_name} {manager.last_name}
            </option>
        ))
    ), [managers]);

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
                }, 5000)
            }

        } catch (error) {
            console.error('Error fetching route plans:', error);
            setError("There was an error retrieving your routes.");
            setTimeout(() => {
                setError("");
            }, 5000)
        }
    };

    const handleStatusChange = (planId, instructionId, status, facility) => {
        setSelectedPlan({ planId, instructionId, status, facility });
        setShowForm(true);
    };


    const UpdateInstruction = async () =>{

        const instructionDetails = {
            instruction_id: selectedPlan.instructionId,
            status: selectedPlan.status
        }

        try {

            const response = await fetch(`${UPDATE_STATUS_URL}/${selectedPlan.planId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                },
                body: JSON.stringify(instructionDetails)
            });

            const data = await response.json();

            if (data.status_code === 201){
                setNotification(data.message);
                setTimeout(() => {
                    setNotification("");
                }, 5000);

            }else if(data.status_code === 400 || data.status_code === 404 || data.status_code === 500){
                setError(data.message);
                setTimeout(() => {
                    setError("");
                }, 5000)

            }

            
        } catch (error) {
            
        }
    }

    const handleSubmit = async () => {
        

        const currentTime = new Date();
        const year = currentTime.getFullYear();
        const month = String(currentTime.getMonth() + 1).padStart(2, '0');
        const day = String(currentTime.getDate()).padStart(2, '0');
        const hours = String(currentTime.getHours()).padStart(2, '0');
        const minutes = String(currentTime.getMinutes()).padStart(2, '0');
        const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;

        const notificationBody = {
            staff_no: notificationsData.staff_no,
            content: notificationsData.content,
            timestamp: dateTimeString,
            status: selectedPlan.status,
            merchandiser_id: userId,
            facility: selectedPlan.facility,
        };

        try {
            const response = await fetch(NOTIFICATIONS_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(notificationBody)
            });

            const data = await response.json();

            if (data.successful) {
                setNotification(data.message);
                setTimeout(() => {
                    setNotification("");
                }, 5000);
                setShowForm(false);
                setSelectedPlan({});
                setNotificationsData({});

            } else {
                setError(data.message);
                setTimeout(() => {
                    setError("");
                }, 5000)
            }

        } catch (error) {
            console.error('Error sending notification:', error);
            setError("There was an error sending the notification.");
            setTimeout(() => {
                setError("");
            }, 5000)
        }
    };

    const handleSendNotification = event => {
        const { name, value } = event.target;

        if (name === "staff_no" && value < 0) {
            alert("Please enter a positive value");
            event.target.value = Math.max(0, value);
            return;
        }
        setNotificationsData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = async event => {
        event.preventDefault();
        const instructionUpdated = await UpdateInstruction();
        const notificationSent = await handleSubmit();

        if (instructionUpdated && notificationSent) {
            await fetchData();
        }
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
                                    return instructions.map(instruction => (
                                        <tr key={`${plan.id}-${instruction.id}`} className="even:bg-gray-100">
                                            <td className="py-2 px-4 border-b">{instruction.facility}</td>
                                            <td className="py-2 px-4 border-b">{instruction.instructions}</td>
                                            <td className="py-2 px-4 border-b">{moment(instruction.start, 'YYYY-MM-DDTHH:mm').format('DD/MM/YYYY h:mm A')}</td>
                                            <td className="py-2 px-4 border-b">{moment(instruction.end, 'YYYY-MM-DDTHH:mm').format('DD/MM/YYYY h:mm A')}</td>
                                            <td className="py-2 px-4 border-b">{instruction.status}</td>
                                            <td className="py-2 px-4 border-b text-center">
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                                    onClick={() => handleStatusChange(plan.id, instruction.id, instruction.status, instruction.facility)}
                                                >
                                                    Send Notification
                                                </button>
                                            </td>
                                        </tr>
                                    ));
                                })}
                            </tbody>
                        </table>
                    </div>

                    {showForm && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                            <div className="bg-white p-4 rounded shadow-lg w-96">
                                <h2 className="text-xl font-bold mb-4">Update Status</h2>
                                <form onSubmit={handleFormSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="managerSelect">Select Manager</label>
                                        <select
                                            id="managerSelect"
                                            name="staff_no"
                                            value={notificationsData.staff_no}
                                            onChange={handleSendNotification}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        >
                                            <option value="">Select a manager</option>
                                            {managerOptions}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">Content</label>
                                        <textarea
                                            id="content"
                                            name="content"
                                            value={notificationsData.content}
                                            onChange={handleSendNotification}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                                        <select
                                            value={selectedPlan.status}
                                            onChange={(e) => setSelectedPlan({ ...selectedPlan, status: e.target.value })}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="complete">Complete</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="submit"
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        >
                                            Submit
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
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






