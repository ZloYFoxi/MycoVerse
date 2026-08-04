Game.planetUI = (function () {
    "use strict";
    var instance = { initialised: false, elapsed: 0 };

    function format(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    instance.initialise = function () {
        if (this.initialised) return;
        var eventsTab = $("#eventsTopTab");
        var tab = '<li role="presentation" id="planetsTopTab"><a href="#planetsPage" aria-controls="planetsPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-globe"></span> Planets</a></li>';
        if (eventsTab.length) eventsTab.before(tab); else $("#tabList").append(tab);
        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="planetsPage">' +
            '<section class="myco-planets-hero"><div><div class="myco-eyebrow">MYCOVERSE LEAGUES</div><h2>Living Planets</h2>' +
            '<p>Advance through planetary leagues. The active planet changes miner production bonuses and the Golden Mushroom reward pool.</p></div>' +
            '<div class="myco-planet-progress"><span>DISCOVERED</span><strong id="planetProgress">1 / 5</strong></div></section>' +
            '<div id="planetCards" class="myco-planet-grid"></div></div>'
        );
        $("#planetCards").on("click", "button[data-action='unlock']", function () {
            Game.planets.unlock($(this).data("planet"));
            instance.render();
            if (Game.goldenEventUI) Game.goldenEventUI.render();
        });
        $("#planetCards").on("click", "button[data-action='activate']", function () {
            Game.planets.activate($(this).data("planet"));
            instance.render();
            if (Game.goldenEventUI) { Game.goldenEventUI.renderDropRates(); Game.goldenEventUI.render(); }
        });
        this.initialised = true;
        this.render();
    };

    instance.render = function () {
        if (!this.initialised) return;
        var progress = Game.planets.getLeagueProgress();
        $("#planetProgress").text(progress.unlocked + " / " + progress.total);
        var html = [];
        for (var i = 0; i < Game.planetData.order.length; i++) {
            var id = Game.planetData.order[i];
            var planet = Game.planets.getPlanet(id);
            var unlocked = Game.planets.isUnlocked(id);
            var active = Game.planets.activePlanetId === id;
            var req = Game.planets.getRequirements(id);
            html.push('<article class="myco-planet-card ' + (active ? 'active' : '') + (unlocked ? '' : ' locked') + '">' +
                '<div class="myco-planet-orb league-' + planet.league + '"><span>' + planet.league + '</span></div>' +
                '<div class="myco-planet-copy"><div class="myco-eyebrow">LEAGUE ' + planet.league + '</div><h3>' + planet.name + '</h3>' +
                '<p>' + planet.description + '</p><div class="myco-planet-bonus">' + Game.planets.getBonusText(id) + '</div>' +
                (!unlocked ? '<div class="myco-planet-req"><span>Colony Power: ' + format(req.colonyPower.current) + ' / ' + format(req.colonyPower.required) + '</span>' +
                '<span>Laboratory: ' + req.laboratoryLevel.current + ' / ' + req.laboratoryLevel.required + '</span></div>' : '') +
                '<button class="btn ' + (active ? 'btn-success' : 'btn-primary') + '" data-action="' + (unlocked ? 'activate' : 'unlock') + '" data-planet="' + id + '"' +
                ((active || (!unlocked && !Game.planets.canUnlock(id))) ? ' disabled' : '') + '>' +
                (active ? 'Active planet' : (unlocked ? 'Activate planet' : 'Unlock league')) + '</button></div></article>');
        }
        $("#planetCards").html(html.join(""));
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.5) { this.elapsed = 0; this.render(); }
    };
    return instance;
}());
