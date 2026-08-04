Game.collectionData = (function () {
    "use strict";

    return {
        categories: ["miners", "economy", "planets", "combat", "laboratory", "guild", "secret"],
        achievements: {
            firstMiner: { category:"miners", name:"First Awakening", description:"Own 1 miner species.", metric:"species", target:1, reward:{xp:40,mycoCoins:100} },
            growingRoster: { category:"miners", name:"Growing Roster", description:"Own 10 miner species.", metric:"species", target:10, reward:{xp:120,mycoCoins:350} },
            fungalArchive: { category:"miners", name:"Fungal Archive", description:"Own 25 miner species.", metric:"species", target:25, reward:{xp:300,bloomTokens:3,title:"Fungal Archivist"} },
            manyBodies: { category:"miners", name:"Many Bodies, One Mind", description:"Own 50 total miner specimens.", metric:"specimens", target:50, reward:{xp:180,mycoCoins:600} },
            masterEvolver: { category:"miners", name:"Master Evolver", description:"Purchase 100 miner upgrades.", metric:"upgrades", target:100, reward:{xp:260,mycoCoins:800} },

            coinPouch: { category:"economy", name:"Coin Pouch", description:"Earn 5,000 MycoCoins in total.", metric:"coinsEarned", target:5000, reward:{xp:90,mycoCoins:250} },
            tradeNetwork: { category:"economy", name:"Trade Network", description:"Earn 50,000 MycoCoins in total.", metric:"coinsEarned", target:50000, reward:{xp:260,bloomTokens:4,title:"Mycelial Merchant"} },
            dedicatedBuyer: { category:"economy", name:"Dedicated Buyer", description:"Purchase 20 miners.", metric:"minersPurchased", target:20, reward:{xp:180,mycoCoins:500} },
            marketVeteran: { category:"economy", name:"Market Veteran", description:"Complete 25 marketplace transactions.", metric:"marketTransactions", target:25, reward:{xp:220,mycoCoins:750} },

            firstPassage: { category:"planets", name:"First Passage", description:"Complete your first planet.", metric:"planetsCompleted", target:1, reward:{xp:120,mycoCoins:400} },
            stellarMycelium: { category:"planets", name:"Stellar Mycelium", description:"Complete all 5 planets.", metric:"planetsCompleted", target:5, reward:{xp:650,bloomTokens:8,title:"Stellar Mycologist"} },
            explorer: { category:"planets", name:"Deep Explorer", description:"Complete 25 expeditions.", metric:"expeditions", target:25, reward:{xp:220,mycoCoins:700} },

            gateBreaker: { category:"combat", name:"Gate Breaker", description:"Defeat 1 gate boss.", metric:"bosses", target:1, reward:{xp:150,mycoCoins:500} },
            bossHunter: { category:"combat", name:"Boss Hunter", description:"Defeat all 5 gate bosses.", metric:"bosses", target:5, reward:{xp:700,bloomTokens:10,title:"Breaker of Gates"} },
            titanRaider: { category:"combat", name:"Titan Raider", description:"Attack the World Boss 25 times.", metric:"worldBossAttacks", target:25, reward:{xp:280,worldBossTokens:15} },

            fieldMedic: { category:"laboratory", name:"Field Medic", description:"Restore 10,000 miner HP.", metric:"healthRestored", target:10000, reward:{xp:180,mycoCoins:550} },
            geneticist: { category:"laboratory", name:"Colony Geneticist", description:"Complete 20 miner fusions.", metric:"fusions", target:20, reward:{xp:250,bloomTokens:3} },
            researcher: { category:"laboratory", name:"Research Network", description:"Complete 7 Mycelium researches.", metric:"research", target:7, reward:{xp:300,mycoCoins:900} },

            guildFounder: { category:"guild", name:"Guild Founder", description:"Create a guild.", metric:"guildCreated", target:1, reward:{xp:100,mycoCoins:300} },
            generousSpore: { category:"guild", name:"Generous Spore", description:"Earn 2,500 Guild Contribution Points.", metric:"guildContribution", target:2500, reward:{xp:260,bloomTokens:4,title:"Pillar of the Guild"} },
            unionMind: { category:"guild", name:"Union Mind", description:"Raise an active Miner Union to level 10.", metric:"unionLevel", target:10, reward:{xp:260,mycoCoins:850} },

            hiddenRelic: { category:"secret", secret:true, name:"???", revealedName:"Relic Whisperer", description:"Discover 10 different artifacts.", hiddenDescription:"A secret waits among forgotten relics.", metric:"artifacts", target:10, reward:{xp:400,bloomTokens:6,title:"Relic Whisperer"} },
            survivor: { category:"secret", secret:true, name:"???", revealedName:"Last Spore Standing", description:"Win a gate battle with team health below 10%.", hiddenDescription:"Survive when the network is almost silent.", metric:"lastSporeVictory", target:1, reward:{xp:500,bloomTokens:8,title:"Last Spore Standing"} },
            ascended: { category:"secret", secret:true, name:"???", revealedName:"Beyond the Cycle", description:"Complete your first Ascension.", hiddenDescription:"Some roots grow beyond a single lifetime.", metric:"ascensions", target:1, reward:{xp:600,bloomTokens:10,title:"Beyond the Cycle"} }
        }
    };
}());
