Game.goldenEvents = (function () {
    'use strict';

    var instance = {
        dataVersion: 4,
        currentPlanet: 'mycoPrime',
        nextGoldenHourAt: 0,
        goldenHourEndsAt: 0,
        goldenHourDurationMs: 0,
        goldenHoursActivated: 0,
        nextMushroomAt: 0,
        mushroomSpawnedAt: 0,
        mushroomExpiresAt: 0,
        mushroomTargetPage: '',
        mushroomPosition: null,
        mushroomFound: false,
        mushroomNoticeSent: false,
        mushroomHintSent: false,
        mushroomWarningSent: false,
        mushroomsOpened: 0,
        lastReward: null
    };

    function now() { return Date.now(); }
    function number(value, fallback) { var n = Number(value); return isFinite(n) ? n : fallback; }
    function randomBetween(min, max) { return min + Math.floor(Math.random() * Math.max(1, max - min + 1)); }

    function randomGoldenDelay() {
        return randomBetween(Game.goldenEventData.goldenHourMinDelayMs, Game.goldenEventData.goldenHourMaxDelayMs);
    }

    function randomMushroomDelay() {
        return randomBetween(Game.goldenEventData.mushroomMinDelayMs, Game.goldenEventData.mushroomMaxDelayMs);
    }

    function randomPosition() {
        var zones = [
            { top: 16, left: 10 }, { top: 18, left: 78 },
            { top: 42, left: 8 }, { top: 45, left: 84 },
            { top: 70, left: 12 }, { top: 72, left: 80 },
            { top: 30, left: 48 }, { top: 64, left: 50 }
        ];
        var zone = zones[Math.floor(Math.random() * zones.length)];
        return { top: zone.top + randomBetween(-3, 3), left: zone.left + randomBetween(-3, 3) };
    }

    instance.initialise = function () {
        var current = now();
        this.currentPlanet = 'mycoPrime';
        this.nextGoldenHourAt = current + randomGoldenDelay();
        this.goldenHourEndsAt = 0;
        this.goldenHourDurationMs = 0;
        this.goldenHoursActivated = 0;
        this.nextMushroomAt = current + randomMushroomDelay();
        this.mushroomSpawnedAt = 0;
        this.mushroomExpiresAt = 0;
        this.mushroomTargetPage = '';
        this.mushroomPosition = null;
        this.mushroomFound = false;
        this.mushroomNoticeSent = false;
        this.mushroomHintSent = false;
        this.mushroomWarningSent = false;
        this.mushroomsOpened = 0;
        this.lastReward = null;
    };

    instance.save = function (data) {
        data.goldenEvents = {
            version: this.dataVersion,
            currentPlanet: this.currentPlanet,
            nextGoldenHourAt: this.nextGoldenHourAt,
            goldenHourEndsAt: this.goldenHourEndsAt,
            goldenHourDurationMs: this.goldenHourDurationMs,
            goldenHoursActivated: this.goldenHoursActivated,
            nextMushroomAt: this.nextMushroomAt,
            mushroomSpawnedAt: this.mushroomSpawnedAt,
            mushroomExpiresAt: this.mushroomExpiresAt,
            mushroomTargetPage: this.mushroomTargetPage,
            mushroomPosition: this.mushroomPosition,
            mushroomFound: this.mushroomFound,
            mushroomNoticeSent: this.mushroomNoticeSent,
            mushroomHintSent: this.mushroomHintSent,
            mushroomWarningSent: this.mushroomWarningSent,
            mushroomsOpened: this.mushroomsOpened,
            lastReward: this.lastReward
        };
    };

    instance.load = function (data) {
        if (!data || !data.goldenEvents) return;
        var saved = data.goldenEvents;
        var current = now();
        if (Game.planetData && Game.planetData.planets[saved.currentPlanet]) this.currentPlanet = saved.currentPlanet;
        this.goldenHourEndsAt = Math.max(0, number(saved.goldenHourEndsAt, 0));
        this.goldenHourDurationMs = Math.max(0, number(saved.goldenHourDurationMs, 0));
        this.goldenHoursActivated = Math.max(0, number(saved.goldenHoursActivated, 0));
        this.nextGoldenHourAt = Math.max(0, number(saved.nextGoldenHourAt, 0));
        if (!this.nextGoldenHourAt || this.nextGoldenHourAt < current - Game.goldenEventData.goldenHourCycleMs) this.nextGoldenHourAt = current + randomGoldenDelay();

        this.nextMushroomAt = Math.max(0, number(saved.nextMushroomAt, 0));
        this.mushroomSpawnedAt = Math.max(0, number(saved.mushroomSpawnedAt, 0));
        this.mushroomExpiresAt = Math.max(0, number(saved.mushroomExpiresAt, 0));
        this.mushroomTargetPage = String(saved.mushroomTargetPage || '');
        this.mushroomPosition = saved.mushroomPosition || null;
        this.mushroomFound = !!saved.mushroomFound;
        this.mushroomNoticeSent = !!saved.mushroomNoticeSent;
        this.mushroomHintSent = !!saved.mushroomHintSent;
        this.mushroomWarningSent = !!saved.mushroomWarningSent;
        this.mushroomsOpened = Math.max(0, number(saved.mushroomsOpened, 0));
        this.lastReward = saved.lastReward || null;

        // Migration from the old Golden Grove system.
        if (number(saved.version, 1) < 4) {
            this.nextGoldenHourAt = current + randomGoldenDelay();
            this.goldenHourEndsAt = saved.goldenHourEndsAt > current ? saved.goldenHourEndsAt : 0;
            this.nextMushroomAt = current + randomMushroomDelay();
            this.clearMushroomSearch(false);
        }
        if (!this.nextMushroomAt) this.nextMushroomAt = current + randomMushroomDelay();
        if (this.mushroomExpiresAt && current >= this.mushroomExpiresAt && !this.mushroomFound) this.clearMushroomSearch(true);
    };

    instance.getPlanet = function () {
        if (Game.planets && Game.planets.getActivePlanet) {
            var active = Game.planets.getActivePlanet();
            this.currentPlanet = active.id;
            return active;
        }
        return Game.planetData.planets.mycoPrime;
    };

    instance.rollGoldenHourDuration = function () {
        return randomBetween(Game.goldenEventData.goldenHourMinDuration, Game.goldenEventData.goldenHourMaxDuration);
    };

    instance.isGoldenHourActive = function () { return this.goldenHourEndsAt > now(); };
    instance.getProductionMultiplier = function () { return this.isGoldenHourActive() ? Game.goldenEventData.goldenHourMultiplier : 1; };
    instance.getGoldenHourDurationMs = function () { return this.goldenHourDurationMs || Game.goldenEventData.goldenHourMinDuration; };
    instance.getGoldenHourTimeRemaining = function () {
        return this.isGoldenHourActive() ? Math.max(0, (this.goldenHourEndsAt - now()) / 1000) : Math.max(0, (this.nextGoldenHourAt - now()) / 1000);
    };

    instance.activateGoldenHour = function (durationMs, adminTriggered) {
        var current = now();
        if (!adminTriggered && (this.isGoldenHourActive() || current < this.nextGoldenHourAt)) return false;
        this.goldenHourDurationMs = Math.max(60000, number(durationMs, this.rollGoldenHourDuration()));
        this.goldenHourEndsAt = current + this.goldenHourDurationMs;
        this.nextGoldenHourAt = current + randomGoldenDelay();
        this.goldenHoursActivated += 1;
        Game.notifySuccess('Golden Hour started', 'All miners produce x' + Game.goldenEventData.goldenHourMultiplier + ' resources for ' + Math.round(this.goldenHourDurationMs / 60000) + ' minutes.');
        return true;
    };

    instance.endGoldenHour = function () {
        this.goldenHourEndsAt = 0;
        this.goldenHourDurationMs = 0;
        if (this.nextGoldenHourAt <= now()) this.nextGoldenHourAt = now() + randomGoldenDelay();
    };

    instance.getUnlockedPageCandidates = function () {
        var candidates = [];
        if (Game.access && Game.access.getRules) {
            var rules = Game.access.getRules();
            for (var id in rules) {
                if (!rules.hasOwnProperty(id) || !Game.access.canUse(id)) continue;
                var pageId = rules[id].pageId;
                if (pageId && pageId !== 'adminPage' && pageId !== 'goldenMushroomPage' && $('#' + pageId).length) candidates.push(pageId);
            }
        }
        if ($('#uiTab').length) candidates.push('uiTab');
        var unique = [];
        for (var i = 0; i < candidates.length; i++) if (unique.indexOf(candidates[i]) < 0) unique.push(candidates[i]);
        return unique.length ? unique : ['accountPage'];
    };

    instance.spawnMushroom = function (forcedPage) {
        if (this.isMushroomSearchActive()) return false;
        var pages = this.getUnlockedPageCandidates();
        this.mushroomSpawnedAt = now();
        this.mushroomExpiresAt = this.mushroomSpawnedAt + Game.goldenEventData.mushroomSearchDurationMs;
        this.mushroomTargetPage = forcedPage && pages.indexOf(forcedPage) >= 0 ? forcedPage : pages[Math.floor(Math.random() * pages.length)];
        this.mushroomPosition = randomPosition();
        this.mushroomFound = false;
        this.mushroomNoticeSent = true;
        this.mushroomHintSent = false;
        this.mushroomWarningSent = false;
        Game.notifyInfo('Golden Mushroom appeared', 'A Golden Mushroom is hiding somewhere inside an unlocked system. Find it before it disappears!');
        return true;
    };

    instance.isMushroomSearchActive = function () {
        return !this.mushroomFound && this.mushroomSpawnedAt > 0 && this.mushroomExpiresAt > now();
    };

    instance.getMushroomSearchRemaining = function () { return Math.max(0, (this.mushroomExpiresAt - now()) / 1000); };
    instance.getMushroomTimeRemaining = function () {
        return this.isMushroomSearchActive() ? this.getMushroomSearchRemaining() : Math.max(0, (this.nextMushroomAt - now()) / 1000);
    };
    instance.isMushroomReady = function () { return this.isMushroomSearchActive() && this.mushroomFound; };

    instance.findMushroom = function () {
        if (!this.isMushroomSearchActive()) return false;
        this.mushroomFound = true;
        return true;
    };

    instance.clearMushroomSearch = function (expired) {
        this.mushroomSpawnedAt = 0;
        this.mushroomExpiresAt = 0;
        this.mushroomTargetPage = '';
        this.mushroomPosition = null;
        this.mushroomFound = false;
        this.mushroomNoticeSent = false;
        this.mushroomHintSent = false;
        this.mushroomWarningSent = false;
        this.nextMushroomAt = now() + randomMushroomDelay();
        if (expired && Game.notifyInfo) Game.notifyInfo('Golden Mushroom vanished', 'The hidden mushroom disappeared. Another one will grow later.');
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
        if (!this.mushroomFound || this.mushroomExpiresAt <= now()) return null;
        var drop = this.rollDrop();
        if (!drop || !Game.minerData[drop.minerId]) return null;
        var minerId = drop.minerId;
        var entry = Game.miners.getEntry(minerId);
        var duplicate = entry && entry.owned > 0;
        Game.miners.unlock(minerId, 1);
        if (Game.account) {
            var rarityXp = { common:20, rare:40, epic:80, legendary:150, mythic:250 };
            Game.account.addXp(rarityXp[Game.minerData[minerId].rarity.id] || 20, 'Golden Mushroom', true);
        }
        this.mushroomsOpened += 1;
        this.lastReward = {
            minerId: minerId,
            minerName: Game.minerData[minerId].name,
            rarityId: Game.minerData[minerId].rarity.id,
            rarityName: Game.minerData[minerId].rarity.name,
            planetId: this.getPlanet().id,
            openedAt: now(),
            duplicate: duplicate
        };
        Game.notifySuccess('Golden Mushroom opened', this.lastReward.minerName + ' (' + this.lastReward.rarityName + ')' + (duplicate ? ' joined as another specimen.' : ' has been discovered!'));
        this.clearMushroomSearch(false);
        return this.lastReward;
    };

    instance.update = function () {
        var current = now();
        if (!this.isGoldenHourActive() && current >= this.nextGoldenHourAt) this.activateGoldenHour(this.rollGoldenHourDuration(), false);
        if (!this.isGoldenHourActive() && this.goldenHourEndsAt > 0 && current >= this.goldenHourEndsAt) this.endGoldenHour();

        if (this.mushroomFound && this.mushroomExpiresAt > 0 && current >= this.mushroomExpiresAt) this.clearMushroomSearch(true);
        if (!this.isMushroomSearchActive() && !this.mushroomFound && current >= this.nextMushroomAt) this.spawnMushroom();
        if (this.isMushroomSearchActive()) {
            var elapsed = current - this.mushroomSpawnedAt;
            if (!this.mushroomHintSent && elapsed >= Game.goldenEventData.mushroomHintAtMs) {
                this.mushroomHintSent = true;
                Game.notifyInfo('Golden Mushroom hint', 'The Golden Mushroom is hiding inside an unlocked system.');
            }
            if (!this.mushroomWarningSent && elapsed >= Game.goldenEventData.mushroomWarningAtMs) {
                this.mushroomWarningSent = true;
                Game.notifyInfo('Golden Mushroom fading', 'Only a few minutes remain before the Golden Mushroom disappears!');
            }
            if (current >= this.mushroomExpiresAt) this.clearMushroomSearch(true);
        }
    };

    return instance;
}());
