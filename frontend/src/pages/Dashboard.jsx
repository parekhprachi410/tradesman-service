import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard()
{
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [bookings, setBookings] = useState([]);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [message, setMessage] = useState("");

    const [tradesmanProfile, setTradesmanProfile] = useState(null);

    const [availabilityForm, setAvailabilityForm] = useState({
        availabilityDays: [],
        availableFrom: "09:00",
        availableTo: "18:00"
    });

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    useEffect(() =>
    {
        fetchBookings();

        if (user?.role === "tradesman")
        {
            fetchTradesmanProfile();
        }
    }, []);

    async function fetchTradesmanProfile()
    {
        try
        {
            const response = await api.get(
                `/tradesmen/user/${user.id}`
            );

            setTradesmanProfile(response.data);

            setAvailabilityForm({
                availabilityDays: response.data.availabilityDays || [],
                availableFrom: response.data.availableFrom || "09:00",
                availableTo: response.data.availableTo || "18:00"
            });
        }
        catch (error)
        {
            console.log(error);
        }
    }

    function handleDayChange(day)
    {
        if (availabilityForm.availabilityDays.includes(day))
        {
            setAvailabilityForm({
                ...availabilityForm,
                availabilityDays:
                availabilityForm.availabilityDays.filter(
                    (item) => item !== day
                )
            });
        }
        else
        {
            setAvailabilityForm({
                ...availabilityForm,
                availabilityDays:
                [
                    ...availabilityForm.availabilityDays,
                    day
                ]
            });
        }
    }

    async function updateAvailability(e)
    {
        e.preventDefault();

        try
        {
            const response = await api.put(
                `/tradesmen/availability/${user.id}`,
                availabilityForm
            );

            setMessage(response.data.message);
            setTradesmanProfile(response.data.tradesman);
        }
        catch (error)
        {
            setMessage(
                error.response?.data?.message ||
                "Failed to update availability"
            );
        }
    }

    async function fetchBookings()
    {
        try
        {
            const response = await api.get("/bookings");
            setBookings(response.data);
        }
        catch (error)
        {
            console.log(error);
        }
    }

    async function updateStatus(id, status)
    {
        try
        {
            await api.put(`/bookings/${id}/status`, {
                status
            });

            fetchBookings();
        }
        catch (error)
        {
            console.log(error);
        }
    }

    async function submitReview(e)
    {
        e.preventDefault();

        try
        {
            await api.post("/reviews", {
                booking: reviewBooking._id,
                customer: user.id,
                tradesman: reviewBooking.tradesman._id,
                rating: Number(rating),
                comment
            });

            setMessage("Review submitted successfully!");
            setReviewBooking(null);
            setRating(5);
            setComment("");
        }
        catch (error)
        {
            setMessage(
                error.response?.data?.message ||
                "Review failed"
            );
        }
    }

    function handleLogout()
    {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.dispatchEvent(new Event("authChange"));

        navigate("/login");
    }

    function getStatusClass(status)
    {
        if (status === "completed")
        {
            return "text-green-600 font-bold";
        }

        if (status === "rejected" || status === "cancelled")
        {
            return "text-red-600 font-bold";
        }

        if (status === "in-progress")
        {
            return "text-yellow-600 font-bold";
        }

        if (status === "accepted")
        {
            return "text-emerald-600 font-bold";
        }

        return "text-blue-600 font-bold";
    }

    if (!user)
    {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <p className="mb-4">
                        You are not logged in.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const customerBookings = bookings.filter(
        (booking) => booking.customer?._id === user.id
    );

    const tradesmanBookings = bookings.filter(
        (booking) => booking.tradesman?.user?._id === user.id
    );

    const visibleBookings =
    user.role === "tradesman"
    ? tradesmanBookings
    : customerBookings;

    const totalBookings = visibleBookings.length;

    const pendingBookings = visibleBookings.filter(
        (booking) => booking.status === "pending"
    ).length;

    const acceptedBookings = visibleBookings.filter(
        (booking) => booking.status === "accepted"
    ).length;

    const inProgressBookings = visibleBookings.filter(
        (booking) => booking.status === "in-progress"
    ).length;

    const completedBookings = visibleBookings.filter(
        (booking) => booking.status === "completed"
    ).length;

    const rejectedBookings = visibleBookings.filter(
        (booking) =>
            booking.status === "rejected" ||
            booking.status === "cancelled"
    ).length;

    const estimatedRevenue = visibleBookings
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) =>
    {
        return sum + Number(booking.tradesman?.hourlyRate || 0);
    }, 0);

    const ratings = visibleBookings
    .filter((booking) => booking.tradesman?.rating)
    .map((booking) => Number(booking.tradesman.rating));

    const averageRating =
    ratings.length > 0
    ? (
        ratings.reduce((sum, rating) => sum + rating, 0) /
        ratings.length
    ).toFixed(1)
    : "0.0";

    return (
        <div className="min-h-screen bg-slate-100 px-8 py-12">

            <div className="max-w-6xl mx-auto">

                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex justify-between items-center">

                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Dashboard
                        </h1>

                        <p className="text-slate-600">
                            Welcome, <b>{user.name}</b>
                        </p>

                        <p className="text-slate-500">
                            {user.email} · {user.role}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                        Logout
                    </button>

                </div>

                <div className="grid md:grid-cols-4 gap-5 mb-8">

                    <div className="bg-white rounded-2xl shadow p-6">
                        <p className="text-slate-500">
                            Total Bookings
                        </p>

                        <h2 className="text-3xl font-bold">
                            {totalBookings}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <p className="text-slate-500">
                            Pending
                        </p>

                        <h2 className="text-3xl font-bold text-blue-600">
                            {pendingBookings}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <p className="text-slate-500">
                            Completed
                        </p>

                        <h2 className="text-3xl font-bold text-green-600">
                            {completedBookings}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <p className="text-slate-500">
                            {
                                user.role === "tradesman"
                                ? "Revenue"
                                : "Cancelled/Rejected"
                            }
                        </p>

                        <h2 className="text-3xl font-bold text-purple-600">
                            {
                                user.role === "tradesman"
                                ? `₹${estimatedRevenue}`
                                : rejectedBookings
                            }
                        </h2>
                    </div>

                </div>

                {
                    user.role === "tradesman" && (
                        <div className="grid md:grid-cols-3 gap-5 mb-8">

                            <div className="bg-white rounded-2xl shadow p-6">
                                <p className="text-slate-500">
                                    Accepted Jobs
                                </p>

                                <h2 className="text-3xl font-bold text-emerald-600">
                                    {acceptedBookings}
                                </h2>
                            </div>

                            <div className="bg-white rounded-2xl shadow p-6">
                                <p className="text-slate-500">
                                    In Progress
                                </p>

                                <h2 className="text-3xl font-bold text-yellow-600">
                                    {inProgressBookings}
                                </h2>
                            </div>

                            <div className="bg-white rounded-2xl shadow p-6">
                                <p className="text-slate-500">
                                    Average Rating
                                </p>

                                <h2 className="text-3xl font-bold text-yellow-500">
                                    ⭐ {averageRating}
                                </h2>
                            </div>

                        </div>
                    )
                }

                {
                    message && (
                        <div className="bg-blue-100 text-blue-800 p-4 rounded-xl mb-6">
                            {message}
                        </div>
                    )
                }

                {
                    user.role === "tradesman" && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">

                            <h2 className="text-3xl font-bold mb-4">
                                Update Availability
                            </h2>

                            <p className="text-slate-600 mb-6">
                                Choose the days and time range when customers can book you.
                            </p>

                            {
                                tradesmanProfile && (
                                    <p className="text-slate-500 mb-4">
                                        Current:
                                        {" "}
                                        {
                                            tradesmanProfile.availabilityDays?.length > 0
                                            ? tradesmanProfile.availabilityDays.join(", ")
                                            : "No days selected"
                                        }
                                        {" "}
                                        |
                                        {" "}
                                        {tradesmanProfile.availableFrom || "09:00"}
                                        {" - "}
                                        {tradesmanProfile.availableTo || "18:00"}
                                    </p>
                                )
                            }

                            <form onSubmit={updateAvailability}>

                                <div className="grid md:grid-cols-4 gap-3 mb-6">
                                    {
                                        days.map((day) =>
                                        (
                                            <label
                                                key={day}
                                                className="flex items-center gap-2 bg-slate-100 p-3 rounded-xl"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        availabilityForm.availabilityDays.includes(day)
                                                    }
                                                    onChange={() => handleDayChange(day)}
                                                />

                                                {day}
                                            </label>
                                        ))
                                    }
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-6">

                                    <div>
                                        <label className="text-sm text-slate-600">
                                            Available From
                                        </label>

                                        <input
                                            type="time"
                                            value={availabilityForm.availableFrom}
                                            onChange={(e) =>
                                                setAvailabilityForm({
                                                    ...availabilityForm,
                                                    availableFrom: e.target.value
                                                })
                                            }
                                            className="w-full p-3 border rounded-xl"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-600">
                                            Available To
                                        </label>

                                        <input
                                            type="time"
                                            value={availabilityForm.availableTo}
                                            onChange={(e) =>
                                                setAvailabilityForm({
                                                    ...availabilityForm,
                                                    availableTo: e.target.value
                                                })
                                            }
                                            className="w-full p-3 border rounded-xl"
                                            required
                                        />
                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
                                >
                                    Save Availability
                                </button>

                            </form>

                        </div>
                    )
                }

                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <h2 className="text-3xl font-bold mb-6">
                        {
                            user.role === "tradesman"
                            ? "Booking Requests"
                            : "My Bookings"
                        }
                    </h2>

                    {
                        visibleBookings.length === 0 ? (
                            <p className="text-slate-600">
                                No bookings found.
                            </p>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {
                                    visibleBookings.map((booking) =>
                                    (
                                        <div
                                            key={booking._id}
                                            className="border rounded-2xl p-6 bg-slate-50"
                                        >
                                            <p className="font-bold text-lg mb-2">
                                                {
                                                    user.role === "tradesman"
                                                    ? `Customer: ${booking.customer?.name}`
                                                    : `Tradesman: ${booking.tradesman?.name}`
                                                }
                                            </p>

                                            <p className="text-slate-700">
                                                Service: {booking.tradesman?.service}
                                            </p>

                                            <p className="text-slate-700">
                                                Problem: {booking.issue}
                                            </p>

                                            <p className="text-slate-700">
                                                Date: {booking.preferredDate}
                                            </p>

                                            <p className="text-slate-700">
                                                Time: {booking.preferredTime}
                                            </p>

                                            <p className="mt-3">
                                                Status:{" "}
                                                <span className={getStatusClass(booking.status)}>
                                                    {booking.status}
                                                </span>
                                            </p>

                                            {
                                                user.role === "tradesman" && (
                                                    <div className="flex flex-wrap gap-3 mt-5">

                                                        {
                                                            booking.status === "pending" && (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            updateStatus(
                                                                                booking._id,
                                                                                "accepted"
                                                                            )
                                                                        }
                                                                        className="bg-green-600 text-white px-4 py-2 rounded-xl"
                                                                    >
                                                                        Accept
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            updateStatus(
                                                                                booking._id,
                                                                                "rejected"
                                                                            )
                                                                        }
                                                                        className="bg-red-600 text-white px-4 py-2 rounded-xl"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )
                                                        }

                                                        {
                                                            booking.status === "accepted" && (
                                                                <button
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            booking._id,
                                                                            "in-progress"
                                                                        )
                                                                    }
                                                                    className="bg-yellow-500 text-white px-4 py-2 rounded-xl"
                                                                >
                                                                    Start Work
                                                                </button>
                                                            )
                                                        }

                                                        {
                                                            booking.status === "in-progress" && (
                                                                <button
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            booking._id,
                                                                            "completed"
                                                                        )
                                                                    }
                                                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                                                                >
                                                                    Complete Work
                                                                </button>
                                                            )
                                                        }

                                                    </div>
                                                )
                                            }

                                            {
                                                user.role === "customer" &&
                                                booking.status === "pending" && (
                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                booking._id,
                                                                "cancelled"
                                                            )
                                                        }
                                                        className="mt-5 bg-red-600 text-white px-4 py-2 rounded-xl"
                                                    >
                                                        Cancel Booking
                                                    </button>
                                                )
                                            }

                                            {
                                                user.role === "customer" &&
                                                booking.status === "completed" && (
                                                    <button
                                                        onClick={() =>
                                                        {
                                                            setReviewBooking(booking);
                                                            setMessage("");
                                                        }}
                                                        className="mt-5 bg-purple-600 text-white px-4 py-2 rounded-xl"
                                                    >
                                                        Leave Review
                                                    </button>
                                                )
                                            }

                                        </div>
                                    ))
                                }
                            </div>
                        )
                    }

                </div>

            </div>

            {
                reviewBooking && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6">

                        <form
                            onSubmit={submitReview}
                            className="bg-white rounded-2xl p-8 w-full max-w-md"
                        >
                            <h2 className="text-2xl font-bold mb-4">
                                Review {reviewBooking.tradesman?.name}
                            </h2>

                            <label className="block mb-2 font-semibold">
                                Rating
                            </label>

                            <select
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="w-full p-3 border rounded-xl mb-4"
                                required
                            >
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Good</option>
                                <option value="3">3 - Average</option>
                                <option value="2">2 - Poor</option>
                                <option value="1">1 - Bad</option>
                            </select>

                            <textarea
                                placeholder="Write your review..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full p-3 border rounded-xl mb-4"
                                required
                            />

                            <div className="flex gap-4">

                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl"
                                >
                                    Submit Review
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                    {
                                        setReviewBooking(null);
                                        setRating(5);
                                        setComment("");
                                    }}
                                    className="flex-1 bg-slate-300 py-3 rounded-xl"
                                >
                                    Cancel
                                </button>

                            </div>
                        </form>

                    </div>
                )
            }

        </div>
    );
}
