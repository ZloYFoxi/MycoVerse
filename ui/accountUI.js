Game.accountUI = (function () {
    "use strict";

    var instance = { initialised:false, elapsed:0 };

    function fmt(v) {
        return Game.utils && Game.utils.formatNumber ? Game.utils.formatNumber(v) : Math.floor(Number(v || 0)).toLocaleString();
    }

    function time(ms) {
        ms=Math.max(0,Math.floor(ms/1000));
        var h=Math.floor(ms/3600),m=Math.floor((ms%3600)/60),s=ms%60;
        return(h?h+"h ":"")+(m?m+"m ":"")+s+"s";
    }

    function pctAmount(balance, percent) {
        return Math.max(0, Math.floor(Number(balance || 0) * Number(percent || 0) / 100));
    }

    function renderExchangeHistory() {
        var history = Game.exchange.getSummary().history || [];
        var html = [];
        for (var i = 0; i < history.length; i++) {
            var row = history[i];
            var text = row.direction === 'sporesToCoins'
                ? fmt(row.sourceAmount) + ' Spores → ' + fmt(row.resultAmount) + ' MycoCoins'
                : fmt(row.sourceAmount) + ' MycoCoins → ' + fmt(row.resultAmount) + ' Spores';
            html.push('<div class="myco-history-row"><span>'+text+'</span><small>'+new Date(row.at).toLocaleString()+'</small></div>');
        }
        $('#accountExchangeHistory').html(html.join('') || '<p class="myco-small-note">No exchanges yet.</p>');
    }

    function updateExchangePreviews() {
        var sporeInput = Math.max(0, Math.floor(Number($('#sporesToCoinsAmount').val() || 0)));
        var coinInput = Math.max(0, Math.floor(Number($('#coinsToSporesAmount').val() || 0)));
        var sporePreview = Game.exchange.previewSporesToCoins(sporeInput);
        var coinPreview = Game.exchange.previewCoinsToSpores(coinInput);
        $('#sporesToCoinsPreview').text(
            sporePreview.output > 0
                ? fmt(sporePreview.spent) + ' Spores → ' + fmt(sporePreview.output) + ' MycoCoins' + (sporePreview.limited ? ' • daily limit applied' : '')
                : 'Enter at least ' + fmt(Game.exchange.config.sporesPerMycoCoin) + ' Spores.'
        );
        $('#coinsToSporesPreview').text(
            coinPreview.output > 0
                ? fmt(coinPreview.spent) + ' MycoCoins → ' + fmt(coinPreview.output) + ' Spores'
                : 'Enter at least 1 MycoCoin.'
        );
    }

    instance.initialise=function(){
        if(this.initialised)return;
        $("#tabList").append('<li role="presentation" id="accountTopTab"><a href="#accountPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-user"></span> Account</a></li>');
        $("#tabContent").append('<div role="tabpanel" class="tab-pane fade" id="accountPage">'+
        '<section class="myco-profile-hero"><div class="myco-profile-avatar" id="accountAvatarBig">🍄</div><div><div class="myco-eyebrow">LOCAL COMMANDER PROFILE</div><h2 id="accountNameHeading">Wandering Spore</h2><p><span id="accountTitleText"></span> • <span id="accountIdText"></span></p><div class="myco-level-track"><span id="accountLevelProgress"></span></div><strong id="accountLevelText">Level 1</strong><div class="myco-small-note" id="accountTotalXp">0 total XP</div></div></section>'+
        '<section class="myco-panel-grid"><article class="myco-panel"><h3>Identity</h3><div class="myco-form-row"><input id="accountNameInput" class="form-control" maxlength="24"><button id="accountSaveName" class="btn btn-success">Save</button></div><label>Avatar</label><select id="accountAvatarSelect" class="form-control"></select><label>Title</label><select id="accountTitleSelect" class="form-control"></select><div class="myco-kv-list"><div><span>Joined</span><strong id="accountJoinedText"></strong></div><div><span>Backend status</span><strong id="accountBackendStatus"></strong></div></div></article>'+
        '<article class="myco-panel"><h3>Wallet & Progress</h3><div class="myco-wallet-grid"><div class="myco-wallet-card"><span>Spores</span><strong id="accountSpores">0</strong></div><div class="myco-wallet-card"><span>Gems</span><strong id="accountGems">0</strong></div><div class="myco-wallet-card"><span>Science</span><strong id="accountScience">0</strong></div><div class="myco-wallet-card"><span>MycoCoins</span><strong id="accountCoins">0</strong></div><div class="myco-wallet-card"><span>Bloom Tokens</span><strong id="accountTokens">0</strong></div><div class="myco-wallet-card"><span>World Boss Tokens</span><strong id="accountBossTokens">0</strong></div></div><div class="myco-kv-list"><div><span>Species</span><strong id="accountSpecies">0</strong></div><div><span>Planets</span><strong id="accountPlanets">0</strong></div><div><span>Colony Power</span><strong id="accountPower">0</strong></div><div><span>Ascensions</span><strong id="accountAscensionsText">0</strong></div><div><span>Collection Score</span><strong id="accountCollectionScore">0</strong></div></div></article></section>'+
        '<section class="myco-panel"><div class="myco-eyebrow">CURRENCY EXCHANGE</div><h3>Spores ↔ MycoCoins</h3><p class="myco-small-note">The return rate is intentionally lower than the purchase rate, preventing profit from repeated back-and-forth exchanges.</p><div class="myco-exchange-summary"><span id="exchangeRateForward"></span><span id="exchangeRateReverse"></span><span id="exchangeDailyLimit"></span></div><div class="myco-exchange-grid">'+
            '<article class="myco-exchange-card"><h4>Spores → MycoCoins</h4><label>Spores to spend<input id="sporesToCoinsAmount" class="form-control" type="number" min="0" step="1" value="100"></label><div class="myco-exchange-quick"><button class="btn btn-default exchange-spore-percent" data-percent="25">25%</button><button class="btn btn-default exchange-spore-percent" data-percent="50">50%</button><button class="btn btn-default exchange-spore-percent" data-percent="100">Max</button></div><div id="sporesToCoinsPreview" class="myco-note"></div><button id="convertSporesToCoins" class="btn btn-success">Convert to MycoCoins</button></article>'+
            '<article class="myco-exchange-card"><h4>MycoCoins → Spores</h4><label>MycoCoins to spend<input id="coinsToSporesAmount" class="form-control" type="number" min="0" step="1" value="1"></label><div class="myco-exchange-quick"><button class="btn btn-default exchange-coin-percent" data-percent="25">25%</button><button class="btn btn-default exchange-coin-percent" data-percent="50">50%</button><button class="btn btn-default exchange-coin-percent" data-percent="100">Max</button></div><div id="coinsToSporesPreview" class="myco-note"></div><button id="convertCoinsToSpores" class="btn btn-primary">Convert to Spores</button></article>'+
        '</div><h4>Recent Exchanges</h4><div id="accountExchangeHistory" class="myco-history-list"></div></section><br>'+
        '<section class="myco-panel-grid"><article class="myco-panel"><div class="myco-eyebrow">DAILY SUPPLY DROP</div><h3>Network Reward</h3><div id="dailyRewardText" class="myco-note"></div><button id="claimDailyReward" class="btn btn-warning">Claim Daily Reward</button><div id="dailyRewardTimer" class="myco-small-note"></div></article><article class="myco-panel"><div class="myco-eyebrow">BACKEND-READY PROFILE</div><h3>Snapshot & Sync Layer</h3><p>The game still runs locally, but profile data now passes through a dedicated service layer ready for a future server.</p><button id="accountCreateSnapshot" class="btn btn-default">Create Local Snapshot</button><textarea id="accountSnapshotCode" class="form-control myco-code-box" readonly></textarea></article></section></div>');

        $(document).on("click","#accountSaveName",function(){Game.account.rename($("#accountNameInput").val());instance.render();});
        $(document).on("change","#accountAvatarSelect",function(){Game.account.setAvatar($(this).val());instance.render();});
        $(document).on("change","#accountTitleSelect",function(){Game.account.setTitle($(this).val());instance.render();});
        $(document).on("click","#claimDailyReward",function(){Game.account.claimDaily();instance.render();});
        $(document).on("click","#accountCreateSnapshot",function(){Game.backend.simulateLocalSync();$("#accountSnapshotCode").val(Game.backend.exportProfileCode());instance.render();});
        $(document).on('input','#sporesToCoinsAmount,#coinsToSporesAmount',updateExchangePreviews);
        $(document).on('click','.exchange-spore-percent',function(){ $('#sporesToCoinsAmount').val(pctAmount(Game.exchange.getSporeBalance(),$(this).attr('data-percent'))); updateExchangePreviews(); });
        $(document).on('click','.exchange-coin-percent',function(){ $('#coinsToSporesAmount').val(pctAmount(Game.exchange.getCoinBalance(),$(this).attr('data-percent'))); updateExchangePreviews(); });
        $(document).on('click','#convertSporesToCoins',function(){ Game.exchange.convertSporesToCoins($('#sporesToCoinsAmount').val()); instance.render(); });
        $(document).on('click','#convertCoinsToSpores',function(){ Game.exchange.convertCoinsToSpores($('#coinsToSporesAmount').val()); instance.render(); });
        this.initialised=true;
        this.render();
    };

    instance.render=function(){
        if(!this.initialised)return;
        var s=Game.account.getSummary(),lvl=Game.account.getLevelInfo(),inv=Game.inventory.getSummary(),exchange=Game.exchange.getSummary();
        $("#accountNameHeading").text(s.name);$("#accountIdText").text(s.id);$("#accountTitleText").text(s.title);$("#accountAvatarBig").text(s.avatar);$("#accountJoinedText").text(new Date(s.createdAt).toLocaleDateString());
        $("#accountSpores").text(fmt(Game.resources.getResource(RESOURCE.Wood)));$("#accountGems").text(fmt(Game.resources.getResource(RESOURCE.Gem)));$("#accountScience").text(fmt(Game.resources.getResource(RESOURCE.Science)));
        $("#accountCoins").text(fmt(s.mycoCoins));$("#accountTokens").text(fmt(s.bloomTokens));$("#accountBossTokens").text(fmt(Game.account.getBalance('worldBossTokens')));$("#accountSpecies").text(fmt(s.species));$("#accountPlanets").text(fmt(s.unlockedPlanets));$("#accountPower").text(fmt(s.power));$("#accountAscensionsText").text(fmt(s.ascensions));$("#accountCollectionScore").text(fmt(inv.collectionScore));
        $("#accountLevelText").text("Commander Level "+lvl.level+" • "+fmt(lvl.current)+" / "+fmt(lvl.required));$("#accountTotalXp").text(fmt(lvl.totalXp)+" total XP");$("#accountLevelProgress").css("width",lvl.percent+"%");$("#accountBackendStatus").text(Game.backend.getStatusLabel());$("#accountNameInput").val(s.name);
        var av=Game.account.getAvailableAvatars(),ao=[];for(var i=0;i<av.length;i++)ao.push('<option '+(av[i]===s.avatar?'selected':'')+'>'+av[i]+'</option>');$("#accountAvatarSelect").html(ao.join(""));
        var titles=Game.account.getAvailableTitles(),to=[];for(var j=0;j<titles.length;j++)to.push('<option '+(titles[j]===s.title?'selected':'')+'>'+titles[j]+'</option>');$("#accountTitleSelect").html(to.join(""));
        var r=Game.account.getDailyReward(),can=Game.account.canClaimDaily();$("#dailyRewardText").text("+"+r.mycoCoins+" MycoCoins, +"+r.bloomTokens+" Bloom Token and +"+r.xp+" XP");$("#claimDailyReward").prop("disabled",!can);$("#dailyRewardTimer").text(can?"Reward ready now.":"Next reward in "+time(Game.account.getDailyRemaining()));
        $('#exchangeRateForward').text(fmt(exchange.sporesPerMycoCoin)+' Spores = 1 MycoCoin');
        $('#exchangeRateReverse').text('1 MycoCoin = '+fmt(exchange.sporesReturnedPerMycoCoin)+' Spores');
        $('#exchangeDailyLimit').text('Daily remaining: '+fmt(exchange.remainingDailyCoins)+' / '+fmt(exchange.dailyLimit)+' MycoCoins');
        updateExchangePreviews();
        renderExchangeHistory();
    };

    instance.update=function(d){this.elapsed+=d;if(this.elapsed>=1){this.elapsed=0;this.render();}};
    return instance;
}());
