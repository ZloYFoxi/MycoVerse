Game.structureUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function format(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    instance.initialise = function () {
        if (this.initialised) return;
        var colonyTab = $("#colonyTopTab");
        var tab = '<li role="presentation" id="structuresTopTab"><a href="#structuresPage" aria-controls="structuresPage" role="tab" data-toggle="tab">' +
            '<span class="glyphicon glyphicon-tree-deciduous"></span> Structures</a></li>';
        if (colonyTab.length) colonyTab.after(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="structuresPage">' +
            '<section class="myco-structures-hero"><div><div class="myco-eyebrow">LIVING INFRASTRUCTURE</div><h2>Colony Structures</h2>' +
            '<p>Grow permanent structures during this colony cycle. Each level reshapes production and unlocks deeper infrastructure.</p></div>' +
            '<div class="myco-structure-rank"><span>TOTAL LEVELS</span><strong id="structureTotalLevels">0</strong><small id="structureBuilt">0 structures grown</small></div></section>' +
            '<div id="structureGrid" class="myco-structure-grid"></div>' +
            '</div>'
        );

        $("#structureGrid").on("click", "button[data-structure-id]", function () {
            Game.structures.upgrade($(this).data("structure-id"));
            instance.render();
            if (Game.colonyUI) Game.colonyUI.render();
            if (Game.researchUI) Game.researchUI.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.render = function () {
        if (!this.initialised) return;
        $("#structureTotalLevels").text(format(Game.structures.getTotalLevels()));
        $("#structureBuilt").text(Game.structures.getBuiltCount() + " / " + Game.structureData.order.length + " structures grown");

        var html = [];
        for (var i = 0; i < Game.structureData.order.length; i++) {
            var id = Game.structureData.order[i];
            var definition = Game.structureData.entries[id];
            var level = Game.structures.getLevel(id);
            var maxed = level >= definition.maxLevel;
            var state = Game.structures.getRequirementState(id);
            var canUpgrade = Game.structures.canUpgrade(id);
            var currentBonus = definition.bonus.percentPerLevel * level;
            html.push(
                '<article class="myco-structure-card ' + (!state.met ? 'locked' : '') + '">' +
                '<div class="myco-structure-top"><span class="myco-structure-icon">' + definition.icon + '</span><div><div class="myco-eyebrow">LEVEL ' + level + ' / ' + definition.maxLevel + '</div><h3>' + definition.name + '</h3></div></div>' +
                '<p>' + definition.description + '</p>' +
                '<div class="myco-structure-bonus">' + Game.structures.getBonusText(id) + '<strong>Current: +' + currentBonus + '%</strong></div>' +
                '<div class="myco-structure-requirements">' + Game.structures.getRequirementText(id) + '</div>' +
                '<button class="btn ' + (canUpgrade ? 'btn-success' : 'btn-default') + '" data-structure-id="' + id + '" ' + ((maxed || !state.met) ? 'disabled' : '') + '>' +
                (maxed ? 'Maximum Level' : (level ? 'Grow: ' : 'Build: ') + Game.structures.getCostText(id)) + '</button>' +
                '</article>'
            );
        }
        $("#structureGrid").html(html.join(""));
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed < 1) return;
        this.elapsed = 0;
        this.render();
    };

    return instance;
}());
