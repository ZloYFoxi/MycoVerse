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
            '<section class="myco-panel myco-medical-panel"><div class="myco-eyebrow">MEDICAL CHAMBER</div><h3>Combat Recovery</h3><p>Heal injured miners after planetary gate battles. Miners below 50% HP mine more slowly.</p><div id="medicalSummary"></div><button id="healAllMiners" class="btn btn-danger">Heal All Miners</button></section><div id="laboratoryMinerGrid" class="myco-lab-grid"></div></div>'
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

        $(document).on("click", ".lab-heal-quarter", function () { Game.laboratory.healMiner($(this).attr("data-miner-id"), false); instance.render(); });
        $(document).on("click", ".lab-heal-full", function () { Game.laboratory.healMiner($(this).attr("data-miner-id"), true); instance.render(); });
        $(document).on("click", "#healAllMiners", function () { Game.laboratory.healAll(); instance.render(); });

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

            var hp = Game.miners.getCurrentHealth(id);
            var maxHp = Game.miners.getMaxHealth(id);
            var healQuarter = Game.laboratory.getHealCost(id, false);
            var healFull = Game.laboratory.getHealCost(id, true);
            cards.push(
                '<article class="myco-lab-card" style="border-color:' + miner.definition.rarity.color + '">' +
                '<div class="myco-miner-rarity" style="color:' + miner.definition.rarity.color + '">' + miner.definition.rarity.name + '</div>' +
                '<h3>' + miner.definition.name + '</h3>' +
                '<div class="myco-lab-row"><span>Specimens</span><strong>' + miner.owned + '</strong></div>' +
                '<div class="myco-lab-row"><span>Species level</span><strong>' + miner.level + '</strong></div>' +
                '<div class="myco-lab-mutations"><strong>Mutations:</strong> ' + Game.miners.getMutationText(id) + '</div>' +
                '<div class="myco-boss-health-label"><span>Health</span><strong>' + format(hp) + ' / ' + format(maxHp) + '</strong></div>' +
                '<progress class="myco-native-progress team" value="' + hp + '" max="' + Math.max(1,maxHp) + '">' + Math.round(maxHp?hp/maxHp*100:0) + '%</progress>' +
                '<div class="myco-small-note">' + Game.miners.getHealthStatusText(id) + '</div>' +
                '<button class="btn btn-info lab-clone-button" data-miner-id="' + id + '">Clone — ' + format(cloneCost) + ' Spores</button>' +
                '<button class="btn btn-warning lab-fuse-button" data-miner-id="' + id + '" ' + (fuseDisabled ? 'disabled' : '') + '>Fuse 3 — +' + fusionReward + ' DNA</button>' +
                '<button class="btn btn-success lab-mutate-button" data-miner-id="' + id + '" ' + (mutationDisabled ? 'disabled' : '') + '>Mutate — ' + format(mutationCost) + ' DNA</button>' +
                '<button class="btn btn-warning lab-heal-quarter" data-miner-id="' + id + '" ' + (healQuarter.healAmount<=0?'disabled':'') + '>Heal 25% — ' + format(healQuarter.spores) + ' Spores, ' + format(healQuarter.science) + ' Science, ' + healQuarter.dna + ' DNA</button>' +
                '<button class="btn btn-danger lab-heal-full" data-miner-id="' + id + '" ' + (healFull.healAmount<=0?'disabled':'') + '>Heal Fully — ' + format(healFull.spores) + ' Spores, ' + format(healFull.science) + ' Science, ' + healFull.dna + ' DNA</button>' +
                '</article>'
            );
        }
        var totalHealth = Game.miners.getTotalHealth();
        var allCost = Game.laboratory.getHealAllCost();
        $("#medicalSummary").html("<div class=\"myco-boss-health-label\"><span>Colony health</span><strong>" + format(totalHealth.current) + " / " + format(totalHealth.max) + "</strong></div><progress class=\"myco-native-progress team\" value=\"" + totalHealth.current + "\" max=\"" + Math.max(1,totalHealth.max) + "\"></progress><div class=\"myco-small-note\">Heal all cost: " + format(allCost.spores) + " Spores, " + format(allCost.science) + " Science, " + allCost.dna + " DNA</div>");
        $("#healAllMiners").prop("disabled", allCost.healAmount <= 0);
        $("#laboratoryMinerGrid").html(cards.length ? cards.join("") : '<p class="text-muted">Awaken a miner species before beginning laboratory work.</p>');
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.5) { this.elapsed = 0; this.render(); }
    };

    return instance;
}());
