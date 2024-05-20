import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Home from "./components/Home";
import Reviews from "./components/Reviews";
import Login from "./components/Login";
import Profile from "./components/Profile";
import GetLocations from "./maps/GetLocations";
import ContactUs from "./components/ContactUs";
import Signup from "./components/Signup";
import Calendar from "./components/Calendar";
import MerchSideBar from "./components/MerchSideBar";
import MerchCalendar from "./components/MerchCalendar";
import MerchRoutePlans from "./components/MerchRoutes";
import CreateRoutes from "./components/CreateRoutes";
import ManagerRoutes from "./components/ManagerRoutes";

// import AboutUs from "./components/AboutUs";


const routeConfig = {
  "/": { title: "", metaDescription: "" },
  "/dashboardmanager": { title: "", metaDescription: "" },
  "/settings": { title: "", metaDescription: "" },
  "/signup": { title: "", metaDescription: "" },
  "/login": { title: "", metaDescription: "" },
  "/footer": { title: "", metaDescription: "" },
  "/reviews": { title: "", metaDescription: "" },
  "/routesplan": { title: "", metaDescription: "" },
  "/contactus": { title: "", metaDescription: "" },
  "/calendar": {title: "", metaDescription: ""},
  "/myroutes": {title: "", metaDescription: ""},
};

function App() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [authorized, setAuthorized] = useState(false);
  const [roleCheck, setRoleCheck] = useState(false);
  const [userData, setUserData] = useState("");

  // if (userData.role === "manager"){
  //   setRoleCheck(true);
  // }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  useEffect(() => {
    const { title, metaDescription } = routeConfig[currentPath] || {};

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [currentPath]);

  return (
    <div className="flex flex-col min-h-screen">
      {authorized ? (
        <>
          <Navbar userData ={userData} />
          <div className="flex flex-1">
            {roleCheck ? <SideBar /> : <MerchSideBar />}
            <Routes className="flex-1 ml-4">
              {roleCheck ? (
                <>
                  {/* Manager routes */}
                  {/* <Route path="/" element={<Home />} /> */}
                  <Route path="/settings" element={<Settings setAuthorized={setAuthorized} />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/map" element={<GetLocations />} />
                  <Route path="/routes" element={<ManagerRoutes />} />
                  {/* <Route path="/contactus" element={<ContactUs />} /> */}
                  {/* <Route path="/calendar" element={<Calendar  userData={userData}/>} /> */}
                  <Route path="/calendar" element={<CreateRoutes />} />
                </>
              ) : (
                <>
                  <Route path="/settings" element={<Settings setAuthorized={setAuthorized} />} />
                  <Route path="/contactus" element={<ContactUs />} />
                  <Route path="/merch-calendar" element={<MerchCalendar  userData={userData} />} />
                  <Route path="/myroutes" element={<MerchRoutePlans userData={userData} />} />
                </>
              )}
              {/* <Route path="/login" element={<Login setRoleCheck={setRoleCheck} setAuthorized={setAuthorized} setUserData={setUserData} />} /> */}
            </Routes>

          </div>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<Home authorized={authorized} />} />
          <Route
            path="/login"
            element={<Login setRoleCheck={setRoleCheck} setAuthorized={setAuthorized} setUserData={setUserData} />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contactus" element={<ContactUs />} />
        </Routes>
      )}
      {roleCheck ? <Footer /> : null}
    </div>
  );
}

export default App;




