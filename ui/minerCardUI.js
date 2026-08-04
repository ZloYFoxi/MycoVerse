Game.minerCardUI = (function () {
    "use strict";

    function esc(v) { return String(v == null ? "" : v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
    function fmt(v) { return Game.utils && Game.utils.formatNumber ? Game.utils.formatNumber(v) : Math.floor(v || 0).toLocaleString(); }
    function resourceName(id) { return Game.resourceData && Game.resourceData[id] ? Game.resourceData[id].name : id; }
    function health(id) {
        var current = Game.miners.getCurrentHealth(id), max = Math.max(1, Game.miners.getMaxHealth(id));
        var ratio = current / max, status = ratio <= 0 ? "Healing" : ratio < 0.5 ? "Injured" : "Mining";
        return { current: current, max: max, ratio: ratio, status: status, className: status.toLowerCase() };
    }
    function portrait(id, name) {
        return '<div class="myco-card-portrait"><img width="768" height="768" src="'+Game.visualAssets.getMinerPortrait(id)+'" alt="'+esc(name)+' portrait" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=Game.visualAssets.getMinerPortraitFallback();"></div>';
    }
    function badge(label, cls) { return '<span class="myco-miner-status '+cls+'">'+esc(label)+'</span>'; }

    function ownedCard(id, miner, options) {
        options = options || {};
        var d = miner.definition, hp = health(id), income = Game.miners.getMinerIncome(id) * 60;
        return '<article class="myco-collection-card rarity-'+d.rarity.id+' status-'+hp.className+'" style="--rarity:'+d.rarity.color+'">'+
            '<div class="myco-card-topline"><span class="myco-rarity-label">'+d.rarity.name+'</span>'+badge(hp.status,hp.className)+'</div>'+portrait(id,d.name)+
            '<div class="myco-card-body"><h3>'+esc(d.name)+'</h3><p>'+esc(d.description)+'</p>'+ 
            '<div class="myco-card-stats"><span><small>OWNED</small><strong>'+miner.owned+'</strong></span><span><small>LEVEL</small><strong>'+miner.level+' / '+d.maxLevel+'</strong></span><span><small>RESOURCE</small><strong>'+esc(resourceName(d.resource))+'</strong></span><span><small>INCOME</small><strong>'+income.toFixed(2)+'/min</strong></span></div>'+ 
            '<div class="myco-hp-row"><div><span>HP</span><strong>'+Math.floor(hp.current)+' / '+Math.floor(hp.max)+'</strong></div><progress value="'+hp.current+'" max="'+hp.max+'"></progress></div>'+ 
            (hp.ratio < .5 ? '<div class="myco-injury-warning">Below 50% HP — mining speed reduced</div>' : '')+
            (options.extraHtml || '')+'</div></article>';
    }

    function shopCard(x, buttonHtml) {
        var d=x.definition, status=x.free?"FREE FIRST COPY":(x.unlocked?(x.owned>0?"Owned: "+x.owned:"Available now"):"Unlocks at Level "+x.unlockLevel);
        return '<article class="myco-collection-card rarity-'+d.rarity.id+' '+(x.unlocked?'':'is-locked')+'" style="--rarity:'+d.rarity.color+'">'+
            '<div class="myco-card-topline"><span class="myco-rarity-label">'+d.rarity.name+'</span>'+badge(x.unlocked?"Available":"Locked",x.unlocked?"available":"locked")+'</div>'+portrait(x.id,d.name)+
            '<div class="myco-card-body"><div class="myco-card-rank">Rank '+(d.shopRank||1)+' • '+esc(status)+'</div><h3>'+esc(d.name)+'</h3><p>'+esc(d.description)+'</p>'+ 
            '<div class="myco-card-stats"><span><small>RESOURCE</small><strong>'+esc(resourceName(d.resource))+'</strong></span><span><small>BASE</small><strong>'+fmt(d.incomePerMinute)+'/min</strong></span><span><small>PURCHASE XP</small><strong>+'+x.xp+'</strong></span><span><small>OWNED</small><strong>'+x.owned+'</strong></span></div>'+buttonHtml+'</div></article>';
    }

    return { ownedCard: ownedCard, shopCard: shopCard, portrait: portrait, badge: badge, fmt: fmt, resourceName: resourceName, health: health };
}());
