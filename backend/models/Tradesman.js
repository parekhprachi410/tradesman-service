const mongoose = require("mongoose");

const tradesmanSchema = new mongoose.Schema(
{
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    name:
    {
        type: String,
        required: true
    },

    phone:
    {
        type: String,
        required: true
    },

    service:
    {
        type: String,
        required: true
    },

    experience:
    {
        type: Number,
        default: 0
    },

    hourlyRate:
    {
        type: Number,
        required: true
    },

    city:
    {
        type: String,
        required: true
    },

    rating:
    {
        type: Number,
        default: 4.5
    },

    reviewCount:
    {
        type: Number,
        default: 0
    },

    profileImage:
    {
        type: String,
        default: ""
    },

    description:
    {
        type: String
    },

    availabilityDays:
    {
        type: [String],
        default: []
    },

    availableFrom:
    {
        type: String,
        default: "09:00"
    },

    availableTo:
    {
        type: String,
        default: "18:00"
    },

    available:
    {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Tradesman", tradesmanSchema);