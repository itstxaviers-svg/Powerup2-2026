# POWER UP 2 — CODEX INSTRUCTION
## Replace Unit 2 Code Fighter opponents with Lady Gearveil + Chronofang

MODEL TO USE: GPT-5.6 Sol

Continue working in the CURRENT project:

`/Users/sophie/Downloads/Power up 2`

Treat the current filesystem state as the source of truth.

This is a focused Code Fighter opponent-asset migration for **Unit 2 only**.

Do not redesign Code Fighter.
Do not change Unit 1 opponents.
Do not change timers, vocabulary, progression, Weak Word logic, city logic, rewards, player avatars, or any other game.

---

# 1. GOAL

Unit 2 / Clockwork City must use two new opponents:

1. **Lady Gearveil** — humanoid rival-type opponent
2. **Chronofang** — beast / boss-type opponent

Use the new standalone PNG action assets that are already prepared.

Unit 1 must keep its existing opponents and behavior exactly as it is now.

---

# 2. ROLE MAPPING

Map the new Unit 2 opponents onto the existing Code Fighter opponent roles.

## Unit 2 rival role

Use:

`Lady Gearveil`

Behavior role:

same role currently used by Rival Kael.

Therefore:
- normal answer time = 7 seconds
- final super/ultimate challenge = 7 seconds
- preserve the existing rival choreography and logic
- only replace the opponent identity/art for Unit 2

## Unit 2 boss role

Use:

`Chronofang`

Behavior role:

same role currently used by Corrupted Construct / Boss.

Therefore:
- normal answer time = 7 seconds
- final Boss Super/Ultimate challenge = 5 seconds
- preserve the existing boss choreography and logic
- only replace the opponent identity/art for Unit 2

Do NOT modify the timing engine.
Use the existing role-driven timing behavior.

---

# 3. UNIT-SPECIFIC OPPONENT RESOLUTION

Opponent resolution must become Unit-aware.

Expected behavior:

## Unit 1

Keep current opponents unchanged:

- Rival role → current Unit 1 rival / Kael
- Boss role → current Unit 1 Corrupted Construct

## Unit 2

Use:

- Rival role → Lady Gearveil
- Boss role → Chronofang

Do not globally replace Kael or Construct.

Do not cause Unit 1 to suddenly render Unit 2 opponents.

Prefer a centralized resolver such as conceptually:

```ts
resolveOpponentForUnit(unitId, opponentRole)
```

or extend the existing opponent registry/resolver cleanly.

Do not scatter `if (unitId === 2)` conditions throughout JSX.

---

# 4. LADY GEARVEIL ASSET ROOT

Use the existing prepared folder:

`Assets/05-games/code-fighter/opponents/unit-02-lady-gearveil/`

Preserve the exact real project asset-root casing/path if it differs slightly.

Expected files:

```text
unit-02-gearveil-base.png
unit-02-gearveil-idle.png
unit-02-gearveil-quick-attack.png
unit-02-gearveil-heavy-attack.png
unit-02-gearveil-block.png
unit-02-gearveil-counter.png
unit-02-gearveil-hit.png
unit-02-gearveil-ultimate.png
unit-02-gearveil-victory.png
unit-02-gearveil-defeat.png
```

Runtime semantic mapping:

```text
idle        -> unit-02-gearveil-idle.png
quickAttack -> unit-02-gearveil-quick-attack.png
heavyAttack -> unit-02-gearveil-heavy-attack.png
block       -> unit-02-gearveil-block.png
counter     -> unit-02-gearveil-counter.png
hit         -> unit-02-gearveil-hit.png
ultimate    -> unit-02-gearveil-ultimate.png
victory     -> unit-02-gearveil-victory.png
defeat      -> unit-02-gearveil-defeat.png
```

`base` is reference/anchor art and does not need to be used as a runtime combat state unless the current registry explicitly requires one.

---

# 5. IMPORTANT — MIRROR LADY GEARVEIL

All Lady Gearveil artwork currently faces the WRONG direction for the enemy side.

The enemy stands on the RIGHT side of the arena and must face LEFT toward the player.

Therefore:

**Mirror Lady Gearveil horizontally in EVERY runtime state.**

This includes:

- idle
- quickAttack
- heavyAttack
- block
- counter
- hit
- ultimate
- victory
- defeat
- result-screen art

Do NOT mirror Chronofang.

Do NOT globally mirror all enemies.

Do NOT mirror the arena, UI, particles, text, HUD, health bar, or projectile direction.

Only mirror the Lady Gearveil character art.

---

# 6. MIRROR IMPLEMENTATION — CENTRALIZED

Implement mirroring as opponent presentation metadata.

Preferred concept:

```ts
{
  id: 'lady-gearveil',
  mirrorX: true,
  ...
}
```

Chronofang:

```ts
{
  id: 'chronofang',
  mirrorX: false,
  ...
}
```

Kael / Construct must retain their current orientation behavior.

IMPORTANT:
Do not put `transform: scaleX(-1)` on the entire fighter container if that container also performs lunges/translations/scaling.

Use separate layers:

```text
fighter motion wrapper
    ↓
character image layer
```

Apply horizontal mirroring only to the INNER image/art layer.

Example concept:

```css
.fighter-art[data-mirror='true'] {
  transform: scaleX(-1);
}
```

The outer wrapper must continue to control:
- x/y positioning
- scale
- attack movement
- recoil
- arena anchoring

This prevents mirroring from breaking combat animation transforms.

If the existing renderer already supports per-fighter mirroring metadata, reuse it rather than adding another system.

---

# 7. CHRONOFANG ASSET ROOT

Use the existing prepared folder:

`Assets/05-games/code-fighter/opponents/unit-02-chronofang/`

Expected files:

```text
unit-02-chronofang-base.png
unit-02-chronofang-idle.png
unit-02-chronofang-quick-attack.png
unit-02-chronofang-heavy-attack.png
unit-02-chronofang-block.png
unit-02-chronofang-counter.png
unit-02-chronofang-hit.png
unit-02-chronofang-ultimate.png
unit-02-chronofang-victory.png
unit-02-chronofang-defeat.png
```

Runtime mapping:

```text
idle        -> unit-02-chronofang-idle.png
quickAttack -> unit-02-chronofang-quick-attack.png
heavyAttack -> unit-02-chronofang-heavy-attack.png
block       -> unit-02-chronofang-block.png
counter     -> unit-02-chronofang-counter.png
hit         -> unit-02-chronofang-hit.png
ultimate    -> unit-02-chronofang-ultimate.png
victory     -> unit-02-chronofang-victory.png
defeat      -> unit-02-chronofang-defeat.png
```

Chronofang already faces LEFT.

Do not mirror it.

---

# 8. SPECIAL ENEMY ULTIMATE / RESULT RULE

Preserve the current approved Code Fighter semantic rule for enemy ultimate artwork.

For Unit 2, apply the same rule to the new opponents.

## During normal combat

Do NOT use the reserved `ultimate.png` as the ordinary in-battle enemy super frame if the existing Kael/Construct implementation reserves ultimate art for the enemy-victory result.

Instead:

- enemy final super attack uses existing heavy-attack pose + existing ultimate/super FX
- player receives hit/defeat
- enemy may show normal `victory` briefly in the arena
- result screen loads
- after the existing short delay (currently around 500 ms), reveal the reserved enemy `ultimate.png` result art

Thus:

Lady Gearveil enemy victory result:
`unit-02-gearveil-ultimate.png`

Chronofang enemy victory result:
`unit-02-chronofang-ultimate.png`

Do NOT change the existing Kael/Construct special-result behavior.

If the current opponent registry already represents this distinction as `combatUltimate` vs `victoryResultArt`, extend that architecture instead of hardcoding filenames.

---

# 9. RESULT SCREEN

## If PLAYER wins against Lady Gearveil

Show:
- selected player avatar `victory`
- Lady Gearveil `defeat`

Lady Gearveil defeat art must also be mirrored so she faces correctly in the composition.

## If PLAYER wins against Chronofang

Show:
- selected player avatar `victory`
- Chronofang `defeat`

Do not mirror Chronofang.

## If PLAYER loses against Lady Gearveil

Arena:
- player hit/defeat
- Lady Gearveil normal `victory` pose briefly

Result screen:
- player defeat art
- after existing delay, show Lady Gearveil reserved `ultimate` result art
- Lady Gearveil art remains horizontally mirrored

## If PLAYER loses against Chronofang

Arena:
- player hit/defeat
- Chronofang normal `victory` pose briefly

Result screen:
- player defeat art
- after existing delay, show Chronofang reserved `ultimate` result art

---

# 10. VISUAL ANCHORS

The new opponents have very different silhouettes.

Do not align them using raw transparent PNG bounds.

Use/extend the existing centralized opponent visual-anchor system.

Support centralized metadata such as:

```text
scale
x
feetY
offsetX
offsetY
mirrorX
```

or the current project equivalent.

## Lady Gearveil

Calibrate visible feet to the arena floor.

Audit:
- idle
- quickAttack
- heavyAttack
- block
- counter
- hit
- victory
- defeat
- reserved result ultimate art

Her feet should return to the same resting baseline after transient actions.

## Chronofang

Chronofang is a quadruped.

Its arena baseline must use the lowest visible paw/ground-contact point, not human-feet assumptions.

Audit:
- front paws
- rear paws
- low crouches
- attack poses
- block
- counter
- hit
- victory
- defeat

The beast must not:
- float above the arena floor
- sink below the arena floor
- jump vertically just because transparent margins differ
- become absurdly larger/smaller between action PNGs

Per-action `feetY` / baseline correction is allowed where genuinely needed.

Keep all corrections centralized.

Do not create dozens of action-specific CSS selectors.

---

# 11. RELATIVE SCALE

Lady Gearveil should read as roughly human-sized relative to the player avatar.

Chronofang should feel like a larger/heavier opponent, but it must still fit the arena cleanly.

Chronofang may be visually wider than humanoid opponents.

Do not scale it so large that:
- head/ears/horns are cropped
- tail is cropped
- HUD is covered
- task panel is covered
- player overlaps unnaturally
- important action effects disappear outside the arena

Use `object-fit: contain`.

Never use `object-fit: cover`.

---

# 12. ACTION CHOREOGRAPHY

Do not invent random artwork switching.

The current semantic choreography remains authoritative.

Examples:

```text
enemy waiting → idle
enemy quick attack → quickAttack
enemy heavy attack → heavyAttack
enemy blocks → block
enemy counters → counter
enemy damaged → hit
enemy wins arena sequence → victory
enemy defeated → defeat
```

Preserve all existing Code Fighter exchange choreography.

Only resolve the correct Unit 2 opponent artwork for the semantic action.

---

# 13. ACTION HOLD DURATIONS

Do not change current approved presentation timings.

Keep approximately:

```text
quick attack / hit: 900–1100 ms
block / counter: 1100–1300 ms
heavy attack: 1300–1600 ms
super/ultimate FX: 1800–2200 ms
```

These are visual hold durations only.

Do not modify answer timers.

---

# 14. REDUCED MOTION

Reduced Motion must still switch semantic art states.

For Lady Gearveil:
- mirrored state still applies

For Chronofang:
- normal orientation

Reduced Motion should:
- remove large lunges
- reduce particle movement
- preserve idle / block / counter / hit / victory / defeat image changes

---

# 15. CENTRALIZED OPPONENT REGISTRY

Extend the existing opponent registry cleanly.

Conceptually the data should resolve to something like:

```ts
ladyGearveil: {
  unitId: 2,
  role: 'rival',
  mirrorX: true,
  actions: {
    idle,
    quickAttack,
    heavyAttack,
    block,
    counter,
    hit,
    ultimate,
    victory,
    defeat
  }
}

chronofang: {
  unitId: 2,
  role: 'boss',
  mirrorX: false,
  actions: {
    idle,
    quickAttack,
    heavyAttack,
    block,
    counter,
    hit,
    ultimate,
    victory,
    defeat
  }
}
```

Do not scatter action filenames through `CodeFighter.tsx`.

---

# 16. FALLBACK

If an expected Unit 2 opponent action PNG is missing:

- never render a broken image
- fallback to the SAME opponent's idle art
- emit a development warning
- never substitute Kael
- never substitute Construct
- never substitute Lady Gearveil for Chronofang
- never substitute Chronofang for Lady Gearveil

If Lady Gearveil falls back to idle, the fallback must still be mirrored.

---

# 17. PRELOAD

Preload only the selected Unit 2 opponent action set when entering Code Fighter, using the existing preload strategy if one exists.

Do not preload all opponents from all Units globally unless the current architecture already does this intentionally.

---

# 18. RESPONSIVE QA

Check desktop and reduced-width landscape.

Unit 2 fight must keep:

- player on LEFT
- opponent on RIGHT
- opponent facing LEFT
- common arena floor
- clear center combat area
- no HUD overlap
- no task-card overlap

Lady Gearveil:
confirm every state faces LEFT after runtime mirror.

Chronofang:
confirm every state remains naturally LEFT-facing without a mirror.

---

# 19. DO NOT ALTER UNIT 1

This is mandatory.

After implementation, Unit 1 must still use its existing opponents and art exactly as before.

Do not rename/archive/delete Unit 1 opponent assets.

Do not change Unit 1 Kael/Construct behavior.

Do not globally change opponent mirror rules.

---

# 20. TESTS

Add/update focused tests for:

1. Unit 1 rival resolves to existing Unit 1 rival.
2. Unit 1 boss resolves to existing Unit 1 boss.
3. Unit 2 rival resolves to Lady Gearveil.
4. Unit 2 boss resolves to Chronofang.
5. all 9 runtime action paths for Lady Gearveil resolve.
6. all 9 runtime action paths for Chronofang resolve.
7. optional base assets resolve if retained in registry.
8. Lady Gearveil has `mirrorX: true`.
9. Chronofang has `mirrorX: false`.
10. Lady Gearveil all combat states use mirrored art rendering.
11. Lady Gearveil result art is also mirrored.
12. Chronofang is never mirrored.
13. mirroring applies only to character image layer, not outer motion wrapper/UI.
14. selected Unit determines opponent correctly.
15. rival role keeps 7-second timing.
16. boss role keeps 7-second normal / 5-second final timing.
17. Unit 2 rival reserved ultimate result art is correct.
18. Unit 2 boss reserved ultimate result art is correct.
19. fallback stays within the same opponent.
20. visual-anchor fallback works for both opponents.
21. Unit 1 opponent behavior did not regress.

---

# 21. ASSET VERIFICATION

Programmatically verify the expected prepared assets.

Lady Gearveil:
10 source files including base.

Chronofang:
10 source files including base.

Total:
20 prepared Unit 2 opponent files.

Verify:
- files exist
- files are non-empty
- Vite resolves them
- production build emits/uses required runtime assets

Do not regenerate or edit the image files.

The Lady Gearveil direction correction must happen centrally in rendering via `mirrorX`, not by creating duplicate mirrored PNG files.

---

# 22. BUILD

Run focused Code Fighter opponent tests.

Then run ONE production build.

Do not perform repeated unrelated builds.

---

# 23. STOP CONDITION

STOP after:

- Unit 2 rival uses Lady Gearveil
- Unit 2 boss uses Chronofang
- Lady Gearveil is mirrored LEFT in every state/result
- Chronofang remains unmirrored and LEFT-facing
- Unit 1 remains unchanged
- anchor/scale issues are corrected centrally
- focused tests pass
- production build passes

Do not continue into Unit 3 opponents.

---

# 24. FINAL REPORT

Return a concise report containing:

1. files changed
2. exact Lady Gearveil asset root
3. exact Chronofang asset root
4. centralized Unit-aware opponent resolver
5. rival/boss role mapping for Unit 2
6. confirmation that Lady Gearveil uses `mirrorX: true`
7. confirmation that all Lady Gearveil runtime states/results are mirrored
8. confirmation that Chronofang uses `mirrorX: false`
9. anchor/scale corrections required for Lady Gearveil
10. anchor/scale corrections required for Chronofang
11. Unit 2 result-screen integration
12. reserved ultimate/result-art integration
13. fallback behavior
14. tests and results
15. production build result
16. explicit confirmation that Unit 1 opponents, answer timers, vocabulary, Parts, Weak Word, coverage, city progression, rewards, player avatars, and other games were not changed
