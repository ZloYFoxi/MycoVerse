Game.structureData = (function () {
    "use strict";

    var instance = {};

    instance.order = [
        "sporeNursery",
        "prismOrchard",
        "oracleCanopy",
        "myceliumNexus",
        "memoryArchive",
        "ancestralMonument"
    ];

    instance.entries = {
        sporeNursery: {
            name: "Spore Nursery",
            icon: "🍄",
            description: "Warm living chambers nurture new spores before they join the greater colony.",
            maxLevel: 10,
            baseCost: { spores: 250 },
            costGrowth: 1.72,
            requirements: {},
            bonus: { type: "resource", resource: "wood", percentPerLevel: 8 }
        },
        prismOrchard: {
            name: "Prism Orchard",
            icon: "💎",
            description: "Crystal-fed caps refract subterranean light into valuable mineral growth.",
            maxLevel: 8,
            baseCost: { spores: 1800, gems: 30 },
            costGrowth: 1.85,
            requirements: { planets: 2 },
            bonus: { type: "resource", resource: "gem", percentPerLevel: 10 }
        },
        oracleCanopy: {
            name: "Oracle Canopy",
            icon: "🔮",
            description: "A thinking canopy exchanges memories with every scholar in the colony.",
            maxLevel: 8,
            baseCost: { spores: 6500, science: 90 },
            costGrowth: 1.90,
            requirements: { laboratory: 2 },
            bonus: { type: "resource", resource: "science", percentPerLevel: 12 }
        },
        myceliumNexus: {
            name: "Mycelium Nexus",
            icon: "🕸️",
            description: "A dense transport network synchronizes every working organism.",
            maxLevel: 10,
            baseCost: { spores: 15000, gems: 150, dna: 12 },
            costGrowth: 2.02,
            requirements: { colonyPower: 80, laboratory: 3 },
            bonus: { type: "global", percentPerLevel: 4 }
        },
        memoryArchive: {
            name: "Memory Archive",
            icon: "🧠",
            description: "Preserved ancestral patterns accelerate the generation of living Insight.",
            maxLevel: 6,
            baseCost: { spores: 40000, science: 650, dna: 35 },
            costGrowth: 2.20,
            requirements: { research: 3, planets: 3 },
            bonus: { type: "insight", percentPerLevel: 10 }
        },
        ancestralMonument: {
            name: "Ancestral Monument",
            icon: "🌌",
            description: "A monument grown from remembered colonies resonates across every rebirth.",
            maxLevel: 5,
            baseCost: { spores: 125000, gems: 1200, dna: 100 },
            costGrowth: 2.45,
            requirements: { ascensions: 1, colonyPower: 250 },
            bonus: { type: "global", percentPerLevel: 5 }
        }
    };

    return instance;
}());
