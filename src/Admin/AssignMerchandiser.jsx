import { useState, useEffect } from "react";

const ASSIGN_MERCHANDISERS = "https://m-route-backend.onrender.com/users/assign/merchandiser";
const USERS_URL = "https://m-route-backend.onrender.com/users";

const AssignMerchandiser = () => {
    const [token, setToken] = useState("");
    const [merchandisers, setMerchandisers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [dateTime, setDateTime] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [merchandisersId, setMerchandisersId] = useState([]);
    const [managerId, setManagerId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) setToken(JSON.parse(accessToken));
    }, []);

    useEffect(() => {
        if (token) getUsers();
    }, [token]);

    const getUsers = async () => {
        try {
            const response = await fetch(USERS_URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });
            const data = await response.json();
            if (data.status_code === 200) {
                const activeMerchandisers = data.message.filter(user => user.role === 'merchandiser' && user.status === 'active');
                const activeManagers = data.message.filter(user => user.role === 'manager' && user.status === 'active');
                setManagers(activeManagers);
                setMerchandisers(activeMerchandisers);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError("An error occurred while fetching users");
        }
    };

    const handleCheckboxChange = (id) => {
        setMerchandisersId(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setLoading(true);

        const formattedDateTime = dateTime.replace("T", " ") + ":00";

        const merchandisersToAssign = {
            manager_id: managerId,
            merchandiser_id: merchandisersId,
            date_time: formattedDateTime
        };

        try {
            const response = await fetch(ASSIGN_MERCHANDISERS, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(merchandisersToAssign)
            });

            const data = await response.json();
            if (data.status_code === 201) {
                setMessage("Merchandisers assigned successfully");
                setTimeout(() => setMessage(""), 5000);
            } else if(data.status_code === 400) {
                setError(data.message);
                setTimeout(() => setError(""), 5000);
            }else{
                setError("There was an error assigning the merchandisers");
                console.log(`${data.status_code} : ${data.message}`);
                setTimeout(() => setError(""), 5000);
            }
        } catch (error) {
            setError("An error occurred while assigning merchandisers");
            setTimeout(() => setError(""), 5000);
        }finally{
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Assign Merchandiser</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                    Date and Time:
                    <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    />
                </label>
                <label className="block">
                    Manager:
                    <select
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                    >
                        <option value="">Select a manager</option>
                        {managers.map(manager => (
                            <option key={manager.id} value={manager.id}>
                                {manager.first_name} {manager.last_name}
                            </option>
                        ))}
                    </select>
                </label>
                <fieldset className="space-y-2">
                    <legend>Merchandisers:</legend>
                    {merchandisers.map(merchandiser => (
                        <label key={merchandiser.id} className="flex items-center">
                            <input
                                type="checkbox"
                                value={merchandiser.id}
                                onChange={() => handleCheckboxChange(merchandiser.id)}
                                className="mr-2"
                            />
                            {merchandiser.first_name} {merchandiser.last_name}
                        </label>
                    ))}
                </fieldset>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                    Assign
                </button>
                {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
                </div>
                )}
            </form>
        </div>
    );
};

export default AssignMerchandiser;

