import React, { useState, useEffect } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import { FaSearch } from "react-icons/fa";
import { AiOutlineCaretRight, AiOutlineCaretLeft } from "react-icons/ai";
import { HiChevronDoubleRight, HiChevronDoubleLeft } from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LEADERBOARD_URL = 'https://m-route-backend.onrender.com/users/leaderboard/performance';

const LeaderBoard = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [token, setToken] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showGraph, setShowGraph] = useState(false);
    const itemsPerPage = 15;

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) setToken(JSON.parse(accessToken));
    }, []);

    useEffect(() => {
        const fetchLeaderBoardData = async () => {
            setIsLoading(true);
            setErrorMessage("");
            try {
                const response = await fetch(LEADERBOARD_URL, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (result.status_code === 200) {
                    const sortedData = result.leaderboard.sort((a, b) => b.score - a.score);
                    setData(sortedData);
                } else {
                    setErrorMessage(result.message);
                }
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
                setErrorMessage("Failed to fetch leaderboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderBoardData();
    }, [token]);

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const displayedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to the first page on search
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const toggleGraphView = () => {
        setShowGraph(!showGraph);
    };

    return (
        <div className="w-full h-[90vh] bg-white p-4 rounded-lg shadow-lg mt-5">
            <h2 className="text-xl font-bold mb-4">Leaderboard</h2>

            <div className="flex items-center mb-4">
                <FaSearch className="ml-2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border rounded w-64"
                /> 
            </div>

            <div className="mb-4">
                <button
                    onClick={toggleGraphView}
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    {showGraph ? "See Leaderboard" : "See Graph"}
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <ThreeDots color="#00BFFF" height={80} width={80} />
                </div>
            ) : errorMessage ? (
                <p className="text-center text-red-600">{errorMessage}</p>
            ) : showGraph ? (
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={displayedData.slice(0, 10)}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-200">
                        <thead>
                            <tr>
                                <th className="border border-gray-200 px-4 py-2 text-left">Rank</th>
                                <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                                <th className="border border-gray-200 px-4 py-2 text-left">Score</th>
                                <th className="border border-gray-200 px-4 py-2 text-left">Month</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedData.map((item, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-200 px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="border border-gray-200 px-4 py-2">{item.name}</td>
                                    <td className="border border-gray-200 px-4 py-2">{item.score.toFixed(2)}</td>
                                    <td className="border border-gray-200 px-4 py-2">{item.month}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`p-2 ${currentPage === 1 ? "text-gray-400" : "text-blue-500"}`}
                >
                    <HiChevronDoubleLeft size={20} />
                </button>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 ${currentPage === 1 ? "text-gray-400" : "text-blue-500"}`}
                >
                    <AiOutlineCaretLeft size={20} />
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 ${currentPage === totalPages ? "text-gray-400" : "text-blue-500"}`}
                >
                    <AiOutlineCaretRight size={20} />
                </button>
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 ${currentPage === totalPages ? "text-gray-400" : "text-blue-500"}`}
                >
                    <HiChevronDoubleRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default LeaderBoard;
