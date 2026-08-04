Game.goldenEvents = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        currentPlanet: "mycoPrime",
        nextMushroomAt: 0,
        nextGoldenHourAt: 0,
        goldenHourEndsAt: 0,
        mushroomsOpened: 0,
        goldenHoursActivated: 0,
        lastReward: null
    };

    function number(value, fallback) {
        var result = Number(value);
        return isFinite(result) ? result : fallback;
    }

    function now() {
        return new Date().getTime();
    }

    instance.initialise = function () {
        var current = now();
        this.currentPlanet = "mycoPrime";
        this.nextMushroomAt = current + Game.goldenEventData.firstMushroomDelay;
        this.nextGoldenHourAt = current + Game.goldenEventData.firstGoldenHourDelay;
        this.goldenHourEndsAt = 0;
        this.mushroomsOpened = 0;
        this.goldenHoursActivated = 0;
        this.lastReward = null;
    };

    instance.save = function (data) {
        data.goldenEvents = {
            version: this.dataVersion,
            currentPlanet: this.currentPlanet,
            nextMushroomAt: this.nextMushroomAt,
            nextGoldenHourAt: this.nextGoldenHourAt,
            goldenHourEndsAt: this.goldenHourEndsAt,
            mushroomsOpened: this.mushroomsOpened,
            goldenHoursActivated: this.goldenHoursActivated,
            lastReward: this.lastReward
        };
    };

    instance.load = function (data) {
        if (!data || !data.goldenEvents) return;
        var saved = data.goldenEvents;
        if (Game.goldenEventData.planets[saved.currentPlanet]) this.currentPlanet = saved.currentPlanet;
        this.nextMushroomAt = Math.max(0, number(saved.nextMushroomAt, this.nextMushroomAt));
        this.nextGoldenHourAt = Math.max(0, number(saved.nextGoldenHourAt, this.nextGoldenHourAt));
        this.goldenHourEndsAt = Math.max(0, number(saved.goldenHourEndsAt, 0));
        this.mushroomsOpened = Math.max(0, number(saved.mushroomsOpened, 0));
        this.goldenHoursActivated = Math.max(0, number(saved.goldenHoursActivated, 0));
        this.lastReward = saved.lastReward || null;
    };

    instance.getPlanet = function () {
        return Game.goldenEventData.planets[this.currentPlanet] ||
            Game.goldenEventData.planets.mycoPrime;
    };

    instance.isMushroomReady = function () {
        return now() >= this.nextMushroomAt;
    };

    instance.getMushroomTimeRemaining = function () {
        return Math.max(0, (this.nextMushroomAt - now()) / 1000);
    };

    instance.isGoldenHourActive = function () {
        return this.goldenHourEndsAt > now();
    };

    instance.isGoldenHourReady = function () {
        return !this.isGoldenHourActive() && now() >= this.nextGoldenHourAt;
    };

    instance.getGoldenHourTimeRemaining = function () {
        if (this.isGoldenHourActive()) return Math.max(0, (this.goldenHourEndsAt - now()) / 1000);
        return Math.max(0, (this.nextGoldenHourAt - now()) / 1000);
    };

    instance.getProductionMultiplier = function () {
        return this.isGoldenHourActive() ? Game.goldenEventData.goldenHourMultiplier : 1;
    };

    instance.activateGoldenHour = function () {
        if (!this.isGoldenHourReady()) return false;
        var current = now();
        this.goldenHourEndsAt = current + Game.goldenEventData.goldenHourDuration;
        this.nextGoldenHourAt = current + Game.goldenEventData.goldenHourCooldown;
        this.goldenHoursActivated += 1;
        Game.notifySuccess(
            "Golden Hour activated",
            "All fungal miners produce x" + Game.goldenEventData.goldenHourMultiplier +
            " resources for " + Math.round(Game.goldenEventData.goldenHourDuration / 60000) + " minutes."
        );
        return true;
    };

    instance.rollRarity = function () {
        var weights = this.getPlanet().rarityWeights;
        var total = 0;
        var id;
        for (id in weights) if (weights.hasOwnProperty(id)) total += Math.max(0, number(weights[id], 0));
        var roll = Math.random() * total;
        for (id in weights) {
            if (!weights.hasOwnProperty(id)) continue;
            roll -= Math.max(0, number(weights[id], 0));
            if (roll <= 0) return id;
        }
        return "common";
    };

    instance.getCandidates = function (rarityId) {
        var candidates = [];
        for (var id in Game.minerData) {
            if (!Game.minerData.hasOwnProperty(id)) continue;
            if (Game.minerData[id].rarity.id === rarityId) candidates.push(id);
        }
        return candidates;
    };

    instance.openMushroom = function () {
        if (!this.isMushroomReady()) return null;

        var rarityId = this.rollRarity();
        var candidates = this.getCandidates(rarityId);
        if (!candidates.length) {
            rarityId = "common";
            candidates = this.getCandidates(rarityId);
        }
        if (!candidates.length) return null;

        var minerId = candidates[Math.floor(Math.random() * candidates.length)];
        var entry = Game.miners.getEntry(minerId);
        var wasDiscovered = entry && entry.owned > 0;
        Game.miners.unlock(minerId, 1);

        this.mushroomsOpened += 1;
        this.nextMushroomAt = now() + Game.goldenEventData.mushroomCooldown;
        this.lastReward = {
            minerId: minerId,
            minerName: Game.minerData[minerId].name,
            rarityId: rarityId,
            rarityName: Game.minerData[minerId].rarity.name,
            openedAt: now(),
            duplicate: wasDiscovered
        };

        Game.notifySuccess(
            "Golden Mushroom opened",
            this.lastReward.minerName + " (" + this.lastReward.rarityName + ")" +
            (wasDiscovered ? " joined the colony as another specimen." : " has been discovered!")
        );
        return this.lastReward;
    };

    return instance;
}());
