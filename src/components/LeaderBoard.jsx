import React, { useState, useEffect } from 'react';
import { ThreeDots } from 'react-loader-spinner';

const LEADERBOARD_URL = 'https://m-route-backend.onrender.com/users/leaderboard/performance';

const LeaderBoard = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [token, setToken] = useState("");

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
                    setData(result.leaderboard);
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

    return (
        <div className="w-full h-[90vh] bg-white p-4 rounded-lg shadow-lg mt-5">
            <h2 className="text-xl font-bold mb-4">Leaderboard</h2>

            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <ThreeDots color="#00BFFF" height={80} width={80} />
                </div>
            ) : errorMessage ? (
                <p className="text-center text-red-600">{errorMessage}</p>
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
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-200 px-4 py-2">{index + 1}</td>
                                    <td className="border border-gray-200 px-4 py-2">{item.name}</td>
                                    <td className="border border-gray-200 px-4 py-2">{item.score.toFixed(2)}</td>
                                    <td className="border border-gray-200 px-4 py-2">{item.month}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LeaderBoard;
