Game.researchData = (function () {
    "use strict";

    return {
        dataVersion: 1,
        specializations: {
            bloom: {
                id: "bloom",
                name: "Bloom Cultivators",
                description: "Dedicate the network to rapid spore growth.",
                resource: "wood",
                percent: 35,
                color: "#78d66d"
            },
            prism: {
                id: "prism",
                name: "Prism Weavers",
                description: "Tune the colony to crystalline resonance.",
                resource: "gem",
                percent: 35,
                color: "#65c7ff"
            },
            oracle: {
                id: "oracle",
                name: "Oracle Mycelium",
                description: "Link every mind into a scientific chorus.",
                resource: "science",
                percent: 35,
                color: "#c98cff"
            }
        },
        order: [
            "livingNetwork",
            "sporeSymbiosis",
            "crystalResonance",
            "neuralLattice",
            "adaptiveGenome",
            "deepRootMemory",
            "perfectColony"
        ],
        nodes: {
            livingNetwork: {
                id: "livingNetwork",
                name: "Living Network",
                description: "Connect the first research chambers through one conscious mycelium.",
                cost: 40,
                requires: [],
                bonus: { type: "global", percent: 5 }
            },
            sporeSymbiosis: {
                id: "sporeSymbiosis",
                name: "Spore Symbiosis",
                description: "Synchronise the colony's gatherers and nursery caps.",
                cost: 90,
                requires: ["livingNetwork"],
                bonus: { type: "resource", resource: "wood", percent: 18 }
            },
            crystalResonance: {
                id: "crystalResonance",
                name: "Crystal Resonance",
                description: "Grow conductive hyphae around mineral veins.",
                cost: 120,
                requires: ["livingNetwork"],
                bonus: { type: "resource", resource: "gem", percent: 18 }
            },
            neuralLattice: {
                id: "neuralLattice",
                name: "Neural Lattice",
                description: "Allow distant organisms to exchange discoveries instantly.",
                cost: 150,
                requires: ["livingNetwork"],
                bonus: { type: "resource", resource: "science", percent: 18 }
            },
            adaptiveGenome: {
                id: "adaptiveGenome",
                name: "Adaptive Genome",
                description: "Preserve useful mutations across every generation.",
                cost: 260,
                requiresAny: ["sporeSymbiosis", "crystalResonance", "neuralLattice"],
                bonus: { type: "global", percent: 10 }
            },
            deepRootMemory: {
                id: "deepRootMemory",
                name: "Deep-Root Memory",
                description: "Store centuries of colony experience below the surface.",
                cost: 480,
                requires: ["adaptiveGenome"],
                bonus: { type: "insight", percent: 30 }
            },
            perfectColony: {
                id: "perfectColony",
                name: "Perfect Colony",
                description: "Every organism acts as one part of a greater living machine.",
                cost: 900,
                requires: ["deepRootMemory"],
                bonus: { type: "global", percent: 20 }
            }
        }
    };
})();