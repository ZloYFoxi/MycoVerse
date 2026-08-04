Game.goldenEvents = (function () {
    "use strict";

    var instance = {
        dataVersion: 3,
        currentPlanet: "mycoPrime",
        nextMushroomAt: 0,
        nextGoldenHourAt: 0,
        goldenHourEndsAt: 0,
        goldenHourDurationMs: 0,
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
        this.goldenHourDurationMs = 0;
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
            goldenHourDurationMs: this.goldenHourDurationMs,
            mushroomsOpened: this.mushroomsOpened,
            goldenHoursActivated: this.goldenHoursActivated,
            lastReward: this.lastReward
        };
    };

    instance.load = function (data) {
        if (!data || !data.goldenEvents) return;
        var saved = data.goldenEvents;
        if (Game.planetData && Game.planetData.planets[saved.currentPlanet]) this.currentPlanet = saved.currentPlanet;
        var savedVersion = Math.max(1, number(saved.version, 1));
        var current = now();
        this.nextMushroomAt = Math.max(0, number(saved.nextMushroomAt, this.nextMushroomAt));
        this.nextGoldenHourAt = Math.max(0, number(saved.nextGoldenHourAt, this.nextGoldenHourAt));
        this.goldenHourEndsAt = Math.max(0, number(saved.goldenHourEndsAt, 0));
        this.goldenHourDurationMs = Math.max(0, number(saved.goldenHourDurationMs, 0));

        // Alpha 0.10.1 balance migration: old short testing timers must not survive.
        if (savedVersion < 2) {
            this.nextMushroomAt = current + Game.goldenEventData.mushroomCooldown;
            this.nextGoldenHourAt = current + Game.goldenEventData.goldenHourCooldown;
            this.goldenHourEndsAt = 0;
            this.goldenHourDurationMs = 0;
        }
        if (this.goldenHourEndsAt > now() && this.goldenHourDurationMs <= 0) {
            this.goldenHourDurationMs = Game.goldenEventData.goldenHourMinDuration;
        }
        this.mushroomsOpened = Math.max(0, number(saved.mushroomsOpened, 0));
        this.goldenHoursActivated = Math.max(0, number(saved.goldenHoursActivated, 0));
        this.lastReward = saved.lastReward || null;
    };

    instance.getPlanet = function () {
        if (Game.planets && Game.planets.getActivePlanet) {
            var active = Game.planets.getActivePlanet();
            this.currentPlanet = active.id;
            return active;
        }
        return Game.planetData.planets.mycoPrime;
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

    instance.getGoldenHourDurationMs = function () {
        return this.goldenHourDurationMs > 0 ?
            this.goldenHourDurationMs :
            Game.goldenEventData.goldenHourMinDuration;
    };

    instance.rollGoldenHourDuration = function () {
        var minMinutes = Math.round(Game.goldenEventData.goldenHourMinDuration / 60000);
        var maxMinutes = Math.round(Game.goldenEventData.goldenHourMaxDuration / 60000);
        var rolledMinutes = minMinutes + Math.floor(Math.random() * (maxMinutes - minMinutes + 1));
        return rolledMinutes * 60 * 1000;
    };

    instance.activateGoldenHour = function () {
        if (!this.isGoldenHourReady()) return false;
        var current = now();
        this.goldenHourDurationMs = this.rollGoldenHourDuration();
        this.goldenHourEndsAt = current + this.goldenHourDurationMs;
        this.nextGoldenHourAt = current + Game.goldenEventData.goldenHourCooldown;
        this.goldenHoursActivated += 1;
        Game.notifySuccess(
            "Golden Hour activated",
            "All fungal miners produce x" + Game.goldenEventData.goldenHourMultiplier +
            " resources for " + Math.round(this.goldenHourDurationMs / 60000) + " minutes."
        );
        return true;
    };

    instance.rollDrop = function () {
        var planet = this.getPlanet();
        var drops = planet.drops || [];
        var total = 0;
        for (var i = 0; i < drops.length; i++) total += Math.max(0, number(drops[i].weight, 0));
        if (total <= 0) return null;
        var roll = Math.random() * total;
        for (var j = 0; j < drops.length; j++) {
            roll -= Math.max(0, number(drops[j].weight, 0));
            if (roll <= 0) return drops[j];
        }
        return drops[drops.length - 1] || null;
    };

    instance.openMushroom = function () {
        if (!this.isMushroomReady()) return null;
        var drop = this.rollDrop();
        if (!drop || !Game.minerData[drop.minerId]) return null;

        var minerId = drop.minerId;
        var entry = Game.miners.getEntry(minerId);
        var wasDiscovered = entry && entry.owned > 0;
        Game.miners.unlock(minerId, 1);

        this.mushroomsOpened += 1;
        this.nextMushroomAt = now() + Game.goldenEventData.mushroomCooldown;
        this.lastReward = {
            minerId: minerId,
            minerName: Game.minerData[minerId].name,
            rarityId: Game.minerData[minerId].rarity.id,
            rarityName: Game.minerData[minerId].rarity.name,
            planetId: this.getPlanet().id,
            openedAt: now(),
            duplicate: wasDiscovered
        };

        Game.notifySuccess("Golden Mushroom opened",
            this.lastReward.minerName + " (" + this.lastReward.rarityName + ") from " +
            this.getPlanet().name + (wasDiscovered ? " joined as another specimen." : " has been discovered!"));
        return this.lastReward;
    };

    return instance;
}());
