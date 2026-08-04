Game.miners = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        entries: {}
    };

    instance.initialise = function () {
        this.entries = {};
        for (var id in Game.minerData) {
            if (!Game.minerData.hasOwnProperty(id)) continue;
            var definition = Game.minerData[id];
            this.entries[id] = {
                id: id,
                definition: definition,
                owned: definition.startOwned || 0,
                level: definition.startOwned ? 1 : 0,
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
            this.entries[id].owned = Math.max(0, Number(saved.owned) || 0);
            this.entries[id].level = Math.max(0, Number(saved.level) || 0);
            this.entries[id].experience = Math.max(0, Number(saved.experience) || 0);
        }
    };

    instance.getEntry = function (id) {
        return this.entries[id];
    };

    instance.getUpgradeCost = function (id) {
        var miner = this.entries[id];
        if (!miner) return Infinity;
        var level = Math.max(1, miner.level);
        return Math.floor(miner.definition.upgradeBaseCost * Math.pow(1.18, level - 1));
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
            if (miner.definition.resource === resourceId) {
                total += this.getMinerIncome(id);
            }
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

    instance.upgrade = function (id) {
        var miner = this.entries[id];
        if (!miner || miner.owned <= 0) return false;
        if (miner.level >= miner.definition.maxLevel) return false;

        var cost = this.getUpgradeCost(id);
        if (Game.resources.getResource("wood") < cost) {
            Game.notifyInfo("Not enough Spores", "You need " + cost + " Spores to evolve this miner.");
            return false;
        }

        Game.resources.takeResource("wood", cost);
        miner.level += 1;
        return true;
    };

    instance.unlock = function (id, amount) {
        var miner = this.entries[id];
        if (!miner) return false;
        miner.owned += Math.max(1, amount || 1);
        if (miner.level <= 0) miner.level = 1;
        return true;
    };

    return instance;
}());
