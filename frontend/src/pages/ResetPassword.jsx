import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword()
{
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    function validatePassword(value)
    {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/.test(value);
    }

    async function handleSubmit(e)
    {
        e.preventDefault();

        if (password !== confirmPassword)
        {
            setMessage("Passwords do not match");
            return;
        }

        if (!validatePassword(password))
        {
            setMessage(
                "Password must be 8+ characters with uppercase, lowercase, number and special character"
            );
            return;
        }

        try
        {
            const response = await api.post(
                `/auth/reset-password/${token}`,
                {
                    password
                }
            );

            setMessage(response.data.message);

            setTimeout(() =>
            {
                navigate("/login");
            }, 1200);
        }
        catch (error)
        {
            setMessage(
                error.response?.data?.message ||
                "Password reset failed"
            );
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg"
            >
                <h2 className="text-3xl font-bold mb-6 text-center">
                    Reset Password
                </h2>

                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-xl"
                    required
                />

                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-xl"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold"
                >
                    Reset Password
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