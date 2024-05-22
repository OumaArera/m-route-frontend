import { useState, useEffect } from "react";
import './App.css';

const PASSWORD_RESET_URL = "https://m-route-backend.onrender.com/users/rest-user";

const generatePassword = () => {
    const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialCharacters = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];
    
    const password = [
      getRandomChar(upperCaseLetters),
      ...Array.from({ length: 4 }, () => getRandomChar(lowerCaseLetters)),
      ...Array.from({ length: 2 }, () => getRandomChar(numbers)),
      getRandomChar(specialCharacters),
    ];
    
    return password.sort(() => Math.random() - 0.5).join('');
};

const ResetUser = () => {
    const [token, setToken] = useState('');
    const [userData, setUserData] = useState({ email: '' });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        
        if (accessToken) {
            setToken(JSON.parse(accessToken));
        }
    }, []);

    const handleChange = event => {
        const { name, value } = event.target;
        setUserData(prev => ({
            ...prev,
            [name]: value.toLowerCase()
        }));
    };

    const resetPassword = async event => {
        event.preventDefault();

        const user = {
            email: userData.email,
            password: generatePassword()
        };

        try {
            const response = await fetch(PASSWORD_RESET_URL, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });

            const data = await response.json();

            if (data.status_code === 200){
                setMessage("Reset successful.");
                setUserData({ email: '' });
                setTimeout(() => {
                    setMessage("")
                }, 5000);
            } else {
                setError("Error: " + data.message);
                setTimeout(() => {
                    setError("")
                }, 5000);
            }
        } catch (error) {
            setError("An error occurred while resetting the password.");
            setTimeout(() => {
                setError("")
            }, 5000);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form className="bg-white p-6 rounded shadow-md w-full max-w-sm" onSubmit={resetPassword}>
                <h2 className="text-2xl mb-4">Reset User Password</h2>
                <input 
                    type="email" 
                    name="email"
                    className="border border-gray-300 p-2 rounded w-full mb-4"
                    placeholder="Enter user's email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                />
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-green-500 mb-4">{message}</p>
                <button 
                    type="submit"
                    className="w-full bg-gray-700 text-white p-2 rounded hover:bg-green-500 transition-colors duration-300"
                >
                    Submit
                </button>
            </form>
        </div>
    )
}

export default ResetUser;



