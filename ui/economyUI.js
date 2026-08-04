Game.economyUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function fmt(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    function time(seconds) {
        if (!isFinite(seconds)) return "Never";
        seconds = Math.max(0, Math.floor(seconds));
        var d = Math.floor(seconds / 86400);
        var h = Math.floor((seconds % 86400) / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = seconds % 60;
        if (d > 0) return d + "d " + h + "h";
        if (h > 0) return h + "h " + m + "m";
        if (m > 0) return m + "m " + s + "s";
        return s + "s";
    }

    function resourceName(id) {
        return Game.resourceData && Game.resourceData[id] ? Game.resourceData[id].name : id;
    }

    instance.initialise = function () {
        if (this.initialised) return;
        $("#tabList").append('<li role="presentation" id="economyTopTab"><a href="#economyPage" aria-controls="economyPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-stats"></span> Economy</a></li>');
        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="economyPage">' +
            '<section class="myco-economy-hero"><div><div class="myco-eyebrow">COLONY ECONOMICS</div><h2>Economy & ROI Center</h2><p>Compare upgrades by payback time, track production value, and keep Marketplace prices tied to real colony output.</p></div><div class="myco-economy-health"><span>Economy Health</span><strong id="economyHealthScore">0</strong><em id="economyHealthLabel">Developing</em></div></section>' +
            '<section class="myco-wallet-grid myco-economy-summary"><div class="myco-wallet-card"><span>Production Index</span><strong id="economyProductionIndex">0</strong></div><div class="myco-wallet-card"><span>Market Index</span><strong id="economyMarketIndex">0</strong></div><div class="myco-wallet-card"><span>Spores Invested</span><strong id="economySpent">0</strong></div><div class="myco-wallet-card"><span>Market Volume</span><strong id="economyVolume">0</strong></div></section>' +
            '<section class="myco-panel-grid"><article class="myco-panel"><div class="myco-eyebrow">BEST NEXT MOVE</div><div id="economyRecommendation"></div></article><article class="myco-panel"><div class="myco-eyebrow">VALUE MODEL</div><h3>Spore Equivalent Rates</h3><div id="economyResourceValues" class="myco-kv-list"></div></article></section>' +
            '<section class="myco-panel"><h3>Miner Upgrade ROI</h3><div class="table-responsive"><table class="table myco-economy-table"><thead><tr><th>Miner</th><th>Level</th><th>Cost</th><th>Added income</th><th>Payback</th><th>Grade</th></tr></thead><tbody id="economyRoiRows"></tbody></table></div></section>' +
            '<section class="myco-panel"><h3>Recent Economy Activity</h3><div id="economyTransactions" class="myco-history-list"></div></section>' +
            '</div>'
        );
        this.initialised = true;
        this.render();
    };

    instance.render = function () {
        if (!this.initialised) return;
        var health = Game.economy.getHealth();
        $("#economyHealthScore").text(health.score + "/100");
        $("#economyHealthLabel").text(health.label);
        $("#economyProductionIndex").text(Game.economy.getProductionIndex().toFixed(2) + "/s");
        $("#economyMarketIndex").text(fmt(Game.economy.getMarketIndex()));
        $("#economySpent").text(fmt(Game.economy.totalSpentSpores));
        $("#economyVolume").text(fmt(Game.economy.totalMarketVolume));

        var best = Game.economy.getBestUpgrade();
        if (best) {
            $("#economyRecommendation").html('<h3>' + best.name + '</h3><p>Upgrade to level ' + (best.level + 1) + ' for <strong>' + fmt(best.cost) + ' Spores</strong>.</p><div class="myco-economy-callout"><span>Estimated payback</span><strong>' + time(best.paybackSeconds) + '</strong><em>Grade ' + best.grade + ' — ' + best.label + '</em></div>');
        } else {
            $("#economyRecommendation").html('<p class="text-muted">Awaken a miner to receive an ROI recommendation.</p>');
        }

        var valueRows = [];
        for (var id in Game.economyData.resourceValues) {
            if (!Game.economyData.resourceValues.hasOwnProperty(id)) continue;
            valueRows.push('<div><span>1 ' + resourceName(id) + '</span><strong>' + Game.economyData.resourceValues[id] + ' Spore Value</strong></div>');
        }
        $("#economyResourceValues").html(valueRows.join(""));

        var analyses = Game.economy.getAllUpgradeAnalyses();
        var rows = [];
        for (var i = 0; i < analyses.length; i++) {
            var a = analyses[i];
            rows.push('<tr><td><strong>' + a.name + '</strong><div class="myco-small-note">' + resourceName(a.resource) + '</div></td><td>' + a.level + ' → ' + (a.level + 1) + '</td><td>' + fmt(a.cost) + '</td><td>+' + a.incrementalIncome.toFixed(3) + '/s</td><td>' + time(a.paybackSeconds) + '</td><td><span class="myco-roi-grade grade-' + a.grade.toLowerCase() + '">' + a.grade + '</span> ' + a.label + '</td></tr>');
        }
        $("#economyRoiRows").html(rows.join("") || '<tr><td colspan="6" class="text-muted">No available upgrades.</td></tr>');

        var tx = Game.economy.transactions.slice().reverse();
        var txRows = [];
        for (var j = 0; j < tx.length; j++) {
            var t = tx[j];
            txRows.push('<div class="myco-history-row"><span>' + t.label + ' <small>(' + t.type + ')</small></span><strong>' + fmt(t.amount) + ' ' + (t.currency === 'spores' ? 'Spores' : 'MycoCoins') + '</strong></div>');
        }
        $("#economyTransactions").html(txRows.join("") || '<p class="text-muted">Upgrade, clone, awaken, buy, or sell to build an economy history.</p>');
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 1) { this.elapsed = 0; this.render(); }
    };

    return instance;
}());
