Game.settings = (function () {
    'use strict';
    var instance = {
        entries: {
            notificationsEnabled: true,
            saveNotifsEnabled: false,
            autoSaveInterval: 60000,
            compactUI: false,
            largeButtons: false,
            reducedAnimations: false,
            hudCollapsed: false,
            uiScale: 1,
            visualQuality: 'high',
            planetBackgrounds: true,
            visualEffects: true
        },
        initialise: function(){},
        save: function(data){ data.settings = JSON.parse(JSON.stringify(this.entries)); },
        load: function(data){ if(data && data.settings) this.entries = Object.assign(this.entries, data.settings.entries || data.settings); },
        update: function(){},
        updateCompanyName: function(){},
        set: function(key, value){ this.entries[key] = value; return value; }
    };
    return instance;
}());
