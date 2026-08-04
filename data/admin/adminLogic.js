Game.admin = (function () {
    'use strict';

    var instance = {
        dataVersion: 1,
        unlocked: false,
        audit: [],
        snapshots: [],
        configKey: 'mycoverse_admin_config',
        stateKey: 'mycoverse_admin_state'
    };

    function number(value, fallback) {
        var n = Number(value);
        return isFinite(n) ? n : fallback;
    }

    function hash(text) {
        text = String(text || '') + '|MYCOVERSE_LOCAL_ADMIN';
        var h = 2166136261;
        for (var i = 0; i < text.length; i++) {
            h ^= text.charCodeAt(i);
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
        }
        return ('00000000' + (h >>> 0).toString(16)).slice(-8);
    }

    function readJson(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function clampInt(value, min, max) {
        return Math.max(min, Math.min(max, Math.floor(number(value, min))));
    }

    instance.initialise = function () {
        this.unlocked = false;
        var state = readJson(this.stateKey, {});
        this.audit = Array.isArray(state.audit) ? state.audit.slice(0, 100) : [];
        this.snapshots = Array.isArray(state.snapshots) ? state.snapshots.slice(0, 8) : [];
    };

    instance.save = function () {
        this.persistState();
    };

    instance.load = function () {
        var state = readJson(this.stateKey, {});
        this.audit = Array.isArray(state.audit) ? state.audit.slice(0, 100) : [];
        this.snapshots = Array.isArray(state.snapshots) ? state.snapshots.slice(0, 8) : [];
    };

    instance.update = function () {};

    instance.persistState = function () {
        writeJson(this.stateKey, { audit: this.audit.slice(0, 100), snapshots: this.snapshots.slice(0, 8) });
    };

    instance.isConfigured = function () {
        var config = readJson(this.configKey, {});
        return !!config.passHash;
    };

    instance.setup = function (passcode) {
        passcode = String(passcode || '');
        if (passcode.length < 4) return false;
        writeJson(this.configKey, { passHash: hash(passcode), createdAt: Date.now() });
        this.unlocked = true;
        this.log('Admin access configured', 'Local passcode created');
        return true;
    };

    instance.authenticate = function (passcode) {
        var config = readJson(this.configKey, {});
        if (!config.passHash || hash(passcode) !== config.passHash) return false;
        this.unlocked = true;
        this.log('Admin session unlocked', 'Local administrator authenticated');
        return true;
    };

    instance.lock = function () {
        this.unlocked = false;
        this.log('Admin session locked', 'Administrator left the panel');
    };

    instance.changePasscode = function (oldPasscode, newPasscode) {
        if (!this.authenticate(oldPasscode) || String(newPasscode || '').length < 4) return false;
        writeJson(this.configKey, { passHash: hash(newPasscode), createdAt: Date.now() });
        this.log('Admin passcode changed', 'Local administrator credential updated');
        return true;
    };

    instance.resetAccess = function () {
        localStorage.removeItem(this.configKey);
        this.unlocked = false;
        this.log('Admin access reset', 'Local passcode removed');
    };

    instance.log = function (action, detail) {
        this.audit.unshift({ at: Date.now(), action: action, detail: detail || '' });
        this.audit = this.audit.slice(0, 100);
        this.persistState();
    };

    instance.requireAccess = function () {
        if (this.unlocked) return true;
        if (Game.notifyInfo) Game.notifyInfo('Admin locked', 'Unlock the local admin panel first.');
        return false;
    };

    instance.createSnapshot = function (label) {
        if (!this.requireAccess()) return false;
        var data = Game.save(true);
        this.snapshots.unshift({ id: 'snap_' + Date.now(), label: String(label || 'Manual snapshot').slice(0, 40), at: Date.now(), data: data });
        this.snapshots = this.snapshots.slice(0, 8);
        this.persistState();
        this.log('Snapshot created', label || 'Manual snapshot');
        return true;
    };

    instance.restoreSnapshot = function (id) {
        if (!this.requireAccess()) return false;
        for (var i = 0; i < this.snapshots.length; i++) {
            if (this.snapshots[i].id === id) {
                localStorage.setItem('save', JSON.stringify(this.snapshots[i].data));
                this.log('Snapshot restored', this.snapshots[i].label);
                window.location.reload();
                return true;
            }
        }
        return false;
    };

    instance.deleteSnapshot = function (id) {
        if (!this.requireAccess()) return false;
        this.snapshots = this.snapshots.filter(function (snapshot) { return snapshot.id !== id; });
        this.persistState();
        this.log('Snapshot deleted', id);
        return true;
    };

    instance.setResource = function (resourceId, amount) {
        if (!this.requireAccess() || !Game.resources.entries[resourceId]) return false;
        Game.resources.entries[resourceId].current = Math.max(0, number(amount, 0));
        this.log('Resource changed', resourceId + ' = ' + Game.resources.entries[resourceId].current);
        return true;
    };

    instance.addResource = function (resourceId, amount) {
        if (!this.requireAccess() || !Game.resources.entries[resourceId]) return false;
        Game.resources.addResource(resourceId, number(amount, 0));
        this.log('Resource granted', resourceId + ' +' + number(amount, 0));
        return true;
    };

    instance.setCurrency = function (currency, amount) {
        if (!this.requireAccess() || !Game.account || !Game.account.entries.wallet) return false;
        Game.account.entries.wallet[currency] = Math.max(0, Math.floor(number(amount, 0)));
        this.log('Currency changed', currency + ' = ' + Game.account.entries.wallet[currency]);
        return true;
    };

    instance.addCurrency = function (currency, amount) {
        if (!this.requireAccess() || !Game.account) return false;
        Game.account.add(currency, Math.max(0, number(amount, 0)));
        this.log('Currency granted', currency + ' +' + number(amount, 0));
        return true;
    };

    instance.setExchangeConfig = function (forwardRate, reverseRate, dailyLimit) {
        if (!this.requireAccess() || !Game.exchange) return false;
        Game.exchange.setConfig({ sporesPerMycoCoin: forwardRate, sporesReturnedPerMycoCoin: reverseRate, dailyMycoCoinLimit: dailyLimit });
        this.log('Exchange configuration changed', Game.exchange.config.sporesPerMycoCoin + ' Spores/coin, ' + Game.exchange.config.sporesReturnedPerMycoCoin + ' Spores returned, daily limit ' + Game.exchange.config.dailyMycoCoinLimit);
        return true;
    };

    instance.resetExchangeDailyLimit = function () {
        if (!this.requireAccess() || !Game.exchange) return false;
        Game.exchange.resetDailyLimit();
        this.log('Exchange daily limit reset', 'MycoCoin creation counter returned to zero');
        return true;
    };

    instance.addCommanderXp = function (amount) {
        if (!this.requireAccess() || !Game.account) return false;
        Game.account.addXp(Math.max(0, Math.floor(number(amount, 0))), 'Admin grant', true);
        this.log('Commander XP granted', '+' + Math.floor(number(amount, 0)));
        return true;
    };

    instance.setCommanderLevel = function (level) {
        if (!this.requireAccess() || !Game.account) return false;
        level = clampInt(level, 1, 999);
        Game.account.entries.profileXp = Math.pow(level - 1, 2) * 120;
        Game.account.entries.lifetimeXp = Math.max(Game.account.entries.lifetimeXp || 0, Game.account.entries.profileXp);
        this.log('Commander level changed', 'Level ' + level);
        return true;
    };

    instance.updateMiner = function (minerId, owned, level, heal) {
        if (!this.requireAccess()) return false;
        var entry = Game.miners.getEntry(minerId);
        if (!entry) return false;
        var oldMax = Game.miners.getMaxHealth(minerId);
        entry.owned = clampInt(owned, 0, 999999);
        entry.level = entry.owned > 0 ? clampInt(level, 1, entry.definition.maxLevel || 999) : 0;
        var newMax = Game.miners.getMaxHealth(minerId);
        if (heal || entry.owned === 0) entry.currentHealth = newMax;
        else entry.currentHealth = Math.max(0, Math.min(newMax, entry.currentHealth + Math.max(0, newMax - oldMax)));
        this.log('Miner updated', entry.definition.name + ': owned ' + entry.owned + ', level ' + entry.level);
        return true;
    };

    instance.healAllMiners = function () {
        if (!this.requireAccess()) return false;
        var healed = Game.miners.healAll();
        this.log('All miners healed', Math.floor(healed) + ' HP restored');
        return healed;
    };

    instance.setPlanet = function (planetId, action, progress) {
        if (!this.requireAccess() || !Game.planetData.planets[planetId]) return false;
        if (action === 'unlock') Game.planets.unlocked[planetId] = true;
        if (action === 'progress') {
            Game.planets.unlocked[planetId] = true;
            Game.planets.progress[planetId] = Math.max(0, Math.min(100, number(progress, 0)));
        }
        if (action === 'complete') {
            Game.planets.unlocked[planetId] = true;
            Game.planets.progress[planetId] = 100;
            Game.planets.completed[planetId] = true;
            if (Game.bosses && Game.bosses.getBossForPlanet) {
                var boss = Game.bosses.getBossForPlanet(planetId);
                if (boss) Game.bosses.defeated[boss.id] = { defeatedAt: Date.now(), damage: boss.maxHealth };
            }
        }
        if (action === 'reset') {
            Game.planets.progress[planetId] = 0;
            delete Game.planets.completed[planetId];
            if (planetId !== 'mycoPrime') delete Game.planets.unlocked[planetId];
            if (Game.bosses && Game.bosses.getBossForPlanet) {
                var resetBoss = Game.bosses.getBossForPlanet(planetId);
                if (resetBoss) delete Game.bosses.defeated[resetBoss.id];
            }
            if (!Game.planets.unlocked[Game.planets.activePlanetId]) Game.planets.activePlanetId = 'mycoPrime';
        }
        this.log('Planet modified', Game.planetData.planets[planetId].name + ': ' + action);
        return true;
    };

    instance.activateGoldenHour = function (minutes) {
        if (!this.requireAccess()) return false;
        minutes = clampInt(minutes, 1, 1440);
        var started = Game.goldenEvents.activateGoldenHour(minutes * 60000, true);
        if (started) this.log('Golden Hour started', minutes + ' minutes');
        return started;
    };

    instance.endGoldenHour = function () {
        if (!this.requireAccess()) return false;
        Game.goldenEvents.endGoldenHour();
        this.log('Golden Hour ended', 'Event stopped manually');
        return true;
    };

    instance.makeMushroomReady = function () {
        if (!this.requireAccess()) return false;
        Game.goldenEvents.clearMushroomSearch(false);
        Game.goldenEvents.nextMushroomAt = Date.now();
        Game.goldenEvents.update();
        this.log('Golden Mushroom spawned', Game.goldenEvents.mushroomTargetPage || 'random unlocked system');
        return true;
    };

    instance.endMushroomSearch = function () {
        if (!this.requireAccess()) return false;
        Game.goldenEvents.clearMushroomSearch(false);
        this.log('Golden Mushroom search ended', 'Hidden event stopped manually');
        return true;
    };

    instance.resetDailyQuests = function () {
        if (!this.requireAccess()) return false;
        Game.quests.dailyKey = '';
        Game.quests.ensureDailyReset();
        this.log('Daily quests reset', 'Daily objectives and claims reset');
        return true;
    };

    instance.resetWorldBossAttempts = function () {
        if (!this.requireAccess()) return false;
        Game.worldBoss.attemptsUsed = 0;
        Game.worldBoss.attemptDate = new Date().toISOString().slice(0, 10);
        this.log('World Boss attempts reset', 'Daily attempts restored');
        return true;
    };


    instance.isTestMode = function () {
        return localStorage.getItem('mycoverse_test_mode') === '1';
    };

    instance.startNewPlayerTest = function () {
        if (!this.requireAccess()) return false;
        if (this.isTestMode()) {
            Game.notifyInfo('Test mode active', 'A new-player test session is already running.');
            return false;
        }
        var currentSave = localStorage.getItem('save');
        if (currentSave) localStorage.setItem('mycoverse_primary_save_backup', currentSave);
        else localStorage.removeItem('mycoverse_primary_save_backup');
        localStorage.setItem('mycoverse_test_mode', '1');
        localStorage.removeItem('save');
        this.log('New-player test started', 'Primary save backed up and a clean profile prepared');
        window.location.reload();
        return true;
    };

    instance.exitNewPlayerTest = function () {
        if (!this.requireAccess()) return false;
        if (!this.isTestMode()) return false;
        var backup = localStorage.getItem('mycoverse_primary_save_backup');
        if (backup) localStorage.setItem('save', backup);
        else localStorage.removeItem('save');
        localStorage.removeItem('mycoverse_primary_save_backup');
        localStorage.removeItem('mycoverse_test_mode');
        this.log('New-player test ended', 'Primary save restored');
        window.location.reload();
        return true;
    };

    instance.getDebugReport = function () {
        var levelInfo = Game.account && Game.account.getLevelInfo ? Game.account.getLevelInfo() : { level: 1, totalXp: 0 };
        var colony = Game.miners && Game.miners.getColonySummary ? Game.miners.getColonySummary() : { species: 0, specimens: 0, power: 0 };
        var activePlanet = Game.planets && Game.planets.getActivePlanet ? Game.planets.getActivePlanet() : null;
        var rules = Game.access && Game.access.getRules ? Game.access.getRules() : {};
        var unlocked = [];
        var locked = [];
        for (var id in rules) {
            if (!rules.hasOwnProperty(id)) continue;
            if (Game.access.canUse(id)) unlocked.push(id);
            else locked.push(id + '@' + rules[id].level);
        }
        var ownedMiners = [];
        if (Game.miners && Game.miners.getEntriesSorted) {
            var entries = Game.miners.getEntriesSorted();
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].owned > 0) ownedMiners.push(entries[i].id + ':' + entries[i].owned + ':L' + entries[i].level);
            }
        }
        var saveRaw = localStorage.getItem('save') || '';
        var saveData = null;
        try { saveData = saveRaw ? JSON.parse(saveRaw) : null; } catch (error) {}
        return {
            generatedAt: new Date().toISOString(),
            version: typeof versionNumber !== 'undefined' ? versionNumber : 'Unknown',
            commanderLevel: levelInfo.level,
            commanderXp: levelInfo.totalXp || levelInfo.score || 0,
            activePlanet: activePlanet ? activePlanet.name : 'Unknown',
            colonyPower: colony.power || 0,
            minerSpecies: colony.species || 0,
            minerSpecimens: colony.specimens || 0,
            unlockedSystems: unlocked,
            lockedSystems: locked,
            ownedMiners: ownedMiners,
            saveSizeBytes: saveRaw.length,
            lastSavedAt: saveData && saveData.savedAt ? new Date(saveData.savedAt).toISOString() : 'Unknown',
            testMode: this.isTestMode(),
            errorCount: Game.errorLog ? Game.errorLog.length : 0,
            errors: Game.errorLog ? Game.errorLog.slice(0, 20) : [],
            userAgent: navigator.userAgent,
            viewport: window.innerWidth + 'x' + window.innerHeight
        };
    };

    instance.runHealthChecks = function () {
        var checks = [];
        function add(name, ok, detail) { checks.push({ name: name, ok: !!ok, detail: detail || '' }); }
        add('Account system', !!(Game.account && Game.account.getLevelInfo), 'Profile and level API');
        add('Access control', !!(Game.access && Game.access.canUse && Game.access.open), 'Central level gate');
        add('Resources', !!(Game.resources && Game.resources.entries && Game.resources.entries.wood && Game.resources.entries.gem && Game.resources.entries.science), 'Spores, Gems and Science');
        add('Miner data', !!(Game.miners && Game.miners.getEntriesSorted && Game.miners.getEntriesSorted().length), 'Miner collection loaded');
        add('Planet data', !!(Game.planetData && Game.planetData.order && Game.planetData.order.length === 5), 'Five planet progression entries');
        add('Campaign', !!(Game.campaign && Game.campaign.getAllStates && Game.campaign.getAllStates().length), 'Story chapters loaded');
        add('Admin storage', typeof localStorage !== 'undefined', 'Browser storage available');
        add('Save parse', (function(){ var raw=localStorage.getItem('save'); if(!raw)return true; try{JSON.parse(raw);return true;}catch(e){return false;} }()), 'Current save is valid JSON');
        add('Level 1 gate matrix', (function(){
            if (!Game.access || !Game.access.getRules) return false;
            var level = Game.account.getLevelInfo().level;
            if (level !== 1) return true;
            var expected = { account:1, inventory:1, minerShop:1, miners:1, quests:1 };
            var rules=Game.access.getRules();
            for(var id in rules){ if(!rules.hasOwnProperty(id))continue; if(Game.access.canUse(id)!==!!expected[id])return false; }
            return true;
        }()), 'Only intended systems open at Commander Level 1');
        add('Runtime errors', !(Game.errorLog && Game.errorLog.length), (Game.errorLog && Game.errorLog.length) ? Game.errorLog.length + ' captured errors' : 'No captured errors');
        var passed = 0;
        for (var i = 0; i < checks.length; i++) if (checks[i].ok) passed += 1;
        return { checks: checks, passed: passed, total: checks.length, ok: passed === checks.length };
    };

    instance.copyDebugReport = function () {
        if (!this.requireAccess()) return false;
        var text = JSON.stringify(this.getDebugReport(), null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function(){ Game.notifySuccess('Debug report copied', 'The report is ready to paste.'); });
        } else {
            var area = document.createElement('textarea');
            area.value = text;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            document.body.removeChild(area);
            Game.notifySuccess('Debug report copied', 'The report is ready to paste.');
        }
        this.log('Debug report copied', 'Diagnostics exported to clipboard');
        return true;
    };

    instance.getDashboard = function () {
        var level = Game.account ? Game.account.getLevelInfo() : { level: 1, totalXp: 0 };
        var colony = Game.miners ? Game.miners.getColonySummary() : { species: 0, specimens: 0, power: 0 };
        return {
            level: level.level,
            xp: level.totalXp,
            species: colony.species || 0,
            specimens: colony.specimens || 0,
            power: colony.power || 0,
            activePlanet: Game.planets && Game.planets.getActivePlanet ? Game.planets.getActivePlanet().name : 'Unknown',
            saveSize: (localStorage.getItem('save') || '').length,
            configured: this.isConfigured(),
            unlocked: this.unlocked
        };
    };

    return instance;
}());
