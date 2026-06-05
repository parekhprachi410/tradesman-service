const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fallbackClassifier(problem)
{
    const text = problem.toLowerCase();

    if (
        text.includes("switch") ||
        text.includes("fan") ||
        text.includes("light") ||
        text.includes("wire") ||
        text.includes("current") ||
        text.includes("electric") ||
        text.includes("socket")
    )
    {
        return {
            service: "Electrician",
            confidence: 85,
            reason: "The problem is related to electrical components."
        };
    }

    if (
        text.includes("tap") ||
        text.includes("sink") ||
        text.includes("leak") ||
        text.includes("pipe") ||
        text.includes("water") ||
        text.includes("toilet")
    )
    {
        return {
            service: "Plumber",
            confidence: 85,
            reason: "The problem is related to water or plumbing."
        };
    }

    if (
        text.includes("door") ||
        text.includes("wood") ||
        text.includes("table") ||
        text.includes("chair") ||
        text.includes("cabinet")
    )
    {
        return {
            service: "Carpenter",
            confidence: 80,
            reason: "The problem is related to wooden furniture or fittings."
        };
    }

    if (
        text.includes("paint") ||
        text.includes("wall") ||
        text.includes("ceiling") ||
        text.includes("color")
    )
    {
        return {
            service: "Painter",
            confidence: 80,
            reason: "The problem is related to painting or walls."
        };
    }

    return {
        service: "Electrician",
        confidence: 50,
        reason: "Could not confidently classify, showing closest available service."
    };
}

router.post("/analyze-problem", async (req, res) =>
{
    try
    {
        const { problem } = req.body;

        if (!problem)
        {
            return res.status(400).json({
                message: "Problem description is required"
            });
        }

        try
        {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash"
            });

            const prompt = `
Classify this problem into one category only.

Categories:
Plumber, Electrician, Carpenter, Painter

Problem: ${problem}

Return only JSON:
{
  "service": "Electrician",
  "confidence": 95,
  "reason": "Short reason"
}
`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

            const data = JSON.parse(cleaned);

            return res.json(data);
        }
        catch (aiError)
        {
            console.log("Gemini failed, using fallback:", aiError.message);

            return res.json({
                ...fallbackClassifier(problem),
                fallback: true
            });
        }
    }
    catch (error)
    {
        res.status(500).json({
            message: "AI analysis failed",
            error: error.message
        });
    }
});

module.exports = router;