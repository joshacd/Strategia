// Strategia: lib/boardUtils.js
// Created By: Josha Chapman-Dodson
// Date Created: 6/8/26

import { IMMOVABLE, WATER_SQUARES, RANKS, resolveCombat } from './pieces';
import { updateBoard, setWinner } from './game';

// ─────────────────────────────────────────────
// Board helpers
// ─────────────────────────────────────────────

// Convert a flat index (0–99) to { row, col }
export function indexToCoord(index) {
  return { row: Math.floor(index / 10), col: index % 10 };
}

// Convert { row, col } to a flat index
export function coordToIndex(row, col) {
  return row * 10 + col;
}

// Check if a flat index is a water square
export function isWater(index) {
  return WATER_SQUARES.includes(index);
}

// ─────────────────────────────────────────────
// Valid move calculation
//
// Returns an array of flat indices the piece at
// `fromIndex` is legally allowed to move to.
// ─────────────────────────────────────────────
export function getValidMoves(board, fromIndex, currentPlayer) {
  const piece = board[fromIndex];
  if (!piece || piece.owner !== currentPlayer) return [];
  if (IMMOVABLE.includes(piece.rank)) return [];

  const { row, col } = indexToCoord(fromIndex);
  const moves = [];

  // Scouts can move any number of squares in one direction
  const isScout = piece.rank === 'Scout';

  const directions = [
    { dr: -1, dc:  0 }, // up
    { dr:  1, dc:  0 }, // down
    { dr:  0, dc: -1 }, // left
    { dr:  0, dc:  1 }, // right
  ];

  for (const { dr, dc } of directions) {
    let r = row + dr;
    let c = col + dc;

    while (r >= 0 && r < 10 && c >= 0 && c < 10) {
      const targetIndex = coordToIndex(r, c);

      // Can't enter water
      if (isWater(targetIndex)) break;

      const targetPiece = board[targetIndex];

      if (targetPiece === null) {
        moves.push(targetIndex);
        // Non-scouts stop after one empty square
        if (!isScout) break;
      } else if (targetPiece.owner !== currentPlayer) {
        // Can attack an enemy piece — but can't continue past it
        moves.push(targetIndex);
        break;
      } else {
        // Friendly piece is blocking — stop
        break;
      }

      r += dr;
      c += dc;
    }
  }

  return moves;
}

// ─────────────────────────────────────────────
// Apply a move to the board
//
// Handles movement, combat, flag capture, and
// writing the result back to Appwrite.
//
// Returns the updated board array (or null if
// the game ended with a winner).
// ─────────────────────────────────────────────
export async function applyMove(gameId, board, fromIndex, toIndex, currentPlayer) {
  const newBoard = [...board];
  const attacker = { ...newBoard[fromIndex] };
  const target   = newBoard[toIndex];

  if (target === null) {
    // Simple move — no combat
    newBoard[toIndex]   = attacker;
    newBoard[fromIndex] = null;
  } else {
    // Combat
    const result = resolveCombat(attacker, target);

    // Reveal both pieces involved in combat
    attacker.revealed = true;
    target.revealed   = true;

    if (result === 'attacker') {
      if (target.rank === 'Flag') {
        // Game over — attacker captured the flag
        newBoard[toIndex]   = { ...attacker, revealed: true };
        newBoard[fromIndex] = null;
        await updateBoard(gameId, newBoard, nextTurn(currentPlayer));
        await setWinner(gameId, currentPlayer);
        return null; // signal that the game is over
      }
      newBoard[toIndex]   = { ...attacker, revealed: true };
      newBoard[fromIndex] = null;
    } else if (result === 'defender') {
      newBoard[toIndex]   = { ...target, revealed: true };
      newBoard[fromIndex] = null;
    } else {
      // Tie — both removed
      newBoard[toIndex]   = null;
      newBoard[fromIndex] = null;
    }
  }

  const next = nextTurn(currentPlayer);
  await updateBoard(gameId, newBoard, next);
  return newBoard;
}

// ─────────────────────────────────────────────
// Toggle whose turn it is
// ─────────────────────────────────────────────
export function nextTurn(currentPlayer) {
  return currentPlayer === 'player1' ? 'player2' : 'player1';
}
