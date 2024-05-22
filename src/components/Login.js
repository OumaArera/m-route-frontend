import { useState, useEffect } from "react";
import { AiOutlineClose, AiOutlineLock, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FiMail } from "react-icons/fi";
import { MdCheckBoxOutlineBlank, MdCheckBox } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";

const LOGIN_URL = 'https://m-route-backend.onrender.com/users/login';
const CHANGE_PASSWORD_URL = "https://m-route-backend.onrender.com/users/change-password"

const Login = ({ setAuthorized, setRoleCheck, setAdmin, setUserData }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordExpire, setPasswordExpired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordChange, setPasswordChange] = useState({
    email: "",
    oldPassword: "",
    newPassword: ""
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    oldPassword: false,
    newPassword: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");
    const previousRoute = localStorage.getItem("previous_route");

    if (accessToken && userData) {
      const userDataObj = JSON.parse(userData);
      setAuthorized(true);
      setUserData(userDataObj);

      if (userDataObj.role === "manager") {
        setRoleCheck(true);

      }else if(userDataObj.role === "admin"){
        setAdmin(true);

      }
      if (previousRoute) {
        navigate("/");
      } else {
        navigate('/');
      }
    }

  }, [setAuthorized, setUserData, navigate]);

  useEffect(() => {
    localStorage.setItem("previous_route", JSON.stringify(location.pathname));
  }, [location.pathname]);

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const handleEmailChange = event => {
    setEmail(event.target.value.toLowerCase());
  };

  const handlePassword = event => {
    setPassword(event.target.value);
  };

  const handleChangePassword = event => {
    const { name, value } = event.target;
    setPasswordChange(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const changePassword = async event => {
    event.preventDefault();

    const newPasswordData = {
      "email": passwordChange.email,
      "old_password": passwordChange.oldPassword,
      "new_password": passwordChange.newPassword
    };

    try {
      setLoading(true);
      const response = await fetch(CHANGE_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newPasswordData)
      });

      const data = await response.json();

      if (data.status_code === 201) {
        setLoading(false);
        setError(data.message);
        setPasswordChange({
          email: "",
          oldPassword: "",
          newPassword: ""
        });
        setTimeout(() => {
          setError("");
          setPasswordExpired(false);
          navigate('/login');
        }, 2000);
      } else if (data.status_code === 400 || data.status_code === 401 || data.status_code === 404) {
        setLoading(false);
        setTimeout(() => {
          setError("");
        }, 2000);
        setError(data.message);
      } else if (data.status_code === 500) {
        setLoading(false);
        setError("There was an error changing your password, try again later.");
        setTimeout(() => {
          setError("");
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error", error);
      setError("There was an error changing your password.");
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  };

  const handleLogin = async event => {
    event.preventDefault();
    setError("");
    setLoading(true);


    try {
      const requestBody = {
        email,
        password
      };

      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.status_code === 201) {
        setLoading(false);
        const accessToken = data.access_token;
        setPassword("");
        setEmail("");
        setAuthorized(true);
        navigate('/myroutes');

        if (data.message.role === "manager") {
          setRoleCheck(true);
          navigate('/routes')
        }else if(data.message.role === "admin"){
          setAdmin(true);
          navigate('/manageusers')
        }
  

        const userData = {
          "id": data.message.user_id,
          "role": data.message.role,
          "username": data.message.username,
          "email": data.message.email,
          "last_name": data.message.last_name,
          "avatar": data.message.avatar,
          "last_login": data.message.last_login
        };
        setUserData(userData)
        localStorage.setItem("user_data", JSON.stringify(userData));
        localStorage.setItem("access_token", JSON.stringify(accessToken));
        
      } else if (data.status_code === 400 || data.status_code === 409 || data.status_code === 401) {
        setLoading(false);
        setError(data.message);
        setTimeout(() => {
          setError("");
        }, 2000);
      } else if (data.status_code === 403) {
        setLoading(false);
        setError(data.message);
        setPasswordExpired(true);
        setPassword("");
        setEmail("");
        setTimeout(() => {
          setError("");
        }, 2000);
      } else if (data.status_code === 404) {
        setLoading(false);
        setError(data.message);
        setTimeout(() => {
        }, 2000);
        setTimeout(() => {
          setError("");
        }, 2000);
      } else {
        setLoading(false);
        setError("There was an error logging, try again later");
        setTimeout(() => {
          setError("");
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      console.error('An error occurred while logging in:', error);
      setError("There was an error logging in, try again later");
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  };

  return (
    <>
    {loading && (
      <div className="fixed inset-0 flex items-center justify-center py-36  bg-gray-900 bg-opacity-50 z-50">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
      </div>
    )}
    
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 gap-4 relative">
        <div className="absolute top-0 right-0">
          <Link to="/">
            <AiOutlineClose className="h-6 w-6 text-gray-700 mt-2 mr-4" />
          </Link>
        </div>
        <b className="text-gray-900 text-lg">Log In</b>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-700">Email</div>
            <div className="border border-gray-300 px-3 py-2 rounded-md flex items-center">
              <FiMail className="h-5 w-5 mr-2" />
              <input
                className="pl-2 flex-grow bg-white focus:outline-none"
                placeholder="mymail@gmail.com"
                type="text"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-700">Password</div>
            <div className="border border-gray-300 px-3 py-2 rounded-md flex items-center relative">
              <AiOutlineLock className="h-5 w-5 mr-2" />
              <input
                className="pl-2 flex-grow focus:outline-none"
                placeholder="Password"
                type={passwordVisibility.password ? "text" : "password"}
                value={password}
                onChange={handlePassword}
              />
              <div className="absolute right-2">
                {passwordVisibility.password ? (
                  <AiFillEyeInvisible className="h-5 w-5 cursor-pointer" onClick={() => togglePasswordVisibility('password')} />
                ) : (
                  <AiFillEye className="h-5 w-5 cursor-pointer" onClick={() => togglePasswordVisibility('password')} />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center self-start gap-1 text-gray-700 text-sm">
          <button type="button" onClick={handleRememberMeChange} className="focus:outline-none">
            {rememberMe ? (
              <MdCheckBox className="h-5 w-5" />
            ) : (
              <MdCheckBoxOutlineBlank className="h-5 w-5" />
            )}
          </button>
          <p>Remember me</p>
        </div>
        <button
          className="bg-gray-900 text-white px-4 py-2 rounded-md mt-4 self-stretch"
          type="submit"
          onClick={handleLogin}
        >
          Login
        </button>
        {error && (
          <div className="text-red-500 mt-2 text-sm text-center">{error}</div>
        )}
        <Link to="/forgot-password" className="text-sm text-gray-900 underline">
          Forgot password?
        </Link>
      </form>
    </div>
    {passwordExpire && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <form
          className="bg-white p-8 rounded-lg shadow-md"
          onSubmit={changePassword}
        >
          <h2 className="text-lg font-medium mb-4">Change Password</h2>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
              type="text"
              name="email"
              value={passwordChange.email}
              onChange={handleChangePassword}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Old Password</label>
            <div className="border border-gray-300 px-3 py-2 rounded-md flex items-center relative">
              <AiOutlineLock className="h-5 w-5 mr-2" />
              <input
                className="pl-2 flex-grow focus:outline-none"
                type={passwordVisibility.oldPassword ? "text" : "password"}
                name="oldPassword"
                value={passwordChange.oldPassword}
                onChange={handleChangePassword}
              />
              <div className="absolute right-2">
                {passwordVisibility.oldPassword ? (
                  <AiFillEyeInvisible className="h-5 w-5 cursor-pointer" onClick={() => togglePasswordVisibility('oldPassword')} />
                ) : (
                  <AiFillEye className="h-5 w-5 cursor-pointer" onClick={() => togglePasswordVisibility('oldPassword')} />
                )}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1">New Password</label>
            <div className="border border-gray-300 px-3 py-2 rounded-md flex items-center relative">
              <AiOutlineLock className="h-5 w-5 mr-2" />
              <input
                className="pl-2 flex-grow focus:outline-none"
                type={passwordVisibility.newPassword ? "text" : "password"}
                name="newPassword"
                value={passwordChange.newPassword}
                onChange={handleChangePassword}
              />
              <div className="absolute right-2">
                {passwordVisibility.newPassword ? (
                  <AiFillEyeInvisible className="h-5 w-5 cursor-pointer" onClick={() => togglePasswordVisibility('newPassword')} />
                ) : (
                  <AiFillEye className="h-5 w-5 cursor-pointer" onClick={() => togglePasswordVisibility('newPassword')} />
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-md" type="submit">
              Change Password
            </button>
          </div>
          {error && (
            <div className="text-red-500 mt-2 text-sm text-center">{error}</div>
          )}
        </form>
      </div>
    )}
  </>
  );
};

export default Login;



