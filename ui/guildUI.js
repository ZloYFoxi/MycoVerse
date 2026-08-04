Game.guildUI = (function () {
    "use strict";
    var instance={initialised:false,elapsed:0};
    function fmt(v){return Game.utils&&Game.utils.formatNumber?Game.utils.formatNumber(v):Math.floor(v).toLocaleString();}
    function pct(v){return Math.max(0,Math.min(100,v));}

    instance.initialise=function(){
        if(this.initialised)return;
        $("#tabList").append('<li role="presentation" id="guildTopTab"><a href="#guildPage" aria-controls="guildPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-tent"></span> Guild</a></li>');
        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="guildPage">'+
            '<div id="guildCreateView" class="myco-panel"><div class="myco-eyebrow">GUILD FOUNDATION</div><h2>Found a Mycelium Guild</h2><p>Create a persistent local guild prototype. Online members and synchronization will be connected later through the backend service.</p><div class="myco-form-row"><input id="guildNameInput" class="form-control" maxlength="28" placeholder="Guild name"><select id="guildEmblemInput" class="form-control"></select></div><textarea id="guildDescriptionInput" class="form-control" maxlength="120" placeholder="Short guild description"></textarea><br><button id="guildCreateButton" class="btn btn-success">Create Guild</button></div>'+
            '<div id="guildDashboard" class="hidden">'+
            '<section class="myco-guild-hero"><div><div class="myco-eyebrow">MYCELIUM GUILD</div><h2><span id="guildEmblem"></span> <span id="guildName"></span></h2><p id="guildDescription"></p><div class="myco-small-note" id="guildId"></div></div><div class="myco-guild-level"><span>Guild Level</span><strong id="guildLevel">1</strong><progress id="guildXpBar" max="100" value="0"></progress><small id="guildXpText"></small></div></section>'+
            '<section class="myco-wallet-grid"><div class="myco-wallet-card"><span>Contribution Points</span><strong id="guildContribution">0</strong></div><div class="myco-wallet-card"><span>Lifetime Contribution</span><strong id="guildLifetime">0</strong></div><div class="myco-wallet-card"><span>Members</span><strong id="guildMemberCount">0</strong></div><div class="myco-wallet-card"><span>Production Bonus</span><strong id="guildProductionBonus">+0%</strong></div></section><br>'+
            '<section class="myco-panel-grid"><article class="myco-panel"><h3>Resource Contributions</h3><div class="myco-guild-donations">'+
            '<div class="myco-form-row"><select id="guildDonateType" class="form-control"><option value="spores">Spores</option><option value="science">Science</option><option value="dna">DNA</option><option value="coins">MycoCoins</option><option value="bossTokens">World Boss Tokens</option></select><input id="guildDonateAmount" type="number" min="1" value="100" class="form-control"><button id="guildDonateButton" class="btn btn-success">Donate</button></div><div id="guildDonationStats" class="myco-kv-list"></div></div></article><article class="myco-panel"><h3>Guild Members</h3><div id="guildMembers" class="myco-history-list"></div></article></section>'+
            '<section class="myco-panel"><h3>Shared Research</h3><div id="guildResearch" class="myco-market-grid"></div></section><br>'+
            '<section class="myco-panel-grid"><article class="myco-panel"><h3>Guild Quests</h3><div id="guildQuests" class="myco-history-list"></div></article><article class="myco-panel"><h3>Guild Shop</h3><div id="guildShop" class="myco-market-grid"></div></article></section>'+
            '</div></div>'
        );
        var options=[];for(var i=0;i<Game.guildData.emblems.length;i++)options.push('<option value="'+Game.guildData.emblems[i]+'">'+Game.guildData.emblems[i]+'</option>');$("#guildEmblemInput").html(options.join(""));
        $(document).on("click","#guildCreateButton",function(){if(Game.guild.create($("#guildNameInput").val(),$("#guildEmblemInput").val(),$("#guildDescriptionInput").val()))instance.render();});
        $(document).on("click","#guildDonateButton",function(){Game.guild.donate($("#guildDonateType").val(),$("#guildDonateAmount").val());instance.render();});
        $(document).on("click",".guild-research-button",function(){Game.guild.upgradeResearch($(this).attr("data-research-id"));instance.render();});
        $(document).on("click",".guild-quest-button",function(){Game.guild.claimQuest($(this).attr("data-quest-id"));instance.render();});
        $(document).on("click",".guild-shop-button",function(){Game.guild.buyShopItem($(this).attr("data-shop-id"));instance.render();});
        this.initialised=true;this.render();
    };

    instance.render=function(){
        if(!this.initialised)return;
        $("#guildCreateView").toggleClass("hidden",Game.guild.created);$("#guildDashboard").toggleClass("hidden",!Game.guild.created);if(!Game.guild.created)return;
        var g=Game.guild,li=g.getLevelInfo();$("#guildEmblem").text(g.profile.emblem);$("#guildName").text(g.profile.name);$("#guildDescription").text(g.profile.description||"A connected network of fungal colonies.");$("#guildId").text(g.profile.id);$("#guildLevel").text(g.level);$("#guildXpBar").attr("max",li.required).val(li.current);$("#guildXpText").text(fmt(li.current)+" / "+fmt(li.required)+" XP");$("#guildContribution").text(fmt(g.contributionPoints));$("#guildLifetime").text(fmt(g.lifetimeContribution));$("#guildMemberCount").text(g.members.length);$("#guildProductionBonus").text("+"+g.getEffectPercent("production")+"%");
        $("#guildDonationStats").html('<div><span>Spores donated</span><strong>'+fmt(g.donations.sporesDonated)+'</strong></div><div><span>Science donated</span><strong>'+fmt(g.donations.scienceDonated)+'</strong></div><div><span>DNA donated</span><strong>'+fmt(g.donations.dnaDonated)+'</strong></div><div><span>MycoCoins donated</span><strong>'+fmt(g.donations.coinsDonated)+'</strong></div><div><span>Boss Tokens donated</span><strong>'+fmt(g.donations.bossTokensDonated)+'</strong></div>');
        var mh=[];for(var m=0;m<g.members.length;m++)mh.push('<div class="myco-history-row"><span>'+g.members[m].name+' <small>— '+g.members[m].role+'</small></span><strong>'+fmt(g.members[m].power)+' power</strong></div>');$("#guildMembers").html(mh.join(""));
        var rh=[];for(var r=0;r<Game.guildData.researchOrder.length;r++){var id=Game.guildData.researchOrder[r],d=Game.guildData.researches[id],level=g.getResearchLevel(id),cost=g.getResearchCost(id);rh.push('<div class="myco-offer-card"><div class="myco-eyebrow">LEVEL '+level+' / '+d.maxLevel+'</div><h4>'+d.name+'</h4><p>'+d.description+'</p><strong>Current: +'+(level*d.effectPerLevel)+'%</strong><div class="myco-offer-footer"><span>'+fmt(cost)+' CP</span><button class="btn btn-success guild-research-button" data-research-id="'+id+'" '+(level>=d.maxLevel?'disabled':'')+'>Research</button></div></div>');}$("#guildResearch").html(rh.join(""));
        var qh=[];for(var q=0;q<Game.guildData.quests.length;q++){var quest=Game.guildData.quests[q],progress=Math.min(quest.target,g.getQuestProgress(quest)),claimed=!!g.claimedQuests[quest.id];qh.push('<div class="myco-guild-quest"><div><strong>'+quest.name+'</strong><p>'+quest.description+'</p><progress max="'+quest.target+'" value="'+progress+'"></progress><div class="myco-small-note">'+fmt(progress)+' / '+fmt(quest.target)+'</div></div><button class="btn btn-warning guild-quest-button" data-quest-id="'+quest.id+'" '+(claimed||progress<quest.target?'disabled':'')+'>'+(claimed?'Claimed':'Claim')+'</button></div>');}$("#guildQuests").html(qh.join(""));
        var sh=[];for(var s=0;s<Game.guildData.shop.length;s++){var item=Game.guildData.shop[s],once=(item.type==="miner"||item.type==="artifact")&&g.purchases[item.id];sh.push('<div class="myco-offer-card"><div class="myco-eyebrow">GUILD SHOP</div><h4>'+item.name+'</h4><p>'+item.description+'</p><div class="myco-offer-footer"><strong>'+item.price+' CP</strong><button class="btn btn-primary guild-shop-button" data-shop-id="'+item.id+'" '+(once?'disabled':'')+'>'+(once?'Purchased':'Buy')+'</button></div></div>');}$("#guildShop").html(sh.join(""));
    };
    instance.update=function(delta){this.elapsed+=delta;if(this.elapsed>=1){this.elapsed=0;this.render();}};
    return instance;
}());
