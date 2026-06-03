import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register()
{
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
        phone: "",
        service: "",
        experience: "",
        hourlyRate: "",
        city: "",
        description: ""
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
            const userResponse = await api.post("/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role
            });

            if (form.role === "tradesman")
            {
                await api.post("/tradesmen", {
                    user: userResponse.data.user.id,
                    name: form.name,
                    phone: form.phone,
                    service: form.service,
                    experience: Number(form.experience),
                    hourlyRate: Number(form.hourlyRate),
                    city: form.city,
                    description: form.description
                });
            }

            setMessage("Registration successful");

            setTimeout(() =>
            {
                navigate("/login");
            }, 1000);
        }
        catch (error)
        {
            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6 py-12">

            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-lg"
            >
                <h2 className="text-3xl font-bold mb-6 text-center">
                    Create Account
                </h2>

                <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 border rounded-xl"
                    required
                />

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

                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 border rounded-xl"
                >
                    <option value="customer">
                        Customer
                    </option>

                    <option value="tradesman">
                        Tradesman
                    </option>
                </select>

                {
                    form.role === "tradesman" && (
                        <>
                            <input
                                name="phone"
                                placeholder="Phone Number"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full p-3 mb-4 border rounded-xl"
                                required
                            />

                            <select
                                name="service"
                                value={form.service}
                                onChange={handleChange}
                                className="w-full p-3 mb-4 border rounded-xl"
                                required
                            >
                                <option value="">
                                    Select Expertise
                                </option>

                                <option value="Plumber">
                                    Plumber
                                </option>

                                <option value="Electrician">
                                    Electrician
                                </option>

                                <option value="Carpenter">
                                    Carpenter
                                </option>

                                <option value="Painter">
                                    Painter
                                </option>
                            </select>

                            <input
                                name="experience"
                                type="number"
                                placeholder="Experience in years"
                                value={form.experience}
                                onChange={handleChange}
                                className="w-full p-3 mb-4 border rounded-xl"
                                required
                            />

                            <input
                                name="hourlyRate"
                                type="number"
                                placeholder="Hourly Rate"
                                value={form.hourlyRate}
                                onChange={handleChange}
                                className="w-full p-3 mb-4 border rounded-xl"
                                required
                            />

                            <input
                                name="city"
                                placeholder="City"
                                value={form.city}
                                onChange={handleChange}
                                className="w-full p-3 mb-4 border rounded-xl"
                                required
                            />

                            <textarea
                                name="description"
                                placeholder="Describe your skills/services"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full p-3 mb-4 border rounded-xl"
                                required
                            />
                        </>
                    )
                }

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold"
                >
                    Register
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