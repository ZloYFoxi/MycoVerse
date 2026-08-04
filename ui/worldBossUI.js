Game.worldBossUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function fmt(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    function timeText(ms) {
        var total = Math.max(0, Math.floor(ms / 1000));
        var d = Math.floor(total / 86400);
        var h = Math.floor((total % 86400) / 3600);
        var m = Math.floor((total % 3600) / 60);
        var s = total % 60;
        return (d ? d + "d " : "") + (h ? h + "h " : "") + (m ? m + "m " : "") + s + "s";
    }

    instance.initialise = function () {
        if (this.initialised) return;

        var bossTab = $("#bossesTopTab");
        var tab = '<li role="presentation" id="worldBossTopTab"><a href="#worldBossPage" aria-controls="worldBossPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-globe"></span> World Boss</a></li>';
        if (bossTab.length) bossTab.after(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="worldBossPage">' +
            '<section class="myco-worldboss-hero">' +
            '<div><div class="myco-eyebrow">GLOBAL RAID PROTOTYPE</div><h2>Mushroom Titan</h2><p>A shared raid simulated locally until online synchronization is connected. Your combat squad contributes real damage to the global health pool.</p></div>' +
            '<div class="myco-worldboss-status"><span id="worldBossState">ACTIVE</span><strong id="worldBossTimer">—</strong><small id="worldBossCycle">Cycle 0</small></div>' +
            '</section>' +
            '<section class="myco-worldboss-arena myco-panel">' +
            '<div class="myco-worldboss-title"><div class="myco-worldboss-icon">🍄</div><div><h3>Mushroom Titan</h3><p id="worldBossDescription"></p></div></div>' +
            '<div class="myco-boss-health-label"><span>Global Health</span><strong id="worldBossHealthText">0 / 0</strong></div>' +
            '<div class="myco-boss-health myco-worldboss-health"><span id="worldBossHealthBar" style="width:100%"></span></div>' +
            '<div class="myco-worldboss-stats">' +
            '<article><span>Your Damage</span><strong id="worldBossPersonalDamage">0</strong></article>' +
            '<article><span>Current Rank</span><strong id="worldBossRank">Unranked</strong></article>' +
            '<article><span>Attempts Today</span><strong id="worldBossAttempts">3 / 3</strong></article>' +
            '<article><span>Boss Tokens</span><strong id="worldBossTokens">0</strong></article>' +
            '</div>' +
            '<div class="myco-worldboss-actions"><button class="btn btn-danger btn-lg" id="worldBossAttack">Launch Raid Attack</button><button class="btn btn-warning btn-lg" id="worldBossClaim">Claim Rank Reward</button></div>' +
            '<div id="worldBossLastAttack" class="myco-small-note"></div>' +
            '</section>' +
            '<section class="myco-panel-grid">' +
            '<article class="myco-panel"><h3>Rank Rewards</h3><div id="worldBossRanks"></div></article>' +
            '<article class="myco-panel"><h3>Raid Squad</h3><div id="worldBossTeam"></div><p class="myco-small-note">The World Boss uses your selected Planet Boss squad. Change the team from the Bosses tab.</p></article>' +
            '</section>' +
            '</div>'
        );

        $(document).on("click", "#worldBossAttack", function () { Game.worldBoss.attack(); instance.render(); });
        $(document).on("click", "#worldBossClaim", function () { Game.worldBoss.claimRewards(); instance.render(); });

        this.initialised = true;
        this.render();
    };

    instance.render = function () {
        if (!this.initialised) return;
        var wb = Game.worldBoss;
        var data = Game.worldBossData;
        var boss = data.boss;
        var active = wb.isActive();
        var defeated = wb.isDefeated();
        var globalDamage = wb.getGlobalDamage();
        var health = Math.max(0, boss.maxHealth - globalDamage);
        var healthPercent = Math.max(0, health / boss.maxHealth * 100);
        var rank = wb.getRank();
        var next = wb.getNextRank();

        $("#worldBossState").text(defeated ? "DEFEATED" : (active ? "ACTIVE" : "RECOVERY"));
        $("#worldBossTimer").text(timeText(wb.getTimeRemainingMs()));
        $("#worldBossCycle").text("Cycle " + (wb.getCycleId() + 1));
        $("#worldBossDescription").text(boss.description);
        $("#worldBossHealthText").text(fmt(health) + " / " + fmt(boss.maxHealth));
        $("#worldBossHealthBar").css("width", healthPercent + "%");
        $("#worldBossPersonalDamage").text(fmt(wb.personalDamage));
        $("#worldBossRank").text(rank.name + (next ? " • next at " + fmt(next.minDamage) : " • MAX"));
        $("#worldBossAttempts").text(wb.getAttemptsRemaining() + " / " + data.dailyAttempts);
        $("#worldBossTokens").text(fmt(Game.account.getBalance("worldBossTokens")));
        $("#worldBossAttack").prop("disabled", !active || defeated || wb.getAttemptsRemaining() <= 0 || wb.getTeamPower() <= 0);
        $("#worldBossClaim").prop("disabled", !wb.canClaim()).text(wb.claimed ? "Reward Claimed" : "Claim Rank Reward");

        if (wb.lastAttack) {
            $("#worldBossLastAttack").text((wb.lastAttack.crit ? "Critical strike: " : "Last strike: ") + fmt(wb.lastAttack.damage) + " damage");
        } else {
            $("#worldBossLastAttack").text("No raid attacks made during this cycle.");
        }

        var rankHtml = [];
        for (var i = 0; i < data.ranks.length; i++) {
            var r = data.ranks[i];
            var reached = wb.personalDamage >= r.minDamage;
            rankHtml.push('<div class="myco-worldboss-rank ' + (reached ? 'reached' : '') + '"><div><strong>' + r.name + '</strong><span>' + fmt(r.minDamage) + ' damage</span></div><div><strong>' + r.tokens + ' Tokens</strong><span>' + fmt(r.mycoCoins) + ' Coins • ' + r.xp + ' XP' + (r.artifact ? ' • Artifact' : '') + (r.miner ? ' • Miner' : '') + '</span></div></div>');
        }
        $("#worldBossRanks").html(rankHtml.join(""));

        var team = Game.bosses ? Game.bosses.selectedTeam : [];
        var teamHtml = [];
        for (var j = 0; j < team.length; j++) {
            var entry = Game.miners.getEntry(team[j]);
            if (!entry) continue;
            teamHtml.push('<div class="myco-worldboss-team-row"><span>' + entry.definition.name + '</span><strong>' + fmt(Game.bosses.getMinerCombatPower(team[j])) + ' power</strong></div>');
        }
        $("#worldBossTeam").html(teamHtml.length ? teamHtml.join("") : '<p class="text-muted">No squad selected.</p>');
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.5) { this.elapsed = 0; this.render(); }
    };

    return instance;
}());
