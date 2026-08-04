Game.minerShop = (function () {
    "use strict";

    var instance = { dataVersion: 2, purchases: 0, freeClaimed: false };
    var rarityOrder = ["common", "rare", "epic", "legendary", "mythic"];
    var rarityBasePrices = { common: 80, rare: 1500, epic: 9000, legendary: 55000, mythic: 320000 };
    var rarityXp = { common: 50, rare: 90, epic: 180, legendary: 360, mythic: 700 };

    function level() {
        return Game.account && Game.account.getLevelInfo ? Game.account.getLevelInfo().level : 1;
    }

    instance.initialise = function () {
        this.purchases = 0;
        this.freeClaimed = false;
    };

    instance.save = function (data) {
        data.minerShop = { version: this.dataVersion, purchases: this.purchases, freeClaimed: this.freeClaimed };
    };

    instance.load = function (data) {
        if (data && data.minerShop) {
            this.purchases = Math.max(0, Number(data.minerShop.purchases) || 0);
            this.freeClaimed = !!data.minerShop.freeClaimed;
        }
        var starter = Game.miners && Game.miners.getEntry ? Game.miners.getEntry("sporeWorker") : null;
        if (starter && starter.owned > 0) this.freeClaimed = true;
    };

    instance.getRarityOrder = function () { return rarityOrder.slice(); };

    instance.getPrice = function (id) {
        var d = Game.minerData[id];
        if (!d || d.bossExclusive) return Infinity;
        var rarityId = d.rarity.id;
        var rank = Math.max(1, Number(d.shopRank) || 1);
        var base = rarityBasePrices[rarityId] || 100;
        var progression = Math.pow(1.55, rank - 1);
        return Math.max(25, Math.floor(base * progression));
    };

    instance.getXpReward = function (id, duplicate) {
        var d = Game.minerData[id];
        if (!d) return 0;
        var full = rarityXp[d.rarity.id] || 50;
        return duplicate ? Math.max(10, Math.floor(full * 0.2)) : full;
    };

    instance.isUnlocked = function (id) {
        var d = Game.minerData[id];
        return !!d && !d.bossExclusive && level() >= Math.max(1, Number(d.shopUnlockLevel) || 1);
    };

    instance.canClaimFree = function () {
        var entry = Game.miners.getEntry("sporeWorker");
        return !this.freeClaimed && entry && entry.owned <= 0;
    };

    instance.claimFree = function () {
        if (!this.canClaimFree()) return false;
        Game.miners.unlock("sporeWorker", 1);
        this.freeClaimed = true;
        Game.account.addXp(50, "Claimed first Spore Worker", true);
        if (Game.quests && Game.quests.recordMinerPurchase) Game.quests.recordMinerPurchase();
        if (Game.notifySuccess) Game.notifySuccess("First miner claimed", "Spore Worker joined your colony for free. +50 XP");
        return true;
    };

    instance.getCatalog = function () {
        var out = [];
        for (var id in Game.minerData) {
            if (!Game.minerData.hasOwnProperty(id)) continue;
            var d = Game.minerData[id];
            if (d.bossExclusive) continue;
            var entry = Game.miners.getEntry(id);
            var owned = entry ? entry.owned : 0;
            var duplicate = owned > 0;
            out.push({
                id: id,
                definition: d,
                owned: owned,
                unlocked: this.isUnlocked(id),
                unlockLevel: Math.max(1, Number(d.shopUnlockLevel) || 1),
                price: this.getPrice(id),
                xp: this.getXpReward(id, duplicate),
                free: id === "sporeWorker" && this.canClaimFree()
            });
        }
        out.sort(function (a, b) {
            var ra = rarityOrder.indexOf(a.definition.rarity.id), rb = rarityOrder.indexOf(b.definition.rarity.id);
            if (ra !== rb) return ra - rb;
            return (a.definition.shopRank || 1) - (b.definition.shopRank || 1);
        });
        return out;
    };

    instance.getByRarity = function (rarityId) {
        return this.getCatalog().filter(function (x) { return x.definition.rarity.id === rarityId; });
    };

    instance.buy = function (id) {
        var d = Game.minerData[id], e = Game.miners.getEntry(id);
        if (!d || d.bossExclusive || !e) return false;
        if (!this.isUnlocked(id)) {
            Game.notifyInfo("Miner locked", d.name + " unlocks at Commander Level " + (d.shopUnlockLevel || 1) + ".");
            return false;
        }
        if (id === "sporeWorker" && this.canClaimFree()) return this.claimFree();
        var duplicate = e.owned > 0;
        var price = this.getPrice(id);
        if (!Game.account.spend("mycoCoins", price)) {
            Game.notifyInfo("Not enough MycoCoins", "You need " + price + " MycoCoins.");
            return false;
        }
        Game.miners.unlock(id, 1);
        var xp = this.getXpReward(id, duplicate);
        Game.account.addXp(xp, "Purchased " + d.name, true);
        Game.account.recordStat("minersPurchased", 1);
        if (Game.quests && Game.quests.recordMinerPurchase) Game.quests.recordMinerPurchase();
        if (Game.economy && Game.economy.recordMarketTrade) Game.economy.recordMarketTrade("minerShopBuy", price, "Bought " + d.name);
        this.purchases += 1;
        if (Game.notifySuccess) Game.notifySuccess("Miner purchased", d.name + " joined your colony. +" + xp + " XP");
        return true;
    };

    return instance;
}());
