Game.campaignData = (function () {
    'use strict';

    return {
        order: ['firstSpore', 'rootsPrime', 'crystalSignal', 'blightAwakening', 'memoryHive', 'voiceBeyondVoid'],
        chapters: {
            firstSpore: {
                id: 'firstSpore',
                act: 'Act I',
                name: 'The First Spore',
                subtitle: 'A colony awakens beneath the stars.',
                description: 'A dormant fungal seed begins to stir. Gather the first workers, listen to the whispering grove, and establish the first heartbeat of MycoVerse.',
                unlock: { commanderLevel: 1 },
                scenes: [
                    { speaker: 'Narrator', text: 'Far beyond familiar constellations, a single glowing spore opens its eyes.' },
                    { speaker: 'Myco Prime', text: 'Feed the soil, and I will answer with life.' },
                    { speaker: 'Commander', text: 'Then let this tiny circle of roots become a colony.' }
                ],
                missions: [
                    { id: 'fsp_species', type: 'species', target: 1, label: 'Own at least 1 miner species' },
                    { id: 'fsp_miners', type: 'minersPurchased', target: 1, label: 'Purchase your first miner' },
                    { id: 'fsp_quests', type: 'questsClaimed', target: 1, label: 'Claim 1 quest reward' }
                ],
                rewards: { xp: 120, mycoCoins: 250, bloomTokens: 2 },
                choices: [
                    { id: 'nurture', title: 'Nurture the Colony', description: 'Focus on stability and growth.', reward: { xp: 40, mycoCoins: 120 } },
                    { id: 'harvest', title: 'Harvest the Wild Spores', description: 'Take a faster but harsher start.', reward: { xp: 25, mycoCoins: 180 } }
                ]
            },
            rootsPrime: {
                id: 'rootsPrime',
                act: 'Act I',
                name: 'Roots of Myco Prime',
                subtitle: 'The first guardian stands between root and sky.',
                description: 'Myco Prime begins to reveal its true nature. To open the route forward, the colony must master the planet and overcome Mother Mushroom.',
                unlock: { previous: 'firstSpore' },
                scenes: [
                    { speaker: 'Lumina Cap', text: 'The roots below us are not passive. They remember every footprint.' },
                    { speaker: 'Mother Mushroom', text: 'Prove your right to grow, and the passage shall bloom.' },
                    { speaker: 'Commander', text: 'Then we will learn, endure, and challenge the gate.' }
                ],
                missions: [
                    { id: 'rpm_power', type: 'colonyPower', target: 120, label: 'Reach 120 Colony Power' },
                    { id: 'rpm_progress', type: 'planetProgress', planetId: 'mycoPrime', target: 100, label: 'Reach 100% progress on Myco Prime' },
                    { id: 'rpm_boss', type: 'planetCompleted', planetId: 'mycoPrime', target: 1, label: 'Defeat Mother Mushroom and complete Myco Prime' }
                ],
                rewards: { xp: 180, mycoCoins: 420, bloomTokens: 3, title: 'Warden of Prime' },
                choices: [
                    { id: 'fortify', title: 'Fortify the Outpost', description: 'Turn the first victory into a safe stronghold.', reward: { xp: 55, mycoCoins: 150 } },
                    { id: 'expand', title: 'Expand the Frontier', description: 'Push deeper into the new routes immediately.', reward: { xp: 45, bloomTokens: 2 } }
                ]
            },
            crystalSignal: {
                id: 'crystalSignal',
                act: 'Act I',
                name: 'The Crystal Signal',
                subtitle: 'A chorus of light echoes through the grove.',
                description: 'Crystalline songs drift across the void. Crystal Grove answers with beauty, danger, and secrets locked inside relic glass.',
                unlock: { previous: 'rootsPrime', planetUnlocked: 'crystalGrove' },
                scenes: [
                    { speaker: 'Prism Scout', text: 'The crystals are resonating. This is not geology — it is memory.' },
                    { speaker: 'Commander', text: 'Then we listen carefully and break only what we must.' },
                    { speaker: 'Crystal Titan', text: 'Only the focused may pass my lattice.' }
                ],
                missions: [
                    { id: 'csg_species', type: 'species', target: 5, label: 'Own at least 5 miner species' },
                    { id: 'csg_artifacts', type: 'artifacts', target: 2, label: 'Discover 2 artifacts' },
                    { id: 'csg_complete', type: 'planetCompleted', planetId: 'crystalGrove', target: 1, label: 'Complete Crystal Grove' }
                ],
                rewards: { xp: 260, mycoCoins: 650, bloomTokens: 4 },
                choices: [
                    { id: 'study', title: 'Study the Lattice', description: 'Research the crystal network for knowledge.', reward: { xp: 80, worldBossTokens: 1 } },
                    { id: 'channel', title: 'Channel the Signal', description: 'Refine crystal energy into trade value.', reward: { xp: 50, mycoCoins: 260 } }
                ]
            },
            blightAwakening: {
                id: 'blightAwakening',
                act: 'Act I',
                name: 'Blight Awakening',
                subtitle: 'The forest rots, but it does not die quietly.',
                description: 'Toxic Forest is alive with mutation and hunger. Surviving the blight will demand adaptation, medicine, and ruthless resolve.',
                unlock: { previous: 'crystalSignal', planetUnlocked: 'toxicForest' },
                scenes: [
                    { speaker: 'Rootwarden', text: 'This place fights back through the air itself.' },
                    { speaker: 'Laboratory AI', text: 'Injury rates rising. Triage protocols recommended.' },
                    { speaker: 'Blight Sovereign', text: 'Heal if you can. I will poison what remains.' }
                ],
                missions: [
                    { id: 'bla_research', type: 'research', target: 5, label: 'Purchase 5 Mycelium Research upgrades' },
                    { id: 'bla_heal', type: 'healthRestored', target: 1200, label: 'Restore 1,200 total miner HP' },
                    { id: 'bla_complete', type: 'planetCompleted', planetId: 'toxicForest', target: 1, label: 'Complete Toxic Forest' }
                ],
                rewards: { xp: 340, mycoCoins: 850, bloomTokens: 5 },
                choices: [
                    { id: 'purge', title: 'Purge the Infection', description: 'Burn away the blight and secure the route.', reward: { xp: 85, mycoCoins: 220 } },
                    { id: 'adapt', title: 'Adapt to the Blight', description: 'Turn mutation into strength.', reward: { xp: 65, bloomTokens: 3 } }
                ]
            },
            memoryHive: {
                id: 'memoryHive',
                act: 'Act I',
                name: 'Memory of the Hive',
                subtitle: 'Ancient roots remember what the stars forgot.',
                description: 'Deep within the Ancient Hive lies a vast fungal archive. Guilds, unions, and relics intertwine with the memory of an older civilization.',
                unlock: { previous: 'blightAwakening', planetUnlocked: 'ancientHive' },
                scenes: [
                    { speaker: 'Archivist Echo', text: 'Your colony is no longer alone. Every strand now touches a history older than your empire.' },
                    { speaker: 'Commander', text: 'Then we must build not only power, but continuity.' },
                    { speaker: 'Ancient Overmind', text: 'Unite your network or be buried beneath mine.' }
                ],
                missions: [
                    { id: 'moh_guild', type: 'guildCreated', target: 1, label: 'Found or join your Guild foundation' },
                    { id: 'moh_contrib', type: 'guildContribution', target: 250, label: 'Earn 250 Contribution Points' },
                    { id: 'moh_complete', type: 'planetCompleted', planetId: 'ancientHive', target: 1, label: 'Complete Ancient Hive' }
                ],
                rewards: { xp: 450, mycoCoins: 1100, bloomTokens: 6, title: 'Archivist of the Hive' },
                choices: [
                    { id: 'unite', title: 'Unite the Network', description: 'Strengthen the whole mycelial alliance.', reward: { xp: 90, worldBossTokens: 2 } },
                    { id: 'preserve', title: 'Preserve the Archive', description: 'Secure ancient knowledge before all else.', reward: { xp: 75, mycoCoins: 320 } }
                ]
            },
            voiceBeyondVoid: {
                id: 'voiceBeyondVoid',
                act: 'Act I',
                name: 'Voice Beyond the Void',
                subtitle: 'At the edge of bloom, something answers back.',
                description: 'Void Bloom tears open the final veil of the first act. To stand against the darkness, the colony must combine its strength, history, and cosmic ambition.',
                unlock: { previous: 'memoryHive', planetUnlocked: 'voidBloom' },
                scenes: [
                    { speaker: 'Void Bloom', text: 'I have heard your footsteps in every world.' },
                    { speaker: 'Commander', text: 'Then hear this: the colony does not retreat.' },
                    { speaker: 'Unknown Voice', text: 'Defeat the Devourer, and the next age begins.' }
                ],
                missions: [
                    { id: 'vbv_worldboss', type: 'worldBossAttacks', target: 3, label: 'Launch 3 World Boss attacks' },
                    { id: 'vbv_artifacts', type: 'artifacts', target: 5, label: 'Collect 5 artifacts' },
                    { id: 'vbv_complete', type: 'planetCompleted', planetId: 'voidBloom', target: 1, label: 'Complete Void Bloom' }
                ],
                rewards: { xp: 700, mycoCoins: 1800, bloomTokens: 8, worldBossTokens: 3, title: 'Voice Beyond the Void' },
                choices: [
                    { id: 'transcend', title: 'Transcend the Cycle', description: 'Accept the call of a greater network.', reward: { xp: 120, bloomTokens: 4 } },
                    { id: 'return', title: 'Return as Guardian', description: 'Use the victory to protect every earlier planet.', reward: { xp: 100, mycoCoins: 450 } }
                ]
            }
        }
    };
}());
