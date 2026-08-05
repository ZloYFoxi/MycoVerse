# Alpha 0.38.0 — Core Systems Visual Rebuild

- Rebuilt Laboratory, Research, Structures, Quests, Campaign and Achievements visual presentation.
- Added responsive cinematic backgrounds and unified system cards.
- Preserved gameplay logic and save compatibility.

## Alpha 0.38.0 — Cinematic Boss Chamber & Pink Forager

- Rebuilt the hidden planetary Boss Chamber as a full-screen cinematic battle.
- Added large boss art, arena backgrounds, squad cards, boss HP, timer, damage numbers, attack animations and responsive mobile layout.
- Added Pink Forager as a new Common miner with its own portrait and combat stats.

## Alpha 0.37.5 — Tab Layout & Boss Chamber Fix

- Moved Backup & Restore fully inside the Settings tab.
- Prevented local save tools from appearing below every system page.
- Added a dedicated Boss Chamber renderer with an explicit empty state.
- Rendered the active battle before and after hidden-tab activation to avoid blank chambers.
- Added a visible recovery message when a chamber rendering error occurs.

## Alpha 0.37.4 — Gate Progress Admin Fix

- Fixed Admin Panel 100% planet progress appearing to fail when opening a guardian challenge.
- Planet challenge buttons now open squad preparation instead of trying to start combat immediately.
- Added separate messages for missing progress, missing squad, and injured squad.
- Admin-set progress is normalized and marked as coming from Admin Panel.

# Alpha 0.37.3 — Planet Boss Rebalance

- Reduced every Planetary Gate Boss by 50,000 HP.
- Planetary bosses no longer attack or damage miners.
- Gate battles remain manual DPS checks with a time limit.
- The Global Mushroom Titan now counterattacks the selected raid squad every 30 seconds after the first raid strike.
- Added a persistent countdown, five-second warning state, strike history, and miner HP display to World Boss UI.
- Global Boss timing uses an absolute next-attack timestamp so the countdown recovers correctly after throttled or hidden browser tabs.

# Alpha 0.37.1 — Manual Gate Boss Combat

- Added an explicit Begin Gate Battle button and active Attack Boss button.
- Every miner now has computed strike power that increases with level, rarity, copies, mutations and health.
- Boss combat is manual: the squad damages the boss only when the player attacks, while bosses continuously damage the squad.
- Boss HP: 100,000 / 250,000 / 600,000 / 1,500,000 / 4,000,000.
- Boss attack power increased for all five guardians.
- Miner cards and team selection now display attack strength.

# Alpha 0.37.1 — Unique Boss & Planet Art Rebuild

- Replaced all five Gate Boss portraits with unique high-resolution artwork.
- Rebuilt all five planet environment images with individual world art.
- Added desktop and mobile battle-arena backgrounds for every planet.
- Planet cards now show the world environment and its guardian together.
- Gate battles now open inside the matching planetary arena.
- Added responsive image loading, asynchronous decoding, and stable aspect ratios.

# Alpha 0.36.2 — Miner Cards & Rarity UI Polish

- Unified miner cards across Miners, Miner Shop, Inventory, and Marketplace.
- Added rarity frames, compact stat blocks, resource and per-minute income labels.
- Added Mining, Injured, Healing, Available, and Locked visual states.
- Added HP progress and a below-50% production warning.
- Added responsive two-column mobile cards and wider desktop layouts.
- Added fixed image dimensions, square aspect ratios, contain scaling, lazy loading, and asynchronous decoding.

# Alpha 0.36.1 — Miner Portrait Rebuild

- Replaced all 41 legacy miner portraits with individually generated, sharp square character cards.
- Added 1024×1024 master WebP art and optimized 768×768 gameplay portraits.
- Changed miner card presentation to a true 1:1 ratio to prevent stretching and crop distortion.
- Disabled portrait zoom/filter effects and kept portraits non-interactive.
- Added miner portraits to Inventory and Marketplace cards.
- Corrected case-sensitive visual asset paths from `assets/` to `Assets/`.
- Added a fallback portrait for failed image loads.

# Alpha 0.36.0 — Final Art Batch 1

- Replaced the visual framework placeholders with production WebP artwork derived from the approved MycoVerse concept direction.
- Added 24 desktop and 24 mobile screen backgrounds covering the complete current interface.
- Added five responsive planet scenes, five gate-boss portraits, and a dedicated Golden Mushroom feature illustration.
- Added 41 production miner portraits with rarity-aware presentation for Miners and Miner Shop.
- Added mobile-specific background variants and automatic responsive switching.
- Updated all visual registries, planet themes, boss data, and event UI to use optimized WebP assets.
- Preserved the approved concept boards in assets/reference for future art consistency.

# Alpha 0.35.0 — Production Visual Asset Framework

- Added a centralized visual asset registry for screens, planets, bosses, miners, and rarity frames.
- Restored the missing planet and gate-boss artwork directories required by the current UI.
- Added 23 lightweight responsive screen backgrounds and 41 generated miner portrait placeholders.
- Added miner artwork to the Miners and Miner Shop interfaces with lazy loading and asynchronous decoding.
- Added automatic screen-theme switching whenever the active game tab changes.
- Added reduced-motion support and visual quality fallbacks for mobile devices.
- Added the approved concept images to assets/reference as art-direction references, not runtime UI textures.

# Alpha 0.34.2 — Hidden Golden Events

- Removed the permanent Golden Grove tab from normal navigation.
- Golden Hour now starts automatically at a randomized time approximately once per 24-hour cycle and lasts 40–60 minutes.
- Added a hidden Golden Mushroom hunt that spawns in a random unlocked system, remains available for 30 minutes, and sends timed hints.
- Added a secret Golden Mushroom page that can only be opened by finding the mushroom marker.
- Added persistent event timestamps, random safe marker positions, mobile support, reduced-motion behavior, and Admin controls for both events.
- Preserved compatibility with Alpha 0.34.1 saves through event-state migration.

# Alpha 0.34.1 — Wallet & Currency Exchange

- Added Spores, Gems, Science, and World Boss Tokens to the Account wallet overview.
- Added two-way conversion between Spores and MycoCoins with previews and quick amount buttons.
- Added a lower reverse exchange rate to prevent repeated exchange arbitrage.
- Added a daily MycoCoin creation limit, first-exchange Commander XP, and persistent exchange history.
- Added exchange rate and daily-limit controls to the local Admin Panel.
- Preserved compatibility with Alpha 0.34.0 saves.

# Alpha 0.34.0 — Stability, Testing & Diagnostics

- Added runtime error capture for JavaScript errors and unhandled promise rejections.
- Added an Admin health-check suite covering saves, access control, core systems, campaign, miners, and planets.
- Added a copyable Debug Report with version, level, active planet, unlocked systems, owned miners, save size, viewport, and recent errors.
- Added an isolated New Player Test mode that backs up the primary save, launches a clean level-1 profile, and restores the original save on exit.
- Added explicit validation of the Commander Level 1 access matrix.
- Preserved all Alpha 0.33.1 progression and admin functionality.

# Alpha 0.33.1 — Access Control Fix

- Added a central Game.access service as the single source of truth for Commander Level requirements.
- Blocked locked systems at Bootstrap tab events, capture-phase clicks, HUD shortcuts, hero buttons, and mobile navigation.
- Added inert locked panes so buttons and forms cannot be used even if another script makes a locked page visible.
- Added automatic redirection from locked pages to the first available Level 1 system.
- Kept Settings always available and the local Admin panel protected by its own passcode rather than Commander Level.

# Alpha 0.33.0 — Admin Panel Foundation

- Added a local passcode-protected Admin panel for managing the current browser save.
- Added controls for Spores, Gems, Science, MycoCoins, Bloom Tokens, World Boss Tokens, Commander XP, and Commander Level.
- Added miner ownership, level, and healing controls.
- Added planet unlock, progress, completion, and reset controls.
- Added Golden Hour, Golden Mushroom, daily quest, and World Boss attempt controls.
- Added local save snapshots with restore/delete actions and a persistent admin audit log.
- Kept admin credentials outside exported player saves.
- This local panel is a development tool and is not secure enough for production online economy management without server-side validation.

# Alpha 0.32.0 — Legacy Space Company Removal

- Removed the remaining Space Company gameplay layer, tabs, resources, buildings, researches, rockets, Solar System, Stargaze, Interstellar, wonders, achievements, and legacy UI modules.
- Replaced the old monolithic runtime with a compact MycoVerse-only game loop and save pipeline.
- Reduced the resource economy to Spores, Gems, and Science, while preserving migration from older saves.
- Rebuilt index.html as a clean MycoVerse application shell that loads only modern systems.
- Removed unused Space Company assets, themes, scripts, and data files.
- Preserved the modern account, miners, shop, quests, campaign, planets, bosses, health, laboratory, artifacts, guild, unions, world events, achievements, economy, and marketplace systems.

# Alpha 0.31.0 — Visual Identity & Planet Themes

- Added a unified MycoVerse visual identity using central CSS variables and planet-aware theme colors.
- Added five lightweight SVG planetary backgrounds for Myco Prime, Crystal Grove, Toxic Forest, Ancient Hive, and Void Bloom.
- The full interface now changes atmosphere automatically when the active planet changes.
- Reworked buttons, navigation tabs, cards, panels, progress bars, title screen, HUD, hero banner, and mobile navigation.
- Added visual quality, planet background, and atmospheric effect controls in Graphics Options.
- Enhanced planet cards with their own environmental artwork while preserving responsive phone and desktop layouts.
- Preserved all Alpha 0.30.0 campaign and gameplay systems.

# Alpha 0.30.0 — Story & Campaign

- Added a dedicated Campaign tab with six narrative chapters across the first act of MycoVerse.
- Added story scenes, mission objectives, persistent chapter rewards, branching chapter choices, and a journal archive.
- Connected campaign progression to existing systems including miners, planets, bosses, artifacts, research, healing, guilds, and World Boss participation.
- Added Commander Level 2 access requirement for the Campaign tab.
- Preserved save compatibility with Alpha 0.29.0 and earlier modern MycoVerse saves.

# Alpha 0.29.0 — Achievements & Collections

- Added a dedicated MycoVerse Achievements tab with 24 goals across seven categories.
- Added secret achievements, claimable rewards, Commander XP, currencies, and profile titles.
- Added a responsive Collection Book for miners, artifacts, planets, and gate bosses.
- Added combined archive completion, collection counters, and persistent claimed-state tracking.
- Integrated achievement tracking with healing, combat, economy, guild, research, expeditions, and account progression.
- Preserved compatibility with older saves and kept the legacy Space Company achievements intact.

# Alpha 0.28.0 — Responsive UI Foundation

- Added responsive phone, tablet, laptop, and desktop layout foundations.
- Added a six-button mobile bottom navigation and an All Systems drawer.
- Added Compact UI, Larger Buttons, Reduced Animations, Collapse HUD, and UI Scale settings.
- Improved card grids, forms, boss overlays, tables, title screen, and HUD behavior on narrow screens.
- Added safe-area spacing for mobile browser and system navigation bars.
- Preserved all existing game systems and save compatibility.

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
