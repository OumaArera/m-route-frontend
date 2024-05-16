import { useState } from 'react';
import { BiToggleLeft, BiToggleRight } from 'react-icons/bi';

const Settings = () => {
  const [notifications, setNotifications] = useState({
    routeUpdates: false,
    productInsights: false,
    salesOrders: false,
    competitorActivities: false,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start min-h-screen py-16 mb-36 gap-8 lg:gap-36">
      <form className="flex flex-col items-center justify-start gap-8 p-6 md:p-10 lg:p-16 xl:p-20 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[50%] xl:max-w-[40%] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] bg-white rounded-xl">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-darkslateblue-300 mb-4">
          Profile settings
        </h1>
        <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center pt-[84px] pb-2 bg-[url('/public/39@2x.png')] bg-cover bg-no-repeat bg-[top]">
          {/* <img
            className="h-[120px] w-[120px] relative rounded-full object-cover"
            alt=""
            src="/39@2x.png"
          /> */}
        </div>
        <input type="email" className="input-field" placeholder="Email" />
        <input type="tel" className="input-field" placeholder="Phone number" />
        <input type="password" className="input-field" placeholder="Password" />
        <input type="password" className="input-field bg-gray-100" placeholder="Confirm password" />
        <button className="text-white bg-gray-900 px-6 py-2 rounded-full">Save changes</button>
      </form>
      <div className="flex flex-col items-center lg:items-start justify-start gap-8 py-6 px-8 text-lg text-black font-poppins shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] rounded-xl">
        <b className="text-xl text-darkslateblue-300">Notification Preferences</b>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="font-medium text-base">Route Updates</div>
            {notifications.routeUpdates ? (
              <BiToggleRight
                className="text-gray-900 cursor-pointer text-3xl ml-2"
                onClick={() => toggleNotification('routeUpdates')}
              />
            ) : (
              <BiToggleLeft
                className="text-gray-900 cursor-pointer text-3xl ml-2"
                onClick={() => toggleNotification('routeUpdates')}
              />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium text-base">Product Insights</div>
            {notifications.productInsights ? (
              <BiToggleRight
                className="text-gray-900 cursor-pointer text-3xl ml-2 "
                onClick={() => toggleNotification('productInsights')}
              />
            ) : (
              <BiToggleLeft
                className="text-gray-900 cursor-pointer text-3xl ml-2"
                onClick={() => toggleNotification('productInsights')}
              />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium text-base">Sales orders</div>
            {notifications.salesOrders ? (
              <BiToggleRight
                className="text-gray-900 cursor-pointer text-3xl"
                onClick={() => toggleNotification('salesOrders')}
              />
            ) : (
              <BiToggleLeft
                className="text-gray-900 cursor-pointer text-3xl"
                onClick={() => toggleNotification('salesOrders')}
              />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium text-base">Competitor Activities</div>
            {notifications.competitorActivities ? (
              <BiToggleRight
                className="text-gray-900 cursor-pointer text-3xl ml-2"
                onClick={() => toggleNotification('competitorActivities')}
              />
            ) : (
              <BiToggleLeft
                className="text-gray-900 cursor-pointer text-3xl ml-2"
                onClick={() => toggleNotification('competitorActivities')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
