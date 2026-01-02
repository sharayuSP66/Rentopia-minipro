import AccountNav from "../AccountNav";
import { useEffect, useState } from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";
import { Link } from "react-router-dom";
import BookingDates from "../BookingDates";
import { CiMoneyCheck1 } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import FeedbackModal from "../components/FeedbackModal";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [reviewStatus, setReviewStatus] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const response = await axios.get("/bookings");
      setBookings(response.data);

      // Check review status for eligible bookings (past checkout, confirmed)
      const now = new Date();
      const eligibleBookings = response.data.filter(
        b => b.status === 'confirmed' && new Date(b.checkOut) < now
      );

      for (const booking of eligibleBookings) {
        try {
          const res = await axios.get(`/bookings/${booking._id}/can-review`);
          setReviewStatus(prev => ({
            ...prev,
            [booking._id]: res.data
          }));
        } catch (err) {
          console.error('Error checking review status:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  }

  async function cancelBooking(bookingId) {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (confirmed) {
      try {
        await axios.post(`/bookings/${bookingId}/cancel`);
        fetchBookings();
      } catch (e) {
        alert("Failed to cancel booking");
      }
    }
  }

  function handleFeedbackClick(booking) {
    setSelectedBooking(booking);
    setShowFeedbackModal(true);
  }

  function handleFeedbackSuccess() {
    setShowFeedbackModal(false);
    setSelectedBooking(null);
    fetchBookings(); // Refresh to update review status
  }

  return (
    <div>
      <AccountNav />
      <div className="flex flex-col gap-6 p-4">
        {bookings?.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start exploring amazing places to stay!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-white py-2 px-6 rounded-full"
            >
              Browse Properties
            </Link>
          </div>
        )}
        {bookings?.length > 0 &&
          bookings.map((booking) => {
            const isPastCheckout = new Date(booking.checkOut) < new Date();
            const isConfirmed = booking.status === 'confirmed';
            const canCancel = booking.status !== 'cancelled' && new Date(booking.checkIn) > new Date();
            const reviewInfo = reviewStatus[booking._id];
            const canReview = reviewInfo?.canReview === true;
            const hasReviewed = reviewInfo?.reason === 'Already reviewed';

            return (
              <div
                key={booking._id}
                className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden relative"
              >
                <Link to={`/account/bookings/${booking._id}`} className="flex flex-col sm:flex-row grow">
                  {/* Image Section */}
                  <div className="sm:w-56 w-full h-40 sm:h-auto">
                    <PlaceImg place={booking.place} className="w-full h-full object-cover" />
                  </div>

                  {/* Info Section */}
                  <div className="flex flex-col justify-between p-4 grow">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {booking.place.title}
                      </h2>
                      <BookingDates
                        booking={booking}
                        className="text-sm text-gray-500 mt-2"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-gray-700 mt-3 sm:mt-0">
                      <CiMoneyCheck1 className="text-green-600 text-lg" />
                      <span className="font-medium">
                        Total price: <span className="font-bold">₹{booking.price}</span>
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {booking.status === 'pending_payment' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                          ⏳ Pending Payment
                        </span>
                      )}
                      {booking.status === 'payment_failed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                          ❌ Payment Failed
                        </span>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          ✓ Confirmed
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                          ✗ Cancelled
                        </span>
                      )}
                      {hasReviewed && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                          <FaStar className="text-yellow-400" /> Feedback Submitted
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Actions Section */}
                <div className="p-4 flex flex-col justify-center gap-2 border-l border-gray-100">
                  {canCancel && (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
                    >
                      Cancel
                    </button>
                  )}
                  {isPastCheckout && isConfirmed && canReview && (
                    <button
                      onClick={() => handleFeedbackClick(booking)}
                      className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2"
                    >
                      <FaStar />
                      Leave Feedback
                    </button>
                  )}
                  {hasReviewed && reviewInfo?.review && (
                    <div className="text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < reviewInfo.review.rating ? "text-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="text-xs">Your rating</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedBooking && (
        <FeedbackModal
          booking={selectedBooking}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </div>
  );
}
