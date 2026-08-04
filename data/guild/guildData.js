Game.guildData = (function () {
    "use strict";
    return {
        maxLevel: 50,
        xpBase: 500,
        emblems: ["🍄", "🌿", "💎", "🧬", "👑", "🌌"],
        researchOrder: ["collectiveMining", "fieldMedicine", "titanHunters", "expeditionNetwork", "tradeRoutes"],
        researches: {
            collectiveMining: { name:"Collective Mining", description:"Strengthens all miner production.", maxLevel:10, baseCost:120, effectPerLevel:2, effect:"production" },
            fieldMedicine: { name:"Field Medicine", description:"Reduces Medical Chamber treatment costs.", maxLevel:10, baseCost:140, effectPerLevel:3, effect:"healing" },
            titanHunters: { name:"Titan Hunters", description:"Increases damage dealt to the World Boss.", maxLevel:10, baseCost:160, effectPerLevel:4, effect:"worldBoss" },
            expeditionNetwork: { name:"Expedition Network", description:"Shortens expedition duration.", maxLevel:10, baseCost:150, effectPerLevel:2.5, effect:"expedition" },
            tradeRoutes: { name:"Trade Routes", description:"Reduces the fee on player marketplace listings.", maxLevel:10, baseCost:180, effectPerLevel:1, effect:"marketFee" }
        },
        shop: [
            { id:"medicalKit", name:"Medical Kit", description:"Restores 25% HP to every owned miner.", price:80, type:"medical" },
            { id:"dnaCache", name:"DNA Cache", description:"Adds 75 DNA to the Laboratory.", price:120, type:"dna", amount:75 },
            { id:"coinCrate", name:"MycoCoin Crate", description:"Adds 1,500 MycoCoins.", price:150, type:"coins", amount:1500 },
            { id:"guildSpore", name:"Guild Spore", description:"Exclusive Rare miner awarded by the guild.", price:600, type:"miner", minerId:"guildSpore" },
            { id:"bannerRelic", name:"Banner Relic", description:"Exclusive guild artifact for the Charm slot.", price:900, type:"artifact", artifactId:"guildBannerRelic" }
        ],
        quests: [
            { id:"donateSpores", name:"Feed the Network", description:"Donate 25,000 Spores.", stat:"sporesDonated", target:25000, guildXp:180, contribution:80, commanderXp:60 },
            { id:"donateScience", name:"Shared Knowledge", description:"Donate 5,000 Science.", stat:"scienceDonated", target:5000, guildXp:220, contribution:100, commanderXp:75 },
            { id:"donateCoins", name:"Fund the Colony", description:"Donate 1,000 MycoCoins.", stat:"coinsDonated", target:1000, guildXp:250, contribution:120, commanderXp:90 },
            { id:"raidTitan", name:"Titan Strike Team", description:"Attack the World Boss 3 times.", accountStat:"worldBossAttacks", target:3, guildXp:300, contribution:140, commanderXp:100 },
            { id:"expeditionCrew", name:"Expedition Crew", description:"Complete 3 expeditions.", accountStat:"expeditionsCompleted", target:3, guildXp:260, contribution:120, commanderXp:90 }
        ]
    };
}());
