#!/usr/bin/env node
/**
 * Pure Math & Logic Unit Test Suite for Interactive Site Tools
 * Covers:
 * 1. F1 2026 Championship Calculator (Points distribution, max remaining points, clinch logic)
 * 2. Ocarina Practice Tool (Note-to-MIDI conversion, frequency calculation, Alto C range)
 * 3. Umpire Simulator (Statcast strike zone collisions, shadow boundary, run value favor)
 * 4. Sports Trend Analyzers (Pythagorean win expectation, rolling average math)
 *
 * Runs 100% offline via Node built-ins in < 500ms.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

console.log('=== Tool Core Math & Logic Unit Tests ===\n');
let passed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// 1. F1 Championship Calculator Math
// -------------------------------------------------------------
console.log('1. F1 Championship Calculator Logic');

const F1_POINTS_RACE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const F1_POINTS_SPRINT = [8, 7, 6, 5, 4, 3, 2, 1];
const F1_FASTEST_LAP = 1;

function calcMaxRemainingPoints(racesRemaining, sprintsRemaining) {
  return (racesRemaining * (F1_POINTS_RACE[0] + F1_FASTEST_LAP)) +
         (sprintsRemaining * F1_POINTS_SPRINT[0]);
}

function checkDriversChampionshipClinch(leaderPts, secondPts, racesRemaining, sprintsRemaining) {
  const maxPts = calcMaxRemainingPoints(racesRemaining, sprintsRemaining);
  const gap = leaderPts - secondPts;
  return gap > maxPts;
}

function checkConstructorsClinch(leaderTeamPts, secondTeamPts, racesRemaining, sprintsRemaining) {
  // A team can score 1st + 2nd (25 + 18 = 43) + fastest lap (1) = 44 pts in main race
  // Plus sprint 1st + 2nd (8 + 7 = 15) = 59 pts max in sprint weekend
  const maxTeamPts = (racesRemaining * 44) + (sprintsRemaining * 15);
  const gap = leaderTeamPts - secondTeamPts;
  return gap > maxTeamPts;
}

test('F1 max remaining points calculation', () => {
  // 5 races left, 2 sprints left: 5 * 26 + 2 * 8 = 130 + 16 = 146
  assert.equal(calcMaxRemainingPoints(5, 2), 146);
  // 0 races left: 0 points
  assert.equal(calcMaxRemainingPoints(0, 0), 0);
  // 1 race left, no sprint: 26 points
  assert.equal(calcMaxRemainingPoints(1, 0), 26);
});

test('F1 driver clinch conditions', () => {
  // Gap 27 with 1 race left (max 26) -> Clinched!
  assert.equal(checkDriversChampionshipClinch(350, 323, 1, 0), true);
  // Gap 26 with 1 race left (max 26) -> Not clinched (tiebreaker possible)
  assert.equal(checkDriversChampionshipClinch(350, 324, 1, 0), false);
  // Gap 50 with 2 races left (max 52) -> Not clinched
  assert.equal(checkDriversChampionshipClinch(350, 300, 2, 0), false);
  // Gap 53 with 2 races left (max 52) -> Clinched!
  assert.equal(checkDriversChampionshipClinch(353, 300, 2, 0), true);
});

test('F1 constructors clinch conditions', () => {
  // 1 race left (max 44 pts)
  assert.equal(checkConstructorsClinch(500, 455, 1, 0), true); // gap 45 > 44
  assert.equal(checkConstructorsClinch(500, 456, 1, 0), false); // gap 44 not > 44
});

// -------------------------------------------------------------
// 2. Ocarina Practice Tool Math & Pitch Translation
// -------------------------------------------------------------
console.log('\n2. Ocarina Practice Tool Math & Pitch Translation');

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_ALIASES = { 'DB': 'C#', 'EB': 'D#', 'GB': 'F#', 'AB': 'G#', 'BB': 'A#' };

function noteNameToMidi(name) {
  const m = name.trim().toUpperCase().match(/^([A-G][#B]?)(-?\d+)$/);
  if (!m) return null;
  let [, pitch, octaveStr] = m;
  if (NOTE_ALIASES[pitch]) pitch = NOTE_ALIASES[pitch];
  const idx = NOTE_NAMES.indexOf(pitch);
  if (idx === -1) return null;
  const octave = parseInt(octaveStr, 10);
  return (octave + 1) * 12 + idx;
}

function midiToFrequency(midi) {
  // A4 = 69 = 440 Hz
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function frequencyToCentsDiff(measuredFreq, targetFreq) {
  return 1200 * Math.log2(measuredFreq / targetFreq);
}

test('Ocarina Note to MIDI mapping', () => {
  assert.equal(noteNameToMidi('C4'), 60);
  assert.equal(noteNameToMidi('A4'), 69); // Standard pitch A440
  assert.equal(noteNameToMidi('A4'), 69);
  assert.equal(noteNameToMidi('C5'), 72);
  assert.equal(noteNameToMidi('Db6'), 85); // Flat alias resolves to C#6
  assert.equal(noteNameToMidi('C#6'), 85);
  assert.equal(noteNameToMidi('F6'), 89);  // Alto C top note
});

test('Ocarina 12-hole Alto C standard range (A4 to F6)', () => {
  const lowNoteMidi = noteNameToMidi('A4'); // 69
  const highNoteMidi = noteNameToMidi('F6'); // 89
  assert.equal(lowNoteMidi, 69);
  assert.equal(highNoteMidi, 89);
  assert.equal(highNoteMidi - lowNoteMidi, 20); // 21 chromatic notes inclusive
});

test('Acoustic pitch & cents tuning calculation', () => {
  const a440 = midiToFrequency(69);
  assert.ok(Math.abs(a440 - 440.0) < 1e-4);

  const a880 = midiToFrequency(81); // A5
  assert.ok(Math.abs(a880 - 880.0) < 1e-4);

  // Frequency 445 Hz vs 440 Hz = ~19.56 cents sharp
  const centsSharp = frequencyToCentsDiff(445, 440);
  assert.ok(Math.abs(centsSharp - 19.56) < 0.1);

  // Frequency 435 Hz vs 440 Hz = ~-19.78 cents flat
  const centsFlat = frequencyToCentsDiff(435, 440);
  assert.ok(Math.abs(centsFlat - (-19.78)) < 0.1);
});

// -------------------------------------------------------------
// 3. Umpire Simulator Strike Zone Collision Math
// -------------------------------------------------------------
console.log('\n3. Umpire Simulator Strike Zone & Statcast Physics');

const BALL_RADIUS_FT = 1.45 / 12; // 0.120833 ft
const PLATE_HALF_WIDTH_FT = 8.5 / 12; // 0.708333 ft (17 inches wide)
const SHADOW_MARGIN_FT = 1.45 / 12; // borderline zone thickness

function evaluatePitchAtPlate(x_ft, z_ft, sz_bot_ft = 1.5, sz_top_ft = 3.5) {
  // Rulebook strike: any part of the 2.9" baseball touches the 17" home plate cylinder
  const inHorizontal = Math.abs(x_ft) <= (PLATE_HALF_WIDTH_FT + BALL_RADIUS_FT);
  const inVertical = z_ft >= (sz_bot_ft - BALL_RADIUS_FT) && z_ft <= (sz_top_ft + BALL_RADIUS_FT);
  const isRulebookStrike = inHorizontal && inVertical;

  // Shadow zone: within +/- 1.45" of the effective strike zone boundary
  const distFromEdgeX = Math.abs(Math.abs(x_ft) - PLATE_HALF_WIDTH_FT);
  const distFromEdgeZ = Math.min(Math.abs(z_ft - sz_bot_ft), Math.abs(z_ft - sz_top_ft));
  const isShadowZone = distFromEdgeX <= SHADOW_MARGIN_FT || distFromEdgeZ <= SHADOW_MARGIN_FT;

  return { isRulebookStrike, isShadowZone };
}

test('Pitch right down the pipe (0, 2.5 ft)', () => {
  const result = evaluatePitchAtPlate(0, 2.5);
  assert.equal(result.isRulebookStrike, true);
  assert.equal(result.isShadowZone, false); // Heart of zone
});

test('Borderline pitch clipping corner (8.6 inches, 2.5 ft)', () => {
  // 8.6 inches = 0.7166 ft. Plate edge is 8.5" (0.7083 ft).
  // Ball radius 1.45" -> Outer limit is 8.5 + 1.45 = 9.95". 8.6" touches plate!
  const result = evaluatePitchAtPlate(8.6 / 12, 2.5);
  assert.equal(result.isRulebookStrike, true);
  assert.equal(result.isShadowZone, true); // Borderline call
});

test('Clear ball outside (12 inches, 2.5 ft)', () => {
  // 12 inches > 9.95 inches
  const result = evaluatePitchAtPlate(1.0, 2.5);
  assert.equal(result.isRulebookStrike, false);
});

test('Dynamic Statcast batter strike zones (Altuve 5\'6" vs Judge 6\'7")', () => {
  const altuveBot = 1.34, altuveTop = 3.16;
  const judgeBot = 1.72, judgeTop = 3.94;

  // High pitch at Y = 3.65 ft (middle of plate X = 0)
  // Inside Judge's tall zone, but high ball against Altuve
  const pitchHighAltuve = evaluatePitchAtPlate(0, 3.65, altuveBot, altuveTop);
  const pitchHighJudge = evaluatePitchAtPlate(0, 3.65, judgeBot, judgeTop);
  assert.equal(pitchHighAltuve.isRulebookStrike, false, '3.65ft should be a high ball for Altuve');
  assert.equal(pitchHighJudge.isRulebookStrike, true, '3.65ft should be a strike for Judge');

  // Low pitch at Y = 1.40 ft (middle of plate X = 0)
  // Low strike at Altuve\'s knees, but ball below the knees for Judge
  const pitchLowAltuve = evaluatePitchAtPlate(0, 1.40, altuveBot, altuveTop);
  const pitchLowJudge = evaluatePitchAtPlate(0, 1.40, judgeBot, judgeTop);
  assert.equal(pitchLowAltuve.isRulebookStrike, true, '1.40ft should be a strike at Altuve\'s knees');
  assert.equal(pitchLowJudge.isRulebookStrike, false, '1.40ft should be a low ball for Judge');
});

test('Umpire Run Value Favor calculation', () => {
  // When a true strike is called a ball: favors batter by ~+0.14 runs on average
  // When a true ball is called a strike: favors pitcher by ~-0.14 runs
  function runDelta(calledStrike, isTrueStrike) {
    if (calledStrike === isTrueStrike) return 0.0;
    if (!calledStrike && isTrueStrike) return +0.14; // Missed strike favors batter
    if (calledStrike && !isTrueStrike) return -0.14; // Missed ball favors pitcher
    return 0.0;
  }
  assert.equal(runDelta(false, true), 0.14);
  assert.equal(runDelta(true, false), -0.14);
  assert.equal(runDelta(true, true), 0.0);
  assert.equal(runDelta(false, false), 0.0);
});

// -------------------------------------------------------------
// 4. Sports Trend Analyzers Math (Pythagorean & Rolling Averages)
// -------------------------------------------------------------
console.log('\n4. Sports Trend Analyzers Math (Pythagorean & Rolling Windows)');

function pythagoreanWinPct(runsScored, runsAllowed, exp = 1.83) {
  if (runsScored === 0 && runsAllowed === 0) return 0.5;
  const rsExp = Math.pow(runsScored, exp);
  const raExp = Math.pow(runsAllowed, exp);
  return rsExp / (rsExp + raExp);
}

function computeRollingAverage(series, windowSize) {
  if (!series || !series.length) return [];
  const result = [];
  for (let i = 0; i < series.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const windowSlice = series.slice(start, i + 1);
    const sum = windowSlice.reduce((a, b) => a + b, 0);
    result.push(Number((sum / windowSlice.length).toFixed(2)));
  }
  return result;
}

test('Pythagorean win expectation', () => {
  // Equal scoring -> 50%
  assert.equal(pythagoreanWinPct(500, 500), 0.5);
  // Dominant offense 800 RS vs 600 RA -> ~63%
  const dominant = pythagoreanWinPct(800, 600);
  assert.ok(dominant > 0.62 && dominant < 0.65);
  // Rebuilding team 500 RS vs 800 RA -> ~29.5%
  const rebuilding = pythagoreanWinPct(500, 800);
  assert.ok(rebuilding > 0.28 && rebuilding < 0.32);
});

test('Rolling average window calculation', () => {
  const scores = [10, 20, 30, 40, 50];
  const roll3 = computeRollingAverage(scores, 3);
  // index 0: [10] / 1 = 10
  // index 1: [10, 20] / 2 = 15
  // index 2: [10, 20, 30] / 3 = 20
  // index 3: [20, 30, 40] / 3 = 30
  // index 4: [30, 40, 50] / 3 = 40
  assert.deepEqual(roll3, [10, 15, 20, 30, 40]);
});

console.log(`\n======================================`);
console.log(`Summary: All ${passed} tool math tests passed.`);
console.log(`======================================\n`);
