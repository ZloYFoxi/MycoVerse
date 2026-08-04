Game.economyData = (function () {
    "use strict";

    return {
        resourceValues: {
            wood: 1,
            gem: 24,
            science: 42,
            metal: 3,
            oil: 5,
            energy: 0.15
        },
        upgradeGrowth: 1.16,
        cloneGrowth: 1.30,
        marketBuyMultiplier: 1.0,
        marketSellMultiplier: 0.52,
        minimumMarketPrice: 40,
        artifactBaseValue: 500,
        historyLimit: 30,
        paybackBands: [
            { maxSeconds: 300, grade: "S", label: "Exceptional" },
            { maxSeconds: 1200, grade: "A", label: "Excellent" },
            { maxSeconds: 3600, grade: "B", label: "Healthy" },
            { maxSeconds: 14400, grade: "C", label: "Long-term" },
            { maxSeconds: 86400, grade: "D", label: "Strategic" },
            { maxSeconds: Infinity, grade: "E", label: "Very slow" }
        ]
    };
}());
