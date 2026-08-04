Game.unionData = (function () {
    "use strict";

    return {
        maxUnions: 3,
        maxMembers: 5,
        roles: {
            leader: { name: "Leader", description: "Strengthens every member and increases boss damage.", productionPercent: 3, bossPercent: 8 },
            worker: { name: "Worker", description: "Boosts the production resource of this miner.", resourcePercent: 10 },
            support: { name: "Support", description: "Improves expedition speed and stabilises the union.", expeditionPercent: 7, productionPercent: 1 },
            researcher: { name: "Researcher", description: "Empowers Science income and union experience.", sciencePercent: 12, xpPercent: 15 }
        },
        talents: {
            production: { name: "Collective Growth", maxLevel: 10, baseCost: 2, description: "+3% union production per level." },
            boss: { name: "War Mycelium", maxLevel: 10, baseCost: 2, description: "+5% boss squad power per level." },
            expedition: { name: "Shared Paths", maxLevel: 10, baseCost: 2, description: "+4% expedition speed per level." }
        },
        synergy: {
            sameResourcePercent: 4,
            sameRarityPercent: 3,
            samePlanetPercent: 5,
            fullTeamPercent: 8
        }
    };
}());
