import { useState, useEffect } from "react";

const RESPONSES_URL = "https://m-route-backend.onrender.com/users/get-responses";

const Responses = () =>{
    const [responses, setResponses] = useState([]);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState("");


    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (accessToken) setToken(JSON.parse(accessToken));
        if (userData) setUserId(JSON.parse(userData).id);
    }, []);

    useEffect(() => getResponses(), [])


    const getResponses = async () =>{

        try {
            const response = await fetch(`${RESPONSES_URL}/${userId}`, {
                method: "GET",
                headers:{
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();

            if (data.successful){
                setResponses(data.message);
            }else{
                setError(data.message);
                setTimeout(() => setError(""), 5000)
            }

        } catch (error) {
            setError(`There was an error: ${error}`);
                setTimeout(() => setError(""), 5000)
        }
    }

    const handleApprove = id =>{
        console.log(id);
    }

    const handleReject = id =>{
        console.log(id);
    }

    return (
        <div className="responses-container">
      {responses.map((response) => (
        <div key={response.id} className="response-card">
          <p><strong>Date:</strong> {response.date_time}</p>
          <p><strong>Merchandiser:</strong> {response.merchandiser}</p>
          <div className="response-details">
            {Object.entries(response.response).map(([kpi, details], index) => (
              <div key={index} className="response-detail">
                <h4>{kpi}</h4>
                <p>{details.text}</p>
                {details.image && <img src={details.image} alt={`${kpi} image`} />}
              </div>
            ))}
          </div>
          <div className="response-actions">
            <button onClick={() => handleApprove(response.id)}>Approve</button>
            <button onClick={() => handleReject(response.id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
    )

}

export default Responses;