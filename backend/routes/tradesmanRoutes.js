const express = require("express");
const Tradesman = require("../models/Tradesman");

const router = express.Router();

function isValidPhone(phone)
{
    return /^[6-9]\d{9}$/.test(phone);
}

// CREATE TRADESMAN PROFILE
router.post("/", async (req, res) =>
{
    try
    {
        const {
            user,
            name,
            phone,
            service,
            experience,
            hourlyRate,
            city,
            description,
            profileImage,
            availabilityDays,
            availableFrom,
            availableTo
        } = req.body;

        if (
            !user ||
            !name ||
            !phone ||
            !service ||
            experience === "" ||
            hourlyRate === "" ||
            !city ||
            !description
        )
        {
            return res.status(400).json({
                message: "All tradesman profile fields are required"
            });
        }

        if (!isValidPhone(phone))
        {
            return res.status(400).json({
                message: "Enter a valid 10-digit Indian phone number"
            });
        }

        const existingProfile = await Tradesman.findOne({ user });

        if (existingProfile)
        {
            return res.status(400).json({
                message: "Tradesman profile already exists for this account"
            });
        }

        const tradesman = await Tradesman.create({
            user,
            name: name.trim(),
            phone: phone.trim(),
            service,
            experience: Number(experience),
            hourlyRate: Number(hourlyRate),
            city: city.trim(),
            description: description.trim(),
            profileImage: profileImage || "",
            availabilityDays: availabilityDays || [],
            availableFrom: availableFrom || "09:00",
            availableTo: availableTo || "18:00"
        });

        res.status(201).json({
            message: "Tradesman profile created successfully",
            tradesman
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to create tradesman profile",
            error: error.message
        });
    }
});

// GET ALL TRADESMEN
router.get("/", async (req, res) =>
{
    try
    {
        const tradesmen = await Tradesman.find()
        .populate("user", "name email role");

        res.json(tradesmen);
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to fetch tradesmen",
            error: error.message
        });
    }
});

// GET TRADESMAN PROFILE BY USER ID
router.get("/user/:userId", async (req, res) =>
{
    try
    {
        const tradesman = await Tradesman.findOne({
            user: req.params.userId
        });

        if (!tradesman)
        {
            return res.status(404).json({
                message: "Tradesman profile not found"
            });
        }

        res.json(tradesman);
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to fetch tradesman profile",
            error: error.message
        });
    }
});

// UPDATE AVAILABILITY
router.put("/availability/:userId", async (req, res) =>
{
    try
    {
        const {
            availabilityDays,
            availableFrom,
            availableTo
        } = req.body;

        if (!availabilityDays || availabilityDays.length === 0)
        {
            return res.status(400).json({
                message: "Select at least one available day"
            });
        }

        if (!availableFrom || !availableTo)
        {
            return res.status(400).json({
                message: "Select availability time range"
            });
        }

        if (availableFrom >= availableTo)
        {
            return res.status(400).json({
                message: "Available from time must be before available to time"
            });
        }

        const tradesman = await Tradesman.findOneAndUpdate(
            {
                user: req.params.userId
            },
            {
                availabilityDays,
                availableFrom,
                availableTo
            },
            {
                new: true
            }
        );

        if (!tradesman)
        {
            return res.status(404).json({
                message: "Tradesman profile not found"
            });
        }

        res.json({
            message: "Availability updated successfully",
            tradesman
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to update availability",
            error: error.message
        });
    }
});

module.exports = router;