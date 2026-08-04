Game.market = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        offers: [],
        history: [],
        lastRefresh: 0,
        refreshInterval: 6 * 60 * 60 * 1000,
        nextOfferId: 1
    };

    function num(value, fallback) {
        var n = Number(value);
        return isFinite(n) ? n : fallback;
    }

    function minerPrice(definition) {
        var base = Math.max(20, num(definition.unlockCost, 100) * 0.45 + num(definition.upgradeBaseCost, 10) * 3);
        return Math.floor(base * Math.max(1, definition.rarity.incomeMultiplier));
    }

    function artifactPrice(artifact) {
        var rarity = Game.artifactData.rarities[artifact.rarity];
        var mult = rarity ? rarity.multiplier : 1;
        return Math.floor(450 * mult + (artifact.bonus && artifact.bonus.percent ? artifact.bonus.percent * 18 : 0));
    }

    function shuffle(array) {
        var copy = array.slice();
        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    instance.initialise = function () {
        this.offers = [];
        this.history = [];
        this.lastRefresh = 0;
        this.nextOfferId = 1;
        this.ensureOffers();
    };

    instance.save = function (data) {
        data.market = {
            version: this.dataVersion,
            offers: this.offers,
            history: this.history.slice(-25),
            lastRefresh: this.lastRefresh,
            nextOfferId: this.nextOfferId
        };
    };

    instance.load = function (data) {
        if (data && data.market) {
            this.offers = Array.isArray(data.market.offers) ? data.market.offers : [];
            this.history = Array.isArray(data.market.history) ? data.market.history.slice(-25) : [];
            this.lastRefresh = num(data.market.lastRefresh, 0);
            this.nextOfferId = Math.max(1, Math.floor(num(data.market.nextOfferId, 1)));
        }
        this.ensureOffers();
    };

    instance.createOfferId = function () {
        return "offer_" + (this.nextOfferId++);
    };

    instance.generateOffers = function () {
        var offers = [];
        var miners = [];
        var minerIds = [];
        for (var id in Game.minerData) if (Game.minerData.hasOwnProperty(id) && !Game.minerData[id].bossExclusive) minerIds.push(id);
        minerIds = shuffle(minerIds).slice(0, 5);
        for (var i = 0; i < minerIds.length; i++) {
            var miner = Game.minerData[minerIds[i]];
            offers.push({
                id: this.createOfferId(),
                itemType: "miner",
                itemId: minerIds[i],
                title: miner.name,
                rarity: miner.rarity.name,
                description: miner.description,
                price: Game.economy && Game.economy.getMarketPrice ? Game.economy.getMarketPrice('miner', minerIds[i]) : minerPrice(miner),
                currency: "mycoCoins"
            });
        }

        var artifactIds = shuffle(Game.artifactData.order).slice(0, 3);
        for (var j = 0; j < artifactIds.length; j++) {
            var artifact = Game.artifactData.entries[artifactIds[j]];
            offers.push({
                id: this.createOfferId(),
                itemType: "artifact",
                itemId: artifactIds[j],
                title: artifact.name,
                rarity: Game.artifactData.rarities[artifact.rarity].name,
                description: artifact.description,
                price: Game.economy && Game.economy.getMarketPrice ? Game.economy.getMarketPrice('artifact', artifactIds[j]) : artifactPrice(artifact),
                currency: "mycoCoins"
            });
        }
        this.offers = offers;
        this.lastRefresh = Date.now();
        return offers;
    };

    instance.ensureOffers = function () {
        if (!this.offers.length || (Date.now() - this.lastRefresh) >= this.refreshInterval) {
            this.generateOffers();
        }
        return this.offers;
    };

    instance.getOffers = function () {
        return this.ensureOffers().slice();
    };

    instance.getRefreshRemaining = function () {
        return Math.max(0, (this.lastRefresh + this.refreshInterval) - Date.now());
    };

    instance.refreshNow = function () {
        var cost = 60;
        if (!Game.account || !Game.account.spend("mycoCoins", cost)) {
            Game.notifyInfo("Not enough MycoCoins", "Refreshing the marketplace costs " + cost + " MycoCoins.");
            return false;
        }
        this.generateOffers();
        Game.notifySuccess("Marketplace refreshed", "New offers have reached your colony.");
        return true;
    };

    instance.buyOffer = function (offerId) {
        var offer = null;
        var index = -1;
        for (var i = 0; i < this.offers.length; i++) {
            if (this.offers[i].id === offerId) { offer = this.offers[i]; index = i; break; }
        }
        if (!offer) return false;
        if (!Game.account || !Game.account.spend(offer.currency, offer.price)) {
            Game.notifyInfo("Insufficient funds", "You need more " + offer.currency + " to buy this item.");
            return false;
        }
        if (offer.itemType === "miner") {
            Game.miners.unlock(offer.itemId, 1);
        } else if (offer.itemType === "artifact") {
            Game.artifacts.add(offer.itemId, 1);
        }
        this.history.unshift({ type: "buy", title: offer.title, price: offer.price, at: Date.now() });
        if (Game.economy && Game.economy.recordMarketTrade) Game.economy.recordMarketTrade('buy', offer.price, offer.title);
        this.history = this.history.slice(0, 25);
        this.offers.splice(index, 1);
        Game.notifySuccess("Purchase completed", offer.title + " joined your collection.");
        return true;
    };

    instance.getSellPrice = function (minerId) {
        var entry = Game.miners.getEntry(minerId);
        if (!entry || entry.owned <= 1) return 0;
        if (Game.economy && Game.economy.getMinerSellPrice) return Game.economy.getMinerSellPrice(minerId);
        var base = Math.max(10, minerPrice(entry.definition) * 0.35);
        return Math.floor(base * (1 + Math.max(0, entry.level - 1) * 0.08));
    };

    instance.sellMiner = function (minerId) {
        var entry = Game.miners.getEntry(minerId);
        if (!entry || entry.owned <= 1) {
            Game.notifyInfo("No spare specimens", "You can only sell duplicate miners.");
            return false;
        }
        var price = this.getSellPrice(minerId);
        entry.owned -= 1;
        Game.account.add("mycoCoins", price);
        this.history.unshift({ type: "sell", title: entry.definition.name, price: price, at: Date.now() });
        if (Game.economy && Game.economy.recordMarketTrade) Game.economy.recordMarketTrade('sell', price, entry.definition.name);
        this.history = this.history.slice(0, 25);
        Game.notifySuccess("Sale complete", "Sold one " + entry.definition.name + " for " + price + " MycoCoins.");
        return true;
    };

    instance.update = function () {
        this.ensureOffers();
    };

    return instance;
}());
