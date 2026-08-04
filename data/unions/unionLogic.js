Game.unions = (function () {
    "use strict";

    var instance = { dataVersion: 1, activeUnionId: "union1", unions: {} };

    function num(v, f) { var n = Number(v); return isFinite(n) ? n : f; }
    function blank(id, name) { return { id:id, name:name, level:1, experience:0, talentPoints:0, talents:{production:0,boss:0,expedition:0}, members:[] }; }

    instance.initialise = function () {
        this.activeUnionId = "union1";
        this.unions = {
            union1: blank("union1", "Spore Brotherhood"),
            union2: blank("union2", "Prism Circle"),
            union3: blank("union3", "Void Communion")
        };
    };

    instance.save = function (data) { data.unions = { version:this.dataVersion, activeUnionId:this.activeUnionId, unions:this.unions }; };

    instance.load = function (data) {
        if (!data || !data.unions) return;
        var saved = data.unions;
        this.activeUnionId = saved.activeUnionId || "union1";
        var loaded = saved.unions || {};
        for (var id in this.unions) {
            if (!this.unions.hasOwnProperty(id) || !loaded[id]) continue;
            var src = loaded[id], target = this.unions[id];
            target.name = String(src.name || target.name).slice(0, 28);
            target.level = Math.max(1, Math.floor(num(src.level, 1)));
            target.experience = Math.max(0, num(src.experience, 0));
            target.talentPoints = Math.max(0, Math.floor(num(src.talentPoints, 0)));
            target.talents = src.talents || target.talents;
            target.members = Array.isArray(src.members) ? src.members.filter(function (m) {
                return m && Game.minerData[m.minerId] && Game.unionData.roles[m.role];
            }).slice(0, Game.unionData.maxMembers) : [];
        }
        if (!this.unions[this.activeUnionId]) this.activeUnionId = "union1";
    };

    instance.getActive = function () { return this.unions[this.activeUnionId]; };
    instance.getUnion = function (id) { return this.unions[id] || null; };
    instance.setActive = function (id) { if (!this.unions[id]) return false; this.activeUnionId = id; return true; };
    instance.rename = function (id, name) { var u=this.getUnion(id); if(!u||!name) return false; name=String(name).trim(); if(!name)return false; u.name=name.slice(0,28); return true; };

    instance.getMember = function (union, minerId) {
        for (var i=0;i<union.members.length;i++) if(union.members[i].minerId===minerId) return union.members[i];
        return null;
    };

    instance.addMember = function (unionId, minerId, role) {
        var u=this.getUnion(unionId), entry=Game.miners.getEntry(minerId);
        if(!u||!entry||entry.owned<=0||!Game.unionData.roles[role]) return false;
        if(this.getMember(u,minerId)) return false;
        if(u.members.length>=Game.unionData.maxMembers) { Game.notifyInfo("Union full","A miner union may contain up to five species."); return false; }
        u.members.push({minerId:minerId,role:role});
        return true;
    };

    instance.removeMember = function (unionId, minerId) {
        var u=this.getUnion(unionId); if(!u)return false;
        for(var i=0;i<u.members.length;i++) if(u.members[i].minerId===minerId){u.members.splice(i,1);return true;}
        return false;
    };

    instance.cycleRole = function (unionId, minerId) {
        var u=this.getUnion(unionId), m=u&&this.getMember(u,minerId); if(!m)return false;
        var roles=Object.keys(Game.unionData.roles), idx=roles.indexOf(m.role); m.role=roles[(idx+1)%roles.length]; return true;
    };

    instance.getHomePlanet = function (minerId) {
        if (!Game.planetData || !Game.planetData.planets) return null;
        for (var pid in Game.planetData.planets) {
            if (!Game.planetData.planets.hasOwnProperty(pid)) continue;
            var drops=Game.planetData.planets[pid].drops||[];
            for(var i=0;i<drops.length;i++) if(drops[i].minerId===minerId) return pid;
        }
        return null;
    };

    instance.getSynergy = function (union) {
        var result={production:0,boss:0,expedition:0,lines:[]};
        if(!union||union.members.length<2)return result;
        var resources={},rarities={},planets={};
        for(var i=0;i<union.members.length;i++){
            var d=Game.minerData[union.members[i].minerId]; if(!d)continue;
            resources[d.resource]=(resources[d.resource]||0)+1;
            rarities[d.rarity.id]=(rarities[d.rarity.id]||0)+1;
            var p=this.getHomePlanet(union.members[i].minerId); if(p)planets[p]=(planets[p]||0)+1;
        }
        function best(map){var max=0;for(var k in map)if(map.hasOwnProperty(k))max=Math.max(max,map[k]);return max;}
        var r=best(resources),q=best(rarities),p=best(planets);
        if(r>=3){result.production+=Game.unionData.synergy.sameResourcePercent;result.lines.push("Shared resource +"+Game.unionData.synergy.sameResourcePercent+"% production");}
        if(q>=3){result.boss+=Game.unionData.synergy.sameRarityPercent;result.lines.push("Rarity harmony +"+Game.unionData.synergy.sameRarityPercent+"% boss power");}
        if(p>=3){result.expedition+=Game.unionData.synergy.samePlanetPercent;result.lines.push("Planet bond +"+Game.unionData.synergy.samePlanetPercent+"% expedition speed");}
        if(union.members.length>=Game.unionData.maxMembers){result.production+=Game.unionData.synergy.fullTeamPercent;result.lines.push("Full communion +"+Game.unionData.synergy.fullTeamPercent+"% production");}
        return result;
    };

    instance.getBonuses = function () {
        var u=this.getActive(), result={global:0,resources:{},science:0,boss:0,expedition:0,xp:0};
        if(!u)return result;
        for(var i=0;i<u.members.length;i++){
            var m=u.members[i],d=Game.minerData[m.minerId],role=Game.unionData.roles[m.role];
            if(!d||!role||!Game.miners.getEntry(m.minerId)||Game.miners.getEntry(m.minerId).owned<=0)continue;
            result.global+=num(role.productionPercent,0);
            result.boss+=num(role.bossPercent,0);
            result.expedition+=num(role.expeditionPercent,0);
            result.science+=num(role.sciencePercent,0);
            result.xp+=num(role.xpPercent,0);
            if(role.resourcePercent) result.resources[d.resource]=(result.resources[d.resource]||0)+role.resourcePercent;
        }
        var syn=this.getSynergy(u);
        result.global+=syn.production; result.boss+=syn.boss; result.expedition+=syn.expedition;
        result.global+=3*Math.max(0,num(u.talents.production,0));
        result.boss+=5*Math.max(0,num(u.talents.boss,0));
        result.expedition+=4*Math.max(0,num(u.talents.expedition,0));
        result.global+=(u.level-1)*1.5;
        return result;
    };

    instance.getProductionMultiplier = function (resourceId) { var b=this.getBonuses(); return 1+(b.global+(b.resources[resourceId]||0)+(resourceId==="science"?b.science:0))/100; };
    instance.getBossMultiplier = function () { return 1+this.getBonuses().boss/100; };
    instance.getExpeditionDurationMultiplier = function () { return Math.max(0.35,1-this.getBonuses().expedition/100); };

    instance.getXpForNext = function (level) { return Math.floor(100*Math.pow(1.35,Math.max(0,level-1))); };
    instance.addExperience = function (amount) {
        var u=this.getActive(); if(!u||u.members.length===0)return;
        var b=this.getBonuses(); u.experience+=Math.max(0,num(amount,0))*(1+b.xp/100);
        while(u.experience>=this.getXpForNext(u.level)){
            u.experience-=this.getXpForNext(u.level);u.level+=1;u.talentPoints+=1;
            Game.notifySuccess("Union level increased",u.name+" reached level "+u.level+" and gained a talent point.");
        }
    };

    instance.getTalentCost = function (unionId,talentId) { var u=this.getUnion(unionId),t=Game.unionData.talents[talentId]; if(!u||!t)return Infinity; return t.baseCost+Math.floor(num(u.talents[talentId],0)/3); };
    instance.buyTalent = function (unionId,talentId) {
        var u=this.getUnion(unionId),t=Game.unionData.talents[talentId]; if(!u||!t)return false;
        var level=Math.floor(num(u.talents[talentId],0)),cost=this.getTalentCost(unionId,talentId);
        if(level>=t.maxLevel||u.talentPoints<cost)return false;
        u.talentPoints-=cost;u.talents[talentId]=level+1;return true;
    };

    instance.update = function (delta) {
        var u=this.getActive(); if(!u||u.members.length===0)return;
        var power=0;
        for(var i=0;i<u.members.length;i++){var e=Game.miners.getEntry(u.members[i].minerId);if(e&&e.owned>0)power+=e.level*e.definition.rarity.incomeMultiplier;}
        this.addExperience(delta*Math.max(0.05,power*0.003));
    };

    instance.resetForAscension = function () {
        for(var id in this.unions){if(!this.unions.hasOwnProperty(id))continue;var u=this.unions[id];u.members=[];u.level=1;u.experience=0;}
    };

    return instance;
}());
