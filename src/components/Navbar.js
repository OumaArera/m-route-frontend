import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { RiNotification2Line } from "react-icons/ri";
import { MdAccountCircle } from "react-icons/md";


const Navbar = ({userData}) => {
  const [showModal, setShowModal] = React.useState(false);

  
  return (
    <header className="bg-gray-900 shadow-md flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-lg font-bold text-white">Merch Mate</Link>
      </div>
      <div className="flex items-center gap-8">
        <RiNotification2Line className="h-6 w-6 text-white"
         onClick={() => setShowModal(true)}
        />
        <Link to="/settings">
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
        <div
          className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
        >
          <div className="relative w-auto my-6 mx-auto max-w-6xl">
            {/*content*/}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}
              <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                <h3 className="text-3xl font-semibold">
                  Recent Notifications
                </h3>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                    ×
                  </span>
                </button>
              </div>
              <div className="relative p-6 flex-auto">
                <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
                  Notifications Here !!!
                </p>
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
