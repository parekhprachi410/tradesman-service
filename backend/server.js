const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Tradesman = require("./models/Tradesman");
const Booking = require("./models/Booking");
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

app.use(cors());
app.use(express.json());
app.use("/api/reviews", reviewRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) =>
{
    res.send("Tradesman Finder Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tradesmen", tradesmanRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/upload", uploadRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() =>
{
    console.log("MongoDB connected");

    app.listen(process.env.PORT, () =>
    {
        console.log(`Server running on port ${process.env.PORT}`);
    });
})
.catch((error) =>
{
    console.log("MongoDB connection error:", error);
});