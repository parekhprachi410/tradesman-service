import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login()
{
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    function handleChange(e)
    {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e)
    {
        e.preventDefault();

        try
        {
            const response = await api.post(
                "/auth/login",
                form
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );
            
            window.dispatchEvent(new Event("authChange"));

            setMessage("Login successful");

            setTimeout(() =>
            {
                navigate("/dashboard");
            }, 800);
        }
        catch (error)
        {
            setMessage(
                error.response?.data?.message ||
                "Login failed"
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
                    Login
                </h2>

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 border rounded-xl"
                    required
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 border rounded-xl"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold"
                >
                    Login
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