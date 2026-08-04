Game.access = (function () {
    'use strict';

    var rules = {
        account:      { level: 1, tabId: 'accountTopTab',      pageId: 'accountPage',      label: 'Account' },
        inventory:    { level: 1, tabId: 'inventoryTopTab',    pageId: 'inventoryPage',    label: 'Inventory' },
        minerShop:    { level: 1, tabId: 'minerShopTopTab',    pageId: 'minerShopPage',    label: 'Miner Shop' },
        miners:       { level: 1, tabId: 'minersTopTab',       pageId: 'minersPage',       label: 'Miners' },
        quests:       { level: 1, tabId: 'questsTopTab',       pageId: 'questsPage',       label: 'Quests' },
        campaign:     { level: 2, tabId: 'campaignTopTab',     pageId: 'campaignPage',     label: 'Campaign' },
        achievements: { level: 2, tabId: 'collectionsTopTab',  pageId: 'collectionsPage',  label: 'Achievements' },
        colony:       { level: 3, tabId: 'colonyTopTab',       pageId: 'colonyPage',       label: 'Colony' },
        economy:      { level: 4, tabId: 'economyTopTab',      pageId: 'economyPage',      label: 'Economy' },
        laboratory:   { level: 5, tabId: 'laboratoryTopTab',   pageId: 'laboratoryPage',   label: 'Laboratory' },
        marketplace:  { level: 6, tabId: 'marketTopTab',       pageId: 'marketPage',       label: 'Marketplace' },
        structures:   { level: 7, tabId: 'structuresTopTab',   pageId: 'structuresPage',   label: 'Structures' },
        planets:      { level: 9, tabId: 'planetsTopTab',      pageId: 'planetsPage',      label: 'Planets' },
        artifacts:    { level: 11, tabId: 'artifactsTopTab',   pageId: 'artifactsPage',     label: 'Artifacts' },
        guild:        { level: 12, tabId: 'guildTopTab',       pageId: 'guildPage',         label: 'Guild' },
        research:     { level: 13, tabId: 'researchTopTab',    pageId: 'researchPage',      label: 'Research' },
        unions:       { level: 15, tabId: 'unionsTopTab',      pageId: 'unionsPage',        label: 'Miner Unions' },
        seasons:      { level: 20, tabId: 'worldCycleTopTab',  pageId: 'worldCyclePage',    label: 'Seasons' },
        worldBoss:    { level: 22, tabId: 'worldBossTopTab',   pageId: 'worldBossPage',     label: 'World Boss' },
        ascension:    { level: 25, tabId: 'ascensionTopTab',   pageId: 'ascensionPage',     label: 'Ascension' }
    };

    var instance = { dataVersion: 1 };

    function currentLevel() {
        if (!Game.account || !Game.account.getLevelInfo) return 1;
        var info = Game.account.getLevelInfo();
        return Math.max(1, Number(info && info.level) || 1);
    }

    function normaliseTarget(target) {
        return String(target || '').replace(/^#/, '');
    }

    instance.initialise = function () {};
    instance.save = function () {};
    instance.load = function () {};
    instance.update = function () {};

    instance.getRules = function () { return rules; };
    instance.getLevel = function () { return currentLevel(); };

    instance.getRule = function (systemId) {
        return rules[systemId] || null;
    };

    instance.getSystemByTarget = function (target) {
        target = normaliseTarget(target);
        for (var id in rules) {
            if (!rules.hasOwnProperty(id)) continue;
            if (rules[id].pageId === target || rules[id].tabId === target) return id;
        }
        return null;
    };

    instance.getRuleByTarget = function (target) {
        var id = this.getSystemByTarget(target);
        return id ? rules[id] : null;
    };

    instance.canUse = function (systemId) {
        var rule = rules[systemId];
        return !rule || currentLevel() >= rule.level;
    };

    instance.canOpenTarget = function (target) {
        var systemId = this.getSystemByTarget(target);
        return !systemId || this.canUse(systemId);
    };

    instance.getFirstAvailableTarget = function () {
        var preferred = ['miners', 'quests', 'account', 'inventory', 'minerShop'];
        for (var i = 0; i < preferred.length; i++) {
            var rule = rules[preferred[i]];
            if (rule && this.canUse(preferred[i]) && $('#' + rule.tabId).length) return rule.pageId;
        }
        var first = $('#tabList a[data-toggle="tab"]').first().attr('href');
        return normaliseTarget(first || 'accountPage');
    };

    instance.notifyLocked = function (target) {
        var rule = this.getRuleByTarget(target);
        if (!rule) return;
        Game.notifyInfo('System locked', rule.label + ' unlocks at Commander Level ' + rule.level + '. Your current level is ' + currentLevel() + '.');
    };

    instance.guardTarget = function (target, notify) {
        if (this.canOpenTarget(target)) return true;
        if (notify !== false) this.notifyLocked(target);
        return false;
    };

    instance.open = function (target, notify) {
        target = normaliseTarget(target);
        if (!this.guardTarget(target, notify)) return false;
        var $link = $('#tabList a[href="#' + target + '"]');
        if (!$link.length) return false;
        $link.tab('show');
        return true;
    };

    return instance;
}());
