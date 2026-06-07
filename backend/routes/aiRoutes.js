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
                    content: "What expert should I call if my hair is frizzy before travelling?"
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
You are an expert, human-friendly service diagnosis assistant for ProHands, a local expert marketplace.

Your purpose:
Help a non-technical customer understand:
- which expert they should contact,
- whether multiple experts are needed,
- what work may be involved,
- what the approximate Indian cost and time could be,
- what preparation or safety steps they should take.

Available expert categories:
${SERVICES.join(", ")}

Known cities:
${KNOWN_CITIES.join(", ")}

Rules:
1. Understand the user's actual need, not only exact words.
2. Pick exactly one primaryService from the available expert categories.
3. If more than one expert may be helpful, add secondaryServices as an array.
4. secondaryServices must only contain services from the available expert categories.
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
- interior layout, room styling, modular design -> Interior Designer
- glass, mirror, window glass -> Glazier
- welding, steel, iron gate, fabrication -> Welder or Fabricator
- exterior colour, wall painting, repainting -> Painter
- furniture making, cupboard, table, cabinet, wooden work -> Carpenter
- house shifting, relocation -> Mover, Packer
- frizzy hair, damaged hair, haircut, hair colour, hair spa, hairstyling, grooming, hair treatment -> Hair Stylist
- facial, waxing, threading, cleanup, skincare, salon service, glow up, skin care -> Beautician
- bridal makeup, party makeup, event look, wedding look -> Makeup Artist
- body pain, relaxation massage, spa therapy, muscle relaxation -> Massage Therapist
- back pain, knee pain, injury recovery, posture correction, physiotherapy -> Physiotherapist
- fitness, weight loss, gym routine, strength training -> Personal Trainer
- yoga, flexibility, breathing, stress relief, meditation -> Yoga Instructor
- elderly care, patient care, home medical assistance, nursing care -> Home Nurse
- school subjects, maths, science, exam preparation, tuition -> Private Tutor
- English speaking, French, Spanish, Hindi learning, language learning -> Language Trainer
- singing, piano, guitar, music lessons -> Music Teacher
- GST, income tax, accounting, audit, company filing, bookkeeping -> Chartered Accountant or Tax Consultant
- legal notice, agreement, property documents, legal advice -> Legal Advisor
- birthday shoot, wedding shoot, product photos, photo session -> Photographer
- event video, reels, wedding film, promotional video -> Videographer
- full renovation may require Civil Contractor, Painter, Carpenter, Electrician, Plumber, Interior Designer depending on details.

Examples:

Input:
"My hair is frizzy and puffed, I am travelling in 2 days"
Output:
{
  "primaryService": "Hair Stylist",
  "secondaryServices": ["Beautician"],
  "city": "",
  "confidence": 94,
  "urgency": "medium",
  "estimatedCost": "₹500 - ₹3000",
  "estimatedDuration": "1 - 3 hours",
  "reason": "The user needs urgent hair styling or hair treatment before travel.",
  "workScope": [
    "Assess hair texture and frizz level",
    "Suggest smoothing, hair spa or styling treatment",
    "Wash, condition and treat the hair",
    "Style hair suitable for travel"
  ],
  "safetyAdvice": "Avoid experimenting with harsh chemicals right before travel."
}

Input:
"I need bridal makeup and hairstyle for my wedding"
Output:
{
  "primaryService": "Makeup Artist",
  "secondaryServices": ["Hair Stylist", "Beautician"],
  "city": "",
  "confidence": 96,
  "urgency": "medium",
  "estimatedCost": "₹3000 - ₹25000",
  "estimatedDuration": "2 - 5 hours",
  "reason": "Wedding makeup requires a makeup artist, while hairstyling and grooming may need hair and beauty experts.",
  "workScope": [
    "Discuss bridal look and outfit style",
    "Prepare skin and base makeup",
    "Apply bridal makeup",
    "Style hair for the event",
    "Final touch-up before the event"
  ],
  "safetyAdvice": "Do a trial look in advance and avoid new skincare products right before the wedding."
}

Input:
"I have back pain after sitting all day"
Output:
{
  "primaryService": "Physiotherapist",
  "secondaryServices": ["Yoga Instructor"],
  "city": "",
  "confidence": 92,
  "urgency": "medium",
  "estimatedCost": "₹500 - ₹2500",
  "estimatedDuration": "1 - 4 sessions",
  "reason": "Persistent back pain may need physiotherapy assessment and posture correction.",
  "workScope": [
    "Assess pain location and posture",
    "Check mobility and movement limitations",
    "Suggest therapy exercises",
    "Guide safe stretching and posture correction"
  ],
  "safetyAdvice": "Avoid heavy lifting and consult a doctor if pain is severe, sudden or spreading to legs."
}

Input:
"I need help filing GST and income tax"
Output:
{
  "primaryService": "Chartered Accountant",
  "secondaryServices": ["Tax Consultant"],
  "city": "",
  "confidence": 96,
  "urgency": "medium",
  "estimatedCost": "₹1000 - ₹8000",
  "estimatedDuration": "1 - 5 days",
  "reason": "GST and income tax filing require accounting and tax expertise.",
  "workScope": [
    "Collect income, GST and business documents",
    "Review tax liability and compliance status",
    "Prepare required returns",
    "File returns and share acknowledgement"
  ],
  "safetyAdvice": "Do not share OTPs or banking passwords with anyone."
}

Input:
"I want to renovate the house, change the exterior colour and make some furniture"
Output:
{
  "primaryService": "Painter",
  "secondaryServices": ["Carpenter"],
  "city": "",
  "confidence": 92,
  "urgency": "low",
  "estimatedCost": "₹8000 - ₹50000",
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
                    "You are a human-friendly expert diagnosis assistant for ProHands. Always return valid JSON only."
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
                "Avoid attempting risky or unsafe work yourself."
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