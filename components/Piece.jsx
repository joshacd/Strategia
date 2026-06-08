// Strategia: components/Piece.jsx
// Created By: Josha Chapman-Dodson
// Date Created: 6/5/26

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WATER_SQUARES } from '../lib/pieces';

// Colour assigned to each player's pieces
const PLAYER_COLORS = {
  player1: '#3B82F6', // blue
  player2: '#EF4444', // red
};

export default function Piece({ piece, isSelected, isValidMove, isWater, onPress }) {
  if (isWater) {
    return <View style={styles.water} />;
  }

  if (!piece) {
    return (
      <TouchableOpacity
        style={[styles.cell, isValidMove && styles.validMove]}
        onPress={onPress}
        activeOpacity={0.7}
      />
    );
  }

  const color     = PLAYER_COLORS[piece.owner];
  const showRank  = piece.revealed || piece.owner === 'player1'; // TODO: pass currentPlayer in

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { backgroundColor: color },
        isSelected  && styles.selected,
        isValidMove && styles.validMove,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.rankText}>
        {showRank ? piece.rank.slice(0, 3).toUpperCase() : '???'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#D1D5DB',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  water: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#60A5FA',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 2,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#FBBF24',
    backgroundColor: '#FEF3C7',
  },
  validMove: {
    borderWidth: 2,
    borderColor: '#34D399',
    backgroundColor: '#D1FAE5',
  },
  rankText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
