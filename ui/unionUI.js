Game.unionUI = (function () {
    "use strict";

    var instance={initialised:false,elapsed:0};
    function fmt(v){return Game.utils&&Game.utils.formatNumber?Game.utils.formatNumber(v):Math.floor(v).toLocaleString();}

    instance.initialise=function(){
        if(this.initialised)return;
        $("#tabList").append('<li role="presentation" id="unionsTopTab"><a href="#unionsPage" aria-controls="unionsPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-link"></span> Unions</a></li>');
        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="unionsPage">'+
            '<section class="myco-union-head"><div><div class="myco-eyebrow">COLLECTIVE INTELLIGENCE</div><h2>Miner Unions</h2><p>Organise up to five species into specialised unions. Only the active union grants bonuses.</p></div><div id="unionOverview" class="myco-union-overview"></div></section>'+
            '<div id="unionTabs" class="myco-union-tabs"></div>'+
            '<section class="myco-panel-grid"><article class="myco-panel"><h3>Active union</h3><div id="unionEditor"></div></article><article class="myco-panel"><h3>Available miners</h3><div id="unionAvailable" class="myco-union-available"></div></article></section>'+
            '<section class="myco-panel-grid"><article class="myco-panel"><h3>Synergies & bonuses</h3><div id="unionBonuses"></div></article><article class="myco-panel"><h3>Union talents</h3><div id="unionTalents"></div></article></section></div>'
        );
        $(document).on("click",".union-select-button",function(){Game.unions.setActive($(this).attr("data-union-id"));instance.render();});
        $(document).on("click","#unionRenameButton",function(){Game.unions.rename(Game.unions.activeUnionId,$("#unionNameInput").val());instance.render();});
        $(document).on("click",".union-add-button",function(){var id=$(this).attr("data-miner-id"),role=$(this).siblings("select").val();Game.unions.addMember(Game.unions.activeUnionId,id,role);instance.render();});
        $(document).on("click",".union-remove-button",function(){Game.unions.removeMember(Game.unions.activeUnionId,$(this).attr("data-miner-id"));instance.render();});
        $(document).on("click",".union-role-button",function(){Game.unions.cycleRole(Game.unions.activeUnionId,$(this).attr("data-miner-id"));instance.render();});
        $(document).on("click",".union-talent-button",function(){Game.unions.buyTalent(Game.unions.activeUnionId,$(this).attr("data-talent-id"));instance.render();});
        this.initialised=true;this.render();
    };

    instance.render=function(){
        if(!this.initialised)return;
        var u=Game.unions.getActive(),bon=Game.unions.getBonuses(),syn=Game.unions.getSynergy(u),tabs=[];
        for(var id in Game.unions.unions){if(!Game.unions.unions.hasOwnProperty(id))continue;var item=Game.unions.unions[id];tabs.push('<button class="btn '+(id===Game.unions.activeUnionId?'btn-success':'btn-default')+' union-select-button" data-union-id="'+id+'"><strong>'+item.name+'</strong><span>Lvl '+item.level+' • '+item.members.length+'/'+Game.unionData.maxMembers+'</span></button>');}
        $("#unionTabs").html(tabs.join(""));
        var xpNeed=Game.unions.getXpForNext(u.level),xpPct=Math.min(100,u.experience/xpNeed*100);
        $("#unionOverview").html('<div><span>Level</span><strong>'+u.level+'</strong></div><div><span>Talent points</span><strong>'+u.talentPoints+'</strong></div><div><span>Production</span><strong>+'+bon.global.toFixed(1)+'%</strong></div><div><span>Boss power</span><strong>+'+bon.boss.toFixed(1)+'%</strong></div>');
        var members=[];
        for(var i=0;i<u.members.length;i++){var m=u.members[i],e=Game.miners.getEntry(m.minerId),r=Game.unionData.roles[m.role];if(!e)continue;members.push('<div class="myco-union-member"><div><strong>'+e.definition.name+'</strong><span>'+r.name+' • Level '+e.level+' • Owned '+e.owned+'</span></div><div><button class="btn btn-default union-role-button" data-miner-id="'+m.minerId+'">Change Role</button> <button class="btn btn-danger union-remove-button" data-miner-id="'+m.minerId+'">Remove</button></div></div>');}
        $("#unionEditor").html('<div class="myco-form-row"><input id="unionNameInput" class="form-control" maxlength="28" value="'+u.name.replace(/"/g,'&quot;')+'"><button id="unionRenameButton" class="btn btn-success">Rename</button></div><div class="myco-level-track"><span style="width:'+xpPct+'%"></span></div><div class="myco-small-note">XP '+fmt(u.experience)+' / '+fmt(xpNeed)+'</div>'+(members.join("")||'<p class="text-muted">Add miners to create this union.</p>'));
        var available=[],miners=Game.miners.getEntriesSorted();
        for(var j=0;j<miners.length;j++){var miner=miners[j];if(miner.owned<=0||Game.unions.getMember(u,miner.id))continue;var opts=[];for(var roleId in Game.unionData.roles)if(Game.unionData.roles.hasOwnProperty(roleId))opts.push('<option value="'+roleId+'">'+Game.unionData.roles[roleId].name+'</option>');available.push('<div class="myco-union-available-row"><div><strong>'+miner.definition.name+'</strong><span>'+miner.definition.rarity.name+' • '+miner.definition.resource+'</span></div><div><select class="form-control">'+opts.join("")+'</select><button class="btn btn-primary union-add-button" data-miner-id="'+miner.id+'">Add</button></div></div>');}
        $("#unionAvailable").html(available.join("")||'<p class="text-muted">No eligible miners available.</p>');
        var lines=['<div class="myco-colony-row"><span>All production</span><strong>+'+bon.global.toFixed(1)+'%</strong></div>','<div class="myco-colony-row"><span>Boss team power</span><strong>+'+bon.boss.toFixed(1)+'%</strong></div>','<div class="myco-colony-row"><span>Expedition speed</span><strong>+'+bon.expedition.toFixed(1)+'%</strong></div>'];
        for(var res in bon.resources)if(bon.resources.hasOwnProperty(res))lines.push('<div class="myco-colony-row"><span>'+res+' production</span><strong>+'+bon.resources[res]+'%</strong></div>');
        if(syn.lines.length)lines.push('<div class="myco-note">'+syn.lines.join('<br>')+'</div>');
        $("#unionBonuses").html(lines.join(""));
        var talents=[];for(var tid in Game.unionData.talents){if(!Game.unionData.talents.hasOwnProperty(tid))continue;var t=Game.unionData.talents[tid],lvl=u.talents[tid]||0,cost=Game.unions.getTalentCost(u.id,tid);talents.push('<div class="myco-offer-card"><div class="myco-offer-type">UNION TALENT</div><h4>'+t.name+'</h4><p>'+t.description+'</p><div class="myco-offer-footer"><strong>Level '+lvl+' / '+t.maxLevel+'</strong><button class="btn btn-warning union-talent-button" data-talent-id="'+tid+'" '+(lvl>=t.maxLevel||u.talentPoints<cost?'disabled':'')+'>Upgrade ('+cost+' TP)</button></div></div>');}
        $("#unionTalents").html(talents.join(""));
    };
    instance.update=function(delta){if(!this.initialised)return;this.elapsed+=delta;if(this.elapsed>=1){this.elapsed=0;this.render();}};
    return instance;
}());
