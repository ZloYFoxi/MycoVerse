Game.account = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        entries: {}
    };

    function num(value, fallback) {
        var n = Number(value);
        return isFinite(n) ? n : fallback;
    }

    function generateId() {
        return "MV-" + Math.random().toString(36).substr(2, 4).toUpperCase() + "-" + Date.now().toString(36).substr(-5).toUpperCase();
    }

    function ensureDefaults() {
        if (!instance.entries.id) instance.entries.id = generateId();
        if (!instance.entries.name) instance.entries.name = "Wandering Spore";
        if (!instance.entries.title) instance.entries.title = "Keeper of the Grove";
        if (!instance.entries.avatar) instance.entries.avatar = "🍄";
        if (!instance.entries.createdAt) instance.entries.createdAt = Date.now();
        if (!instance.entries.wallet) instance.entries.wallet = { mycoCoins: 500, bloomTokens: 10 };
        instance.entries.wallet.mycoCoins = Math.max(0, Math.floor(num(instance.entries.wallet.mycoCoins, 500)));
        instance.entries.wallet.bloomTokens = Math.max(0, Math.floor(num(instance.entries.wallet.bloomTokens, 10)));
        instance.entries.lastDailyClaim = num(instance.entries.lastDailyClaim, 0);
        instance.entries.totalCoinsEarned = Math.max(0, num(instance.entries.totalCoinsEarned, instance.entries.wallet.mycoCoins));
        instance.entries.totalTokensEarned = Math.max(0, num(instance.entries.totalTokensEarned, instance.entries.wallet.bloomTokens));
    }

    instance.initialise = function () {
        this.entries = {
            id: generateId(),
            name: "Wandering Spore",
            title: "Keeper of the Grove",
            avatar: "🍄",
            createdAt: Date.now(),
            wallet: { mycoCoins: 500, bloomTokens: 10 },
            lastDailyClaim: 0,
            totalCoinsEarned: 500,
            totalTokensEarned: 10
        };
    };

    instance.save = function (data) {
        ensureDefaults();
        data.account = {
            version: this.dataVersion,
            entries: JSON.parse(JSON.stringify(this.entries))
        };
    };

    instance.load = function (data) {
        if (!data || !data.account || !data.account.entries) return;
        this.entries = data.account.entries || {};
        ensureDefaults();
    };

    instance.getBalance = function (currency) {
        ensureDefaults();
        return Math.max(0, Math.floor(num(this.entries.wallet[currency], 0)));
    };

    instance.add = function (currency, amount) {
        ensureDefaults();
        amount = Math.max(0, Math.floor(num(amount, 0)));
        if (!amount) return 0;
        this.entries.wallet[currency] = this.getBalance(currency) + amount;
        if (currency === "mycoCoins") this.entries.totalCoinsEarned += amount;
        if (currency === "bloomTokens") this.entries.totalTokensEarned += amount;
        return this.entries.wallet[currency];
    };

    instance.canAfford = function (currency, amount) {
        return this.getBalance(currency) >= Math.max(0, Math.floor(num(amount, 0)));
    };

    instance.spend = function (currency, amount) {
        amount = Math.max(0, Math.floor(num(amount, 0)));
        if (!this.canAfford(currency, amount)) return false;
        this.entries.wallet[currency] = this.getBalance(currency) - amount;
        return true;
    };

    instance.rename = function (name) {
        if (!name) return false;
        name = String(name).trim();
        if (!name) return false;
        this.entries.name = name.slice(0, 24);
        return true;
    };


    instance.getAvailableAvatars = function () {
        return ["🍄", "🌌", "🧬", "🔮", "🌿", "💎", "👑", "🪐"];
    };

    instance.setAvatar = function (avatar) {
        var allowed = this.getAvailableAvatars();
        if (allowed.indexOf(avatar) < 0) return false;
        this.entries.avatar = avatar;
        return true;
    };

    instance.getAvailableTitles = function () {
        var summary = this.getSummary();
        var titles = ["Keeper of the Grove"];
        if (summary.species >= 5) titles.push("Collector of Spores");
        if (summary.unlockedPlanets >= 3) titles.push("Planetary Mycologist");
        if (summary.power >= 250) titles.push("Mycelium Sovereign");
        if (summary.ascensions >= 1) titles.push("Ascended Network");
        if (Game.artifacts && Game.artifacts.getOwnedCount && Game.artifacts.getOwnedCount() >= 5) titles.push("Relic Weaver");
        return titles;
    };

    instance.setTitle = function (title) {
        if (this.getAvailableTitles().indexOf(title) < 0) return false;
        this.entries.title = title;
        return true;
    };

    instance.getLevelInfo = function () {
        var summary = this.getSummary();
        var score = Math.floor(summary.power * 4) + summary.species * 100 + summary.unlockedPlanets * 250 + summary.ascensions * 1000 + Math.floor(summary.totalCoinsEarned / 20);
        var level = Math.max(1, Math.floor(Math.sqrt(score / 120)) + 1);
        var currentFloor = Math.pow(level - 1, 2) * 120;
        var nextFloor = Math.pow(level, 2) * 120;
        return { level: level, score: score, current: Math.max(0, score - currentFloor), required: Math.max(1, nextFloor - currentFloor), percent: Math.min(100, Math.max(0, ((score - currentFloor) / Math.max(1, nextFloor - currentFloor)) * 100)) };
    };

    instance.getDailyReward = function () {
        var ascensions = Game.ascension ? Math.max(0, Game.ascension.ascensions || 0) : 0;
        var planets = Game.planets && Game.planets.getLeagueProgress ? Game.planets.getLeagueProgress().unlocked : 1;
        return {
            mycoCoins: 250 + (ascensions * 50) + (planets * 25),
            bloomTokens: 1 + Math.min(4, ascensions)
        };
    };

    instance.getDailyRemaining = function () {
        ensureDefaults();
        var next = this.entries.lastDailyClaim + (24 * 60 * 60 * 1000);
        return Math.max(0, next - Date.now());
    };

    instance.canClaimDaily = function () {
        return this.getDailyRemaining() <= 0;
    };

    instance.claimDaily = function () {
        if (!this.canClaimDaily()) return false;
        var reward = this.getDailyReward();
        this.add("mycoCoins", reward.mycoCoins);
        this.add("bloomTokens", reward.bloomTokens);
        this.entries.lastDailyClaim = Date.now();
        if (Game.notifySuccess) {
            Game.notifySuccess("Daily reward claimed", "+" + reward.mycoCoins + " MycoCoins and +" + reward.bloomTokens + " Bloom Token");
        }
        return reward;
    };

    instance.getSummary = function () {
        ensureDefaults();
        var colony = Game.miners && Game.miners.getColonySummary ? Game.miners.getColonySummary() : { power: 0, species: 0, specimens: 0 };
        return {
            id: this.entries.id,
            name: this.entries.name,
            title: this.entries.title,
            avatar: this.entries.avatar,
            createdAt: this.entries.createdAt,
            mycoCoins: this.getBalance("mycoCoins"),
            bloomTokens: this.getBalance("bloomTokens"),
            totalCoinsEarned: this.entries.totalCoinsEarned,
            species: colony.species || 0,
            power: colony.power || 0,
            ascensions: Game.ascension ? (Game.ascension.ascensions || 0) : 0,
            unlockedPlanets: Game.planets && Game.planets.getLeagueProgress ? Game.planets.getLeagueProgress().unlocked : 1
        };
    };

    return instance;
}());
