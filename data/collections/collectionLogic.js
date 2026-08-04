Game.mycoAchievements = (function () {
    "use strict";

    var instance = { dataVersion:1, claimed:{}, unlockedAt:{}, customStats:{ healthRestored:0, lastSporeVictory:0 } };
    function num(v,f){var n=Number(v);return isFinite(n)?n:f;}

    instance.initialise=function(){this.claimed={};this.unlockedAt={};this.customStats={healthRestored:0,lastSporeVictory:0};};
    instance.save=function(data){data.mycoAchievements={version:this.dataVersion,claimed:this.claimed,unlockedAt:this.unlockedAt,customStats:this.customStats};};
    instance.load=function(data){var s=data&&data.mycoAchievements;if(!s)return;this.claimed=s.claimed||{};this.unlockedAt=s.unlockedAt||{};this.customStats=s.customStats||{healthRestored:0,lastSporeVictory:0};};

    instance.addCustomStat=function(key,amount){this.customStats[key]=Math.max(0,num(this.customStats[key],0)+Math.max(0,num(amount,0)));};
    instance.setCustomStat=function(key,value){this.customStats[key]=Math.max(0,num(value,0));};

    instance.getMetric=function(metric){
        var summary=Game.miners&&Game.miners.getColonySummary?Game.miners.getColonySummary():{species:0,specimens:0};
        var stats=Game.account&&Game.account.entries?Game.account.entries.profileStats||{}:{};
        if(metric==="species")return summary.species||0;
        if(metric==="specimens")return summary.specimens||0;
        if(metric==="upgrades")return stats.upgradesPurchased||0;
        if(metric==="coinsEarned")return Game.account?Game.account.entries.totalCoinsEarned||0:0;
        if(metric==="minersPurchased")return stats.minersPurchased||0;
        if(metric==="marketTransactions")return Game.market&&Game.market.history?Game.market.history.length:0;
        if(metric==="planetsCompleted"){var pc=0;if(Game.planets&&Game.planets.completed)for(var pid in Game.planets.completed)if(Game.planets.completed.hasOwnProperty(pid)&&Game.planets.completed[pid])pc++;return pc;}
        if(metric==="expeditions")return stats.expeditionsCompleted||0;
        if(metric==="bosses")return stats.bossesDefeated||0;
        if(metric==="worldBossAttacks")return stats.worldBossAttacks||0;
        if(metric==="healthRestored")return this.customStats.healthRestored||0;
        if(metric==="fusions")return stats.fusionsCompleted||0;
        if(metric==="research")return Game.research&&Game.research.getPurchasedCount?Game.research.getPurchasedCount():0;
        if(metric==="guildCreated")return Game.guild&&Game.guild.created?1:0;
        if(metric==="guildContribution")return Game.guild&&Game.guild.contributionPoints?Game.guild.contributionPoints:0;
        if(metric==="unionLevel"){
            var best=0, unions=Game.unions&&Game.unions.unions?Game.unions.unions:[];
            for(var i=0;i<unions.length;i++)best=Math.max(best,unions[i].level||0);return best;
        }
        if(metric==="artifacts")return Game.artifacts&&Game.artifacts.getOwnedCount?Game.artifacts.getOwnedCount():0;
        if(metric==="lastSporeVictory")return this.customStats.lastSporeVictory||0;
        if(metric==="ascensions")return Game.ascension?Game.ascension.ascensions||0:0;
        return 0;
    };

    instance.getState=function(id){var d=Game.collectionData.achievements[id];if(!d)return null;var value=this.getMetric(d.metric),complete=value>=d.target;if(complete&&!this.unlockedAt[id])this.unlockedAt[id]=Date.now();return{id:id,definition:d,value:value,target:d.target,percent:Math.min(100,value/d.target*100),complete:complete,claimed:!!this.claimed[id]};};
    instance.getAllStates=function(){var a=[];for(var id in Game.collectionData.achievements)if(Game.collectionData.achievements.hasOwnProperty(id))a.push(this.getState(id));return a;};
    instance.getCompletedCount=function(){var all=this.getAllStates(),n=0;for(var i=0;i<all.length;i++)if(all[i].complete)n++;return n;};
    instance.getClaimedCount=function(){var n=0;for(var id in this.claimed)if(this.claimed.hasOwnProperty(id)&&this.claimed[id])n++;return n;};

    instance.claim=function(id){var state=this.getState(id);if(!state||!state.complete||state.claimed)return false;var r=state.definition.reward||{};
        if(Game.account){if(r.xp)Game.account.addXp(r.xp,"Achievement",true);if(r.mycoCoins)Game.account.add("mycoCoins",r.mycoCoins);if(r.bloomTokens)Game.account.add("bloomTokens",r.bloomTokens);if(r.worldBossTokens)Game.account.add("worldBossTokens",r.worldBossTokens);}
        if(r.title&&Game.account){Game.account.entries.unlockedAchievementTitles=Game.account.entries.unlockedAchievementTitles||[];if(Game.account.entries.unlockedAchievementTitles.indexOf(r.title)<0)Game.account.entries.unlockedAchievementTitles.push(r.title);}
        this.claimed[id]=true;Game.notifySuccess("Achievement claimed",(state.definition.revealedName||state.definition.name)+" rewards collected.");return true;
    };

    instance.getCollectionSummary=function(){
        var miners=Game.miners&&Game.miners.getCollectionProgress?Game.miners.getCollectionProgress():{owned:0,total:0};
        var artifactsOwned=Game.artifacts&&Game.artifacts.getOwnedCount?Game.artifacts.getOwnedCount():0;
        var artifactsTotal=Game.artifactData&&Game.artifactData.entries?Object.keys(Game.artifactData.entries).length:0;
        var planets=Game.planets&&Game.planets.getLeagueProgress?Game.planets.getLeagueProgress():{unlocked:0,total:0};
        var bossesTotal=Game.bossData&&Game.bossData.entries?Object.keys(Game.bossData.entries).length:0,bossesOwned=0;
        if(Game.bosses&&Game.bosses.defeated)for(var b in Game.bosses.defeated)if(Game.bosses.defeated.hasOwnProperty(b)&&Game.bosses.defeated[b])bossesOwned++;
        var owned=miners.owned+artifactsOwned+planets.unlocked+bossesOwned,total=miners.total+artifactsTotal+planets.total+bossesTotal;
        return{miners:miners,artifacts:{owned:artifactsOwned,total:artifactsTotal},planets:planets,bosses:{owned:bossesOwned,total:bossesTotal},owned:owned,total:total,percent:total?owned/total*100:0};
    };
    instance.update=function(){this.getAllStates();};
    return instance;
}());
