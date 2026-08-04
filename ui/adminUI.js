Game.adminUI = (function () {
    'use strict';

    var instance = { initialised:false, elapsed:0 };

    function esc(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    function fmt(value) {
        return Game.utils && Game.utils.formatNumber ? Game.utils.formatNumber(value) : Math.floor(Number(value || 0)).toLocaleString();
    }

    function showAdminTab() {
        $('#adminTopTab').show();
        $('#adminTopTab a').tab('show');
    }

    function hideAdminTab() {
        $('#adminTopTab').hide();
        $('#settingsTopTab a').tab('show');
    }

    instance.initialise = function () {
        if (this.initialised) return;

        $('.myco-modern-header-meta').prepend('<button id="openAdminAccess" class="btn btn-default myco-admin-open">Admin</button>');
        $('#tabList').append('<li role="presentation" id="adminTopTab" style="display:none"><a href="#adminPage" aria-controls="adminPage" role="tab" data-toggle="tab"><span class="glyphicon glyphicon-wrench"></span> Admin</a></li>');
        $('#tabContent').append(
            '<div role="tabpanel" class="tab-pane fade" id="adminPage">' +
                '<section class="myco-admin-warning"><strong>Local Admin Panel</strong><span>This panel controls only the current browser save. It is not secure enough for a real online economy until commands are validated by a server.</span><button id="adminLockButton" class="btn btn-default">Lock</button></section>' +
                '<section class="myco-wallet-grid myco-admin-stats">' +
                    '<div class="myco-wallet-card"><span>Commander Level</span><strong id="adminStatLevel">1</strong></div>' +
                    '<div class="myco-wallet-card"><span>Colony Power</span><strong id="adminStatPower">0</strong></div>' +
                    '<div class="myco-wallet-card"><span>Miner Species</span><strong id="adminStatSpecies">0</strong></div>' +
                    '<div class="myco-wallet-card"><span>Active Planet</span><strong id="adminStatPlanet">—</strong></div>' +
                '</section><br>' +
                '<div class="myco-admin-grid">' +
                    '<section class="myco-panel"><div class="myco-eyebrow">PLAYER ECONOMY</div><h3>Resources & Wallet</h3><div id="adminEconomyControls"></div></section>' +
                    '<section class="myco-panel"><div class="myco-eyebrow">PROFILE</div><h3>Commander Progress</h3><div class="myco-admin-form"><label>Add Commander XP<input id="adminXpAmount" class="form-control" type="number" min="0" value="500"></label><button id="adminAddXp" class="btn btn-primary">Grant XP</button><label>Set Commander Level<input id="adminLevelValue" class="form-control" type="number" min="1" value="10"></label><button id="adminSetLevel" class="btn btn-warning">Set Level</button></div></section>' +
                    '<section class="myco-panel"><div class="myco-eyebrow">MINERS</div><h3>Miner Management</h3><div class="myco-admin-form"><label>Miner<select id="adminMinerSelect" class="form-control"></select></label><label>Owned<input id="adminMinerOwned" class="form-control" type="number" min="0" value="1"></label><label>Level<input id="adminMinerLevel" class="form-control" type="number" min="1" value="1"></label><label class="myco-admin-check"><input id="adminMinerHeal" type="checkbox" checked> Heal after applying</label><button id="adminApplyMiner" class="btn btn-primary">Apply Miner Changes</button><button id="adminHealAll" class="btn btn-success">Heal All Miners</button></div></section>' +
                    '<section class="myco-panel"><div class="myco-eyebrow">PLANETS</div><h3>Planet Progression</h3><div class="myco-admin-form"><label>Planet<select id="adminPlanetSelect" class="form-control"></select></label><label>Progress %<input id="adminPlanetProgress" class="form-control" type="number" min="0" max="100" value="100"></label><div class="myco-admin-button-row"><button class="btn btn-default admin-planet-action" data-action="unlock">Unlock</button><button class="btn btn-primary admin-planet-action" data-action="progress">Set Progress</button><button class="btn btn-success admin-planet-action" data-action="complete">Complete</button><button class="btn btn-danger admin-planet-action" data-action="reset">Reset</button></div></div></section>' +
                    '<section class="myco-panel"><div class="myco-eyebrow">LIVE EVENTS</div><h3>Event Controls</h3><div class="myco-admin-form"><label>Golden Hour minutes<input id="adminGoldenMinutes" class="form-control" type="number" min="1" max="1440" value="60"></label><button id="adminStartGolden" class="btn btn-warning">Start Golden Hour</button><button id="adminEndGolden" class="btn btn-default">End Golden Hour</button><button id="adminReadyMushroom" class="btn btn-success">Spawn Hidden Mushroom</button><button id="adminEndMushroom" class="btn btn-default">End Mushroom Search</button><button id="adminResetDaily" class="btn btn-default">Reset Daily Quests</button><button id="adminResetWorldBoss" class="btn btn-default">Reset World Boss Attempts</button></div></section>' +
                    '<section class="myco-panel"><div class="myco-eyebrow">CURRENCY EXCHANGE</div><h3>Exchange Configuration</h3><div class="myco-admin-form"><label>Spores per 1 MycoCoin<input id="adminExchangeForward" class="form-control" type="number" min="1" value="100"></label><label>Spores returned per 1 MycoCoin<input id="adminExchangeReverse" class="form-control" type="number" min="1" value="80"></label><label>Daily MycoCoin limit<input id="adminExchangeDailyLimit" class="form-control" type="number" min="1" value="1000"></label><button id="adminSaveExchangeConfig" class="btn btn-primary">Save Exchange Settings</button><button id="adminResetExchangeDaily" class="btn btn-default">Reset Daily Limit</button></div></section>' +
                    '<section class="myco-panel"><div class="myco-eyebrow">SAVE SAFETY</div><h3>Snapshots</h3><div class="myco-admin-form"><label>Snapshot label<input id="adminSnapshotLabel" class="form-control" maxlength="40" value="Before admin changes"></label><button id="adminCreateSnapshot" class="btn btn-primary">Create Snapshot</button></div><div id="adminSnapshotList" class="myco-admin-list"></div></section>' +
                    '<section class="myco-panel"><div class="myco-eyebrow">NEW PLAYER TEST</div><h3>Clean Progression Session</h3><p class="myco-small-note">Temporarily store the primary save and launch a clean level-1 profile. Exit Test Mode to restore the original save.</p><div id="adminTestModeState" class="myco-note"></div><div class="myco-admin-button-row"><button id="adminStartTestMode" class="btn btn-warning">Start New Player Test</button><button id="adminExitTestMode" class="btn btn-success">Exit & Restore Main Save</button></div></section>' +
                '</div><br>' +
                '<section class="myco-panel"><div class="myco-eyebrow">DIAGNOSTICS</div><h3>Health Checks & Debug Report</h3><div class="myco-admin-button-row"><button id="adminRunChecks" class="btn btn-primary">Run Health Checks</button><button id="adminCopyDebug" class="btn btn-default">Copy Debug Report</button></div><div id="adminHealthSummary" class="myco-note"></div><div id="adminHealthChecks" class="myco-admin-list"></div><pre id="adminDebugPreview" class="myco-admin-debug-preview"></pre></section><br>' +
                '<section class="myco-panel"><div class="myco-eyebrow">AUDIT LOG</div><h3>Recent Admin Actions</h3><div id="adminAuditLog" class="myco-admin-list"></div></section>' +
            '</div>'
        );

        $('body').append(
            '<div id="adminAccessModal" class="myco-admin-modal hidden" role="dialog" aria-modal="true">' +
                '<div class="myco-admin-modal-card"><div class="myco-eyebrow">LOCAL ADMIN ACCESS</div><h2 id="adminAccessTitle">Unlock Admin Panel</h2><p id="adminAccessHelp">Enter the local admin passcode.</p><input id="adminPasscodeInput" class="form-control" type="password" inputmode="numeric" autocomplete="off" placeholder="Passcode"><div class="myco-admin-button-row"><button id="adminAccessSubmit" class="btn btn-primary">Continue</button><button id="adminAccessCancel" class="btn btn-default">Cancel</button></div></div>' +
            '</div>'
        );

        $(document).on('click','#openAdminAccess',function(){
            $('#adminAccessTitle').text(Game.admin.isConfigured() ? 'Unlock Admin Panel' : 'Create Admin Passcode');
            $('#adminAccessHelp').text(Game.admin.isConfigured() ? 'Enter the local passcode for this browser.' : 'Create a passcode with at least 4 characters. This is only a local lock, not server security.');
            $('#adminPasscodeInput').val('');
            $('#adminAccessModal').removeClass('hidden');
            setTimeout(function(){ $('#adminPasscodeInput').focus(); },50);
        });
        $(document).on('click','#adminAccessCancel',function(){ $('#adminAccessModal').addClass('hidden'); });
        $(document).on('click','#adminAccessSubmit',function(){
            var passcode=$('#adminPasscodeInput').val();
            var ok=Game.admin.isConfigured()?Game.admin.authenticate(passcode):Game.admin.setup(passcode);
            if(!ok){Game.notifyInfo('Access denied','Use the correct passcode, or create one with at least 4 characters.');return;}
            $('#adminAccessModal').addClass('hidden');showAdminTab();instance.render();
        });
        $(document).on('keydown','#adminPasscodeInput',function(e){if(e.key==='Enter')$('#adminAccessSubmit').click();});
        $(document).on('click','#adminLockButton',function(){Game.admin.lock();hideAdminTab();});

        $(document).on('click','.admin-economy-add',function(){var row=$(this).closest('.myco-admin-economy-row');var type=row.attr('data-type'),id=row.attr('data-id'),amount=row.find('.admin-economy-value').val();if(type==='resource')Game.admin.addResource(id,amount);else Game.admin.addCurrency(id,amount);instance.render();});
        $(document).on('click','.admin-economy-set',function(){var row=$(this).closest('.myco-admin-economy-row');var type=row.attr('data-type'),id=row.attr('data-id'),amount=row.find('.admin-economy-value').val();if(type==='resource')Game.admin.setResource(id,amount);else Game.admin.setCurrency(id,amount);instance.render();});
        $(document).on('click','#adminAddXp',function(){Game.admin.addCommanderXp($('#adminXpAmount').val());instance.render();});
        $(document).on('click','#adminSetLevel',function(){Game.admin.setCommanderLevel($('#adminLevelValue').val());instance.render();});
        $(document).on('change','#adminMinerSelect',function(){instance.syncMinerInputs();});
        $(document).on('click','#adminApplyMiner',function(){Game.admin.updateMiner($('#adminMinerSelect').val(),$('#adminMinerOwned').val(),$('#adminMinerLevel').val(),$('#adminMinerHeal').is(':checked'));instance.render();});
        $(document).on('click','#adminHealAll',function(){Game.admin.healAllMiners();instance.render();});
        $(document).on('click','.admin-planet-action',function(){Game.admin.setPlanet($('#adminPlanetSelect').val(),$(this).attr('data-action'),$('#adminPlanetProgress').val());instance.render();});
        $(document).on('click','#adminStartGolden',function(){Game.admin.activateGoldenHour($('#adminGoldenMinutes').val());instance.render();});
        $(document).on('click','#adminEndGolden',function(){Game.admin.endGoldenHour();instance.render();});
        $(document).on('click','#adminReadyMushroom',function(){Game.admin.makeMushroomReady();instance.render();});
        $(document).on('click','#adminEndMushroom',function(){Game.admin.endMushroomSearch();instance.render();});
        $(document).on('click','#adminResetDaily',function(){Game.admin.resetDailyQuests();instance.render();});
        $(document).on('click','#adminResetWorldBoss',function(){Game.admin.resetWorldBossAttempts();instance.render();});
        $(document).on('click','#adminSaveExchangeConfig',function(){Game.admin.setExchangeConfig($('#adminExchangeForward').val(),$('#adminExchangeReverse').val(),$('#adminExchangeDailyLimit').val());instance.render();});
        $(document).on('click','#adminResetExchangeDaily',function(){Game.admin.resetExchangeDailyLimit();instance.render();});
        $(document).on('click','#adminCreateSnapshot',function(){Game.admin.createSnapshot($('#adminSnapshotLabel').val());instance.render();});
        $(document).on('click','.admin-restore-snapshot',function(){if(confirm('Restore this snapshot and reload the game?'))Game.admin.restoreSnapshot($(this).attr('data-snapshot-id'));});
        $(document).on('click','.admin-delete-snapshot',function(){Game.admin.deleteSnapshot($(this).attr('data-snapshot-id'));instance.render();});
        $(document).on('click','#adminStartTestMode',function(){if(confirm('Back up the current save and start a clean level-1 test profile?'))Game.admin.startNewPlayerTest();});
        $(document).on('click','#adminExitTestMode',function(){if(confirm('Discard the test profile and restore the primary save?'))Game.admin.exitNewPlayerTest();});
        $(document).on('click','#adminRunChecks',function(){instance.renderDiagnostics();});
        $(document).on('click','#adminCopyDebug',function(){Game.admin.copyDebugReport();instance.renderDiagnostics();});

        this.initialised=true;
        this.populateSelectors();
        this.render();
    };

    instance.populateSelectors=function(){
        var miners=[];if(Game.miners&&Game.miners.getEntriesSorted){var list=Game.miners.getEntriesSorted();for(var i=0;i<list.length;i++)miners.push('<option value="'+esc(list[i].id)+'">'+esc(list[i].definition.name)+' — '+esc(list[i].definition.rarity.name)+'</option>');}
        $('#adminMinerSelect').html(miners.join(''));
        var planets=[];for(var j=0;j<Game.planetData.order.length;j++){var id=Game.planetData.order[j],p=Game.planetData.planets[id];planets.push('<option value="'+esc(id)+'">'+esc(p.name)+'</option>');}
        $('#adminPlanetSelect').html(planets.join(''));
        this.syncMinerInputs();
    };

    instance.syncMinerInputs=function(){var entry=Game.miners.getEntry($('#adminMinerSelect').val());if(!entry)return;$('#adminMinerOwned').val(entry.owned);$('#adminMinerLevel').val(Math.max(1,entry.level||1));};

    instance.renderEconomy=function(){
        var rows=[];var resources=[['wood','Spores'],['gem','Gems'],['science','Science']];
        for(var i=0;i<resources.length;i++)rows.push(this.economyRow('resource',resources[i][0],resources[i][1],Game.resources.getResource(resources[i][0])));
        var currencies=[['mycoCoins','MycoCoins'],['bloomTokens','Bloom Tokens'],['worldBossTokens','World Boss Tokens']];
        for(var j=0;j<currencies.length;j++)rows.push(this.economyRow('currency',currencies[j][0],currencies[j][1],Game.account.getBalance(currencies[j][0])));
        $('#adminEconomyControls').html(rows.join(''));
    };

    instance.economyRow=function(type,id,label,current){return '<div class="myco-admin-economy-row" data-type="'+type+'" data-id="'+esc(id)+'"><div><strong>'+esc(label)+'</strong><small>Current: '+fmt(current)+'</small></div><input class="form-control admin-economy-value" type="number" value="1000"><button class="btn btn-default admin-economy-add">Add</button><button class="btn btn-primary admin-economy-set">Set</button></div>';};

    instance.renderSnapshots=function(){var html=[];for(var i=0;i<Game.admin.snapshots.length;i++){var s=Game.admin.snapshots[i];html.push('<div class="myco-admin-list-row"><div><strong>'+esc(s.label)+'</strong><small>'+new Date(s.at).toLocaleString()+'</small></div><div class="myco-admin-button-row"><button class="btn btn-primary admin-restore-snapshot" data-snapshot-id="'+esc(s.id)+'">Restore</button><button class="btn btn-danger admin-delete-snapshot" data-snapshot-id="'+esc(s.id)+'">Delete</button></div></div>');}$('#adminSnapshotList').html(html.join('')||'<p class="myco-small-note">No snapshots yet.</p>');};
    instance.renderDiagnostics=function(){var health=Game.admin.runHealthChecks(),html=[];for(var i=0;i<health.checks.length;i++){var c=health.checks[i];html.push('<div class="myco-admin-list-row '+(c.ok?'myco-check-pass':'myco-check-fail')+'"><div><strong>'+(c.ok?'✓ ':'✕ ')+esc(c.name)+'</strong><small>'+esc(c.detail)+'</small></div><span>'+(c.ok?'PASS':'FAIL')+'</span></div>');}$('#adminHealthSummary').text(health.passed+' / '+health.total+' checks passed'+(health.ok?' — game state looks healthy.':' — review failed checks.'));$('#adminHealthChecks').html(html.join(''));$('#adminDebugPreview').text(JSON.stringify(Game.admin.getDebugReport(),null,2));};

    instance.renderAudit=function(){var html=[];for(var i=0;i<Game.admin.audit.length;i++){var a=Game.admin.audit[i];html.push('<div class="myco-admin-list-row"><div><strong>'+esc(a.action)+'</strong><small>'+esc(a.detail)+'</small></div><time>'+new Date(a.at).toLocaleString()+'</time></div>');}$('#adminAuditLog').html(html.join('')||'<p class="myco-small-note">No admin actions recorded.</p>');};

    instance.render=function(){if(!this.initialised)return;var d=Game.admin.getDashboard();$('#adminStatLevel').text(d.level);$('#adminStatPower').text(fmt(d.power));$('#adminStatSpecies').text(d.species);$('#adminStatPlanet').text(d.activePlanet);if(Game.exchange){$('#adminExchangeForward').val(Game.exchange.config.sporesPerMycoCoin);$('#adminExchangeReverse').val(Game.exchange.config.sporesReturnedPerMycoCoin);$('#adminExchangeDailyLimit').val(Game.exchange.config.dailyMycoCoinLimit);}this.renderEconomy();this.renderSnapshots();this.renderDiagnostics();this.renderAudit();$('#adminTestModeState').text(Game.admin.isTestMode()?'Test Mode is ACTIVE — the primary save is safely backed up.':'Test Mode is inactive.');$('#adminStartTestMode').prop('disabled',Game.admin.isTestMode());$('#adminExitTestMode').prop('disabled',!Game.admin.isTestMode());if(Game.admin.unlocked){$('#adminTopTab').show();}else{$('#adminTopTab').hide();}};
    instance.update=function(delta){this.elapsed+=delta;if(this.elapsed>=1){this.elapsed=0;if(Game.admin.unlocked)this.render();}};
    return instance;
}());
