Game.miners = (function () {
    "use strict";

    var instance = {
        dataVersion: 2,
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
                experience: 0
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
                experience: miner.experience
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
            if (this.entries[id].owned > 0 && this.entries[id].level < 1) {
                this.entries[id].level = 1;
            }
        }
    };

    instance.getEntry = function (id) {
        return this.entries[id] || null;
    };

    instance.getEntriesSorted = function () {
        var result = [];
        for (var id in this.entries) {
            if (this.entries.hasOwnProperty(id)) result.push(this.entries[id]);
        }
        result.sort(function (a, b) {
            return (a.definition.order || 999) - (b.definition.order || 999);
        });
        return result;
    };

    instance.getUpgradeCost = function (id) {
        var miner = this.entries[id];
        if (!miner) return Infinity;
        var level = Math.max(1, miner.level);
        return Math.floor(miner.definition.upgradeBaseCost * Math.pow(1.18, level - 1));
    };

    instance.getUnlockCost = function (id) {
        var miner = this.entries[id];
        return miner ? Math.max(0, normaliseNumber(miner.definition.unlockCost, 0)) : Infinity;
    };

    instance.getMinerIncome = function (id) {
        var miner = this.entries[id];
        if (!miner || miner.owned <= 0 || miner.level <= 0) return 0;
        return miner.definition.baseIncome * miner.definition.rarity.incomeMultiplier * miner.level * miner.owned;
    };

    instance.getResourceIncome = function (resourceId) {
        var total = 0;
        for (var id in this.entries) {
            if (!this.entries.hasOwnProperty(id)) continue;
            var miner = this.entries[id];
            if (miner.definition.resource === resourceId) total += this.getMinerIncome(id);
        }
        return total;
    };

    instance.getTotalIncome = function () {
        var result = {};
        for (var id in this.entries) {
            if (!this.entries.hasOwnProperty(id)) continue;
            var miner = this.entries[id];
            var resource = miner.definition.resource;
            result[resource] = (result[resource] || 0) + this.getMinerIncome(id);
        }
        return result;
    };

    instance.getCollectionProgress = function () {
        var owned = 0;
        var total = 0;
        for (var id in this.entries) {
            if (!this.entries.hasOwnProperty(id)) continue;
            total += 1;
            if (this.entries[id].owned > 0) owned += 1;
        }
        return { owned: owned, total: total };
    };

    instance.discover = function (id) {
        var miner = this.entries[id];
        if (!miner || miner.owned > 0) return false;
        var cost = this.getUnlockCost(id);
        if (Game.resources.getResource(RESOURCE.Wood) < cost) {
            Game.notifyInfo("Not enough Spores", "You need " + cost + " Spores to awaken this miner.");
            return false;
        }
        Game.resources.takeResource(RESOURCE.Wood, cost);
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
        miner.level += 1;
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
