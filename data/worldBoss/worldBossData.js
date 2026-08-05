Game.worldBossData = (function () {
    "use strict";

    return {
        epochMs: Date.UTC(2026, 0, 1, 0, 0, 0),
        cycleDurationMs: 72 * 60 * 60 * 1000,
        activeDurationMs: 48 * 60 * 60 * 1000,
        dailyAttempts: 3,
        boss: {
            id: "mushroomTitan",
            name: "Mushroom Titan",
            icon: "🍄",
            description: "A continent-sized fungal organism drifting between worlds. Every colony in the simulated network attacks the same living mass.",
            maxHealth: 5000000,
            defense: 0.12,
            attackSeconds: 75,
            bossAttackIntervalMs: 30 * 1000,
            bossAttackPower: 12000,
            exclusiveMinerId: "titanHerald",
            exclusiveArtifactId: "titanHeart"
        },
        ranks: [
            { id: "bronze", name: "Bronze", minDamage: 500, tokens: 30, mycoCoins: 250, xp: 100 },
            { id: "silver", name: "Silver", minDamage: 3000, tokens: 65, mycoCoins: 600, xp: 180 },
            { id: "gold", name: "Gold", minDamage: 15000, tokens: 140, mycoCoins: 1400, xp: 320, artifact: true },
            { id: "mythic", name: "Mythic", minDamage: 60000, tokens: 300, mycoCoins: 3500, xp: 600, artifact: true, miner: true }
        ]
    };
}());
