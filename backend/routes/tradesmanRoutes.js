const express = require("express");
const Tradesman = require("../models/Tradesman");

const router = express.Router();

const SERVICES = [
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
    "Packer",
    "Beautician",
    "Hair Stylist",
    "Makeup Artist",
    "Massage Therapist",
    "Yoga Instructor",
    "Personal Trainer",
    "Physiotherapist",
    "Home Nurse",
    "Private Tutor",
    "Language Trainer",
    "Music Teacher",
    "Chartered Accountant",
    "Tax Consultant",
    "Legal Advisor",
    "Photographer",
    "Videographer"
];

function isValidPhone(phone)
{
    return /^[6-9]\d{9}$/.test(phone);
}

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
                message: "All expert profile fields are required"
            });
        }

        if (!isValidPhone(phone))
        {
            return res.status(400).json({
                message: "Enter a valid 10-digit Indian phone number"
            });
        }

        if (!SERVICES.includes(service))
        {
            return res.status(400).json({
                message: "Invalid service selected"
            });
        }

        if (Number(experience) < 0)
        {
            return res.status(400).json({
                message: "Experience cannot be negative"
            });
        }

        if (Number(hourlyRate) <= 0)
        {
            return res.status(400).json({
                message: "Hourly rate must be greater than 0"
            });
        }

        if (!availabilityDays || availabilityDays.length === 0)
        {
            return res.status(400).json({
                message: "Please select at least one available day"
            });
        }

        if (!availableFrom || !availableTo)
        {
            return res.status(400).json({
                message: "Please select availability time range"
            });
        }

        if (availableFrom >= availableTo)
        {
            return res.status(400).json({
                message: "Available from time must be before available to time"
            });
        }

        const existingProfile = await Tradesman.findOne({
            user
        });

        if (existingProfile)
        {
            return res.status(400).json({
                message: "Expert profile already exists for this account"
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
            availabilityDays,
            availableFrom,
            availableTo
        });

        res.status(201).json({
            message: "Expert profile created successfully",
            tradesman
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to create expert profile",
            error: error.message
        });
    }
});

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
            message: "Failed to fetch experts",
            error: error.message
        });
    }
});

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
                message: "Expert profile not found"
            });
        }

        res.json(tradesman);
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to fetch expert profile",
            error: error.message
        });
    }
});

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
                message: "Expert profile not found"
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