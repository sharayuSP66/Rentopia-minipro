import React from "react";
import { FaRegCalendarCheck, FaGlobe, FaFilter } from "react-icons/fa";  

const FeaturesSection = () => {
  return (
    <div className="bg-white py-16">
      <div className=" md:flex gap-24">
       
        <div className="mb-12">
          <img
            src="https://a0.muscache.com/im/pictures/7c7ccb34-a563-4f25-9fba-e4a46e2dbc3a.jpg?im_w=720"
            alt=""
            className="rounded-lg shadow-lg w-9 mb-6 "
          />
         
            <h2 className="text-2xl font-semibold text-gray-800">
              Enjoy some flexibility
            </h2>
            <p className="text-gray-600">
              Stays with flexible cancellation make it easy to rebook if your
              plans change.
            </p>
          
        </div>
 
        <div className="mb-12 ">
          <img
            src="https://a0.muscache.com/im/pictures/d51be571-b8cf-4379-8d3f-7c5e56c9def5.jpg?im_w=720"
            alt=""
            className="rounded-lg shadow-lg w-9  mb-6 "
          />
           
            <h2 className="text-2xl font-semibold text-gray-800">
              More than 7M active listings
            </h2>
            <p className="text-gray-600">
              Join more than 1 billion guests who’ve found getaways in over 220
              countries and destinations.
            </p>
         
        </div>
 
        <div>
          <img
            src="https://a0.muscache.com/im/pictures/a52e81a9-e390-4e74-b197-1aeeffd0e5ab.jpg?im_w=720"
            alt=""
            className="rounded-lg shadow-lg w-9  mb-6 "
          />
           
            <h2 className="text-2xl font-semibold text-gray-800">
              100+ filters for tailored stays
            </h2>
            <p className="text-gray-600">
              Pick your price range, the number of rooms you want, and other key
              amenities to find the stay that fits your needs.
            </p>
         
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
