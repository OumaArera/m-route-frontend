import { useState } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri'; 
import { Switch } from '@headlessui/react';

export default function ContactUs() {
  const [agreed, setAgreed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can perform any submission logic, for demonstration purposes, let's just show the alert
    setShowAlert(true);
    // Clear form fields
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: ''
    });
    // Reset agreed state
    setAgreed(false);
  };

  return (
    <div className="bg-white px-6 py-12 mb-12 sm:py-24 lg:px-8 mt-16 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center sm:text-4xl">Contact us</h2>
      <p className="mt-2 text-lg leading-8 text-gray-600 text-center">
        Unlock new opportunities by connecting with us today
      </p>
      <form className="mt-16 max-w-xl mx-auto" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-gray-900">First name</label>
            <div className="mt-2.5">
              <input type="text" name="firstName" id="first-name" value={formData.firstName} onChange={handleChange} autoComplete="given-name" className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
          <div>
            <label htmlFor="last-name" className="block text-sm font-semibold leading-6 text-gray-900">Last name</label>
            <div className="mt-2.5">
              <input type="text" name="lastName" id="last-name" value={formData.lastName} onChange={handleChange} autoComplete="family-name" className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">Email</label>
            <div className="mt-2.5">
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} autoComplete="email" className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="phone" className="block text-sm font-semibold leading-6 text-gray-900">Phone Number</label>
            <div className="mt-2.5">
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} autoComplete="tel" className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">Message</label>
            <div className="mt-2.5">
              <textarea name="message" id="message" rows={4} value={formData.message} onChange={handleChange} className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Switch.Group as="div" className="flex gap-x-4">
              <div className="flex h-6 items-center">
                <Switch checked={agreed} onChange={setAgreed} className={`flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${agreed ? 'bg-gray-900' : 'bg-gray-200'}`}>
                  <span className="sr-only">Agree to policies</span>
                  <span aria-hidden="true" className={`h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out ${agreed ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </Switch>
              </div>
              <Switch.Label className="text-sm leading-6 text-gray-600">
                By selecting this, you agree to our{' '}
                <a href="#" className="font-semibold text-gray-900">
                  privacy&nbsp;policy
                </a>
                .
              </Switch.Label>
            </Switch.Group>
          </div>
        </div>
        <div className="mt-10">
          <button type="submit" className="block w-full rounded-md bg-gray-900 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Let's talk
          </button>
        </div>
      </form>
      {showAlert && (
        <div className="mt-6 text-green-600 text-center">
          We've received your message. We'll get back to you soon.
        </div>
      )}
    </div>
  );
}

