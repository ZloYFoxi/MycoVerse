Game.account = (function () {
    "use strict";

    var instance = { dataVersion: 2, entries: {} };

    function num(value, fallback) { var n = Number(value); return isFinite(n) ? n : fallback; }
    function generateId() { return "MV-" + Math.random().toString(36).substr(2, 4).toUpperCase() + "-" + Date.now().toString(36).substr(-5).toUpperCase(); }

    function legacyScore() {
        var colony = Game.miners && Game.miners.getColonySummary ? Game.miners.getColonySummary() : { power:0, species:0 };
        var planets = Game.planets && Game.planets.getLeagueProgress ? Game.planets.getLeagueProgress().unlocked : 1;
        var ascensions = Game.ascension ? Math.max(0, Game.ascension.ascensions || 0) : 0;
        return Math.floor((colony.power || 0) * 4) + (colony.species || 0) * 100 + planets * 250 + ascensions * 1000 + Math.floor((instance.entries.totalCoinsEarned || 0) / 20);
    }

    function ensureDefaults() {
        if (!instance.entries.id) instance.entries.id = generateId();
        if (!instance.entries.name) instance.entries.name = "Wandering Spore";
        if (!instance.entries.title) instance.entries.title = "Keeper of the Grove";
        if (!instance.entries.avatar) instance.entries.avatar = "🍄";
        if (!instance.entries.createdAt) instance.entries.createdAt = Date.now();
        if (!instance.entries.wallet) instance.entries.wallet = { mycoCoins: 500, bloomTokens: 10 };
        instance.entries.wallet.mycoCoins = Math.max(0, Math.floor(num(instance.entries.wallet.mycoCoins, 500)));
        instance.entries.wallet.bloomTokens = Math.max(0, Math.floor(num(instance.entries.wallet.bloomTokens, 10)));
        instance.entries.lastDailyClaim = num(instance.entries.lastDailyClaim, 0);
        instance.entries.totalCoinsEarned = Math.max(0, num(instance.entries.totalCoinsEarned, instance.entries.wallet.mycoCoins));
        instance.entries.totalTokensEarned = Math.max(0, num(instance.entries.totalTokensEarned, instance.entries.wallet.bloomTokens));
        if (instance.entries.profileXp === undefined || instance.entries.profileXp === null) instance.entries.profileXp = legacyScore();
        instance.entries.profileXp = Math.max(0, Math.floor(num(instance.entries.profileXp, 0)));
        instance.entries.lifetimeXp = Math.max(instance.entries.profileXp, Math.floor(num(instance.entries.lifetimeXp, instance.entries.profileXp)));
        instance.entries.profileStats = instance.entries.profileStats || {};
        var defaults = { minersPurchased:0, questsClaimed:0, expeditionsCompleted:0, upgradesPurchased:0, fusionsCompleted:0, bossesDefeated:0 };
        for (var key in defaults) if (defaults.hasOwnProperty(key)) instance.entries.profileStats[key] = Math.max(0, Math.floor(num(instance.entries.profileStats[key], defaults[key])));
    }

    instance.initialise = function () {
        this.entries = {
            id: generateId(), name: "Wandering Spore", title: "Keeper of the Grove", avatar: "🍄", createdAt: Date.now(),
            wallet: { mycoCoins: 500, bloomTokens: 10 }, lastDailyClaim: 0, totalCoinsEarned: 500, totalTokensEarned: 10,
            profileXp: 0, lifetimeXp: 0,
            profileStats: { minersPurchased:0, questsClaimed:0, expeditionsCompleted:0, upgradesPurchased:0, fusionsCompleted:0, bossesDefeated:0 }
        };
    };

    instance.save = function (data) { ensureDefaults(); data.account = { version:this.dataVersion, entries:JSON.parse(JSON.stringify(this.entries)) }; };
    instance.load = function (data) { if (!data || !data.account || !data.account.entries) { ensureDefaults(); return; } this.entries = data.account.entries || {}; ensureDefaults(); };

    instance.getBalance = function (currency) { ensureDefaults(); return Math.max(0, Math.floor(num(this.entries.wallet[currency], 0))); };
    instance.add = function (currency, amount) { ensureDefaults(); amount=Math.max(0,Math.floor(num(amount,0))); if(!amount)return 0; this.entries.wallet[currency]=this.getBalance(currency)+amount; if(currency==="mycoCoins")this.entries.totalCoinsEarned+=amount; if(currency==="bloomTokens")this.entries.totalTokensEarned+=amount; return this.entries.wallet[currency]; };
    instance.canAfford = function (currency, amount) { return this.getBalance(currency) >= Math.max(0,Math.floor(num(amount,0))); };
    instance.spend = function (currency, amount) { amount=Math.max(0,Math.floor(num(amount,0))); if(!this.canAfford(currency,amount))return false; this.entries.wallet[currency]=this.getBalance(currency)-amount; return true; };
    instance.rename = function (name) { if(!name)return false; name=String(name).trim(); if(!name)return false; this.entries.name=name.slice(0,24); return true; };

    instance.addXp = function (amount, source, silent) {
        ensureDefaults();
        amount = Math.max(0, Math.floor(num(amount, 0)));
        if (!amount) return 0;
        var before = this.getLevelInfo().level;
        this.entries.profileXp += amount;
        this.entries.lifetimeXp += amount;
        var after = this.getLevelInfo().level;
        if (!silent && Game.notifySuccess) Game.notifySuccess("Commander XP", "+" + amount + " XP" + (source ? " — " + source : ""));
        if (after > before && Game.notifySuccess) Game.notifySuccess("Commander Level Up", "You reached level " + after + ". New systems may now be available.");
        return amount;
    };

    instance.recordStat = function (key, amount) { ensureDefaults(); amount=Math.max(1,Math.floor(num(amount,1))); this.entries.profileStats[key]=(this.entries.profileStats[key]||0)+amount; };
    instance.getStat = function (key) { ensureDefaults(); return Math.max(0,Math.floor(num(this.entries.profileStats[key],0))); };

    instance.getAvailableAvatars = function () { return ["🍄","🌌","🧬","🔮","🌿","💎","👑","🪐"]; };
    instance.setAvatar = function (avatar) { if(this.getAvailableAvatars().indexOf(avatar)<0)return false; this.entries.avatar=avatar; return true; };
    instance.getAvailableTitles = function () {
        var summary=this.getSummary(), titles=["Keeper of the Grove"];
        if(summary.species>=5)titles.push("Collector of Spores"); if(summary.unlockedPlanets>=3)titles.push("Planetary Mycologist"); if(summary.power>=250)titles.push("Mycelium Sovereign"); if(summary.ascensions>=1)titles.push("Ascended Network");
        if(Game.artifacts&&Game.artifacts.getOwnedCount&&Game.artifacts.getOwnedCount()>=5)titles.push("Relic Weaver");
        var bossTitles=instance.entries.unlockedBossTitles||[]; for(var i=0;i<bossTitles.length;i++)if(titles.indexOf(bossTitles[i])<0)titles.push(bossTitles[i]); return titles;
    };
    instance.setTitle = function (title) { if(this.getAvailableTitles().indexOf(title)<0)return false; this.entries.title=title; return true; };

    instance.getLevelInfo = function () {
        ensureDefaults();
        var xp=this.entries.profileXp;
        var level=Math.max(1,Math.floor(Math.sqrt(xp/120))+1);
        var currentFloor=Math.pow(level-1,2)*120, nextFloor=Math.pow(level,2)*120;
        return { level:level, score:xp, totalXp:xp, current:Math.max(0,xp-currentFloor), required:Math.max(1,nextFloor-currentFloor), percent:Math.min(100,Math.max(0,((xp-currentFloor)/Math.max(1,nextFloor-currentFloor))*100)) };
    };

    instance.getDailyReward = function () { var a=Game.ascension?Math.max(0,Game.ascension.ascensions||0):0, p=Game.planets&&Game.planets.getLeagueProgress?Game.planets.getLeagueProgress().unlocked:1; return {mycoCoins:250+a*50+p*25,bloomTokens:1+Math.min(4,a),xp:40}; };
    instance.getDailyRemaining = function () { ensureDefaults(); return Math.max(0,this.entries.lastDailyClaim+86400000-Date.now()); };
    instance.canClaimDaily = function () { return this.getDailyRemaining()<=0; };
    instance.claimDaily = function () { if(!this.canClaimDaily())return false; var r=this.getDailyReward(); this.add("mycoCoins",r.mycoCoins); this.add("bloomTokens",r.bloomTokens); this.addXp(r.xp,"Daily supply drop",true); this.entries.lastDailyClaim=Date.now(); if(Game.notifySuccess)Game.notifySuccess("Daily reward claimed","+"+r.mycoCoins+" MycoCoins, +"+r.bloomTokens+" Bloom Token, +"+r.xp+" XP"); return r; };

    instance.getSummary = function () { ensureDefaults(); var c=Game.miners&&Game.miners.getColonySummary?Game.miners.getColonySummary():{power:0,species:0}; return {id:this.entries.id,name:this.entries.name,title:this.entries.title,avatar:this.entries.avatar,createdAt:this.entries.createdAt,mycoCoins:this.getBalance("mycoCoins"),bloomTokens:this.getBalance("bloomTokens"),totalCoinsEarned:this.entries.totalCoinsEarned,profileXp:this.entries.profileXp,species:c.species||0,power:c.power||0,ascensions:Game.ascension?(Game.ascension.ascensions||0):0,unlockedPlanets:Game.planets&&Game.planets.getLeagueProgress?Game.planets.getLeagueProgress().unlocked:1}; };

    return instance;
}());
