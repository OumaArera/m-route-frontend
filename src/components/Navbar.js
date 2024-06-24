import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiNotification2Line } from "react-icons/ri";
import { MdAccountCircle } from "react-icons/md";

const NOTIFICATIONS_URL = "https://m-route-backend.onrender.com/users/notifications/unread";

const Navbar = ({ userData }) => {
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");

    if (accessToken) setToken(JSON.parse(accessToken));
    if (userData) setUserId(JSON.parse(userData).id);
  }, []);

  useEffect(() => {
    if (token && userId) getNotifications();
  }, [token, userId]);

  const getNotifications = async () => {
    try {
      const response = await fetch(`${NOTIFICATIONS_URL}/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.successful) {
        setNotifications(data.message.filter(notification => notification.status === "unread"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="bg-gray-900 shadow-md flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-lg font-bold text-white">
          Merch Mate
        </Link>
      </div>
      <div className="flex items-center gap-8">
        <RiNotification2Line
          className="h-6 w-6 text-white"
          onClick={() => setShowModal(true)}
        />
        <Link to="/profile">
          {userData.avatar ? (
            <img src={userData.avatar} className="h-8 w-8" alt="profile" />
          ) : (
            <MdAccountCircle className="h-8 w-8 text-white" alt="profile" />
          )}
        </Link>

        <div className="flex flex-col">
          <b className="text-base text-white capitalize">{userData.username}</b>
          <div className="text-xs text-white capitalize">{userData.role}</div>
        </div>
      </div>
      <>
        {showModal ? (
          <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative w-auto my-6 mx-auto max-w-6xl">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                    <h3 className="text-3xl font-semibold">
                      Recent Notifications
                    </h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => setShowModal(false)}
                    >
                      <span className="bg-transparent text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                        ×
                      </span>
                    </button>
                  </div>
                  <div className="relative p-6 flex-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div key={notification.id} className="mb-4 border p-4 rounded shadow">
                          <p className="text-blueGray-500 text-lg leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex gap-4 mt-2">
                            <button
                              className="text-blue-500 background-transparent font-bold uppercase px-3 py-1 text-sm outline-none focus:outline-none ease-linear transition-all duration-150"
                              type="button"
                              onClick={() => {
                                
                                const replyArea = document.getElementById(`reply-${notification.id}`);
                                replyArea.style.display = replyArea.style.display === "none" ? "block" : "none";
                              }}
                            >
                              Reply
                            </button>
                            <button
                              className="text-red-500 background-transparent font-bold uppercase px-3 py-1 text-sm outline-none focus:outline-none ease-linear transition-all duration-150"
                              type="button"
                              onClick={() => {
                               
                              }}
                            >
                              Close
                            </button>
                          </div>
                          <textarea
                            id={`reply-${notification.id}`}
                            className="mt-2 w-full p-2 border rounded"
                            style={{ display: "none" }}
                            placeholder="Type your reply here..."
                          />
                        </div>
                      ))
                    ) : (
                      <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
                        No unread notifications.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                    <button
                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </>
        ) : null}
      </>
    </header>
  );
};

export default Navbar;
