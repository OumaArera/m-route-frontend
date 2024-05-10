import React from "react";
import { Link } from "react-scroll";

const Home = () => {
  return (
    <div className="min-h-[70vh] flex flex-col md:flex-row md:justify-between items-center md:mx-32 mx-5 mt-10">
      <div className="md:w-2/4 text-left mr-8 ">
        <h2 className="text-3xl font-bold leading-tight">
        Empowering Sales Teams with  
          <span className="text-black font-normal">  Efficient Route Planning</span>
        </h2>
        <p className="text-lightText mt-5 text-start">
        Welcome to our platform dedicated to optimizing route planning for sales professionals. 
        Join us on this journey as we revolutionize the way salespeople navigate through their daily tasks 
        and gather crucial product insights. Together, let's make route planning smarter and more effective
        </p>

        <Link to="contacts" spy={true} smooth={true} duration={500}>
          <button className="bg-white py-2 px-5 rounded-full mt-4 outline hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:bg-blue-600 hover:text-white transition-all">
            Contact Us
          </button>
        </Link>
      </div>

      <div className="w-full md:w-2/4 ml spa">
        <img src="https://images.unsplash.com/photo-1548345680-f5475ea5df84?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Hand holding phone with map displayed" />
      </div>
    </div>
  );
};

export default Home;