Game.goldenEventData = (function () {
    "use strict";

    return {
        dataVersion: 1,
        firstMushroomDelay: 60 * 1000,
        mushroomCooldown: 15 * 60 * 1000,
        firstGoldenHourDelay: 5 * 60 * 1000,
        goldenHourCooldown: 60 * 60 * 1000,
        goldenHourDuration: 5 * 60 * 1000,
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
