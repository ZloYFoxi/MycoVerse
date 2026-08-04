Game.accessUI = (function () {
    'use strict';

    var instance = { initialised: false, elapsed: 0, lastLevel: 0 };

    function applyRule(systemId, rule, level) {
        var locked = level < rule.level;
        var $tab = $('#' + rule.tabId);
        var $page = $('#' + rule.pageId);
        var $link = $tab.children('a');

        if ($tab.length) {
            $tab.toggleClass('myco-access-locked', locked)
                .attr('aria-disabled', locked ? 'true' : 'false')
                .attr('data-access-system', systemId);
            $link.attr('aria-disabled', locked ? 'true' : 'false')
                .attr('tabindex', locked ? '-1' : '0')
                .attr('title', locked ? (rule.label + ' unlocks at Commander Level ' + rule.level) : '');

            if (locked && !$link.find('.myco-lock-badge').length) {
                $link.append(' <span class="myco-lock-badge" aria-hidden="true">🔒 ' + rule.level + '</span>');
            }
            if (!locked) $link.find('.myco-lock-badge').remove();
        }

        if ($page.length) {
            $page.toggleClass('myco-system-locked', locked)
                .attr('data-access-system', systemId)
                .attr('aria-hidden', locked ? 'true' : ($page.hasClass('active') ? 'false' : 'true'));
            if (locked) $page.attr('inert', '');
            else $page.removeAttr('inert');
        }
    }

    function redirectIfLocked() {
        var $active = $('#tabContent > .tab-pane.active');
        if (!$active.length || Game.access.canOpenTarget($active.attr('id'))) return;
        var fallback = Game.access.getFirstAvailableTarget();
        Game.access.open(fallback, false);
    }

    function bindGuards() {
        // Bootstrap triggers show.bs.tab before changing the active pane. Preventing
        // this event blocks mouse clicks and all programmatic .tab('show') calls.
        $(document).on('show.bs.tab.mycoAccess', '#tabList a[data-toggle="tab"]', function (event) {
            var target = String($(this).attr('href') || '').replace(/^#/, '');
            if (Game.access.guardTarget(target, true)) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            return false;
        });

        // Capture clicks before Bootstrap's delegated tab handler.
        document.addEventListener('click', function (event) {
            var link = event.target && event.target.closest ? event.target.closest('#tabList a[data-toggle="tab"]') : null;
            if (!link) return;
            var target = String(link.getAttribute('href') || '').replace(/^#/, '');
            if (Game.access.guardTarget(target, true)) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        }, true);

        // A locked pane must never accept buttons, forms, or keyboard interaction,
        // even if another script accidentally makes it visible.
        document.addEventListener('click', function (event) {
            var pane = event.target && event.target.closest ? event.target.closest('#tabContent > .tab-pane.myco-system-locked') : null;
            if (!pane) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            Game.access.notifyLocked(pane.id);
        }, true);

        $(window).on('hashchange.mycoAccess', function () {
            var target = String(window.location.hash || '').replace(/^#/, '');
            if (target && !Game.access.guardTarget(target, true)) {
                Game.access.open(Game.access.getFirstAvailableTarget(), false);
            }
        });
    }

    instance.initialise = function () {
        if (this.initialised) return;
        bindGuards();
        this.initialised = true;
        this.lastLevel = Game.access.getLevel();
        this.render();
        redirectIfLocked();
    };

    instance.render = function () {
        if (!this.initialised) return;
        var level = Game.access.getLevel();
        var rules = Game.access.getRules();
        for (var id in rules) if (rules.hasOwnProperty(id)) applyRule(id, rules[id], level);
        this.lastLevel = level;
        redirectIfLocked();
    };

    instance.update = function (delta) {
        this.elapsed += delta;
        if (this.elapsed < 0.5) return;
        this.elapsed = 0;
        var level = Game.access.getLevel();
        if (level !== this.lastLevel) this.render();
    };

    instance.getRules = function () { return Game.access.getRules(); };

    return instance;
}());
