Game.bosses = (function () {
    "use strict";

    var instance = {
        dataVersion: 2,
        defeated: {},
        selectedTeam: [],
        activeBattle: null,
        history: []
    };

    function num(value, fallback) { var n = Number(value); return isFinite(n) ? n : fallback; }
    function now() { return Date.now(); }

    instance.initialise = function () {
        this.defeated = {};
        this.selectedTeam = [];
        this.activeBattle = null;
        this.history = [];
        this.autoSelectTeam();
    };

    instance.save = function (data) {
        data.bosses = {
            version: this.dataVersion,
            defeated: this.defeated,
            selectedTeam: this.selectedTeam.slice(0, Game.bossData.teamSize),
            activeBattle: this.activeBattle,
            history: this.history.slice(-20)
        };
    };

    instance.load = function (data) {
        if (!data || !data.bosses) { this.autoSelectTeam(); return; }
        var saved = data.bosses;
        this.defeated = saved.defeated || {};
        this.selectedTeam = Array.isArray(saved.selectedTeam) ? saved.selectedTeam.filter(function (id) {
            var entry = Game.miners.getEntry(id); return entry && entry.owned > 0;
        }).slice(0, Game.bossData.teamSize) : [];
        this.activeBattle = saved.activeBattle || null;
        this.history = Array.isArray(saved.history) ? saved.history.slice(-20) : [];
        if (!this.selectedTeam.length) this.autoSelectTeam();
        this.update(0);
    };

    instance.getBoss = function (id) { return Game.bossData.entries[id] || null; };
    instance.getBossForPlanet = function (planetId) { return this.getBoss(Game.bossData.planetBosses[planetId]); };
    instance.isDefeated = function (bossId) { return !!this.defeated[bossId]; };
    instance.isPlanetBossDefeated = function (planetId) { var boss = this.getBossForPlanet(planetId); return !boss || this.isDefeated(boss.id); };

    instance.getMinerCombatPower = function (minerId) {
        var entry = Game.miners.getEntry(minerId);
        if (!entry || entry.owned <= 0 || Game.miners.getCurrentHealth(minerId) <= 0) return 0;
        var rarity = entry.definition.rarity.incomeMultiplier || 1;
        var mutation = Game.miners.getMutationPercent ? Game.miners.getMutationPercent(minerId) : 0;
        var healthFactor = 0.45 + Game.miners.getHealthRatio(minerId) * 0.55;
        var base = entry.level * rarity * Math.sqrt(entry.owned) * 2.8;
        return base * (1 + mutation / 100) * healthFactor;
    };

    instance.autoSelectTeam = function () {
        var candidates = [];
        if (Game.miners && Game.miners.getEntriesSorted) {
            var entries = Game.miners.getEntriesSorted();
            for (var i = 0; i < entries.length; i++) if (entries[i].owned > 0 && Game.miners.getCurrentHealth(entries[i].id) > 0) candidates.push({ id: entries[i].id, power: this.getMinerCombatPower(entries[i].id) });
        }
        candidates.sort(function (a, b) { return b.power - a.power; });
        this.selectedTeam = candidates.slice(0, Game.bossData.teamSize).map(function (item) { return item.id; });
        return this.selectedTeam;
    };

    instance.toggleTeamMember = function (minerId) {
        if (this.activeBattle) return false;
        var entry = Game.miners.getEntry(minerId);
        if (!entry || entry.owned <= 0 || Game.miners.getCurrentHealth(minerId) <= 0) return false;
        var index = this.selectedTeam.indexOf(minerId);
        if (index >= 0) { this.selectedTeam.splice(index, 1); return true; }
        if (this.selectedTeam.length >= Game.bossData.teamSize) { Game.notifyInfo("Team full", "A gate squad may contain up to " + Game.bossData.teamSize + " species."); return false; }
        this.selectedTeam.push(minerId); return true;
    };

    instance.getBattleTeamPower = function (team) {
        var total = 0;
        for (var i = 0; i < team.length; i++) total += this.getMinerCombatPower(team[i]);
        var artifactMultiplier = Game.artifacts && Game.artifacts.getBonuses ? 1 + (Game.artifacts.getBonuses().global || 0) / 200 : 1;
        var legacyMultiplier = Game.ascension && Game.ascension.getProductionMultiplier ? Game.ascension.getProductionMultiplier("wood") : 1;
        var unionMultiplier = Game.unions && Game.unions.getBossMultiplier ? Game.unions.getBossMultiplier(team) : 1;
        return total * artifactMultiplier * Math.sqrt(Math.max(1, legacyMultiplier)) * unionMultiplier;
    };
    instance.getTeamPower = function () { return this.getBattleTeamPower(this.selectedTeam); };
    instance.getTeamHealth = function (team) { return Game.miners.getTotalHealth(team || this.selectedTeam); };

    instance.getPhase = function (boss, health) {
        var ratio = Math.max(0, health) / boss.maxHealth;
        var phase = { name: "Opening Assault", damageMultiplier: 1, attackMultiplier: 1 };
        for (var i = 0; i < boss.phases.length; i++) if (ratio <= boss.phases[i].at) phase = boss.phases[i];
        return phase;
    };

    instance.canStart = function (bossId) {
        var boss = this.getBoss(bossId);
        if (!boss || this.activeBattle || this.isDefeated(bossId)) return false;
        if (!Game.planets.isGateReady(boss.planetId)) return false;
        return this.selectedTeam.length > 0 && this.getTeamPower() > 0 && this.getTeamHealth().current > 0;
    };

    instance.startBattle = function (bossId) {
        if (!this.canStart(bossId)) {
            Game.notifyInfo("Battle unavailable", "Reach 100% planetary progress and assemble a healthy living team.");
            return false;
        }
        var boss = this.getBoss(bossId), t = now();
        this.activeBattle = {
            bossId: bossId,
            startedAt: t,
            endsAt: t + boss.durationSeconds * 1000,
            lastTickAt: t,
            health: boss.maxHealth,
            totalDamage: 0,
            totalDamageTaken: 0,
            team: this.selectedTeam.slice(0, Game.bossData.teamSize)
        };
        Game.notifySuccess("Gate battle started", "Your squad has engaged " + boss.name + ".");
        return true;
    };

    instance.cancelBattle = function () {
        if (!this.activeBattle) return false;
        var boss = this.getBoss(this.activeBattle.bossId);
        this.history.unshift({ bossId: boss.id, result: "retreated", at: now() });
        this.activeBattle = null;
        Game.notifyInfo("Squad retreated", "Battle injuries remain until healed in the Laboratory.");
        return true;
    };

    instance.getLivingTeam = function () {
        if (!this.activeBattle) return [];
        return this.activeBattle.team.filter(function (id) { return Game.miners.getCurrentHealth(id) > 0; });
    };

    instance.applyBossDamage = function (boss, phase, seconds) {
        var living = this.getLivingTeam();
        if (!living.length) return 0;
        var attackMultiplier = phase.attackMultiplier || (2 - phase.damageMultiplier);
        var damage = boss.attackPower * attackMultiplier * seconds;
        var perMiner = damage / living.length;
        var dealt = 0;
        for (var i = 0; i < living.length; i++) dealt += Game.miners.damageMiner(living[i], perMiner);
        return dealt;
    };

    instance.getActiveSnapshot = function () {
        if (!this.activeBattle) return null;
        var boss = this.getBoss(this.activeBattle.bossId);
        if (!boss) return null;
        var phase = this.getPhase(boss, this.activeBattle.health);
        var health = this.getTeamHealth(this.activeBattle.team);
        return {
            boss: boss,
            health: Math.max(0, this.activeBattle.health),
            healthPercent: Math.max(0, this.activeBattle.health / boss.maxHealth * 100),
            remainingMs: Math.max(0, this.activeBattle.endsAt - now()),
            totalDamage: this.activeBattle.totalDamage,
            totalDamageTaken: this.activeBattle.totalDamageTaken || 0,
            phase: phase,
            teamPower: this.getBattleTeamPower(this.getLivingTeam()),
            teamHealth: health,
            livingCount: this.getLivingTeam().length
        };
    };

    instance.applyRewards = function (boss) {
        var reward = boss.reward;
        if (Game.account) { Game.account.add("mycoCoins", reward.mycoCoins || 0); Game.account.add("bloomTokens", reward.bloomTokens || 0); }
        if (reward.minerId && Game.miners.getEntry(reward.minerId)) Game.miners.unlock(reward.minerId, 1);
        if (reward.artifactId && Game.artifactData.entries[reward.artifactId]) Game.artifacts.add(reward.artifactId, 1);
        if (reward.title && Game.account) {
            if (!Game.account.entries.unlockedBossTitles) Game.account.entries.unlockedBossTitles = [];
            if (Game.account.entries.unlockedBossTitles.indexOf(reward.title) < 0) Game.account.entries.unlockedBossTitles.push(reward.title);
        }
        if (Game.planets) Game.planets.completePlanet(boss.planetId);
    };

    instance.completeVictory = function () {
        if (!this.activeBattle) return;
        var boss = this.getBoss(this.activeBattle.bossId);
        var finalHealth = this.getTeamHealth(this.activeBattle.team);
        this.defeated[boss.id] = { defeatedAt: now(), damage: this.activeBattle.totalDamage };
        if (Game.mycoAchievements && finalHealth.max > 0 && finalHealth.current / finalHealth.max <= 0.10) Game.mycoAchievements.setCustomStat("lastSporeVictory", 1);
        this.applyRewards(boss);
        if (Game.account) { Game.account.addXp(250 + ((boss.league || 1) * 100), "Gate boss victory", true); Game.account.recordStat("bossesDefeated", 1); }
        if (Game.quests && Game.quests.recordBossDefeat) Game.quests.recordBossDefeat();
        this.history.unshift({ bossId: boss.id, result: "victory", at: now(), damage: this.activeBattle.totalDamage });
        this.history = this.history.slice(0, 20);
        this.activeBattle = null;
        Game.notifySuccess("Passage opened", boss.name + " has fallen. The next planet is now accessible. Heal injured miners in the Laboratory.");
    };

    instance.completeDefeat = function () {
        if (!this.activeBattle) return;
        var boss = this.getBoss(this.activeBattle.bossId);
        this.history.unshift({ bossId: boss.id, result: "defeat", at: now(), damage: this.activeBattle.totalDamage });
        this.history = this.history.slice(0, 20);
        this.activeBattle = null;
        Game.notifyInfo("Squad defeated", boss.name + " survived. Your injured miners require treatment in the Laboratory.");
    };

    instance.update = function () {
        if (!this.activeBattle) return;
        var boss = this.getBoss(this.activeBattle.bossId);
        if (!boss) { this.activeBattle = null; return; }
        var t = now(), effectiveNow = Math.min(t, this.activeBattle.endsAt);
        var elapsed = Math.max(0, (effectiveNow - this.activeBattle.lastTickAt) / 1000);
        var remaining = elapsed;
        while (remaining > 0 && this.activeBattle.health > 0 && this.getLivingTeam().length > 0) {
            var step = Math.min(1, remaining);
            var phase = this.getPhase(boss, this.activeBattle.health);
            var teamPower = this.getBattleTeamPower(this.getLivingTeam());
            var damage = teamPower * (1 - boss.defense) * phase.damageMultiplier * step;
            this.activeBattle.health -= damage;
            this.activeBattle.totalDamage += damage;
            this.activeBattle.totalDamageTaken = (this.activeBattle.totalDamageTaken || 0) + this.applyBossDamage(boss, phase, step);
            remaining -= step;
        }
        this.activeBattle.lastTickAt = effectiveNow;
        if (this.activeBattle.health <= 0) this.completeVictory();
        else if (!this.getLivingTeam().length || t >= this.activeBattle.endsAt) this.completeDefeat();
    };

    instance.resetForAscension = function () {
        this.activeBattle = null;
        this.selectedTeam = [];
        this.autoSelectTeam();
    };

    return instance;
}());
