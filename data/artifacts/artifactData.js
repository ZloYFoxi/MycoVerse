Game.artifactData = (function () {
    "use strict";

    return {
        rarities: {
            common: { name: "Common", color: "#aeb8b2", multiplier: 1 },
            rare: { name: "Rare", color: "#58a9ff", multiplier: 1.6 },
            epic: { name: "Epic", color: "#b16cff", multiplier: 2.5 },
            legendary: { name: "Legendary", color: "#ffbf47", multiplier: 4 },
            mythic: { name: "Mythic", color: "#ff5e7a", multiplier: 7 }
        },
        slots: ["core", "crown", "charm"],
        order: [
            "sporeHeart", "crystalLens", "toxicAmpoule", "ancientCrown", "voidSeed",
            "mycelialCompass", "goldenCap", "memorySpindle", "nebulaCharm", "primeRelic"
        ],
        entries: {
            sporeHeart: { name: "Spore Heart", slot: "core", rarity: "common", planetId: "mycoPrime", description: "A warm living node that strengthens basic fungal production.", bonus: { type: "resource", resource: "wood", percent: 8 } },
            mycelialCompass: { name: "Mycelial Compass", slot: "charm", rarity: "rare", planetId: "mycoPrime", description: "Its threads point toward fertile routes between colonies.", bonus: { type: "global", percent: 6 } },
            crystalLens: { name: "Crystal Lens", slot: "charm", rarity: "rare", planetId: "crystalGrove", description: "Focuses bioluminescent energy into gem-rich seams.", bonus: { type: "resource", resource: "gem", percent: 16 } },
            goldenCap: { name: "Golden Cap", slot: "crown", rarity: "epic", planetId: "crystalGrove", description: "A radiant cap that amplifies the entire colony.", bonus: { type: "global", percent: 12 } },
            toxicAmpoule: { name: "Toxic Ampoule", slot: "core", rarity: "epic", planetId: "toxicForest", description: "Contains a controlled mutation that accelerates all fungal labour.", bonus: { type: "global", percent: 18 } },
            memorySpindle: { name: "Memory Spindle", slot: "charm", rarity: "epic", planetId: "toxicForest", description: "Stores genetic memories recovered from dangerous spores.", bonus: { type: "resource", resource: "science", percent: 28 } },
            ancientCrown: { name: "Ancient Crown", slot: "crown", rarity: "legendary", planetId: "ancientHive", description: "A crown grown for the first sovereign of the Ancient Hive.", bonus: { type: "global", percent: 30 } },
            primeRelic: { name: "Prime Relic", slot: "core", rarity: "legendary", planetId: "ancientHive", description: "A relic that resonates with every living miner.", bonus: { type: "global", percent: 38 } },
            voidSeed: { name: "Void Seed", slot: "core", rarity: "mythic", planetId: "voidBloom", description: "A seed that germinated where light and time both fail.", bonus: { type: "global", percent: 60 } },
            nebulaCharm: { name: "Nebula Charm", slot: "charm", rarity: "mythic", planetId: "voidBloom", description: "Condensed cosmic mycelium that empowers scientific miners.", bonus: { type: "resource", resource: "science", percent: 90 } }
        },
        expeditionPools: {
            mycoPrime: ["sporeHeart", "mycelialCompass"],
            crystalGrove: ["crystalLens", "goldenCap"],
            toxicForest: ["toxicAmpoule", "memorySpindle"],
            ancientHive: ["ancientCrown", "primeRelic"],
            voidBloom: ["voidSeed", "nebulaCharm"]
        },
        expeditionChance: {
            mycoPrime: 0.22,
            crystalGrove: 0.28,
            toxicForest: 0.34,
            ancientHive: 0.42,
            voidBloom: 0.52
        }
    };
}());
