import { useEffect, useState, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';

const ROUTES_URL = "https://m-route-backend.onrender.com/users/route-plans";
const USERS_URL = "https://m-route-backend.onrender.com/users"; 

const CreateRoutes = () => {
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: "",
    });
    const [instructionSets, setInstructionSets] = useState([]);
    const [selectedMerchandiser, setSelectedMerchandiser] = useState("");
    const [userId, setUserId] = useState("");
    const [token, setToken] = useState("");
    const [message, setMessage] = useState("");
    const [merchandisers, setMerchandisers] = useState([]);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");
        setToken(JSON.parse(accessToken));
        if (userData) {
            setUserId(JSON.parse(userData).id);
        }
    }, []);

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
                setMerchandisers(data.message.filter(user => user.role === 'merchandiser' && user.status === 'active'));
            } else if(data.status_code === 404) {
                setMessage(data.message);
                setTimeout(() => {
                    setMessage("");
                }, 5000);
            }
        } catch (error) {
            console.log("Error fetching users:", error);
            setMessage("Failed to fetch users, please try again.");
            setTimeout(() => {
                setMessage("");
            }, 5000);
        }
    };

    const merchandiserOptions = useMemo(() => (
        merchandisers.map(merchandiser => (
            <option key={merchandiser.id} value={merchandiser.staff_no}>
                {merchandiser.first_name} {merchandiser.last_name}
            </option>
        ))
    ), [merchandisers]);

    const handleDateRange = (event) => {
        const { name, value } = event.target;
        setDateRange((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleInstructionsChange = (index, event) => {
        const { name, value } = event.target;
        const updatedInstructionSets = instructionSets.map((set, i) =>
            i === index ? { ...set, [name]: value } : set
        );
        setInstructionSets(updatedInstructionSets);
    };


    const handleAddInstructionSet = () => {
        setInstructionSets([...instructionSets, { 
            start: "", 
            end: "", 
            instructions: "", 
            facility: "", 
            status: "pending", 
            id: uuidv4() 
        }]);
    };

    const handleSubmitRoutes = async (event) => {
        event.preventDefault();

        const routes = {
            manager_id: userId,
            staff_no: selectedMerchandiser,
            status: "pending",
            date_range: {
                start_date: dateRange.startDate,
                end_date: dateRange.endDate,
            },
            instructions: instructionSets,
        };

        console.log("Route plans", routes)

        try {
            const response = await fetch(ROUTES_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(routes),
            });

            const data = await response.json();

            if (data.status_code === 201) {
                setMessage(data.message);
                setSelectedMerchandiser("");
                setInstructionSets([]);
                setDateRange({
                    startDate: "",
                    endDate: "",
                });

                setTimeout(() => {
                    setMessage("");
                }, 5000);
            } else {
                setMessage(data.message);
                setTimeout(() => {
                    setMessage("");
                }, 5000);
            }
        } catch (error) {
            console.log(error);
            setMessage("There was a problem creating the route plans");
            setTimeout(() => {
                setMessage("");
            }, 5000);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-5 p-5 rounded-lg shadow-lg bg-white lg:w-1/3">
            <form onSubmit={handleSubmitRoutes}>
                <div className="mb-5">
                    <label htmlFor="startDate" className="font-bold mb-1 block">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        placeholder="YYYY-MM-DD"
                        value={dateRange.startDate}
                        onChange={handleDateRange}
                        required
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                    />
                    <small className="block mt-1">Start Date: YYYY-MM-DD</small>
                </div>
                <div className="mb-5">
                    <label htmlFor="endDate" className="font-bold mb-1 block">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        placeholder="YYYY-MM-DD"
                        value={dateRange.endDate}
                        onChange={handleDateRange}
                        required
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                    />
                    <small className="block mt-1">End Date: YYYY-MM-DD</small>
                </div>
                <div className="mb-5">
                    <label htmlFor="date-instructions" className="font-bold mb-1 block">Activity Date</label>
                    {instructionSets.map((set, index) => (
                        <div key={index} className="mb-5 p-3 border border-gray-200 rounded">
                            <input
                                type="datetime-local"
                                name="start"
                                placeholder="YYYY-MM-DDTHH:MM"
                                value={set.start}
                                onChange={(e) => handleInstructionsChange(index, e)}
                                required
                                className="w-full p-2 mt-1 border border-gray-300 rounded"
                            />
                            <small className="block mt-1">Start: YYYY-MM-DDTHH:MM</small>
                            <br />
                            <input
                                type="datetime-local"
                                name="end"
                                placeholder="YYYY-MM-DDTHH:MM"
                                value={set.end}
                                onChange={(e) => handleInstructionsChange(index, e)}
                                required
                                className="w-full p-2 mt-1 border border-gray-300 rounded"
                            />
                            <small className="block mt-1">End: YYYY-MM-DDTHH:MM</small>
                            <br />
                            <div className="mt-4">
                                <label htmlFor="facility" className="font-bold mb-1 block">Facility Name</label>
                                <input
                                    type="text"
                                    name="facility"
                                    placeholder="Facility name"
                                    value={set.facility}
                                    onChange={(e) => handleInstructionsChange(index, e)}
                                    required
                                    className="w-full p-2 mt-1 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="instructions" className="font-bold mb-1 block">Instructions</label>
                                <textarea
                                    name="instructions"
                                    id="message"
                                    rows={4}
                                    placeholder="Instructions"
                                    value={set.instructions}
                                    onChange={(e) => handleInstructionsChange(index, e)}
                                    required
                                    className="w-full p-2 mt-1 border border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddInstructionSet} className="mt-2 w-full p-2 bg-gray-900 text-white rounded hover:bg-blue-700">
                        + Add Another Set
                    </button>
                </div>
                <div className="mb-5">
                    <label htmlFor="merchandiser" className="font-bold mb-1 block">Select Merchandiser</label>
                    <select
                        name="staff_no"
                        value={selectedMerchandiser}
                        onChange={(e) => setSelectedMerchandiser(e.target.value)}
                        required
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                    >
                        <option value="">Select a merchandiser</option>
                        {merchandiserOptions}
                    </select>
                </div>
                <p className={`${message.includes("problem") ? "text-red-600" : "text-green-600"} font-bold`}>
                    {message}
                </p>
                <button type="submit" className="w-full p-2 bg-gray-900 text-white rounded hover:bg-blue-700">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default CreateRoutes;



