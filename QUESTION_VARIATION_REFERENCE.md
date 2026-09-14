# Power Up 2 — Question Variation Reference

## Purpose

This document is the canonical product rule for repeated vocabulary encounters.

A vocabulary word may return after a learner makes a mistake or when spaced review is due. The word may repeat; the exact question presentation should not. A repeated encounter should normally require a different and slightly more demanding form of recall.

This rule applies independently inside Repair, Error Hunt, Audio Code, Word Strike, and Code Fighter.

## Core rule

For each Unit + module + vocabulary ID:

1. Store the last completed question variant.
2. When the word returns, build the eligible variant list for that word.
3. Exclude the immediately previous variant whenever at least one alternative exists.
4. Prefer a variant with a higher recall difficulty after an incorrect answer.
5. Keep normal spacing: do not repeat the word immediately just because the answer was wrong.
6. Commit the new variant history only after the learner submits an answer.

The stable vocabulary ID is the identity of the word. Display text must not be used as the history key.

## What counts as “the same question”

Two encounters are considered the same when all important learner-facing elements are unchanged:

- the same instruction;
- the same clue type;
- the same damaged or missing-letter pattern;
- the same answer interaction;
- and the same distractor set/order.

Changing only the position of a button or the visual animation does not create a new question variant.

Every generated task should have a stable `variantId`, for example:

- `repair.definition.mask-2`
- `error-hunt.transposition`
- `audio-code.assemble`
- `word-strike.context`
- `code-fighter.audio-text`

## Difficulty ladder

“Harder” means that the learner must retrieve more of the answer independently. It must not mean trick wording, hidden controls, reduced accessibility, or answer ambiguity.

### Level 1 — Recognition

- picture or definition with choices;
- audio with choices;
- lightly damaged spelling;
- clear distractors.

### Level 2 — Guided recall

- shuffled letter assembly;
- sentence gap;
- stronger spelling corruption;
- closer but still unambiguous distractors.

### Level 3 — Active recall

- typed answer from audio;
- typed answer from an English definition or context;
- multi-step combo;
- recall without visible choices.

After an incorrect answer, the next due encounter should use another eligible form and should move one level upward where the module supports it. Once Level 3 is reached, rotate among different Level 3 forms instead of repeating one exact prompt.

## Module-specific variation

### Repair

Repair remains a semantic clue plus a partially damaged correctly spelled target.

Allowed variation:

- rotate between definition and example/context clues;
- use translation only when the current product/content rules explicitly allow it;
- change which letters are hidden;
- gradually increase the damaged portion within the existing readable limit;
- preserve spaces and word boundaries in phrases.

Never repeat the same clue and the same damage mask consecutively.

### Error Hunt

Error Hunt remains spelling correction only.

Rotate among:

- one missing letter;
- one duplicated letter;
- adjacent transposition;
- plausible single-letter substitution;
- a supplied production `typoForm`, when available.

The corrupted form must never equal an accepted correct form. On repeat, avoid the immediately previous corruption operation and exact corrupted string.

### Audio Code

Audio Code remains audio-driven and must never reveal the canonical answer before submission.

Difficulty order:

1. choose from shuffled candidates;
2. assemble shuffled letters into blank structural slots;
3. type the answer from audio with no written clue.

For multiword phrases, spaces remain structural separators. Letters remain hidden before selection. Replay audio stays available at every level.

After an Audio Code mistake, do not serve the same word again with the same interaction mode.

### Word Strike

Rotate through the clue types that the vocabulary record genuinely supports:

- picture;
- English definition;
- audio;
- sentence/context;
- translation only when current product rules allow it.

Increase difficulty by using closer distractors, a larger target set, or a clue that requires context rather than direct recognition. Do not reuse the same clue type and distractor order consecutively.

### Code Fighter

All learner-facing clues remain English-only.

Difficulty order:

1. Quick Meaning / Meaning Strike;
2. Heavy Spelling / Error Defense / Audio Counter;
3. Three-Step Combo / Ultimate Recall.

A repeated Weak Word should enter through a different eligible challenge kind. Starting a new battle must not reset the word to the same first challenge variant every time.

## Eligibility and fallback

Never invent missing content.

- Use only clue types supported by the vocabulary record.
- Audio variants require a production audio source.
- Picture variants require an approved image.
- Context variants require a valid example whose answer can be removed cleanly.
- Definition variants require a learner-appropriate English definition where English-only rules apply.

If a word supports only one primary form, keep the module playable but vary safe secondary parameters such as mask positions, distractor set/order, or sentence selection. If no meaningful variation exists, spaced repetition is preferable to generating an invalid clue.

## Persistence model

Recommended optional state inside each `ModuleProgress`:

```ts
variantStateByWordId: Record<string, {
  lastVariantId: string
  completedEncounters: number
  difficulty: 1 | 2 | 3
}>
```

This state is separate for every module. Encountering `u1-get-up` in Repair must not change its next Audio Code or Code Fighter variant.

For migration, missing state defaults to an empty object. Do not infer historical variants from old completion flags.

## Determinism

Tests must be reliable. Variant selection may use the existing deterministic task index/seed architecture, but it must also compare the selected `variantId` with `lastVariantId` and rotate to another eligible candidate when they match.

Randomness alone is not sufficient because it can return the same form.

## Interaction with existing systems

- Coverage still counts the vocabulary ID once per module after a submitted encounter.
- Wrong submitted answers still count as exposure and still update Weak Word.
- Retries do not add duplicate coverage.
- Question difficulty does not change scoring, mastery thresholds, review spacing, medals, city construction, or rewards unless a separate specification requests it.
- Abandoned/unanswered tasks update neither coverage nor variant history.
- Accepted forms and capitalization rules remain unchanged.

## Required tests before implementation is complete

At minimum verify:

- a wrong word returns only after the configured spacing;
- the repeated word uses a different `variantId`;
- the next form is harder when a harder eligible form exists;
- the exact previous form is avoided across separate sessions and reloads;
- a second mistake advances or rotates the form again;
- single-form vocabulary uses a safe secondary variation;
- multiword phrases preserve spaces without exposing the answer;
- Code Fighter review remains English-only;
- an abandoned task does not change variant history;
- coverage and Weak Word behavior remain unchanged.
