import { useState, useEffect } from "react";

const ManageKPI = () =>{
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [performance, setPerformance] = useState([]);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) setToken(JSON.parse(accessToken));
        if (userData) setUserId(JSON.parse(userData).id);
    }, []);

    const getKeyPerformanceIndicators = async () =>{

    }

}

export default ManageKPI;