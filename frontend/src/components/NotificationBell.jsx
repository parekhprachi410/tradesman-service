import { useEffect, useState } from "react";
import api from "../services/api";

export default function NotificationBell()
{
    const user = JSON.parse(localStorage.getItem("user"));

    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() =>
    {
        if (user)
        {
            fetchNotifications();
        }
    }, []);

    async function fetchNotifications()
    {
        try
        {
            const response = await api.get(
                `/notifications/${user.id}`
            );

            setNotifications(response.data);
        }
        catch (error)
        {
            console.log(error);
        }
    }

    async function markAllAsRead()
    {
        try
        {
            await api.put(
                `/notifications/user/${user.id}/read-all`
            );

            fetchNotifications();
        }
        catch (error)
        {
            console.log(error);
        }
    }

    const unreadCount = notifications.filter(
        (item) => !item.isRead
    ).length;

    if (!user)
    {
        return null;
    }

    return (
        <div className="relative">

            <button
                onClick={() => setOpen(!open)}
                className="relative"
            >
                🔔

                {
                    unreadCount > 0 && (
                        <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                            {unreadCount}
                        </span>
                    )
                }
            </button>

            {
                open && (
                    <div className="absolute right-0 mt-4 w-80 bg-white text-slate-900 rounded-2xl shadow-xl p-4 z-50">

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">
                                Notifications
                            </h3>

                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600"
                            >
                                Mark all read
                            </button>
                        </div>

                        {
                            notifications.length === 0 ? (
                                <p className="text-slate-500">
                                    No notifications yet.
                                </p>
                            ) : (
                                notifications.map((item) =>
                                (
                                    <div
                                        key={item._id}
                                        className={
                                            item.isRead
                                            ? "p-3 border-b text-slate-500"
                                            : "p-3 border-b bg-blue-50"
                                        }
                                    >
                                        <p className="text-sm">
                                            {item.message}
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )
                        }

                    </div>
                )
            }

        </div>
    );
}