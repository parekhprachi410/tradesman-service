const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
{
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

    issue:
    {
        type: String,
        required: true
    },

    preferredDate:
    {
        type: String,
        required: true
    },

    preferredTime:
    {
        type: String,
        required: true
    },

    status:
    {
        type: String,
        enum:
        [
            "pending",
            "accepted",
            "in-progress",
            "completed",
            "rejected",
            "cancelled"
        ],
        default: "pending"
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);