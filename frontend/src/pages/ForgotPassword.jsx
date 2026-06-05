import { useState } from "react";
import api from "../services/api";

export default function ForgotPassword()
{
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e)
    {
        e.preventDefault();

        try
        {
            const response = await api.post(
                "/auth/forgot-password",
                {
                    email
                }
            );

            setMessage(response.data.message);
        }
        catch (error)
        {
            setMessage(
                error.response?.data?.message ||
                "Failed to send reset link"
            );
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg"
            >
                <h2 className="text-3xl font-bold mb-4 text-center">
                    Forgot Password
                </h2>

                <p className="text-slate-600 text-center mb-6">
                    Enter your registered email. We will send you a reset link.
                </p>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-xl"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold"
                >
                    Send Reset Link
                </button>

                {
                    message && (
                        <p className="text-center mt-4 text-slate-700">
                            {message}
                        </p>
                    )
                }
            </form>

        </div>
    );
}