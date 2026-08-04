Game.ascensionData = (function () {
    "use strict";

    return {
        dataVersion: 1,
        requirements: {
            colonyPower: 250,
            planetsUnlocked: 3,
            researchCompleted: 4
        },
        upgradesOrder: [
            "eternalNetwork",
            "ancestralSpores",
            "crystalMemory",
            "oracleEcho",
            "swiftInsight"
        ],
        upgrades: {
            eternalNetwork: {
                id: "eternalNetwork",
                name: "Eternal Network",
                description: "Fragments of every previous colony reinforce all miner production.",
                maxLevel: 10,
                baseCost: 2,
                costGrowth: 2,
                bonus: { type: "global", percentPerLevel: 5 }
            },
            ancestralSpores: {
                id: "ancestralSpores",
                name: "Ancestral Spores",
                description: "Old genetic memories accelerate Spore production in every new cycle.",
                maxLevel: 10,
                baseCost: 1,
                costGrowth: 2,
                bonus: { type: "resource", resource: "wood", percentPerLevel: 10 }
            },
            crystalMemory: {
                id: "crystalMemory",
                name: "Crystal Memory",
                description: "Prismatic patterns survive ascension and improve Gem production.",
                maxLevel: 10,
                baseCost: 1,
                costGrowth: 2,
                bonus: { type: "resource", resource: "gem", percentPerLevel: 10 }
            },
            oracleEcho: {
                id: "oracleEcho",
                name: "Oracle Echo",
                description: "The voices of vanished colonies continue their scientific work.",
                maxLevel: 10,
                baseCost: 1,
                costGrowth: 2,
                bonus: { type: "resource", resource: "science", percentPerLevel: 10 }
            },
            swiftInsight: {
                id: "swiftInsight",
                name: "Deep-Time Intuition",
                description: "Each rebirth makes the living network understand itself more quickly.",
                maxLevel: 5,
                baseCost: 3,
                costGrowth: 3,
                bonus: { type: "insight", percentPerLevel: 15 }
            }
        }
    };
}());
