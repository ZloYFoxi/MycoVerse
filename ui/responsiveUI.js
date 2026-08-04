Game.responsiveUI = (function () {
    "use strict";

    var instance = { initialised: false, lastWidthMode: "" };

    function activateTarget(target) {
        var link = $('#tabList a[href="#' + target + '"]');
        if (link.length && !link.closest('li').hasClass('myco-access-locked')) link.tab('show');
    }

    function visibleTabs() {
        var result = [];
        $('#tabList > li').each(function () {
            var li = $(this);
            if (li.hasClass('hidden') || li.css('display') === 'none') return;
            var a = li.children('a');
            var href = a.attr('href');
            if (!href || href.charAt(0) !== '#') return;
            result.push({
                target: href.substring(1),
                label: $.trim(a.text()).replace(/\s+/g, ' '),
                locked: li.hasClass('myco-access-locked') || a.attr('aria-disabled') === 'true'
            });
        });
        return result;
    }

    function renderDrawer() {
        var html = [];
        var tabs = visibleTabs();
        for (var i = 0; i < tabs.length; i++) {
            html.push('<button class="myco-responsive-drawer-item' + (tabs[i].locked ? ' locked' : '') + '" data-responsive-target="' + tabs[i].target + '" ' + (tabs[i].locked ? 'disabled' : '') + '>' + tabs[i].label + '</button>');
        }
        $('#mycoResponsiveDrawerGrid').html(html.join(''));
    }

    function applySettings() {
        var settings = Game.settings.entries;
        $('body')
            .toggleClass('myco-compact-ui', !!settings.compactUI)
            .toggleClass('myco-large-buttons', !!settings.largeButtons)
            .toggleClass('myco-reduced-motion', !!settings.reducedAnimations)
            .toggleClass('myco-hud-collapsed', !!settings.hudCollapsed);
        document.documentElement.style.setProperty('--myco-ui-scale', String(settings.uiScale || 1));

        $('#mycoCompactUI').prop('checked', !!settings.compactUI);
        $('#mycoLargeButtons').prop('checked', !!settings.largeButtons);
        $('#mycoReducedAnimations').prop('checked', !!settings.reducedAnimations);
        $('#mycoHudCollapsed').prop('checked', !!settings.hudCollapsed);
        $('#mycoUIScale').val(String(settings.uiScale || 1));
        $('#mycoUIScaleValue').text(Math.round((settings.uiScale || 1) * 100) + '%');
    }

    function addSettingsPanel() {
        if ($('#mycoResponsiveSettings').length) return;
        var row = '<tr id="mycoResponsiveSettings"><td>' +
            '<h3 class="default btn-link">Responsive Interface</h3>' +
            '<p>Adjust MycoVerse for phones, tablets, or desktop screens.</p>' +
            '<div class="myco-responsive-settings-grid">' +
            '<label><input type="checkbox" id="mycoCompactUI"> Compact UI</label>' +
            '<label><input type="checkbox" id="mycoLargeButtons"> Larger Buttons</label>' +
            '<label><input type="checkbox" id="mycoReducedAnimations"> Reduced Animations</label>' +
            '<label><input type="checkbox" id="mycoHudCollapsed"> Collapse Top HUD</label>' +
            '<label class="myco-scale-setting">UI Scale <input type="range" id="mycoUIScale" min="0.85" max="1.15" step="0.05"><strong id="mycoUIScaleValue">100%</strong></label>' +
            '</div></td></tr>';
        $('#uiTab table').append(row);
    }

    function addMobileNavigation() {
        if ($('#mycoMobileNav').length) return;
        $('body').append(
            '<nav id="mycoMobileNav" class="myco-mobile-nav" aria-label="Mobile game navigation">' +
            '<button data-responsive-target="accountPage"><span>👤</span>Account</button>' +
            '<button data-responsive-target="inventoryPage"><span>🎒</span>Inventory</button>' +
            '<button data-responsive-target="minerShopPage"><span>🛒</span>Shop</button>' +
            '<button data-responsive-target="minersPage"><span>🍄</span>Miners</button>' +
            '<button data-responsive-target="questsPage"><span>📜</span>Quests</button>' +
            '<button id="mycoResponsiveMore"><span>☰</span>More</button>' +
            '</nav>' +
            '<div id="mycoResponsiveDrawer" class="myco-responsive-drawer" aria-hidden="true">' +
            '<div class="myco-responsive-drawer-head"><strong>All Systems</strong><button id="mycoResponsiveClose" class="btn btn-default">Close</button></div>' +
            '<div id="mycoResponsiveDrawerGrid" class="myco-responsive-drawer-grid"></div></div>'
        );
    }

    function bindEvents() {
        $(document).on('click', '[data-responsive-target]', function () {
            activateTarget($(this).attr('data-responsive-target'));
            $('#mycoResponsiveDrawer').removeClass('open').attr('aria-hidden', 'true');
        });
        $(document).on('click', '#mycoResponsiveMore', function () {
            renderDrawer();
            $('#mycoResponsiveDrawer').addClass('open').attr('aria-hidden', 'false');
        });
        $(document).on('click', '#mycoResponsiveClose', function () {
            $('#mycoResponsiveDrawer').removeClass('open').attr('aria-hidden', 'true');
        });
        $(document).on('change', '#mycoCompactUI,#mycoLargeButtons,#mycoReducedAnimations,#mycoHudCollapsed', function () {
            Game.settings.set('compactUI', $('#mycoCompactUI').is(':checked'));
            Game.settings.set('largeButtons', $('#mycoLargeButtons').is(':checked'));
            Game.settings.set('reducedAnimations', $('#mycoReducedAnimations').is(':checked'));
            Game.settings.set('hudCollapsed', $('#mycoHudCollapsed').is(':checked'));
            applySettings();
        });
        $(document).on('input change', '#mycoUIScale', function () {
            Game.settings.set('uiScale', Number($(this).val()) || 1);
            applySettings();
        });
        $(window).on('resize.mycoResponsive', function () { instance.refresh(); });
    }

    instance.initialise = function () {
        if (this.initialised) return;
        addMobileNavigation();
        addSettingsPanel();
        bindEvents();
        applySettings();
        this.initialised = true;
        this.refresh();
    };

    instance.refresh = function () {
        var width = window.innerWidth || document.documentElement.clientWidth;
        var mode = width < 600 ? 'phone' : (width < 900 ? 'tablet' : (width < 1200 ? 'laptop' : 'desktop'));
        $('body').removeClass('myco-screen-phone myco-screen-tablet myco-screen-laptop myco-screen-desktop').addClass('myco-screen-' + mode);
        if (mode !== this.lastWidthMode) {
            this.lastWidthMode = mode;
            renderDrawer();
        }
    };

    instance.update = function () {};

    return instance;
}());
