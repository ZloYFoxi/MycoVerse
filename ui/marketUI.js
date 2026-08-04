Game.marketUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function fmt(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    function timeString(ms) {
        ms = Math.max(0, Math.floor(ms / 1000));
        var h = Math.floor(ms / 3600);
        var m = Math.floor((ms % 3600) / 60);
        var s = ms % 60;
        return (h > 0 ? h + "h " : "") + (m > 0 ? m + "m " : "") + s + "s";
    }

    instance.initialise = function () {
        if (this.initialised) return;
        $("#tabList").append('<li role="presentation" id="marketTopTab"><a href="#marketPage" aria-controls="marketPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-shopping-cart"></span> Marketplace</a></li>');
        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="marketPage">' +
            '<section class="myco-market-head">' +
            '<div><div class="myco-eyebrow">TRADING NETWORK</div><h2>Marketplace Prototype</h2><p>Buy curated miners and relics with MycoCoins. Sell spare specimens to finance the next expansion.</p></div>' +
            '<div class="myco-market-actions"><div class="myco-wallet-card"><span>MycoCoins</span><strong id="marketCoins">0</strong></div><button id="marketRefresh" class="btn btn-default">Refresh Now (60)</button><div class="myco-small-note" id="marketRefreshTimer"></div></div>' +
            '</section>' +
            '<section class="myco-panel-grid"><article class="myco-panel"><h3>Featured offers</h3><div id="marketOffers" class="myco-market-grid"></div></article><article class="myco-panel"><h3>Sell duplicates</h3><div id="marketSellList" class="myco-sell-list"></div></article></section>' +
            '<section class="myco-panel"><h3>Recent activity</h3><div id="marketHistory" class="myco-history-list"></div></section>' +
            '</div>'
        );

        $(document).on("click", ".market-buy-button", function () {
            Game.market.buyOffer($(this).attr("data-offer-id"));
            instance.render();
        });
        $(document).on("click", ".market-sell-button", function () {
            Game.market.sellMiner($(this).attr("data-miner-id"));
            instance.render();
        });
        $(document).on("click", "#marketRefresh", function () {
            Game.market.refreshNow();
            instance.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.render = function () {
        if (!this.initialised) return;
        $("#marketCoins").text(fmt(Game.account.getBalance("mycoCoins")));
        $("#marketRefreshTimer").text("Auto refresh in " + timeString(Game.market.getRefreshRemaining()));

        var offers = Game.market.getOffers();
        var offerHtml = [];
        for (var i = 0; i < offers.length; i++) {
            var offer = offers[i];
            if (offer.itemType === 'miner' && Game.minerData[offer.itemId]) {
                var d = Game.minerData[offer.itemId];
                var ownedCount = 0;
                var allMiners = Game.miners.getEntriesSorted();
                for (var oi = 0; oi < allMiners.length; oi++) if (allMiners[oi].id === offer.itemId) { ownedCount = allMiners[oi].owned; break; }
                var shopLike = { id: offer.itemId, definition: d, free: false, unlocked: true, owned: ownedCount, unlockLevel: 0, xp: 0 };
                var buy = '<div class="myco-card-footer"><strong>' + fmt(offer.price) + ' MycoCoins</strong><button class="btn btn-success market-buy-button" data-offer-id="' + offer.id + '">Buy</button></div>';
                offerHtml.push(Game.minerCardUI.shopCard(shopLike, buy));
            } else {
                offerHtml.push('<div class="myco-offer-card"><div class="myco-offer-type">' + offer.itemType.toUpperCase() + ' • ' + offer.rarity + '</div><h4>' + offer.title + '</h4><p>' + offer.description + '</p><div class="myco-offer-footer"><strong>' + fmt(offer.price) + ' MycoCoins</strong><button class="btn btn-success market-buy-button" data-offer-id="' + offer.id + '">Buy</button></div></div>');
            }
        }
        $("#marketOffers").html(offerHtml.join("") || '<p class="text-muted">No offers available.</p>');

        var sellHtml = [];
        var miners = Game.miners.getEntriesSorted();
        for (var j = 0; j < miners.length; j++) {
            var miner = miners[j];
            if (miner.owned <= 1) continue;
            var price = Game.market.getSellPrice(miner.id);
            sellHtml.push(
                '<div class="myco-sell-row myco-sell-row-with-portrait rarity-' + miner.definition.rarity.id + '" style="--rarity:' + miner.definition.rarity.color + '"><img class="myco-sell-miner-portrait" src="' + Game.visualAssets.getMinerPortrait(miner.id) + '" alt="' + miner.definition.name + ' portrait" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=Game.visualAssets.getMinerPortraitFallback();"><div><strong>' + miner.definition.name + '</strong><div class="myco-small-note">Owned: ' + miner.owned + ' • Level ' + miner.level + '</div></div>' +
                '<div><strong>' + fmt(price) + '</strong> <button class="btn btn-warning market-sell-button" data-miner-id="' + miner.id + '">Sell 1</button></div></div>'
            );
        }
        $("#marketSellList").html(sellHtml.join("") || '<p class="text-muted">Collect duplicate miners to sell them here.</p>');

        var history = Game.market.history || [];
        var historyHtml = [];
        for (var k = 0; k < history.length; k++) {
            var row = history[k];
            historyHtml.push('<div class="myco-history-row"><span>' + (row.type === 'buy' ? 'Bought' : 'Sold') + ' ' + row.title + '</span><strong>' + fmt(row.price) + ' MycoCoins</strong></div>');
        }
        $("#marketHistory").html(historyHtml.join("") || '<p class="text-muted">Your transactions will appear here.</p>');
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 1) { this.elapsed = 0; this.render(); }
    };

    return instance;
}());
