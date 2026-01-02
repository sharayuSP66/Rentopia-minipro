import { useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";

export default function ReviewForm({ placeId, onReviewSubmitted }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function submitReview(ev) {
        ev.preventDefault();
        setSubmitting(true);
        try {
            await axios.post("/reviews", {
                place: placeId,
                rating,
                comment,
            });
            setComment("");
            setRating(5);
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (e) {
            console.error(e);
        }
        setSubmitting(false);
    }

    return (
        <form onSubmit={submitReview} className="my-4 p-4 border rounded-2xl bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
            <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? "text-yellow-500" : "text-gray-300"
                            }`}
                    >
                        <FaStar />
                    </button>
                ))}
            </div>
            <textarea
                className="w-full border rounded-xl p-2 mb-2"
                placeholder="Share your experience..."
                value={comment}
                onChange={(ev) => setComment(ev.target.value)}
            />
            <button disabled={submitting} className="primary">
                Submit Review
            </button>
        </form>
    );
}
