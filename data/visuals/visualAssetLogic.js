Game.visualAssets = (function () {
    "use strict";

    var instance = { currentScreen: "settings", initialised: false };

    function fill(template, id) { return template.replace("{id}", id); }
    function safeId(value) { return String(value || "").replace(/[^A-Za-z0-9_-]/g, ""); }

    instance.getMinerPortrait = function (minerId) {
        return fill(Game.visualAssetData.paths.minerPortrait, safeId(minerId));
    };

    instance.getBossPortrait = function (bossId) {
        var file = Game.visualAssetData.bossFiles[bossId] || safeId(bossId);
        return fill(Game.visualAssetData.paths.bossPortrait, file);
    };

    instance.getPlanetBackground = function (planetId) {
        return fill(Game.visualAssetData.paths.planetBackground, safeId(planetId || "mycoPrime"));
    };

    instance.getScreenIdFromPane = function (paneId) {
        return Game.visualAssetData.screenBackgrounds[paneId] || "settings";
    };

    instance.getScreenBackground = function (screenId) {
        return fill(Game.visualAssetData.paths.screenBackground, safeId(screenId || "settings"));
    };

    instance.applyScreen = function (screenId) {
        screenId = safeId(screenId || "settings");
        this.currentScreen = screenId;
        document.body.setAttribute("data-myco-screen", screenId);
        document.documentElement.style.setProperty("--myco-screen-background", 'url("' + this.getScreenBackground(screenId) + '")');
    };

    instance.applyFromPane = function (paneId) {
        this.applyScreen(this.getScreenIdFromPane(paneId));
    };

    instance.preload = function (urls) {
        if (!Array.isArray(urls)) return;
        for (var i = 0; i < urls.length; i++) {
            var image = new Image();
            image.decoding = "async";
            image.src = urls[i];
        }
    };

    instance.initialise = function () {
        if (this.initialised) return;
        var self = this;
        $(document).on("shown.bs.tab.visualAssets", '#tabList a[data-toggle="tab"]', function (event) {
            var href = $(event.target).attr("href") || "";
            self.applyFromPane(href.replace(/^#/, ""));
        });
        var activePane = $("#tabContent .tab-pane.active").attr("id") || "uiTab";
        this.applyFromPane(activePane);
        var planetId = Game.planets && Game.planets.activePlanetId ? Game.planets.activePlanetId : "mycoPrime";
        this.preload([this.getPlanetBackground(planetId), this.getScreenBackground(this.currentScreen)]);
        this.initialised = true;
    };

    return instance;
}());
