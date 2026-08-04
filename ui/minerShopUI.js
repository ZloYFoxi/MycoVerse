Game.minerShopUI = (function () {
    "use strict";
    var instance = { initialised: false, elapsed: 0 };
    function fmt(v) { return Game.utils && Game.utils.formatNumber ? Game.utils.formatNumber(v) : Math.floor(v).toLocaleString(); }
    function resourceName(id) { return Game.resourceData && Game.resourceData[id] ? Game.resourceData[id].name : id; }
    instance.initialise = function () {
        if (this.initialised) return;
        $("#tabList").append('<li role="presentation" id="minerShopTopTab"><a href="#minerShopPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-gift"></span> Miner Shop</a></li>');
        $("#tabContent").append('<div role="tabpanel" class="tab-pane fade" id="minerShopPage"><section class="myco-market-head"><div><div class="myco-eyebrow">COLONY RECRUITMENT</div><h2>Miner Shop</h2><p>Thirty-five miners are arranged by rarity and strength. New recruits unlock with every Commander Level.</p></div><div class="myco-wallet-card"><span>MycoCoins</span><strong id="minerShopCoins">0</strong><small id="minerShopLevel">Level 1</small></div></section><div id="minerShopSections"></div></div>');
        $(document).on("click", ".miner-shop-buy", function () { Game.minerShop.buy($(this).attr("data-miner-id")); instance.render(); if (Game.minerUI) Game.minerUI.render(); });
        this.initialised = true; this.render();
    };
    instance.render = function () {
        if (!this.initialised) return;
        var lvl = Game.account.getLevelInfo().level;
        $("#minerShopCoins").text(fmt(Game.account.getBalance("mycoCoins")));
        $("#minerShopLevel").text("Commander Level " + lvl);
        var rarityIds = Game.minerShop.getRarityOrder(), html = [];
        for (var r = 0; r < rarityIds.length; r++) {
            var rarityId = rarityIds[r], list = Game.minerShop.getByRarity(rarityId);
            if (!list.length) continue;
            var rarity = list[0].definition.rarity;
            var cards = [];
            for (var i = 0; i < list.length; i++) {
                var x = list[i], d = x.definition;
                var status = x.free ? "FREE FIRST COPY" : (x.unlocked ? (x.owned > 0 ? "Owned: " + x.owned : "Available now") : "Unlocks at Level " + x.unlockLevel);
                var button = x.free ? '<button class="btn btn-success miner-shop-buy" data-miner-id="'+x.id+'">Claim Free</button>' :
                    '<button class="btn '+(x.unlocked?'btn-success':'btn-default')+' miner-shop-buy" data-miner-id="'+x.id+'" '+(x.unlocked?'':'disabled')+'>Buy — '+fmt(x.price)+'</button>';
                cards.push('<article class="myco-offer-card '+(x.unlocked?'':'miner-shop-locked')+'" style="border-color:'+rarity.color+'"><div class="myco-offer-type">Rank '+(d.shopRank||1)+' • '+status+'</div><div class="myco-shop-miner-art"><img src="'+Game.visualAssets.getMinerPortrait(x.id)+'" alt="'+d.name+' portrait" loading="lazy" decoding="async"></div><h4>'+d.name+'</h4><p>'+d.description+'</p><div><strong>Base production:</strong> '+fmt(d.incomePerMinute)+' '+resourceName(d.resource)+'/min</div><div><strong>Purchase XP:</strong> +'+x.xp+'</div><div class="myco-offer-footer"><strong>'+rarity.name+'</strong>'+button+'</div></article>');
            }
            html.push('<section class="myco-shop-rarity-section"><div class="myco-shop-rarity-heading" style="border-color:'+rarity.color+'"><div><span class="myco-eyebrow">'+rarity.name.toUpperCase()+' COLLECTION</span><h3>'+rarity.name+' Miners</h3></div><strong>7 miners • weakest → strongest</strong></div><div class="myco-market-grid">'+cards.join('')+'</div></section>');
        }
        $("#minerShopSections").html(html.join(""));
    };
    instance.update = function (d) { this.elapsed += d; if (this.elapsed >= 1) { this.elapsed = 0; this.render(); } };
    return instance;
}());
