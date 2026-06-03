import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ReviewModal from "../components/ReviewModal";

export default function Tradesmen()
{
    const [searchParams] = useSearchParams();

    const [tradesmen, setTradesmen] = useState([]);
    const [search, setSearch] = useState(
        searchParams.get("service") || ""
    );
    const [cityFilter, setCityFilter] = useState("");

    const [selectedTradesman, setSelectedTradesman] = useState(null);
    const [reviewTradesman, setReviewTradesman] = useState(null);

    const [issue, setIssue] = useState("");
    const [preferredDate, setPreferredDate] = useState("");
    const [preferredTime, setPreferredTime] = useState("");

    const [message, setMessage] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() =>
    {
        fetchTradesmen();
    }, []);

    async function fetchTradesmen()
    {
        try
        {
            const response = await api.get("/tradesmen");
            setTradesmen(response.data);
        }
        catch (error)
        {
            console.log(error);
        }
    }

    async function handleBooking(e)
    {
        e.preventDefault();

        if (!user)
        {
            setMessage("Please login before booking.");
            return;
        }

        try
        {
            await api.post("/bookings", {
                customer: user.id,
                tradesman: selectedTradesman._id,
                issue,
                preferredDate,
                preferredTime
            });

            setMessage("Booking created successfully!");

            setIssue("");
            setPreferredDate("");
            setPreferredTime("");
            setSelectedTradesman(null);
        }
        catch (error)
        {
            setMessage("Booking failed.");
        }
    }

    const cities = [
        ...new Set(
            tradesmen
            .map((item) => item.city)
            .filter(Boolean)
        )
    ];

    const filteredTradesmen = tradesmen.filter((item) =>
    {
        const searchText = search.toLowerCase();

        const matchesSearch =
        item.service?.toLowerCase().includes(searchText) ||
        item.city?.toLowerCase().includes(searchText) ||
        item.name?.toLowerCase().includes(searchText);

        const matchesCity =
        cityFilter === "" || item.city === cityFilter;

        return matchesSearch && matchesCity;
    });

    return (
        <div className="min-h-screen bg-slate-100 px-8 py-12">

            <div className="max-w-6xl mx-auto">

                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                    Available Tradesmen
                </h1>

                <p className="text-slate-600 mb-8">
                    Search and book trusted local professionals.
                </p>

                {
                    message && (
                        <div className="bg-blue-100 text-blue-800 p-4 rounded-xl mb-6">
                            {message}
                        </div>
                    )
                }

                <div className="grid md:grid-cols-2 gap-4 mb-10">

                    <input
                        type="text"
                        placeholder="Search by service, city or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">
                            All Cities
                        </option>

                        {
                            cities.map((city) =>
                            (
                                <option
                                    key={city}
                                    value={city}
                                >
                                    {city}
                                </option>
                            ))
                        }
                    </select>

                </div>

                <div className="grid md:grid-cols-3 gap-6">

                    {
                        filteredTradesmen.map((person) =>
                        (
                            <div
                                key={person._id}
                                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
                            >
                                <div className="flex items-center gap-4 mb-4">

                                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                                        {
                                            person.name
                                            ? person.name.charAt(0).toUpperCase()
                                            : person.service.charAt(0).toUpperCase()
                                        }
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {person.name || "Local Expert"}
                                        </h2>

                                        <p className="text-yellow-500 font-semibold">
                                            ⭐ {person.rating || 0}
                                            {" "}
                                            ({person.reviewCount || 0} Reviews)
                                        </p>
                                    </div>

                                </div>

                                <h3 className="text-2xl font-bold text-blue-700 mb-2">
                                    {person.service}
                                </h3>

                                <p className="text-slate-700">
                                    Experience: {person.experience} years
                                </p>

                                <p className="text-slate-700">
                                    ₹{person.hourlyRate}/hour
                                </p>

                                <p className="text-slate-700">
                                    {person.city}
                                </p>

                                <p className="mt-3 text-slate-600">
                                    {person.description}
                                </p>

                                <p className="mt-3 text-slate-500">
                                    Phone: {person.phone || "Not added"}
                                </p>

                                <button
                                    onClick={() =>
                                    {
                                        setReviewTradesman(person);
                                        setMessage("");
                                    }}
                                    className="mt-5 w-full bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-3 rounded-xl font-semibold"
                                >
                                    View Reviews
                                </button>

                                <button
                                    onClick={() =>
                                    {
                                        setSelectedTradesman(person);
                                        setMessage("");
                                    }}
                                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold"
                                >
                                    Book Now
                                </button>
                            </div>
                        ))
                    }

                </div>

                {
                    filteredTradesmen.length === 0 && (
                        <p className="text-center text-slate-600 mt-10">
                            No tradesmen found.
                        </p>
                    )
                }

            </div>

            {
                selectedTradesman && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-40">

                        <form
                            onSubmit={handleBooking}
                            className="bg-white rounded-2xl p-8 w-full max-w-md"
                        >
                            <h2 className="text-2xl font-bold mb-2">
                                Book {selectedTradesman.name}
                            </h2>

                            <p className="text-slate-600 mb-4">
                                Service: {selectedTradesman.service}
                            </p>

                            <textarea
                                placeholder="Describe your problem..."
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                className="w-full p-3 border rounded-xl mb-4"
                                required
                            />

                            <input
                                type="date"
                                value={preferredDate}
                                onChange={(e) => setPreferredDate(e.target.value)}
                                className="w-full p-3 border rounded-xl mb-4"
                                required
                            />

                            <input
                                type="time"
                                value={preferredTime}
                                onChange={(e) => setPreferredTime(e.target.value)}
                                className="w-full p-3 border rounded-xl mb-4"
                                required
                            />

                            <div className="flex gap-4">

                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
                                >
                                    Confirm Booking
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                    {
                                        setSelectedTradesman(null);
                                        setIssue("");
                                        setPreferredDate("");
                                        setPreferredTime("");
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

            {
                reviewTradesman && (
                    <ReviewModal
                        tradesmanId={reviewTradesman._id}
                        onClose={() => setReviewTradesman(null)}
                    />
                )
            }

        </div>
    );
}