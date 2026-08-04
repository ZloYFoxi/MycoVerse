Game.minerData = (function () {
    "use strict";

    return {
        sporeWorker: {
            name: "Spore Worker",
            description: "A young worker that gathers spores for the colony.",
            rarity: MINER_RARITY.COMMON,
            resource: "wood",
            baseIncome: 0.5,
            maxLevel: 100,
            startOwned: 1,
            upgradeBaseCost: 15
        },
        glowForager: {
            name: "Glow Forager",
            description: "Its luminous cap reveals rich fungal growth beneath the soil.",
            rarity: MINER_RARITY.RARE,
            resource: "wood",
            baseIncome: 1.25,
            maxLevel: 100,
            startOwned: 0,
            upgradeBaseCost: 75
        },
        crystalDigger: {
            name: "Crystal Digger",
            description: "A hardened mushroom adapted to harvesting crystalline biomass.",
            rarity: MINER_RARITY.EPIC,
            resource: "gem",
            baseIncome: 0.2,
            maxLevel: 75,
            startOwned: 0,
            upgradeBaseCost: 300
        },
        elderMycelium: {
            name: "Elder Mycelium",
            description: "An ancient mind connected to every root in the colony.",
            rarity: MINER_RARITY.LEGENDARY,
            resource: "wood",
            baseIncome: 4,
            maxLevel: 50,
            startOwned: 0,
            upgradeBaseCost: 1500
        },
        voidOracle: {
            name: "Void Oracle",
            description: "A mythical organism that hears spores drifting between stars.",
            rarity: MINER_RARITY.MYTHIC,
            resource: "science",
            baseIncome: 0.5,
            maxLevel: 25,
            startOwned: 0,
            upgradeBaseCost: 10000
        }
    };
}());
