Game.designThemeUI = (function () {
    "use strict";

    var instance = { initialised: false, lastPlanetId: "", elapsed: 0 };

    var themes = {
        mycoPrime: { label: "Myco Prime", accent: "#64f0a2", accent2: "#2b9d6a", danger: "#ff647c", image: "assets/themes/mycoPrime.svg" },
        crystalGrove: { label: "Crystal Grove", accent: "#8ed7ff", accent2: "#7d67ff", danger: "#ff78c8", image: "assets/themes/crystalGrove.svg" },
        toxicForest: { label: "Toxic Forest", accent: "#d5ff43", accent2: "#7fbb2f", danger: "#ff8c45", image: "assets/themes/toxicForest.svg" },
        ancientHive: { label: "Ancient Hive", accent: "#ffbf5e", accent2: "#b56e2f", danger: "#ff6d4d", image: "assets/themes/ancientHive.svg" },
        voidBloom: { label: "Void Bloom", accent: "#ff4d8e", accent2: "#8d4dff", danger: "#ff3e4d", image: "assets/themes/voidBloom.svg" }
    };

    function currentPlanetId() {
        return Game.planets && Game.planets.activePlanetId && themes[Game.planets.activePlanetId] ? Game.planets.activePlanetId : "mycoPrime";
    }

    function ensureSettingDefaults() {
        var entries = Game.settings.entries;
        if (entries.visualQuality === undefined) entries.visualQuality = "high";
        if (entries.planetBackgrounds === undefined) entries.planetBackgrounds = true;
        if (entries.visualEffects === undefined) entries.visualEffects = true;
    }

    function addSettings() {
        if ($("#mycoVisualIdentitySettings").length) return;
        var row = '<tr id="mycoVisualIdentitySettings"><td>' +
            '<h3 class="default btn-link">Visual Identity</h3>' +
            '<p>Control planet backgrounds and atmospheric effects.</p>' +
            '<div class="myco-responsive-settings-grid">' +
            '<label>Background Quality <select id="mycoVisualQuality" class="form-control"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>' +
            '<label><input type="checkbox" id="mycoPlanetBackgrounds"> Planet Backgrounds</label>' +
            '<label><input type="checkbox" id="mycoVisualEffects"> Atmospheric Effects</label>' +
            '</div></td></tr>';
        $("#uiTab table").append(row);
    }

    function applySettingsControls() {
        ensureSettingDefaults();
        $("#mycoVisualQuality").val(Game.settings.entries.visualQuality);
        $("#mycoPlanetBackgrounds").prop("checked", !!Game.settings.entries.planetBackgrounds);
        $("#mycoVisualEffects").prop("checked", !!Game.settings.entries.visualEffects);
    }

    instance.applyTheme = function (planetId) {
        ensureSettingDefaults();
        var id = themes[planetId] ? planetId : "mycoPrime";
        var theme = themes[id];
        var root = document.documentElement;
        root.style.setProperty("--myco-primary", theme.accent);
        root.style.setProperty("--myco-primary-2", theme.accent2);
        root.style.setProperty("--myco-danger", theme.danger);
        root.style.setProperty("--myco-planet-background", 'url("' + theme.image + '")');
        document.body.setAttribute("data-myco-planet", id);
        document.body.setAttribute("data-myco-quality", Game.settings.entries.visualQuality || "high");
        document.body.classList.toggle("myco-backgrounds-off", !Game.settings.entries.planetBackgrounds);
        document.body.classList.toggle("myco-effects-off", !Game.settings.entries.visualEffects);
        $("#mycoActiveWorldLabel").text(theme.label);
        this.lastPlanetId = id;
    };

    instance.initialise = function () {
        if (this.initialised) return;
        ensureSettingDefaults();
        addSettings();
        applySettingsControls();
        $(document).on("change", "#mycoVisualQuality", function () {
            Game.settings.set("visualQuality", $(this).val());
            instance.applyTheme(currentPlanetId());
        });
        $(document).on("change", "#mycoPlanetBackgrounds,#mycoVisualEffects", function () {
            Game.settings.set("planetBackgrounds", $("#mycoPlanetBackgrounds").is(":checked"));
            Game.settings.set("visualEffects", $("#mycoVisualEffects").is(":checked"));
            instance.applyTheme(currentPlanetId());
        });
        this.initialised = true;
        this.applyTheme(currentPlanetId());
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed < 0.5) return;
        this.elapsed = 0;
        var id = currentPlanetId();
        if (id !== this.lastPlanetId) this.applyTheme(id);
    };

    return instance;
}());
