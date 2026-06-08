// Strategia: lib/pieces.js
// Created By: Josha Chapman-Dodson
// Date Created: 6/8/26

// ─────────────────────────────────────────────
// Piece rank values. Higher = stronger.
// Bomb and Flag are special — handled separately.
// ─────────────────────────────────────────────
export const RANKS = {
  Marshal:    10,
  General:     9,
  Colonel:     8,
  Major:       7,
  Captain:     6,
  Lieutenant:  5,
  Sergeant:    4,
  Miner:       3,
  Scout:       2,
  Spy:         1,
  Bomb:       11, // Immovable — beats everything except Miner
  Flag:        0, // Immovable — capturing this wins the game
};

// How many of each piece each player gets
export const PIECE_COUNTS = {
  Marshal:    1,
  General:    1,
  Colonel:    2,
  Major:      3,
  Captain:    4,
  Lieutenant: 4,
  Sergeant:   4,
  Miner:      5,
  Scout:      8,
  Spy:        1,
  Bomb:       6,
  Flag:       1,
};

// Immovable pieces — cannot be moved on any turn
export const IMMOVABLE = ['Bomb', 'Flag'];

// Which rows each player can place pieces in during setup (0-indexed, 10x10 board)
export const SETUP_ROWS = {
  player1: [0, 1, 2, 3],  // top four rows
  player2: [6, 7, 8, 9],  // bottom four rows
};

// Water squares — no piece can enter these (standard Stratego layout)
// Indices on a flat 100-cell array (row * 10 + col)
export const WATER_SQUARES = [42, 43, 46, 47, 52, 53, 56, 57];

// ─────────────────────────────────────────────
// Combat resolution
//
// Returns one of:
//   'attacker' — attacker wins, defender is removed
//   'defender' — defender wins, attacker is removed
//   'both'     — tie, both pieces are removed
// ─────────────────────────────────────────────
export function resolveCombat(attacker, defender) {
  const aRank = attacker.rank;
  const dRank = defender.rank;

  // Flag capture — attacker always wins
  if (dRank === 'Flag') return 'attacker';

  // Bomb — kills attacker unless attacker is a Miner
  if (dRank === 'Bomb') {
    return aRank === 'Miner' ? 'attacker' : 'defender';
  }

  // Spy — only beats the Marshal when the Spy is attacking
  if (aRank === 'Spy' && dRank === 'Marshal') return 'attacker';
  if (dRank === 'Spy') return 'attacker'; // Spy loses when defending against anything

  // Standard rank comparison
  const aValue = RANKS[aRank];
  const dValue = RANKS[dRank];

  if (aValue > dValue) return 'attacker';
  if (dValue > aValue) return 'defender';
  return 'both'; // tie — both removed
}
