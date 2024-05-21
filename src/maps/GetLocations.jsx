import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const LOCATIONS_URL = "https://m-route-backend.onrender.com/users/locations";
const USERS_URL = "https://m-route-backend.onrender.com/users";
const ROUTE_PLANS_URL = "https://m-route-backend.onrender.com/users/route-plans";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -1.1213293,
  lng: 37.0198416,
};

const GetLocations = () => {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [userLocations, setUserLocations] = useState([]);
  const [userId, setUserId] = useState('');
  const [assignedMerchandisers, setAssignedMerchandisers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const user = localStorage.getItem('user_data');

    if (accessToken) {
      setToken(JSON.parse(accessToken));
    } else {
      console.log("No access token.");
    }

    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser && parsedUser.id) {
        setUserId(parsedUser.id);
      } else {
        console.error('Invalid user data');
      }
    } else {
      console.error('No user data found');
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setError("Loading...");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      await fetchUsersData();
      await getRoutePlans();
      await fetchLatestLocations();
      setIsLoading(false); // Set isLoading to false after all data is fetched
    } catch (error) {
      setError("System experiencing a problem, please try again later.");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const getRoutePlans = async () => {
    try {
      const response = await fetch(ROUTE_PLANS_URL, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.status_code === 200) {
        console.log("Route plans:", data.message);
        const merchandisersList = data.message.filter(manager => manager.manager_id === userId);
        setAssignedMerchandisers(merchandisersList.map(manager => manager.merchandiser_id));
      } else if (data.status_code === 404) {
        setError(data.message);
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    } catch (error) {
      setError("System experiencing a problem, please try again later.");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const isRecentTimestamp = timestamp => {
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const currentTime = new Date().getTime();
    const locationTime = new Date(timestamp).getTime();
    return currentTime - locationTime <= THIRTY_MINUTES;
  };

  useEffect(() => {
    const matchedUserLocations = users.map(user => {
      const location = locations.find(loc => loc.merchandiser_id === user.id);
      if (location) {
        return {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          role: user.role,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp
        };
      }
      return null;
    }).filter(userLocation => userLocation !== null);

    setUserLocations(matchedUserLocations);
  }, [locations, users]);

  const fetchLatestLocations = async () => {
    try {
      const response = await fetch(LOCATIONS_URL, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status_code === 200) {
        console.log("Latest locations", data.message);
        setLocations(data.message);
      } else if (data.status_code === 404) {
        setError(data.message);
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    } catch (error) {
      setError("System experiencing a problem, please try again later.");
    }
  };

  const fetchUsersData = async () => {
    try {
      const response = await fetch(USERS_URL, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status_code === 200) {
        console.log("Users data", data.message);
        const merchandisers = data.message.filter(user => user.role === "merchandiser" && user.status === "active");
        setUsers(merchandisers);
      } else if (data.status_code === 404) {
        setError(data.message);
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    } catch (error) {
      setError("System experiencing a problem, please try again later.");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  console.log(userLocations);

  return (
    <div className="flex flex-col h-screen w-full">
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="flex-grow">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          >
            {userLocations
              .filter(location => assignedMerchandisers.includes(location.id))
              .filter(location => isRecentTimestamp(location.timestamp))
              .map(location => (
                <Marker
                  key={location.id}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  label={location.firstName} 
                  onClick={() => setSelectedLocation(location)}
                />
              ))}

            {selectedLocation && (
              <InfoWindow
                position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div className="p-2 text-sm">
                  <h4 className="font-bold">{selectedLocation.firstName} {selectedLocation.lastName}</h4>
                  <p>Username: {selectedLocation.username}</p>
                  <p>Role: {selectedLocation.role}</p>
                  <p>Last update: {new Date(selectedLocation.timestamp).toLocaleString()}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}
    </div>
  );
}

export default GetLocations;
