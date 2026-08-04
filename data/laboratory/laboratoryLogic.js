Game.laboratory = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        dna: 0,
        experience: 0
    };

    function number(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    instance.initialise = function () {
        this.dna = 0;
        this.experience = 0;
    };

    instance.save = function (data) {
        data.laboratory = {
            version: this.dataVersion,
            dna: this.dna,
            experience: this.experience
        };
    };

    instance.load = function (data) {
        if (!data || !data.laboratory) return;
        this.dna = Math.max(0, number(data.laboratory.dna, 0));
        this.experience = Math.max(0, number(data.laboratory.experience, 0));
    };

    instance.getLevel = function () {
        var perLevel = Game.laboratoryData.experiencePerLevel;
        return Math.min(Game.laboratoryData.maxLevel, 1 + Math.floor(this.experience / perLevel));
    };

    instance.getLevelProgress = function () {
        if (this.getLevel() >= Game.laboratoryData.maxLevel) return 1;
        return (this.experience % Game.laboratoryData.experiencePerLevel) / Game.laboratoryData.experiencePerLevel;
    };

    instance.getMutationSlots = function () {
        return Math.min(3, 1 + Math.floor((this.getLevel() - 1) / 2));
    };

    instance.addDNA = function (amount) {
        this.dna += Math.max(0, number(amount, 0));
    };

    instance.addExperience = function (amount) {
        this.experience += Math.max(0, number(amount, 0));
    };

    instance.getFusionReward = function (minerId) {
        var entry = Game.miners.getEntry(minerId);
        if (!entry) return 0;
        var reward = Game.laboratoryData.fusionRewards[entry.definition.rarity.id] || 0;
        if (Game.worldCycle && Game.worldCycle.getDnaMultiplier) reward *= Game.worldCycle.getDnaMultiplier();
        return Math.max(0, Math.floor(reward));
    };

    instance.getMutationCost = function (minerId) {
        var entry = Game.miners.getEntry(minerId);
        if (!entry) return Infinity;
        var base = Game.laboratoryData.mutationCosts[entry.definition.rarity.id] || 10;
        return Math.floor(base * Math.pow(1.75, entry.mutations.length));
    };


    instance.getHealCost = function (minerId, full) {
        var entry = Game.miners.getEntry(minerId);
        if (!entry || entry.owned <= 0) return null;
        var maxHealth = Game.miners.getMaxHealth(minerId);
        var currentHealth = Game.miners.getCurrentHealth(minerId);
        var missing = Math.max(0, maxHealth - currentHealth);
        if (!full) missing = Math.min(missing, maxHealth * 0.25);
        var rarity = entry.definition.rarity && entry.definition.rarity.incomeMultiplier ? entry.definition.rarity.incomeMultiplier : 1;
        var efficiency = Math.max(0.45, 1 - (this.getLevel() - 1) * 0.04);
        if (Game.guild && Game.guild.getHealingCostMultiplier) efficiency *= Game.guild.getHealingCostMultiplier();
        return {
            healAmount: Math.ceil(missing),
            spores: Math.ceil(missing * rarity * 0.65 * efficiency),
            dna: Math.ceil(missing * 0.012 * rarity * efficiency),
            science: Math.ceil(missing * 0.08 * efficiency)
        };
    };

    instance.canAffordHeal = function (cost) {
        if (!cost || cost.healAmount <= 0) return false;
        return Game.resources.getResource(RESOURCE.Wood) >= cost.spores &&
            Game.resources.getResource(RESOURCE.Science) >= cost.science &&
            this.dna >= cost.dna;
    };

    instance.healMiner = function (minerId, full) {
        var cost = this.getHealCost(minerId, full);
        if (!cost || cost.healAmount <= 0) return false;
        if (!this.canAffordHeal(cost)) {
            Game.notifyInfo("Treatment unavailable", "Medical treatment requires " + cost.spores + " Spores, " + cost.science + " Science and " + cost.dna + " DNA.");
            return false;
        }
        Game.resources.takeResource(RESOURCE.Wood, cost.spores);
        Game.resources.takeResource(RESOURCE.Science, cost.science);
        this.dna -= cost.dna;
        var healed = Game.miners.healMiner(minerId, cost.healAmount);
        this.addExperience(Math.max(2, Math.floor(healed / 10)));
        if (Game.mycoAchievements) Game.mycoAchievements.addCustomStat("healthRestored", healed);
        Game.notifySuccess("Miner treated", Game.miners.getEntry(minerId).definition.name + " recovered " + Math.floor(healed) + " HP.");
        return true;
    };

    instance.getHealAllCost = function () {
        var total = { healAmount: 0, spores: 0, dna: 0, science: 0 };
        var miners = Game.miners.getEntriesSorted();
        for (var i = 0; i < miners.length; i++) {
            if (miners[i].owned <= 0) continue;
            var cost = this.getHealCost(miners[i].id, true);
            if (!cost) continue;
            total.healAmount += cost.healAmount;
            total.spores += cost.spores;
            total.dna += cost.dna;
            total.science += cost.science;
        }
        return total;
    };

    instance.healAll = function () {
        var cost = this.getHealAllCost();
        if (!this.canAffordHeal(cost)) {
            Game.notifyInfo("Treatment unavailable", "Healing the colony requires " + cost.spores + " Spores, " + cost.science + " Science and " + cost.dna + " DNA.");
            return false;
        }
        Game.resources.takeResource(RESOURCE.Wood, cost.spores);
        Game.resources.takeResource(RESOURCE.Science, cost.science);
        this.dna -= cost.dna;
        var healed = Game.miners.healAll();
        this.addExperience(Math.max(5, Math.floor(healed / 12)));
        if (Game.mycoAchievements) Game.mycoAchievements.addCustomStat("healthRestored", healed);
        Game.notifySuccess("Colony treatment complete", "All available miners were restored to full health.");
        return true;
    };

    instance.fuse = function (minerId) {
        var reward = this.getFusionReward(minerId);
        if (!Game.miners.fuse(minerId)) return false;
        this.addDNA(reward);
        this.addExperience(35 + reward);
        Game.notifySuccess("Fusion complete", "The species evolved and produced " + reward + " DNA.");
        return true;
    };

    instance.mutate = function (minerId) {
        var entry = Game.miners.getEntry(minerId);
        if (!entry || entry.owned <= 0) return false;
        if (entry.mutations.length >= this.getMutationSlots()) {
            Game.notifyInfo("Mutation slots full", "Upgrade the laboratory to unlock another mutation slot.");
            return false;
        }

        var cost = this.getMutationCost(minerId);
        if (this.dna < cost) {
            Game.notifyInfo("Not enough DNA", "This mutation requires " + cost + " DNA.");
            return false;
        }

        var pool = Game.laboratoryData.mutationPool;
        var mutation = pool[Math.floor(Math.random() * pool.length)];
        this.dna -= cost;
        entry.mutations.push({
            id: mutation.id,
            name: mutation.name,
            incomePercent: mutation.incomePercent
        });
        this.addExperience(20 + cost);
        Game.notifySuccess("Mutation stabilized", entry.definition.name + " gained " + mutation.name + ".");
        return true;
    };

    return instance;
}());
