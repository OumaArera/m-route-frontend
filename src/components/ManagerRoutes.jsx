import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import RouteModal from "./RouteModal";
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
                    "Content-Type": "application/json" // Add this line to specify the content type
                },
                body: JSON.stringify({ status: 'complete' }) // Send the new status as JSON
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
                            className="p-2 bg-gray-800 hover:bg-blue-700 text-white rounded flex items-center"
                        >
                            <HiChevronDoubleLeft />
                        </button>
                    )}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2 ${currentPage === 1 ? 'bg-gray-400' : 'bg-gray-800 hover:bg-blue-700'} text-white rounded flex items-center`}
                    >
                        <AiOutlineCaretLeft />
                    </button>
                </div>
                <span>Page {currentPage} of {totalPages}</span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-2 ${currentPage === totalPages ? 'bg-gray-400' : 'bg-gray-800 hover:bg-blue-700'} text-white rounded flex items-center`}
                    >
                        <AiOutlineCaretRight />
                    </button>
                    {totalPages > 2 && (
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="p-2 bg-gray-800 hover:bg-blue-700 text-white rounded flex items-center"
                        >
                            <HiChevronDoubleRight />
                        </button>
                    )}
                </div>
            </div>

            {modalData && (
                <RouteModal
                    route={modalData}
                    onClose={() => setModalData(null)}
                    token={token}
                    updateRoute={updateRoute}
                />
            )}
        </div>
    );
};

export default ManagerRoutes;

