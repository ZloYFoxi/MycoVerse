# Alpha 0.27.0 — Guild Foundation

- Added a local Guild system with name, emblem, description, Guild ID, members, levels, and persistent Guild XP.
- Added donations of Spores, Science, DNA, MycoCoins, and World Boss Tokens.
- Added Contribution Points and Commander XP rewards for guild activity.
- Added five shared research branches affecting production, healing, World Boss damage, expeditions, and marketplace costs.
- Added five Guild Quests tied to donations, expeditions, and World Boss participation.
- Added a Guild Shop with consumables, currency bundles, an exclusive miner, and an exclusive artifact.
- Added Commander Level 12 access for the Guild tab.
- Integrated Guild bonuses into miner production, Laboratory treatment costs, expedition duration, World Boss damage, and Marketplace fees.
- Preserved Guild progress through Ascension and repaired unresolved Alpha 0.26 merge markers from the uploaded project.

# Alpha 0.26.0 — Planet Progression, Gate Bosses & Miner Health

- Removed the standalone Planet Bosses tab and integrated guardians directly into planetary progression.
- Added 0–100% progress for every planet, earned through mining, quests, expeditions, research, and structures.
- Added gate battles that begin only after the current planet reaches 100% progress.
- Added persistent health for every owned miner species and total squad HP during battles.
- Bosses now damage miners; incapacitated miners stop attacking and producing resources.
- Injured miners below 50% HP produce at 75%, while critically injured miners below 25% produce at 40%.
- Added a Medical Chamber to the Laboratory with 25%, full, and heal-all treatments using Spores, Science, and DNA.
- Added slow free health regeneration outside battle.
- Added five integrated SVG guardian portraits and semantic progress bars for planet, boss, and team health.
- Preserved World Boss as a separate global raid system and migrated older boss victories into completed planet progress.


# Alpha 0.25.0 — World Boss Prototype

- Added the global Mushroom Titan raid prototype.
- Added a deterministic 48-hour active event followed by a 24-hour recovery period.
- Added three daily raid attempts, personal damage, simulated community damage, and four reward ranks.
- Added World Boss Tokens, Commander XP rewards, exclusive Titan Herald miner, and Titan Heart artifact.
- Reused the Planet Boss squad for raid damage and persisted event progress across browser sessions.
- Added a dedicated World Boss interface and Commander Level 22 access requirement.

# Alpha 0.24.0 — Miner Progression & Per-Minute Economy

- Changed miner production presentation to resources per minute while keeping smooth real-time accumulation.
- Expanded the Miner Shop to 35 purchasable miners: seven per rarity.
- Added level-based miner unlocks from Commander Level 1 through 34.
- Added a one-time free Spore Worker claim; later copies cost MycoCoins.
- Added repeat purchases and reduced XP rewards for duplicate miners.
- Grouped shop inventory by Common, Rare, Epic, Legendary, and Mythic strength tiers.
- Removed the autosave countdown and suppressed autosave notifications while preserving silent automatic saving.

# Alpha 0.23.0 — Miner Shop, Owned Miners & Commander XP

- Miners tab now displays only miners owned by the player and available for production.
- Added a dedicated Miner Shop for purchasing undiscovered non-boss miners with MycoCoins.
- Added rarity-based Commander XP rewards for miner purchases: Common 50, Rare 90, Epic 170, Legendary 320, Mythic 550.
- Reworked Commander Level to use explicit persistent XP with migration from older profile scores.
- Made Account, Inventory, Miner Shop, Miners, and Quests available at Commander Level 1.
- Added staged profile-level access for later systems.
- Expanded story quests from 6 to 12 and daily quests from 3 to 6.
- Added XP rewards for quests, expeditions, upgrades, fusion, bosses, planets, research, artifacts, Golden Mushrooms, and daily rewards.
- Preserved compatibility with Alpha 0.6–0.22 saves.

# Alpha 0.22.0 — Economy Rebalance & ROI

- Added a dedicated Economy tab with production, market, investment, and transaction metrics.
- Added Spore Equivalent valuation for comparing miners that produce different resources.
- Added live ROI and payback analysis for every available miner upgrade.
- Added a best-next-upgrade recommendation and economy health score.
- Rebalanced miner upgrade growth from 18% to 16% and clone growth from 35% to 30%.
- Repriced Marketplace miners and artifacts from their actual output and bonuses.
- Increased duplicate sale returns to a consistent fair-value model.
- Added persistent economy history, market volume, and hourly index snapshots.
- Preserved compatibility with Alpha 0.6–0.21 saves.

# Alpha 0.21.0 — Miner Unions

- Added three saved miner unions with one active formation.
- Added Leader, Worker, Support, and Researcher roles.
- Added resource, rarity, planet, and full-team synergies.
- Added union levels, experience, talent points, and three permanent talent paths.
- Integrated union bonuses with miner production, boss combat, and expedition duration.
- Added Ascension-safe union resets while preserving purchased talents.

# Alpha 0.20.0 — Planet Bosses

- Added five planetary guardians, one for every MycoVerse league.
- Added combat squads of up to five discovered miner species.
- Added real-time boss battles with health, defense, phase changes, and strict time limits.
- Boss battles continue while the game is closed.
- Defeating a guardian unlocks the next planet and grants exclusive miners, artifacts, titles, MycoCoins, and Bloom Tokens.
- Added five boss-exclusive miners and five boss-exclusive artifacts.
- Planet progression now recognizes the previous guardian as an unlock requirement.
- Added a complete Boss Arena interface and save compatibility with Alpha 0.6–0.19.

# Alpha 0.19.0 — Profile Expansion, Inventory & Backend Foundation

- Added Commander levels derived from colony progress, collection strength, and earned currency.
- Added selectable avatars and milestone-unlocked profile titles.
- Added a unified Inventory Hub for miners and artifacts with filters and a collection score.
- Added a backend-ready service abstraction with operation queue, local snapshots, and future cloud-sync boundaries.
- Expanded the title screen and HUD with direct Inventory access.
- Preserved save compatibility with Alpha 0.6–0.18.

# Alpha 0.18.0 — Visual Overhaul, Account & Marketplace

- Reworked the presentation layer with a new fungal background, top command HUD, and cinematic title screen.
- Added a local Account system with editable commander name, profile summary, wallet balances, and a 24-hour daily reward.
- Added a Marketplace prototype with rotating local offers for miners and artifacts, plus selling duplicate miners for MycoCoins.
- Added a quick-access hero banner linking the front-end economy and current world state.
- Preserved save compatibility with Alpha 0.6–0.17.

# Alpha 0.17.0 — Mycelial Seasons

- Added a deterministic four-season planetary cycle that changes every six hours.
- Added Bloomtide, Prism Rain, Oracle Night, and Deep Root production bonuses.
- Added seasonal rituals that last until the active season ends.
- Integrated seasonal bonuses with miner income, Insight generation, fusion DNA, expeditions, and artifact discovery.
- Added a complete Seasons interface with countdowns, active bonuses, ritual selection, and cycle calendar.
- Added save compatibility and Ascension-safe ritual resets.

# MycoVerse Alpha 0.14.0 — Mycelium Research

- Added Mycelium Research tab and passive Insight generation.
- Added seven permanent research nodes with prerequisites.
- Added three permanent colony specializations.
- Research bonuses now affect miner production.
- Added save/load support and compatibility with older saves.

# MycoVerse Alpha 0.13.0 — Artifacts & Relics

- Added 10 collectible artifacts across five planets.
- Added Core, Crown, and Charm equipment slots.
- Expeditions can now recover planet-specific relics.
- Equipped artifacts grant permanent miner production bonuses.
- Added artifact inventory, history, save/load support, and dedicated UI.
- Preserved compatibility with Alpha 0.6–0.12 saves.

## Alpha 0.15.0 — Ascension & Legacy
- Added Mycelial Ascension as the first prestige layer.
- Added permanent Legacy currency and five upgrade paths.
- Added ascension requirements based on Colony Power, planets, and research.
- Added permanent production and Insight bonuses that survive rebirth.
- Added a safe reset of MycoVerse systems while preserving the legacy engine and old saves.
- Added a dedicated Ascension interface and confirmation flow.


## Alpha 0.16.0 — Living Structures
- Added a dedicated Structures tab with six growable fungal buildings.
- Added structure levels, escalating multi-currency costs, caps, and progression requirements.
- Added permanent-per-cycle bonuses to Spores, Gems, Science, Insight, and all miner production.
- Added Colony Power, planet, laboratory, research, and Ascension requirements.
- Integrated structure bonuses into miner income and Insight generation.
- Added full save/load support and Ascension reset compatibility.
- Preserved compatibility with saves from Alpha 0.6–0.15.
