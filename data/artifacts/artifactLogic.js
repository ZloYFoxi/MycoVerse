Game.artifacts = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        inventory: {},
        equipped: { core: null, crown: null, charm: null },
        history: []
    };

    function num(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    instance.initialise = function () {
        this.inventory = {};
        this.equipped = { core: null, crown: null, charm: null };
        this.history = [];
    };

    instance.save = function (data) {
        data.artifacts = {
            version: this.dataVersion,
            inventory: this.inventory,
            equipped: this.equipped,
            history: this.history.slice(-20)
        };
    };

    instance.load = function (data) {
        if (!data || !data.artifacts) return;
        this.inventory = data.artifacts.inventory || {};
        this.equipped = data.artifacts.equipped || { core: null, crown: null, charm: null };
        this.history = Array.isArray(data.artifacts.history) ? data.artifacts.history.slice(-20) : [];
        var slots = Game.artifactData.slots;
        for (var i = 0; i < slots.length; i++) {
            var slot = slots[i];
            var id = this.equipped[slot];
            if (id && (!Game.artifactData.entries[id] || this.getCount(id) <= 0)) this.equipped[slot] = null;
        }
    };

    instance.getCount = function (id) {
        return Math.max(0, Math.floor(num(this.inventory[id], 0)));
    };

    instance.add = function (id, amount) {
        if (!Game.artifactData.entries[id]) return false;
        this.inventory[id] = this.getCount(id) + Math.max(1, Math.floor(num(amount, 1)));
        this.history.push({ id: id, foundAt: Date.now() });
        return true;
    };

    instance.getOwnedCount = function () {
        var total = 0;
        for (var id in this.inventory) if (this.inventory.hasOwnProperty(id) && this.getCount(id) > 0) total += 1;
        return total;
    };

    instance.getTotalCopies = function () {
        var total = 0;
        for (var id in this.inventory) if (this.inventory.hasOwnProperty(id)) total += this.getCount(id);
        return total;
    };

    instance.isEquipped = function (id) {
        for (var slot in this.equipped) if (this.equipped.hasOwnProperty(slot) && this.equipped[slot] === id) return true;
        return false;
    };

    instance.equip = function (id) {
        var artifact = Game.artifactData.entries[id];
        if (!artifact || this.getCount(id) <= 0) return false;
        this.equipped[artifact.slot] = id;
        Game.notifySuccess("Artifact equipped", artifact.name + " now empowers your colony.");
        return true;
    };

    instance.unequip = function (slot) {
        if (!this.equipped.hasOwnProperty(slot)) return false;
        this.equipped[slot] = null;
        return true;
    };

    instance.getBonuses = function () {
        var result = { global: 0, resources: {} };
        for (var slot in this.equipped) {
            if (!this.equipped.hasOwnProperty(slot)) continue;
            var id = this.equipped[slot];
            var artifact = Game.artifactData.entries[id];
            if (!artifact || !artifact.bonus) continue;
            if (artifact.bonus.type === "global") result.global += num(artifact.bonus.percent, 0);
            if (artifact.bonus.type === "resource" && artifact.bonus.resource) {
                result.resources[artifact.bonus.resource] = (result.resources[artifact.bonus.resource] || 0) + num(artifact.bonus.percent, 0);
            }
        }
        return result;
    };

    instance.getProductionMultiplier = function (resource) {
        var bonuses = this.getBonuses();
        return 1 + (bonuses.global + (bonuses.resources[resource] || 0)) / 100;
    };

    instance.getBonusText = function (id) {
        var artifact = Game.artifactData.entries[id];
        if (!artifact || !artifact.bonus) return "No bonus";
        if (artifact.bonus.type === "global") return "+" + artifact.bonus.percent + "% to all miner production";
        var name = Game.resourceData && Game.resourceData[artifact.bonus.resource] ? Game.resourceData[artifact.bonus.resource].name : artifact.bonus.resource;
        return "+" + artifact.bonus.percent + "% to " + name + " miner production";
    };

    instance.rollExpeditionArtifact = function (planetId) {
        var pool = Game.artifactData.expeditionPools[planetId] || [];
        var chance = num(Game.artifactData.expeditionChance[planetId], 0);
        if (!pool.length || Math.random() > chance) return null;
        var id = pool[Math.floor(Math.random() * pool.length)];
        if (!this.add(id, 1)) return null;
        return id;
    };

    return instance;
}());
