const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

router.get("/:userId", async (req, res) =>
{
    try
    {
        const notifications = await Notification.find({
            user: req.params.userId
        }).sort({ createdAt: -1 });

        res.json(notifications);
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
});

router.put("/:id/read", async (req, res) =>
{
    try
    {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        res.json(notification);
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to update notification",
            error: error.message
        });
    }
});

router.put("/user/:userId/read-all", async (req, res) =>
{
    try
    {
        await Notification.updateMany(
            { user: req.params.userId },
            { isRead: true }
        );

        res.json({
            message: "All notifications marked as read"
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to mark notifications as read",
            error: error.message
        });
    }
});

module.exports = router;