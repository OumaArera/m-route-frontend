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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [mapCenter, setMapCenter] = useState(center); 

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
      const intervalId = setInterval(fetchLatestLocations, 3 * 60 * 1000); 
      return () => clearInterval(intervalId); 
    }
  }, [token]);

  const fetchData = async () => {
    try {
      await fetchUsersData();
      await getRoutePlans();
      await fetchLatestLocations();
      setIsLoading(false);
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
    console.log("User locations", userLocations);
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

  const handleSearch = () => {
    const foundLocation = userLocations.find(
      (location) => 
        location.firstName.toLowerCase() === searchTerm.toLowerCase() ||
        location.lastName.toLowerCase() === searchTerm.toLowerCase() ||
        `${location.firstName.toLowerCase()} ${location.lastName.toLowerCase()}` === searchTerm.toLowerCase()
    );
    if (foundLocation) {
      setSelectedLocation(foundLocation);
      setMapCenter({ lat: foundLocation.latitude, lng: foundLocation.longitude });
    } else {
      setError("Merchandiser not found.");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };
  



  return (
    <div className="flex flex-col h-screen w-full">
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter merchandiser's first, last or both names"
          className="p-2 border border-gray-300 rounded mr-2"
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Search
        </button>
      </div>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="flex-grow">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
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



