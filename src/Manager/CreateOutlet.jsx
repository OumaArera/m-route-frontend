import { useEffect, useState } from "react";

const CREATE_OUTLET_URL = "https://m-route-backend.onrender.com/users/create/facility";

const CreateOutlet = () =>{
    const [location, setLocation] = useState("");
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) setToken(JSON.parse(accessToken));
        if (userData) setUserId(JSON.parse(userData).id);
    }, []);

    const handleSubmit =  async event => {
        event.preventDefault();
        const newOutlet = {
            "manager_id": userId,
            "location": location,
            "name": name,
            "type": type
        }
        try {
            const response = await fetch(CREATE_OUTLET_URL, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newOutlet)
            });
    
            const data = await response.json();
    
            if (data.status_code === 201){
                setLocation("");
                setName("");
                setType("");
                setMessage("Outlet created successfully.");
                setTimeout(() => setMessage(""), 5000);
            }else if (data.status_code === 400){
                setError(data.message);
                setTimeout(() => setError(""), 5000);
            }else{
                setError("There was an error creating the outlet.");
                console.log(data.message);
                setTimeout(() => setError(""), 5000);
            }
        } catch (error) {
            setError("There was an error creating the outlet.");
            console.error(error);
            setTimeout(() => setError(""), 5000);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Outlet Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Location:</label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Type:</label>
                    <input
                        type="text"
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Create Outlet
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateOutlet;
