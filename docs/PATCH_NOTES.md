# Alpha 0.11.0 — Planets & Leagues

## Planets
- Myco Prime, Crystal Grove, Toxic Forest, Ancient Hive, and Void Bloom.
- Unlock later leagues using Colony Power and Laboratory Level.
- Select one active planet at a time.

## Active bonuses
- Myco Prime: +15% Spores miner production.
- Crystal Grove: +25% Gems miner production.
- Toxic Forest: +12% all miner production.
- Ancient Hive: +25% all miner production.
- Void Bloom: +40% Science and +10% all miner production.

## Golden Mushrooms
Each planet now has its own named miner drop table. Changing the active planet immediately changes future Golden Mushroom rewards.

# Alpha 0.10.1 — Event Schedule Balance

## Golden Hour
- Cooldown: 24 hours.
- Duration: randomly selected from 40 to 60 whole minutes on activation.
- Production multiplier remains x2.5.

## Myco Prime
- Golden Mushroom maturation interval: 12 hours.

## Save migration
Alpha 0.10.0 event saves are migrated to the new schedule. Old short testing timers are reset once when loading this patch.

# Alpha 0.10.0 — Golden Grove

## Golden Mushroom
- The first mushroom becomes available shortly after a new game begins.
- Later mushrooms mature every 15 minutes.
- Each mushroom awards one miner specimen.
- Drops use the Myco Prime rarity table: Common 70%, Rare 20%, Epic 7%, Legendary 2.5%, Mythic 0.5%.

## Golden Hour
- The first charge becomes ready after five minutes.
- Activating it grants x2.5 production to all fungal miners for five minutes.
- The event recharges over one hour.
- Active status appears in a global banner.

## Save compatibility
Event state uses its own versioned save block. Older saves receive fresh event timers without losing existing progress.

# Patch Notes

## Alpha 0.9.0 — Laboratory & Miner Fusion

The colony can now cultivate duplicate specimens, fuse three matching specimens into a stronger species level, and spend fusion-produced DNA on permanent mutations. Laboratory research progress raises the laboratory level and unlocks up to three mutation slots per species. Existing saves remain compatible.


## Alpha 0.8.0 — Colony & Miner UI

### New
- Colony dashboard with live colony statistics.
- Passive traits for every miner species.
- Resource and global production bonuses.
- Level progress bars and clearer miner cards.

### Compatibility
- Alpha 0.6 and 0.7 miner saves continue to load.
- Internal resource ID `wood` still represents Spores.

### Test checklist
1. Open Colony and confirm the starting Spore Worker appears in colony totals.
2. Compare Spores production before and after evolving Spore Worker.
3. Awaken Glow Forager and confirm the Spores passive bonus increases.
4. Awaken Elder Mycelium and confirm the global bonus appears.
5. Save, reload, and confirm colony statistics remain intact.
