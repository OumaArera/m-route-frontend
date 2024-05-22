import React, { useState } from 'react';

const MODIFY_ROUTE = "https://m-route-backend.onrender.com/users/modify-route";

const RouteModal = ({ route, onClose, token, updateRoute }) => {
    const [instructions, setInstructions] = useState(JSON.parse(route.instructions));

    const handleInputChange = (index, field, value) => {
        const updatedInstructions = [...instructions];
        updatedInstructions[index][field] = value;
        setInstructions(updatedInstructions);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${MODIFY_ROUTE}/${route.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ instructions })
            });

            const data = await response.json();

            if (response.ok) {
                updateRoute(route.id, instructions);
                onClose();
            } else {
                alert(data.message || "Failed to update the route.");
            }
        } catch (error) {
            console.error("Error updating route:", error);
            alert("There was an issue updating the route.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg max-w-4xl w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Route Details</h2>
                    <button onClick={onClose} className="text-gray-700">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {instructions.map((instruction, index) => (
                        <div key={index} className="mb-3 p-3 border border-gray-300 rounded">
                            <label>
                                <span className="font-bold">Start Time:</span>
                                <input 
                                    type="datetime-local" 
                                    value={instruction.start} 
                                    onChange={(e) => handleInputChange(index, 'start', e.target.value)}
                                    className="border border-gray-300 rounded ml-2 p-1 w-full"
                                />
                            </label>
                            <label>
                                <span className="font-bold">End Time:</span>
                                <input 
                                    type="datetime-local" 
                                    value={instruction.end} 
                                    onChange={(e) => handleInputChange(index, 'end', e.target.value)}
                                    className="border border-gray-300 rounded ml-2 p-1 w-full"
                                />
                            </label>
                            <label>
                                <span className="font-bold">Instructions:</span>
                                <input 
                                    type="text" 
                                    value={instruction.instructions} 
                                    onChange={(e) => handleInputChange(index, 'instructions', e.target.value)}
                                    className="border border-gray-300 rounded ml-2 p-1 w-full"
                                />
                            </label>
                            <label>
                                <span className="font-bold">Facility:</span>
                                <input 
                                    type="text" 
                                    value={instruction.facility} 
                                    onChange={(e) => handleInputChange(index, 'facility', e.target.value)}
                                    className="border border-gray-300 rounded ml-2 p-1 w-full"
                                />
                            </label>
                            <label>
                                <span className="font-bold">Status:</span>
                                <select 
                                    value={instruction.status} 
                                    onChange={(e) => handleInputChange(index, 'status', e.target.value)}
                                    className="border border-gray-300 rounded ml-2 p-1 w-full"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="complete">Complete</option>
                                </select>
                            </label>
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RouteModal;
