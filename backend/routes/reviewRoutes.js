const express = require("express");

const Review = require("../models/Review");
const Tradesman = require("../models/Tradesman");
const Notification = require("../models/Notification");

const router = express.Router();

// CREATE REVIEW
router.post("/", async (req, res) =>
{
    try
    {
        const {
            booking,
            customer,
            tradesman,
            rating,
            comment
        } = req.body;

        const existingReview = await Review.findOne({
            booking
        });

        if (existingReview)
        {
            return res.status(400).json({
                message: "Review already submitted for this booking"
            });
        }

        const review = await Review.create({
            booking,
            customer,
            tradesman,
            rating,
            comment
        });

        await Notification.create({
            user: tradesman.user,
            type: "review",
            message:
            `You received a new ${rating}-star review`
        });

        const reviews = await Review.find({
            tradesman
        });

        const averageRating =
        reviews.reduce(
            (sum, item) => sum + item.rating,
            0
        ) / reviews.length;

        await Tradesman.findByIdAndUpdate(
            tradesman,
            {
                rating: Number(
                    averageRating.toFixed(1)
                ),
                reviewCount: reviews.length
            }
        );

        res.status(201).json({
            message: "Review submitted successfully",
            review
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Review failed",
            error: error.message
        });
    }
});

// GET REVIEWS FOR TRADESMAN
router.get("/:tradesmanId", async (req, res) =>
{
    try
    {
        const reviews = await Review.find({
            tradesman: req.params.tradesmanId
        })
        .populate("customer", "name email");

        res.json(reviews);
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
});

module.exports = router;