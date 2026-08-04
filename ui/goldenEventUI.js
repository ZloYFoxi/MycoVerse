Game.goldenEventUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function formatTime(seconds) {
        seconds = Math.max(0, Math.ceil(seconds));
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        if (hours > 0) return hours + "h " + minutes + "m";
        if (minutes > 0) return minutes + "m " + secs + "s";
        return secs + "s";
    }

    instance.initialise = function () {
        if (this.initialised) return;

        var laboratoryTab = $("#laboratoryTopTab");
        var tab = '<li role="presentation" id="eventsTopTab"><a href="#eventsPage" aria-controls="eventsPage" role="tab" data-toggle="tab">' +
            '<span class="glyphicon glyphicon-star"></span> Golden Grove</a></li>';
        if (laboratoryTab.length) laboratoryTab.after(tab); else $("#tabList").append(tab);

        $("#game").prepend(
            '<div id="goldenHourGlobalBanner" class="myco-golden-global hidden">' +
            '<strong>GOLDEN HOUR</strong><span id="goldenHourGlobalTimer"></span>' +
            '<span>x' + Game.goldenEventData.goldenHourMultiplier + ' miner production</span></div>'
        );

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="eventsPage">' +
            '<section class="myco-golden-hero"><div><div class="myco-eyebrow">CELESTIAL FUNGAL EVENTS</div>' +
            '<h2>Golden Grove</h2><p>Open living Golden Mushrooms and awaken rare miners. Charge Golden Hour to temporarily amplify the entire colony.</p></div>' +
            '<div class="myco-golden-planet"><span>Current planet</span><strong id="goldenPlanetName">Myco Prime</strong></div></section>' +
            '<div class="myco-golden-grid">' +
            '<article class="myco-event-card myco-mushroom-card"><div class="myco-event-icon">🍄</div><h3>Golden Mushroom</h3>' +
            '<p>A living capsule containing one fungal miner specimen.</p><div id="goldenMushroomStatus" class="myco-event-status"></div>' +
            '<button id="openGoldenMushroom" class="btn btn-warning">Open Golden Mushroom</button>' +
            '<div id="goldenLastReward" class="myco-last-reward"></div></article>' +
            '<article class="myco-event-card myco-hour-card"><div class="myco-event-icon">☀</div><h3>Golden Hour</h3>' +
            '<p>Temporarily multiplies production from every fungal miner by x' + Game.goldenEventData.goldenHourMultiplier + '.</p>' +
            '<div id="goldenHourStatus" class="myco-event-status"></div>' +
            '<button id="activateGoldenHour" class="btn btn-success">Activate Golden Hour</button>' +
            '<div class="myco-hour-track"><span id="goldenHourTrackFill"></span></div></article>' +
            '</div>' +
            '<section class="myco-drop-table"><h3>Myco Prime drop chances</h3><div id="goldenDropRates"></div></section>' +
            '</div>'
        );

        $("#openGoldenMushroom").on("click", function () {
            Game.goldenEvents.openMushroom();
            instance.render();
        });
        $("#activateGoldenHour").on("click", function () {
            Game.goldenEvents.activateGoldenHour();
            instance.render();
        });

        this.initialised = true;
        this.renderDropRates();
        this.render();
    };

    instance.renderDropRates = function () {
        var weights = Game.goldenEvents.getPlanet().rarityWeights;
        var html = [];
        var rarityMap = {
            common: MINER_RARITY.COMMON,
            rare: MINER_RARITY.RARE,
            epic: MINER_RARITY.EPIC,
            legendary: MINER_RARITY.LEGENDARY,
            mythic: MINER_RARITY.MYTHIC
        };
        for (var id in weights) {
            if (!weights.hasOwnProperty(id)) continue;
            var rarity = rarityMap[id];
            html.push('<div class="myco-drop-row"><span style="color:' + rarity.color + '">' +
                rarity.name + '</span><strong>' + weights[id] + '%</strong></div>');
        }
        $("#goldenDropRates").html(html.join(""));
    };

    instance.render = function () {
        if (!this.initialised) return;

        var events = Game.goldenEvents;
        var active = events.isGoldenHourActive();
        var mushroomReady = events.isMushroomReady();
        var hourReady = events.isGoldenHourReady();
        var durationSeconds = Game.goldenEventData.goldenHourDuration / 1000;

        $("#goldenPlanetName").text(events.getPlanet().name);
        $("#openGoldenMushroom").prop("disabled", !mushroomReady);
        $("#goldenMushroomStatus").text(
            mushroomReady ? "A Golden Mushroom is ready." :
            "Next organism matures in " + formatTime(events.getMushroomTimeRemaining()) + "."
        );

        if (events.lastReward) {
            $("#goldenLastReward").html(
                '<strong>Last reward:</strong> ' + events.lastReward.minerName +
                ' <span>(' + events.lastReward.rarityName + ')</span>'
            );
        } else {
            $("#goldenLastReward").text("No Golden Mushrooms opened yet.");
        }

        $("#activateGoldenHour").prop("disabled", !hourReady);
        if (active) {
            var remaining = events.getGoldenHourTimeRemaining();
            $("#goldenHourStatus").text("ACTIVE — " + formatTime(remaining) + " remaining");
            $("#activateGoldenHour").text("Golden Hour active");
            $("#goldenHourTrackFill").css("width", Math.max(0, Math.min(100, remaining / durationSeconds * 100)) + "%");
            $("#goldenHourGlobalBanner").removeClass("hidden");
            $("#goldenHourGlobalTimer").text(formatTime(remaining));
        } else {
            var waiting = events.getGoldenHourTimeRemaining();
            $("#goldenHourStatus").text(hourReady ? "The colony is fully charged." : "Ready in " + formatTime(waiting) + ".");
            $("#activateGoldenHour").text(hourReady ? "Activate Golden Hour" : "Golden Hour charging");
            var cooldownSeconds = Game.goldenEventData.goldenHourCooldown / 1000;
            $("#goldenHourTrackFill").css("width", hourReady ? "100%" : Math.max(0, (1 - waiting / cooldownSeconds) * 100) + "%");
            $("#goldenHourGlobalBanner").addClass("hidden");
        }
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 0.25) {
            this.elapsed = 0;
            this.render();
        }
    };

    return instance;
}());
