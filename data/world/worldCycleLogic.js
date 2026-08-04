Game.worldCycle = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        focusId: null,
        focusCycle: -1,
        ritualsActivated: 0
    };

    function number(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    function currentCycleIndex() {
        return Math.floor((Date.now() - Game.worldCycleData.epochMs) / Game.worldCycleData.cycleDurationMs);
    }

    function definitionBonus(definition, key) {
        if (!definition || !definition.bonuses) return 0;
        return number(definition.bonuses[key], 0);
    }

    function focusBonus(key) {
        var focus = instance.getActiveFocus();
        return focus && focus.bonus ? number(focus.bonus[key], 0) : 0;
    }

    instance.initialise = function () {
        this.focusId = null;
        this.focusCycle = -1;
        this.ritualsActivated = 0;
    };

    instance.save = function (data) {
        data.worldCycle = {
            version: this.dataVersion,
            focusId: this.focusId,
            focusCycle: this.focusCycle,
            ritualsActivated: this.ritualsActivated
        };
    };

    instance.load = function (data) {
        if (!data || !data.worldCycle) return;
        var saved = data.worldCycle;
        this.focusId = Game.worldCycleData.focuses[saved.focusId] ? saved.focusId : null;
        this.focusCycle = Math.floor(number(saved.focusCycle, -1));
        this.ritualsActivated = Math.max(0, Math.floor(number(saved.ritualsActivated, 0)));
        this.clearExpiredFocus();
    };

    instance.getCycleIndex = function () {
        return currentCycleIndex();
    };

    instance.getSeasonId = function () {
        var order = Game.worldCycleData.order;
        var index = currentCycleIndex();
        return order[((index % order.length) + order.length) % order.length];
    };

    instance.getSeason = function () {
        return Game.worldCycleData.seasons[this.getSeasonId()];
    };

    instance.getNextSeason = function () {
        var order = Game.worldCycleData.order;
        var current = order.indexOf(this.getSeasonId());
        return Game.worldCycleData.seasons[order[(current + 1) % order.length]];
    };

    instance.getSeasonEndsAt = function () {
        return Game.worldCycleData.epochMs + (currentCycleIndex() + 1) * Game.worldCycleData.cycleDurationMs;
    };

    instance.getSecondsRemaining = function () {
        return Math.max(0, Math.ceil((this.getSeasonEndsAt() - Date.now()) / 1000));
    };

    instance.clearExpiredFocus = function () {
        if (this.focusCycle !== currentCycleIndex()) {
            this.focusId = null;
            this.focusCycle = -1;
        }
    };

    instance.getActiveFocus = function () {
        this.clearExpiredFocus();
        return this.focusId ? Game.worldCycleData.focuses[this.focusId] : null;
    };

    instance.canActivateFocus = function (id) {
        this.clearExpiredFocus();
        var focus = Game.worldCycleData.focuses[id];
        if (!focus || this.focusId) return false;
        return Game.resources.getResource(RESOURCE.Wood) >= focus.cost;
    };

    instance.activateFocus = function (id) {
        this.clearExpiredFocus();
        var focus = Game.worldCycleData.focuses[id];
        if (!focus) return false;
        if (this.focusId) {
            Game.notifyInfo("Ritual already active", "Only one ritual can be maintained during each season.");
            return false;
        }
        if (Game.resources.getResource(RESOURCE.Wood) < focus.cost) {
            Game.notifyInfo("Not enough Spores", focus.name + " requires " + focus.cost + " Spores.");
            return false;
        }
        Game.resources.takeResource(RESOURCE.Wood, focus.cost);
        this.focusId = id;
        this.focusCycle = currentCycleIndex();
        this.ritualsActivated += 1;
        Game.notifySuccess("Seasonal ritual activated", focus.name + " will remain active until the season changes.");
        return true;
    };

    instance.getProductionMultiplier = function (resourceId) {
        this.clearExpiredFocus();
        var season = this.getSeason();
        var percent = definitionBonus(season, "globalPercent");
        if (season && season.bonuses && season.bonuses.resources) {
            percent += number(season.bonuses.resources[resourceId], 0);
        }

        var focus = this.getActiveFocus();
        if (focus && focus.bonus) {
            percent += number(focus.bonus.globalPercent, 0);
            if (focus.bonus.resources) percent += number(focus.bonus.resources[resourceId], 0);
        }
        return 1 + percent / 100;
    };

    instance.getInsightMultiplier = function () {
        return 1 + (definitionBonus(this.getSeason(), "insightPercent") + focusBonus("insightPercent")) / 100;
    };

    instance.getDnaMultiplier = function () {
        return 1 + (definitionBonus(this.getSeason(), "dnaPercent") + focusBonus("dnaPercent")) / 100;
    };

    instance.getArtifactChanceBonus = function () {
        return (definitionBonus(this.getSeason(), "artifactChancePercent") + focusBonus("artifactChancePercent")) / 100;
    };

    instance.getExpeditionDurationMultiplier = function () {
        var percent = definitionBonus(this.getSeason(), "expeditionSpeedPercent") + focusBonus("expeditionSpeedPercent");
        return Math.max(0.25, 1 - percent / 100);
    };

    instance.getBonusLines = function () {
        var season = this.getSeason();
        var bonus = season.bonuses || {};
        var result = [];
        if (number(bonus.globalPercent, 0)) result.push("+" + bonus.globalPercent + "% all miner production");
        if (bonus.resources) {
            for (var resource in bonus.resources) {
                if (!bonus.resources.hasOwnProperty(resource)) continue;
                var name = Game.resourceData[resource] ? Game.resourceData[resource].name : resource;
                result.push("+" + bonus.resources[resource] + "% " + name);
            }
        }
        if (number(bonus.insightPercent, 0)) result.push("+" + bonus.insightPercent + "% Insight");
        if (number(bonus.dnaPercent, 0)) result.push("+" + bonus.dnaPercent + "% fusion DNA");
        if (number(bonus.artifactChancePercent, 0)) result.push("+" + bonus.artifactChancePercent + "% artifact chance");
        return result;
    };

    instance.resetForAscension = function () {
        this.focusId = null;
        this.focusCycle = -1;
    };

    instance.update = function () {
        this.clearExpiredFocus();
    };

    return instance;
}());