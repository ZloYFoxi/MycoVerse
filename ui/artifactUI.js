Game.artifactUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function rarity(id) {
        var data = Game.artifactData.entries[id];
        return Game.artifactData.rarities[data.rarity];
    }

    instance.initialise = function () {
        if (this.initialised) return;
        var questsTab = $("#questsTopTab");
        var tab = '<li role="presentation" id="artifactsTopTab"><a href="#artifactsPage" aria-controls="artifactsPage" role="tab" data-toggle="tab">' +
            '<span class="glyphicon glyphicon-certificate"></span> Artifacts</a></li>';
        if (questsTab.length) questsTab.after(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="artifactsPage">' +
            '<section class="myco-artifact-hero"><div><div class="myco-eyebrow">ANCIENT RELICS</div><h2>Artifacts</h2>' +
            '<p>Recover relics during expeditions and equip one artifact in each colony slot.</p></div>' +
            '<div class="myco-artifact-count"><span>DISCOVERED</span><strong id="artifactProgress">0 / 10</strong></div></section>' +
            '<div id="artifactSlots" class="myco-artifact-slots"></div><div id="artifactGrid" class="myco-artifact-grid"></div></div>'
        );

        $("#artifactGrid").on("click", "button[data-artifact-id]", function () {
            Game.artifacts.equip($(this).data("artifact-id"));
            instance.render();
        });
        $("#artifactSlots").on("click", "button[data-artifact-slot]", function () {
            Game.artifacts.unequip($(this).data("artifact-slot"));
            instance.render();
        });
        this.initialised = true;
        this.render();
    };

    instance.renderSlots = function () {
        var html = [];
        for (var i = 0; i < Game.artifactData.slots.length; i++) {
            var slot = Game.artifactData.slots[i];
            var id = Game.artifacts.equipped[slot];
            var artifact = id ? Game.artifactData.entries[id] : null;
            html.push('<article class="myco-artifact-slot ' + (artifact ? 'filled' : '') + '">' +
                '<div class="myco-eyebrow">' + slot.toUpperCase() + ' SLOT</div><h3>' + (artifact ? artifact.name : 'Empty slot') + '</h3>' +
                '<p>' + (artifact ? Game.artifacts.getBonusText(id) : 'Equip a compatible artifact from your collection.') + '</p>' +
                (artifact ? '<button class="btn btn-default" data-artifact-slot="' + slot + '">Unequip</button>' : '') + '</article>');
        }
        $("#artifactSlots").html(html.join(""));
    };

    instance.renderGrid = function () {
        var html = [];
        $("#artifactProgress").text(Game.artifacts.getOwnedCount() + " / " + Game.artifactData.order.length);
        for (var i = 0; i < Game.artifactData.order.length; i++) {
            var id = Game.artifactData.order[i];
            var artifact = Game.artifactData.entries[id];
            var count = Game.artifacts.getCount(id);
            var owned = count > 0;
            var equipped = Game.artifacts.isEquipped(id);
            var r = rarity(id);
            html.push('<article class="myco-artifact-card ' + (owned ? '' : 'locked') + '" style="--artifact-color:' + r.color + '">' +
                '<div class="myco-artifact-symbol">✦</div><div class="myco-eyebrow">' + r.name.toUpperCase() + ' · ' + artifact.slot.toUpperCase() + '</div>' +
                '<h3>' + artifact.name + '</h3><p>' + artifact.description + '</p>' +
                '<div class="myco-artifact-bonus">' + Game.artifacts.getBonusText(id) + '</div>' +
                '<div class="myco-artifact-meta"><span>Copies: ' + count + '</span><span>' + (equipped ? 'EQUIPPED' : artifact.planetId) + '</span></div>' +
                '<button class="btn btn-warning" data-artifact-id="' + id + '"' + ((!owned || equipped) ? ' disabled' : '') + '>' +
                (equipped ? 'Equipped' : (owned ? 'Equip artifact' : 'Undiscovered')) + '</button></article>');
        }
        $("#artifactGrid").html(html.join(""));
    };

    instance.render = function () {
        if (!this.initialised) return;
        this.renderSlots();
        this.renderGrid();
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.75) { this.elapsed = 0; this.render(); }
    };

    return instance;
}());
