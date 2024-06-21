import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { AiOutlineCaretRight, AiOutlineCaretLeft } from "react-icons/ai";
import { HiChevronDoubleRight, HiChevronDoubleLeft } from "react-icons/hi";

const MANAGER_ROUTES_URL = "https://m-route-backend.onrender.com/users/manager-routes";
const MODIFY_ROUTE = "https://m-route-backend.onrender.com/users/modify-route";
const DELETE_ROUTE_URL = "https://m-route-backend.onrender.com/users/delete-route-plans";

const ManagerRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalData, setModalData] = useState(null);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const routesPerPage = 12;

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) setToken(JSON.parse(accessToken));
        if (userData) setUserId(JSON.parse(userData).id);
    }, []);

    useEffect(() => {
        if (token && userId) getManagerRoutes();
    }, [token, userId]);

    const getManagerRoutes = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${MANAGER_ROUTES_URL}/${userId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.status_code === 200) {
                setRoutes(data.message);
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            setErrorMessage("Failed to get routes, please try again.");
        } finally {
            setIsLoading(false);
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const updateRoute = (routeId, updatedInstructions) => {
        setRoutes(prevRoutes => prevRoutes.map(route => {
            if (route.id === routeId) {
                return { ...route, instructions: JSON.stringify(updatedInstructions) };
            }
            return route;
        }));
    };

    const filterRoutesByMerchandiserName = (searchTerm) => {
        const filtered = routes.filter(route => route.merchandiser_name.toLowerCase().includes(searchTerm.toLowerCase()));
        return filtered;
    };

    const filteredRoutesByStatus = (routes) => {
        return routes.filter(route => {
            if (filter === 'all') return true;
            return filter === 'complete' ? route.status.toLowerCase() === 'complete' : route.status.toLowerCase() !== 'complete';
        });
    };

    const getDisplayedRoutes = () => {
        const searchedRoutes = filterRoutesByMerchandiserName(searchTerm);
        const statusFilteredRoutes = filteredRoutesByStatus(searchedRoutes);

        const totalPages = Math.ceil(statusFilteredRoutes.length / routesPerPage);
        const displayedRoutes = statusFilteredRoutes.slice((currentPage - 1) * routesPerPage, currentPage * routesPerPage);

        return { displayedRoutes, totalPages, totalFilteredRoutes: statusFilteredRoutes.length };
    };

    const { displayedRoutes, totalPages, totalFilteredRoutes } = getDisplayedRoutes();

    const handleComplete = async (routeId) => {
        try {
            const response = await fetch(`${MODIFY_ROUTE}/${routeId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: 'complete' })
            });
            const data = await response.json();

            setErrorMessage(data.message);
            if (data.status_code === 200) getManagerRoutes();
        } catch (error) {
            setErrorMessage("There was an error completing the task");
        } finally {
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleDeleteRoute = async (routeId) => {
        try {
            const response = await fetch(`${DELETE_ROUTE_URL}/${routeId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
                setErrorMessage("Route deleted successfully.");
            } else {
                const data = await response.json();
                setErrorMessage(data.message || "Failed to delete the route.");
            }
        } catch (error) {
            setErrorMessage("There was an issue deleting the route plan");
        } finally {
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
        setCurrentPage(1);
    };

    const toggleModal = (route) => {
        setModalData(route);
    };

    return (
        <div className="max-w-7xl mx-auto mt-5 p-5 rounded-lg shadow-lg bg-white flex flex-col min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <FaSearch className="text-gray-900 mr-2" />
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search by merchandiser name..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="border border-gray-300 rounded pl-10 pr-3 py-1 w-full"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
                <select
                    value={filter}
                    onChange={handleFilterChange}
                    className="ml-4 border border-gray-300 rounded px-3 py-1"
                >
                    <option value="all">All</option>
                    <option value="complete">Complete</option>
                    <option value="pending">Pending</option>
                </select>
            </div>
            <p className="text-gray-600 mb-4">Showing {displayedRoutes.length} of {totalFilteredRoutes} routes</p>

            {isLoading ? (
                <p className="text-center text-gray-600 flex-grow">Loading...</p>
            ) : errorMessage ? (
                <p className="text-center text-red-600 flex-grow">{errorMessage}</p>
            ) : (
                <div className="flex-grow">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        {displayedRoutes.map((route) => (
                            <div key={route.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <p><span className="font-bold">Date Range:</span> {route.date_range.start_date} to {route.date_range.end_date}</p>
                                <p><span className="font-bold">Merchandiser:</span> {route.merchandiser_name}</p>
                                <p><span className="font-bold">Staff No:</span> {route.staff_no}</p>
                                <p><span className="font-bold">Status:</span> {route.status}</p>
                                <button onClick={() => toggleModal(route)} className="mt-2 w-full p-2 bg-gray-800 text-white rounded hover:bg-blue-700">View More</button>
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
                </div>
            )}

            <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                    {totalPages > 2 && (
                        <button
                            onClick={() => setCurrentPage(1)}
                            className="p-2 bg-gray-800 hover:bg-blue-700 text-white rounded"
                        >
                            <HiChevronDoubleLeft />
                        </button>
                    )}
                    <button
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        className="p-2 bg-gray-800 hover:bg-blue-700 text-white rounded"
                        disabled={currentPage === 1}
                    >
                        <AiOutlineCaretLeft />
                    </button>
                </div>
                <div className="flex items-center">
                    <span className="font-bold">{currentPage}</span>
                    <span className="mx-1">of</span>
                    <span className="font-bold">{totalPages}</span>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        className="p-2 bg-gray-800 hover:bg-blue-700 text-white rounded"
                        disabled={currentPage === totalPages}
                    >
                        <AiOutlineCaretRight />
                    </button>
                    {totalPages > 2 && (
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="p-2 bg-gray-800 hover:bg-blue-700 text-white rounded"
                        >
                            <HiChevronDoubleRight />
                        </button>
                    )}
                </div>
            </div>

            {modalData && (
                <Modal
                    route={modalData}
                    onClose={() => setModalData(null)}
                    updateRoute={updateRoute}
                    token={token}
                />
            )}
        </div>
    );
};

const Modal = ({ route, onClose, updateRoute, token }) => {
    const [updatedInstructions, setUpdatedInstructions] = useState(() => JSON.parse(route.instructions));

    const handleChange = (index, field, value) => {
        const updated = [...updatedInstructions];
        updated[index][field] = value;
        setUpdatedInstructions(updated);
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`https://m-route-backend.onrender.com/users/modify-route/${route.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ instructions: updatedInstructions })
            });
            const data = await response.json();

            if (data.status_code === 200) {
                updateRoute(route.id, updatedInstructions);
                onClose();
            } else {
                console.error("Failed to update route instructions");
            }
        } catch (error) {
            console.error("Error updating route instructions", error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-3/4 max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Route Details</h2>
                <p><strong>Date Range:</strong> {route.date_range.start_date} to {route.date_range.end_date}</p>
                <p><strong>Merchandiser:</strong> {route.merchandiser_name}</p>
                <p><strong>Staff No:</strong> {route.staff_no}</p>
                <p><strong>Status:</strong> {route.status}</p>
                <h3 className="text-lg font-bold mt-4 mb-2">Instructions</h3>
                <ul className="list-disc pl-5 space-y-2">
                    {updatedInstructions.map((instruction, index) => (
                        <li key={index} className="flex flex-col mb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <p className="flex-1">{instruction.details}</p>
                                <input
                                    type="time"
                                    value={instruction.start_time}
                                    onChange={(e) => handleChange(index, 'start_time', e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 ml-2 w-full sm:w-auto"
                                />
                                <input
                                    type="time"
                                    value={instruction.end_time}
                                    onChange={(e) => handleChange(index, 'end_time', e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 ml-2 w-full sm:w-auto"
                                />
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="mr-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-800">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800">Save</button>
                </div>
            </div>
        </div>
    );
};

export default ManagerRoutes;
