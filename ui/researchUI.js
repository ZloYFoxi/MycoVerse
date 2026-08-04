Game.researchUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function format(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    function requirementsText(node) {
        var names = [];
        var required = node.requires || [];
        var any = node.requiresAny || [];
        for (var i = 0; i < required.length; i++) {
            names.push(Game.researchData.nodes[required[i]].name);
        }
        if (any.length) {
            var anyNames = [];
            for (var j = 0; j < any.length; j++) anyNames.push(Game.researchData.nodes[any[j]].name);
            names.push("one of: " + anyNames.join(", "));
        }
        return names.length ? names.join(" · ") : "No prerequisite";
    }

    instance.initialise = function () {
        if (this.initialised) return;
        var colonyTab = $("#colonyTopTab");
        var tab = '<li role="presentation" id="researchTopTab"><a href="#researchPage" aria-controls="researchPage" role="tab" data-toggle="tab">' +
            '<span class="glyphicon glyphicon-grain"></span> Research</a></li>';
        if (colonyTab.length) colonyTab.after(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="researchPage">' +
            '<section class="myco-research-hero"><div><div class="myco-eyebrow">LIVING KNOWLEDGE</div><h2>Mycelium Research</h2>' +
            '<p>Convert colony activity into Insight, unlock permanent adaptations, and choose one defining specialization.</p></div>' +
            '<div class="myco-research-currency"><span>INSIGHT</span><strong id="researchInsight">0</strong><small id="researchRate">+0/s</small></div></section>' +
            '<div class="myco-research-summary"><article><span>Completed nodes</span><strong id="researchCompleted">0 / 7</strong></article>' +
            '<article><span>Specialization</span><strong id="researchSpecialization">Unchosen</strong></article>' +
            '<article><span>Colony Power</span><strong id="researchPower">0</strong></article></div>' +
            '<section class="myco-research-panel"><div class="myco-eyebrow">EVOLUTION PATH</div><div id="researchTree" class="myco-research-grid"></div></section>' +
            '<section class="myco-research-panel"><div class="myco-eyebrow">COLONY SPECIALIZATION</div><div id="researchSpecs" class="myco-spec-grid"></div></section>' +
            '</div>'
        );

        $("#researchTree").on("click", "button[data-research-id]", function () {
            Game.research.purchase($(this).data("research-id"));
            instance.render();
            if (Game.colonyUI) Game.colonyUI.render();
        });
        $("#researchSpecs").on("click", "button[data-spec-id]", function () {
            Game.research.chooseSpecialization($(this).data("spec-id"));
            instance.render();
            if (Game.colonyUI) Game.colonyUI.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.renderTree = function () {
        var html = [];
        for (var i = 0; i < Game.researchData.order.length; i++) {
            var id = Game.researchData.order[i];
            var node = Game.researchData.nodes[id];
            var bought = Game.research.isPurchased(id);
            var available = Game.research.areRequirementsMet(id);
            var affordable = Game.research.insight >= node.cost;
            html.push('<article class="myco-research-node ' + (bought ? 'completed' : (available ? 'available' : 'locked')) + '">' +
                '<div class="myco-research-node-top"><span>NODE ' + (i + 1) + '</span><strong>' + (bought ? 'COMPLETE' : node.cost + ' Insight') + '</strong></div>' +
                '<h3>' + node.name + '</h3><p>' + node.description + '</p>' +
                '<div class="myco-research-bonus">' + Game.research.getBonusText(node) + '</div>' +
                '<small>' + requirementsText(node) + '</small>' +
                (bought ? '<button class="btn btn-success" disabled>Researched</button>' :
                    '<button class="btn btn-primary" data-research-id="' + id + '" ' + ((!available || !affordable) ? 'disabled' : '') + '>Research</button>') +
                '</article>');
        }
        $("#researchTree").html(html.join(""));
    };

    instance.renderSpecializations = function () {
        var html = [];
        var selected = Game.research.specialization;
        for (var id in Game.researchData.specializations) {
            if (!Game.researchData.specializations.hasOwnProperty(id)) continue;
            var spec = Game.researchData.specializations[id];
            var active = selected === id;
            var unavailable = !!selected || !Game.research.canChooseSpecialization();
            var resource = Game.resourceData[spec.resource];
            html.push('<article class="myco-spec-card ' + (active ? 'active' : '') + '" style="--spec-color:' + spec.color + '">' +
                '<div class="myco-eyebrow">' + (active ? 'ACTIVE PATH' : 'SPECIALIZATION') + '</div><h3>' + spec.name + '</h3>' +
                '<p>' + spec.description + '</p><strong>+' + spec.percent + '% ' + (resource ? resource.name : spec.resource) + ' production</strong>' +
                (active ? '<button class="btn btn-success" disabled>Selected</button>' :
                    '<button class="btn btn-default" data-spec-id="' + id + '" ' + (unavailable ? 'disabled' : '') + '>Choose permanently</button>') +
                '</article>');
        }
        $("#researchSpecs").html(html.join(""));
    };

    instance.render = function () {
        if (!this.initialised) return;
        $("#researchInsight").text(format(Game.research.insight));
        $("#researchRate").text("+" + Game.research.getInsightRate().toFixed(2) + "/s");
        $("#researchCompleted").text(Game.research.getPurchasedCount() + " / " + Game.researchData.order.length);
        $("#researchPower").text(format(Game.research.getColonyPower()));
        var spec = Game.researchData.specializations[Game.research.specialization];
        $("#researchSpecialization").text(spec ? spec.name : "Unchosen");
        this.renderTree();
        this.renderSpecializations();
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed < 0.5) return;
        this.elapsed = 0;
        this.render();
    };

    return instance;
})();