const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

function isValidEmail(email)
{
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password)
{
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/.test(password);
}

router.post("/register", async (req, res) =>
{
    try
    {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role)
        {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!isValidEmail(email))
        {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        if (!isStrongPassword(password))
        {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            });
        }

        if (!["customer", "tradesman"].includes(role))
        {
            return res.status(400).json({
                message: "Invalid role selected"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser)
        {
            return res.status(400).json({
                message: "Account already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role
        });

        res.status(201).json({
            message: "User registered successfully",
            user:
            {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

router.post("/login", async (req, res) =>
{
    try
    {
        const { email, password } = req.body;

        if (!email || !password)
        {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user)
        {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch)
        {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user:
            {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});

router.post("/forgot-password", async (req, res) =>
{
    try
    {
        const { email } = req.body;

        if (!email)
        {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user)
        {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetUrl =
        `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const html = `
            <h2>Reset your TradeLink password</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link expires in 15 minutes.</p>
        `;

        await sendEmail(
            user.email,
            "TradeLink Password Reset",
            html
        );

        res.json({
            message: "Password reset link sent to your email"
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Failed to send reset email",
            error: error.message
        });
    }
});

router.post("/reset-password/:token", async (req, res) =>
{
    try
    {
        const { password } = req.body;

        if (!password)
        {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        if (!isStrongPassword(password))
        {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            });
        }

        const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires:
            {
                $gt: Date.now()
            }
        });

        if (!user)
        {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({
            message: "Password reset successful"
        });
    }
    catch (error)
    {
        res.status(500).json({
            message: "Password reset failed",
            error: error.message
        });
    }
});

module.exports = router;