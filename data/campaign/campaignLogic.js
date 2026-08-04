Game.campaign = (function () {
    'use strict';

    var instance = {
        dataVersion: 1,
        activeChapterId: 'firstSpore',
        claimedRewards: {},
        selectedChoices: {},
        unlockedAt: {},
        journal: [],
        discovered: {}
    };

    function num(v, f) {
        var n = Number(v);
        return isFinite(n) ? n : f;
    }

    function chapterOrder() {
        return Game.campaignData.order || [];
    }

    function chapterById(id) {
        return Game.campaignData.chapters[id] || null;
    }

    function ensureJournalEntry(type, chapterId, title, text) {
        var key = type + ':' + chapterId;
        for (var i = 0; i < instance.journal.length; i++) if (instance.journal[i].key === key) return false;
        instance.journal.unshift({ key: key, type: type, chapterId: chapterId, title: title, text: text, at: Date.now() });
        instance.journal = instance.journal.slice(0, 40);
        return true;
    }

    function getPreviousChapter(id) {
        var order = chapterOrder();
        var index = order.indexOf(id);
        return index > 0 ? order[index - 1] : null;
    }

    function addReward(reward, source) {
        reward = reward || {};
        if (Game.account) {
            if (reward.xp) Game.account.addXp(reward.xp, source || 'Campaign', true);
            if (reward.mycoCoins) Game.account.add('mycoCoins', reward.mycoCoins);
            if (reward.bloomTokens) Game.account.add('bloomTokens', reward.bloomTokens);
            if (reward.worldBossTokens) Game.account.add('worldBossTokens', reward.worldBossTokens);
            if (reward.title) {
                Game.account.entries.unlockedAchievementTitles = Game.account.entries.unlockedAchievementTitles || [];
                if (Game.account.entries.unlockedAchievementTitles.indexOf(reward.title) < 0) Game.account.entries.unlockedAchievementTitles.push(reward.title);
            }
        }
    }

    instance.initialise = function () {
        this.activeChapterId = 'firstSpore';
        this.claimedRewards = {};
        this.selectedChoices = {};
        this.unlockedAt = { firstSpore: Date.now() };
        this.journal = [];
        this.discovered = { firstSpore: true };
        ensureJournalEntry('unlock', 'firstSpore', 'Chapter unlocked', 'The First Spore is now available.');
    };

    instance.save = function (data) {
        data.campaign = {
            version: this.dataVersion,
            activeChapterId: this.activeChapterId,
            claimedRewards: this.claimedRewards,
            selectedChoices: this.selectedChoices,
            unlockedAt: this.unlockedAt,
            journal: this.journal,
            discovered: this.discovered
        };
    };

    instance.load = function (data) {
        if (!data || !data.campaign) return;
        var saved = data.campaign;
        this.activeChapterId = chapterById(saved.activeChapterId) ? saved.activeChapterId : 'firstSpore';
        this.claimedRewards = saved.claimedRewards || {};
        this.selectedChoices = saved.selectedChoices || {};
        this.unlockedAt = saved.unlockedAt || { firstSpore: Date.now() };
        this.journal = Array.isArray(saved.journal) ? saved.journal.slice(0, 40) : [];
        this.discovered = saved.discovered || {};
        this.discovered.firstSpore = true;
        if (!this.unlockedAt.firstSpore) this.unlockedAt.firstSpore = Date.now();
    };

    instance.getChapter = function (id) { return chapterById(id); };
    instance.getActiveChapter = function () { return this.getChapter(this.activeChapterId) || this.getChapter('firstSpore'); };
    instance.getChoice = function (chapterId) { return this.selectedChoices[chapterId] || null; };
    instance.isRewardClaimed = function (chapterId) { return !!this.claimedRewards[chapterId]; };

    instance.isUnlocked = function (id) {
        var chapter = this.getChapter(id);
        if (!chapter) return false;
        var unlock = chapter.unlock || {};
        if (unlock.previous && !this.isRewardClaimed(unlock.previous)) return false;
        if (unlock.commanderLevel && Game.account && Game.account.getLevelInfo().level < unlock.commanderLevel) return false;
        if (unlock.planetUnlocked && (!Game.planets || !Game.planets.isUnlocked(unlock.planetUnlocked))) return false;
        if (unlock.planetCompleted && (!Game.planets || !Game.planets.isCompleted(unlock.planetCompleted))) return false;
        return true;
    };

    instance.ensureUnlocks = function () {
        var order = chapterOrder();
        for (var i = 0; i < order.length; i++) {
            var id = order[i];
            if (this.isUnlocked(id) && !this.unlockedAt[id]) {
                this.unlockedAt[id] = Date.now();
                this.discovered[id] = true;
                if (!this.activeChapterId || !this.isUnlocked(this.activeChapterId)) this.activeChapterId = id;
                var chapter = this.getChapter(id);
                ensureJournalEntry('unlock', id, 'Chapter unlocked', chapter.name + ' is now available.');
                if (Game.notifySuccess) Game.notifySuccess('Campaign updated', chapter.name + ' has been unlocked.');
            }
        }
    };

    instance.getMetric = function (mission) {
        var summary = Game.miners && Game.miners.getColonySummary ? Game.miners.getColonySummary() : { power: 0, species: 0, specimens: 0 };
        switch (mission.type) {
            case 'species': return summary.species || 0;
            case 'specimens': return summary.specimens || 0;
            case 'colonyPower': return summary.power || 0;
            case 'minersPurchased': return Game.account ? Game.account.getStat('minersPurchased') : 0;
            case 'questsClaimed': return Game.account ? Game.account.getStat('questsClaimed') : 0;
            case 'planetProgress': return Game.planets ? Game.planets.getProgress(mission.planetId) : 0;
            case 'planetCompleted': return Game.planets && Game.planets.isCompleted(mission.planetId) ? 1 : 0;
            case 'planetUnlocked': return Game.planets && Game.planets.isUnlocked(mission.planetId) ? 1 : 0;
            case 'artifacts': return Game.artifacts && Game.artifacts.getOwnedCount ? Game.artifacts.getOwnedCount() : 0;
            case 'research': return Game.research && Game.research.getPurchasedCount ? Game.research.getPurchasedCount() : 0;
            case 'healthRestored': return Game.mycoAchievements && Game.mycoAchievements.customStats ? (Game.mycoAchievements.customStats.healthRestored || 0) : 0;
            case 'guildCreated': return Game.guild && Game.guild.created ? 1 : 0;
            case 'guildContribution': return Game.guild ? (Game.guild.contributionPoints || Game.guild.lifetimeContribution || 0) : 0;
            case 'worldBossAttacks': return Game.account ? Game.account.getStat('worldBossAttacks') : 0;
            case 'ascensions': return Game.ascension ? (Game.ascension.ascensions || 0) : 0;
            default: return 0;
        }
    };

    instance.getMissionState = function (mission) {
        var value = this.getMetric(mission);
        var target = Math.max(1, num(mission.target, 1));
        return {
            id: mission.id,
            value: value,
            target: target,
            complete: value >= target,
            percent: Math.min(100, (value / target) * 100)
        };
    };

    instance.getChapterState = function (id) {
        var chapter = this.getChapter(id);
        if (!chapter) return null;
        var missions = [];
        var allComplete = true;
        for (var i = 0; i < chapter.missions.length; i++) {
            var missionState = this.getMissionState(chapter.missions[i]);
            missions.push(missionState);
            if (!missionState.complete) allComplete = false;
        }
        var unlocked = this.isUnlocked(id);
        return {
            id: id,
            chapter: chapter,
            unlocked: unlocked,
            active: this.activeChapterId === id,
            rewardClaimed: this.isRewardClaimed(id),
            choiceId: this.getChoice(id),
            missions: missions,
            complete: allComplete,
            unlockedAt: this.unlockedAt[id] || 0
        };
    };

    instance.getAllStates = function () {
        var result = [];
        var order = chapterOrder();
        for (var i = 0; i < order.length; i++) result.push(this.getChapterState(order[i]));
        return result;
    };

    instance.getSummary = function () {
        var states = this.getAllStates();
        var unlocked = 0, completed = 0, claimed = 0;
        for (var i = 0; i < states.length; i++) {
            if (states[i].unlocked) unlocked += 1;
            if (states[i].complete) completed += 1;
            if (states[i].rewardClaimed) claimed += 1;
        }
        return {
            unlocked: unlocked,
            completed: completed,
            claimed: claimed,
            total: states.length,
            journalEntries: this.journal.length,
            percent: states.length ? (claimed / states.length) * 100 : 0
        };
    };

    instance.setActiveChapter = function (id) {
        if (!this.isUnlocked(id)) return false;
        this.activeChapterId = id;
        return true;
    };

    instance.selectChoice = function (chapterId, choiceId) {
        var chapter = this.getChapter(chapterId);
        if (!chapter || !this.getChapterState(chapterId).complete) return false;
        if (this.selectedChoices[chapterId]) return false;
        var selected = null;
        for (var i = 0; i < chapter.choices.length; i++) if (chapter.choices[i].id === choiceId) selected = chapter.choices[i];
        if (!selected) return false;
        this.selectedChoices[chapterId] = choiceId;
        addReward(selected.reward, chapter.name + ' choice');
        ensureJournalEntry('choice', chapterId, 'Path chosen', chapter.name + ': ' + selected.title + '.');
        if (Game.notifySuccess) Game.notifySuccess('Choice locked in', selected.title + ' rewards were added to your account.');
        return true;
    };

    instance.claimReward = function (chapterId) {
        var state = this.getChapterState(chapterId);
        if (!state || !state.complete || state.rewardClaimed) return false;
        if (state.chapter.choices && state.chapter.choices.length && !state.choiceId) {
            Game.notifyInfo('Choose a path', 'Select one of the chapter choices before claiming the campaign reward.');
            return false;
        }
        this.claimedRewards[chapterId] = true;
        addReward(state.chapter.rewards, state.chapter.name + ' complete');
        ensureJournalEntry('complete', chapterId, 'Chapter completed', state.chapter.name + ' was completed successfully.');
        if (Game.notifySuccess) Game.notifySuccess('Campaign chapter complete', state.chapter.name + ' rewards have been claimed.');
        var nextId = null;
        var order = chapterOrder();
        var index = order.indexOf(chapterId);
        if (index >= 0 && index < order.length - 1) nextId = order[index + 1];
        if (nextId && this.isUnlocked(nextId)) this.activeChapterId = nextId;
        return true;
    };

    instance.update = function () {
        this.ensureUnlocks();
        var states = this.getAllStates();
        for (var i = 0; i < states.length; i++) {
            if (states[i].complete) {
                this.discovered[states[i].id] = true;
            }
        }
        if (!this.isUnlocked(this.activeChapterId)) {
            for (var j = 0; j < states.length; j++) if (states[j].unlocked) { this.activeChapterId = states[j].id; break; }
        }
    };

    return instance;
}());
