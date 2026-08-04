Game.planets = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        activePlanetId: "mycoPrime",
        unlocked: {}
    };

    function number(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    instance.initialise = function () {
        this.activePlanetId = "mycoPrime";
        this.unlocked = { mycoPrime: true };
    };

    instance.save = function (data) {
        data.planets = {
            version: this.dataVersion,
            activePlanetId: this.activePlanetId,
            unlocked: this.unlocked
        };
    };

    instance.load = function (data) {
        if (!data) return;

        var saved = data.planets;
        if (saved) {
            var loadedUnlocked = saved.unlocked || {};
            for (var id in loadedUnlocked) {
                if (loadedUnlocked.hasOwnProperty(id) && Game.planetData.planets[id]) {
                    this.unlocked[id] = !!loadedUnlocked[id];
                }
            }
            if (Game.planetData.planets[saved.activePlanetId] && this.unlocked[saved.activePlanetId]) {
                this.activePlanetId = saved.activePlanetId;
            }
        } else if (data.goldenEvents && Game.planetData.planets[data.goldenEvents.currentPlanet]) {
            // Migration from Alpha 0.10.x.
            this.activePlanetId = data.goldenEvents.currentPlanet;
            this.unlocked[this.activePlanetId] = true;
        }

        this.unlocked.mycoPrime = true;
        if (!this.unlocked[this.activePlanetId]) this.activePlanetId = "mycoPrime";
    };

    instance.getPlanet = function (id) {
        return Game.planetData.planets[id] || null;
    };

    instance.getActivePlanet = function () {
        return this.getPlanet(this.activePlanetId) || this.getPlanet("mycoPrime");
    };

    instance.isUnlocked = function (id) {
        return !!this.unlocked[id];
    };

    instance.getColonyPower = function () {
        if (!Game.miners || !Game.miners.getColonySummary) return 0;
        return number(Game.miners.getColonySummary().power, 0);
    };

    instance.getLaboratoryLevel = function () {
        return Game.laboratory && Game.laboratory.getLevel ? Game.laboratory.getLevel() : 1;
    };

    instance.getRequirements = function (id) {
        var planet = this.getPlanet(id);
        if (!planet) return null;
        var required = planet.unlock || {};
        var currentPower = this.getColonyPower();
        var currentLab = this.getLaboratoryLevel();
        return {
            colonyPower: {
                current: currentPower,
                required: number(required.colonyPower, 0),
                met: currentPower >= number(required.colonyPower, 0)
            },
            laboratoryLevel: {
                current: currentLab,
                required: number(required.laboratoryLevel, 1),
                met: currentLab >= number(required.laboratoryLevel, 1)
            }
        };
    };

    instance.canUnlock = function (id) {
        if (this.isUnlocked(id)) return true;
        var requirements = this.getRequirements(id);
        return !!requirements &&
            requirements.colonyPower.met &&
            requirements.laboratoryLevel.met;
    };

    instance.unlock = function (id) {
        var planet = this.getPlanet(id);
        if (!planet || this.isUnlocked(id)) return false;
        if (!this.canUnlock(id)) {
            Game.notifyInfo("Planet locked", "Increase Colony Power and Laboratory Level to enter this league.");
            return false;
        }
        this.unlocked[id] = true;
        Game.notifySuccess("New planet discovered", planet.name + " has joined the MycoVerse.");
        return true;
    };

    instance.activate = function (id) {
        if (!this.getPlanet(id) || !this.isUnlocked(id)) return false;
        this.activePlanetId = id;
        Game.notifySuccess("Active planet changed", this.getPlanet(id).name + " bonuses and Golden Mushroom drops are now active.");
        return true;
    };

    instance.getProductionMultiplier = function (resourceId) {
        var planet = this.getActivePlanet();
        var bonus = planet && planet.bonus ? planet.bonus : {};
        var percent = number(bonus.globalPercent, 0);
        if (bonus.resource === resourceId) percent += number(bonus.percent, 0);
        return 1 + Math.max(0, percent) / 100;
    };

    instance.getBonusText = function (id) {
        var planet = this.getPlanet(id);
        if (!planet || !planet.bonus) return "No production bonus";
        var parts = [];
        if (planet.bonus.globalPercent) parts.push("+" + planet.bonus.globalPercent + "% to all miner production");
        if (planet.bonus.resource) {
            var resourceName = Game.resourceData && Game.resourceData[planet.bonus.resource] ?
                Game.resourceData[planet.bonus.resource].name : planet.bonus.resource;
            parts.push("+" + planet.bonus.percent + "% to " + resourceName + " miners");
        }
        return parts.join(" • ");
    };

    instance.getLeagueProgress = function () {
        var unlocked = 0;
        for (var i = 0; i < Game.planetData.order.length; i++) {
            if (this.isUnlocked(Game.planetData.order[i])) unlocked += 1;
        }
        return { unlocked: unlocked, total: Game.planetData.order.length };
    };

    return instance;
}());
