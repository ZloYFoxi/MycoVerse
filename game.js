var Game = (function () {
    'use strict';

    var instance = {
        lastUpdate: Date.now(),
        lastSave: 0,
        activeNotifications: {},
        uiComponents: []
    };

    var logicSystems = [
        'resources','miners','laboratory','planets','goldenEvents','quests','artifacts','research','ascension','structures','worldCycle',
        'account','backend','market','minerShop','bosses','worldBoss','guild','campaign','mycoAchievements','unions','economy','settings'
    ];
    var uiSystems = [
        'minerUI','colonyUI','laboratoryUI','planetUI','goldenEventUI','questUI','artifactUI','researchUI','ascensionUI','structureUI',
        'worldCycleUI','accountUI','inventoryUI','marketUI','minerShopUI','bossUI','worldBossUI','guildUI','campaignUI','collectionUI',
        'unionUI','economyUI','frontendUI','designThemeUI','responsiveUI','accessUI'
    ];

    function call(name, method) {
        var target = instance[name];
        if (!target || typeof target[method] !== 'function') return;
        var args = Array.prototype.slice.call(arguments, 2);
        try { return target[method].apply(target, args); }
        catch (error) { console.error('[MycoVerse] ' + name + '.' + method + ' failed', error); }
    }

    instance.notifyInfo = function (title, message) { this.notify(title, message, 'info'); };
    instance.notifySuccess = function (title, message) { this.notify(title, message, 'success'); };
    instance.notify = function (title, message, type) {
        if (this.settings && this.settings.entries.notificationsEnabled === false) return;
        if (window.PNotify) new PNotify({ title:title, text:message, type:type || 'info', styling:'bootstrap3', delay:3200, addclass:'stack-bottomright' });
        else console.log(title + ': ' + message);
    };

    instance.initialise = function () {
        for (var i = 0; i < logicSystems.length; i++) call(logicSystems[i], 'initialise');
        this.load();
        for (var j = 0; j < uiSystems.length; j++) call(uiSystems[j], 'initialise');
        $('#versionLabel').text(typeof versionNumber !== 'undefined' ? versionNumber : 'MycoVerse');
        $('#loadScreen').addClass('hidden');
        var firstTab = $('#tabList li:not(.myco-access-locked) a[data-toggle="tab"]').first();
        if (firstTab.length) firstTab.tab('show');
        this.lastUpdate = Date.now();
        this.lastSave = Date.now();
        window.requestAnimationFrame(this.frame.bind(this));
    };

    instance.frame = function () {
        var now = Date.now();
        var delta = Math.min(10, Math.max(0, (now - this.lastUpdate) / 1000));
        this.lastUpdate = now;
        this.update(delta);
        window.requestAnimationFrame(this.frame.bind(this));
    };

    instance.update = function (delta) {
        // Miner incomes are defined per minute.
        if (this.miners && this.miners.getTotalIncome && !(this.bosses && this.bosses.activeBattle)) {
            var income = this.miners.getTotalIncome();
            for (var resourceId in income) if (income.hasOwnProperty(resourceId)) this.resources.addResource(resourceId, income[resourceId] * delta / 60);
        }
        for (var i = 0; i < logicSystems.length; i++) call(logicSystems[i], 'update', delta);
        for (var j = 0; j < uiSystems.length; j++) call(uiSystems[j], 'update', delta);
        if (nowOrZero() - this.lastSave >= (this.settings.entries.autoSaveInterval || 60000)) {
            this.save(true);
            this.lastSave = Date.now();
        }
    };

    function nowOrZero(){ return Date.now(); }

    instance.save = function (silent) {
        var data = { version: versionNumber, savedAt: Date.now() };
        for (var i = 0; i < logicSystems.length; i++) call(logicSystems[i], 'save', data);
        localStorage.setItem('save', JSON.stringify(data));
        if (!silent) this.notifySuccess('Game Saved', 'Your MycoVerse progress has been stored locally.');
        return data;
    };

    instance.load = function () {
        var raw = localStorage.getItem('save');
        if (!raw) return;
        try {
            var data = JSON.parse(raw);
            for (var i = 0; i < logicSystems.length; i++) call(logicSystems[i], 'load', data);
        } catch (error) {
            console.error('Could not load save', error);
            this.notifyInfo('Save warning', 'The existing save could not be read. Export a backup before continuing.');
        }
    };

    instance.export = function () {
        var raw = JSON.stringify(this.save(true));
        $('#impexpField').val(LZString.compressToBase64(raw));
    };

    instance.import = function () {
        var encoded = String($('#impexpField').val() || '').trim();
        if (!encoded) return;
        try {
            var raw = LZString.decompressFromBase64(encoded);
            JSON.parse(raw);
            localStorage.setItem('save', raw);
            window.location.reload();
        } catch (error) { this.notifyInfo('Import failed', 'This save code is not valid.'); }
    };

    instance.deleteSave = function () {
        if (prompt("Type DELETE to erase this save permanently.") === 'DELETE') {
            localStorage.removeItem('save');
            window.location.reload();
        }
    };

    instance.start = function () {
        if (window.PNotify) PNotify.prototype.options.styling = 'bootstrap3';
        this.initialise();
    };

    return instance;
}());

window.onload = function () { Game.start(); };
