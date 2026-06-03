import { useEffect, useState } from "react";
import api from "../services/api";

export default function ReviewModal({
    tradesmanId,
    onClose
})
{
    const [reviews, setReviews] =
    useState([]);

    useEffect(() =>
    {
        fetchReviews();
    }, []);

    async function fetchReviews()
    {
        try
        {
            const response =
            await api.get(
                `/reviews/${tradesmanId}`
            );

            setReviews(
                response.data
            );
        }
        catch(error)
        {
            console.log(error);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6">

            <div className="bg-white p-8 rounded-2xl w-full max-w-lg">

                <div className="flex justify-between mb-6">

                    <h2 className="text-2xl font-bold">
                        Reviews
                    </h2>

                    <button
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>

                {
                    reviews.length === 0
                    ? (
                        <p>
                            No reviews yet.
                        </p>
                    )
                    : (
                        reviews.map(
                        (review) =>
                        (
                            <div
                                key={review._id}
                                className="border-b pb-4 mb-4"
                            >
                                <p className="font-bold">
                                    ⭐ {review.rating}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {review.customer?.name}
                                </p>

                                <p className="mt-2">
                                    {review.comment}
                                </p>
                            </div>
                        ))
                    )
                }

            </div>

        </div>
    );
}