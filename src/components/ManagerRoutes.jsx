import { useState, useEffect } from "react";

const MANAGER_ROUTES_URL = "https://m-route-backend.onrender.com/users/manager-routes";
const MODIFY_ROUTE = "https://m-route-backend.onrender.com/users/modify-route";
const DELETE_ROUTE_URL = "https://m-route-backend.onrender.com/users/delete-route-plans";

const ManagerRoutes = () =>{

    const [routes, setRoutes] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRoutes, setExpandedRoutes] = useState({});

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


    
    const getManagerRoutes = async () =>{
        setIsLoading(true);

        try {
            const response = await fetch(`${MANAGER_ROUTES_URL}/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.status_code === 200){
                setRoutes(data.message);
                setIsLoading(false);
                setTimeout(() =>{
                    setErrorMessage("")
                }, 5000)

            }else if (data.status_code === 404){
                setErrorMessage(data.message);
                setIsLoading(false);
                setTimeout(() =>{
                    setErrorMessage("")
                }, 5000)
            }
            
        } catch (error) {
            console.log("Error", error);
            setErrorMessage("Failed to get routes, please try again.");
            setIsLoading(false);
            setTimeout(() =>{
                setErrorMessage("")
            }, 5000)
        }
    }


    const handleComplete = async routeId =>{

        try {
            const response = await fetch(`${MODIFY_ROUTE}/${routeId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.status_code === 201){
                setErrorMessage(data.message);
                setTimeout(() =>{
                    setErrorMessage("")
                }, 5000)
                getManagerRoutes();

            }else if (data.status_code === 500){
                console.log(data.message)
                setErrorMessage("Failed to complete the route the route")
                setTimeout(() =>{
                    setErrorMessage("")
                }, 5000)
            }
            
        } catch (error) {
            console.log(error)
            setErrorMessage("There was an error completing the task")
            setTimeout(() =>{
                setErrorMessage("")
            }, 5000)
        }
    }


    const handleDeleteRoute = async routeId =>{

        try {
            const response = await fetch(`${DELETE_ROUTE_URL}/${routeId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.status_code === 204){
                setErrorMessage(data.message);
                getManagerRoutes();
                setTimeout(() =>{
                    setErrorMessage("")
                }, 5000)

            }else if (data.status_code === 404){
                setErrorMessage(data.message);
                setTimeout(() =>{
                    setErrorMessage("")
                }, 5000)

            }else if (data.status_code === 500){
                console.log(data.message);
                setErrorMessage("Failed to delete the route plan.");
                setTimeout(() =>{
                    setErrorMessage("")
                }, 5000)
            }
            
        } catch (error) {
            console.log(error)
            setErrorMessage("There was an issue deleting the route plan")
            setTimeout(() =>{
                setErrorMessage("")
            }, 5000)
        }
    }


    const toggleInstructions = (routeId) => {
        setExpandedRoutes(prevState => ({
            ...prevState,
            [routeId]: !prevState[routeId]
        }));
    };


    return (
<div>
  {isLoading ? (
    <p>Loading...</p>
  ) : errorMessage ? (
    <p>{errorMessage}</p>
  ) : (
    <div className="route-container"> {/* Added container class */}
      {routes.map((route) => (
        <div key={route.id} className="route-card">
          <p>Date Range: {route.date_range.start_date} to {route.date_range.end_date}</p>
          <p>Merchandiser: {route.merchandiser_name}</p>
          <p>Staff No: {route.staff_no}</p>
          <p>Status: {route.status}</p>
          <p>Instructions:</p>
          {expandedRoutes[route.id] ? (
            <div>
              {JSON.parse(route.instructions).map((instruction, index) => (
                <div key={index}>
                  <p>DateTime: {instruction.dateTime}</p>
                  <p>Instructions: {instruction.instructions}</p>
                  <p>Facility: {instruction.facility}</p>
                </div>
              ))}
              <button className="text-white bg-black hover:bg-blue-600 px-3 py-1 rounded-md m-2" onClick={() => toggleInstructions(route.id)}>
                View Less
              </button>
            </div>
          ) : (
            <button className="text-white bg-black hover:bg-blue-600 px-3 py-1 rounded-md m-2" onClick={() => toggleInstructions(route.id)}>
              View More
            </button>
          )}
          <button className="text-white bg-black hover:bg-green-600 px-3 py-1 rounded-md m-2" onClick={() => handleComplete(route.id)}>
            Complete
          </button>
          <button className="text-white bg-black hover:bg-red-600 px-3 py-1 rounded-md m-2" onClick={() => handleDeleteRoute(route.id)}>
            Delete
          </button>
          <br />
          <br />
        </div>
      ))}
    </div>
  )}
</div>


    )
}

export default ManagerRoutes;



