Game.accountUI = (function () {
    "use strict";
    var instance={initialised:false,elapsed:0};
    function fmt(v){return Game.utils&&Game.utils.formatNumber?Game.utils.formatNumber(v):Math.floor(v).toLocaleString();}
    function time(ms){ms=Math.max(0,Math.floor(ms/1000));var h=Math.floor(ms/3600),m=Math.floor((ms%3600)/60),s=ms%60;return(h?h+"h ":"")+(m?m+"m ":"")+s+"s";}
    instance.initialise=function(){
        if(this.initialised)return;
        $("#tabList").append('<li role="presentation" id="accountTopTab"><a href="#accountPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-user"></span> Account</a></li>');
        $("#tabContent").append('<div role="tabpanel" class="tab-pane fade" id="accountPage">'+
        '<section class="myco-profile-hero"><div class="myco-profile-avatar" id="accountAvatarBig">🍄</div><div><div class="myco-eyebrow">LOCAL COMMANDER PROFILE</div><h2 id="accountNameHeading">Wandering Spore</h2><p><span id="accountTitleText"></span> • <span id="accountIdText"></span></p><div class="myco-level-track"><span id="accountLevelProgress"></span></div><strong id="accountLevelText">Level 1</strong><div class="myco-small-note" id="accountTotalXp">0 total XP</div></div></section>'+
        '<section class="myco-panel-grid"><article class="myco-panel"><h3>Identity</h3><div class="myco-form-row"><input id="accountNameInput" class="form-control" maxlength="24"><button id="accountSaveName" class="btn btn-success">Save</button></div><label>Avatar</label><select id="accountAvatarSelect" class="form-control"></select><label>Title</label><select id="accountTitleSelect" class="form-control"></select><div class="myco-kv-list"><div><span>Joined</span><strong id="accountJoinedText"></strong></div><div><span>Backend status</span><strong id="accountBackendStatus"></strong></div></div></article>'+
        '<article class="myco-panel"><h3>Wallet & Progress</h3><div class="myco-wallet-grid"><div class="myco-wallet-card"><span>MycoCoins</span><strong id="accountCoins">0</strong></div><div class="myco-wallet-card"><span>Bloom Tokens</span><strong id="accountTokens">0</strong></div><div class="myco-wallet-card"><span>Species</span><strong id="accountSpecies">0</strong></div><div class="myco-wallet-card"><span>Planets</span><strong id="accountPlanets">0</strong></div></div><div class="myco-kv-list"><div><span>Colony Power</span><strong id="accountPower">0</strong></div><div><span>Ascensions</span><strong id="accountAscensionsText">0</strong></div><div><span>Collection Score</span><strong id="accountCollectionScore">0</strong></div></div></article></section>'+
        '<section class="myco-panel-grid"><article class="myco-panel"><div class="myco-eyebrow">DAILY SUPPLY DROP</div><h3>Network Reward</h3><div id="dailyRewardText" class="myco-note"></div><button id="claimDailyReward" class="btn btn-warning">Claim Daily Reward</button><div id="dailyRewardTimer" class="myco-small-note"></div></article><article class="myco-panel"><div class="myco-eyebrow">BACKEND-READY PROFILE</div><h3>Snapshot & Sync Layer</h3><p>The game still runs locally, but profile data now passes through a dedicated service layer ready for a future server.</p><button id="accountCreateSnapshot" class="btn btn-default">Create Local Snapshot</button><textarea id="accountSnapshotCode" class="form-control myco-code-box" readonly></textarea></article></section></div>');
        $(document).on("click","#accountSaveName",function(){Game.account.rename($("#accountNameInput").val());instance.render();});
        $(document).on("change","#accountAvatarSelect",function(){Game.account.setAvatar($(this).val());instance.render();});
        $(document).on("change","#accountTitleSelect",function(){Game.account.setTitle($(this).val());instance.render();});
        $(document).on("click","#claimDailyReward",function(){Game.account.claimDaily();instance.render();});
        $(document).on("click","#accountCreateSnapshot",function(){Game.backend.simulateLocalSync();$("#accountSnapshotCode").val(Game.backend.exportProfileCode());instance.render();});
        this.initialised=true;this.render();
    };
    instance.render=function(){
        if(!this.initialised)return;var s=Game.account.getSummary(),lvl=Game.account.getLevelInfo(),inv=Game.inventory.getSummary();
        $("#accountNameHeading").text(s.name);$("#accountIdText").text(s.id);$("#accountTitleText").text(s.title);$("#accountAvatarBig").text(s.avatar);$("#accountJoinedText").text(new Date(s.createdAt).toLocaleDateString());
        $("#accountCoins").text(fmt(s.mycoCoins));$("#accountTokens").text(fmt(s.bloomTokens));$("#accountSpecies").text(fmt(s.species));$("#accountPlanets").text(fmt(s.unlockedPlanets));$("#accountPower").text(fmt(s.power));$("#accountAscensionsText").text(fmt(s.ascensions));$("#accountCollectionScore").text(fmt(inv.collectionScore));
        $("#accountLevelText").text("Commander Level "+lvl.level+" • "+fmt(lvl.current)+" / "+fmt(lvl.required));$("#accountTotalXp").text(fmt(lvl.totalXp)+" total XP");$("#accountLevelProgress").css("width",lvl.percent+"%");$("#accountBackendStatus").text(Game.backend.getStatusLabel());$("#accountNameInput").val(s.name);
        var av=Game.account.getAvailableAvatars(),ao=[];for(var i=0;i<av.length;i++)ao.push('<option '+(av[i]===s.avatar?'selected':'')+'>'+av[i]+'</option>');$("#accountAvatarSelect").html(ao.join(""));
        var titles=Game.account.getAvailableTitles(),to=[];for(var j=0;j<titles.length;j++)to.push('<option '+(titles[j]===s.title?'selected':'')+'>'+titles[j]+'</option>');$("#accountTitleSelect").html(to.join(""));
        var r=Game.account.getDailyReward(),can=Game.account.canClaimDaily();$("#dailyRewardText").text("+"+r.mycoCoins+" MycoCoins, +"+r.bloomTokens+" Bloom Token and +"+r.xp+" XP");$("#claimDailyReward").prop("disabled",!can);$("#dailyRewardTimer").text(can?"Reward ready now.":"Next reward in "+time(Game.account.getDailyRemaining()));
    };
    instance.update=function(d){this.elapsed+=d;if(this.elapsed>=1){this.elapsed=0;this.render();}};
    return instance;
}());
