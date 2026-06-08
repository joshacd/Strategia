// Strategia: lib/game.js
// Created By: Josha Chapman-Dodson
// Date Created: 6/4/26

import { ID } from 'react-native-appwrite';
import { databases, DB_ID, GAMES_COL } from './appwrite';

const EMPTY_BOARD = JSON.stringify(new Array(100).fill(null));

// Player 1 creates a game and waits
export async function createGame(userId) {
  return databases.createDocument(DB_ID, GAMES_COL, ID.unique(), {
    player1Id:  userId,
    boardState: EMPTY_BOARD,
    // phase, currentTurn, setupP1Done, setupP2Done
    // all handled by Appwrite column defaults ✅
  });
}

// Player 2 joins an open game
export async function joinGame(gameId, userId) {
  return databases.updateDocument(DB_ID, GAMES_COL, gameId, {
    player2Id: userId,
  });
}

// Fetch a game by ID
export async function getGame(gameId) {
  return databases.getDocument(DB_ID, GAMES_COL, gameId);
}

// Update board state after a move
export async function updateBoard(gameId, newBoard, nextTurn) {
  return databases.updateDocument(DB_ID, GAMES_COL, gameId, {
    boardState:  JSON.stringify(newBoard),
    currentTurn: nextTurn,
  });
}

// Mark a player's setup as complete
export async function markSetupDone(gameId, playerNumber) {
  const column = playerNumber === 1 ? 'setupP1Done' : 'setupP2Done';
  return databases.updateDocument(DB_ID, GAMES_COL, gameId, {
    [column]: true,
  });
}

// Transition from setup phase to battle phase
export async function startBattle(gameId) {
  return databases.updateDocument(DB_ID, GAMES_COL, gameId, {
    phase: 'battle',
  });
}

// Set the winner and end the game
export async function setWinner(gameId, winner) {
  return databases.updateDocument(DB_ID, GAMES_COL, gameId, {
    winner: winner,
  });
}
