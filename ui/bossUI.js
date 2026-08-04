Game.bossUI = (function () {
    "use strict";
    var instance = { initialised: false, elapsed: 0 };
    function fmt(value) { return Game.utils && Game.utils.formatNumber ? Game.utils.formatNumber(value) : Math.floor(value).toLocaleString(); }
    function timeString(ms) { var s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60); return m+"m "+((s%60)<10?"0":"")+(s%60)+"s"; }
    instance.initialise=function(){
        if(this.initialised)return;
        $("#tabContent").append('<div id="planetGateArena" class="myco-gate-overlay hidden"><div class="myco-gate-arena"><button id="closeGateArena" class="btn btn-default myco-gate-close">Close</button><div id="gateArenaContent"></div></div></div>');
        $(document).on('click','#closeGateArena',function(){ if(!Game.bosses.activeBattle) $('#planetGateArena').addClass('hidden'); });
        $(document).on('click','.boss-team-toggle',function(){Game.bosses.toggleTeamMember($(this).attr('data-miner-id'));instance.render();});
        $(document).on('click','#bossAutoTeam',function(){Game.bosses.autoSelectTeam();instance.render();});
        $(document).on('click','#bossStartGate',function(){var id=$(this).attr('data-boss-id');if(Game.bosses.startBattle(id)) instance.openArena();instance.render();});
        $(document).on('click','#bossRetreat',function(){Game.bosses.cancelBattle();instance.render();});
        this.initialised=true;this.render();
    };
    instance.openArena=function(){ $('#planetGateArena').removeClass('hidden'); this.render(); };
    instance.render=function(){
        if(!this.initialised)return;
        var snap=Game.bosses.getActiveSnapshot();
        var boss=snap?snap.boss:Game.bosses.getBossForPlanet(Game.planets.activePlanetId);
        if(!boss){$('#gateArenaContent').html('<p>No guardian assigned.</p>');return;}
        var miners=Game.miners.getEntriesSorted(), team=[];
        for(var i=0;i<miners.length;i++){var m=miners[i];if(m.owned<=0)continue;var sel=Game.bosses.selectedTeam.indexOf(m.id)>=0;var hp=Game.miners.getCurrentHealth(m.id),max=Game.miners.getMaxHealth(m.id);team.push('<button class="boss-team-toggle myco-team-chip '+(sel?'selected':'')+'" data-miner-id="'+m.id+'" '+(Game.bosses.activeBattle||hp<=0?'disabled':'')+'><strong>'+m.definition.name+'</strong><span>HP '+fmt(hp)+' / '+fmt(max)+' • Power '+fmt(Game.bosses.getMinerCombatPower(m.id))+'</span></button>');}
        var health=Game.bosses.getTeamHealth(snap?snap.team:Game.bosses.selectedTeam);
        var html='<section class="myco-gate-header"><img src="'+boss.image+'" alt="'+boss.name+'"><div><div class="myco-eyebrow">PLANETARY GATE GUARDIAN</div><h2>'+boss.name+'</h2><p>'+boss.description+'</p></div></section>'+
        '<section class="myco-panel-grid"><article class="myco-panel"><h3>Combat squad</h3><div class="myco-boss-health-label"><span>Total team HP</span><strong>'+fmt(health.current)+' / '+fmt(health.max)+'</strong></div><progress class="myco-native-progress team" value="'+health.current+'" max="'+Math.max(1,health.max)+'">'+Math.round(health.max?health.current/health.max*100:0)+'%</progress><button id="bossAutoTeam" class="btn btn-default">Select Strongest Healthy Team</button><div class="myco-boss-team-grid">'+(team.join('')||'<p>No healthy miners available.</p>')+'</div></article><article class="myco-panel"><h3>Battle status</h3>';
        if(snap){html+='<div class="myco-boss-health-label"><span>Boss HP</span><strong>'+fmt(snap.health)+' / '+fmt(boss.maxHealth)+'</strong></div><progress class="myco-native-progress boss" value="'+snap.health+'" max="'+boss.maxHealth+'">'+Math.round(snap.healthPercent)+'%</progress><div class="myco-kv-list"><div><span>Phase</span><strong>'+snap.phase.name+'</strong></div><div><span>Time remaining</span><strong>'+timeString(snap.remainingMs)+'</strong></div><div><span>Living miners</span><strong>'+snap.livingCount+' / '+snap.team.length+'</strong></div><div><span>Damage dealt</span><strong>'+fmt(snap.totalDamage)+'</strong></div><div><span>Damage received</span><strong>'+fmt(snap.totalDamageTaken)+'</strong></div></div><button id="bossRetreat" class="btn btn-danger">Retreat</button>';}else{var ready=Game.planets.isGateReady(boss.planetId);html+='<div class="myco-kv-list"><div><span>Boss HP</span><strong>'+fmt(boss.maxHealth)+'</strong></div><div><span>Attack</span><strong>'+fmt(boss.attackPower)+'/s</strong></div><div><span>Time limit</span><strong>'+timeString(boss.durationSeconds*1000)+'</strong></div></div><button id="bossStartGate" class="btn btn-warning" data-boss-id="'+boss.id+'" '+(!ready||Game.bosses.getTeamPower()<=0?'disabled':'')+'>Begin Gate Battle</button>';}
        html+='</article></section>';
        $('#gateArenaContent').html(html);
    };
    instance.update=function(d){this.elapsed+=d;if(this.elapsed>=0.5){this.elapsed=0;this.render();if(Game.bosses.activeBattle)$('#planetGateArena').removeClass('hidden');}};
    return instance;
}());
