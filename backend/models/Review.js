const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
    booking:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },

    customer:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    tradesman:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tradesman",
        required: true
    },

    rating:
    {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment:
    {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);