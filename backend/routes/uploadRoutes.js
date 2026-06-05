const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
    storage
});

router.post("/", upload.single("image"), async (req, res) =>
{
    try
    {
        if (!req.file)
        {
            return res.status(400).json({
                message: "No image uploaded"
            });
        }

        const base64Image =
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(
            base64Image,
            {
                folder: "tradelink_profiles"
            }
        );

        res.json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Image upload failed",
            error: error.message
        });
    }
});

module.exports = router;