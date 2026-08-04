Game.goldenEventData = (function () {
    "use strict";

    return {
        dataVersion: 2,
        firstMushroomDelay: 12 * 60 * 60 * 1000,
        mushroomCooldown: 12 * 60 * 60 * 1000,
        firstGoldenHourDelay: 24 * 60 * 60 * 1000,
        goldenHourCooldown: 24 * 60 * 60 * 1000,
        goldenHourMinDuration: 40 * 60 * 1000,
        goldenHourMaxDuration: 60 * 60 * 1000,
        goldenHourMultiplier: 2.5,
        planetOrder: ["mycoPrime"],
        planets: {
            mycoPrime: {
                id: "mycoPrime",
                name: "Myco Prime",
                description: "The birthplace of the first living fungal colony.",
                rarityWeights: {
                    common: 70,
                    rare: 20,
                    epic: 7,
                    legendary: 2.5,
                    mythic: 0.5
                }
            }
        }
    };
}());
