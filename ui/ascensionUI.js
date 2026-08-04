Game.ascensionUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function format(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    function requirementLine(label, item) {
        return '<li class="' + (item.met ? 'met' : '') + '"><span>' + label + '</span><strong>' +
            format(item.current) + ' / ' + format(item.required) + '</strong></li>';
    }

    instance.initialise = function () {
        if (this.initialised) return;
        var researchTab = $("#researchTopTab");
        var tab = '<li role="presentation" id="ascensionTopTab"><a href="#ascensionPage" aria-controls="ascensionPage" role="tab" data-toggle="tab">' +
            '<span class="glyphicon glyphicon-refresh"></span> Ascension</a></li>';
        if (researchTab.length) researchTab.after(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="ascensionPage">' +
            '<section class="myco-ascension-hero"><div><div class="myco-eyebrow">BEYOND ONE LIFETIME</div><h2>Mycelial Ascension</h2>' +
            '<p>Collapse the current colony into ancestral memory. Most MycoVerse progress is reborn, but Legacy and its permanent adaptations remain forever.</p></div>' +
            '<div class="myco-legacy-currency"><span>LEGACY</span><strong id="ascensionLegacy">0</strong><small id="ascensionCount">0 ascensions</small></div></section>' +
            '<div class="myco-ascension-layout"><section class="myco-ascension-panel"><div class="myco-eyebrow">NEXT REBIRTH</div>' +
            '<h3>Legacy reward: <strong id="ascensionPending">0</strong></h3><ul id="ascensionRequirements" class="myco-ascension-req"></ul>' +
            '<button id="ascendButton" class="btn btn-danger btn-lg">Ascend the Colony</button><small class="myco-warning">Resets MycoVerse systems and primary currencies. Legacy upgrades are preserved.</small></section>' +
            '<section class="myco-ascension-panel"><div class="myco-eyebrow">ETERNAL RECORD</div><div class="myco-legacy-stats">' +
            '<article><span>Total Legacy earned</span><strong id="ascensionTotal">0</strong></article><article><span>Last ascension</span><strong id="ascensionLast">0</strong></article></div></section></div>' +
            '<section class="myco-ascension-panel"><div class="myco-eyebrow">LEGACY ADAPTATIONS</div><div id="ascensionUpgrades" class="myco-legacy-grid"></div></section>' +
            '</div>'
        );

        $("#ascendButton").on("click", function () {
            if (Game.ascension.ascend()) {
                instance.render();
                if (Game.minerUI) Game.minerUI.render();
                if (Game.colonyUI) Game.colonyUI.render();
                if (Game.laboratoryUI) Game.laboratoryUI.render();
                if (Game.planetUI) Game.planetUI.render();
                if (Game.questUI) Game.questUI.render();
                if (Game.artifactUI) Game.artifactUI.render();
                if (Game.researchUI) Game.researchUI.render();
                if (Game.structureUI) Game.structureUI.render();
            }
        });
        $("#ascensionUpgrades").on("click", "button[data-legacy-id]", function () {
            Game.ascension.purchaseUpgrade($(this).data("legacy-id"));
            instance.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.renderUpgrades = function () {
        var html = [];
        var order = Game.ascensionData.upgradesOrder;
        for (var i = 0; i < order.length; i++) {
            var id = order[i];
            var upgrade = Game.ascensionData.upgrades[id];
            var level = Game.ascension.getUpgradeLevel(id);
            var cost = Game.ascension.getUpgradeCost(id);
            var maxed = level >= upgrade.maxLevel;
            var bonus = upgrade.bonus.percentPerLevel * level;
            var bonusText = upgrade.bonus.type === "global" ? "+" + bonus + "% all miner production" :
                (upgrade.bonus.type === "insight" ? "+" + bonus + "% Insight generation" :
                    "+" + bonus + "% " + Game.resourceData[upgrade.bonus.resource].name + " production");
            html.push('<article class="myco-legacy-card ' + (maxed ? 'maxed' : '') + '"><div class="myco-legacy-level">LEVEL ' + level + ' / ' + upgrade.maxLevel + '</div>' +
                '<h3>' + upgrade.name + '</h3><p>' + upgrade.description + '</p><div class="myco-legacy-bonus">' + bonusText + '</div>' +
                '<button class="btn btn-primary" data-legacy-id="' + id + '" ' + ((maxed || Game.ascension.legacy < cost) ? 'disabled' : '') + '>' +
                (maxed ? 'Maximum level' : 'Awaken — ' + cost + ' Legacy') + '</button></article>');
        }
        $("#ascensionUpgrades").html(html.join(""));
    };

    instance.render = function () {
        if (!this.initialised) return;
        var req = Game.ascension.getRequirements();
        $("#ascensionLegacy").text(format(Game.ascension.legacy));
        $("#ascensionCount").text(Game.ascension.ascensions + (Game.ascension.ascensions === 1 ? " ascension" : " ascensions"));
        $("#ascensionPending").text(format(Game.ascension.getPendingLegacy()));
        $("#ascensionTotal").text(format(Game.ascension.totalLegacyEarned));
        $("#ascensionLast").text(format(Game.ascension.lastGain));
        $("#ascensionRequirements").html(
            requirementLine("Colony Power", req.colonyPower) +
            requirementLine("Planets unlocked", req.planetsUnlocked) +
            requirementLine("Research completed", req.researchCompleted)
        );
        $("#ascendButton").prop("disabled", !Game.ascension.canAscend());
        this.renderUpgrades();
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed < 0.75) return;
        this.elapsed = 0;
        this.render();
    };

    return instance;
}());
