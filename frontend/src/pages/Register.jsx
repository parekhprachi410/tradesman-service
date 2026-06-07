import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register()
{
    const navigate = useNavigate();

    const services = [
        "Plumber",
        "Electrician",
        "Carpenter",
        "Painter",
        "Cleaner",
        "Housekeeper",
        "Mechanic",
        "Bike Mechanic",
        "Auto Electrician",
        "Architect",
        "Interior Designer",
        "Welder",
        "Fabricator",
        "Glazier",
        "Glass Installer",
        "Telecommunication Technician",
        "CCTV Installer",
        "Network Technician",
        "Fiber Optic Technician",
        "AC Technician",
        "Appliance Repair Technician",
        "Solar Panel Installer",
        "Gardener",
        "Pest Control Technician",
        "Mason",
        "Civil Contractor",
        "Tile Installer",
        "POP Contractor",
        "Steel Worker",
        "Locksmith",
        "Furniture Assembler",
        "Mover",
        "Packer"
    ];

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "customer",
        phone: "",
        service: "",
        experience: "",
        hourlyRate: "",
        city: "",
        profileImage: "",
        description: "",
        availabilityDays: [],
        availableFrom: "09:00",
        availableTo: "18:00"
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    function handleChange(e)
    {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    function handleDayChange(day)
    {
        if (form.availabilityDays.includes(day))
        {
            setForm({
                ...form,
                availabilityDays: form.availabilityDays.filter(
                    (item) => item !== day
                )
            });
        }
        else
        {
            setForm({
                ...form,
                availabilityDays: [
                    ...form.availabilityDays,
                    day
                ]
            });
        }
    }

    function handleImageChange(e)
    {
        const file = e.target.files[0];

        if (file)
        {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    function validatePassword(password)
    {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/.test(password);
    }

    async function uploadImage()
    {
        if (!imageFile)
        {
            return "";
        }

        const imageData = new FormData();

        imageData.append("image", imageFile);

        const response = await api.post(
            "/upload",
            imageData,
            {
                headers:
                {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data.imageUrl;
    }

    async function handleSubmit(e)
    {
        e.preventDefault();
        setMessage("");

        if (form.password !== form.confirmPassword)
        {
            setMessage("Passwords do not match");
            return;
        }

        if (!validatePassword(form.password))
        {
            setMessage(
                "Password must be 8+ characters with uppercase, lowercase, number and special character"
            );
            return;
        }

        if (form.role === "tradesman")
        {
            if (form.availabilityDays.length === 0)
            {
                setMessage("Please select at least one available day");
                return;
            }

            if (form.availableFrom >= form.availableTo)
            {
                setMessage("Available from time must be before available to time");
                return;
            }
        }

        try
        {
            setUploading(true);

            let uploadedImageUrl = "";

            if (form.role === "tradesman")
            {
                uploadedImageUrl = await uploadImage();
            }

            const userResponse = await api.post(
                "/auth/register",
                {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role
                }
            );

            if (form.role === "tradesman")
            {
                await api.post(
                    "/tradesmen",
                    {
                        user: userResponse.data.user.id,
                        name: form.name,
                        phone: form.phone,
                        service: form.service,
                        experience: form.experience,
                        hourlyRate: form.hourlyRate,
                        city: form.city,
                        profileImage: uploadedImageUrl,
                        description: form.description,
                        availabilityDays: form.availabilityDays,
                        availableFrom: form.availableFrom,
                        availableTo: form.availableTo
                    }
                );
            }

            setMessage(
                "Registration successful. Redirecting to login..."
            );

            setTimeout(() =>
            {
                navigate("/login");
            }, 1200);
        }
        catch (error)
        {
            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
        finally
        {
            setUploading(false);
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

                <div className="relative mb-2">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-3 pr-20 border rounded-xl"
                        required
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-sm text-blue-600"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                <p className="text-sm text-slate-500 mb-4">
                    Password must contain uppercase, lowercase, number, special character and at least 8 characters.
                </p>

                <div className="relative mb-4">
                    <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full p-3 pr-20 border rounded-xl"
                        required
                    />

                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-sm text-blue-600"
                    >
                        {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                </div>

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
                                placeholder="10-digit Phone Number"
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

                                {
                                    services.map((service) =>
                                    (
                                        <option
                                            key={service}
                                            value={service}
                                        >
                                            {service}
                                        </option>
                                    ))
                                }
                            </select>

                            <input
                                name="experience"
                                type="number"
                                min="0"
                                placeholder="Experience in years"
                                value={form.experience}
                                onChange={handleChange}
                                className="w-full p-3 mb-4 border rounded-xl"
                                required
                            />

                            <input
                                name="hourlyRate"
                                type="number"
                                min="1"
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

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full p-3 mb-4 border rounded-xl"
                            />

                            {
                                imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                                    />
                                )
                            }

                            <div className="mb-4">
                                <p className="font-semibold mb-2">
                                    Available Days
                                </p>

                                <div className="grid grid-cols-2 gap-2">
                                    {
                                        days.map((day) =>
                                        (
                                            <label
                                                key={day}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        form.availabilityDays.includes(day)
                                                    }
                                                    onChange={() => handleDayChange(day)}
                                                />

                                                {day}
                                            </label>
                                        ))
                                    }
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-sm text-slate-600">
                                        Available From
                                    </label>

                                    <input
                                        name="availableFrom"
                                        type="time"
                                        value={form.availableFrom}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-xl"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-slate-600">
                                        Available To
                                    </label>

                                    <input
                                        name="availableTo"
                                        type="time"
                                        value={form.availableTo}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

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
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold disabled:bg-slate-400"
                >
                    {
                        uploading
                        ? "Creating Account..."
                        : "Register"
                    }
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