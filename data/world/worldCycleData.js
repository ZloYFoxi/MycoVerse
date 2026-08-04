Game.worldCycleData = (function () {
    "use strict";

    return {
        cycleDurationMs: 6 * 60 * 60 * 1000,
        epochMs: Date.UTC(2026, 0, 1, 0, 0, 0),
        order: ["bloomtide", "prismRain", "oracleNight", "deepRoot"],
        seasons: {
            bloomtide: {
                name: "Bloomtide",
                icon: "🌸",
                color: "#71e38b",
                description: "Warm currents awaken the colony. Spores multiply and every living structure hums with new growth.",
                bonuses: {
                    globalPercent: 5,
                    resources: { wood: 35 }
                }
            },
            prismRain: {
                name: "Prism Rain",
                icon: "💎",
                color: "#6bd8ff",
                description: "Crystal rain falls across the active world, enriching gem growth and exposing buried relics.",
                bonuses: {
                    resources: { gem: 40 },
                    artifactChancePercent: 10
                }
            },
            oracleNight: {
                name: "Oracle Night",
                icon: "🔮",
                color: "#ba87ff",
                description: "The mycelial mind becomes lucid beneath a silent sky. Science and Insight flow faster.",
                bonuses: {
                    resources: { science: 40 },
                    insightPercent: 30
                }
            },
            deepRoot: {
                name: "Deep Root",
                icon: "🌑",
                color: "#d1a36f",
                description: "Ancient roots rise from the planetary core, strengthening every miner and enriching laboratory fusion.",
                bonuses: {
                    globalPercent: 25,
                    dnaPercent: 50
                }
            }
        },
        focuses: {
            growth: {
                name: "Growth Ritual",
                icon: "🌱",
                description: "Concentrate the colony on raw biological expansion until the current season ends.",
                cost: 2500,
                bonus: { globalPercent: 15 }
            },
            discovery: {
                name: "Discovery Ritual",
                icon: "🧭",
                description: "Guide expedition teams toward hidden chambers and ancient relics.",
                cost: 4500,
                bonus: { artifactChancePercent: 15, expeditionSpeedPercent: 15 }
            },
            wisdom: {
                name: "Wisdom Ritual",
                icon: "🧠",
                description: "Synchronize the colony mind to accelerate Insight and scientific production.",
                cost: 6000,
                bonus: { insightPercent: 25, resources: { science: 20 } }
            }
        }
    };
}());