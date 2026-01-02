import { Link } from "react-router-dom";
import AccountNav from "../AccountNav";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";
import { FiEdit3 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { UserContext } from "../UserContext";

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);
  const [checkdelete, setCheckdelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  const handleClick = (placeid, owner) => {
    // ... exact previous code ... 
    if (window.confirm("Are you sure you want to delete this property?")) {
      axios.post(`/user-places/${placeid}`, { placeid, owner }).then((data) => {
        if (data) {
          setCheckdelete(!checkdelete);
        }
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    axios.get("/user-places").then(({ data }) => {
      setPlaces(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [checkdelete]);

  const isSubscribed = user?.subscription?.status === "active" &&
    new Date(user.subscription.expiry?.$date?.$numberLong ? parseInt(user.subscription.expiry.$date.$numberLong) : user.subscription.expiry) > new Date();

  return (
    <div className="max-w-6xl mx-auto">
      <AccountNav />

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Properties</h1>
        <Link
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
          to={isSubscribed ? "/account/places/new" : "/account/subscription"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
          Add new place
        </Link>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No properties yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first property listing</p>
          <Link
            className="inline-flex items-center gap-2 bg-primary text-white py-2 px-6 rounded-full"
            to={"/account/places/new"}
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {places.map((place) => (
            <div
              key={place._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="lg:w-72 h-48 lg:h-auto flex-shrink-0">
                  <PlaceImg place={place} className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <div className="flex-grow p-5 flex flex-col">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">{place.title}</h2>
                      <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full ml-2">
                        {place.propertyType || 'Property'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{place.address}</p>
                    <p className="text-gray-600 text-sm line-clamp-2">{place.description}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">₹{place.price}</span>
                      <span className="text-gray-500 text-sm">/night</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={"/account/places/" + place._id}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <FiEdit3 size={18} />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                      <button
                        onClick={(ev) => handleClick(place._id, place.owner)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <MdDelete size={18} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

