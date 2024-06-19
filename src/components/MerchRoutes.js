import React, { useEffect, useState, useRef } from "react";
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
    const [responses, setResponses] = useState({});
    const formRef = useRef(null);
    const [loading, setLoading] = useState(false);


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
                setTimeout(() => setError(""),  5000);
                setIsLoading(false); 
            }
        } catch (error) {
            console.error('Error fetching route plans:', error);
            setError("There was an error retrieving your routes.");
            setTimeout(() => setError(""), 5000);
            setIsLoading(false);
        }
    };

    const handleStatusChange = (planId, instructionId, status, facility, managerId) => {
        const selectedPlan = routePlans.find(plan => plan.id === planId);
        const selectedInstruction = selectedPlan.instructions.find(instruction => instruction.id === instructionId);

        setSelectedPlan({ planId, instructionId, status, facility, managerId, instructions: selectedInstruction.instructions });
        
        const initialResponses = {};
        selectedInstruction.instructions.forEach((instruction, index) => {
            initialResponses[instruction] = {
                text: '',
                image: null
            };
        });

        setResponses(initialResponses);
        setShowForm(true);
    };

    const handleSubmitResponse = async (responses) => {
        setLoading(true);
    
        try {
            const formData = new FormData();
    
            // Append responses to formData
            Object.keys(responses).forEach(key => {
                const response = responses[key];
                formData.append(`response[${key}][text]`, response.text);
                if (response.image) {
                    formData.append(`response[${key}][image]`, response.image);
                } else {
                    formData.append(`response[${key}][image]`, ''); // Ensure image is sent as an empty string if null
                }
            });
    
            // Append other required fields to formData
            formData.append('merchandiser_id', userId);
            formData.append('manager_id', selectedPlan.managerId);
            
            // Format date as string in YYYY-MM-DD format
            const currentDate = new Date().toISOString().split('T')[0];
            formData.append('date_time', currentDate);
    
            formData.append('status', 'pending');
    
            // Log detailed data before sending
            console.log('FormData to be sent:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
    
            console.log('Responses:');
            console.log(responses);
            console.log(`Merchandiser ID: ${userId}`);
            console.log(`Manager ID: ${selectedPlan.managerId}`);
            console.log(`Date: ${new Date().toString()}`); // Display current date/time in a readable format
    
            const response = await fetch(RESPONSE_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData
            });
    
            const data = await response.json();
    
            if (data.successful) {
                setNotification(data.message);
                setTimeout(() => setNotification(""), 5000);
                setShowForm(false);
                setSelectedPlan({});
                await fetchData();
            } else {
                setError(data.message);
                setTimeout(() => setError(""), 5000);
            }
        } catch (error) {
            console.error('Error sending response:', error);
            setError("There was an error sending the response.");
            setTimeout(() => setError(""), 5000);
        } finally {
            setLoading(false);
        }
    };
        

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        await handleSubmitResponse(responses);
    };

    const handleResponseChange = (event) => {
        const { name, value, files } = event.target;
        const [key, type] = name.split('.');
    
        if (type === 'image') {
            const file = files[0];
            setResponses(prevResponses => ({
                ...prevResponses,
                [key]: {
                    ...prevResponses[key],
                    [type]: file // Store file object directly
                }
            }));
        } else {
            setResponses(prevResponses => ({
                ...prevResponses,
                [key]: {
                    ...prevResponses[key],
                    [type]: value
                }
            }));
        }
    };

    const handleBackdropClick = (event) => {
        if (formRef.current && !formRef.current.contains(event.target)) {
            setShowForm(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8">Route Plans</h1>
            
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
                                    return plan.instructions.filter(instruction => !instruction.responded).map(instruction => (
                                        <tr key={`${plan.id}-${instruction.id}`} className="even:bg-gray-100">
                                            <td className="py-2 px-4 border-b">{instruction.facility_name}</td>
                                            <td className="py-2 px-4 border-b">
                                                <ul>
                                                    {instruction.instructions.map((inst, index) => (
                                                        <li key={index}>{inst}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="py-2 px-4 border-b">{moment(plan.date_range.start_date).format('YYYY-MM-DD')}</td>
                                            <td className="py-2 px-4 border-b">{moment(plan.date_range.end_date).format('YYYY-MM-DD')}</td>
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
                        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={handleBackdropClick}>
                            <div ref={formRef} className="bg-white p-8 border border-gray-200 rounded shadow-lg max-h-full overflow-y-auto">
                                <h2 className="text-xl mb-4">Respond to Instruction</h2>
                                <form onSubmit={handleFormSubmit}>
                                    {/* Render form fields for each instruction */}
                                    {selectedPlan.instructions && selectedPlan.instructions.map((instruction, index) => (
                                        <div key={index}>
                                            <label className="block font-medium">{instruction}</label>
                                            <input
                                                type="text"
                                                name={`${instruction}.text`}
                                                value={responses[instruction]?.text || ''}
                                                onChange={handleResponseChange}
                                                className="border border-gray-300 rounded py-2 px-4 w-full mb-2"
                                                required
                                            />
                                            <input
                                                type="file"
                                                name={`${instruction}.image`}
                                                accept="image/*"
                                                onChange={handleResponseChange}
                                                className="border border-gray-300 rounded py-2 px-4 w-full mb-4"
                                            />
                                        </div>
                                    ))}
                                    <div className="flex justify-end space-x-4 mt-4">
                                    {error && <div className="text-red-500 mb-4">{error}</div>}
                                    {notification && <div className="text-green-500 mb-4">{notification}</div>}
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
                            {loading && (
                                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                                    <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MerchRoutePlans;

