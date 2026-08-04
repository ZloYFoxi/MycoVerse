Game.planetData = (function () {
    "use strict";

    return {
        dataVersion: 1,
        order: ["mycoPrime", "crystalGrove", "toxicForest", "ancientHive", "voidBloom"],
        planets: {
            mycoPrime: {
                id: "mycoPrime",
                name: "Myco Prime",
                league: 1,
                description: "The birthplace of the first living fungal colony.",
                unlock: { colonyPower: 0, laboratoryLevel: 1 },
                bonus: { resource: "wood", percent: 15 },
                drops: [
                    { minerId: "sporeWorker", weight: 70 },
                    { minerId: "glowForager", weight: 20 },
                    { minerId: "crystalDigger", weight: 7 },
                    { minerId: "elderMycelium", weight: 2.5 },
                    { minerId: "voidOracle", weight: 0.5 }
                ]
            },
            crystalGrove: {
                id: "crystalGrove",
                name: "Crystal Grove",
                league: 2,
                description: "A luminous world where mineral veins grow through living mycelium.",
                unlock: { colonyPower: 40, laboratoryLevel: 2 },
                bonus: { resource: "gem", percent: 25 },
                drops: [
                    { minerId: "crystalSprout", weight: 52 },
                    { minerId: "prismForager", weight: 30 },
                    { minerId: "crystalDigger", weight: 14 },
                    { minerId: "geodeSage", weight: 3.5 },
                    { minerId: "voidOracle", weight: 0.5 }
                ]
            },
            toxicForest: {
                id: "toxicForest",
                name: "Toxic Forest",
                league: 3,
                description: "A corrosive jungle whose organisms turn poison into useful energy.",
                unlock: { colonyPower: 150, laboratoryLevel: 3 },
                bonus: { globalPercent: 12 },
                drops: [
                    { minerId: "bogGatherer", weight: 45 },
                    { minerId: "venomCap", weight: 31 },
                    { minerId: "toxicHarvester", weight: 18 },
                    { minerId: "plagueElder", weight: 5 },
                    { minerId: "voidOracle", weight: 1 }
                ]
            },
            ancientHive: {
                id: "ancientHive",
                name: "Ancient Hive",
                league: 4,
                description: "An abandoned planetary hive filled with memories of extinct colonies.",
                unlock: { colonyPower: 500, laboratoryLevel: 5 },
                bonus: { globalPercent: 25 },
                drops: [
                    { minerId: "hiveDrone", weight: 30 },
                    { minerId: "amberKeeper", weight: 30 },
                    { minerId: "hiveWarden", weight: 25 },
                    { minerId: "elderMycelium", weight: 12 },
                    { minerId: "voidOracle", weight: 3 }
                ]
            },
            voidBloom: {
                id: "voidBloom",
                name: "Void Bloom",
                league: 5,
                description: "A flower-like world suspended at the edge of known space.",
                unlock: { colonyPower: 1500, laboratoryLevel: 7 },
                bonus: { resource: "science", percent: 40, globalPercent: 10 },
                drops: [
                    { minerId: "voidLarva", weight: 15 },
                    { minerId: "nebulaForager", weight: 25 },
                    { minerId: "starSpore", weight: 30 },
                    { minerId: "abyssBloom", weight: 22 },
                    { minerId: "voidOracle", weight: 8 }
                ]
            }
        }
    };
}());
