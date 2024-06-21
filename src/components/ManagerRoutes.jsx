import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { AiOutlineCaretRight, AiOutlineCaretLeft } from "react-icons/ai";
import { HiChevronDoubleRight, HiChevronDoubleLeft } from "react-icons/hi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RouteModal from "./RouteModal";

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
        setCurrentPage(1); // Reset to first page on search
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const toggleModal = (route) => {
        setModalData(route);
    };

    const handleDateChange = async (routeId, instructionId, newStart, newEnd) => {
        try {
            const response = await fetch(`${MODIFY_ROUTE}/${routeId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ start: newStart.toISOString(), end: newEnd.toISOString(), instruction_id: instructionId })
            });
            const data = await response.json();
            if (data.status_code === 200) {
                // Update the local state with the new dates
                setRoutes(prevRoutes => prevRoutes.map(route => {
                    if (route.id === routeId) {
                        const updatedInstructions = JSON.parse(route.instructions).map(instruction => {
                            if (instruction.id === instructionId) {
                                return { ...instruction, start: newStart.toISOString(), end: newEnd.toISOString() };
                            }
                            return instruction;
                        });
                        return { ...route, instructions: JSON.stringify(updatedInstructions) };
                    }
                    return route;
                }));
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            setErrorMessage("Failed to update the dates, please try again.");
        } finally {
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleEditInstruction = async (routeId, instructionId, newStart, newEnd) => {
        try {
            const response = await fetch(`${MODIFY_ROUTE}/${routeId}/instructions/${instructionId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ start: newStart.toISOString(), end: newEnd.toISOString() })
            });
            const data = await response.json();
            if (data.status_code === 200) {
                // Update the local state with the new dates
                setRoutes(prevRoutes => prevRoutes.map(route => {
                    if (route.id === routeId) {
                        const updatedInstructions = JSON.parse(route.instructions).map(instruction => {
                            if (instruction.id === instructionId) {
                                return { ...instruction, start: newStart.toISOString(), end: newEnd.toISOString() };
                            }
                            return instruction;
                        });
                        return { ...route, instructions: JSON.stringify(updatedInstructions) };
                    }
                    return route;
                }));
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            setErrorMessage("Failed to update the instruction dates, please try again.");
        } finally {
            setTimeout(() => setErrorMessage(""), 5000);
        }
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
                <p className="text-red-500">{errorMessage}</p>
            ) : displayedRoutes.length === 0 ? (
                <p className="text-gray-600 flex-grow">No routes found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedRoutes.map((route) => (
                        <div key={route.id} className="border rounded-lg p-4 shadow-sm bg-white">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">{route.merchandiser_name}</h2>
                            <p className="text-gray-600 mb-2">{route.status}</p>
                            <div className="mb-4">
                                <button
                                    onClick={() => toggleModal(route)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg mr-2"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleComplete(route.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-lg"
                                >
                                    Complete
                                </button>
                                <button
                                    onClick={() => handleDeleteRoute(route.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg ml-2"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => setCurrentPage(1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-lg mr-2"
                    >
                        <HiChevronDoubleLeft className="inline-block align-middle" /> First
                    </button>
                    <button
                        onClick={() => setCurrentPage(prevPage => prevPage - 1)}
                        disabled={currentPage === 1}
                        className={`bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-lg mr-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <AiOutlineCaretLeft className="inline-block align-middle" /> Prev
                    </button>
                    <button
                        onClick={() => setCurrentPage(prevPage => prevPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-lg mr-2 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Next <AiOutlineCaretRight className="inline-block align-middle" />
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-lg"
                    >
                        Last <HiChevronDoubleRight className="inline-block align-middle" />
                    </button>
                </div>
            )}

            {modalData && (
                <RouteModal
                    route={modalData}
                    onClose={() => setModalData(null)}
                    onUpdateRoute={updateRoute}
                    onEditInstruction={handleEditInstruction}
                />
            )}
        </div>
    );
};

export default ManagerRoutes;
