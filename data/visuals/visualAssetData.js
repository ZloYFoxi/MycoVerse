Game.visualAssetData = (function () {
    "use strict";

    var screenBackgrounds = {
        accountPage: "account", inventoryPage: "inventory", minerShopPage: "minerShop", minersPage: "miners",
        questsPage: "quests", campaignPage: "campaign", collectionsPage: "collections", colonyPage: "colony",
        economyPage: "economy", laboratoryPage: "laboratory", marketPage: "market", structuresPage: "structures",
        planetsPage: "planets", artifactsPage: "artifacts", guildPage: "guild", researchPage: "research",
        unionsPage: "unions", worldBossPage: "worldBoss", worldCyclePage: "worldCycle", ascensionPage: "ascension",
        uiTab: "settings", adminPage: "admin", goldenMushroomPage: "goldenMushroom"
    };

    return {
        version: 1,
        paths: {
            screenBackground: "assets/ui/backgrounds/{id}.svg",
            minerPortrait: "assets/miners/portraits/{id}.svg",
            planetBackground: "assets/themes/{id}.svg",
            bossPortrait: "assets/bosses/{id}.svg"
        },
        screenBackgrounds: screenBackgrounds,
        bossFiles: {
            motherMushroom: "mother-mushroom",
            crystalTitan: "crystal-titan",
            blightSovereign: "blight-sovereign",
            ancientOvermind: "ancient-overmind",
            voidDevourer: "void-devourer"
        },
        rarityFrames: {
            common: { className: "visual-rarity-common", label: "Common" },
            rare: { className: "visual-rarity-rare", label: "Rare" },
            epic: { className: "visual-rarity-epic", label: "Epic" },
            legendary: { className: "visual-rarity-legendary", label: "Legendary" },
            mythic: { className: "visual-rarity-mythic", label: "Mythic" }
        }
    };
}());
