Game.bossUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function fmt(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    function timeString(ms) {
        var seconds = Math.max(0, Math.ceil(ms / 1000));
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return m + "m " + (s < 10 ? "0" : "") + s + "s";
    }

    function rewardText(boss) {
        var r = boss.reward;
        var parts = [fmt(r.mycoCoins) + " MycoCoins", r.bloomTokens + " Bloom Tokens"];
        if (r.minerId && Game.minerData[r.minerId]) parts.push(Game.minerData[r.minerId].name);
        if (r.artifactId && Game.artifactData.entries[r.artifactId]) parts.push(Game.artifactData.entries[r.artifactId].name);
        if (r.title) parts.push('Title: "' + r.title + '"');
        return parts.join(" • ");
    }

    instance.initialise = function () {
        if (this.initialised) return;
        var planetsTab = $("#planetsTopTab");
        var tab = '<li role="presentation" id="bossesTopTab"><a href="#bossesPage" aria-controls="bossesPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-fire"></span> Bosses</a></li>';
        if (planetsTab.length) planetsTab.after(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="bossesPage">' +
            '<section class="myco-boss-hero"><div><div class="myco-eyebrow">PLANETARY GUARDIANS</div><h2>Boss Arena</h2><p>Assemble up to five living species. Boss battles continue in real time, even while the game is closed. Defeat each guardian to conquer the next league.</p></div><div class="myco-boss-power"><span>SQUAD POWER</span><strong id="bossTeamPower">0</strong></div></section>' +
            '<section class="myco-panel-grid"><article class="myco-panel"><h3>Combat squad</h3><p class="myco-small-note">Choose up to five discovered species. Levels, rarity, mutations, artifacts, and Legacy increase combat power.</p><button id="bossAutoTeam" class="btn btn-default">Select Strongest Team</button><div id="bossTeamGrid" class="myco-boss-team-grid"></div></article>' +
            '<article class="myco-panel"><h3>Active battle</h3><div id="bossActiveBattle"></div></article></section>' +
            '<section><h3>Planet guardians</h3><div id="bossCards" class="myco-boss-grid"></div></section>' +
            '</div>'
        );

        $(document).on("click", ".boss-team-toggle", function () {
            Game.bosses.toggleTeamMember($(this).attr("data-miner-id"));
            instance.render();
        });
        $(document).on("click", "#bossAutoTeam", function () {
            Game.bosses.autoSelectTeam();
            instance.render();
        });
        $(document).on("click", ".boss-start-button", function () {
            Game.bosses.startBattle($(this).attr("data-boss-id"));
            instance.render();
        });
        $(document).on("click", "#bossRetreat", function () {
            Game.bosses.cancelBattle();
            instance.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.renderTeam = function () {
        var miners = Game.miners.getEntriesSorted();
        var html = [];
        for (var i = 0; i < miners.length; i++) {
            var miner = miners[i];
            if (miner.owned <= 0) continue;
            var selected = Game.bosses.selectedTeam.indexOf(miner.id) >= 0;
            html.push('<button class="boss-team-toggle myco-team-chip ' + (selected ? 'selected' : '') + '" data-miner-id="' + miner.id + '" ' + (Game.bosses.activeBattle ? 'disabled' : '') + '>' +
                '<strong>' + miner.definition.name + '</strong><span>Power ' + fmt(Game.bosses.getMinerCombatPower(miner.id)) + ' • Lv ' + miner.level + '</span></button>');
        }
        $("#bossTeamGrid").html(html.join("") || '<p class="text-muted">Awaken miners to form a combat squad.</p>');
        $("#bossTeamPower").text(fmt(Game.bosses.getTeamPower()));
    };

    instance.renderActive = function () {
        var snapshot = Game.bosses.getActiveSnapshot();
        if (!snapshot) {
            $("#bossActiveBattle").html('<div class="myco-boss-empty"><span>⚔️</span><p>No active battle. Choose a guardian below.</p></div>');
            return;
        }
        var boss = snapshot.boss;
        $("#bossActiveBattle").html(
            '<div class="myco-active-boss"><div class="myco-boss-icon">' + boss.icon + '</div><div><div class="myco-eyebrow">' + snapshot.phase.name + '</div><h3>' + boss.name + '</h3></div></div>' +
            '<div class="myco-boss-health-label"><span>' + fmt(snapshot.health) + ' / ' + fmt(boss.maxHealth) + ' HP</span><strong>' + timeString(snapshot.remainingMs) + '</strong></div>' +
            '<div class="myco-boss-health"><span style="width:' + snapshot.healthPercent + '%"></span></div>' +
            '<div class="myco-kv-list"><div><span>Squad DPS</span><strong>' + fmt(snapshot.teamPower * (1 - boss.defense) * snapshot.phase.damageMultiplier) + '</strong></div><div><span>Total damage</span><strong>' + fmt(snapshot.totalDamage) + '</strong></div><div><span>Boss defense</span><strong>' + Math.round(boss.defense * 100) + '%</strong></div></div>' +
            '<button id="bossRetreat" class="btn btn-danger">Retreat</button>'
        );
    };

    instance.renderBosses = function () {
        var html = [];
        for (var i = 0; i < Game.bossData.order.length; i++) {
            var id = Game.bossData.order[i];
            var boss = Game.bosses.getBoss(id);
            var planet = Game.planets.getPlanet(boss.planetId);
            var unlocked = Game.planets.isUnlocked(boss.planetId);
            var defeated = Game.bosses.isDefeated(id);
            var canStart = Game.bosses.canStart(id);
            html.push('<article class="myco-boss-card ' + (defeated ? 'defeated' : '') + (!unlocked ? ' locked' : '') + '">' +
                '<div class="myco-boss-card-icon">' + boss.icon + '</div><div class="myco-eyebrow">LEAGUE ' + planet.league + ' • ' + planet.name + '</div><h3>' + boss.name + '</h3><p>' + boss.description + '</p>' +
                '<div class="myco-kv-list"><div><span>Health</span><strong>' + fmt(boss.maxHealth) + '</strong></div><div><span>Time limit</span><strong>' + timeString(boss.durationSeconds * 1000) + '</strong></div><div><span>Defense</span><strong>' + Math.round(boss.defense * 100) + '%</strong></div></div>' +
                '<div class="myco-boss-reward"><span>Victory rewards</span><p>' + rewardText(boss) + '</p></div>' +
                '<button class="btn ' + (defeated ? 'btn-success' : 'btn-warning') + ' boss-start-button" data-boss-id="' + id + '" ' + ((!canStart || defeated) ? 'disabled' : '') + '>' +
                (defeated ? 'Guardian Defeated' : (!unlocked ? 'Planet Locked' : (Game.bosses.activeBattle ? 'Battle in Progress' : 'Challenge Boss'))) + '</button></article>');
        }
        $("#bossCards").html(html.join(""));
    };

    instance.render = function () {
        if (!this.initialised) return;
        this.renderTeam();
        this.renderActive();
        this.renderBosses();
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.5) { this.elapsed = 0; this.render(); }
    };

    return instance;
}());
