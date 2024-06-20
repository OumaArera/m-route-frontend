import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const KPI_URL = 'https://m-route-backend.onrender.com/users/get/kpis';

const SimpleBarChart = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [token, setToken] = useState("");
    const [averagePerformance, setAveragePerformance] = useState(0);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) setToken(JSON.parse(accessToken));
    }, []);

    useEffect(() => {
        if (token) fetchKPIData();
    }, [token]);

    const fetchKPIData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(KPI_URL, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const result = await response.json();

            if (result.status_code === 200) {
                const kpis = result.message;
                const aggregatedData = aggregateKPIData(kpis);
                setData(aggregatedData);
                calculateAveragePerformance(aggregatedData);
            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error("Error fetching KPI data:", error);
            setErrorMessage("Failed to fetch KPI data.");
        } finally {
            setIsLoading(false);
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const aggregateKPIData = (kpis) => {
        const metricScores = {};

        kpis.forEach(kpi => {
            const { company_name, sector_name, performance_metric } = kpi;
            for (const metric in performance_metric) {
                const scoreImage = performance_metric[metric].image ? 0.5 : 0;
                const scoreText = performance_metric[metric].text ? 0.5 : 0;
                const score = scoreImage + scoreText;

                if (!metricScores[metric]) {
                    metricScores[metric] = { name: metric, scoreImage, scoreText, score, company_name, sector_name };
                } else {
                    metricScores[metric].scoreImage += scoreImage;
                    metricScores[metric].scoreText += scoreText;
                    metricScores[metric].score += score;
                }
            }
        });

        return Object.values(metricScores);
    };

    const calculateAveragePerformance = (kpis) => {
        if (kpis.length === 0) {
            setAveragePerformance(0);
            return;
        }

        let totalScore = 0;
        kpis.forEach(metric => {
            totalScore += metric.score;
        });

        const averageScore = totalScore / kpis.length;
        setAveragePerformance(averageScore);
    };

    return (
        <div className="w-full h-[90vh] bg-white p-4 rounded-lg shadow-lg mt-5">
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Key Performance Indicators</h2>
                <p className="text-gray-600">Company: {data.length > 0 ? data[0].company_name : '-'}</p>
                <p className="text-gray-600">Sector: {data.length > 0 ? data[0].sector_name : '-'}</p>
                <p className="text-gray-600">Average Total Performance: {averagePerformance.toFixed(2)}</p>
            </div>

            {isLoading ? (
                <p className="text-center text-gray-600">Loading...</p>
            ) : errorMessage ? (
                <p className="text-center text-red-600">{errorMessage}</p>
            ) : (
                <ResponsiveContainer width="100%" height="70%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip cursor={{ fill: 'transparent' }} formatter={(value, name) => [value, name]} labelFormatter={(label) => `${label}:`} />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" name="Overall Score" />
                        <Bar dataKey="scoreImage" fill="#82ca9d" name="Image Score" />
                        <Bar dataKey="scoreText" fill="#ffc658" name="Text Score" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default SimpleBarChart;
