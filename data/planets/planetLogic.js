Game.planets = (function () {
    "use strict";

    var instance = {
        dataVersion: 2,
        activePlanetId: "mycoPrime",
        unlocked: {},
        progress: {},
        completed: {},
        lastProgressSource: "Mining"
    };

    function number(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    instance.initialise = function () {
        this.activePlanetId = "mycoPrime";
        this.unlocked = { mycoPrime: true };
        this.progress = {};
        this.completed = {};
        this.lastProgressSource = "Mining";
        for (var i = 0; i < Game.planetData.order.length; i++) this.progress[Game.planetData.order[i]] = 0;
    };

    instance.save = function (data) {
        data.planets = {
            version: this.dataVersion,
            activePlanetId: this.activePlanetId,
            unlocked: this.unlocked,
            progress: this.progress,
            completed: this.completed,
            lastProgressSource: this.lastProgressSource
        };
    };

    instance.load = function (data) {
        if (!data) return;
        var saved = data.planets;
        if (saved) {
            var loadedUnlocked = saved.unlocked || {};
            for (var id in loadedUnlocked) if (loadedUnlocked.hasOwnProperty(id) && Game.planetData.planets[id]) this.unlocked[id] = !!loadedUnlocked[id];
            var loadedProgress = saved.progress || {};
            for (var p in loadedProgress) if (loadedProgress.hasOwnProperty(p) && Game.planetData.planets[p]) this.progress[p] = Math.max(0, Math.min(100, number(loadedProgress[p], 0)));
            this.completed = saved.completed || {};
            this.lastProgressSource = saved.lastProgressSource || "Mining";
            if (Game.planetData.planets[saved.activePlanetId] && this.unlocked[saved.activePlanetId]) this.activePlanetId = saved.activePlanetId;
        }
        this.unlocked.mycoPrime = true;
        for (var i = 0; i < Game.planetData.order.length; i++) {
            var id = Game.planetData.order[i];
            if (!isFinite(this.progress[id])) this.progress[id] = 0;
            if (Game.bosses && Game.bosses.isPlanetBossDefeated && Game.bosses.isPlanetBossDefeated(id)) {
                this.progress[id] = 100;
                this.completed[id] = true;
            }
        }
        if (!this.unlocked[this.activePlanetId]) this.activePlanetId = "mycoPrime";
    };

    instance.getPlanet = function (id) { return Game.planetData.planets[id] || null; };
    instance.getActivePlanet = function () { return this.getPlanet(this.activePlanetId) || this.getPlanet("mycoPrime"); };
    instance.isUnlocked = function (id) { return !!this.unlocked[id]; };
    instance.isCompleted = function (id) { return !!this.completed[id]; };
    instance.getProgress = function (id) { return Math.max(0, Math.min(100, number(this.progress[id], 0))); };
    instance.isGateReady = function (id) { return this.isUnlocked(id) && this.getProgress(id) >= 100 && !this.isCompleted(id); };

    instance.addProgress = function (amount, source, planetId) {
        var id = planetId || this.activePlanetId;
        if (!this.isUnlocked(id) || this.isCompleted(id)) return 0;
        var before = this.getProgress(id);
        this.progress[id] = Math.min(100, before + Math.max(0, number(amount, 0)));
        if (source) this.lastProgressSource = source;
        if (before < 100 && this.progress[id] >= 100) Game.notifySuccess("Planet explored", this.getPlanet(id).name + " reached 100%. Challenge its guardian to open the next passage.");
        return this.progress[id] - before;
    };

    instance.getColonyPower = function () {
        return Game.miners && Game.miners.getColonySummary ? number(Game.miners.getColonySummary().power, 0) : 0;
    };
    instance.getLaboratoryLevel = function () { return Game.laboratory && Game.laboratory.getLevel ? Game.laboratory.getLevel() : 1; };

    instance.getRequirements = function (id) {
        var planet = this.getPlanet(id);
        if (!planet) return null;
        var required = planet.unlock || {};
        var currentPower = this.getColonyPower();
        var currentLab = this.getLaboratoryLevel();
        var orderIndex = Game.planetData.order.indexOf(id);
        var previousPlanetId = orderIndex > 0 ? Game.planetData.order[orderIndex - 1] : null;
        var previousBossMet = !previousPlanetId || this.isCompleted(previousPlanetId);
        return {
            colonyPower: { current: currentPower, required: number(required.colonyPower, 0), met: currentPower >= number(required.colonyPower, 0) },
            laboratoryLevel: { current: currentLab, required: number(required.laboratoryLevel, 1), met: currentLab >= number(required.laboratoryLevel, 1) },
            previousBoss: { planetId: previousPlanetId, met: previousBossMet }
        };
    };

    instance.canUnlock = function (id) {
        if (this.isUnlocked(id)) return true;
        var requirements = this.getRequirements(id);
        return !!requirements && requirements.colonyPower.met && requirements.laboratoryLevel.met && requirements.previousBoss.met;
    };

    instance.unlock = function (id) {
        var planet = this.getPlanet(id);
        if (!planet || this.isUnlocked(id) || !this.canUnlock(id)) return false;
        this.unlocked[id] = true;
        if (!isFinite(this.progress[id])) this.progress[id] = 0;
        if (Game.account) Game.account.addXp(120, "New planet discovered", true);
        Game.notifySuccess("New planet discovered", planet.name + " has joined the MycoVerse.");
        return true;
    };

    instance.activate = function (id) {
        if (!this.getPlanet(id) || !this.isUnlocked(id)) return false;
        this.activePlanetId = id;
        Game.notifySuccess("Active planet changed", this.getPlanet(id).name + " bonuses and Golden Mushroom drops are now active.");
        return true;
    };

    instance.beginGateBattle = function (planetId) {
        if (!this.isGateReady(planetId)) {
            Game.notifyInfo("Passage sealed", "Reach 100% planetary progress before challenging the guardian.");
            return false;
        }
        var boss = Game.bosses && Game.bosses.getBossForPlanet ? Game.bosses.getBossForPlanet(planetId) : null;
        if (!boss) return false;
        if (Game.bosses.startBattle(boss.id)) {
            if (Game.bossUI && Game.bossUI.openArena) Game.bossUI.openArena();
            return true;
        }
        return false;
    };

    instance.completePlanet = function (planetId) {
        this.progress[planetId] = 100;
        this.completed[planetId] = true;
        var index = Game.planetData.order.indexOf(planetId);
        var nextId = index >= 0 ? Game.planetData.order[index + 1] : null;
        if (nextId && !this.isUnlocked(nextId)) {
            this.unlocked[nextId] = true;
            if (!isFinite(this.progress[nextId])) this.progress[nextId] = 0;
            if (Game.account) Game.account.addXp(120, "New planet discovered", true);
            Game.notifySuccess("New planet discovered", this.getPlanet(nextId).name + " has joined the MycoVerse.");
        }
        return nextId;
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
            var resourceName = Game.resourceData && Game.resourceData[planet.bonus.resource] ? Game.resourceData[planet.bonus.resource].name : planet.bonus.resource;
            parts.push("+" + planet.bonus.percent + "% to " + resourceName + " miners");
        }
        return parts.join(" • ");
    };

    instance.getLeagueProgress = function () {
        var unlocked = 0;
        for (var i = 0; i < Game.planetData.order.length; i++) if (this.isUnlocked(Game.planetData.order[i])) unlocked += 1;
        return { unlocked: unlocked, total: Game.planetData.order.length };
    };

    instance.update = function (delta) {
        if (!this.isUnlocked(this.activePlanetId) || this.isCompleted(this.activePlanetId) || (Game.bosses && Game.bosses.activeBattle)) return;
        var incomes = Game.miners && Game.miners.getTotalIncome ? Game.miners.getTotalIncome() : {};
        var equivalent = 0;
        var weights = { wood: 1, gem: 8, science: 12 };
        for (var key in incomes) if (incomes.hasOwnProperty(key)) equivalent += Math.max(0, number(incomes[key], 0)) * (weights[key] || 3);
        var ratePerMinute = Math.min(2.5, 0.05 + Math.log(1 + equivalent) / Math.LN10 * 0.10);
        this.addProgress(ratePerMinute * (Math.max(0, delta) / 60), "Mining", this.activePlanetId);
    };

    return instance;
}());
