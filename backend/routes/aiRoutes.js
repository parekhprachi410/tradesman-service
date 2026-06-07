const express = require("express");
const Groq = require("groq-sdk");

const router = express.Router();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

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
    "Packer"
];

const KNOWN_CITIES = [
    "Ahmedabad",
    "Anand",
    "Vadodara",
    "Surat",
    "Rajkot",
    "Gandhinagar",
    "Nadiad",
    "Mumbai",
    "Pune",
    "Delhi",
    "Bangalore"
];

function extractCity(problem)
{
    const text = problem.toLowerCase();

    for (const city of KNOWN_CITIES)
    {
        if (text.includes(city.toLowerCase()))
        {
            return city;
        }
    }

    return "";
}

router.get("/test-ai", async (req, res) =>
{
    try
    {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages:
            [
                {
                    role: "user",
                    content: "What profession installs MCB circuit breakers?"
                }
            ]
        });

        res.json({
            response: completion.choices[0].message.content
        });
    }
    catch (error)
    {
        res.status(500).json({
            error: error.message
        });
    }
});

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

        const city = extractCity(problem);

        const prompt = `
You are an expert, human-friendly service diagnosis assistant for TradeLink, a local services marketplace.

Your purpose:
Help a non-technical customer understand:
- who they should call,
- whether multiple experts are needed,
- what work may be involved,
- what the approximate cost and time could be,
- what preparation or safety steps they should take.

Available service categories:
${SERVICES.join(", ")}

Known cities:
${KNOWN_CITIES.join(", ")}

Rules:
1. Understand the user's meaning, not only exact words.
2. Pick exactly one primaryService from the available service categories.
3. If the problem clearly requires more than one expert, add secondaryServices as an array.
4. secondaryServices must only contain services from the available service categories.
5. Do not include the same service in both primaryService and secondaryServices.
6. If no extra expert is needed, secondaryServices must be [].
7. Extract city only if the user mentions one from known cities.
8. If no city is mentioned, city must be "".
9. Estimate urgency as "low", "medium", or "high".
10. Estimate a practical Indian market cost range in rupees.
11. Estimate realistic duration.
12. Give a simple workScope array of 3 to 6 steps.
13. Give clear reason in simple human language.
14. Give short safetyAdvice or preparationAdvice.
15. Return only valid JSON. No markdown.

Important mappings:
- MCB, circuit breaker, RCCB, DB box, wiring, sparks, sockets -> Electrician
- lizards, termites, cockroaches, insects, rats, infestation -> Pest Control Technician
- car, bike, scooter, engine, brake, clutch -> Mechanic
- CCTV, security camera -> CCTV Installer
- internet, router, WiFi, fiber, LAN -> Network Technician
- AC cooling, AC gas, AC service -> AC Technician
- building plan, house design, floor plan -> Architect
- glass, mirror, window glass -> Glazier
- welding, steel, iron gate, fabrication -> Welder or Fabricator
- exterior colour, wall painting, repainting -> Painter
- furniture making, cupboard, table, cabinet, wooden work -> Carpenter
- full renovation may require Civil Contractor, Painter, Carpenter, Electrician, Plumber, Interior Designer depending on details.

Examples:

Input:
"I want to renovate the house, change the exterior colour and make some furniture"
Output:
{
  "primaryService": "Painter",
  "secondaryServices": ["Carpenter"],
  "city": "",
  "confidence": 92,
  "urgency": "low",
  "estimatedCost": "₹8,000 - ₹50,000",
  "estimatedDuration": "2 - 7 days",
  "reason": "Exterior colour change needs a painter, while making furniture requires carpentry work.",
  "workScope": [
    "Inspect exterior walls and furniture requirements",
    "Prepare surfaces for painting",
    "Apply primer and exterior paint",
    "Take furniture measurements",
    "Build or assemble required furniture"
  ],
  "safetyAdvice": "Cover outdoor items and keep children away from paint, tools and wood-cutting areas."
}

Input:
"My bathroom pipe is leaking and the light is not working"
Output:
{
  "primaryService": "Plumber",
  "secondaryServices": ["Electrician"],
  "city": "",
  "confidence": 94,
  "urgency": "medium",
  "estimatedCost": "₹500 - ₹2500",
  "estimatedDuration": "1 - 3 hours",
  "reason": "The leaking pipe requires plumbing work, while the faulty bathroom light requires electrical repair.",
  "workScope": [
    "Inspect the leaking pipe",
    "Repair or replace damaged pipe/fitting",
    "Check bathroom electrical point safely",
    "Repair light wiring or fixture if needed"
  ],
  "safetyAdvice": "Avoid touching electrical switches near water and keep the bathroom dry until inspection."
}

Input:
"Need CCTV and WiFi setup for my office in Anand"
Output:
{
  "primaryService": "CCTV Installer",
  "secondaryServices": ["Network Technician"],
  "city": "Anand",
  "confidence": 96,
  "urgency": "medium",
  "estimatedCost": "₹5,000 - ₹35,000",
  "estimatedDuration": "4 - 8 hours",
  "reason": "CCTV installation and WiFi/network setup require both security camera and networking expertise.",
  "workScope": [
    "Inspect office layout",
    "Plan camera and router/access point placement",
    "Install CCTV cameras and wiring",
    "Configure DVR/NVR and mobile viewing",
    "Set up WiFi/network coverage"
  ],
  "safetyAdvice": "Keep access to power points and ceiling/wall areas clear before the technician arrives."
}

User problem:
"${problem}"

Return JSON only:
{
  "primaryService": "",
  "secondaryServices": [],
  "city": "",
  "confidence": 0,
  "urgency": "",
  "estimatedCost": "",
  "estimatedDuration": "",
  "reason": "",
  "workScope": [],
  "safetyAdvice": ""
}
`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages:
            [
                {
                    role: "system",
                    content:
                    "You are a human-friendly service diagnosis assistant. Always return valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format:
            {
                type: "json_object"
            },
            temperature: 0.1
        });

        const raw = completion.choices[0].message.content;

        const data = JSON.parse(raw);

        const primaryService = SERVICES.includes(data.primaryService)
            ? data.primaryService
            : "";

        const secondaryServices = Array.isArray(data.secondaryServices)
            ? data.secondaryServices.filter(
                (service) =>
                    SERVICES.includes(service) &&
                    service !== primaryService
            )
            : [];

        if (!primaryService)
        {
            return res.json({
                primaryService: "",
                secondaryServices: [],
                service: "",
                city,
                confidence: 30,
                urgency: "low",
                estimatedCost: "Not available",
                estimatedDuration: "Not available",
                reason: "Could not confidently classify the issue. Please describe the problem with more details.",
                workScope: [],
                safetyAdvice: "Please provide more specific details about the issue."
            });
        }

        res.json({
            primaryService,
            secondaryServices,
            service: primaryService,
            city: data.city || city || "",
            confidence: data.confidence || 80,
            urgency: data.urgency || "medium",
            estimatedCost: data.estimatedCost || "Not available",
            estimatedDuration: data.estimatedDuration || "Not available",
            reason: data.reason || "Service classified successfully.",
            workScope: Array.isArray(data.workScope)
                ? data.workScope
                : [],
            safetyAdvice:
                data.safetyAdvice ||
                "Avoid attempting risky repairs yourself."
        });
    }
    catch (error)
    {
        console.log("Groq AI error:", error);

        res.status(500).json({
            message: "AI analysis failed",
            error: error.message
        });
    }
});

module.exports = router;