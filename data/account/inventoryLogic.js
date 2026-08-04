Game.inventory = (function () {
    "use strict";

    var instance = {};

    instance.getMinerItems = function () {
        var result = [];
        if (!Game.miners || !Game.miners.getEntriesSorted) return result;
        var entries = Game.miners.getEntriesSorted();
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (entry.owned <= 0) continue;
            result.push({
                id: entry.id,
                type: "miner",
                name: entry.definition.name,
                rarity: entry.definition.rarity.name,
                rarityColor: entry.definition.rarity.color,
                owned: entry.owned,
                level: entry.level,
                resource: entry.definition.resource,
                description: entry.definition.description,
                income: Game.miners.getMinerIncome(entry.id)
            });
        }
        return result;
    };

    instance.getArtifactItems = function () {
        var result = [];
        if (!Game.artifacts || !Game.artifactData) return result;
        for (var i = 0; i < Game.artifactData.order.length; i++) {
            var id = Game.artifactData.order[i];
            var count = Game.artifacts.getCount(id);
            if (count <= 0) continue;
            var definition = Game.artifactData.entries[id];
            var rarity = Game.artifactData.rarities[definition.rarity];
            result.push({
                id: id,
                type: "artifact",
                name: definition.name,
                rarity: rarity.name,
                rarityColor: rarity.color,
                owned: count,
                slot: definition.slot,
                description: definition.description,
                equipped: Game.artifacts.isEquipped(id),
                bonusText: Game.artifacts.getBonusText(id)
            });
        }
        return result;
    };

    instance.getSummary = function () {
        var miners = this.getMinerItems();
        var artifacts = this.getArtifactItems();
        var specimens = 0;
        for (var i = 0; i < miners.length; i++) specimens += miners[i].owned;
        var copies = 0;
        for (var j = 0; j < artifacts.length; j++) copies += artifacts[j].owned;
        var score = miners.length * 50 + specimens * 5 + artifacts.length * 100 + copies * 10;
        return {
            minerSpecies: miners.length,
            specimens: specimens,
            artifacts: artifacts.length,
            artifactCopies: copies,
            collectionScore: score
        };
    };

    return instance;
}());
