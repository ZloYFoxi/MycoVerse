Game.goldenEventData = (function () {
    "use strict";
    return {
        dataVersion: 3,
        firstMushroomDelay: 12 * 60 * 60 * 1000,
        mushroomCooldown: 12 * 60 * 60 * 1000,
        firstGoldenHourDelay: 24 * 60 * 60 * 1000,
        goldenHourCooldown: 24 * 60 * 60 * 1000,
        goldenHourMinDuration: 40 * 60 * 1000,
        goldenHourMaxDuration: 60 * 60 * 1000,
        goldenHourMultiplier: 2.5
    };
}());
