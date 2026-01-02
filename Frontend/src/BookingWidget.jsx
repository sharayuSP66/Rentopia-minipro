import React, { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext.jsx";

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState(""); 
  const [redirect, setRedirect] = useState("");
  const { user } = useContext(UserContext);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );
  }

  async function bookThisPlace() {
    if (!user) {
      alert("Please login to book the holiday stay.");
      return;
    }

    if (numberOfGuests <= 0) {
      alert("Number of guests should be greater than 0.");
      return;
    }

    try { 
      const response = await axios.post("/bookings", {
        checkIn,
        checkOut,
        numberOfGuests,
        name, 
        place: place._id,
        price: numberOfNights * place.price,
      });
      const bookingId = response.data._id;
      setRedirect(`/account/bookings/${bookingId}`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(
          `Property is not available for the selected dates. From ${checkIn} To ${checkOut}. Choose later Date `
        );
      } else {
        setError("An error occurred while booking the property.");
      }
    }
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative"
          role="alert"
        >
          {error}
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 5.652a.5.5 0 01.706.706L10.707 10l4.347 4.348a.5.5 0 11-.706.706L10 10.707l-4.348 4.347a.5.5 0 11-.706-.706L9.293 10 4.946 5.652a.5.5 0 01.706-.706L10 9.293l4.348-4.347z" />
            </svg>
          </span>
        </div>
      )}
      <div className="text-2xl text-center">
        Price: ₹ {place.price} / per night
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex  flex-col sm:flex-row">
          <div className="py-3 px-4">
            <label>Check in:</label>
            <input
              type="date"
              value={checkIn}
              onChange={(ev) => setCheckIn(ev.target.value)}
              required
            />
          </div>
          <div className="py-3 px-4 border-l border-t-2  sm:border-none ">
            <label>Check out:</label>
            <input
              type="date"
              value={checkOut}
              onChange={(ev) => setCheckOut(ev.target.value)}
              required
            />
          </div>
        </div>
        <div className="py-3 px-4 border-t">
          <label>Number of guests:</label>
          <input
            type="number"
            value={numberOfGuests}
            min="1"
            max={place.maxGuests}
            onChange={(ev) => setNumberOfGuests(ev.target.value)}
            required
          />
        </div>
        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Your full name:</label>
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              required
            />
           
          </div>
        )}
      </div>
      <button
        onClick={bookThisPlace}
        className={`primary mt-4 ${
          !user || numberOfGuests <= 0 ? "disabled" : ""
        }`}
      >
        {user ? "Book this place" : "Please login to book Property"}
        {numberOfNights > 0 && <span> ₹{numberOfNights * place.price}</span>}
      </button>
    </div>
  );
}
