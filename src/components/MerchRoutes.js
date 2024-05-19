import React, { useState, useEffect } from 'react';
import moment from 'moment';

const ROUTES_URL = "https://m-route-backend.onrender.com/users/route-plans";
const NOTIFICATIONS_URL = "https://m-route-backend.onrender.com/users/send-notifications"; // Use this URL to update status

const MerchRoutePlans = () => {
    const [routePlans, setRoutePlans] = useState([]);
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("");
    const [notificationsData, setNotificationsData] = useState({})



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

             if (data.successful){
                setRoutePlans(data.message);

             }else{
                setError(data.message);
                setTimeout(() =>{
                    setError("");
                }, 5000)
             }

        } catch (error) {
            console.error('Error fetching route plans:', error);
            setError("There was an error retrieving your routes.");
            setTimeout(() =>{
                setError("");
            }, 5000)
        }
    };
    

    const handleStatusChange = (planId, status, facility) => {
        setSelectedPlan({ planId, status, facility });
        setShowForm(true);
    };

    const handleSubmit = async event =>{
        event.preventdefault();

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
            facility: selectedPlan.facility
        }

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

            if (data.successful){
                setNotification(data.message);
                setTimeout(() => {
                    setNotification("");
                }, 5000);
                setShowForm(false);

            }else{
                setError(data.message);
                setTimeout(() =>{
                    setError("");
                }, 5000)
            }
            
        } catch (error) {
            
        }
    }

    const handleSendNotification = event =>{

        const {name, value} = event.target;

        if (name === "staff_no" && value < 0){
            alert("Please enter a positive value");
            return;
        }
        setNotificationsData(prev =>({
            ...prev,
            [name] : value
        }))


    }
    

    

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8">Route Plans</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {notification && <div className="text-green-500 mb-4">{notification}</div>}
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
                                <tr key={`${plan.id}-${instruction.start}`} className="even:bg-gray-100">
                                    <td className="py-2 px-4 border-b">{instruction.facility}</td>
                                    <td className="py-2 px-4 border-b">{instruction.instructions}</td>
                                    <td className="py-2 px-4 border-b">{moment(instruction.start, 'YYYY-MM-DDTHH:mm').format('DD/MM/YYYY h:mm A')}</td>
                                    <td className="py-2 px-4 border-b">{moment(instruction.end, 'YYYY-MM-DDTHH:mm').format('DD/MM/YYYY h:mm A')}</td>
                                    <td className="py-2 px-4 border-b">{plan.status}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                            onClick={() => handleStatusChange(plan.id, plan.status, instruction.facility)}
                                        >
                                            Update Status
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
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="staffNumber">Staff Number</label>
                                <input
                                    id="staffNumber"
                                    name="staff_no"
                                    type="number"
                                    value={notificationsData.staff_no}
                                    onChange={handleSendNotification}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
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
        </div>
    );
};

export default MerchRoutePlans;




