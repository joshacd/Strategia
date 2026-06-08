// Strategia: components/Board.jsx
// Created By: Josha Chapman-Dodson
// Date Created: 6/5/26

import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Piece from './Piece';
import { getValidMoves, applyMove } from '../lib/boardUtils';
import { isWater } from '../lib/boardUtils';

export default function Board({ gameState, gameId, currentUserId }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [validMoves, setValidMoves]       = useState([]);

  // Parse boardState from JSON string back into an array
  const board = JSON.parse(gameState.boardState);

  // Map the Appwrite user ID to 'player1' or 'player2'
  const myRole = gameState.player1Id === currentUserId ? 'player1' : 'player2';
  const isMyTurn = gameState.currentTurn === myRole;

  function handleCellPress(index) {
    // Not your turn — do nothing
    if (!isMyTurn) return;

    const piece = board[index];

    if (selectedIndex === null) {
      // No piece selected yet — try to select one
      if (piece && piece.owner === myRole) {
        const moves = getValidMoves(board, index, myRole);
        setSelectedIndex(index);
        setValidMoves(moves);
      }
    } else {
      // A piece is already selected
      if (validMoves.includes(index)) {
        // Valid destination — apply the move
        applyMove(gameId, board, selectedIndex, index, myRole).then((result) => {
          if (result === null) {
            Alert.alert('Game Over', `${myRole} wins by capturing the Flag!`);
          }
        });
        setSelectedIndex(null);
        setValidMoves([]);
      } else if (piece && piece.owner === myRole && index !== selectedIndex) {
        // Tapped a different friendly piece — switch selection
        const moves = getValidMoves(board, index, myRole);
        setSelectedIndex(index);
        setValidMoves(moves);
      } else {
        // Tapped empty non-move square or same piece — deselect
        setSelectedIndex(null);
        setValidMoves([]);
      }
    }
  }

  return (
    <View style={styles.container}>
      {gameState.winner && (
        <Text style={styles.winner}>
          🏆 {gameState.winner === myRole ? 'You win!' : 'You lose!'}
        </Text>
      )}
      <Text style={styles.turnText}>
        {isMyTurn ? 'Your turn' : "Waiting for opponent..."}
      </Text>
      <View style={styles.grid}>
        {board.map((piece, index) => (
          <View key={index} style={styles.cellWrapper}>
            <Piece
              piece={piece}
              isSelected={selectedIndex === index}
              isValidMove={validMoves.includes(index)}
              isWater={isWater(index)}
              onPress={() => handleCellPress(index)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  grid: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrapper: {
    width: '10%', // 10 columns
  },
  turnText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  winner: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#10B981',
  },
});
