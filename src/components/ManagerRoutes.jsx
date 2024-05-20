import { useState, useEffect } from "react";
import { FaSearch } from 'react-icons/fa';

const MANAGER_ROUTES_URL = "https://m-route-backend.onrender.com/users/manager-routes";
const MODIFY_ROUTE = "https://m-route-backend.onrender.com/users/modify-route";
const DELETE_ROUTE_URL = "https://m-route-backend.onrender.com/users/delete-route-plans";

const ManagerRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRoutes, setExpandedRoutes] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) {
            setToken(JSON.parse(accessToken));
        }
        if (userData) {
            setUserId(JSON.parse(userData).id);
        }
    }, []);

    useEffect(() => {
        if (token && userId) {
            getManagerRoutes();
        }
    }, [token, userId]);

    useEffect(() => {
        if (routes.length > 0) {
            filterRoutesByMerchandiserName(searchTerm);
        }
    }, [routes, searchTerm]);

    const getManagerRoutes = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${MANAGER_ROUTES_URL}/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.status_code === 200) {
                setRoutes(data.message);
                setIsLoading(false);
                setTimeout(() => {
                    setErrorMessage("");
                }, 5000);
            } else if (data.status_code === 404) {
                setErrorMessage(data.message);
                setIsLoading(false);
                setTimeout(() => {
                    setErrorMessage("");
                }, 5000);
            }
        } catch (error) {
            console.log("Error", error);
            setErrorMessage("Failed to get routes, please try again.");
            setIsLoading(false);
            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
        }
    };

    const filterRoutesByMerchandiserName = (searchTerm) => {
        const filtered = routes.filter((route) =>
            route.merchandiser_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRoutes(filtered);
    };

    const handleComplete = async routeId => {
        try {
            const response = await fetch(`${MODIFY_ROUTE}/${routeId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.status_code === 201) {
                setErrorMessage(data.message);
                setTimeout(() => {
                    setErrorMessage("")
                }, 5000)
                getManagerRoutes();

            } else if (data.status_code === 500) {
                console.log(data.message)
                setErrorMessage("Failed to complete the route")
                setTimeout(() => {
                    setErrorMessage("")
                }, 5000)
            }

        } catch (error) {
            console.log(error)
            setErrorMessage("There was an error completing the task")
            setTimeout(() => {
                setErrorMessage("")
            }, 5000)
        }
    }

    const handleDeleteRoute = async routeId => {
        try {
            const response = await fetch(`${DELETE_ROUTE_URL}/${routeId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setErrorMessage(data.message);
                getManagerRoutes();
                setTimeout(() => {
                    setErrorMessage("")
                }, 5000)

            } else {
                setErrorMessage(data.message);
                setTimeout(() => {
                    setErrorMessage("")
                }, 5000)

            }

        } catch (error) {
            console.log(error)
            setErrorMessage("There was an issue deleting the route plan")
            setTimeout(() => {
                setErrorMessage("")
            }, 5000)
        }
    }

    const toggleInstructions = routeId => {
        setExpandedRoutes(prevState => ({
            ...prevState,
            [routeId]: !prevState[routeId]
        }));
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="max-w-7xl mx-auto mt-5 p-5 rounded-lg shadow-lg bg-white">
            <div className="mb-4 flex items-center border border-gray-300 rounded px-3 py-1 w-full">
                <FaSearch className="text-gray-900 mr-2" />
                <input
                    type="text"
                    placeholder="Search by merchandiser name..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="flex-grow outline-none"
                />
            </div>
            {isLoading ? (
                <p className="text-center text-gray-600">Loading...</p>
            ) : errorMessage ? (
                <p className="text-center text-red-600">{errorMessage}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {(searchTerm ? filteredRoutes : routes).map((route) => (
                        <div key={route.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <p><span className="font-bold">Date Range:</span> {route.date_range.start_date} to {route.date_range.end_date}</p>
                            <p><span className="font-bold">Merchandiser:</span> {route.merchandiser_name}</p>
                            <p><span className="font-bold">Staff No:</span> {route.staff_no}</p>
                            <p><span className="font-bold">Status:</span> {route.status}</p>
                            <p className="font-bold">Instructions:</p>
                            {expandedRoutes[route.id] ? (
                                <div>
                                    {JSON.parse(route.instructions).map((instruction, index) => {
                                        // Convert start and end times to Date objects
                                        const startTime = new Date(instruction.start);
                                        const endTime = new Date(instruction.end);

                                        // Format start and end times
                                        const startTimeString = startTime.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
                                        const endTimeString = endTime.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

                                        return (
                                            <div key={index} className="mb-3 p-3 border border-gray-300 rounded">
                                                <p><span className="font-bold">Start Time:</span> {startTimeString}</p>
                                                <p><span className="font-bold">End Time:</span> {endTimeString}</p>
                                                <p><span className="font-bold">Instructions:</span> {instruction.instructions}</p>
                                                <p><span className="font-bold">Facility:</span> {instruction.facility}</p>
                                            </div>
                                        );
                                    })}
                                    <button onClick={() => toggleInstructions(route.id)} className="mt-2 w-full p-2 bg-gray-800 text-white rounded hover:bg-blue-700">View Less</button>
                                </div>
                            ) : (
                                <button onClick={() => toggleInstructions(route.id)} className="mt-2 w-full p-2 bg-gray-800 text-white rounded hover:bg-blue-700">View More</button>
                            )}
                            <div className="flex mt-4 space-x-2">
                                {route.status.toLowerCase() !== 'complete' && (
                                    <button onClick={() => handleComplete(route.id)} className="flex-1 p-2 bg-gray-800 text-white rounded hover:bg-green-500">Complete</button>
                                )}
                                {route.status.toLowerCase() === 'complete' && (
                                    <button className="flex-1 p-2 bg-gray-400 text-white rounded cursor-not-allowed opacity-50">Complete</button>
                                )}
                                <button onClick={() => handleDeleteRoute(route.id)} className="flex-1 p-2 bg-gray-800 text-white rounded hover:bg-red-500">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManagerRoutes;
