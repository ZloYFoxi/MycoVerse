Game.laboratoryData = (function () {
    "use strict";

    return {
        maxLevel: 10,
        experiencePerLevel: 100,
        fusionRewards: {
            common: 15,
            rare: 35,
            epic: 80,
            legendary: 180,
            mythic: 400
        },
        mutationCosts: {
            common: 10,
            rare: 24,
            epic: 55,
            legendary: 125,
            mythic: 280
        },
        mutationPool: [
            { id: "dense_gills", name: "Dense Gills", incomePercent: 5 },
            { id: "luminous_veins", name: "Luminous Veins", incomePercent: 8 },
            { id: "ancient_genome", name: "Ancient Genome", incomePercent: 12 },
            { id: "void_resonance", name: "Void Resonance", incomePercent: 15 }
        ]
    };
}());
