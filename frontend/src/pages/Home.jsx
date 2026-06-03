import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Home()
{
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [problem, setProblem] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function analyzeProblem(e)
    {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setResult(null);

        try
        {
            const response = await api.post(
                "/ai/analyze-problem",
                {
                    problem
                }
            );

            setResult(response.data);
        }
        catch (error)
        {
            setMessage("AI analysis failed.");
        }
        finally
        {
            setLoading(false);
        }
    }

    function findMatchingTradesmen()
    {
        if (result?.service)
        {
            navigate(
                `/tradesmen?service=${result.service}`
            );
        }
    }

    return (
        <section className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-6">

            <div className="max-w-4xl text-center">

                <h1 className="text-6xl font-bold text-slate-900 mb-6">
                    Find Trusted Tradesmen Near You
                </h1>

                <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                    Connect with plumbers, electricians, carpenters,
                    painters and skilled professionals in your city.
                </p>

                {
                    user && (
                        <p className="text-lg text-blue-700 font-semibold mb-6">
                            Welcome back, {user.name}
                        </p>
                    )
                }

                <form
                    onSubmit={analyzeProblem}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-8"
                >
                    <h2 className="text-2xl font-bold mb-4">
                        Not sure who to call?
                    </h2>

                    <textarea
                        placeholder="Describe your problem, e.g. My kitchen sink is leaking..."
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        className="w-full p-4 border rounded-xl mb-4"
                        required
                    />

                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold"
                    >
                        {
                            loading
                            ? "Analyzing..."
                            : "Analyze with AI"
                        }
                    </button>
                </form>

                {
                    message && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
                            {message}
                        </div>
                    )
                }

                {
                    result && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

                            <h3 className="text-2xl font-bold mb-3">
                                AI Recommendation
                            </h3>

                            <p className="text-xl text-blue-700 font-bold mb-2">
                                Recommended Service: {result.service}
                            </p>

                            <p className="text-slate-600 mb-2">
                                Confidence: {result.confidence}%
                            </p>

                            <p className="text-slate-600 mb-5">
                                {result.reason}
                            </p>

                            <button
                                onClick={findMatchingTradesmen}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
                            >
                                Find {result.service}s
                            </button>

                        </div>
                    )
                }

                <div className="flex justify-center gap-4">

                    <button
                        onClick={() => navigate("/tradesmen")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold"
                    >
                        Find Tradesmen
                    </button>

                    {
                        !user && (
                            <button
                                onClick={() => navigate("/register")}
                                className="border border-slate-300 px-8 py-4 rounded-xl font-semibold"
                            >
                                Join as Tradesman
                            </button>
                        )
                    }

                </div>

            </div>

        </section>
    );
}