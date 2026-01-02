
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Image from "../Image.jsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import FeaturesSection from "./FeaturesSection.jsx";
import { FaSearch, FaStar } from "react-icons/fa";

export default function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/places");
        setPlaces(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPlaces = places.filter((place) => {
    const matchesSearch = place.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? place.propertyType === filterType : true;
    return matchesSearch && matchesType;
  });

  const sortedPlaces = filteredPlaces.sort((a, b) => {
    if (sortOrder === "asc") return a.price - b.price;
    if (sortOrder === "desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[500px] rounded-3xl mt-4 mb-12 overflow-hidden shadow-2xl flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=2000&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg">
            Welcome to Rentopia
          </h1>
          <p className="text-xl md:text-3xl mb-10 font-light text-white/90 drop-shadow-md">
            Find your perfect stay, from cozy corners to luxurious villas.
          </p>

          {/* Search Bar in Hero */}
          <div className="bg-white p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center max-w-2xl mx-auto">
            <div className="flex-grow w-full md:w-auto px-4 py-2">
              <input
                type="text"
                placeholder="Where do you want to go?"
                className="w-full text-gray-800 outline-none text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-primary text-white p-4 rounded-full hover:bg-primary-dark transition duration-300 w-full md:w-auto mt-2 md:mt-0 flex justify-center items-center gap-2">
              <FaSearch />
              <span className="md:hidden">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {['All', '1RK', '1BHK', '2BHK', '3BHK', 'Villa'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type === 'All' ? '' : type)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${(filterType === type || (type === 'All' && !filterType))
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
        >
          <option value="">Sort by Price</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-x-6 gap-y-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton height={250} borderRadius={16} />
              <Skeleton width="70%" height={20} />
              <Skeleton width="40%" height={20} />
            </div>
          ))
          : sortedPlaces.map((place) => (
            <Link
              key={place._id}
              to={"/place/" + place._id}
              className="group cursor-pointer"
            >
              <div className="bg-gray-200 mb-3 rounded-2xl overflow-hidden relative aspect-square shadow-sm group-hover:shadow-xl transition duration-300">
                {place.photos?.[0] && (
                  <Image
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                    src={place.photos?.[0]}
                    alt={place.title}
                  />
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                  {place.propertyType || 'Stay'}
                </div>
              </div>
              <h2 className="font-bold text-lg truncate text-gray-900">{place.address}</h2>
              <h3 className="text-sm text-gray-500 truncate">{place.title}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-bold text-lg">₹{place.price}</span>
                <span className="text-gray-500">per night</span>
              </div>
            </Link>
          ))}
      </div>

      {!loading && sortedPlaces.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <h3 className="text-xl font-medium">No places found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Features Section */}
      <div className="mt-20">
        <FeaturesSection />
      </div>
    </div>
  );
}
