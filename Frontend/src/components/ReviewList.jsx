import { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import { format } from "date-fns";

export default function ReviewList({ placeId, refreshTrigger }) {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        axios.get(`/places/${placeId}/reviews`).then((response) => {
            setReviews(response.data);
        });
    }, [placeId, refreshTrigger]);

    if (reviews.length === 0) {
        return <div className="text-gray-500 my-4">No reviews yet.</div>;
    }

    return (
        <div className="grid gap-4 my-4">
            {reviews.map((review) => (
                <div key={review._id} className="border p-4 rounded-2xl bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold">{review.user?.name || "Anonymous"}</h4>
                            <div className="text-gray-500 text-sm">
                                {format(new Date(review.createdAt), "MMMM d, yyyy")}
                            </div>
                        </div>
                        <div className="flex text-yellow-500">
                            {[...Array(review.rating)].map((_, i) => (
                                <FaStar key={i} />
                            ))}
                        </div>
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                </div>
            ))}
        </div>
    );
}
