Game.minerUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function resourceName(resourceId) {
        return Game.resourceData && Game.resourceData[resourceId] ? Game.resourceData[resourceId].name : resourceId;
    }

    function formatNumber(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    instance.initialise = function () {
        if (this.initialised) return;

        $("#tabList").append(
            '<li role="presentation" id="minersTopTab"><a href="#minersPage" aria-controls="minersPage" role="tab" data-toggle="tab">' +
            '<span class="glyphicon glyphicon-grain"></span> Miners</a></li>'
        );

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="minersPage">' +
            '<div class="myco-miner-header"><h2>Fungal Miners</h2>' +
            '<p>Awaken and evolve living miners. Their production is added directly to the colony economy.</p>' +
            '<div class="myco-miner-summary"><strong id="minerCollection"></strong><strong id="minerTotalIncome"></strong></div>' +
            '</div><div id="minerCardGrid" class="myco-miner-grid"></div></div>'
        );

        $("#minerCardGrid").on("click", ".miner-upgrade-button", function () {
            Game.miners.upgrade($(this).attr("data-miner-id"));
            instance.render();
        });
        $("#minerCardGrid").on("click", ".miner-discover-button", function () {
            Game.miners.discover($(this).attr("data-miner-id"));
            instance.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.render = function () {
        if (!this.initialised) return;
        var cards = [];
        var miners = Game.miners.getEntriesSorted();

        for (var i = 0; i < miners.length; i++) {
            var miner = miners[i];
            var id = miner.id;
            var definition = miner.definition;
            var owned = miner.owned > 0;
            var income = Game.miners.getMinerIncome(id);
            var maxed = miner.level >= definition.maxLevel;
            var cost = Game.miners.getUpgradeCost(id);
            var unlockCost = Game.miners.getUnlockCost(id);

            cards.push(
                '<div class="myco-miner-card ' + (!owned ? 'miner-locked' : '') + '" style="border-color:' + definition.rarity.color + '">' +
                '<div class="myco-miner-rarity" style="color:' + definition.rarity.color + '">' + definition.rarity.name + '</div>' +
                '<h3>' + definition.name + '</h3><p>' + definition.description + '</p>' +
                (owned ?
                    '<div><strong>Owned:</strong> ' + miner.owned + '</div>' +
                    '<div><strong>Level:</strong> ' + miner.level + ' / ' + definition.maxLevel + '</div>' +
                    '<div><strong>Income:</strong> ' + income.toFixed(2) + ' ' + resourceName(definition.resource) + '/s</div>' +
                    '<div class="myco-miner-passive"><strong>Passive:</strong> ' + Game.miners.getPassiveBonusText(id) + '</div>' +
                    '<div class="myco-level-track"><span style="width:' + Math.min(100, (miner.level / definition.maxLevel) * 100) + '%"></span></div>' +
                    '<button class="btn btn-success miner-upgrade-button" data-miner-id="' + id + '" ' + (maxed ? 'disabled' : '') + '>' +
                    (maxed ? 'Maximum evolution' : 'Evolve — ' + formatNumber(cost) + ' Spores') + '</button>'
                    :
                    '<div class="myco-miner-undiscovered">Undiscovered organism</div>' +
                    (definition.bossExclusive ? '<button class="btn btn-warning" disabled>Defeat Planet Boss</button>' : '<button class="btn btn-primary miner-discover-button" data-miner-id="' + id + '">Awaken — ' + formatNumber(unlockCost) + ' Spores</button>')) +
                '</div>'
            );
        }

        $("#minerCardGrid").html(cards.join(""));
        var progress = Game.miners.getCollectionProgress();
        $("#minerCollection").text("Collection: " + progress.owned + " / " + progress.total);

        var totals = Game.miners.getTotalIncome();
        var labels = [];
        for (var resource in totals) {
            if (!totals.hasOwnProperty(resource) || totals[resource] <= 0) continue;
            labels.push(totals[resource].toFixed(2) + " " + resourceName(resource) + "/s");
        }
        $("#minerTotalIncome").text("Production: " + (labels.length ? labels.join(" • ") : "none"));
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.5) {
            this.elapsed = 0;
            this.render();
        }
    };

    return instance;
}());
