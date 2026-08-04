Game.questUI = (function () {
    "use strict";

    var instance = { initialised: false, elapsed: 0 };

    function format(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value).toLocaleString();
    }

    function formatTime(seconds) {
        seconds = Math.max(0, Math.ceil(seconds));
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = seconds % 60;
        if (hours > 0) return hours + "h " + minutes + "m";
        if (minutes > 0) return minutes + "m " + secs + "s";
        return secs + "s";
    }

    function rewardsText(rewards) {
        var parts = [];
        rewards = rewards || {};
        for (var key in rewards) {
            if (!rewards.hasOwnProperty(key) || key === "minerChance" || key === "minerId" || key === "minerAmount") continue;
            var value = rewards[key];
            var display = Array.isArray(value) ? value[0] + "–" + value[1] : value;
            var name = key === "spores" ? "Spores" : (key === "dna" ? "DNA" :
                (Game.resourceData[key] ? Game.resourceData[key].name : key));
            parts.push(display + " " + name);
        }
        if (rewards.minerId && Game.minerData[rewards.minerId]) {
            var chance = rewards.minerChance === undefined ? 100 : Math.round(rewards.minerChance * 100);
            parts.push(chance + "% " + Game.minerData[rewards.minerId].name);
        }
        return parts.join(" · ");
    }

    instance.initialise = function () {
        if (this.initialised) return;

        var planetsTab = $("#planetsTopTab");
        var tab = '<li role="presentation" id="questsTopTab"><a href="#questsPage" aria-controls="questsPage" role="tab" data-toggle="tab">' +
            '<span class="glyphicon glyphicon-list-alt"></span> Quests</a></li>';
        if (planetsTab.length) planetsTab.after(tab); else $("#tabList").append(tab);

        $("#tabContent").append(
            '<div role="tabpanel" class="tab-pane fade" id="questsPage">' +
            '<section class="myco-quest-hero"><div><div class="myco-eyebrow">COLONY MISSIONS</div><h2>Quests & Expeditions</h2>' +
            '<p>Complete story milestones, return every day for colony objectives, and send fungal teams beyond known territory.</p></div>' +
            '<div class="myco-quest-slots"><span>EXPEDITION SLOTS</span><strong id="questSlotCount">1</strong></div></section>' +
            '<div class="myco-quest-tabs"><button class="active" data-quest-view="story">Story</button>' +
            '<button data-quest-view="daily">Daily</button><button data-quest-view="expeditions">Expeditions</button></div>' +
            '<div id="questStoryView" class="myco-quest-view"></div>' +
            '<div id="questDailyView" class="myco-quest-view hidden"></div>' +
            '<div id="questExpeditionsView" class="myco-quest-view hidden"></div>' +
            '</div>'
        );

        $(".myco-quest-tabs").on("click", "button", function () {
            var view = $(this).data("quest-view");
            $(".myco-quest-tabs button").removeClass("active");
            $(this).addClass("active");
            $(".myco-quest-view").addClass("hidden");
            $("#quest" + view.charAt(0).toUpperCase() + view.slice(1) + "View").removeClass("hidden");
        });

        $("#questStoryView").on("click", "button[data-story-id]", function () {
            Game.quests.claimStory($(this).data("story-id"));
            instance.render();
        });
        $("#questDailyView").on("click", "button[data-daily-id]", function () {
            Game.quests.claimDaily($(this).data("daily-id"));
            instance.render();
        });
        $("#questExpeditionsView").on("click", "button[data-expedition-action='start']", function () {
            Game.quests.startExpedition($(this).data("expedition-id"));
            instance.render();
        });
        $("#questExpeditionsView").on("click", "button[data-expedition-action='claim']", function () {
            Game.quests.claimExpedition($(this).data("expedition-id"));
            instance.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.renderStory = function () {
        var html = [];
        for (var i = 0; i < Game.questData.storyOrder.length; i++) {
            var id = Game.questData.storyOrder[i];
            var quest = Game.questData.story[id];
            var progress = Game.quests.getObjectiveProgress(quest.objective);
            var target = quest.objective.target || 1;
            var complete = Game.quests.isObjectiveComplete(quest.objective);
            var claimed = !!Game.quests.completedStory[id];
            var percent = Math.min(100, Math.floor(progress / target * 100));
            html.push('<article class="myco-quest-card ' + (claimed ? 'claimed' : '') + '">' +
                '<div class="myco-quest-card-head"><div><div class="myco-eyebrow">STORY ' + (i + 1) + '</div><h3>' + quest.name + '</h3></div>' +
                '<span>' + (claimed ? 'COMPLETED' : percent + '%') + '</span></div>' +
                '<p>' + quest.description + '</p><div class="myco-quest-progress"><span style="width:' + percent + '%"></span></div>' +
                '<div class="myco-quest-meta"><span>' + format(progress) + ' / ' + format(target) + '</span><span>' + rewardsText(quest.rewards) + '</span></div>' +
                '<button class="btn btn-success" data-story-id="' + id + '"' + ((!complete || claimed) ? ' disabled' : '') + '>' +
                (claimed ? 'Reward claimed' : 'Claim reward') + '</button></article>');
        }
        $("#questStoryView").html('<div class="myco-quest-grid">' + html.join("") + '</div>');
    };

    instance.renderDaily = function () {
        Game.quests.ensureDailyReset();
        var html = [];
        for (var i = 0; i < Game.questData.daily.length; i++) {
            var quest = Game.questData.daily[i];
            var progress = Game.quests.getObjectiveProgress(quest.objective);
            var target = quest.objective.target;
            var complete = Game.quests.isObjectiveComplete(quest.objective);
            var claimed = !!Game.quests.claimedDaily[quest.id];
            var percent = Math.min(100, Math.floor(progress / target * 100));
            html.push('<article class="myco-quest-card daily ' + (claimed ? 'claimed' : '') + '">' +
                '<div class="myco-quest-card-head"><div><div class="myco-eyebrow">DAILY OBJECTIVE</div><h3>' + quest.name + '</h3></div>' +
                '<span>' + (claimed ? 'DONE' : percent + '%') + '</span></div>' +
                '<p>' + quest.description + '</p><div class="myco-quest-progress"><span style="width:' + percent + '%"></span></div>' +
                '<div class="myco-quest-meta"><span>' + format(progress) + ' / ' + format(target) + '</span><span>' + rewardsText(quest.rewards) + '</span></div>' +
                '<button class="btn btn-primary" data-daily-id="' + quest.id + '"' + ((!complete || claimed) ? ' disabled' : '') + '>' +
                (claimed ? 'Reward claimed' : 'Claim daily reward') + '</button></article>');
        }
        $("#questDailyView").html('<div class="myco-daily-note">Daily objectives reset at 00:00 UTC.</div><div class="myco-quest-grid">' + html.join("") + '</div>');
    };

    instance.renderExpeditions = function () {
        var html = [];
        var activeCount = Game.quests.activeExpeditions.length;
        $("#questSlotCount").text(activeCount + " / " + Game.quests.getExpeditionSlots());
        for (var i = 0; i < Game.questData.expeditionOrder.length; i++) {
            var id = Game.questData.expeditionOrder[i];
            var expedition = Game.quests.getExpedition(id);
            var planet = Game.planets.getPlanet(expedition.planetId);
            var req = Game.quests.getRequirements(id);
            var active = Game.quests.getActiveExpedition(id);
            var ready = active && Date.now() >= active.endsAt;
            var canStart = Game.quests.canStartExpedition(id);
            var status = active ? (ready ? "READY TO CLAIM" : formatTime(Game.quests.getSecondsRemaining(id))) : "AVAILABLE";
            html.push('<article class="myco-expedition-card ' + (active ? 'active' : '') + '">' +
                '<div class="myco-expedition-orb league-' + planet.league + '">' + planet.league + '</div>' +
                '<div class="myco-expedition-copy"><div class="myco-quest-card-head"><div><div class="myco-eyebrow">' + planet.name.toUpperCase() + '</div>' +
                '<h3>' + expedition.name + '</h3></div><span>' + status + '</span></div>' +
                '<div class="myco-expedition-info"><span>Duration: ' + formatTime(expedition.durationSeconds) + '</span>' +
                '<span>Cost: ' + rewardsText(expedition.cost) + '</span></div>' +
                '<div class="myco-expedition-info"><span>Species: ' + req.currentSpecies + ' / ' + req.requiredSpecies + '</span>' +
                '<span>Specimens: ' + req.currentSpecimens + ' / ' + req.requiredSpecimens + '</span></div>' +
                '<div class="myco-expedition-reward">Potential rewards: ' + rewardsText(expedition.rewards) + '</div>' +
                (active ? '<button class="btn btn-success" data-expedition-action="claim" data-expedition-id="' + id + '"' + (!ready ? ' disabled' : '') + '>Claim expedition</button>' :
                '<button class="btn btn-warning" data-expedition-action="start" data-expedition-id="' + id + '"' + (!canStart ? ' disabled' : '') + '>Launch expedition</button>') +
                '</div></article>');
        }
        $("#questExpeditionsView").html('<div class="myco-expedition-list">' + html.join("") + '</div>');
    };

    instance.render = function () {
        if (!this.initialised) return;
        this.renderStory();
        this.renderDaily();
        this.renderExpeditions();
    };

    instance.update = function (delta) {
        if (!this.initialised) return;
        this.elapsed += delta;
        if (this.elapsed >= 1) {
            this.elapsed = 0;
            this.render();
        }
    };

    return instance;
}());
