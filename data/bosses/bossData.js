Game.bossData = (function () {
    "use strict";

    return {
        dataVersion: 1,
        teamSize: 5,
        order: ["motherMushroom", "crystalTitan", "blightSovereign", "ancientOvermind", "voidDevourer"],
        planetBosses: {
            mycoPrime: "motherMushroom",
            crystalGrove: "crystalTitan",
            toxicForest: "blightSovereign",
            ancientHive: "ancientOvermind",
            voidBloom: "voidDevourer"
        },
        entries: {
            motherMushroom: {
                id: "motherMushroom", planetId: "mycoPrime", name: "Mother Mushroom", icon: "🍄",
                description: "The colossal first organism of Myco Prime guards the path beyond the birthplace.",
                maxHealth: 750, durationSeconds: 300, defense: 0.05,
                phases: [{ at: 0.65, name: "Protective Spores", damageMultiplier: 0.82 }, { at: 0.30, name: "Rooted Fury", damageMultiplier: 0.68 }],
                reward: { mycoCoins: 600, bloomTokens: 3, minerId: "crownSpore", artifactId: "motherCore", title: "Prime Conqueror", nextPlanetId: "crystalGrove" }
            },
            crystalTitan: {
                id: "crystalTitan", planetId: "crystalGrove", name: "Crystal Titan", icon: "💎",
                description: "A walking geode whose crystalline shell refracts every fungal attack.",
                maxHealth: 6500, durationSeconds: 480, defense: 0.12,
                phases: [{ at: 0.70, name: "Prismatic Armor", damageMultiplier: 0.76 }, { at: 0.32, name: "Diamond Resonance", damageMultiplier: 0.58 }],
                reward: { mycoCoins: 1800, bloomTokens: 5, minerId: "prismColossus", artifactId: "titanShard", title: "Crystal Breaker", nextPlanetId: "toxicForest" }
            },
            blightSovereign: {
                id: "blightSovereign", planetId: "toxicForest", name: "Blight Sovereign", icon: "☣️",
                description: "A poisonous monarch that feeds on failed mutations and corrupted mycelium.",
                maxHealth: 42000, durationSeconds: 600, defense: 0.18,
                phases: [{ at: 0.68, name: "Toxic Veil", damageMultiplier: 0.72 }, { at: 0.28, name: "Plague Bloom", damageMultiplier: 0.50 }],
                reward: { mycoCoins: 5000, bloomTokens: 8, minerId: "blightReaper", artifactId: "sovereignGland", title: "Blight Purifier", nextPlanetId: "ancientHive" }
            },
            ancientOvermind: {
                id: "ancientOvermind", planetId: "ancientHive", name: "Ancient Overmind", icon: "👁️",
                description: "The combined consciousness of an extinct civilization awakens to test the new colony.",
                maxHealth: 260000, durationSeconds: 900, defense: 0.24,
                phases: [{ at: 0.72, name: "Memory Barrier", damageMultiplier: 0.66 }, { at: 0.34, name: "Hive Dominion", damageMultiplier: 0.44 }],
                reward: { mycoCoins: 14000, bloomTokens: 12, minerId: "hiveMonarch", artifactId: "overmindCrown", title: "Hive Liberator", nextPlanetId: "voidBloom" }
            },
            voidDevourer: {
                id: "voidDevourer", planetId: "voidBloom", name: "Void Devourer", icon: "🌌",
                description: "An impossible organism that consumes light, time, and entire mycelial networks.",
                maxHealth: 1800000, durationSeconds: 1200, defense: 0.30,
                phases: [{ at: 0.75, name: "Event Horizon", damageMultiplier: 0.60 }, { at: 0.40, name: "Temporal Collapse", damageMultiplier: 0.38 }, { at: 0.15, name: "Final Singularity", damageMultiplier: 0.25 }],
                reward: { mycoCoins: 40000, bloomTokens: 20, minerId: "astralMycelium", artifactId: "voidHeart", title: "Sovereign of the Void", nextPlanetId: null }
            }
        }
    };
}());
