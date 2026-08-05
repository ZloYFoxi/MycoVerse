Game.minerData = (function () {
    "use strict";

    return {
        sporeWorker: {
            name: "Spore Worker", description: "A young worker that gathers spores for the colony.", rarity: MINER_RARITY.COMMON, resource: "wood",
            incomePerMinute: 30, maxLevel: 100, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 15, order: 1, shopUnlockLevel: 1, shopRank: 1, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 2 }
        },
        mossNibble: {
            name: "Moss Nibbler", description: "A tiny cap that scrapes nutrient-rich moss from the roots.", rarity: MINER_RARITY.COMMON, resource: "wood",
            incomePerMinute: 42, maxLevel: 100, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 20, order: 2, shopUnlockLevel: 1, shopRank: 2, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 2 }
        },
        crystalSprout: {
            name: "Crystal Sprout", description: "A young organism born inside a living geode.", rarity: MINER_RARITY.COMMON, resource: "gem",
            incomePerMinute: 6, maxLevel: 100, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 35, order: 3, shopUnlockLevel: 2, shopRank: 3, passiveBonus: { type: "resource", resource: "gem", percentPerOwned: 2 }
        },
        bogGatherer: {
            name: "Bog Gatherer", description: "Thrives in corrosive marshes and harvests unstable spores.", rarity: MINER_RARITY.COMMON, resource: "wood",
            incomePerMinute: 60, maxLevel: 100, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 50, order: 4, shopUnlockLevel: 3, shopRank: 4, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 3 }
        },
        hiveDrone: {
            name: "Hive Drone", description: "A tireless organism guided by the Ancient Hive.", rarity: MINER_RARITY.COMMON, resource: "wood",
            incomePerMinute: 78, maxLevel: 100, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 70, order: 5, shopUnlockLevel: 4, shopRank: 5, passiveBonus: { type: "global", percentPerOwned: 1 }
        },
        voidLarva: {
            name: "Void Larva", description: "A tiny organism that survives without light or gravity.", rarity: MINER_RARITY.COMMON, resource: "science",
            incomePerMinute: 18, maxLevel: 100, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 95, order: 6, shopUnlockLevel: 5, shopRank: 6, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 4 }
        },
        rootTender: {
            name: "Root Tender", description: "Maintains the deepest nutrient channels of the colony.", rarity: MINER_RARITY.COMMON, resource: "wood",
            incomePerMinute: 110, maxLevel: 100, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 125, order: 7, shopUnlockLevel: 6, shopRank: 7, passiveBonus: { type: "global", percentPerOwned: 4 }
        },
        pinkForager: {
            name: "Pink Forager", description: "A cheerful cave scout that gathers luminous pink mushrooms and rare spores.", rarity: MINER_RARITY.COMMON, resource: "wood",
            incomePerMinute: 125, attackPower: 115, maxLevel: 100, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 145, order: 8, shopUnlockLevel: 7, shopRank: 8, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 4 }
        },
        glowForager: {
            name: "Glow Forager", description: "Its luminous cap reveals rich fungal growth beneath the soil.", rarity: MINER_RARITY.RARE, resource: "wood",
            incomePerMinute: 150, maxLevel: 95, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 170, order: 8, shopUnlockLevel: 7, shopRank: 1, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 4 }
        },
        prismForager: {
            name: "Prism Forager", description: "Splits starlight into mineral-rich fungal energy.", rarity: MINER_RARITY.RARE, resource: "gem",
            incomePerMinute: 38, maxLevel: 90, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 230, order: 9, shopUnlockLevel: 8, shopRank: 2, passiveBonus: { type: "resource", resource: "gem", percentPerOwned: 4 }
        },
        venomCap: {
            name: "Venom Cap", description: "Converts planetary toxins into scientific compounds.", rarity: MINER_RARITY.RARE, resource: "science",
            incomePerMinute: 28, maxLevel: 90, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 310, order: 10, shopUnlockLevel: 9, shopRank: 3, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 4 }
        },
        amberKeeper: {
            name: "Amber Keeper", description: "Preserves extinct spores inside living amber.", rarity: MINER_RARITY.RARE, resource: "gem",
            incomePerMinute: 62, maxLevel: 85, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 420, order: 11, shopUnlockLevel: 10, shopRank: 4, passiveBonus: { type: "resource", resource: "gem", percentPerOwned: 6 }
        },
        nebulaForager: {
            name: "Nebula Forager", description: "Feeds on charged dust drifting between stars.", rarity: MINER_RARITY.RARE, resource: "science",
            incomePerMinute: 52, maxLevel: 80, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 560, order: 12, shopUnlockLevel: 11, shopRank: 5, passiveBonus: { type: "global", percentPerOwned: 3 }
        },
        duskCollector: {
            name: "Dusk Collector", description: "Collects rare spores during the darkest planetary hours.", rarity: MINER_RARITY.RARE, resource: "wood",
            incomePerMinute: 260, maxLevel: 80, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 750, order: 13, shopUnlockLevel: 12, shopRank: 6, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 5 }
        },
        mycelialScout: {
            name: "Mycelial Scout", description: "Maps hidden resource veins for the entire network.", rarity: MINER_RARITY.RARE, resource: "gem",
            incomePerMinute: 92, maxLevel: 75, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 980, order: 14, shopUnlockLevel: 13, shopRank: 7, passiveBonus: { type: "global", percentPerOwned: 5 }
        },
        crystalDigger: {
            name: "Crystal Digger", description: "A hardened mushroom adapted to harvesting crystalline biomass.", rarity: MINER_RARITY.EPIC, resource: "gem",
            incomePerMinute: 130, maxLevel: 75, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 1350, order: 15, shopUnlockLevel: 14, shopRank: 1, passiveBonus: { type: "resource", resource: "gem", percentPerOwned: 5 }
        },
        toxicHarvester: {
            name: "Toxic Harvester", description: "A resilient extractor adapted to deadly fungal forests.", rarity: MINER_RARITY.EPIC, resource: "science",
            incomePerMinute: 95, maxLevel: 70, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 1800, order: 16, shopUnlockLevel: 15, shopRank: 2, passiveBonus: { type: "global", percentPerOwned: 2 }
        },
        hiveWarden: {
            name: "Hive Warden", description: "The armored guardian of the oldest mycelium network.", rarity: MINER_RARITY.EPIC, resource: "wood",
            incomePerMinute: 540, maxLevel: 65, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 2400, order: 17, shopUnlockLevel: 16, shopRank: 3, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 4 }
        },
        starSpore: {
            name: "Star Spore", description: "A radiant spore condensed from stellar plasma.", rarity: MINER_RARITY.EPIC, resource: "science",
            incomePerMinute: 180, maxLevel: 60, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 3200, order: 18, shopUnlockLevel: 17, shopRank: 4, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 10 }
        },
        lunarBloom: {
            name: "Lunar Bloom", description: "Blooms under cold moonlight and amplifies mineral growth.", rarity: MINER_RARITY.EPIC, resource: "gem",
            incomePerMinute: 250, maxLevel: 60, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 4300, order: 19, shopUnlockLevel: 18, shopRank: 5, passiveBonus: { type: "resource", resource: "gem", percentPerOwned: 7 }
        },
        geneCarver: {
            name: "Gene Carver", description: "Rewrites fungal traits while extracting research compounds.", rarity: MINER_RARITY.EPIC, resource: "science",
            incomePerMinute: 260, maxLevel: 55, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 5800, order: 20, shopUnlockLevel: 19, shopRank: 6, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 8 }
        },
        stormCap: {
            name: "Storm Cap", description: "Stores atmospheric charge and releases it into the colony.", rarity: MINER_RARITY.EPIC, resource: "wood",
            incomePerMinute: 900, maxLevel: 55, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 7800, order: 21, shopUnlockLevel: 20, shopRank: 7, passiveBonus: { type: "global", percentPerOwned: 6 }
        },
        elderMycelium: {
            name: "Elder Mycelium", description: "An ancient mind connected to every root in the colony.", rarity: MINER_RARITY.LEGENDARY, resource: "wood",
            incomePerMinute: 1200, maxLevel: 50, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 11000, order: 22, shopUnlockLevel: 21, shopRank: 1, passiveBonus: { type: "global", percentPerOwned: 3 }
        },
        geodeSage: {
            name: "Geode Sage", description: "An ancient crystalline mind that predicts mineral growth.", rarity: MINER_RARITY.LEGENDARY, resource: "gem",
            incomePerMinute: 480, maxLevel: 45, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 15000, order: 23, shopUnlockLevel: 22, shopRank: 2, passiveBonus: { type: "global", percentPerOwned: 2 }
        },
        plagueElder: {
            name: "Plague Elder", description: "Stores the genetic memory of a thousand toxic colonies.", rarity: MINER_RARITY.LEGENDARY, resource: "science",
            incomePerMinute: 420, maxLevel: 45, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 20000, order: 24, shopUnlockLevel: 23, shopRank: 3, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 7 }
        },
        abyssBloom: {
            name: "Abyss Bloom", description: "A legendary flower that opens only in the cosmic void.", rarity: MINER_RARITY.LEGENDARY, resource: "science",
            incomePerMinute: 720, maxLevel: 40, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 27000, order: 25, shopUnlockLevel: 24, shopRank: 4, passiveBonus: { type: "global", percentPerOwned: 8 }
        },
        ancientOracle: {
            name: "Ancient Oracle", description: "Reads the memories preserved in the oldest mycelium.", rarity: MINER_RARITY.LEGENDARY, resource: "science",
            incomePerMinute: 980, maxLevel: 40, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 36000, order: 26, shopUnlockLevel: 25, shopRank: 5, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 9 }
        },
        solarMonarch: {
            name: "Solar Monarch", description: "A radiant sovereign that turns stellar heat into growth.", rarity: MINER_RARITY.LEGENDARY, resource: "wood",
            incomePerMinute: 2600, maxLevel: 35, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 48000, order: 27, shopUnlockLevel: 26, shopRank: 6, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 10 }
        },
        riftKeeper: {
            name: "Rift Keeper", description: "Guards unstable passages between fungal worlds.", rarity: MINER_RARITY.LEGENDARY, resource: "gem",
            incomePerMinute: 1250, maxLevel: 35, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 65000, order: 28, shopUnlockLevel: 27, shopRank: 7, passiveBonus: { type: "global", percentPerOwned: 11 }
        },
        voidOracle: {
            name: "Void Oracle", description: "A mythical organism that hears spores drifting between stars.", rarity: MINER_RARITY.MYTHIC, resource: "science",
            incomePerMinute: 1600, maxLevel: 30, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 90000, order: 29, shopUnlockLevel: 28, shopRank: 1, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 8 }
        },
        cosmicSovereign: {
            name: "Cosmic Sovereign", description: "Commands stellar mycelium across multiple planets.", rarity: MINER_RARITY.MYTHIC, resource: "wood",
            incomePerMinute: 5200, maxLevel: 30, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 120000, order: 30, shopUnlockLevel: 29, shopRank: 2, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 12 }
        },
        eternityCap: {
            name: "Eternity Cap", description: "A timeless cap that grows between moments.", rarity: MINER_RARITY.MYTHIC, resource: "science",
            incomePerMinute: 2800, maxLevel: 28, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 165000, order: 31, shopUnlockLevel: 30, shopRank: 3, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 14 }
        },
        genesisRoot: {
            name: "Genesis Root", description: "A primordial root carrying the code of the first colony.", rarity: MINER_RARITY.MYTHIC, resource: "wood",
            incomePerMinute: 7800, maxLevel: 28, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 220000, order: 32, shopUnlockLevel: 31, shopRank: 4, passiveBonus: { type: "resource", resource: "wood", percentPerOwned: 15 }
        },
        astralArchitect: {
            name: "Astral Architect", description: "Builds living structures from cosmic spores.", rarity: MINER_RARITY.MYTHIC, resource: "gem",
            incomePerMinute: 4200, maxLevel: 26, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 300000, order: 33, shopUnlockLevel: 32, shopRank: 5, passiveBonus: { type: "resource", resource: "gem", percentPerOwned: 16 }
        },
        omegaBloom: {
            name: "Omega Bloom", description: "The final flower of a collapsing fungal universe.", rarity: MINER_RARITY.MYTHIC, resource: "science",
            incomePerMinute: 6200, maxLevel: 25, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 410000, order: 34, shopUnlockLevel: 33, shopRank: 6, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 18 }
        },
        worldMycelium: {
            name: "World Mycelium", description: "A planet-sized network that feeds every living miner.", rarity: MINER_RARITY.MYTHIC, resource: "wood",
            incomePerMinute: 14000, maxLevel: 25, startOwned: 0, unlockCost: 99999999,
            upgradeBaseCost: 560000, order: 35, shopUnlockLevel: 34, shopRank: 7, passiveBonus: { type: "global", percentPerOwned: 20 }
        },
        crownSpore: { bossExclusive: true, name: "Crown Spore", description: "A royal organism born from the defeated Mother Mushroom.", rarity: MINER_RARITY.EPIC, resource: "wood",
            incomePerMinute: 192, maxLevel: 65, startOwned: 0, unlockCost: 99999999, upgradeBaseCost: 9000, order: 101, passiveBonus: { type: "global", percentPerOwned: 4 } },
        prismColossus: { bossExclusive: true, name: "Prism Colossus", description: "A crystalline giant carrying the fractured heart of the Crystal Titan.", rarity: MINER_RARITY.LEGENDARY, resource: "gem",
            incomePerMinute: 288, maxLevel: 50, startOwned: 0, unlockCost: 99999999, upgradeBaseCost: 22000, order: 102, passiveBonus: { type: "resource", resource: "gem", percentPerOwned: 12 } },
        blightReaper: { bossExclusive: true, name: "Blight Reaper", description: "A purified predator that converts toxic corruption into research.", rarity: MINER_RARITY.LEGENDARY, resource: "science",
            incomePerMinute: 252, maxLevel: 50, startOwned: 0, unlockCost: 99999999, upgradeBaseCost: 35000, order: 103, passiveBonus: { type: "global", percentPerOwned: 7 } },
        hiveMonarch: { bossExclusive: true, name: "Hive Monarch", description: "The reborn sovereign of the Ancient Hive commands every connected root.", rarity: MINER_RARITY.MYTHIC, resource: "wood",
            incomePerMinute: 1080, maxLevel: 30, startOwned: 0, unlockCost: 99999999, upgradeBaseCost: 90000, order: 104, passiveBonus: { type: "global", percentPerOwned: 12 } },
        astralMycelium: { bossExclusive: true, name: "Astral Mycelium", description: "A cosmic organism woven from the remains of the Void Devourer.", rarity: MINER_RARITY.MYTHIC, resource: "science",
            incomePerMinute: 840, maxLevel: 25, startOwned: 0, unlockCost: 99999999, upgradeBaseCost: 180000, order: 105, passiveBonus: { type: "resource", resource: "science", percentPerOwned: 20 } },
        titanHerald: { bossExclusive: true, name: "Titan Herald", description: "A mythic emissary cultivated from the spores released by the defeated Mushroom Titan.", rarity: MINER_RARITY.MYTHIC, resource: "wood",
            incomePerMinute: 18000, maxLevel: 25, startOwned: 0, unlockCost: 99999999, upgradeBaseCost: 650000, order: 106, passiveBonus: { type: "global", percentPerOwned: 24 } }
    };
}());
