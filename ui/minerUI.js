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
            if (!owned) continue;
            var income = Game.miners.getMinerIncome(id);
            var maxed = miner.level >= definition.maxLevel;
            var cost = Game.miners.getUpgradeCost(id);
            var unlockCost = Game.miners.getUnlockCost(id);
            var currentHp = Game.miners.getCurrentHealth(id);
            var maxHp = Game.miners.getMaxHealth(id);
            var healthText = Game.miners.getHealthStatusText(id);

            var extraHtml =
                '<div class="myco-miner-passive"><strong>Passive:</strong> ' + Game.miners.getPassiveBonusText(id) + '</div>' +
                '<div class="myco-level-track"><span style="width:' + Math.min(100, (miner.level / definition.maxLevel) * 100) + '%"></span></div>' +
                '<button class="btn btn-success miner-upgrade-button myco-card-action" data-miner-id="' + id + '" ' + (maxed ? 'disabled' : '') + '>' +
                (maxed ? 'Maximum evolution' : 'Evolve — ' + formatNumber(cost) + ' Spores') + '</button>';
            cards.push(Game.minerCardUI.ownedCard(id, miner, { extraHtml: extraHtml }));
        }

        $("#minerCardGrid").html(cards.join("") || '<div class="myco-miner-empty">No active miners. Visit the Miner Shop to recruit your first organism.</div>');
        var progress = Game.miners.getCollectionProgress();
        $("#minerCollection").text("Collection: " + progress.owned + " / " + progress.total);

        var totals = Game.miners.getTotalIncome();
        var labels = [];
        for (var resource in totals) {
            if (!totals.hasOwnProperty(resource) || totals[resource] <= 0) continue;
            labels.push((totals[resource] * 60).toFixed(2) + " " + resourceName(resource) + "/min");
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
