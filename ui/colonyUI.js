Game.colonyUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function resourceName(resourceId) {
        return Game.resourceData && Game.resourceData[resourceId] ? Game.resourceData[resourceId].name : resourceId;
    }

    function format(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    instance.initialise = function () {
        if (this.initialised) return;
        var minersTab = $("#minersTopTab");
        var tab = '<li role="presentation" id="colonyTopTab"><a href="#colonyPage" aria-controls="colonyPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-tree-deciduous"></span> Colony</a></li>';
        if (minersTab.length) minersTab.before(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="colonyPage">' +
            '<section class="myco-colony-hero"><div><div class="myco-eyebrow">MYCELIUM COMMAND</div><h2>Living Colony</h2>' +
            '<p>Your awakened organisms form one connected network. Every miner, evolution, and passive trait strengthens the whole colony.</p></div>' +
            '<div class="myco-colony-rank"><span>COLONY POWER</span><strong id="colonyPower">0</strong></div></section>' +
            '<div class="myco-colony-stats">' +
            '<article><span>Discovered species</span><strong id="colonySpecies">0</strong></article>' +
            '<article><span>Living specimens</span><strong id="colonySpecimens">0</strong></article>' +
            '<article><span>Combined levels</span><strong id="colonyLevels">0</strong></article>' +
            '<article><span>Global production</span><strong id="colonyGlobalBonus">+0%</strong></article></div>' +
            '<div class="myco-colony-columns"><section class="myco-colony-panel"><h3>Active production</h3><div id="colonyIncome"></div></section>' +
            '<section class="myco-colony-panel"><h3>Mycelium bonuses</h3><div id="colonyBonuses"></div></section></div>' +
            '</div>'
        );
        this.initialised = true;
        this.render();
    };

    instance.render = function () {
        if (!this.initialised) return;
        var summary = Game.miners.getColonySummary();
        $("#colonyPower").text(format(summary.power));
        $("#colonySpecies").text(summary.species);
        $("#colonySpecimens").text(summary.specimens);
        $("#colonyLevels").text(summary.totalLevels);
        $("#colonyGlobalBonus").text("+" + summary.bonuses.global + "%");

        var income = [];
        for (var resource in summary.income) {
            if (!summary.income.hasOwnProperty(resource) || summary.income[resource] <= 0) continue;
            income.push('<div class="myco-colony-row"><span>' + resourceName(resource) + '</span><strong>+' + (summary.income[resource] * 60).toFixed(2) + '/min</strong></div>');
        }
        $("#colonyIncome").html(income.length ? income.join("") : '<p class="text-muted">Awaken miners to begin production.</p>');

        var bonuses = [];
        if (summary.bonuses.global > 0) bonuses.push('<div class="myco-colony-row"><span>All miner production</span><strong>+' + summary.bonuses.global + '%</strong></div>');
        for (var id in summary.bonuses.resources) {
            if (!summary.bonuses.resources.hasOwnProperty(id)) continue;
            bonuses.push('<div class="myco-colony-row"><span>' + resourceName(id) + ' miners</span><strong>+' + summary.bonuses.resources[id] + '%</strong></div>');
        }
        $("#colonyBonuses").html(bonuses.length ? bonuses.join("") : '<p class="text-muted">Discover organisms with passive traits.</p>');
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.5) { this.elapsed = 0; this.render(); }
    };

    return instance;
}());
