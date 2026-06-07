export const serviceCategories = [
    {
        category: "Home & Maintenance",
        services: [
            "Plumber",
            "Electrician",
            "Carpenter",
            "Painter",
            "Cleaner",
            "Housekeeper",
            "Gardener",
            "Pest Control Technician",
            "Locksmith",
            "Furniture Assembler"
        ]
    },
    {
        category: "Vehicle Services",
        services: [
            "Mechanic",
            "Bike Mechanic",
            "Auto Electrician"
        ]
    },
    {
        category: "Construction & Design",
        services: [
            "Architect",
            "Interior Designer",
            "Mason",
            "Civil Contractor",
            "Tile Installer",
            "POP Contractor",
            "Steel Worker"
        ]
    },
    {
        category: "Glass, Metal & Fabrication",
        services: [
            "Welder",
            "Fabricator",
            "Glazier",
            "Glass Installer"
        ]
    },
    {
        category: "Technology & Installation",
        services: [
            "Telecommunication Technician",
            "CCTV Installer",
            "Network Technician",
            "Fiber Optic Technician",
            "AC Technician",
            "Appliance Repair Technician",
            "Solar Panel Installer"
        ]
    },
    {
        category: "Moving & Logistics",
        services: [
            "Mover",
            "Packer"
        ]
    },
    {
        category: "Beauty & Wellness",
        services: [
            "Beautician",
            "Hair Stylist",
            "Makeup Artist",
            "Massage Therapist",
            "Yoga Instructor",
            "Personal Trainer"
        ]
    },
    {
        category: "Health & Care",
        services: [
            "Physiotherapist",
            "Home Nurse"
        ]
    },
    {
        category: "Education & Training",
        services: [
            "Private Tutor",
            "Language Trainer",
            "Music Teacher"
        ]
    },
    {
        category: "Business & Creative Services",
        services: [
            "Chartered Accountant",
            "Tax Consultant",
            "Legal Advisor",
            "Photographer",
            "Videographer"
        ]
    }
];

const services = serviceCategories.flatMap(
    (group) => group.services
);

export default services;