import { useState } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function FeedbackModal({ booking, onClose, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [cleanliness, setCleanliness] = useState(0);
    const [communication, setCommunication] = useState(0);
    const [location, setLocation] = useState(0);
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const StarRating = ({ rating: starRating, setRating: setStarRating, label, size = "normal" }) => {
        const [hover, setHover] = useState(0);
        const starSize = size === "large" ? "text-3xl" : "text-xl";

        return (
            <div className="flex flex-col gap-1">
                {label && <span className="text-sm text-gray-600">{label}</span>}
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`${starSize} transition-colors duration-150 ${(hover || starRating) >= star ? "text-yellow-400" : "text-gray-300"
                                }`}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setStarRating(star)}
                        >
                            {(hover || starRating) >= star ? <FaStar /> : <FaRegStar />}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (rating === 0) {
            setError("Please select an overall rating");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await axios.post("/reviews", {
                booking: booking._id,
                rating,
                comment,
                cleanliness: cleanliness || undefined,
                communication: communication || undefined,
                location: location || undefined,
                value: value || undefined,
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit feedback");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Share Your Experience</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <IoMdClose className="text-xl text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Property Info */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        {booking.place?.photos?.[0] && (
                            <img
                                src={booking.place.photos[0]}
                                alt={booking.place.title}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <h3 className="font-medium text-gray-800">{booking.place?.title}</h3>
                            <p className="text-sm text-gray-500">{booking.place?.address}</p>
                        </div>
                    </div>

                    {/* Overall Rating */}
                    <div className="text-center">
                        <h3 className="font-medium text-gray-800 mb-3">How was your overall experience?</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`text-4xl transition-all duration-150 transform hover:scale-110 ${(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    {(hoverRating || rating) >= star ? <FaStar /> : <FaRegStar />}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent"}
                        </p>
                    </div>

                    {/* Detailed Ratings (Optional) */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Rate specific aspects (optional)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <StarRating rating={cleanliness} setRating={setCleanliness} label="Cleanliness" />
                            <StarRating rating={communication} setRating={setCommunication} label="Communication" />
                            <StarRating rating={location} setRating={setLocation} label="Location" />
                            <StarRating rating={value} setRating={setValue} label="Value" />
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Share your thoughts (optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you enjoy about your stay? Any suggestions for improvement?"
                            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            rows={4}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || rating === 0}
                        className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            "Submit Feedback"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
