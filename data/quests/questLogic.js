Game.quests = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        completedStory: {},
        claimedDaily: {},
        dailyStats: { production: 0, upgrades: 0, expeditions: 0 },
        dailyKey: "",
        activeExpeditions: [],
        history: []
    };

    function number(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    function dayKey() {
        var date = new Date();
        return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
    }

    function randomInt(range) {
        if (!Array.isArray(range)) return Math.max(0, number(range, 0));
        var min = Math.floor(number(range[0], 0));
        var max = Math.floor(number(range[1], min));
        return min + Math.floor(Math.random() * (Math.max(min, max) - min + 1));
    }

    function resourceId(name) {
        if (name === "spores") return RESOURCE.Wood;
        return name;
    }

    function resourceName(id) {
        var actual = resourceId(id);
        if (Game.resourceData && Game.resourceData[actual]) return Game.resourceData[actual].name;
        if (id === "dna") return "DNA";
        return id;
    }

    instance.initialise = function () {
        this.completedStory = {};
        this.claimedDaily = {};
        this.dailyStats = { production: 0, upgrades: 0, expeditions: 0 };
        this.dailyKey = dayKey();
        this.activeExpeditions = [];
        this.history = [];
    };

    instance.save = function (data) {
        data.quests = {
            version: this.dataVersion,
            completedStory: this.completedStory,
            claimedDaily: this.claimedDaily,
            dailyStats: this.dailyStats,
            dailyKey: this.dailyKey,
            activeExpeditions: this.activeExpeditions,
            history: this.history.slice(-20)
        };
    };

    instance.load = function (data) {
        if (!data || !data.quests) {
            this.ensureDailyReset();
            return;
        }
        var saved = data.quests;
        this.completedStory = saved.completedStory || {};
        this.claimedDaily = saved.claimedDaily || {};
        this.dailyStats = saved.dailyStats || { production: 0, upgrades: 0, expeditions: 0 };
        this.dailyKey = saved.dailyKey || dayKey();
        this.activeExpeditions = Array.isArray(saved.activeExpeditions) ? saved.activeExpeditions : [];
        this.history = Array.isArray(saved.history) ? saved.history.slice(-20) : [];
        this.ensureDailyReset();
    };

    instance.ensureDailyReset = function () {
        var current = dayKey();
        if (this.dailyKey === current) return;
        this.dailyKey = current;
        this.claimedDaily = {};
        this.dailyStats = { production: 0, upgrades: 0, expeditions: 0 };
    };

    instance.recordUpgrade = function () {
        this.ensureDailyReset();
        this.dailyStats.upgrades += 1;
    };

    instance.recordProduction = function (amount) {
        this.ensureDailyReset();
        this.dailyStats.production += Math.max(0, number(amount, 0));
    };

    instance.getObjectiveProgress = function (objective) {
        if (!objective) return 0;
        var summary;
        switch (objective.type) {
            case "colonyPower":
                summary = Game.miners.getColonySummary();
                return summary.power;
            case "species":
                return Game.miners.getCollectionProgress().owned;
            case "laboratoryLevel":
                return Game.laboratory.getLevel();
            case "planetUnlocked":
                return Game.planets.isUnlocked(objective.planetId) ? 1 : 0;
            case "dailyProduction":
                this.ensureDailyReset();
                return this.dailyStats.production;
            case "dailyUpgrades":
                this.ensureDailyReset();
                return this.dailyStats.upgrades;
            case "dailyExpeditions":
                this.ensureDailyReset();
                return this.dailyStats.expeditions;
            default:
                return 0;
        }
    };

    instance.isObjectiveComplete = function (objective) {
        return this.getObjectiveProgress(objective) >= number(objective.target, 1);
    };

    instance.grantRewards = function (rewards) {
        rewards = rewards || {};
        var summary = [];
        for (var key in rewards) {
            if (!rewards.hasOwnProperty(key) || key === "minerId" || key === "minerAmount" || key === "minerChance") continue;
            var amount = randomInt(rewards[key]);
            if (amount <= 0) continue;
            if (key === "dna") {
                Game.laboratory.addDNA(amount);
            } else {
                Game.resources.addResource(resourceId(key), amount);
            }
            summary.push(amount + " " + resourceName(key));
        }

        if (rewards.minerId) {
            var chance = rewards.minerChance === undefined ? 1 : number(rewards.minerChance, 0);
            if (Math.random() <= chance && Game.miners.getEntry(rewards.minerId)) {
                var amountMiner = Math.max(1, number(rewards.minerAmount, 1));
                Game.miners.unlock(rewards.minerId, amountMiner);
                summary.push(amountMiner + " " + Game.minerData[rewards.minerId].name);
            }
        }
        return summary;
    };

    instance.claimStory = function (id) {
        var quest = Game.questData.story[id];
        if (!quest || this.completedStory[id] || !this.isObjectiveComplete(quest.objective)) return false;
        this.completedStory[id] = true;
        var rewards = this.grantRewards(quest.rewards);
        Game.notifySuccess("Story quest complete", quest.name + ": " + rewards.join(", "));
        return true;
    };

    instance.claimDaily = function (id) {
        this.ensureDailyReset();
        var quest = null;
        for (var i = 0; i < Game.questData.daily.length; i++) {
            if (Game.questData.daily[i].id === id) quest = Game.questData.daily[i];
        }
        if (!quest || this.claimedDaily[id] || !this.isObjectiveComplete(quest.objective)) return false;
        this.claimedDaily[id] = true;
        var rewards = this.grantRewards(quest.rewards);
        Game.notifySuccess("Daily quest complete", quest.name + ": " + rewards.join(", "));
        return true;
    };

    instance.getExpeditionSlots = function () {
        var level = Game.laboratory ? Game.laboratory.getLevel() : 1;
        return Math.min(3, 1 + Math.floor((level - 1) / 3));
    };

    instance.getExpedition = function (id) {
        return Game.questData.expeditions[id] || null;
    };

    instance.getActiveExpedition = function (id) {
        for (var i = 0; i < this.activeExpeditions.length; i++) {
            if (this.activeExpeditions[i].id === id) return this.activeExpeditions[i];
        }
        return null;
    };

    instance.getRequirements = function (id) {
        var expedition = this.getExpedition(id);
        if (!expedition) return null;
        var summary = Game.miners.getColonySummary();
        var requirements = expedition.requirements || {};
        return {
            planet: Game.planets.isUnlocked(expedition.planetId),
            species: summary.species >= number(requirements.species, 0),
            specimens: summary.specimens >= number(requirements.specimens, 0),
            currentSpecies: summary.species,
            currentSpecimens: summary.specimens,
            requiredSpecies: number(requirements.species, 0),
            requiredSpecimens: number(requirements.specimens, 0)
        };
    };

    instance.canStartExpedition = function (id) {
        var expedition = this.getExpedition(id);
        if (!expedition || this.getActiveExpedition(id)) return false;
        if (this.activeExpeditions.length >= this.getExpeditionSlots()) return false;
        var req = this.getRequirements(id);
        if (!req || !req.planet || !req.species || !req.specimens) return false;
        var cost = expedition.cost || {};
        for (var key in cost) {
            if (cost.hasOwnProperty(key) && Game.resources.getResource(resourceId(key)) < number(cost[key], 0)) return false;
        }
        return true;
    };

    instance.startExpedition = function (id) {
        if (!this.canStartExpedition(id)) {
            Game.notifyInfo("Expedition unavailable", "Check the planet, team requirements, free slots and expedition cost.");
            return false;
        }
        var expedition = this.getExpedition(id);
        for (var key in expedition.cost) {
            if (expedition.cost.hasOwnProperty(key)) Game.resources.takeResource(resourceId(key), expedition.cost[key]);
        }
        this.activeExpeditions.push({
            id: id,
            startedAt: Date.now(),
            endsAt: Date.now() + expedition.durationSeconds * 1000 * ((Game.worldCycle && Game.worldCycle.getExpeditionDurationMultiplier) ? Game.worldCycle.getExpeditionDurationMultiplier() : 1),
            claimed: false
        });
        Game.notifySuccess("Expedition launched", expedition.name + " has departed.");
        return true;
    };

    instance.claimExpedition = function (id) {
        var active = this.getActiveExpedition(id);
        if (!active || Date.now() < active.endsAt) return false;
        var expedition = this.getExpedition(id);
        var rewards = this.grantRewards(expedition.rewards);
        if (Game.artifacts && Game.artifacts.rollExpeditionArtifact) {
            var artifactId = Game.artifacts.rollExpeditionArtifact(expedition.planetId);
            if (artifactId && Game.artifactData.entries[artifactId]) rewards.push(Game.artifactData.entries[artifactId].name + " artifact");
        }
        this.dailyStats.expeditions += 1;
        this.history.push({ id: id, completedAt: Date.now(), rewards: rewards });
        this.activeExpeditions = this.activeExpeditions.filter(function (entry) { return entry.id !== id; });
        Game.notifySuccess("Expedition returned", expedition.name + ": " + rewards.join(", "));
        return true;
    };

    instance.getSecondsRemaining = function (id) {
        var active = this.getActiveExpedition(id);
        if (!active) return 0;
        return Math.max(0, Math.ceil((active.endsAt - Date.now()) / 1000));
    };

    instance.update = function (delta) {
        this.ensureDailyReset();
        if (Game.miners && Game.miners.getTotalIncome) {
            var incomes = Game.miners.getTotalIncome();
            var total = 0;
            for (var key in incomes) {
                if (incomes.hasOwnProperty(key)) total += Math.max(0, number(incomes[key], 0)) * delta;
            }
            this.recordProduction(total);
        }
    };

    return instance;
}());
