Game.minerUI = (function () {
    "use strict";

    var instance = {
        initialised: false,
        elapsed: 0
    };

    function resourceName(resourceId) {
        if (Game.resourceData && Game.resourceData[resourceId]) {
            return Game.resourceData[resourceId].name;
        }
        return resourceId;
    }

    instance.initialise = function () {
        if (this.initialised) return;

        $("#tabList").append(
            '<li role="presentation" id="minersTopTab">' +
            '<a href="#minersPage" aria-controls="minersPage" role="tab" data-toggle="tab">' +
            '<span class="glyphicon glyphicon-grain"></span> Miners</a></li>'
        );

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="minersPage">' +
            '<div class="myco-miner-header">' +
            '<h2>Fungal Miners</h2>' +
            '<p>Grow, evolve, and assign living miners to strengthen the colony.</p>' +
            '<strong id="minerTotalIncome"></strong>' +
            '</div>' +
            '<div id="minerCardGrid" class="myco-miner-grid"></div>' +
            '</div>'
        );

        $("#minerCardGrid").on("click", ".miner-upgrade-button", function () {
            Game.miners.upgrade($(this).attr("data-miner-id"));
            instance.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.render = function () {
        if (!this.initialised) return;

        var cards = [];
        for (var id in Game.miners.entries) {
            if (!Game.miners.entries.hasOwnProperty(id)) continue;
            var miner = Game.miners.entries[id];
            var definition = miner.definition;
            var owned = miner.owned > 0;
            var income = Game.miners.getMinerIncome(id);
            var maxed = miner.level >= definition.maxLevel;
            var cost = Game.miners.getUpgradeCost(id);

            cards.push(
                '<div class="myco-miner-card ' + (!owned ? 'miner-locked' : '') + '" style="border-color:' + definition.rarity.color + '">' +
                '<div class="myco-miner-rarity" style="color:' + definition.rarity.color + '">' + definition.rarity.name + '</div>' +
                '<h3>' + definition.name + '</h3>' +
                '<p>' + definition.description + '</p>' +
                '<div><strong>Owned:</strong> ' + miner.owned + '</div>' +
                '<div><strong>Level:</strong> ' + miner.level + ' / ' + definition.maxLevel + '</div>' +
                '<div><strong>Income:</strong> ' + income.toFixed(2) + ' ' + resourceName(definition.resource) + '/s</div>' +
                (owned ? '<button class="btn btn-success miner-upgrade-button" data-miner-id="' + id + '" ' + (maxed ? 'disabled' : '') + '>' +
                    (maxed ? 'Maximum evolution' : 'Evolve — ' + cost + ' Spores') + '</button>' :
                    '<button class="btn btn-default" disabled>Undiscovered</button>') +
                '</div>'
            );
        }

        $("#minerCardGrid").html(cards.join(""));

        var totals = Game.miners.getTotalIncome();
        var labels = [];
        for (var resource in totals) {
            if (!totals.hasOwnProperty(resource) || totals[resource] <= 0) continue;
            labels.push(totals[resource].toFixed(2) + " " + resourceName(resource) + "/s");
        }
        $("#minerTotalIncome").text("Miner production: " + (labels.length ? labels.join(" • ") : "none"));
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
