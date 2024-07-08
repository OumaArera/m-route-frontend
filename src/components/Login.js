import { useState, useEffect } from "react";
import { AiOutlineClose, AiOutlineLock, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FiMail } from "react-icons/fi";
import { MdCheckBoxOutlineBlank, MdCheckBox } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";

const LOGIN_URL = 'https://m-route-backend.onrender.com/users/login';
const CHANGE_PASSWORD_URL = "https://m-route-backend.onrender.com/users/change-password";

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
      setRoleCheck(userDataObj.user.roleCheck);
      setAdmin(userDataObj.user.admin);
      setUserData(userDataObj);
      if (previousRoute) {
        navigate(JSON.parse(previousRoute));
      }
    }
  }, [setAuthorized, setRoleCheck, setAdmin, setUserData, navigate]);

  const handlePasswordVisibility = (field) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { access_token, user } = data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user_data", JSON.stringify(data));
        setAuthorized(true);
        setRoleCheck(user.roleCheck);
        setAdmin(user.admin);
        setUserData(data);
        if (rememberMe) {
          localStorage.setItem("authorized", true);
          localStorage.setItem("roleCheck", user.roleCheck);
          localStorage.setItem("admin", user.admin);
          localStorage.setItem("userData", JSON.stringify(data));
        }
        navigate("/");
      } else {
        setError(data.message || "Login failed. Please try again.");
        if (data.passwordExpired) {
          setPasswordExpired(true);
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(CHANGE_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordChange),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password changed successfully. Please log in with your new password.");
        setPasswordExpired(false);
      } else {
        setError(data.message || "Password change failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {passwordExpire ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={passwordChange.email}
                  onChange={(e) =>
                    setPasswordChange((prevState) => ({
                      ...prevState,
                      email: e.target.value,
                    }))
                  }
                />
                <FiMail className="absolute top-2.5 right-3 text-gray-400" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="oldPassword">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisibility.oldPassword ? "text" : "password"}
                  id="oldPassword"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={passwordChange.oldPassword}
                  onChange={(e) =>
                    setPasswordChange((prevState) => ({
                      ...prevState,
                      oldPassword: e.target.value,
                    }))
                  }
                />
                <AiOutlineLock className="absolute top-2.5 right-3 text-gray-400" />
                <button
                  type="button"
                  className="absolute top-2.5 right-10 text-gray-400"
                  onClick={() => handlePasswordVisibility("oldPassword")}
                >
                  {passwordVisibility.oldPassword ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisibility.newPassword ? "text" : "password"}
                  id="newPassword"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={passwordChange.newPassword}
                  onChange={(e) =>
                    setPasswordChange((prevState) => ({
                      ...prevState,
                      newPassword: e.target.value,
                    }))
                  }
                />
                <AiOutlineLock className="absolute top-2.5 right-3 text-gray-400" />
                <button
                  type="button"
                  className="absolute top-2.5 right-10 text-gray-400"
                  onClick={() => handlePasswordVisibility("newPassword")}
                >
                  {passwordVisibility.newPassword ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-4">Login</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FiMail className="absolute top-2.5 right-3 text-gray-400" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisibility.password ? "text" : "password"}
                  id="password"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <AiOutlineLock className="absolute top-2.5 right-3 text-gray-400" />
                <button
                  type="button"
                  className="absolute top-2.5 right-10 text-gray-400"
                  onClick={() => handlePasswordVisibility("password")}
                >
                  {passwordVisibility.password ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rememberMe">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="mr-2 leading-tight"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {rememberMe ? (
                    <MdCheckBox className="text-blue-500" />
                  ) : (
                    <MdCheckBoxOutlineBlank className="text-gray-400" />
                  )}
                  <span className="text-sm">Remember Me</span>
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={handleLogin}
                disabled={loading}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
          </>
        )}
      </div>
      <Link to="/" className="mt-4 text-blue-500 hover:text-blue-700 text-sm font-bold">
        Cancel
      </Link>
    </div>
  );
};

export default Login;
