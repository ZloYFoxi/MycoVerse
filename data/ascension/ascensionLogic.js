Game.ascension = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        legacy: 0,
        totalLegacyEarned: 0,
        ascensions: 0,
        upgrades: {},
        lastGain: 0
    };

    function number(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    instance.initialise = function () {
        this.legacy = 0;
        this.totalLegacyEarned = 0;
        this.ascensions = 0;
        this.upgrades = {};
        this.lastGain = 0;
    };

    instance.save = function (data) {
        data.ascension = {
            version: this.dataVersion,
            legacy: this.legacy,
            totalLegacyEarned: this.totalLegacyEarned,
            ascensions: this.ascensions,
            upgrades: this.upgrades,
            lastGain: this.lastGain
        };
    };

    instance.load = function (data) {
        if (!data || !data.ascension) return;
        var saved = data.ascension;
        this.legacy = Math.max(0, number(saved.legacy, 0));
        this.totalLegacyEarned = Math.max(this.legacy, number(saved.totalLegacyEarned, this.legacy));
        this.ascensions = Math.max(0, Math.floor(number(saved.ascensions, 0)));
        this.lastGain = Math.max(0, Math.floor(number(saved.lastGain, 0)));
        this.upgrades = {};
        var loaded = saved.upgrades || {};
        for (var id in loaded) {
            if (!loaded.hasOwnProperty(id) || !Game.ascensionData.upgrades[id]) continue;
            this.upgrades[id] = Math.max(0, Math.min(
                Game.ascensionData.upgrades[id].maxLevel,
                Math.floor(number(loaded[id], 0))
            ));
        }
    };

    instance.getColonyPower = function () {
        return Game.miners && Game.miners.getColonySummary ?
            Math.max(0, number(Game.miners.getColonySummary().power, 0)) : 0;
    };

    instance.getPlanetsUnlocked = function () {
        return Game.planets && Game.planets.getLeagueProgress ?
            Math.max(0, number(Game.planets.getLeagueProgress().unlocked, 0)) : 0;
    };

    instance.getResearchCompleted = function () {
        return Game.research && Game.research.getPurchasedCount ?
            Math.max(0, number(Game.research.getPurchasedCount(), 0)) : 0;
    };

    instance.getRequirements = function () {
        var required = Game.ascensionData.requirements;
        var power = this.getColonyPower();
        var planets = this.getPlanetsUnlocked();
        var research = this.getResearchCompleted();
        return {
            colonyPower: { current: power, required: required.colonyPower, met: power >= required.colonyPower },
            planetsUnlocked: { current: planets, required: required.planetsUnlocked, met: planets >= required.planetsUnlocked },
            researchCompleted: { current: research, required: required.researchCompleted, met: research >= required.researchCompleted }
        };
    };

    instance.canAscend = function () {
        var req = this.getRequirements();
        return req.colonyPower.met && req.planetsUnlocked.met && req.researchCompleted.met && this.getPendingLegacy() > 0;
    };

    instance.getPendingLegacy = function () {
        var power = this.getColonyPower();
        var planets = this.getPlanetsUnlocked();
        var research = this.getResearchCompleted();
        var laboratory = Game.laboratory && Game.laboratory.getLevel ? Game.laboratory.getLevel() : 1;
        if (power < Game.ascensionData.requirements.colonyPower) return 0;
        return Math.max(1, Math.floor(
            Math.sqrt(power / 125) +
            Math.max(0, planets - 1) * 1.5 +
            research * 0.55 +
            Math.max(0, laboratory - 1) * 0.35
        ));
    };

    instance.getUpgradeLevel = function (id) {
        return Math.max(0, Math.floor(number(this.upgrades[id], 0)));
    };

    instance.getUpgradeCost = function (id) {
        var upgrade = Game.ascensionData.upgrades[id];
        if (!upgrade) return Infinity;
        var level = this.getUpgradeLevel(id);
        if (level >= upgrade.maxLevel) return Infinity;
        return Math.floor(upgrade.baseCost + level * upgrade.costGrowth);
    };

    instance.purchaseUpgrade = function (id) {
        var upgrade = Game.ascensionData.upgrades[id];
        if (!upgrade) return false;
        var level = this.getUpgradeLevel(id);
        if (level >= upgrade.maxLevel) return false;
        var cost = this.getUpgradeCost(id);
        if (this.legacy < cost) {
            Game.notifyInfo("Not enough Legacy", "This ancestral adaptation costs " + cost + " Legacy.");
            return false;
        }
        this.legacy -= cost;
        this.upgrades[id] = level + 1;
        Game.notifySuccess("Legacy awakened", upgrade.name + " reached level " + this.upgrades[id] + ".");
        return true;
    };

    instance.getProductionMultiplier = function (resourceId) {
        var percent = 0;
        for (var id in this.upgrades) {
            if (!this.upgrades.hasOwnProperty(id)) continue;
            var upgrade = Game.ascensionData.upgrades[id];
            if (!upgrade || !upgrade.bonus) continue;
            var level = this.getUpgradeLevel(id);
            if (upgrade.bonus.type === "global") percent += upgrade.bonus.percentPerLevel * level;
            if (upgrade.bonus.type === "resource" && upgrade.bonus.resource === resourceId) {
                percent += upgrade.bonus.percentPerLevel * level;
            }
        }
        return 1 + percent / 100;
    };

    instance.getInsightMultiplier = function () {
        var upgrade = Game.ascensionData.upgrades.swiftInsight;
        var level = this.getUpgradeLevel("swiftInsight");
        return 1 + (upgrade.bonus.percentPerLevel * level) / 100;
    };

    instance.resetMycoVerseCycle = function () {
        if (Game.miners) Game.miners.initialise();
        if (Game.laboratory) Game.laboratory.initialise();
        if (Game.planets) Game.planets.initialise();
        if (Game.goldenEvents) Game.goldenEvents.initialise();
        if (Game.quests) Game.quests.initialise();
        if (Game.artifacts) Game.artifacts.initialise();
        if (Game.research) Game.research.initialise();
        if (Game.structures) Game.structures.initialise();
        if (Game.worldCycle && Game.worldCycle.resetForAscension) Game.worldCycle.resetForAscension();
        if (Game.bosses) { Game.bosses.defeated = {}; Game.bosses.resetForAscension(); }
        if (Game.unions && Game.unions.resetForAscension) Game.unions.resetForAscension();

        // Reset the three primary MycoVerse currencies while leaving the legacy Space Company engine intact.
        if (typeof window.wood !== "undefined") window.wood = 0;
        if (typeof window.gem !== "undefined") window.gem = 0;
        if (typeof window.science !== "undefined") window.science = 0;
    };

    instance.ascend = function () {
        if (!this.canAscend()) {
            Game.notifyInfo("Ascension unavailable", "Grow Colony Power, unlock planets, and complete more research first.");
            return false;
        }
        var gain = this.getPendingLegacy();
        var confirmation = prompt(
            "Mycelial Ascension will reset miners, laboratory, planets, events, quests, artifacts, research, Spores, Gems, and Science. " +
            "You will gain " + gain + " Legacy. Type ASCEND to continue."
        );
        if (confirmation !== "ASCEND") return false;

        this.legacy += gain;
        this.totalLegacyEarned += gain;
        this.ascensions += 1;
        this.lastGain = gain;
        this.resetMycoVerseCycle();
        Game.save();
        Game.notifySuccess("Mycelial Ascension complete", gain + " Legacy survived the rebirth of the colony.");
        return true;
    };

    return instance;
}());
