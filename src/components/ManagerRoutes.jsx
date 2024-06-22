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
        return routes.filter(route => route.merchandiser_name.toLowerCase().includes(searchTerm.toLowerCase()));
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

    const handleSave = async (routeId, instructionId, start, end) => {
        try {
            const response = await fetch(`${MODIFY_ROUTE}/${routeId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    instruction_id: instructionId,
                    start: start,
                    end: end
                })
            });
            const data = await response.json();

            if (data.status_code === 200) {
                getManagerRoutes();
                setErrorMessage("Instruction updated successfully.");
            } else {
                setErrorMessage(data.message || "Failed to update the instruction.");
            }
        } catch (error) {
            setErrorMessage("There was an issue updating the instruction.");
        } finally {
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleDateChange = (routeId, instructionId, start, end) => {
        setRoutes(prevRoutes =>
            prevRoutes.map(route => {
                if (route.id === routeId) {
                    const updatedInstructions = JSON.parse(route.instructions).map(instruction => {
                        if (instruction.id === instructionId) {
                            return { ...instruction, start, end };
                        }
                        return instruction;
                    });
                    return { ...route, instructions: JSON.stringify(updatedInstructions) };
                }
                return route;
            })
        );
    };

    const closeModal = (e) => {
        if (e.target === e.currentTarget) setModalData(null);
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
                                <p><span className="font-bold">Date Range:</span> {new Date(route.date_range.start_date).toLocaleString()} to {new Date(route.date_range.end_date).toLocaleString()}</p>
                                <p><span className="font-bold">Merchandiser:</span> {route.merchandiser_name}</p>
                                <p><span className="font-bold">Staff No:</span> {route.staff_no}</p>
                                <p><span className="font-bold">Route Status:</span> {route.status}</p>
                                <div className="flex justify-end space-x-2 mt-2">
                                    <button
                                        className="px-2 py-1 bg-gray-900 hover:bg-blue-600 text-white rounded"
                                        onClick={() => toggleModal(route)}
                                    >
                                        View Instructions
                                    </button>
                                    <button
                                        className="px-2 py-1 bg-gray-900 hover:bg-blue-600 text-white rounded"
                                        onClick={() => handleComplete(route.id)}
                                    >
                                        Complete
                                    </button>
                                    <button
                                        className="px-2 py-1 bg-gray-900 hover:bg-red-600 text-white rounded"
                                        onClick={() => handleDeleteRoute(route.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-2">
                            <button
                                className="px-2 py-1 bg-gray-300 rounded"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <HiChevronDoubleLeft />
                            </button>
                            <button
                                className="px-2 py-1 bg-gray-300 rounded"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <AiOutlineCaretLeft />
                            </button>
                        </div>
                        <span>Page {currentPage} of {totalPages}</span>
                        <div className="flex items-center space-x-2">
                            <button
                                className="px-2 py-1 bg-gray-300 rounded"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <AiOutlineCaretRight />
                            </button>
                            <button
                                className="px-2 py-1 bg-gray-300 rounded"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <HiChevronDoubleRight />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={closeModal}>
                    <div className="bg-white p-4 rounded-lg w-1/2 h-3/4 overflow-y-scroll" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Instructions</h2>
                        {JSON.parse(modalData.instructions).map((instruction, index) => (
                            <div key={instruction.id} className="mb-4">
                                <h3 className="text-md font-semibold mb-2">Instruction {index + 1}</h3>
                                <ul className="list-disc list-inside mb-2">
                                    {instruction.instructions.map((instr, idx) => (
                                        <li key={idx}>{instr}</li>
                                    ))}
                                </ul>
                                <div className="mb-2">
                                    <p><span className="font-bold">Facility:</span> {instruction.facility}</p>
                                    <p><span className="font-bold">Status:</span> {instruction.status}</p>
                                </div>
                                <div className="mb-2">
                                    <p><span className="font-bold">Start Date and Time:</span></p>
                                    <input
                                        type="datetime-local"
                                        value={instruction.start || ""}
                                        onChange={e => handleDateChange(modalData.id, instruction.id, e.target.value, instruction.end)}
                                        className="border border-gray-300 rounded p-1"
                                    />
                                </div>
                                <div className="mb-4">
                                    <p><span className="font-bold">End Date and Time:</span></p>
                                    <input
                                        type="datetime-local"
                                        value={instruction.end || ""}
                                        onChange={e => handleDateChange(modalData.id, instruction.id, instruction.start, e.target.value)}
                                        className="border border-gray-300 rounded p-1"
                                    />
                                </div>
                                <button
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded"
                                    onClick={() => handleSave(modalData.id, instruction.id, instruction.start, instruction.end)}
                                >
                                    Save
                                </button>
                            </div>
                        ))}
                        <button
                            className="mt-4 px-3 py-1 bg-gray-500 text-white rounded"
                            onClick={() => setModalData(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerRoutes;
