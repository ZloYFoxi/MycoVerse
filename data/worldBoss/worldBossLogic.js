Game.worldBoss = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        cycleId: -1,
        personalDamage: 0,
        attemptsUsed: 0,
        attemptDate: "",
        claimed: false,
        lastAttack: null,
        history: []
    };

    function num(value, fallback) { var n = Number(value); return isFinite(n) ? n : fallback; }
    function now() { return Date.now(); }
    function dateKey() { return new Date().toISOString().slice(0, 10); }

    instance.getCycleId = function () {
        return Math.floor((now() - Game.worldBossData.epochMs) / Game.worldBossData.cycleDurationMs);
    };

    instance.getCycleStart = function () {
        return Game.worldBossData.epochMs + this.getCycleId() * Game.worldBossData.cycleDurationMs;
    };

    instance.getActiveEndsAt = function () { return this.getCycleStart() + Game.worldBossData.activeDurationMs; };
    instance.getCycleEndsAt = function () { return this.getCycleStart() + Game.worldBossData.cycleDurationMs; };
    instance.isActive = function () { return now() < this.getActiveEndsAt(); };

    instance.initialise = function () {
        this.cycleId = this.getCycleId();
        this.personalDamage = 0;
        this.attemptsUsed = 0;
        this.attemptDate = dateKey();
        this.claimed = false;
        this.lastAttack = null;
        this.history = [];
    };

    instance.save = function (data) {
        this.ensureCycle();
        data.worldBoss = {
            version: this.dataVersion,
            cycleId: this.cycleId,
            personalDamage: this.personalDamage,
            attemptsUsed: this.attemptsUsed,
            attemptDate: this.attemptDate,
            claimed: this.claimed,
            lastAttack: this.lastAttack,
            history: this.history.slice(-12)
        };
    };

    instance.load = function (data) {
        if (data && data.worldBoss) {
            var saved = data.worldBoss;
            this.cycleId = Math.floor(num(saved.cycleId, this.getCycleId()));
            this.personalDamage = Math.max(0, num(saved.personalDamage, 0));
            this.attemptsUsed = Math.max(0, Math.floor(num(saved.attemptsUsed, 0)));
            this.attemptDate = saved.attemptDate || dateKey();
            this.claimed = !!saved.claimed;
            this.lastAttack = saved.lastAttack || null;
            this.history = Array.isArray(saved.history) ? saved.history.slice(-12) : [];
        }
        this.ensureCycle();
        this.ensureDailyAttempts();
    };

    instance.ensureCycle = function () {
        var current = this.getCycleId();
        if (this.cycleId === current) return;
        if (this.cycleId >= 0 && this.personalDamage > 0) {
            this.history.push({ cycleId: this.cycleId, damage: this.personalDamage, rank: this.getRank(this.personalDamage).id, claimed: this.claimed });
        }
        this.cycleId = current;
        this.personalDamage = 0;
        this.attemptsUsed = 0;
        this.attemptDate = dateKey();
        this.claimed = false;
        this.lastAttack = null;
        this.history = this.history.slice(-12);
    };

    instance.ensureDailyAttempts = function () {
        var current = dateKey();
        if (this.attemptDate !== current) {
            this.attemptDate = current;
            this.attemptsUsed = 0;
        }
    };

    instance.getAttemptsRemaining = function () {
        this.ensureDailyAttempts();
        return Math.max(0, Game.worldBossData.dailyAttempts - this.attemptsUsed);
    };

    instance.getTeamPower = function () {
        if (Game.bosses && Game.bosses.getTeamPower) return Math.max(0, Game.bosses.getTeamPower());
        return 0;
    };

    instance.getSimulatedDamage = function () {
        var elapsed = Math.max(0, Math.min(Game.worldBossData.activeDurationMs, now() - this.getCycleStart()));
        var progress = elapsed / Game.worldBossData.activeDurationMs;
        var wave = 0.96 + 0.04 * Math.sin((this.cycleId + 1) * 2.17);
        return Math.min(Game.worldBossData.boss.maxHealth, Game.worldBossData.boss.maxHealth * Math.pow(progress, 0.92) * 1.06 * wave);
    };

    instance.getGlobalDamage = function () {
        return Math.min(Game.worldBossData.boss.maxHealth, this.getSimulatedDamage() + this.personalDamage);
    };

    instance.isDefeated = function () { return this.getGlobalDamage() >= Game.worldBossData.boss.maxHealth; };

    instance.getRank = function (damage) {
        damage = Math.max(0, num(damage, this.personalDamage));
        var ranks = Game.worldBossData.ranks;
        var result = { id: "unranked", name: "Unranked", minDamage: 0, tokens: 0, mycoCoins: 0, xp: 0 };
        for (var i = 0; i < ranks.length; i++) if (damage >= ranks[i].minDamage) result = ranks[i];
        return result;
    };

    instance.getNextRank = function () {
        var ranks = Game.worldBossData.ranks;
        for (var i = 0; i < ranks.length; i++) if (this.personalDamage < ranks[i].minDamage) return ranks[i];
        return null;
    };

    instance.attack = function () {
        this.ensureCycle();
        this.ensureDailyAttempts();
        if (!this.isActive()) {
            Game.notifyInfo("World Boss resting", "The next Mushroom Titan raid begins after the recovery period.");
            return false;
        }
        if (this.getAttemptsRemaining() <= 0) {
            Game.notifyInfo("No raid attempts", "Your daily raid attempts will reset at 00:00 UTC.");
            return false;
        }
        var teamPower = this.getTeamPower();
        if (teamPower <= 0) {
            Game.notifyInfo("No combat squad", "Select miners in Planet Bosses before joining the world raid.");
            return false;
        }
        var variance = 0.9 + Math.random() * 0.2;
        var crit = Math.random() < 0.12;
        var damage = teamPower * Game.worldBossData.boss.attackSeconds * (1 - Game.worldBossData.boss.defense) * variance * (crit ? 1.75 : 1);
        if (Game.guild && Game.guild.getWorldBossMultiplier) damage *= Game.guild.getWorldBossMultiplier();
        damage = Math.max(1, Math.floor(damage));
        this.personalDamage += damage;
        this.attemptsUsed += 1;
        this.lastAttack = { at: now(), damage: damage, crit: crit, teamPower: teamPower };
        if (Game.account) { Game.account.addXp(35, "World Boss raid", true); Game.account.recordStat("worldBossAttacks", 1); }
        if (Game.notifySuccess) Game.notifySuccess(crit ? "Critical raid strike" : "Raid strike complete", "+" + damage.toLocaleString() + " damage and +35 Commander XP");
        return damage;
    };

    instance.canClaim = function () {
        return !this.claimed && this.getRank().id !== "unranked" && (this.isDefeated() || !this.isActive());
    };

    instance.claimRewards = function () {
        if (!this.canClaim()) {
            Game.notifyInfo("Reward unavailable", "Reach Bronze rank and wait until the Titan is defeated or the event ends.");
            return false;
        }
        var rank = this.getRank();
        if (Game.account) {
            Game.account.add("worldBossTokens", rank.tokens);
            Game.account.add("mycoCoins", rank.mycoCoins);
            Game.account.addXp(rank.xp, rank.name + " World Boss reward", true);
            if (!Game.account.entries.unlockedBossTitles) Game.account.entries.unlockedBossTitles = [];
            var title = rank.name + " Titan Raider";
            if (Game.account.entries.unlockedBossTitles.indexOf(title) < 0) Game.account.entries.unlockedBossTitles.push(title);
        }
        if (rank.artifact && Game.artifacts && Game.artifactData.entries[Game.worldBossData.boss.exclusiveArtifactId]) {
            Game.artifacts.add(Game.worldBossData.boss.exclusiveArtifactId, 1);
        }
        if (rank.miner && Game.miners && Game.miners.getEntry(Game.worldBossData.boss.exclusiveMinerId)) {
            Game.miners.unlock(Game.worldBossData.boss.exclusiveMinerId, 1);
        }
        if (Game.account) Game.account.recordStat("worldBossRewards", 1);
        this.claimed = true;
        if (Game.notifySuccess) Game.notifySuccess("World Boss rewards claimed", rank.name + " rewards were added to your account.");
        return rank;
    };

    instance.getTimeRemainingMs = function () {
        return Math.max(0, (this.isActive() ? this.getActiveEndsAt() : this.getCycleEndsAt()) - now());
    };

    instance.update = function () {
        this.ensureCycle();
        this.ensureDailyAttempts();
    };

    instance.resetForAscension = function () {
        // World-boss contribution and tokens persist across Ascension.
    };

    return instance;
}());
