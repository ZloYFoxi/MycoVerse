Game.frontendUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function format(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    function toTime(ms) {
        ms = Math.max(0, Math.floor(ms / 1000));
        var h = Math.floor(ms / 3600);
        var m = Math.floor((ms % 3600) / 60);
        var s = ms % 60;
        return (h > 0 ? h + "h " : "") + (m > 0 ? m + "m " : "") + s + "s";
    }

    function showTab(target) {
        $('#tabList a[href="#' + target + '"]').tab('show');
    }

    function closeTitle() {
        $("#mycoTitleScreen").addClass("hidden");
        try { sessionStorage.setItem("myco_title_seen", "1"); } catch (e) {}
    }

    function maybeShowTitle() {
        var seen = false;
        try { seen = sessionStorage.getItem("myco_title_seen") === "1"; } catch (e) {}
        if (!seen) $("#mycoTitleScreen").removeClass("hidden");
    }

    instance.initialise = function () {
        if (this.initialised) return;

        $("#game").addClass("myco-shell");
        $(".navbar").addClass("myco-topbar");
        $("#loadScreen").addClass("myco-loadscreen");

        $("#updateBox").after(
            '<section class="myco-command-bar">' +
            '<div class="myco-command-profile">' +
            '<div class="myco-avatar">🍄</div>' +
            '<div><div class="myco-command-label">Commander</div><strong id="mycoCommandName">Wandering Spore</strong><div class="myco-command-sub"><span id="mycoCommandId">MV-0000</span> • <span id="mycoActiveWorldLabel">Myco Prime</span></div></div>' +
            '</div>' +
            '<div class="myco-command-wallet">' +
            '<div class="myco-wallet-chip"><span>MycoCoins</span><strong id="mycoCoinsHud">0</strong></div>' +
            '<div class="myco-wallet-chip"><span>Bloom Tokens</span><strong id="mycoTokensHud">0</strong></div>' +
            '<div class="myco-wallet-chip"><span>Colony Power</span><strong id="mycoPowerHud">0</strong></div>' +
            '</div>' +
            '<div class="myco-command-actions">' +
            '<button class="btn btn-default myco-ghost-button" id="mycoOpenTitle">Home</button>' +
            '<button class="btn btn-success" id="mycoOpenAccount">Account</button>' +
            '<button class="btn btn-warning" id="mycoOpenMarket">Marketplace</button>' +
            '</div>' +
            '</section>' +
            '<section class="myco-hero-banner">' +
            '<div><div class="myco-eyebrow">MYCOVERSE FRONTIER</div><h1>Grow a living fungal empire.</h1><p>Explore living planets, command evolving miners, defeat guardians, and write the first campaign of a galactic mycelium.</p><div class="myco-hero-actions"><button class="btn btn-success" data-hero-target="campaignPage">Continue Campaign</button><button class="btn btn-default" data-hero-target="planetsPage">View Planets</button></div></div>' +
            '<div class="myco-hero-stats">' +
            '<article><span>Active Season</span><strong id="mycoHeroSeason">—</strong></article>' +
            '<article><span>Golden Hour</span><strong id="mycoHeroGolden">—</strong></article>' +
            '<article><span>Marketplace Refresh</span><strong id="mycoHeroMarket">—</strong></article>' +
            '</div></section>'
        );

        $("body").append(
            '<div id="mycoTitleScreen" class="myco-title-screen hidden">' +
            '<div class="myco-title-backdrop"></div><div class="myco-title-orb" aria-hidden="true"></div>' +
            '<div class="myco-title-card">' +
            '<div class="myco-eyebrow">WELCOME TO MYCOVERSE</div>' +
            '<div class="myco-title-logo"><span class="myco-logo-mark">M</span><span>MYCOVERSE</span></div><h1>From a single spore to a galactic network.</h1>' +
            '<p>Awaken miners, cross living worlds, conquer gate guardians, and shape the future of a cosmic fungal civilization.</p>' +
            '<div class="myco-title-actions">' +
            '<button class="btn btn-success btn-lg" id="mycoTitlePlay">Enter MycoVerse</button>' +
            '<button class="btn btn-default btn-lg" id="mycoTitleAccount">Account</button>' +
            '<button class="btn btn-warning btn-lg" id="mycoTitleMarket">Marketplace</button>' +
            '</div>' +
            '<div class="myco-title-grid">' +
            '<article><strong>Commander Profile</strong><span>Level up your identity, unlock titles, choose an avatar, and create portable profile snapshots.</span></article>' +
            '<article><strong>Inventory Hub</strong><span>Browse every miner and artifact in one unified collection archive.</span></article>' +
            '<article><strong>Marketplace</strong><span>Buy curated miners and artifacts, then sell duplicate specimens for MycoCoins.</span></article>' +
            '</div>' +
            '</div></div>'
        );

        $(document).on("click", "#mycoOpenTitle", function () { $("#mycoTitleScreen").removeClass("hidden"); });
        $(document).on("click", "#mycoTitlePlay", function () { closeTitle(); showTab("minersPage"); });
        $(document).on("click", "#mycoTitleAccount,#mycoOpenAccount", function () { closeTitle(); showTab("accountPage"); });
        $(document).on("click", "#mycoTitleInventory,#mycoOpenInventory", function () { closeTitle(); showTab("inventoryPage"); });
        $(document).on("click", "#mycoTitleMarket,#mycoOpenMarket", function () { closeTitle(); showTab("marketPage"); });
        $(document).on("click", "[data-hero-target]", function () { showTab($(this).attr("data-hero-target")); });

        this.initialised = true;
        this.render();
        maybeShowTitle();
    };

    instance.render = function () {
        if (!this.initialised) return;
        var summary = Game.account ? Game.account.getSummary() : { name: "Wandering Spore", id: "MV-0000", mycoCoins: 0, bloomTokens: 0, power: 0 };
        $("#mycoCommandName").text(summary.name);
        $("#mycoCommandId").text(summary.id);
        $("#mycoCoinsHud").text(format(summary.mycoCoins));
        $("#mycoTokensHud").text(format(summary.bloomTokens));
        $("#mycoPowerHud").text(format(summary.power));

        var seasonName = (Game.worldCycle && Game.worldCycle.getSeason) ? Game.worldCycle.getSeason().name : "—";
        $("#mycoHeroSeason").text(seasonName);

        if (Game.goldenEvents && Game.goldenEvents.isGoldenHourActive && Game.goldenEvents.isGoldenHourActive()) {
            $("#mycoHeroGolden").text("Active");
        } else if (Game.goldenEvents && Game.goldenEvents.getGoldenHourTimeRemaining) {
            $("#mycoHeroGolden").text(toTime(Game.goldenEvents.getGoldenHourTimeRemaining()));
        }

        if (Game.market && Game.market.getRefreshRemaining) {
            $("#mycoHeroMarket").text(toTime(Game.market.getRefreshRemaining()));
        }
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.5) {
            this.elapsed = 0;
            this.render();
        }
    };

    return instance;
}());
