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
