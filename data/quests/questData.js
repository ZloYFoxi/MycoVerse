Game.questData = (function () {
    "use strict";

    return {
        storyOrder: [
            "firstHarvest",
            "livingCollection",
            "geneticAwakening",
            "crystalFrontier",
            "ancientNetwork",
            "voidAscension"
        ],

        story: {
            firstHarvest: {
                name: "The First Harvest",
                description: "Raise Colony Power to 10 and prove that the first mycelial network can sustain itself.",
                objective: { type: "colonyPower", target: 10 },
                rewards: { spores: 750, dna: 5 }
            },
            livingCollection: {
                name: "Many Shapes of Life",
                description: "Discover three different miner species.",
                objective: { type: "species", target: 3 },
                rewards: { spores: 2500, dna: 15 }
            },
            geneticAwakening: {
                name: "Genetic Awakening",
                description: "Advance the Mycelium Laboratory to level 2.",
                objective: { type: "laboratoryLevel", target: 2 },
                rewards: { science: 500, dna: 25 }
            },
            crystalFrontier: {
                name: "The Crystal Frontier",
                description: "Unlock Crystal Grove and establish a new living route.",
                objective: { type: "planetUnlocked", planetId: "crystalGrove", target: 1 },
                rewards: { gem: 750, dna: 40 }
            },
            ancientNetwork: {
                name: "The Ancient Network",
                description: "Unlock Ancient Hive and reconnect its dormant mycelial intelligence.",
                objective: { type: "planetUnlocked", planetId: "ancientHive", target: 1 },
                rewards: { spores: 25000, science: 5000, dna: 125 }
            },
            voidAscension: {
                name: "Bloom Beyond the Stars",
                description: "Reach Void Bloom, the final known league of the current galaxy.",
                objective: { type: "planetUnlocked", planetId: "voidBloom", target: 1 },
                rewards: { dna: 300, minerId: "voidOracle", minerAmount: 1 }
            }
        },

        daily: [
            {
                id: "dailyProduction",
                name: "Feeding the Colony",
                description: "Produce 5,000 resources through fungal miners today.",
                objective: { type: "dailyProduction", target: 5000 },
                rewards: { spores: 3500, dna: 8 }
            },
            {
                id: "dailyEvolution",
                name: "Controlled Evolution",
                description: "Upgrade miner species three times today.",
                objective: { type: "dailyUpgrades", target: 3 },
                rewards: { science: 750, dna: 10 }
            },
            {
                id: "dailyExpedition",
                name: "Beyond the Colony",
                description: "Complete one expedition today.",
                objective: { type: "dailyExpeditions", target: 1 },
                rewards: { spores: 5000, dna: 12 }
            }
        ],

        expeditionOrder: [
            "sporeScout",
            "crystalSurvey",
            "toxicGathering",
            "ancientDive",
            "voidPilgrimage"
        ],

        expeditions: {
            sporeScout: {
                name: "Spore Scout",
                planetId: "mycoPrime",
                durationSeconds: 600,
                cost: { spores: 500 },
                requirements: { species: 1, specimens: 1 },
                rewards: { spores: [900, 1500], dna: [2, 4] }
            },
            crystalSurvey: {
                name: "Crystal Survey",
                planetId: "crystalGrove",
                durationSeconds: 2700,
                cost: { spores: 3000 },
                requirements: { species: 2, specimens: 3 },
                rewards: { gem: [250, 500], dna: [8, 14] }
            },
            toxicGathering: {
                name: "Toxic Gathering",
                planetId: "toxicForest",
                durationSeconds: 7200,
                cost: { spores: 9000 },
                requirements: { species: 4, specimens: 6 },
                rewards: { science: [1500, 3000], dna: [20, 35], minerChance: 0.18, minerId: "toxicHarvester" }
            },
            ancientDive: {
                name: "Ancient Memory Dive",
                planetId: "ancientHive",
                durationSeconds: 21600,
                cost: { spores: 30000 },
                requirements: { species: 7, specimens: 12 },
                rewards: { science: [7500, 15000], dna: [70, 120], minerChance: 0.12, minerId: "hiveWarden" }
            },
            voidPilgrimage: {
                name: "Void Pilgrimage",
                planetId: "voidBloom",
                durationSeconds: 43200,
                cost: { spores: 100000 },
                requirements: { species: 10, specimens: 20 },
                rewards: { science: [30000, 60000], dna: [180, 300], minerChance: 0.08, minerId: "voidOracle" }
            }
        }
    };
}());
