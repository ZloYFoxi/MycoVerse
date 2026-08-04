Game.minerShop = (function () {
    "use strict";
    var instance = { dataVersion:1, purchases:0 };
    function rarityXp(def){ var id=def.rarity.id; return id==='common'?50:id==='rare'?90:id==='epic'?170:id==='legendary'?320:550; }
    function price(def){ if(Game.economy&&Game.economy.getMarketPrice)return Math.max(50,Math.floor(Game.economy.getMarketPrice('miner',def.id||'')*0.85)); return Math.max(50,Math.floor((def.unlockCost||100)*0.45+(def.upgradeBaseCost||10)*3)); }
    instance.initialise=function(){this.purchases=0;};
    instance.save=function(data){data.minerShop={version:this.dataVersion,purchases:this.purchases};};
    instance.load=function(data){if(data&&data.minerShop)this.purchases=Math.max(0,Number(data.minerShop.purchases)||0);};
    instance.getPrice=function(id){var d=Game.minerData[id]; if(!d)return Infinity; if(Game.economy&&Game.economy.getMarketPrice)return Math.max(50,Math.floor(Game.economy.getMarketPrice('miner',id)*0.85)); return price(d);};
    instance.getXpReward=function(id){var d=Game.minerData[id];return d?rarityXp(d):0;};
    instance.getAvailable=function(){var out=[];for(var id in Game.minerData){if(!Game.minerData.hasOwnProperty(id))continue;var d=Game.minerData[id],e=Game.miners.getEntry(id);if(d.bossExclusive||!e||e.owned>0)continue;out.push({id:id,definition:d,price:this.getPrice(id),xp:this.getXpReward(id)});}out.sort(function(a,b){return (a.definition.order||999)-(b.definition.order||999);});return out;};
    instance.buy=function(id){var d=Game.minerData[id],e=Game.miners.getEntry(id);if(!d||d.bossExclusive||!e||e.owned>0)return false;var p=this.getPrice(id);if(!Game.account.spend('mycoCoins',p)){Game.notifyInfo('Not enough MycoCoins','You need '+p+' MycoCoins.');return false;}Game.miners.unlock(id,1);var xp=this.getXpReward(id);Game.account.addXp(xp,'Purchased '+d.name,true);Game.account.recordStat('minersPurchased',1);if(Game.quests&&Game.quests.recordMinerPurchase)Game.quests.recordMinerPurchase();this.purchases+=1;if(Game.notifySuccess)Game.notifySuccess('Miner purchased',d.name+' joined your colony. +'+xp+' XP');return true;};
    return instance;
}());
