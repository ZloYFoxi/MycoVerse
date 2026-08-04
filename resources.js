Game.resources = (function () {
    'use strict';
    var entries = {
        wood: { id:'wood', name:'Spores', current:0, capacity:Number.MAX_SAFE_INTEGER },
        gem: { id:'gem', name:'Gems', current:0, capacity:Number.MAX_SAFE_INTEGER },
        science: { id:'science', name:'Science', current:0, capacity:Number.MAX_SAFE_INTEGER }
    };
    return {
        entries: entries,
        initialise: function () {
            entries.wood.current = 0;
            entries.gem.current = 0;
            entries.science.current = 0;
        },
        save: function (data) {
            data.resources = { wood: entries.wood.current, gem: entries.gem.current, science: entries.science.current };
        },
        load: function (data) {
            if (!data) return;
            var source = data.resources || {};
            if (source.entries) {
                if (source.entries.wood) entries.wood.current = Number(source.entries.wood.current || 0);
                if (source.entries.gem) entries.gem.current = Number(source.entries.gem.current || 0);
                if (source.entries.science) entries.science.current = Number(source.entries.science.current || 0);
            } else {
                entries.wood.current = Number(source.wood || 0);
                entries.gem.current = Number(source.gem || 0);
                entries.science.current = Number(source.science || 0);
            }
        },
        getResource: function (id) { return entries[id] ? entries[id].current : 0; },
        getResourceData: function (id) { return entries[id] || { id:id, name:id, current:0, capacity:0 }; },
        addResource: function (id, amount) {
            if (!entries[id]) return 0;
            amount = Number(amount || 0);
            if (!isFinite(amount)) return entries[id].current;
            entries[id].current = Math.max(0, entries[id].current + amount);
            return entries[id].current;
        },
        takeResource: function (id, amount) {
            if (!entries[id]) return false;
            amount = Math.max(0, Number(amount || 0));
            if (entries[id].current < amount) return false;
            entries[id].current -= amount;
            return true;
        },
        update: function () {}
    };
}());
