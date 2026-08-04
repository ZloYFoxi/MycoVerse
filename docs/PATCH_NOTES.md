## Alpha 0.36.2 — Miner Cards & Rarity UI Polish

Miner presentation is now consistent across the roster, shop, inventory, and marketplace. Cards clearly show rarity, status, level, ownership, resource, income per minute, and health. Injured miners receive a visible warning when their production is reduced below half health.

## Alpha 0.36.1 — Miner Portrait Rebuild

All 41 miners now use individual high-detail portraits rather than blurry crops or shared placeholders. Portraits remain static and do not open when clicked. The same artwork is used consistently in Miners, Miner Shop, Inventory, and Marketplace.

## Alpha 0.36.0 — Final Art Batch 1

The first production artwork wave replaces the placeholder visual pack with optimized WebP screen backgrounds, mobile variants, miner portraits, planetary scenes, gate-boss portraits, and a dedicated Golden Mushroom illustration. The runtime now switches between desktop and mobile art while retaining the approved concept boards as the visual reference for later batches.

## Alpha 0.35.0 — Production Visual Asset Framework

This patch begins the direct production conversion toward the approved MycoVerse concept art. The game now has a centralized registry for all visual assets, per-screen environmental backgrounds, restored planet and boss artwork, and generated portrait slots for every current miner. Future final illustrations can replace these files without rewriting gameplay or UI modules.

## Alpha 0.34.2 — Hidden Golden Events

Golden Grove is no longer a permanent game tab. Golden Hour starts automatically at a random time roughly once per day and lasts 40–60 minutes. Golden Mushrooms now appear as hidden discoveries in random unlocked systems: players receive a notification, search the interface for a glowing mushroom marker, then enter a temporary secret page to open the reward. The event persists across reloads, expires after 30 minutes, and provides timed hints.

## Alpha 0.34.1 — Wallet & Currency Exchange

The Account page now displays the complete local wallet and resource balance. Players can exchange Spores for MycoCoins or convert MycoCoins back into Spores using a deliberately lower return rate, a daily creation limit, transaction previews, quick amount controls, and persistent exchange history. Local administrators can tune both rates and reset the daily limit.

## Alpha 0.34.0 — Stability, Testing & Diagnostics

The Admin Panel now includes a health-check dashboard, a copyable debug report, captured runtime errors, and an isolated New Player Test mode. The test mode temporarily backs up the primary browser save, starts a clean level-1 profile, and restores the original profile when testing ends.

## Alpha 0.33.1 — Access Control Fix

Commander Level restrictions are now enforced by one central access service. Locked tabs cannot be opened through Bootstrap, title-screen shortcuts, the top HUD, mobile navigation, URL hashes, or accidental programmatic tab calls. Locked page content is inert, and the game automatically returns the player to an available Level 1 system if a restricted page is active.

## Alpha 0.33.0 — Admin Panel Foundation

A local development admin panel now provides passcode-gated controls for player balances, Commander progression, miners, planets, events, quests, and snapshots. The panel is designed for balancing and testing the browser build. Because the game is still client-side, this is not a secure production moderation system; real online administration must be executed and validated by a backend.

## Alpha 0.32.0 — Legacy Space Company Removal

The game now runs on a clean MycoVerse-only application shell. Legacy Space Company mechanics and UI no longer load. The remaining compatibility layer contains only the three modern resources—Spores, Gems, and Science—plus save migration for existing players.

## Alpha 0.31.0 — Visual Identity & Planet Themes

MycoVerse now has a unified visual language. Every active planet applies its own background, accent colors, glow effects, and atmosphere to the full game interface. Buttons, cards, navigation, progress bars, the title screen, planet cards, and responsive mobile navigation have been restyled without changing the campaign or economy logic.

## Alpha 0.30.0 — Story & Campaign

MycoVerse now includes a dedicated narrative Campaign tab. The first act contains six persistent chapters with story scenes, connected mission goals, branching choices, chapter rewards, and a campaign journal. Progress is tied to the systems already built in the game: colony growth, planetary completion, boss victories, healing, artifacts, guilds, research, and World Boss activity.

## Alpha 0.29.0 — Achievements & Collections

The colony now records its modern MycoVerse history in a dedicated archive. Complete categorized and secret achievements, claim profile rewards, and fill a responsive collection book containing miners, artifacts, planets, and defeated gate bosses.

## Alpha 0.28.0 — Responsive UI Foundation

MycoVerse now adapts its layout across phones, tablets, laptops, and desktop monitors. Mobile players receive a bottom navigation bar and system drawer, while new accessibility and density controls allow the interface to be tailored without changing game progression.

## Alpha 0.27.0 — Guild Foundation

Players can now found a persistent local guild, contribute resources, earn Guild XP and Contribution Points, unlock shared research, complete guild quests, and purchase exclusive rewards. Guild bonuses strengthen production, medicine, expeditions, World Boss raids, and trade. The current guild is a local prototype prepared for future backend synchronization.

## Alpha 0.26.0 — Planet Progression, Gate Bosses & Miner Health

Planets now advance from 0% to 100% through colony activity. At 100%, the player challenges the current planet guardian to open the next passage. Miners have persistent health, suffer battle injuries, lose production below half health, and can be treated in the Laboratory Medical Chamber.


## Alpha 0.25.0 — World Boss Prototype

The Mushroom Titan now appears in a repeating global raid simulation. Players receive three attacks per UTC day, contribute damage with their Planet Boss squad, rise through Bronze to Mythic ranks, and claim World Boss Tokens, MycoCoins, XP, and exclusive rewards.

## Alpha 0.24.0 — Miner Progression & Per-Minute Economy

Miner production is now displayed per minute. The Miner Shop contains 35 progression miners split into five rarity sections, with one new miner unlocking at almost every Commander Level. New commanders may claim one free Spore Worker, while later copies are purchased normally. Autosaves now happen silently without a timer or notification.

## Alpha 0.23.0 — Miner Shop, Owned Miners & Commander XP

The Miners screen now shows only active owned miners. Undiscovered miners have moved into a dedicated Miner Shop. Commander progression now uses explicit XP earned across purchases, quests, expeditions, upgrades, fusion, bosses, discoveries, research, and daily activity. Early access starts with Account, Inventory, Miner Shop, Miners, and Quests at level 1.

## Alpha 0.22.0 — Economy Rebalance & ROI

The new Economy Center converts every miner output into a shared Spore Equivalent value. This makes upgrade payback comparable across Spores, Gems, Science, and later resources. Marketplace prices now use the same fair-value model, while all upgrades and trades are recorded in a persistent economy history.

## Alpha 0.21.0 — Miner Unions

Players can now create three named miner unions, assign up to five species and specialised roles, develop synergies, level the active formation, and invest talent points into production, boss combat, or expedition speed.

## Alpha 0.20.0 — Planet Bosses

Each planetary league is now guarded by a unique boss. Assemble a squad of up to five miner species and defeat the guardian before the battle timer expires. Victories unlock the next league and grant exclusive organisms, relics, profile titles, and account currency. Battles use real timestamps and continue while the game is closed.

## Alpha 0.19.0 — Profile Expansion, Inventory & Backend Foundation

Commander profiles now gain levels from real colony progress, support avatars and unlockable titles, and can create portable profile snapshots. A new Inventory Hub unifies miners and artifacts. The game also has a dedicated backend service boundary so future authentication and cloud sync can be added without rewriting the gameplay modules.

## Alpha 0.18.0 — Visual Overhaul, Account & Marketplace

MycoVerse now has a dedicated front-end layer: a new title screen, a living fungal background, a profile HUD, a local account with wallet balances and daily rewards, plus a marketplace prototype for buying miners or artifacts and selling duplicate specimens.

## Alpha 0.17.0 — Mycelial Seasons

The planetary ecosystem now rotates through four six-hour seasons. Each season changes production or discovery, while one player-selected ritual can add a second temporary specialization until the next cycle.

# Alpha 0.14.0 — Mycelium Research

The colony now converts its power into Insight over time. Spend Insight on a connected research tree and choose one permanent specialization after completing three nodes.

# Alpha 0.13.0 — Artifacts & Relics

Expeditions now have a planet-specific chance to return with an artifact. Equip one Core, one Crown, and one Charm to strengthen the colony. Artifact progress is saved automatically.

## Alpha 0.15.0 — Ascension & Legacy
The colony can now undergo Mycelial Ascension after reaching the required Colony Power, planets, and research. Ascension resets the modern MycoVerse progression layer and awards permanent Legacy. Legacy may be invested into global production, Spores, Gems, Science, and Insight generation.


## Alpha 0.16.0 — Living Structures
The colony can now grow six specialized fungal structures. Each structure has its own level cap, escalating costs, progression requirements, and permanent bonus for the current Ascension cycle. Structures strengthen Spores, Gems, Science, Insight, or all miner production and are reset during Mycelial Ascension.
