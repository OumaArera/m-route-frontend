import { useState, useEffect } from 'react';
import { BiToggleLeft, BiToggleRight } from 'react-icons/bi';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const LOGOUT_URL = 'https://m-route-backend.onrender.com/users/logout';
const LOCATION_URL = 'https://m-route-backend.onrender.com/users/locations';
const CHANGE_PASSWORD_URL = 'https://m-route-backend.onrender.com/users/change-password';

const Settings = ({ setAuthorized }) => {
  const [notifications, setNotifications] = useState({
    routeUpdates: false,
    productInsights: false,
    salesOrders: false,
    competitorActivities: false,
    currentLocation: false,
  });

  const [token, setToken] = useState('');
  const [userId, setUserId] = useState(0);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [locateMerchandiser, setLocateMerchandiser] = useState(false);
  const [passwordChange, setPasswordChange] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const user = localStorage.getItem('user_data');
    const savedNotifications = localStorage.getItem('notifications');

    if (accessToken) {
      setToken(JSON.parse(accessToken));
    }

    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser && parsedUser.id) {
        setUserId(parsedUser.id);
        setEmail(parsedUser.email);  // Assuming the user data contains email
      } else {
        console.error('Invalid user data');
      }
    } else {
      console.error('No user data found');
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  useEffect(() => {
    let intervalId;
    if (locateMerchandiser) {
      intervalId = setInterval(() => {
        getGeolocation();
      }, 5000); // 5 minutes
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [locateMerchandiser]);

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support geolocation');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setPosition(coords);
        setIsLoading(false);
        postGeolocation(coords.latitude, coords.longitude);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
      }
    );
  };

  const postGeolocation = async (latitude, longitude) => {
    const currentTime = new Date();
    const dateTimeString = currentTime.toISOString();

    const newLocation = {
      latitude,
      longitude,
      timestamp: dateTimeString,
      merchandiser_id: userId,
    };

    if (!isLoading && !error && position !== null) {
      try {
        const response = await fetch(LOCATION_URL, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newLocation),
        });

        const data = await response.json();

        if (data.status_code === 201) {
          console.log(data.message);
        } else {
          setError(data.message || 'System experiencing a problem, please try again later.');
        }
      } catch (error) {
        console.log(error);
        setError('Failed to post location.');
      }
    }
  };

  const handleSendLocationToggle = () => {
    setNotifications((prev) => {
      const newValue = !prev.currentLocation;
      setLocateMerchandiser(newValue);
      const updatedNotifications = {
        ...prev,
        currentLocation: newValue,
      };
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
  };

  const logoutUser = async () => {
    try {
      const response = await fetch(LOGOUT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthorized(false);
        navigate('/');
        setToken('');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('notifications');
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => {
      const updatedNotifications = {
        ...prev,
        [key]: !prev[key],
      };
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordChange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(CHANGE_PASSWORD_URL, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: passwordChange.oldPassword,
          new_password: passwordChange.newPassword,
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        console.log(data.message);
        setError('');
        setPasswordChange({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setLoading(false);
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError('An error occurred while changing password');
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center py-36  bg-gray-900 bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start min-h-screen py-16 mb-36 gap-8 lg:gap-36">
        <form className="flex flex-col items-center justify-start gap-8 p-6 md:p-10 lg:p-16 xl:p-20 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[50%] xl:max-w-[40%] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] bg-white rounded-xl">
          <h1 className="text-2xl md:text-2xl lg:text-2xl  text-center font-bold text-darkslateblue-300 mb-4">Profile settings</h1>
          <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center pt-[84px] pb-2 bg-[url('/public/39@2x.png')] bg-cover bg-no-repeat bg-[top]"></div>
          <h2>Change your password below:</h2>
          <input type="email" className="input-field" placeholder="Email" value={email} readOnly />
          <div className="relative w-full">
            <input
              type={passwordVisibility.oldPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Old Password"
              name="oldPassword"
              value={passwordChange.oldPassword}
              onChange={handlePasswordChange}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {passwordVisibility.oldPassword ? (
                <AiFillEyeInvisible className="cursor-pointer" onClick={() => togglePasswordVisibility('oldPassword')} />
              ) : (
                <AiFillEye className="cursor-pointer" onClick={() => togglePasswordVisibility('oldPassword')} />
              )}
            </div>
          </div>
          <div className="relative w-full">
            <input
              type={passwordVisibility.newPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="New Password"
              name="newPassword"
              value={passwordChange.newPassword}
              onChange={handlePasswordChange}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {passwordVisibility.newPassword ? (
                <AiFillEyeInvisible className="cursor-pointer" onClick={() => togglePasswordVisibility('newPassword')} />
              ) : (
                <AiFillEye className="cursor-pointer" onClick={() => togglePasswordVisibility('newPassword')} />
              )}
            </div>
          </div>
          <div className="relative w-full">
            <input
              type={passwordVisibility.confirmPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Confirm New Password"
              name="confirmPassword"
              value={passwordChange.confirmPassword}
              onChange={handlePasswordChange}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {passwordVisibility.confirmPassword ? (
                <AiFillEyeInvisible className="cursor-pointer" onClick={() => togglePasswordVisibility('confirmPassword')} />
              ) : (
                <AiFillEye className="cursor-pointer" onClick={() => togglePasswordVisibility('confirmPassword')} />
              )}
            </div>
          </div>
          <button className="text-white bg-gray-900 px-6 py-2 rounded-full" onClick={handleSubmitPasswordChange}>
            Save changes
          </button>
          {error && <p className="error-message" style={{ color: "red", fontWeight: "bold", margin: "10px 0" }}>{error}</p>}
        </form>
        <div className="flex flex-col items-center lg:items-start justify-start gap-8 py-6 px-8 text-lg text-black font-poppins shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-xl">
          <b className="text-xl text-darkslateblue-300">Notification Preferences</b>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-base">Route Updates</div>
              {notifications.routeUpdates ? (
                <div className="flex items-center">
                  <BiToggleRight className="text-green-500 cursor-pointer text-3xl ml-2" onClick={() => toggleNotification('routeUpdates')} />
                  <span className="ml-2 text-green-500">On</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <BiToggleLeft className="text-gray-900 cursor-pointer text-3xl ml-2" onClick={() => toggleNotification('routeUpdates')} />
                  <span className="ml-2 text-gray-900">Off</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium text-base">Product Insights</div>
              {notifications.productInsights ? (
                <div className="flex items-center">
                  <BiToggleRight className="text-green-500 cursor-pointer text-3xl ml-2" onClick={() => toggleNotification('productInsights')} />
                  <span className="ml-2 text-green-500">On</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <BiToggleLeft className="text-gray-900 cursor-pointer text-3xl ml-2" onClick={() => toggleNotification('productInsights')} />
                  <span className="ml-2 text-gray-900">Off</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium text-base">Sales Orders</div>
              {notifications.salesOrders ? (
                <div className="flex items-center">
                  <BiToggleRight className="text-green-500 cursor-pointer text-3xl ml-2" onClick={() => toggleNotification('salesOrders')} />
                  <span className="ml-2 text-green-500">On</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <BiToggleLeft className="text-gray-900 cursor-pointer text-3xl ml-2" onClick={() => toggleNotification('salesOrders')} />
                  <span className="ml-2 text-gray-900">Off</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium text-base">Competitor Activities</div>
              {notifications.competitorActivities ? (
                <div className="flex items-center">
                  <BiToggleRight className="text-green-500 cursor-pointer text-3xl ml-2" onClick={() => toggleNotification('competitorActivities')} />
                  <span className="ml-2 text-green-500">On</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <BiToggleLeft className="text-gray-900 cursor-pointer text-3xl ml-2" onClick={() => toggleNotification('competitorActivities')} />
                  <span className="ml-2 text-gray-900">Off</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium text-base">Sharing Current Location</div>
              {notifications.currentLocation ? (
                <div className="flex items-center">
                  <BiToggleRight className="text-green-500 cursor-pointer text-3xl ml-2" onClick={handleSendLocationToggle} />
                  <span className="ml-2 text-green-500">On</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <BiToggleLeft className="text-gray-900 cursor-pointer text-3xl ml-2" onClick={handleSendLocationToggle} />
                  <span className="ml-2 text-gray-900">Off</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button className="text-white bg-gray-900 hover:bg-gray-800 px-8 py-3 rounded-full mr-4" onClick={logoutUser}>
          Logout
        </button>
      </div>
    </>
  );
};

export default Settings;
