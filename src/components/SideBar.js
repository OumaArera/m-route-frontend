import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RiHome2Line, RiMapPinLine, RiSettings2Line } from "react-icons/ri";
import { MdOutlineAddLocation } from "react-icons/md";
import { IoMenu } from "react-icons/io5";
import { FaRegCalendarAlt } from "react-icons/fa";
import { GrDocumentPerformance } from "react-icons/gr";


const SidebarItem = ({ icon, label, to }) => {
  const [showLabel, setShowLabel] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShowLabel(window.innerWidth > 968);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Link to={to} className="flex items-center gap-4 py-2 pl-4">
      {icon}
      {showLabel && <span className="text-lg font-semibold text-gray-900">{label}</span>}
    </Link>
  );
};


const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenuText, setShowMenuText] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShowMenuText(window.innerWidth > 968);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuText = showMenuText ? 'Menu' : '';

  const sidebarItems = [
    { icon: <RiHome2Line className="h-6 w-6 text-gray-900" />, label: "Home", to: "/map" },
    { icon: <RiMapPinLine className="h-6 w-6 text-gray-900" />, label: "Routes", to: "/routes" },
    { icon: <FaRegCalendarAlt className="h-6 w-6 text-gray-900" />, label: "Create Routes", to: "/calendar" },
    { icon: <MdOutlineAddLocation className="h-6 w-6 text-gray-900" />, label: "Create Outlet", to: "/outlet" },
    { icon: <GrDocumentPerformance className="h-6 w-6 text-gray-900" />, label: "Response", to: "/response" },
    { icon: <RiSettings2Line className="h-6 w-6 text-gray-900" />, label: "Settings", to: "/settings" },
    
    
  ];

  return (
    <div className="lg:w-64 lg:mr-12 lg:p-8 lg:border-r lg:border-gray-100 lg:z-0">
      <div className="flex items-center mb-8 lg:hidden">
        <IoMenu className="h-8 w-8 cursor-pointer text-gray-900" onClick={toggleSidebar} />
        {isOpen && <span className="ml-4 text-gray-900 text-lg font-bold">{menuText}</span>}
      </div>
      <div className={`flex flex-col gap-8 ${isOpen ? '' : 'hidden'} lg:flex lg:flex-col lg:gap-8 lg:flex-grow lg:overflow-auto`}>
        {sidebarItems.map((item, index) => (
          <SidebarItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default SideBar;


