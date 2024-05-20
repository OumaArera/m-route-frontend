import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineLock, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const SIGNUP_URL = 'https://m-route-backend.onrender.com/users/signup';

const Modal = ({ message, onClose }) => {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium text-gray-900" id="modal-title">{message}</h3>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button onClick={onClose} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    national_id_no: "",
    staff_no: "",
    password: ""
  });
  const [emailUsername, setEmailUsername] = useState({
    email: "",
    username: ""
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const navigate = useNavigate();

  const handleEmailUsername = e => {
    let { name, value } = e.target;
    setEmailUsername(prev => ({
      ...prev,
      [name]: value.toLowerCase()
    }));
  };

  const handleChange = e => {
    let { name, value } = e.target;
    if ((name === 'national_id_no' || name === 'staff_no') && value < 0) {
      alert('Please enter a positive number.');
      e.target.value = Math.max(0, value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSignup = async e => {
    e.preventDefault();
    setLoading(true);

    const signupData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      national_id_no: formData.national_id_no,
      staff_no: formData.staff_no,
      password: formData.password,
      email: emailUsername.email,
      username: emailUsername.username
    };

    if (formData.middle_name) {
      signupData.middle_name = formData.middle_name;
    }

    try {
      const response = await fetch(SIGNUP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (data.status_code === 201) {
        setMessage(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        setFormData({
          first_name: "",
          middle_name: "",
          last_name: "",
          national_id_no: "",
          staff_no: "",
          password: ""
        });
        setEmailUsername({
          email: "",
          username: ""
        });
      } else if (data.status_code === 400) {
        setMessage(data.message);
      } else if (data.status_code === 500) {
        console.log("Error:", data.message);
        setMessage("Signup failed please try again");
      }
    } catch (error) {
      console.log("Failed to post", error);
      setMessage(`Signup failed please try again later`);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setMessage(null);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center py-36 bg-gray-900 bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
        </div>
      )}
      {message && <Modal message={message} onClose={closeModal} />}
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm bg-white rounded-lg shadow-md p-8">
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Sign up for an account</h2>
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-gray-900">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                type="text"
                autoComplete="given-name"
                required
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="middle_name" className="block text-sm font-medium leading-6 text-gray-900">
                Middle Name
              </label>
              <input
                id="middle_name"
                name="middle_name"
                type="text"
                value={formData.middle_name}
                autoComplete="middle-name"
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-gray-900">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                type="text"
                autoComplete="family-name"
                required
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="national_id_no" className="block text-sm font-medium leading-6 text-gray-900">
                National ID Number
              </label>
              <input
                id="national_id_no"
                name="national_id_no"
                value={formData.national_id_no}
                type="number"
                autoComplete="off"
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="staff_no" className="block text-sm font-medium leading-6 text-gray-900">
                Staff Number
              </label>
              <input
                id="staff_no"
                name="staff_no"
                value={formData.staff_no}
                type="number"
                autoComplete="off"
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={emailUsername.email}
                autoComplete="email"
                required
                onChange={handleEmailUsername}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={emailUsername.username}
                autoComplete="username"
                required
                onChange={handleEmailUsername}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={passwordVisibility ? "text" : "password"}
                  value={formData.password}
                  autoComplete="current-password"
                  required
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 px-3 py-2"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                  <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none">
                    {passwordVisibility ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign Up
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
