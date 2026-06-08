import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Home()
{
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [problem, setProblem] = useState(
        sessionStorage.getItem("aiProblem") || ""
    );

    const [result, setResult] = useState(
        sessionStorage.getItem("aiResult")
        ? JSON.parse(sessionStorage.getItem("aiResult"))
        : null
    );

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() =>
    {
        const savedProblem = sessionStorage.getItem("aiProblem");
        const savedResult = sessionStorage.getItem("aiResult");

        if (savedProblem)
        {
            setProblem(savedProblem);
        }

        if (savedResult)
        {
            setResult(JSON.parse(savedResult));
        }
    }, []);

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

            sessionStorage.setItem(
                "aiProblem",
                problem
            );

            sessionStorage.setItem(
                "aiResult",
                JSON.stringify(response.data)
            );
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

    function clearDiagnosis()
    {
        setProblem("");
        setResult(null);
        setMessage("");

        sessionStorage.removeItem("aiProblem");
        sessionStorage.removeItem("aiResult");
    }

    function navigateToService(service)
    {
        if (!service)
        {
            setMessage("Could not identify the required service.");
            return;
        }

        let url = `/tradesmen?service=${encodeURIComponent(service)}`;

        if (result?.city)
        {
            url += `&city=${encodeURIComponent(result.city)}`;
        }

        navigate(url);
    }

    function findMatchingTradesmen()
    {
        navigateToService(result?.primaryService || result?.service);
    }

    return (
        <section className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-6 py-12">

            <div className="max-w-6xl mx-auto text-center">

                <h1 className="text-2xl md:text-7xl font-semibold leading-tight text-slate-800 mb-8">
                    Describe the problem. We'll find the right professionals.
                </h1>

                <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
                    Connect with trusted professionals for repairs, services, renovations, and everyday work near you.
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
                        placeholder="Describe your problem, e.g. I want to renovate my house, repaint exterior walls and make furniture in Anand..."
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        className="w-full p-4 border rounded-xl mb-4 min-h-28"
                        required
                    />

                    <div className="flex flex-wrap justify-center gap-4">

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold disabled:bg-slate-400"
                        >
                            {
                                loading
                                ? "Analyzing..."
                                : "Analyze with AI"
                            }
                        </button>

                        {
                            result && (
                                <button
                                    type="button"
                                    onClick={clearDiagnosis}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-3 rounded-xl font-semibold"
                                >
                                    Clear Diagnosis
                                </button>
                            )
                        }

                    </div>
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
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-left">

                            <h3 className="text-3xl font-bold mb-6 text-center">
                                AI Service Diagnosis
                            </h3>

                            {
                                result.primaryService || result.service ? (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-4 mb-6">

                                            <div className="bg-blue-50 p-5 rounded-xl">
                                                <p className="text-slate-500">
                                                    Primary Service
                                                </p>

                                                <h4 className="text-2xl font-bold text-blue-700">
                                                    {result.primaryService || result.service}
                                                </h4>
                                            </div>

                                            <div className="bg-purple-50 p-5 rounded-xl">
                                                <p className="text-slate-500">
                                                    Confidence
                                                </p>

                                                <h4 className="text-2xl font-bold text-purple-700">
                                                    {result.confidence}%
                                                </h4>
                                            </div>

                                            <div className="bg-yellow-50 p-5 rounded-xl">
                                                <p className="text-slate-500">
                                                    Urgency
                                                </p>

                                                <h4 className="text-2xl font-bold text-yellow-700 capitalize">
                                                    {result.urgency}
                                                </h4>
                                            </div>

                                            <div className="bg-green-50 p-5 rounded-xl">
                                                <p className="text-slate-500">
                                                    Estimated Cost
                                                </p>

                                                <h4 className="text-2xl font-bold text-green-700">
                                                    {result.estimatedCost}
                                                </h4>
                                            </div>

                                        </div>

                                        {
                                            result.secondaryServices?.length > 0 && (
                                                <div className="bg-indigo-50 p-5 rounded-xl mb-4">
                                                    <p className="font-bold mb-3 text-indigo-700">
                                                        Additional Experts Needed
                                                    </p>

                                                    <div className="flex flex-wrap gap-3">
                                                        {
                                                            result.secondaryServices.map((service) =>
                                                            (
                                                                <button
                                                                    key={service}
                                                                    onClick={() => navigateToService(service)}
                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold"
                                                                >
                                                                    Find {service}s
                                                                </button>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        }

                                        <div className="bg-slate-50 p-5 rounded-xl mb-4">
                                            <p className="font-bold mb-2">
                                                Estimated Duration
                                            </p>

                                            <p className="text-slate-700">
                                                {result.estimatedDuration}
                                            </p>
                                        </div>

                                        {
                                            result.city && (
                                                <div className="bg-slate-50 p-5 rounded-xl mb-4">
                                                    <p className="font-bold mb-2">
                                                        City Filter
                                                    </p>

                                                    <p className="text-slate-700">
                                                        {result.city}
                                                    </p>
                                                </div>
                                            )
                                        }

                                        <div className="bg-slate-50 p-5 rounded-xl mb-4">
                                            <p className="font-bold mb-2">
                                                Why this service?
                                            </p>

                                            <p className="text-slate-700">
                                                {result.reason}
                                            </p>
                                        </div>

                                        {
                                            result.workScope?.length > 0 && (
                                                <div className="bg-slate-50 p-5 rounded-xl mb-4">
                                                    <p className="font-bold mb-3">
                                                        Suggested Work Scope
                                                    </p>

                                                    <ol className="list-decimal list-inside space-y-2 text-slate-700">
                                                        {
                                                            result.workScope.map((step, index) =>
                                                            (
                                                                <li key={index}>
                                                                    {step}
                                                                </li>
                                                            ))
                                                        }
                                                    </ol>
                                                </div>
                                            )
                                        }

                                        <div className="bg-red-50 p-5 rounded-xl mb-6">
                                            <p className="font-bold mb-2 text-red-700">
                                                Safety / Preparation Advice
                                            </p>

                                            <p className="text-slate-700">
                                                {result.safetyAdvice}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-4">
                                            <button
                                                onClick={findMatchingTradesmen}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
                                            >
                                                {
                                                    result.city
                                                    ? `Find ${result.primaryService || result.service}s in ${result.city}`
                                                    : `Find ${result.primaryService || result.service}s`
                                                }
                                            </button>

                                            {
                                                result.secondaryServices?.map((service) =>
                                                (
                                                    <button
                                                        key={service}
                                                        onClick={() => navigateToService(service)}
                                                        className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold"
                                                    >
                                                        Find {service}s
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-600 text-center">
                                        {result.reason}
                                    </p>
                                )
                            }

                        </div>
                    )
                }

                <div className="flex justify-center gap-4">

                    <button
                        onClick={() => navigate("/tradesmen")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold"
                    >
                        Find Experts
                    </button>

                    {
                        !user && (
                            <button
                                onClick={() => navigate("/register")}
                                className="border border-slate-300 px-8 py-4 rounded-xl font-semibold"
                            >
                                Join as professional
                            </button>
                        )
                    }

                </div>

            </div>

        </section>
    );
}
