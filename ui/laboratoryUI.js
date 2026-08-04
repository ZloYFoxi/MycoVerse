Game.laboratoryUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function format(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    instance.initialise = function () {
        if (this.initialised) return;

        var minersTab = $("#minersTopTab");
        var tab = '<li role="presentation" id="laboratoryTopTab"><a href="#laboratoryPage" aria-controls="laboratoryPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-tint"></span> Laboratory</a></li>';
        if (minersTab.length) minersTab.after(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="laboratoryPage">' +
            '<section class="myco-lab-hero"><div><div class="myco-eyebrow">GENETIC RESEARCH</div><h2>Mycelium Laboratory</h2>' +
            '<p>Clone specimens, fuse three matching organisms into a stronger species level, and stabilize mutations using DNA.</p></div>' +
            '<div class="myco-lab-dna"><span>DNA</span><strong id="laboratoryDNA">0</strong></div></section>' +
            '<div class="myco-lab-stats"><article><span>Laboratory level</span><strong id="laboratoryLevel">1</strong></article>' +
            '<article><span>Mutation slots</span><strong id="laboratorySlots">1</strong></article>' +
            '<article><span>Research progress</span><strong id="laboratoryProgress">0%</strong></article></div>' +
            '<div id="laboratoryMinerGrid" class="myco-lab-grid"></div></div>'
        );

        $("#laboratoryMinerGrid").on("click", ".lab-clone-button", function () {
            Game.miners.clone($(this).attr("data-miner-id"));
            instance.render();
        });
        $("#laboratoryMinerGrid").on("click", ".lab-fuse-button", function () {
            Game.laboratory.fuse($(this).attr("data-miner-id"));
            instance.render();
        });
        $("#laboratoryMinerGrid").on("click", ".lab-mutate-button", function () {
            Game.laboratory.mutate($(this).attr("data-miner-id"));
            instance.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.render = function () {
        if (!this.initialised) return;
        var level = Game.laboratory.getLevel();
        var slots = Game.laboratory.getMutationSlots();
        $("#laboratoryDNA").text(format(Game.laboratory.dna));
        $("#laboratoryLevel").text(level + " / " + Game.laboratoryData.maxLevel);
        $("#laboratorySlots").text(slots);
        $("#laboratoryProgress").text(Math.floor(Game.laboratory.getLevelProgress() * 100) + "%");

        var cards = [];
        var miners = Game.miners.getEntriesSorted();
        for (var i = 0; i < miners.length; i++) {
            var miner = miners[i];
            if (miner.owned <= 0) continue;
            var id = miner.id;
            var cloneCost = Game.miners.getCloneCost(id);
            var fusionReward = Game.laboratory.getFusionReward(id);
            var mutationCost = Game.laboratory.getMutationCost(id);
            var fuseDisabled = !Game.miners.canFuse(id);
            var mutationDisabled = miner.mutations.length >= slots;

            cards.push(
                '<article class="myco-lab-card" style="border-color:' + miner.definition.rarity.color + '">' +
                '<div class="myco-miner-rarity" style="color:' + miner.definition.rarity.color + '">' + miner.definition.rarity.name + '</div>' +
                '<h3>' + miner.definition.name + '</h3>' +
                '<div class="myco-lab-row"><span>Specimens</span><strong>' + miner.owned + '</strong></div>' +
                '<div class="myco-lab-row"><span>Species level</span><strong>' + miner.level + '</strong></div>' +
                '<div class="myco-lab-mutations"><strong>Mutations:</strong> ' + Game.miners.getMutationText(id) + '</div>' +
                '<button class="btn btn-info lab-clone-button" data-miner-id="' + id + '">Clone — ' + format(cloneCost) + ' Spores</button>' +
                '<button class="btn btn-warning lab-fuse-button" data-miner-id="' + id + '" ' + (fuseDisabled ? 'disabled' : '') + '>Fuse 3 — +' + fusionReward + ' DNA</button>' +
                '<button class="btn btn-success lab-mutate-button" data-miner-id="' + id + '" ' + (mutationDisabled ? 'disabled' : '') + '>Mutate — ' + format(mutationCost) + ' DNA</button>' +
                '</article>'
            );
        }
        $("#laboratoryMinerGrid").html(cards.length ? cards.join("") : '<p class="text-muted">Awaken a miner species before beginning laboratory work.</p>');
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.5) { this.elapsed = 0; this.render(); }
    };

    return instance;
}());
