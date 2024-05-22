import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { AiOutlineCaretRight, AiOutlineCaretLeft } from "react-icons/ai";
import { HiChevronDoubleRight, HiChevronDoubleLeft } from "react-icons/hi";

const USERS_URL = 'https://m-route-backend.onrender.com/users';
const UPDATE_STATUS_URL = 'https://m-route-backend.onrender.com/users';
const UPDATE_ROLE_URL = 'https://m-route-backend.onrender.com/users';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 12;

  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setToken(JSON.parse(accessToken));
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(USERS_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.message);
      } else {
        setError(data.message || 'Failed to fetch users.');
        console.log('Error response:', data);
      }
    } catch (error) {
      console.log('Fetch error:', error);
      setError('Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId, status) => {
    try {
      const response = await fetch(`${UPDATE_STATUS_URL}/${userId}/edit-status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchUsers();
      } else {
        setError(data.message || 'Failed to update status');
        console.log('Error response:', data);
      }
    } catch (error) {
      console.log('Update status error:', error);
      setError('An error occurred while updating status');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const response = await fetch(`${UPDATE_ROLE_URL}/${userId}/edit-role`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchUsers();
      } else {
        setError(data.message || 'Failed to update role');
        console.log('Error response:', data);
      }
    } catch (error) {
      console.log('Update role error:', error);
      setError('An error occurred while updating role');
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const filterUsers = (users) => {
    return users.filter(user => {
      const username = user.username.toLowerCase();
      const staffNo = String(user.staff_no).toLowerCase();
      const matchesSearch = username.includes(searchTerm.toLowerCase()) ||
                            staffNo.includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || user.status.toLowerCase() === filter;

      return matchesSearch && matchesFilter;
    });
  };

  const getDisplayedUsers = () => {
    const filteredUsers = filterUsers(users);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const displayedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    return { displayedUsers, totalPages, totalFilteredUsers: filteredUsers.length };
  };

  const { displayedUsers, totalPages, totalFilteredUsers } = getDisplayedUsers();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by username or staff no..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-300 rounded pl-10 pr-3 py-1 w-full"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <select
          value={filter}
          onChange={handleFilterChange}
          className="ml-4 border border-gray-300 rounded px-3 py-1"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
      <p className="text-gray-600 mb-4">Showing {displayedUsers.length} of {totalFilteredUsers} users</p>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 text-left">#</th>
            <th className="py-2 px-4 text-left">Username</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Change Role</th>
            <th className="py-2 px-4 text-left">Staff No</th>
            <th className="py-2 px-4 text-left">Change Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedUsers.map((user, index) => (
            <tr key={user.id}>
              <td className="py-2 px-4">{(currentPage - 1) * usersPerPage + index + 1}</td>
              <td className="py-2 px-4">{user.username}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className={`bg-gray-100 border border-gray-300 rounded-md p-1 ${user.role.toLowerCase() === 'admin' ? 'bg-red-500 text-white' : user.role.toLowerCase() === 'manager' ? 'bg-blue-500 text-black' : user.role.toLowerCase() === 'merchandiser' ? 'bg-green-500 text-white'  : ''}`}
                >
                  <option value="admin">Admin</option>
                  <option value="merchandiser">Merchandiser</option>
                  <option value="manager">Manager</option>
                </select>
              </td>
              <td className="py-2 px-4">{user.staff_no}</td>
              <td className="py-2 px-4">
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(user.id, e.target.value)}
                  className={`bg-gray-100 border border-gray-300 rounded-md p-1 ${user.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          {totalPages > 2 && (
            <button
              onClick={() => setCurrentPage(1)}
              className="p-2 bg-gray-800 hover:bg-blue-700 text-white rounded flex items-center"
            >
              <HiChevronDoubleLeft />
            </button>
          )}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 ${currentPage === 1 ? 'bg-gray-400' : 'bg-gray-800 hover:bg-blue-700'} text-white rounded flex items-center`}
          >
            <AiOutlineCaretLeft />
          </button>
        </div>
        <span>Page {currentPage} of {totalPages}</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 ${currentPage === totalPages ? 'bg-gray-400' : 'bg-gray-800 hover:bg-blue-700'} text-white rounded flex items-center`}
          >
            <AiOutlineCaretRight />
          </button>
          {totalPages > 2 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="p-2 bg-gray-800 hover:bg-blue-700 text-white rounded flex items-center"
            >
              <HiChevronDoubleRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
