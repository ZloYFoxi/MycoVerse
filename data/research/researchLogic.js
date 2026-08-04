Game.research = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        insight: 0,
        purchased: {},
        specialization: null,
        totalInsightEarned: 0
    };

    function number(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    instance.initialise = function () {
        this.insight = 0;
        this.purchased = {};
        this.specialization = null;
        this.totalInsightEarned = 0;
    };

    instance.save = function (data) {
        data.research = {
            version: this.dataVersion,
            insight: this.insight,
            purchased: this.purchased,
            specialization: this.specialization,
            totalInsightEarned: this.totalInsightEarned
        };
    };

    instance.load = function (data) {
        if (!data || !data.research) return;
        var saved = data.research;
        this.insight = Math.max(0, number(saved.insight, 0));
        this.totalInsightEarned = Math.max(this.insight, number(saved.totalInsightEarned, this.insight));
        this.purchased = {};
        var loaded = saved.purchased || {};
        for (var id in loaded) {
            if (loaded.hasOwnProperty(id) && Game.researchData.nodes[id] && loaded[id]) {
                this.purchased[id] = true;
        if (Game.account) Game.account.addXp(35, "Research completed", true);
            }
        }
        this.specialization = Game.researchData.specializations[saved.specialization] ? saved.specialization : null;
    };

    instance.getColonyPower = function () {
        if (!Game.miners || !Game.miners.getColonySummary) return 0;
        return Math.max(0, number(Game.miners.getColonySummary().power, 0));
    };

    instance.getInsightRate = function () {
        var power = this.getColonyPower();
        if (power <= 0) return 0;
        var rate = Math.sqrt(power) * 0.035;
        if (this.isPurchased("deepRootMemory")) rate *= 1.30;
        if (Game.ascension && Game.ascension.getInsightMultiplier) rate *= Game.ascension.getInsightMultiplier();
        if (Game.structures && Game.structures.getInsightMultiplier) rate *= Game.structures.getInsightMultiplier();
        if (Game.worldCycle && Game.worldCycle.getInsightMultiplier) rate *= Game.worldCycle.getInsightMultiplier();
        return rate;
    };

    instance.update = function (delta) {
        delta = Math.max(0, number(delta, 0));
        if (!delta) return;
        var earned = this.getInsightRate() * delta;
        this.insight += earned;
        this.totalInsightEarned += earned;
    };

    instance.isPurchased = function (id) {
        return !!this.purchased[id];
    };

    instance.getNode = function (id) {
        return Game.researchData.nodes[id] || null;
    };

    instance.getPurchasedCount = function () {
        var total = 0;
        for (var id in this.purchased) {
            if (this.purchased.hasOwnProperty(id) && this.purchased[id]) total++;
        }
        return total;
    };

    instance.areRequirementsMet = function (id) {
        var node = this.getNode(id);
        if (!node) return false;
        var i;
        var required = node.requires || [];
        for (i = 0; i < required.length; i++) {
            if (!this.isPurchased(required[i])) return false;
        }
        var any = node.requiresAny || [];
        if (any.length) {
            var found = false;
            for (i = 0; i < any.length; i++) {
                if (this.isPurchased(any[i])) { found = true; break; }
            }
            if (!found) return false;
        }
        return true;
    };

    instance.canPurchase = function (id) {
        var node = this.getNode(id);
        return !!node && !this.isPurchased(id) && this.areRequirementsMet(id) && this.insight >= node.cost;
    };

    instance.purchase = function (id) {
        var node = this.getNode(id);
        if (!node || this.isPurchased(id)) return false;
        if (!this.areRequirementsMet(id)) {
            Game.notifyInfo("Research locked", "Unlock the connected research first.");
            return false;
        }
        if (this.insight < node.cost) {
            Game.notifyInfo("Not enough Insight", "The colony needs more time to understand this research.");
            return false;
        }
        this.insight -= node.cost;
        this.purchased[id] = true;
        if (Game.account) Game.account.addXp(35, "Research completed", true);
        if (Game.planets) Game.planets.addProgress(2, "Research");
        Game.notifySuccess("Research completed", node.name + " now strengthens the colony.");
        return true;
    };

    instance.canChooseSpecialization = function () {
        return this.getPurchasedCount() >= 3;
    };

    instance.chooseSpecialization = function (id) {
        var specialization = Game.researchData.specializations[id];
        if (!specialization || this.specialization) return false;
        if (!this.canChooseSpecialization()) {
            Game.notifyInfo("Specialization locked", "Complete at least three research nodes first.");
            return false;
        }
        this.specialization = id;
        Game.notifySuccess("Colony specialized", specialization.name + " now guides the MycoVerse.");
        return true;
    };

    instance.getProductionMultiplier = function (resourceId) {
        var percent = 0;
        for (var id in this.purchased) {
            if (!this.purchased.hasOwnProperty(id) || !this.purchased[id]) continue;
            var node = this.getNode(id);
            if (!node || !node.bonus) continue;
            if (node.bonus.type === "global") percent += number(node.bonus.percent, 0);
            if (node.bonus.type === "resource" && node.bonus.resource === resourceId) {
                percent += number(node.bonus.percent, 0);
            }
        }
        var spec = Game.researchData.specializations[this.specialization];
        if (spec && spec.resource === resourceId) percent += number(spec.percent, 0);
        return 1 + percent / 100;
    };

    instance.getBonusText = function (node) {
        if (!node || !node.bonus) return "Colony research";
        if (node.bonus.type === "global") return "+" + node.bonus.percent + "% all miner production";
        if (node.bonus.type === "resource") {
            var resource = Game.resourceData[node.bonus.resource];
            return "+" + node.bonus.percent + "% " + (resource ? resource.name : node.bonus.resource) + " production";
        }
        if (node.bonus.type === "insight") return "+" + node.bonus.percent + "% Insight generation";
        return "Permanent colony bonus";
    };

    return instance;
})();