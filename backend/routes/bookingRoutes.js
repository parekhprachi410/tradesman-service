const express = require("express");
const Booking = require("../models/Booking");
const Tradesman = require("../models/Tradesman");
const Notification = require("../models/Notification");

const router = express.Router();

function getDayName(dateString)
{
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        weekday: "long"
    });
}

router.post("/", async (req, res) =>
{
    try
    {
        const {
            customer,
            tradesman,
            issue,
            preferredDate,
            preferredTime
        } = req.body;

        const selectedTradesman = await Tradesman.findById(tradesman);

        if (!selectedTradesman)
        {
            return res.status(404).json({
                message: "Tradesman not found"
            });
        }

        const bookingDay = getDayName(preferredDate);

        if (!selectedTradesman.availabilityDays.includes(bookingDay))
        {
            return res.status(400).json({
                message: `Tradesman is not available on ${bookingDay}`
            });
        }

        if (
            preferredTime < selectedTradesman.availableFrom ||
            preferredTime > selectedTradesman.availableTo
        )
        {
            return res.status(400).json({
                message: `Tradesman is available only from ${selectedTradesman.availableFrom} to ${selectedTradesman.availableTo}`
            });
        }

        const booking = await Booking.create({
            customer,
            tradesman,
            issue,
            preferredDate,
            preferredTime
        });

        await Notification.create({
            user: selectedTradesman.user,
            type: "booking",
            message:
            `New booking request received for ${selectedTradesman.service}`
        });

        res.status(201).json({
            message: "Booking created successfully",
            booking
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Booking failed",
            error: error.message
        });
    }
});

router.get("/", async (req, res) =>
{
    try
    {
        const bookings = await Booking.find()
        .populate("customer", "name email")
        .populate({
            path: "tradesman",
            populate:
            {
                path: "user",
                select: "name email"
            }
        });

        res.json(bookings);
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to fetch bookings",
            error: error.message
        });
    }
});

router.put("/:id/status", async (req, res) =>
{
    try
    {
        const { status } = req.body;

        const allowedStatuses =
        [
            "pending",
            "accepted",
            "in-progress",
            "completed",
            "rejected",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status))
        {
            return res.status(400).json({
                message: "Invalid booking status"
            });
        }

        const booking = await Booking.findById(req.params.id)
        .populate("customer")
        .populate({
            path: "tradesman",
            populate:
            {
                path: "user"
            }
        });

        booking.status = status;

        await booking.save();

        let notificationMessage = "";

        if (status === "accepted")
        {
            notificationMessage =
            `Your booking has been accepted`;
        }

        if (status === "rejected")
        {
            notificationMessage =
            `Your booking has been rejected`;
        }

        if (status === "in-progress")
        {
            notificationMessage =
            `Work has started on your booking`;
        }

        if (status === "completed")
        {
            notificationMessage =
            `Your booking has been completed`;
        }

        if (status === "cancelled")
        {
            notificationMessage =
            `Booking has been cancelled`;
        }

        if (notificationMessage)
        {
            await Notification.create({
                user: booking.customer._id,
                type: "booking",
                message: notificationMessage
            });
        }

        res.json({
            message: "Booking status updated",
            booking
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to update booking",
            error: error.message
        });
    }
});

module.exports = router;