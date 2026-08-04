Game.goldenEventUI = (function () {
    'use strict';

    var instance = { initialised: false, elapsed: 0, returnPage: 'minersPage' };

    function formatTime(seconds) {
        seconds = Math.max(0, Math.ceil(seconds));
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        if (hours > 0) return hours + 'h ' + minutes + 'm';
        if (minutes > 0) return minutes + 'm ' + secs + 's';
        return secs + 's';
    }

    function activePageId() {
        var id = $('#tabContent > .tab-pane.active').attr('id');
        return id || 'minersPage';
    }

    function openHiddenPage() {
        instance.returnPage = activePageId();
        $('#goldenMushroomHiddenTab a').tab('show');
        instance.renderHiddenPage();
    }

    function returnToPreviousPage() {
        var target = instance.returnPage || (Game.access && Game.access.getFirstAvailableTarget ? Game.access.getFirstAvailableTarget() : 'minersPage');
        if (Game.access && Game.access.open && Game.access.open(target, false)) return;
        $('#tabList a[href="#' + target + '"]').tab('show');
    }

    instance.initialise = function () {
        if (this.initialised) return;

        $('#eventsTopTab,#eventsPage').remove();
        $('#game').prepend(
            '<div id="goldenHourGlobalBanner" class="myco-golden-global hidden" role="status">' +
                '<strong>GOLDEN HOUR</strong><span id="goldenHourGlobalTimer"></span>' +
                '<span>x' + Game.goldenEventData.goldenHourMultiplier + ' miner production</span>' +
            '</div>'
        );

        $('#tabList').append('<li role="presentation" id="goldenMushroomHiddenTab" class="myco-hidden-event-tab" aria-hidden="true"><a href="#goldenMushroomPage" aria-controls="goldenMushroomPage" role="tab" data-toggle="tab">Golden Mushroom</a></li>');
        $('#tabContent').append(
            '<div role="tabpanel" class="tab-pane fade" id="goldenMushroomPage">' +
                '<section class="myco-hidden-mushroom-page">' +
                    '<div class="myco-eyebrow">SECRET DISCOVERY</div>' +
                    '<div class="myco-hidden-mushroom-art" aria-hidden="true"><img src="Assets/ui/backgrounds/goldenMushroomFeature.webp" alt="" loading="lazy" decoding="async"></div>' +
                    '<h2>Golden Mushroom</h2>' +
                    '<p id="hiddenMushroomDescription">A living golden capsule has been discovered.</p>' +
                    '<div class="myco-hidden-mushroom-meta"><span>Active planet</span><strong id="hiddenMushroomPlanet">Myco Prime</strong></div>' +
                    '<div class="myco-hidden-mushroom-meta"><span>Time remaining</span><strong id="hiddenMushroomTimer">—</strong></div>' +
                    '<button id="openHiddenGoldenMushroom" class="btn btn-warning btn-lg">Open Mushroom</button>' +
                    '<button id="leaveHiddenGoldenMushroom" class="btn btn-default">Return</button>' +
                    '<div id="hiddenMushroomLastReward" class="myco-last-reward"></div>' +
                '</section>' +
            '</div>'
        );

        $('body').append('<button id="hiddenGoldenMushroomMarker" class="myco-hidden-mushroom-marker hidden" type="button" aria-label="Hidden Golden Mushroom"><span aria-hidden="true">🍄</span></button>');

        $(document).on('click', '#hiddenGoldenMushroomMarker', function () {
            if (!Game.goldenEvents.findMushroom()) return;
            $(this).addClass('hidden');
            openHiddenPage();
        });
        $(document).on('click', '#openHiddenGoldenMushroom', function () {
            var reward = Game.goldenEvents.openMushroom();
            instance.renderHiddenPage();
            if (reward) setTimeout(returnToPreviousPage, 900);
        });
        $(document).on('click', '#leaveHiddenGoldenMushroom', function () { returnToPreviousPage(); });

        this.initialised = true;
        this.render();
    };

    instance.renderMarker = function () {
        var events = Game.goldenEvents;
        var $marker = $('#hiddenGoldenMushroomMarker');
        var currentPage = activePageId();
        var show = events.isMushroomSearchActive() && !events.mushroomFound && currentPage === events.mushroomTargetPage;
        if (!show) {
            $marker.addClass('hidden');
            return;
        }
        var position = events.mushroomPosition || { top: 50, left: 50 };
        $marker.css({ top: position.top + 'vh', left: position.left + 'vw' }).removeClass('hidden');
    };

    instance.renderHiddenPage = function () {
        var events = Game.goldenEvents;
        $('#hiddenMushroomPlanet').text(events.getPlanet().name);
        $('#hiddenMushroomTimer').text(formatTime(events.getMushroomSearchRemaining()));
        $('#openHiddenGoldenMushroom').prop('disabled', !events.mushroomFound || events.mushroomExpiresAt <= Date.now());
        if (events.lastReward) {
            $('#hiddenMushroomLastReward').html('<strong>Last reward:</strong> ' + events.lastReward.minerName + ' (' + events.lastReward.rarityName + ')');
        } else {
            $('#hiddenMushroomLastReward').text('The reward is determined by the active planet.');
        }
    };

    instance.render = function () {
        if (!this.initialised) return;
        var events = Game.goldenEvents;
        if (events.isGoldenHourActive()) {
            $('#goldenHourGlobalBanner').removeClass('hidden');
            $('#goldenHourGlobalTimer').text(formatTime(events.getGoldenHourTimeRemaining()));
        } else {
            $('#goldenHourGlobalBanner').addClass('hidden');
        }
        this.renderMarker();
        if ($('#goldenMushroomPage').hasClass('active')) {
            if (!events.mushroomFound) returnToPreviousPage();
            else this.renderHiddenPage();
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
