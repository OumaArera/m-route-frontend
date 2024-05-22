// import AboutUs from './AboutUs';
import ContactUs from './ContactUs';
import Testimonials from './Testimonials';
import OurClients from './OurClients';
import { Link } from 'react-router-dom';

const Home = ({ authorized }) => {
  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="col-span-7 py-16 px-4 mx-auto lg:col-span-6 lg:py-32 lg:px-8 lg:mx-0 lg:place-self-center">
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">Boost accountability and efficiency with our merchandiser tracking service.</h1>
          <p className="max-w-2xl mb-6 font-light text-gray-900 lg:mb-8 md:text-lg lg:text-xl dark:text-white">Streamline sales team monitoring with our innovative tracking microservice. Effortlessly monitor movements in real-time, ensuring accountability and efficiency.</p>
          <Link to={authorized ? "/routes" : "/login"} className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-gray-900 rounded-lg bg-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300">
            Get started
            <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </Link>
          <Link to="/contactus" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
            Speak to us!
          </Link> 
        </div>
        <div className="col-span-5 lg:flex lg:items-center">
          <img src="https://cdn.mos.cms.futurecdn.net/VXGoaHKJSvXPqeDrif67Wa.jpg" alt="mockup" className="mx-auto" />
        </div>
      </div>
      
    </section>
  );
}

export default Home;
