Game.collectionUI = (function () {
    "use strict";
    var instance={initialised:false,elapsed:0,filter:"all",book:"miners"};
    function fmt(v){return Game.utils&&Game.utils.formatNumber?Game.utils.formatNumber(v):Math.floor(v).toLocaleString();}
    function rewardText(r){var p=[];if(r.xp)p.push(r.xp+" XP");if(r.mycoCoins)p.push(r.mycoCoins+" MycoCoins");if(r.bloomTokens)p.push(r.bloomTokens+" Bloom Tokens");if(r.worldBossTokens)p.push(r.worldBossTokens+" Boss Tokens");if(r.title)p.push('Title: "'+r.title+'"');return p.join(" • ");}
    function entryCard(name,sub,owned,extra){return '<div class="myco-collection-entry '+(owned?'owned':'locked')+'"><div class="myco-collection-icon">'+(owned?'✓':'?')+'</div><div><strong>'+name+'</strong><div class="myco-small-note">'+sub+'</div>'+(extra?'<div class="myco-small-note">'+extra+'</div>':'')+'</div></div>';}

    instance.initialise=function(){
        if(this.initialised)return;
        $("#tabList").append('<li role="presentation" id="collectionsTopTab"><a href="#collectionsPage" aria-controls="collectionsPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-book"></span> Achievements</a></li>');
        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="collectionsPage">'+
            '<section class="myco-collection-hero"><div><div class="myco-eyebrow">MYCOVERSE ARCHIVE</div><h2>Achievements & Collections</h2><p>Track the history of your colony, reveal secret goals, and complete the living archive.</p></div><div class="myco-collection-score"><span>Archive Completion</span><strong id="collectionPercent">0%</strong><progress id="collectionTotalBar" max="100" value="0"></progress><small id="collectionTotalText">0 / 0</small></div></section>'+
            '<section class="myco-wallet-grid"><div class="myco-wallet-card"><span>Achievements completed</span><strong id="achievementCompleted">0</strong></div><div class="myco-wallet-card"><span>Rewards claimed</span><strong id="achievementClaimed">0</strong></div><div class="myco-wallet-card"><span>Collection entries</span><strong id="collectionOwned">0</strong></div><div class="myco-wallet-card"><span>Secrets revealed</span><strong id="secretRevealed">0</strong></div></section><br>'+
            '<section class="myco-panel"><div class="myco-achievement-tabs" id="achievementFilters"></div><div id="achievementGrid" class="myco-achievement-grid"></div></section><br>'+
            '<section class="myco-panel"><div class="myco-book-head"><div><div class="myco-eyebrow">COLLECTION BOOK</div><h3>Living Archive</h3></div><div class="myco-achievement-tabs" id="collectionBookTabs"></div></div><div id="collectionBookGrid" class="myco-collection-grid"></div></section>'+
            '</div>'
        );
        $(document).on("click",".achievement-filter",function(){instance.filter=$(this).attr("data-filter");instance.render();});
        $(document).on("click",".collection-book-tab",function(){instance.book=$(this).attr("data-book");instance.render();});
        $(document).on("click",".achievement-claim",function(){Game.mycoAchievements.claim($(this).attr("data-achievement-id"));instance.render();});
        this.initialised=true;this.render();
    };

    instance.renderAchievements=function(){
        var cats=["all"].concat(Game.collectionData.categories),fh=[];
        for(var c=0;c<cats.length;c++){var id=cats[c],label=id==="all"?"All":id.charAt(0).toUpperCase()+id.slice(1);fh.push('<button class="btn '+(this.filter===id?'btn-success':'btn-default')+' achievement-filter" data-filter="'+id+'">'+label+'</button>');}
        $("#achievementFilters").html(fh.join(""));
        var all=Game.mycoAchievements.getAllStates(),html=[],secrets=0;
        for(var i=0;i<all.length;i++){
            var s=all[i],d=s.definition;if(this.filter!=="all"&&d.category!==this.filter)continue;
            var revealed=!d.secret||s.complete||s.claimed;if(d.secret&&revealed)secrets++;
            var name=revealed?(d.revealedName||d.name):d.name,desc=revealed?d.description:d.hiddenDescription;
            html.push('<article class="myco-achievement-card '+(s.complete?'complete':'')+' '+(s.claimed?'claimed':'')+'">'+
                '<div class="myco-achievement-top"><div><span class="myco-achievement-category">'+d.category+'</span><h4>'+name+'</h4></div><div class="myco-achievement-state">'+(s.claimed?'✓':s.complete?'!':'🔒')+'</div></div><p>'+desc+'</p>'+
                '<progress max="'+s.target+'" value="'+Math.min(s.target,s.value)+'"></progress><div class="myco-achievement-progress">'+fmt(Math.min(s.value,s.target))+' / '+fmt(s.target)+'</div>'+
                '<div class="myco-achievement-reward">'+rewardText(d.reward||{})+'</div><button class="btn btn-warning achievement-claim" data-achievement-id="'+s.id+'" '+(!s.complete||s.claimed?'disabled':'')+'>'+(s.claimed?'Claimed':s.complete?'Claim Reward':'Locked')+'</button></article>');
        }
        $("#achievementGrid").html(html.join(""));
        $("#secretRevealed").text(secrets);
    };

    instance.renderBook=function(){
        var tabs=["miners","artifacts","planets","bosses"],th=[];for(var i=0;i<tabs.length;i++){var t=tabs[i];th.push('<button class="btn '+(this.book===t?'btn-primary':'btn-default')+' collection-book-tab" data-book="'+t+'">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>');}$("#collectionBookTabs").html(th.join(""));
        var html=[];
        if(this.book==="miners"){
            var miners=Game.miners.getEntriesSorted();for(var m=0;m<miners.length;m++){var e=miners[m],owned=e.owned>0;html.push(entryCard(owned?e.definition.name:"Unknown Species",owned?(e.definition.rarity.name+" • "+e.definition.resource):"Undiscovered miner",owned,"Owned: "+e.owned+" • Level "+e.level));}
        } else if(this.book==="artifacts"){
            for(var a=0;a<Game.artifactData.order.length;a++){var aid=Game.artifactData.order[a],d=Game.artifactData.entries[aid],count=Game.artifacts.getCount(aid),owned=count>0;html.push(entryCard(owned?d.name:"Unknown Relic",owned?(Game.artifactData.rarities[d.rarity].name+" • "+d.slot):"Undiscovered artifact",owned,owned?"Copies: "+count:""));}
        } else if(this.book==="planets"){
            for(var p=0;p<Game.planetData.order.length;p++){
                var pid=Game.planetData.order[p],pd=Game.planetData.planets[pid],owned=Game.planets.isUnlocked(pid),complete=Game.planets.isCompleted?Game.planets.isCompleted(pid):false;
                var planetExtra=owned?(complete?"Completed":"Progress: "+Math.floor(Game.planets.getProgress?Game.planets.getProgress(pid):0)+"%"):"";
                html.push(entryCard(owned?pd.name:"Unknown Planet",owned?(pd.description||"Planet discovered"):"Reach the previous passage to reveal",owned,planetExtra));
            }
        } else {
            for(var bid in Game.bossData.entries)if(Game.bossData.entries.hasOwnProperty(bid)){var bd=Game.bossData.entries[bid],owned=Game.bosses.isDefeated(bid);html.push(entryCard(owned?bd.name:"Unknown Gatekeeper",owned?("League "+bd.league+" • defeated"):"Defeat this boss to record it",owned,owned?"Passage opened":""));}
        }
        $("#collectionBookGrid").html(html.join(""));
    };

    instance.render=function(){if(!this.initialised)return;Game.mycoAchievements.update();var all=Game.mycoAchievements.getAllStates(),completed=0;for(var i=0;i<all.length;i++)if(all[i].complete)completed++;var col=Game.mycoAchievements.getCollectionSummary(),combinedTotal=all.length+col.total,combinedOwned=completed+col.owned,percent=combinedTotal?combinedOwned/combinedTotal*100:0;$("#collectionPercent").text(Math.floor(percent)+"%");$("#collectionTotalBar").val(percent);$("#collectionTotalText").text(combinedOwned+" / "+combinedTotal);$("#achievementCompleted").text(completed+" / "+all.length);$("#achievementClaimed").text(Game.mycoAchievements.getClaimedCount());$("#collectionOwned").text(col.owned+" / "+col.total);this.renderAchievements();this.renderBook();};
    instance.update=function(delta){this.elapsed+=delta;if(this.elapsed>=1){this.elapsed=0;this.render();}};
    return instance;
}());
