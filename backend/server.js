const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const reviewRoutes = require("./routes/reviewRoutes");
const authRoutes = require("./routes/authRoutes");
const tradesmanRoutes = require("./routes/tradesmanRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://prohands-sigma.vercel.app"
];

if (process.env.FRONTEND_URL)
{
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
    cors({
        origin: function(origin, callback)
        {
            if (!origin || allowedOrigins.includes(origin))
            {
                callback(null, true);
            }
            else
            {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true
    })
);

app.use(express.json());

app.get("/", (req, res) =>
{
    res.send("ProHands Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tradesmen", tradesmanRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() =>
{
    console.log("MongoDB connected");

    app.listen(PORT, () =>
    {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((error) =>
{
    console.log("MongoDB connection error:", error);
});