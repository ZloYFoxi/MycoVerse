Game.structures = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        levels: {}
    };

    function number(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    function resourceId(id) {
        if (id === "spores") return RESOURCE.Wood;
        return id;
    }

    function resourceName(id) {
        if (id === "spores") return "Spores";
        if (id === "dna") return "DNA";
        if (id === "insight") return "Insight";
        var actual = resourceId(id);
        return Game.resourceData && Game.resourceData[actual] ? Game.resourceData[actual].name : id;
    }

    instance.initialise = function () {
        this.levels = {};
        for (var id in Game.structureData.entries) {
            if (Game.structureData.entries.hasOwnProperty(id)) this.levels[id] = 0;
        }
    };

    instance.save = function (data) {
        data.structures = {
            version: this.dataVersion,
            levels: this.levels
        };
    };

    instance.load = function (data) {
        if (!data || !data.structures || !data.structures.levels) return;
        var loaded = data.structures.levels;
        for (var id in this.levels) {
            if (!this.levels.hasOwnProperty(id) || !Game.structureData.entries[id]) continue;
            this.levels[id] = Math.max(0, Math.min(
                Game.structureData.entries[id].maxLevel,
                Math.floor(number(loaded[id], 0))
            ));
        }
    };

    instance.getLevel = function (id) {
        return Math.max(0, Math.floor(number(this.levels[id], 0)));
    };

    instance.getTotalLevels = function () {
        var total = 0;
        for (var id in this.levels) if (this.levels.hasOwnProperty(id)) total += this.getLevel(id);
        return total;
    };

    instance.getBuiltCount = function () {
        var total = 0;
        for (var id in this.levels) if (this.levels.hasOwnProperty(id) && this.getLevel(id) > 0) total++;
        return total;
    };

    instance.getCost = function (id) {
        var definition = Game.structureData.entries[id];
        if (!definition) return {};
        var level = this.getLevel(id);
        var multiplier = Math.pow(definition.costGrowth, level);
        var result = {};
        for (var currency in definition.baseCost) {
            if (definition.baseCost.hasOwnProperty(currency)) {
                result[currency] = Math.ceil(definition.baseCost[currency] * multiplier);
            }
        }
        return result;
    };

    instance.getRequirementState = function (id) {
        var definition = Game.structureData.entries[id];
        var requirements = definition ? (definition.requirements || {}) : {};
        var summary = Game.miners && Game.miners.getColonySummary ? Game.miners.getColonySummary() : { power: 0 };
        var planets = Game.planets && Game.planets.getLeagueProgress ? Game.planets.getLeagueProgress().unlocked : 0;
        var laboratory = Game.laboratory && Game.laboratory.getLevel ? Game.laboratory.getLevel() : 1;
        var research = Game.research && Game.research.getPurchasedCount ? Game.research.getPurchasedCount() : 0;
        var ascensions = Game.ascension ? Math.max(0, number(Game.ascension.ascensions, 0)) : 0;
        var state = {
            colonyPower: { current: summary.power || 0, required: requirements.colonyPower || 0 },
            planets: { current: planets, required: requirements.planets || 0 },
            laboratory: { current: laboratory, required: requirements.laboratory || 0 },
            research: { current: research, required: requirements.research || 0 },
            ascensions: { current: ascensions, required: requirements.ascensions || 0 }
        };
        state.met = true;
        for (var key in state) {
            if (key !== "met" && state[key].current < state[key].required) state.met = false;
        }
        return state;
    };

    instance.getRequirementText = function (id) {
        var state = this.getRequirementState(id);
        var labels = {
            colonyPower: "Colony Power",
            planets: "Planets",
            laboratory: "Laboratory",
            research: "Research",
            ascensions: "Ascensions"
        };
        var parts = [];
        for (var key in labels) {
            if (state[key].required > 0) {
                parts.push(labels[key] + " " + Math.floor(state[key].current) + "/" + state[key].required);
            }
        }
        return parts.length ? parts.join(" · ") : "Available from the beginning";
    };

    instance.getCurrency = function (id) {
        if (id === "dna") return Game.laboratory ? Game.laboratory.dna : 0;
        if (id === "insight") return Game.research ? Game.research.insight : 0;
        return Game.resources.getResource(resourceId(id));
    };

    instance.spendCurrency = function (id, amount) {
        if (id === "dna") {
            Game.laboratory.dna = Math.max(0, Game.laboratory.dna - amount);
            return;
        }
        if (id === "insight") {
            Game.research.insight = Math.max(0, Game.research.insight - amount);
            return;
        }
        Game.resources.addResource(resourceId(id), -amount);
    };

    instance.canUpgrade = function (id) {
        var definition = Game.structureData.entries[id];
        if (!definition || this.getLevel(id) >= definition.maxLevel || !this.getRequirementState(id).met) return false;
        var cost = this.getCost(id);
        for (var currency in cost) {
            if (cost.hasOwnProperty(currency) && this.getCurrency(currency) < cost[currency]) return false;
        }
        return true;
    };

    instance.upgrade = function (id) {
        var definition = Game.structureData.entries[id];
        if (!definition) return false;
        if (this.getLevel(id) >= definition.maxLevel) return false;
        if (!this.getRequirementState(id).met) {
            Game.notifyInfo("Structure locked", this.getRequirementText(id));
            return false;
        }
        var cost = this.getCost(id);
        for (var currency in cost) {
            if (cost.hasOwnProperty(currency) && this.getCurrency(currency) < cost[currency]) {
                Game.notifyInfo("Not enough resources", definition.name + " needs " + cost[currency] + " " + resourceName(currency) + ".");
                return false;
            }
        }
        for (var key in cost) if (cost.hasOwnProperty(key)) this.spendCurrency(key, cost[key]);
        this.levels[id] = this.getLevel(id) + 1;
        if (Game.planets) Game.planets.addProgress(1.5, "Living structure");
        Game.notifySuccess("Structure grown", definition.name + " reached level " + this.levels[id] + ".");
        return true;
    };

    instance.getProductionMultiplier = function (resource) {
        var percent = 0;
        for (var id in this.levels) {
            if (!this.levels.hasOwnProperty(id)) continue;
            var definition = Game.structureData.entries[id];
            if (!definition || !definition.bonus) continue;
            var level = this.getLevel(id);
            if (definition.bonus.type === "global") percent += definition.bonus.percentPerLevel * level;
            if (definition.bonus.type === "resource" && definition.bonus.resource === resource) {
                percent += definition.bonus.percentPerLevel * level;
            }
        }
        return 1 + percent / 100;
    };

    instance.getInsightMultiplier = function () {
        var percent = 0;
        for (var id in this.levels) {
            if (!this.levels.hasOwnProperty(id)) continue;
            var definition = Game.structureData.entries[id];
            if (definition && definition.bonus && definition.bonus.type === "insight") {
                percent += definition.bonus.percentPerLevel * this.getLevel(id);
            }
        }
        return 1 + percent / 100;
    };

    instance.getBonusText = function (id) {
        var definition = Game.structureData.entries[id];
        if (!definition || !definition.bonus) return "No bonus";
        var bonus = definition.bonus;
        var name = bonus.resource && Game.resourceData[bonus.resource] ? Game.resourceData[bonus.resource].name : bonus.resource;
        if (bonus.type === "global") return "+" + bonus.percentPerLevel + "% all miner production per level";
        if (bonus.type === "insight") return "+" + bonus.percentPerLevel + "% Insight generation per level";
        return "+" + bonus.percentPerLevel + "% " + name + " production per level";
    };

    instance.getCostText = function (id) {
        var cost = this.getCost(id);
        var parts = [];
        for (var currency in cost) if (cost.hasOwnProperty(currency)) parts.push(cost[currency] + " " + resourceName(currency));
        return parts.join(" · ");
    };

    return instance;
}());
