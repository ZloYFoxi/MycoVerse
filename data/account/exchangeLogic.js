Game.exchange = (function () {
    'use strict';

    var instance = {
        dataVersion: 1,
        config: {},
        state: {}
    };

    function number(value, fallback) {
        var n = Number(value);
        return isFinite(n) ? n : fallback;
    }

    function dayKey() {
        var d = new Date();
        return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
    }

    function defaultConfig() {
        return {
            sporesPerMycoCoin: 100,
            sporesReturnedPerMycoCoin: 80,
            dailyMycoCoinLimit: 1000,
            firstExchangeXp: 50,
            historyLimit: 20
        };
    }

    function defaultState() {
        return {
            day: dayKey(),
            mycoCoinsCreatedToday: 0,
            firstExchangeClaimed: false,
            totalSporesSpent: 0,
            totalSporesReceived: 0,
            totalMycoCoinsReceived: 0,
            totalMycoCoinsSpent: 0,
            history: []
        };
    }

    function ensureDefaults() {
        var defaults = defaultConfig();
        instance.config = instance.config || {};
        for (var key in defaults) {
            if (defaults.hasOwnProperty(key) && !isFinite(Number(instance.config[key]))) instance.config[key] = defaults[key];
        }
        instance.config.sporesPerMycoCoin = Math.max(1, Math.floor(number(instance.config.sporesPerMycoCoin, defaults.sporesPerMycoCoin)));
        instance.config.sporesReturnedPerMycoCoin = Math.max(1, Math.floor(number(instance.config.sporesReturnedPerMycoCoin, defaults.sporesReturnedPerMycoCoin)));
        instance.config.dailyMycoCoinLimit = Math.max(1, Math.floor(number(instance.config.dailyMycoCoinLimit, defaults.dailyMycoCoinLimit)));
        instance.config.firstExchangeXp = Math.max(0, Math.floor(number(instance.config.firstExchangeXp, defaults.firstExchangeXp)));
        instance.config.historyLimit = Math.max(5, Math.min(100, Math.floor(number(instance.config.historyLimit, defaults.historyLimit))));

        var stateDefaults = defaultState();
        instance.state = instance.state || {};
        for (var stateKey in stateDefaults) {
            if (!stateDefaults.hasOwnProperty(stateKey)) continue;
            if (instance.state[stateKey] === undefined || instance.state[stateKey] === null) instance.state[stateKey] = stateDefaults[stateKey];
        }
        instance.state.history = Array.isArray(instance.state.history) ? instance.state.history.slice(0, instance.config.historyLimit) : [];
        instance.state.mycoCoinsCreatedToday = Math.max(0, Math.floor(number(instance.state.mycoCoinsCreatedToday, 0)));
        instance.state.totalSporesSpent = Math.max(0, number(instance.state.totalSporesSpent, 0));
        instance.state.totalSporesReceived = Math.max(0, number(instance.state.totalSporesReceived, 0));
        instance.state.totalMycoCoinsReceived = Math.max(0, number(instance.state.totalMycoCoinsReceived, 0));
        instance.state.totalMycoCoinsSpent = Math.max(0, number(instance.state.totalMycoCoinsSpent, 0));
        instance.resetDailyIfNeeded();
    }

    instance.initialise = function () {
        this.config = defaultConfig();
        this.state = defaultState();
    };

    instance.save = function (data) {
        ensureDefaults();
        data.exchange = {
            version: this.dataVersion,
            config: JSON.parse(JSON.stringify(this.config)),
            state: JSON.parse(JSON.stringify(this.state))
        };
    };

    instance.load = function (data) {
        if (data && data.exchange) {
            this.config = data.exchange.config || defaultConfig();
            this.state = data.exchange.state || defaultState();
        }
        ensureDefaults();
    };

    instance.update = function () {
        this.resetDailyIfNeeded();
    };

    instance.resetDailyIfNeeded = function () {
        var current = dayKey();
        if (!this.state || this.state.day !== current) {
            if (!this.state) this.state = defaultState();
            this.state.day = current;
            this.state.mycoCoinsCreatedToday = 0;
        }
    };

    instance.getSporeBalance = function () {
        return Game.resources ? Math.max(0, number(Game.resources.getResource(RESOURCE.Wood), 0)) : 0;
    };

    instance.getCoinBalance = function () {
        return Game.account ? Game.account.getBalance('mycoCoins') : 0;
    };

    instance.getRemainingDailyCoinLimit = function () {
        this.resetDailyIfNeeded();
        return Math.max(0, this.config.dailyMycoCoinLimit - this.state.mycoCoinsCreatedToday);
    };

    instance.previewSporesToCoins = function (spores) {
        ensureDefaults();
        spores = Math.max(0, Math.floor(number(spores, 0)));
        var affordableCoins = Math.floor(spores / this.config.sporesPerMycoCoin);
        var coins = Math.min(affordableCoins, this.getRemainingDailyCoinLimit());
        return {
            input: spores,
            output: coins,
            spent: coins * this.config.sporesPerMycoCoin,
            unused: spores - coins * this.config.sporesPerMycoCoin,
            limited: affordableCoins > coins
        };
    };

    instance.previewCoinsToSpores = function (coins) {
        ensureDefaults();
        coins = Math.max(0, Math.floor(number(coins, 0)));
        return {
            input: coins,
            output: coins * this.config.sporesReturnedPerMycoCoin,
            spent: coins
        };
    };

    instance.record = function (direction, sourceAmount, resultAmount) {
        this.state.history.unshift({
            id: 'exchange_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            direction: direction,
            sourceAmount: sourceAmount,
            resultAmount: resultAmount,
            at: Date.now()
        });
        this.state.history = this.state.history.slice(0, this.config.historyLimit);
    };

    instance.grantFirstExchangeXp = function () {
        if (this.state.firstExchangeClaimed) return;
        this.state.firstExchangeClaimed = true;
        if (this.config.firstExchangeXp > 0 && Game.account) Game.account.addXp(this.config.firstExchangeXp, 'First currency exchange', true);
    };

    instance.convertSporesToCoins = function (spores) {
        ensureDefaults();
        var preview = this.previewSporesToCoins(spores);
        if (preview.output <= 0) {
            Game.notifyInfo('Exchange unavailable', this.getRemainingDailyCoinLimit() <= 0 ? 'The daily MycoCoin exchange limit has been reached.' : 'Enter enough Spores to receive at least 1 MycoCoin.');
            return false;
        }
        if (this.getSporeBalance() < preview.spent || !Game.resources.takeResource(RESOURCE.Wood, preview.spent)) {
            Game.notifyInfo('Not enough Spores', 'Your colony does not have enough Spores for this exchange.');
            return false;
        }
        Game.account.add('mycoCoins', preview.output);
        this.state.mycoCoinsCreatedToday += preview.output;
        this.state.totalSporesSpent += preview.spent;
        this.state.totalMycoCoinsReceived += preview.output;
        this.record('sporesToCoins', preview.spent, preview.output);
        this.grantFirstExchangeXp();
        Game.notifySuccess('Exchange completed', preview.spent + ' Spores were converted into ' + preview.output + ' MycoCoins.');
        return preview;
    };

    instance.convertCoinsToSpores = function (coins) {
        ensureDefaults();
        var preview = this.previewCoinsToSpores(coins);
        if (preview.input <= 0) {
            Game.notifyInfo('Exchange unavailable', 'Enter at least 1 MycoCoin.');
            return false;
        }
        if (!Game.account.spend('mycoCoins', preview.spent)) {
            Game.notifyInfo('Not enough MycoCoins', 'Your wallet does not have enough MycoCoins for this exchange.');
            return false;
        }
        Game.resources.addResource(RESOURCE.Wood, preview.output);
        this.state.totalMycoCoinsSpent += preview.spent;
        this.state.totalSporesReceived += preview.output;
        this.record('coinsToSpores', preview.spent, preview.output);
        this.grantFirstExchangeXp();
        Game.notifySuccess('Exchange completed', preview.spent + ' MycoCoins were converted into ' + preview.output + ' Spores.');
        return preview;
    };

    instance.setConfig = function (config) {
        config = config || {};
        if (config.sporesPerMycoCoin !== undefined) this.config.sporesPerMycoCoin = Math.max(1, Math.floor(number(config.sporesPerMycoCoin, this.config.sporesPerMycoCoin)));
        if (config.sporesReturnedPerMycoCoin !== undefined) this.config.sporesReturnedPerMycoCoin = Math.max(1, Math.floor(number(config.sporesReturnedPerMycoCoin, this.config.sporesReturnedPerMycoCoin)));
        if (config.dailyMycoCoinLimit !== undefined) this.config.dailyMycoCoinLimit = Math.max(1, Math.floor(number(config.dailyMycoCoinLimit, this.config.dailyMycoCoinLimit)));
        ensureDefaults();
        return true;
    };

    instance.resetDailyLimit = function () {
        this.state.day = dayKey();
        this.state.mycoCoinsCreatedToday = 0;
    };

    instance.getSummary = function () {
        ensureDefaults();
        return {
            spores: this.getSporeBalance(),
            mycoCoins: this.getCoinBalance(),
            remainingDailyCoins: this.getRemainingDailyCoinLimit(),
            dailyLimit: this.config.dailyMycoCoinLimit,
            sporesPerMycoCoin: this.config.sporesPerMycoCoin,
            sporesReturnedPerMycoCoin: this.config.sporesReturnedPerMycoCoin,
            history: this.state.history.slice(),
            firstExchangeXp: this.config.firstExchangeXp
        };
    };

    return instance;
}());
