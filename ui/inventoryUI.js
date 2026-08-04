Game.inventoryUI = (function () {
    "use strict";
    var instance = { initialised:false, elapsed:0, filter:"all" };
    function fmt(v){ return Game.utils && Game.utils.formatNumber ? Game.utils.formatNumber(v) : Math.floor(v).toLocaleString(); }
    instance.initialise=function(){
        if(this.initialised)return;
        $("#tabList").append('<li role="presentation" id="inventoryTopTab"><a href="#inventoryPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-briefcase"></span> Inventory</a></li>');
        $("#tabContent").append('<div role="tabpanel" class="tab-pane fade" id="inventoryPage"><section class="myco-market-head"><div><div class="myco-eyebrow">COLLECTION ARCHIVE</div><h2>Inventory Hub</h2><p>Review every awakened species and recovered relic in one place.</p></div><div class="myco-wallet-card"><span>Collection Score</span><strong id="inventoryScore">0</strong></div></section><div class="myco-filter-row"><button class="btn btn-success inventory-filter" data-filter="all">All</button><button class="btn btn-default inventory-filter" data-filter="miner">Miners</button><button class="btn btn-default inventory-filter" data-filter="artifact">Artifacts</button></div><div id="inventoryGrid" class="myco-market-grid"></div></div>');
        $(document).on("click",".inventory-filter",function(){ instance.filter=$(this).attr("data-filter"); $(".inventory-filter").removeClass("btn-success").addClass("btn-default"); $(this).removeClass("btn-default").addClass("btn-success"); instance.render(); });
        this.initialised=true; this.render();
    };
    instance.render=function(){
        if(!this.initialised)return;
        var summary=Game.inventory.getSummary(); $("#inventoryScore").text(fmt(summary.collectionScore));
        var items=Game.inventory.getMinerItems().concat(Game.inventory.getArtifactItems()), html=[];
        for(var i=0;i<items.length;i++){
            var x=items[i]; if(this.filter!=="all"&&this.filter!==x.type)continue;
            var detail=x.type==="miner" ? ("Owned: "+x.owned+" • Level "+x.level+" • "+(x.income*60).toFixed(2)+"/min") : ("Copies: "+x.owned+" • "+x.slot+" • "+x.bonusText+(x.equipped?" • Equipped":""));
            html.push('<article class="myco-offer-card" style="border-color:'+x.rarityColor+'"><div class="myco-offer-type">'+x.type.toUpperCase()+' • '+x.rarity+'</div><h4>'+x.name+'</h4><p>'+x.description+'</p><strong>'+detail+'</strong></article>');
        }
        $("#inventoryGrid").html(html.join("")||'<p class="text-muted">Nothing collected yet.</p>');
    };
    instance.update=function(delta){ this.elapsed+=delta; if(this.elapsed>=1){this.elapsed=0;this.render();} };
    return instance;
}());
