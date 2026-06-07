import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tradesmen from "./pages/Tradesmen";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotificationBell from "./components/NotificationBell";

export default function App()
{
    const [user, setUser] = useState(null);

    function loadUser()
    {
        const storedUser = localStorage.getItem("user");

        if (storedUser)
        {
            setUser(JSON.parse(storedUser));
        }
        else
        {
            setUser(null);
        }
    }

    useEffect(() =>
    {
        loadUser();

        window.addEventListener(
            "authChange",
            loadUser
        );

        return () =>
        {
            window.removeEventListener(
                "authChange",
                loadUser
            );
        };
    }, []);

    function handleLogout()
    {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.dispatchEvent(
            new Event("authChange")
        );

        window.location.href = "/";
    }

    return (
        <BrowserRouter>
            <nav className="bg-slate-950 text-white px-8 py-5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">

                    <Link
                        to="/"
                        className="text-3xl font-bold"
                    >
                        ProHands
                    </Link>

                    <div className="flex gap-8 items-center">

                        <Link to="/">
                            Home
                        </Link>

                        <Link to="/tradesmen">
                            Experts
                        </Link>

                        {
                            user ? (
                                <>
                                    <NotificationBell />

                                    <Link to="/dashboard">
                                        Dashboard
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">
                                        Login
                                    </Link>

                                    <Link to="/register">
                                        Register
                                    </Link>
                                </>
                            )
                        }

                    </div>

                </div>
            </nav>

            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/tradesmen"
                    element={<Tradesmen />}
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}