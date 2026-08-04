Game.campaignUI = (function () {
    'use strict';

    var instance = { initialised: false, elapsed: 0 };

    function esc(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function fmt(value) {
        if (Game.utils && Game.utils.formatNumber) return Game.utils.formatNumber(value);
        return Math.floor(value || 0).toLocaleString();
    }

    function rewardText(reward) {
        var parts = [];
        reward = reward || {};
        if (reward.xp) parts.push('+' + reward.xp + ' XP');
        if (reward.mycoCoins) parts.push('+' + reward.mycoCoins + ' MycoCoins');
        if (reward.bloomTokens) parts.push('+' + reward.bloomTokens + ' Bloom Tokens');
        if (reward.worldBossTokens) parts.push('+' + reward.worldBossTokens + ' Boss Tokens');
        if (reward.title) parts.push('Title: ' + reward.title);
        return parts.join(' • ');
    }

    instance.initialise = function () {
        if (this.initialised) return;

        if (!$('#campaignTopTab').length) {
            var $campaignTab = $('<li role="presentation" id="campaignTopTab"><a href="#campaignPage" aria-controls="campaignPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-bookmark"></span> Campaign</a></li>');
            if ($('#questsTopTab').length) $('#questsTopTab').after($campaignTab); else $('#tabList').append($campaignTab);
        }

        if (!$('#campaignPage').length) {
            $('#tabContent').append(
                '<div role="tabpanel" class="tab-pane fade" id="campaignPage">' +
                    '<section class="myco-campaign-hero">' +
                        '<div><div class="myco-eyebrow">STORY MODE</div><h2>Story & Campaign</h2><p>Lead the colony through planetary chapters, complete narrative missions, and record your choices in the journal of MycoVerse.</p></div>' +
                        '<div class="myco-campaign-score"><span>Campaign Progress</span><strong id="campaignProgressLabel">0%</strong><progress id="campaignProgressBar" max="100" value="0"></progress><small id="campaignProgressText">0 / 0 chapters claimed</small></div>' +
                    '</section>' +
                    '<section class="myco-wallet-grid">' +
                        '<div class="myco-wallet-card"><span>Unlocked chapters</span><strong id="campaignUnlocked">0</strong></div>' +
                        '<div class="myco-wallet-card"><span>Completed chapters</span><strong id="campaignCompleted">0</strong></div>' +
                        '<div class="myco-wallet-card"><span>Claimed rewards</span><strong id="campaignClaimed">0</strong></div>' +
                        '<div class="myco-wallet-card"><span>Journal entries</span><strong id="campaignJournalCount">0</strong></div>' +
                    '</section><br>' +
                    '<div class="myco-campaign-layout">' +
                        '<section class="myco-panel myco-campaign-sidebar"><div class="myco-panel-head"><div><div class="myco-eyebrow">CHAPTERS</div><h3>Act I: Blooming Frontier</h3></div></div><div id="campaignChapterList" class="myco-campaign-chapter-list"></div></section>' +
                        '<section class="myco-panel myco-campaign-main"><div id="campaignActiveChapter"></div></section>' +
                    '</div>' +
                    '<br><section class="myco-panel"><div class="myco-panel-head"><div><div class="myco-eyebrow">JOURNAL</div><h3>Story Archive</h3></div></div><div id="campaignJournal" class="myco-campaign-journal"></div></section>' +
                '</div>'
            );
        }

        $(document).on('click', '.campaign-open-chapter', function () {
            Game.campaign.setActiveChapter($(this).attr('data-chapter-id'));
            instance.render();
        });

        $(document).on('click', '.campaign-choice-btn', function () {
            Game.campaign.selectChoice($(this).attr('data-chapter-id'), $(this).attr('data-choice-id'));
            instance.render();
        });

        $(document).on('click', '.campaign-claim-btn', function () {
            Game.campaign.claimReward($(this).attr('data-chapter-id'));
            instance.render();
        });

        this.initialised = true;
        this.render();
    };

    instance.renderChapterList = function (states) {
        var html = [];
        for (var i = 0; i < states.length; i++) {
            var state = states[i];
            var chapter = state.chapter;
            var status = !state.unlocked ? 'Locked' : state.rewardClaimed ? 'Claimed' : state.complete ? 'Complete' : 'In progress';
            var completeCount = 0;
            for (var m = 0; m < state.missions.length; m++) if (state.missions[m].complete) completeCount += 1;
            html.push(
                '<button class="campaign-open-chapter myco-campaign-chapter-card ' + (state.active ? 'active' : '') + ' ' + (state.unlocked ? 'unlocked' : 'locked') + '" data-chapter-id="' + esc(state.id) + '" ' + (!state.unlocked ? 'disabled' : '') + '>' +
                    '<div class="myco-campaign-card-top"><span class="myco-achievement-category">' + esc(chapter.act) + '</span><span class="myco-campaign-status">' + esc(status) + '</span></div>' +
                    '<h4>' + esc(chapter.name) + '</h4><p>' + esc(chapter.subtitle) + '</p>' +
                    '<progress max="' + chapter.missions.length + '" value="' + completeCount + '"></progress>' +
                    '<small>' + completeCount + ' / ' + chapter.missions.length + ' missions complete</small>' +
                '</button>'
            );
        }
        $('#campaignChapterList').html(html.join(''));
    };

    instance.renderActiveChapter = function (state) {
        if (!state) {
            $('#campaignActiveChapter').html('<p>No chapter selected.</p>');
            return;
        }
        var chapter = state.chapter;
        var scenes = [];
        for (var s = 0; s < chapter.scenes.length; s++) {
            scenes.push('<div class="myco-campaign-scene"><strong>' + esc(chapter.scenes[s].speaker) + ':</strong> ' + esc(chapter.scenes[s].text) + '</div>');
        }
        var missions = [];
        for (var m = 0; m < state.missions.length; m++) {
            var mission = chapter.missions[m];
            var progress = state.missions[m];
            missions.push(
                '<div class="myco-campaign-mission ' + (progress.complete ? 'complete' : '') + '">' +
                    '<div class="myco-campaign-mission-head"><strong>' + esc(mission.label) + '</strong><span>' + fmt(Math.min(progress.value, progress.target)) + ' / ' + fmt(progress.target) + '</span></div>' +
                    '<progress max="' + progress.target + '" value="' + Math.min(progress.value, progress.target) + '"></progress>' +
                '</div>'
            );
        }
        var choices = [];
        for (var c = 0; c < chapter.choices.length; c++) {
            var choice = chapter.choices[c];
            var selected = state.choiceId === choice.id;
            choices.push(
                '<button class="campaign-choice-btn myco-campaign-choice ' + (selected ? 'selected' : '') + '" data-chapter-id="' + esc(state.id) + '" data-choice-id="' + esc(choice.id) + '" ' + ((!state.complete || !!state.choiceId) ? 'disabled' : '') + '>' +
                    '<strong>' + esc(choice.title) + '</strong><span>' + esc(choice.description) + '</span><small>' + esc(rewardText(choice.reward)) + '</small>' +
                '</button>'
            );
        }
        var claimDisabled = !state.complete || state.rewardClaimed || (chapter.choices.length && !state.choiceId);
        var headerStatus = !state.unlocked ? 'Locked' : state.rewardClaimed ? 'Chapter claimed' : state.complete ? 'Chapter complete — reward ready' : 'Story mission active';
        $('#campaignActiveChapter').html(
            '<div class="myco-panel-head"><div><div class="myco-eyebrow">' + esc(chapter.act) + '</div><h3>' + esc(chapter.name) + '</h3><p>' + esc(chapter.subtitle) + '</p></div><div class="myco-campaign-header-badge">' + esc(headerStatus) + '</div></div>' +
            '<p class="myco-campaign-description">' + esc(chapter.description) + '</p>' +
            '<div class="myco-campaign-grid">' +
                '<div class="myco-campaign-block"><h4>Story Scene</h4>' + scenes.join('') + '</div>' +
                '<div class="myco-campaign-block"><h4>Missions</h4>' + missions.join('') + '</div>' +
            '</div>' +
            '<div class="myco-campaign-grid">' +
                '<div class="myco-campaign-block"><h4>Chapter Choice</h4><div class="myco-campaign-choice-list">' + choices.join('') + '</div></div>' +
                '<div class="myco-campaign-block"><h4>Rewards</h4><p>' + esc(rewardText(chapter.rewards)) + '</p><button class="btn btn-success campaign-claim-btn" data-chapter-id="' + esc(state.id) + '" ' + (claimDisabled ? 'disabled' : '') + '>' + (state.rewardClaimed ? 'Rewards Claimed' : 'Claim Chapter Rewards') + '</button></div>' +
            '</div>'
        );
    };

    instance.renderJournal = function () {
        var journal = Game.campaign.journal || [];
        var html = [];
        for (var i = 0; i < journal.length; i++) {
            var entry = journal[i];
            html.push('<div class="myco-campaign-journal-entry"><div class="myco-campaign-journal-top"><strong>' + esc(entry.title) + '</strong><span>' + new Date(entry.at).toLocaleString() + '</span></div><p>' + esc(entry.text) + '</p></div>');
        }
        if (!html.length) html.push('<p class="myco-small-note">No journal entries yet. Progress the campaign to fill the archive.</p>');
        $('#campaignJournal').html(html.join(''));
    };

    instance.render = function () {
        if (!this.initialised) return;
        Game.campaign.update();
        var summary = Game.campaign.getSummary();
        var states = Game.campaign.getAllStates();
        var activeState = Game.campaign.getChapterState(Game.campaign.activeChapterId);
        $('#campaignUnlocked').text(summary.unlocked + ' / ' + summary.total);
        $('#campaignCompleted').text(summary.completed + ' / ' + summary.total);
        $('#campaignClaimed').text(summary.claimed + ' / ' + summary.total);
        $('#campaignJournalCount').text(summary.journalEntries);
        $('#campaignProgressLabel').text(Math.floor(summary.percent) + '%');
        $('#campaignProgressBar').val(summary.percent);
        $('#campaignProgressText').text(summary.claimed + ' / ' + summary.total + ' chapters claimed');
        this.renderChapterList(states);
        this.renderActiveChapter(activeState);
        this.renderJournal();
    };

    instance.update = function (delta) {
        this.elapsed += delta;
        if (this.elapsed >= 1) {
            this.elapsed = 0;
            this.render();
        }
    };

    return instance;
}());
