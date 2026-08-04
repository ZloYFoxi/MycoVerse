Game.goldenEventData = (function () {
    'use strict';
    return {
        dataVersion: 4,
        goldenHourCycleMs: 24 * 60 * 60 * 1000,
        goldenHourMinDelayMs: 18 * 60 * 60 * 1000,
        goldenHourMaxDelayMs: 24 * 60 * 60 * 1000,
        goldenHourMinDuration: 40 * 60 * 1000,
        goldenHourMaxDuration: 60 * 60 * 1000,
        goldenHourMultiplier: 2.5,
        mushroomMinDelayMs: 10 * 60 * 60 * 1000,
        mushroomMaxDelayMs: 14 * 60 * 60 * 1000,
        mushroomSearchDurationMs: 30 * 60 * 1000,
        mushroomHintAtMs: 15 * 60 * 1000,
        mushroomWarningAtMs: 25 * 60 * 1000
    };
}());
