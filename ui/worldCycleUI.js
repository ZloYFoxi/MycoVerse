Game.worldCycleUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0, lastSeasonId: null, lastFocusId: null };

    function time(seconds) {
        if (Game.utils && Game.utils.getFullTimeDisplay) return Game.utils.getFullTimeDisplay(seconds);
        seconds = Math.max(0, Math.floor(seconds));
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        return hours + "h " + minutes + "m " + secs + "s";
    }

    function bonusText(bonus) {
        var parts = [];
        if (!bonus) return "No additional bonus";
        if (bonus.globalPercent) parts.push("+" + bonus.globalPercent + "% all production");
        if (bonus.resources) {
            for (var id in bonus.resources) {
                if (!bonus.resources.hasOwnProperty(id)) continue;
                var resource = Game.resourceData[id];
                parts.push("+" + bonus.resources[id] + "% " + (resource ? resource.name : id));
            }
        }
        if (bonus.insightPercent) parts.push("+" + bonus.insightPercent + "% Insight");
        if (bonus.artifactChancePercent) parts.push("+" + bonus.artifactChancePercent + "% artifact chance");
        if (bonus.expeditionSpeedPercent) parts.push("+" + bonus.expeditionSpeedPercent + "% expedition speed");
        return parts.join(" • ");
    }

    instance.initialise = function () {
        if (this.initialised) return;
        var structuresTab = $("#structuresTopTab");
        var tab = '<li role="presentation" id="worldCycleTopTab"><a href="#worldCyclePage" aria-controls="worldCyclePage" role="tab" data-toggle="tab">' +
            '<span class="glyphicon glyphicon-leaf"></span> Seasons</a></li>';
        if (structuresTab.length) structuresTab.after(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="worldCyclePage">' +
            '<section class="myco-season-hero" id="mycoSeasonHero">' +
            '<div class="myco-season-icon" id="mycoSeasonIcon">🌸</div>' +
            '<div><div class="myco-eyebrow">PLANETARY CYCLE</div><h2 id="mycoSeasonName">Bloomtide</h2>' +
            '<p id="mycoSeasonDescription"></p><div class="myco-season-bonuses" id="mycoSeasonBonuses"></div></div>' +
            '<div class="myco-season-clock"><span>CHANGES IN</span><strong id="mycoSeasonTimer">--</strong><small id="mycoNextSeason"></small></div>' +
            '</section>' +
            '<section class="myco-season-focus-panel"><div><div class="myco-eyebrow">SEASONAL RITUAL</div>' +
            '<h3>Choose one focus for this season</h3><p>A ritual lasts until the planetary cycle changes and cannot be replaced.</p></div>' +
            '<div class="myco-active-ritual" id="mycoActiveRitual">No ritual active</div></section>' +
            '<div class="myco-ritual-grid" id="mycoRitualGrid"></div>' +
            '<section class="myco-season-calendar"><h3>Cycle Calendar</h3><div id="mycoSeasonCalendar"></div></section>' +
            '</div>'
        );

        this.initialised = true;
        this.renderAll();
    };

    instance.renderAll = function () {
        if (!this.initialised) return;
        var season = Game.worldCycle.getSeason();
        var next = Game.worldCycle.getNextSeason();
        $("#mycoSeasonIcon").text(season.icon);
        $("#mycoSeasonName").text(season.name);
        $("#mycoSeasonDescription").text(season.description);
        $("#mycoSeasonHero").css("border-color", season.color);
        $("#mycoNextSeason").text("Next: " + next.icon + " " + next.name);
        $("#mycoSeasonBonuses").html(Game.worldCycle.getBonusLines().map(function (line) {
            return '<span>' + line + '</span>';
        }).join(""));

        var active = Game.worldCycle.getActiveFocus();
        $("#mycoActiveRitual").html(active ?
            '<strong>' + active.icon + ' ' + active.name + '</strong><span>' + bonusText(active.bonus) + '</span>' :
            '<strong>No ritual active</strong><span>Select one below before the season ends.</span>');

        var ritualHtml = "";
        for (var id in Game.worldCycleData.focuses) {
            if (!Game.worldCycleData.focuses.hasOwnProperty(id)) continue;
            var focus = Game.worldCycleData.focuses[id];
            var disabled = active ? " disabled" : "";
            ritualHtml += '<article class="myco-ritual-card' + (active && Game.worldCycle.focusId === id ? ' active' : '') + '">' +
                '<div class="myco-ritual-icon">' + focus.icon + '</div><h4>' + focus.name + '</h4><p>' + focus.description + '</p>' +
                '<div class="myco-ritual-bonus">' + bonusText(focus.bonus) + '</div>' +
                '<button class="btn btn-success myco-ritual-button" data-focus="' + id + '"' + disabled + '>' +
                (active && Game.worldCycle.focusId === id ? "Active" : "Activate • " + focus.cost + " Spores") + '</button></article>';
        }
        $("#mycoRitualGrid").html(ritualHtml);
        $(".myco-ritual-button").off("click").on("click", function () {
            if (Game.worldCycle.activateFocus($(this).data("focus"))) instance.renderAll();
        });

        var calendar = "";
        var currentId = Game.worldCycle.getSeasonId();
        for (var i = 0; i < Game.worldCycleData.order.length; i++) {
            var seasonId = Game.worldCycleData.order[i];
            var item = Game.worldCycleData.seasons[seasonId];
            calendar += '<div class="myco-season-calendar-item' + (seasonId === currentId ? ' active' : '') + '">' +
                '<span>' + item.icon + '</span><strong>' + item.name + '</strong><small>6 hours</small></div>';
        }
        $("#mycoSeasonCalendar").html(calendar);
        this.lastSeasonId = currentId;
        this.lastFocusId = Game.worldCycle.focusId;
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed < 0.5) return;
        this.elapsed = 0;
        Game.worldCycle.update();
        $("#mycoSeasonTimer").text(time(Game.worldCycle.getSecondsRemaining()));
        if (this.lastSeasonId !== Game.worldCycle.getSeasonId() || this.lastFocusId !== Game.worldCycle.focusId) {
            this.renderAll();
        }
    };

    return instance;
}());