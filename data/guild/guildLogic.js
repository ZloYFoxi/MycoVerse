Game.guild = (function () {
    "use strict";

    var instance = {
        dataVersion: 1,
        created: false,
        profile: {},
        level: 1,
        experience: 0,
        contributionPoints: 0,
        lifetimeContribution: 0,
        donations: {},
        researches: {},
        claimedQuests: {},
        purchases: {},
        members: []
    };

    function num(v, f) { var n = Number(v); return isFinite(n) ? n : f; }
    function generateId() { return "GUILD-" + Math.random().toString(36).substr(2, 6).toUpperCase(); }
    function defaultDonations() { return { sporesDonated:0, scienceDonated:0, dnaDonated:0, coinsDonated:0, bossTokensDonated:0 }; }
    function defaultResearches() { var r={}; for(var id in Game.guildData.researches)if(Game.guildData.researches.hasOwnProperty(id))r[id]=0; return r; }

    function ensureExclusiveContent() {
        if (Game.minerData && !Game.minerData.guildSpore) {
            Game.minerData.guildSpore = {
                name:"Guild Spore", description:"A rare organism cultivated by a united mycelium guild.", rarity:MINER_RARITY.RARE,
                resource:"wood", baseIncome:18, maxLevel:90, startOwned:0, unlockCost:0, upgradeBaseCost:9000, order:92,
                shopExcluded:true, passiveBonus:{type:"global",percentPerOwned:2}
            };
        }
        if (Game.artifactData && Game.artifactData.entries && !Game.artifactData.entries.guildBannerRelic) {
            Game.artifactData.entries.guildBannerRelic = {
                name:"Banner Relic", slot:"charm", rarity:"legendary", planetId:"guild",
                description:"A living standard carrying the memory of every guild contribution.", bonus:{type:"global",percent:24}
            };
            if (Game.artifactData.order.indexOf("guildBannerRelic") < 0) Game.artifactData.order.push("guildBannerRelic");
        }
    }

    instance.initialise = function () {
        ensureExclusiveContent();
        this.created = false;
        this.profile = { id:generateId(), name:"", emblem:"🍄", description:"" };
        this.level = 1;
        this.experience = 0;
        this.contributionPoints = 0;
        this.lifetimeContribution = 0;
        this.donations = defaultDonations();
        this.researches = defaultResearches();
        this.claimedQuests = {};
        this.purchases = {};
        this.members = [];
    };

    instance.save = function (data) {
        data.guild = {
            version:this.dataVersion, created:this.created, profile:this.profile, level:this.level, experience:this.experience,
            contributionPoints:this.contributionPoints, lifetimeContribution:this.lifetimeContribution, donations:this.donations,
            researches:this.researches, claimedQuests:this.claimedQuests, purchases:this.purchases, members:this.members
        };
    };

    instance.load = function (data) {
        ensureExclusiveContent();
        if (!data || !data.guild) return;
        var s=data.guild;
        this.created=!!s.created;
        this.profile=s.profile||this.profile;
        if(!this.profile.id)this.profile.id=generateId();
        this.level=Math.max(1,Math.floor(num(s.level,1)));
        this.experience=Math.max(0,Math.floor(num(s.experience,0)));
        this.contributionPoints=Math.max(0,Math.floor(num(s.contributionPoints,0)));
        this.lifetimeContribution=Math.max(0,Math.floor(num(s.lifetimeContribution,0)));
        this.donations=Object.assign(defaultDonations(),s.donations||{});
        this.researches=Object.assign(defaultResearches(),s.researches||{});
        this.claimedQuests=s.claimedQuests||{};
        this.purchases=s.purchases||{};
        this.members=Array.isArray(s.members)?s.members.slice(0,12):[];
    };

    instance.create = function (name, emblem, description) {
        name=String(name||"").trim();
        if(!name){Game.notifyInfo("Guild name required","Choose a name for your guild.");return false;}
        if(Game.guildData.emblems.indexOf(emblem)<0)emblem="🍄";
        this.created=true;
        this.profile={id:generateId(),name:name.slice(0,28),emblem:emblem,description:String(description||"").trim().slice(0,120)};
        this.members=[
            {name:Game.account?Game.account.entries.name:"Commander",role:"Founder",power:Game.miners.getColonySummary().power||0},
            {name:"Lumina Cap",role:"Researcher",power:120},{name:"Rootwarden",role:"Guardian",power:180},{name:"Prism Scout",role:"Explorer",power:95}
        ];
        this.addXp(250);
        Game.notifySuccess("Guild founded",this.profile.name+" has entered the MycoVerse network.");
        return true;
    };

    instance.getXpRequired = function (level) { return Math.floor(Game.guildData.xpBase*Math.pow(1.32,Math.max(0,level-1))); };
    instance.getLevelInfo = function () { var req=this.getXpRequired(this.level); return {level:this.level,current:this.experience,required:req,percent:Math.min(100,this.experience/Math.max(1,req)*100)}; };
    instance.addXp = function (amount) {
        amount=Math.max(0,Math.floor(num(amount,0))); this.experience+=amount;
        while(this.level<Game.guildData.maxLevel && this.experience>=this.getXpRequired(this.level)){
            this.experience-=this.getXpRequired(this.level); this.level+=1;
            if(Game.notifySuccess)Game.notifySuccess("Guild Level Up",this.profile.name+" reached Guild Level "+this.level+".");
        }
        return amount;
    };

    instance.addContribution = function (amount) { amount=Math.max(0,Math.floor(num(amount,0)));this.contributionPoints+=amount;this.lifetimeContribution+=amount;return amount; };

    instance.donate = function (type, amount) {
        if(!this.created)return false;
        amount=Math.max(1,Math.floor(num(amount,0)));
        var xp=0,cp=0;
        if(type==="spores"){
            if(Game.resources.getResource(RESOURCE.Wood)<amount)return Game.notifyInfo("Not enough Spores","Your colony cannot afford this contribution."),false;
            Game.resources.takeResource(RESOURCE.Wood,amount);this.donations.sporesDonated+=amount;xp=Math.max(1,Math.floor(amount/100));cp=Math.max(1,Math.floor(amount/250));
        }else if(type==="science"){
            if(Game.resources.getResource(RESOURCE.Science)<amount)return Game.notifyInfo("Not enough Science","Your colony cannot afford this contribution."),false;
            Game.resources.takeResource(RESOURCE.Science,amount);this.donations.scienceDonated+=amount;xp=Math.max(1,Math.floor(amount/25));cp=Math.max(1,Math.floor(amount/50));
        }else if(type==="dna"){
            if(!Game.laboratory||Game.laboratory.dna<amount)return Game.notifyInfo("Not enough DNA","Your laboratory cannot afford this contribution."),false;
            Game.laboratory.dna-=amount;this.donations.dnaDonated+=amount;xp=amount*2;cp=amount;
        }else if(type==="coins"){
            if(!Game.account.spend("mycoCoins",amount))return Game.notifyInfo("Not enough MycoCoins","Your wallet cannot afford this contribution."),false;
            this.donations.coinsDonated+=amount;xp=Math.max(1,Math.floor(amount/4));cp=Math.max(1,Math.floor(amount/10));
        }else if(type==="bossTokens"){
            if(!Game.account.spend("worldBossTokens",amount))return Game.notifyInfo("Not enough Boss Tokens","Earn tokens from the World Boss first."),false;
            this.donations.bossTokensDonated+=amount;xp=amount*12;cp=amount*5;
        }else return false;
        this.addXp(xp);this.addContribution(cp);
        if(Game.account){Game.account.addXp(Math.max(5,Math.floor(cp/2)),"Guild contribution",true);Game.account.recordStat("guildContributions",1);}
        Game.notifySuccess("Contribution accepted","+"+xp+" Guild XP and +"+cp+" Contribution Points.");
        return true;
    };

    instance.getResearchLevel = function (id) { return Math.max(0,Math.floor(num(this.researches[id],0))); };
    instance.getResearchCost = function (id) { var d=Game.guildData.researches[id];if(!d)return Infinity;return Math.floor(d.baseCost*Math.pow(1.55,this.getResearchLevel(id))); };
    instance.upgradeResearch = function (id) {
        var d=Game.guildData.researches[id],level=this.getResearchLevel(id);if(!d||level>=d.maxLevel)return false;
        var cost=this.getResearchCost(id);if(this.contributionPoints<cost){Game.notifyInfo("Contribution Points required","This research costs "+cost+" Contribution Points.");return false;}
        this.contributionPoints-=cost;this.researches[id]=level+1;this.addXp(Math.floor(cost*0.6));
        Game.notifySuccess("Guild research advanced",d.name+" reached level "+(level+1)+".");return true;
    };

    instance.getEffectPercent = function (effect) { var total=0;for(var id in Game.guildData.researches){if(!Game.guildData.researches.hasOwnProperty(id))continue;var d=Game.guildData.researches[id];if(d.effect===effect)total+=this.getResearchLevel(id)*d.effectPerLevel;}return total; };
    instance.getProductionMultiplier = function () { return this.created?1+this.getEffectPercent("production")/100:1; };
    instance.getHealingCostMultiplier = function () { return this.created?Math.max(0.5,1-this.getEffectPercent("healing")/100):1; };
    instance.getWorldBossMultiplier = function () { return this.created?1+this.getEffectPercent("worldBoss")/100:1; };
    instance.getExpeditionDurationMultiplier = function () { return this.created?Math.max(0.5,1-this.getEffectPercent("expedition")/100):1; };
    instance.getMarketplaceFeeReduction = function () { return this.created?this.getEffectPercent("marketFee"):0; };

    instance.getQuestProgress = function (q) { if(q.stat)return Math.max(0,num(this.donations[q.stat],0));if(q.accountStat&&Game.account)return Game.account.getStat(q.accountStat);return 0; };
    instance.claimQuest = function (id) {
        var q=null;for(var i=0;i<Game.guildData.quests.length;i++)if(Game.guildData.quests[i].id===id)q=Game.guildData.quests[i];
        if(!q||this.claimedQuests[id]||this.getQuestProgress(q)<q.target)return false;
        this.claimedQuests[id]=true;this.addXp(q.guildXp);this.addContribution(q.contribution);if(Game.account)Game.account.addXp(q.commanderXp,"Guild quest",true);
        Game.notifySuccess("Guild quest complete","+"+q.guildXp+" Guild XP, +"+q.contribution+" Contribution Points and +"+q.commanderXp+" Commander XP.");return true;
    };

    instance.buyShopItem = function (id) {
        var item=null;for(var i=0;i<Game.guildData.shop.length;i++)if(Game.guildData.shop[i].id===id)item=Game.guildData.shop[i];
        if(!item)return false;if(this.contributionPoints<item.price){Game.notifyInfo("Contribution Points required","You need "+item.price+" points.");return false;}
        if((item.type==="miner"||item.type==="artifact")&&this.purchases[id]){Game.notifyInfo("Already purchased","This exclusive guild reward can only be purchased once.");return false;}
        this.contributionPoints-=item.price;
        if(item.type==="medical"){var miners=Game.miners.getEntriesSorted();for(var j=0;j<miners.length;j++)if(miners[j].owned>0)Game.miners.healMiner(miners[j].id,Game.miners.getMaxHealth(miners[j].id)*0.25);}
        if(item.type==="dna"&&Game.laboratory)Game.laboratory.addDNA(item.amount);
        if(item.type==="coins"&&Game.account)Game.account.add("mycoCoins",item.amount);
        if(item.type==="miner")Game.miners.unlock(item.minerId,1);
        if(item.type==="artifact")Game.artifacts.add(item.artifactId,1);
        this.purchases[id]=(this.purchases[id]||0)+1;this.addXp(Math.floor(item.price*0.4));Game.notifySuccess("Guild Shop purchase",item.name+" was added to your colony.");return true;
    };

    instance.resetForAscension = function () { /* Guild progression persists through Ascension. */ };
    instance.update = function () { if(this.created&&this.members.length)this.members[0].power=Game.miners.getColonySummary().power||0; };
    ensureExclusiveContent();
    return instance;
}());
