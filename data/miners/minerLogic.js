Game.miners = (function () {
    "use strict";

    var instance = {
        dataVersion: 4,
        entries: {}
    };

    function normaliseNumber(value, fallback) {
        var number = Number(value);
        return isFinite(number) ? number : fallback;
    }

    instance.initialise = function () {
        this.entries = {};
        for (var id in Game.minerData) {
            if (!Game.minerData.hasOwnProperty(id)) continue;
            var definition = Game.minerData[id];
            var startOwned = Math.max(0, normaliseNumber(definition.startOwned, 0));
            this.entries[id] = {
                id: id,
                definition: definition,
                owned: startOwned,
                level: startOwned > 0 ? 1 : 0,
                experience: 0,
                mutations: []
            };
        }
    };

    instance.save = function (data) {
        data.miners = { version: this.dataVersion, entries: {} };
        for (var id in this.entries) {
            if (!this.entries.hasOwnProperty(id)) continue;
            var miner = this.entries[id];
            data.miners.entries[id] = {
                owned: miner.owned,
                level: miner.level,
                experience: miner.experience,
                mutations: miner.mutations || []
            };
        }
    };

    instance.load = function (data) {
        if (!data || !data.miners || !data.miners.entries) return;
        for (var id in data.miners.entries) {
            if (!data.miners.entries.hasOwnProperty(id) || !this.entries[id]) continue;
            var saved = data.miners.entries[id];
            this.entries[id].owned = Math.max(0, normaliseNumber(saved.owned, 0));
            this.entries[id].level = Math.max(0, normaliseNumber(saved.level, 0));
            this.entries[id].experience = Math.max(0, normaliseNumber(saved.experience, 0));
            this.entries[id].mutations = Array.isArray(saved.mutations) ? saved.mutations.slice(0, 3) : [];
            if (this.entries[id].owned > 0 && this.entries[id].level < 1) this.entries[id].level = 1;
        }
    };

    instance.getEntry = function (id) { return this.entries[id] || null; };

    instance.getEntriesSorted = function () {
        var result = [];
        for (var id in this.entries) if (this.entries.hasOwnProperty(id)) result.push(this.entries[id]);
        result.sort(function (a, b) { return (a.definition.order || 999) - (b.definition.order || 999); });
        return result;
    };

    instance.getUpgradeCost = function (id) {
        var miner = this.entries[id];
        if (!miner) return Infinity;
        if (Game.economy && Game.economy.getMinerUpgradeCost) return Game.economy.getMinerUpgradeCost(miner);
        return Math.floor(miner.definition.upgradeBaseCost * Math.pow(1.16, Math.max(1, miner.level) - 1));
    };

    instance.getUnlockCost = function (id) {
        var miner = this.entries[id];
        return miner ? Math.max(0, normaliseNumber(miner.definition.unlockCost, 0)) : Infinity;
    };

    instance.getPassiveBonuses = function () {
        var result = { global: 0, resources: {} };
        for (var id in this.entries) {
            if (!this.entries.hasOwnProperty(id)) continue;
            var miner = this.entries[id];
            var bonus = miner.definition.passiveBonus;
            if (!bonus || miner.owned <= 0) continue;
            var percent = Math.max(0, normaliseNumber(bonus.percentPerOwned, 0)) * miner.owned;
            if (bonus.type === "global") result.global += percent;
            if (bonus.type === "resource" && bonus.resource) {
                result.resources[bonus.resource] = (result.resources[bonus.resource] || 0) + percent;
            }
        }
        return result;
    };

    instance.getMutationPercent = function (id) {
        var miner = this.entries[id];
        if (!miner || !Array.isArray(miner.mutations)) return 0;
        var total = 0;
        for (var i = 0; i < miner.mutations.length; i++) {
            total += Math.max(0, normaliseNumber(miner.mutations[i].incomePercent, 0));
        }
        return total;
    };

    instance.getMutationText = function (id) {
        var miner = this.entries[id];
        if (!miner || !miner.mutations || !miner.mutations.length) return "No mutations";
        var result = [];
        for (var i = 0; i < miner.mutations.length; i++) {
            result.push(miner.mutations[i].name + " (+" + miner.mutations[i].incomePercent + "%)");
        }
        return result.join(" • ");
    };

    instance.getCloneCost = function (id) {
        var miner = this.entries[id];
        if (!miner || miner.owned <= 0) return Infinity;
        var base = Math.max(10, normaliseNumber(miner.definition.upgradeBaseCost, 10) * 2);
        if (Game.economy && Game.economy.getMinerCloneCost) return Game.economy.getMinerCloneCost(miner);
        return Math.floor(base * Math.pow(1.30, Math.max(0, miner.owned - 1)));
    };

    instance.clone = function (id) {
        var miner = this.entries[id];
        if (!miner || miner.owned <= 0) return false;
        var cost = this.getCloneCost(id);
        if (Game.resources.getResource(RESOURCE.Wood) < cost) {
            Game.notifyInfo("Not enough Spores", "Cloning this organism requires " + cost + " Spores.");
            return false;
        }
        Game.resources.takeResource(RESOURCE.Wood, cost);
        if (Game.economy && Game.economy.recordSporeSpend) Game.economy.recordSporeSpend('clone', cost, miner.definition.name);
        miner.owned += 1;
        Game.notifySuccess("Clone cultivated", miner.definition.name + " now has " + miner.owned + " specimens.");
        return true;
    };

    instance.canFuse = function (id) {
        var miner = this.entries[id];
        return !!miner && miner.owned >= 3 && miner.level < miner.definition.maxLevel;
    };

    instance.fuse = function (id) {
        var miner = this.entries[id];
        if (!miner || miner.owned < 3) {
            Game.notifyInfo("More specimens required", "Fusion requires 3 specimens of the same species.");
            return false;
        }
        if (miner.level >= miner.definition.maxLevel) {
            Game.notifyInfo("Maximum evolution", "This species cannot evolve any further.");
            return false;
        }
        miner.owned -= 2;
        miner.level += 1;
        miner.experience += miner.level * 25;
        return true;
    };

    instance.getBaseMinerIncome = function (id) {
        var miner = this.entries[id];
        if (!miner || miner.owned <= 0 || miner.level <= 0) return 0;
        return miner.definition.baseIncome * miner.definition.rarity.incomeMultiplier * miner.level * miner.owned;
    };

    instance.getMinerIncome = function (id) {
        var miner = this.entries[id];
        if (!miner) return 0;
        var base = this.getBaseMinerIncome(id);
        var bonuses = this.getPassiveBonuses();
        var percent = bonuses.global + (bonuses.resources[miner.definition.resource] || 0);
        var mutationPercent = this.getMutationPercent(id);
        var eventMultiplier = (Game.goldenEvents && Game.goldenEvents.getProductionMultiplier) ?
            Game.goldenEvents.getProductionMultiplier() : 1;
        var planetMultiplier = (Game.planets && Game.planets.getProductionMultiplier) ? Game.planets.getProductionMultiplier(miner.definition.resource) : 1;
        var artifactMultiplier = (Game.artifacts && Game.artifacts.getProductionMultiplier) ? Game.artifacts.getProductionMultiplier(miner.definition.resource) : 1;
        var researchMultiplier = (Game.research && Game.research.getProductionMultiplier) ? Game.research.getProductionMultiplier(miner.definition.resource) : 1;
        var ascensionMultiplier = (Game.ascension && Game.ascension.getProductionMultiplier) ? Game.ascension.getProductionMultiplier(miner.definition.resource) : 1;
        var structureMultiplier = (Game.structures && Game.structures.getProductionMultiplier) ? Game.structures.getProductionMultiplier(miner.definition.resource) : 1;
        var worldCycleMultiplier = (Game.worldCycle && Game.worldCycle.getProductionMultiplier) ? Game.worldCycle.getProductionMultiplier(miner.definition.resource) : 1;
        var unionMultiplier = (Game.unions && Game.unions.getProductionMultiplier) ? Game.unions.getProductionMultiplier(miner.definition.resource) : 1;
        return base * (1 + percent / 100) * (1 + mutationPercent / 100) * eventMultiplier * planetMultiplier * artifactMultiplier * researchMultiplier * ascensionMultiplier * structureMultiplier * worldCycleMultiplier * unionMultiplier;
    };

    instance.getResourceIncome = function (resourceId) {
        var total = 0;
        for (var id in this.entries) {
            if (!this.entries.hasOwnProperty(id)) continue;
            if (this.entries[id].definition.resource === resourceId) total += this.getMinerIncome(id);
        }
        return total;
    };

    instance.getTotalIncome = function () {
        var result = {};
        for (var id in this.entries) {
            if (!this.entries.hasOwnProperty(id)) continue;
            var resource = this.entries[id].definition.resource;
            result[resource] = (result[resource] || 0) + this.getMinerIncome(id);
        }
        return result;
    };

    instance.getCollectionProgress = function () {
        var owned = 0, total = 0;
        for (var id in this.entries) {
            if (!this.entries.hasOwnProperty(id)) continue;
            total += 1;
            if (this.entries[id].owned > 0) owned += 1;
        }
        return { owned: owned, total: total };
    };

    instance.getColonySummary = function () {
        var species = 0, specimens = 0, totalLevels = 0, power = 0;
        for (var id in this.entries) {
            if (!this.entries.hasOwnProperty(id)) continue;
            var miner = this.entries[id];
            if (miner.owned <= 0) continue;
            species += 1;
            specimens += miner.owned;
            totalLevels += miner.level * miner.owned;
            power += miner.level * miner.owned * miner.definition.rarity.incomeMultiplier;
        }
        return {
            species: species,
            specimens: specimens,
            totalLevels: totalLevels,
            power: Math.round(power * 100) / 100,
            bonuses: this.getPassiveBonuses(),
            income: this.getTotalIncome()
        };
    };

    instance.getPassiveBonusText = function (id) {
        var miner = this.entries[id];
        if (!miner || !miner.definition.passiveBonus) return "No passive bonus";
        var bonus = miner.definition.passiveBonus;
        var total = bonus.percentPerOwned * Math.max(0, miner.owned);
        if (bonus.type === "global") return "+" + total + "% to all miner production";
        var name = Game.resourceData && Game.resourceData[bonus.resource] ? Game.resourceData[bonus.resource].name : bonus.resource;
        return "+" + total + "% to " + name + " miner production";
    };

    instance.discover = function (id) {
        var miner = this.entries[id];
        if (!miner || miner.owned > 0) return false;
        if (miner.definition.bossExclusive) {
            Game.notifyInfo("Boss reward", "This organism can only be obtained by defeating its planetary guardian.");
            return false;
        }
        var cost = this.getUnlockCost(id);
        if (Game.resources.getResource(RESOURCE.Wood) < cost) {
            Game.notifyInfo("Not enough Spores", "You need " + cost + " Spores to awaken this miner.");
            return false;
        }
        Game.resources.takeResource(RESOURCE.Wood, cost);
        if (Game.economy && Game.economy.recordSporeSpend) Game.economy.recordSporeSpend('awaken', cost, miner.definition.name);
        miner.owned = 1;
        miner.level = 1;
        Game.notifySuccess("Miner awakened", miner.definition.name + " has joined your colony.");
        return true;
    };

    instance.upgrade = function (id) {
        var miner = this.entries[id];
        if (!miner || miner.owned <= 0 || miner.level >= miner.definition.maxLevel) return false;
        var cost = this.getUpgradeCost(id);
        if (Game.resources.getResource(RESOURCE.Wood) < cost) {
            Game.notifyInfo("Not enough Spores", "You need " + cost + " Spores to evolve this miner.");
            return false;
        }
        Game.resources.takeResource(RESOURCE.Wood, cost);
        if (Game.economy && Game.economy.recordSporeSpend) Game.economy.recordSporeSpend('upgrade', cost, miner.definition.name);
        miner.level += 1;
        miner.experience += cost;
        if (Game.quests && Game.quests.recordUpgrade) Game.quests.recordUpgrade();
        return true;
    };

    instance.unlock = function (id, amount) {
        var miner = this.entries[id];
        if (!miner) return false;
        miner.owned += Math.max(1, normaliseNumber(amount, 1));
        if (miner.level <= 0) miner.level = 1;
        return true;
    };

    return instance;
}());
