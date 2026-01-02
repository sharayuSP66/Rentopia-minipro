import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../AccountNav";
import { FaStar, FaRegStar } from "react-icons/fa";
import { MdOutlineRateReview } from "react-icons/md";

export default function OwnerFeedbackPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedPlace, setExpandedPlace] = useState(null);

    useEffect(() => {
        fetchFeedback();
    }, []);

    async function fetchFeedback() {
        try {
            const response = await axios.get("/owner/feedback");
            setData(response.data);
        } catch (err) {
            setError("Failed to load feedback");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function renderStars(rating) {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-lg">
                        {star <= rating ? (
                            <FaStar className="text-yellow-400" />
                        ) : (
                            <FaRegStar className="text-gray-300" />
                        )}
                    </span>
                ))}
            </div>
        );
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <AccountNav />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto">
                <AccountNav />
                <div className="text-center py-20">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <AccountNav />

            {/* Header with Stats */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Guest Feedback</h1>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                <MdOutlineRateReview className="text-2xl text-primary" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-800">{data?.totalReviews || 0}</p>
                                <p className="text-sm text-gray-600">Total Reviews</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 p-6 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                <FaStar className="text-2xl text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-800">{data?.averageRating || "N/A"}</p>
                                <p className="text-sm text-gray-600">Average Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🏠</span>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-800">{data?.places?.length || 0}</p>
                                <p className="text-sm text-gray-600">Properties</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* No Properties State */}
            {(!data?.places || data.places.length === 0) && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <div className="text-6xl mb-4">🏠</div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No properties yet</h3>
                    <p className="text-gray-500">Add some properties to start receiving guest feedback!</p>
                </div>
            )}

            {/* Properties with Feedback */}
            <div className="space-y-6">
                {data?.places?.map((item) => (
                    <div
                        key={item.place._id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        {/* Property Header */}
                        <div
                            className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedPlace(expandedPlace === item.place._id ? null : item.place._id)}
                        >
                            {/* Property Image */}
                            {item.place.photos?.[0] ? (
                                <img
                                    src={item.place.photos[0]}
                                    alt={item.place.title}
                                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <span className="text-3xl">🏠</span>
                                </div>
                            )}

                            {/* Property Info */}
                            <div className="flex-grow min-w-0">
                                <h3 className="text-lg font-semibold text-gray-800 truncate">{item.place.title}</h3>
                                <p className="text-sm text-gray-500 truncate">{item.place.address}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1">
                                        {renderStars(Math.round(item.averageRating))}
                                        <span className="text-sm text-gray-600 ml-1">{item.averageRating}</span>
                                    </div>
                                    <span className="text-sm text-gray-400">•</span>
                                    <span className="text-sm text-gray-600">{item.reviewCount} reviews</span>
                                </div>
                            </div>

                            {/* Expand Icon */}
                            <div className={`transition-transform duration-200 ${expandedPlace === item.place._id ? 'rotate-180' : ''}`}>
                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Expanded Reviews */}
                        {expandedPlace === item.place._id && (
                            <div className="border-t border-gray-100">
                                {item.reviews.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <p>No reviews yet for this property</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {item.reviews.map((review) => (
                                            <div key={review._id} className="p-5">
                                                <div className="flex items-start gap-4">
                                                    {/* Guest Avatar */}
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-primary font-medium">
                                                            {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </span>
                                                    </div>

                                                    {/* Review Content */}
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-2">
                                                            <div>
                                                                <span className="font-medium text-gray-800">
                                                                    {review.user?.name || 'Anonymous'}
                                                                </span>
                                                                <span className="text-sm text-gray-400 ml-2">
                                                                    {formatDate(review.createdAt)}
                                                                </span>
                                                            </div>
                                                            {renderStars(review.rating)}
                                                        </div>

                                                        {/* Sub-ratings if available */}
                                                        {(review.cleanliness || review.communication || review.location || review.value) && (
                                                            <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
                                                                {review.cleanliness && (
                                                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                                                        Cleanliness: {review.cleanliness}/5
                                                                    </span>
                                                                )}
                                                                {review.communication && (
                                                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                                                        Communication: {review.communication}/5
                                                                    </span>
                                                                )}
                                                                {review.location && (
                                                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                                                        Location: {review.location}/5
                                                                    </span>
                                                                )}
                                                                {review.value && (
                                                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                                                        Value: {review.value}/5
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Comment */}
                                                        {review.comment && (
                                                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
