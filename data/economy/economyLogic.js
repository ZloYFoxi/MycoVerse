Game.economy = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        totalSpentSpores: 0,
        totalMarketVolume: 0,
        transactions: [],
        indexHistory: [],
        lastSnapshotAt: 0
    };

    function num(value, fallback) {
        var n = Number(value);
        return isFinite(n) ? n : fallback;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    instance.initialise = function () {
        this.totalSpentSpores = 0;
        this.totalMarketVolume = 0;
        this.transactions = [];
        this.indexHistory = [];
        this.lastSnapshotAt = 0;
    };

    instance.save = function (data) {
        data.economy = {
            version: this.dataVersion,
            totalSpentSpores: this.totalSpentSpores,
            totalMarketVolume: this.totalMarketVolume,
            transactions: this.transactions.slice(-50),
            indexHistory: this.indexHistory.slice(-Game.economyData.historyLimit),
            lastSnapshotAt: this.lastSnapshotAt
        };
    };

    instance.load = function (data) {
        if (!data || !data.economy) return;
        var saved = data.economy;
        this.totalSpentSpores = Math.max(0, num(saved.totalSpentSpores, 0));
        this.totalMarketVolume = Math.max(0, num(saved.totalMarketVolume, 0));
        this.transactions = Array.isArray(saved.transactions) ? saved.transactions.slice(-50) : [];
        this.indexHistory = Array.isArray(saved.indexHistory) ? saved.indexHistory.slice(-Game.economyData.historyLimit) : [];
        this.lastSnapshotAt = Math.max(0, num(saved.lastSnapshotAt, 0));
    };

    instance.getResourceValue = function (resourceId) {
        return Math.max(0.01, num(Game.economyData.resourceValues[resourceId], 1));
    };

    instance.toSporeEquivalent = function (resourceId, amount) {
        return Math.max(0, num(amount, 0)) * this.getResourceValue(resourceId);
    };

    instance.getMinerUpgradeCost = function (miner) {
        if (!miner || !miner.definition) return Infinity;
        var level = Math.max(1, num(miner.level, 1));
        return Math.floor(miner.definition.upgradeBaseCost * Math.pow(Game.economyData.upgradeGrowth, level - 1));
    };

    instance.getMinerCloneCost = function (miner) {
        if (!miner || !miner.definition || miner.owned <= 0) return Infinity;
        var base = Math.max(10, num(miner.definition.upgradeBaseCost, 10) * 2);
        return Math.floor(base * Math.pow(Game.economyData.cloneGrowth, Math.max(0, miner.owned - 1)));
    };

    instance.getIncrementalIncome = function (minerId) {
        var miner = Game.miners.getEntry(minerId);
        if (!miner || miner.owned <= 0 || miner.level >= miner.definition.maxLevel) return 0;
        var current = Game.miners.getMinerIncome(minerId);
        var oldLevel = miner.level;
        miner.level += 1;
        var next = Game.miners.getMinerIncome(minerId);
        miner.level = oldLevel;
        return Math.max(0, next - current);
    };

    instance.getUpgradeAnalysis = function (minerId) {
        var miner = Game.miners.getEntry(minerId);
        if (!miner || miner.owned <= 0) return null;
        var cost = Game.miners.getUpgradeCost(minerId);
        var delta = this.getIncrementalIncome(minerId);
        var sporeEquivalentPerSecond = this.toSporeEquivalent(miner.definition.resource, delta);
        var payback = sporeEquivalentPerSecond > 0 ? cost / sporeEquivalentPerSecond : Infinity;
        var band = Game.economyData.paybackBands[Game.economyData.paybackBands.length - 1];
        for (var i = 0; i < Game.economyData.paybackBands.length; i++) {
            if (payback <= Game.economyData.paybackBands[i].maxSeconds) {
                band = Game.economyData.paybackBands[i];
                break;
            }
        }
        return {
            minerId: minerId,
            name: miner.definition.name,
            resource: miner.definition.resource,
            level: miner.level,
            cost: cost,
            incrementalIncome: delta,
            sporeEquivalentPerSecond: sporeEquivalentPerSecond,
            paybackSeconds: payback,
            grade: band.grade,
            label: band.label
        };
    };

    instance.getAllUpgradeAnalyses = function () {
        var result = [];
        var miners = Game.miners.getEntriesSorted();
        for (var i = 0; i < miners.length; i++) {
            if (miners[i].owned <= 0 || miners[i].level >= miners[i].definition.maxLevel) continue;
            var analysis = this.getUpgradeAnalysis(miners[i].id);
            if (analysis) result.push(analysis);
        }
        result.sort(function (a, b) { return a.paybackSeconds - b.paybackSeconds; });
        return result;
    };

    instance.getBestUpgrade = function () {
        var list = this.getAllUpgradeAnalyses();
        return list.length ? list[0] : null;
    };

    instance.getMinerMarketValue = function (definition) {
        if (!definition) return Game.economyData.minimumMarketPrice;
        var resourceValue = this.getResourceValue(definition.resource);
        var perMinute = isFinite(Number(definition.incomePerMinute)) ? Number(definition.incomePerMinute) : Number(definition.baseIncome || 0) * 60;
        var hourlyOutput = Math.max(0.01, perMinute * definition.rarity.incomeMultiplier * resourceValue * 60);
        var rarityPremium = Math.pow(Math.max(1, definition.rarity.incomeMultiplier), 0.8);
        var progressionPremium = 1 + Math.max(0, num(definition.order, 1) - 1) * 0.035;
        return Math.max(Game.economyData.minimumMarketPrice, Math.floor(hourlyOutput * 0.14 * rarityPremium * progressionPremium));
    };

    instance.getArtifactMarketValue = function (artifact) {
        if (!artifact) return Game.economyData.minimumMarketPrice;
        var rarity = Game.artifactData.rarities[artifact.rarity];
        var rarityMultiplier = rarity ? rarity.multiplier : 1;
        var bonus = artifact.bonus ? num(artifact.bonus.percent, 0) : 0;
        return Math.floor(Game.economyData.artifactBaseValue * rarityMultiplier + bonus * 22);
    };

    instance.getMarketPrice = function (itemType, itemId) {
        var value = itemType === "miner" ? this.getMinerMarketValue(Game.minerData[itemId]) : this.getArtifactMarketValue(Game.artifactData.entries[itemId]);
        return Math.max(Game.economyData.minimumMarketPrice, Math.floor(value * Game.economyData.marketBuyMultiplier));
    };

    instance.getMinerSellPrice = function (minerId) {
        var entry = Game.miners.getEntry(minerId);
        if (!entry || entry.owned <= 1) return 0;
        var value = this.getMinerMarketValue(entry.definition);
        var levelBonus = 1 + Math.max(0, entry.level - 1) * 0.025;
        return Math.floor(value * Game.economyData.marketSellMultiplier * levelBonus);
    };

    instance.recordSporeSpend = function (type, amount, label) {
        amount = Math.max(0, num(amount, 0));
        this.totalSpentSpores += amount;
        this.transactions.push({ type: type, currency: "spores", amount: amount, label: label || type, at: Date.now() });
        this.transactions = this.transactions.slice(-50);
    };

    instance.recordMarketTrade = function (type, amount, label) {
        amount = Math.max(0, num(amount, 0));
        this.totalMarketVolume += amount;
        this.transactions.push({ type: type, currency: "mycoCoins", amount: amount, label: label || type, at: Date.now() });
        this.transactions = this.transactions.slice(-50);
    };

    instance.getProductionIndex = function () {
        if (!Game.miners || !Game.miners.getTotalIncome) return 0;
        var totals = Game.miners.getTotalIncome();
        var index = 0;
        for (var resource in totals) {
            if (!totals.hasOwnProperty(resource)) continue;
            index += this.toSporeEquivalent(resource, totals[resource]);
        }
        return index;
    };

    instance.getMarketIndex = function () {
        var ids = [];
        for (var id in Game.minerData) if (Game.minerData.hasOwnProperty(id) && !Game.minerData[id].bossExclusive) ids.push(id);
        if (!ids.length) return 0;
        var total = 0;
        for (var i = 0; i < ids.length; i++) total += this.getMinerMarketValue(Game.minerData[ids[i]]);
        return total / ids.length;
    };

    instance.getHealth = function () {
        var production = this.getProductionIndex();
        var best = this.getBestUpgrade();
        var score = 50;
        if (production > 0) score += Math.min(25, Math.log(production + 1) * 3.5);
        if (best && isFinite(best.paybackSeconds)) {
            score += clamp(20 - Math.log(best.paybackSeconds + 1) * 2, -15, 20);
        }
        score = clamp(Math.round(score), 0, 100);
        return {
            score: score,
            label: score >= 80 ? "Thriving" : score >= 60 ? "Stable" : score >= 40 ? "Developing" : "Fragile"
        };
    };

    instance.captureSnapshot = function () {
        var now = Date.now();
        if (now - this.lastSnapshotAt < 60 * 60 * 1000) return;
        this.indexHistory.push({ at: now, production: this.getProductionIndex(), market: this.getMarketIndex() });
        this.indexHistory = this.indexHistory.slice(-Game.economyData.historyLimit);
        this.lastSnapshotAt = now;
    };

    instance.update = function () {
        this.captureSnapshot();
    };

    return instance;
}());
