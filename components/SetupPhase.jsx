// Strategia: components/SetupPhase.jsx
// Created By: Josha Chapman-Dodson
// Date Created: 6/5/26

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { PIECE_COUNTS, SETUP_ROWS } from '../lib/pieces';
import { isWater, coordToIndex } from '../lib/boardUtils';
import { updateBoard, markSetupDone, startBattle } from '../lib/game';

// Build the starting hand for a player — one entry per piece
function buildHand() {
  const hand = [];
  for (const [rank, count] of Object.entries(PIECE_COUNTS)) {
    for (let i = 0; i < count; i++) {
      hand.push({ rank, id: `${rank}-${i}` });
    }
  }
  return hand;
}

export default function SetupPhase({ gameState, gameId, currentUserId }) {
  const board  = JSON.parse(gameState.boardState);
  const myRole = gameState.player1Id === currentUserId ? 'player1' : 'player2';
  const myRows = SETUP_ROWS[myRole];

  const [localBoard,   setLocalBoard]   = useState(board);
  const [hand,         setHand]         = useState(buildHand());
  const [selectedPiece, setSelectedPiece] = useState(null); // piece from hand
  const [isConfirmed,  setIsConfirmed]  = useState(
    myRole === 'player1' ? gameState.setupP1Done : gameState.setupP2Done
  );

  // Is this cell in my allowed setup rows?
  function isMyZone(index) {
    const row = Math.floor(index / 10);
    return myRows.includes(row);
  }

  function handleCellPress(index) {
    if (isConfirmed) return;                       // already locked in
    if (isWater(index)) return;                    // can't place on water
    if (!isMyZone(index)) return;                  // outside setup zone
    if (!selectedPiece) return;                    // no piece selected from hand

    const newBoard = [...localBoard];

    // If a piece is already there, return it to the hand
    if (newBoard[index] !== null) {
      setHand((prev) => [...prev, { rank: newBoard[index].rank, id: `${newBoard[index].rank}-returned-${Date.now()}` }]);
    }

    // Place the selected piece
    newBoard[index] = { rank: selectedPiece.rank, owner: myRole, revealed: false };
    setLocalBoard(newBoard);

    // Remove placed piece from hand
    setHand((prev) => prev.filter((p) => p.id !== selectedPiece.id));
    setSelectedPiece(null);
  }

  async function handleConfirm() {
    if (hand.length > 0) {
      Alert.alert('Not ready', `You still have ${hand.length} piece(s) to place.`);
      return;
    }

    // Write the final board to Appwrite
    await updateBoard(gameId, localBoard, gameState.currentTurn);

    // Mark this player as done
    const playerNumber = myRole === 'player1' ? 1 : 2;
    await markSetupDone(gameId, playerNumber);
    setIsConfirmed(true);

    // If both players are done, start battle
    const p1Done = myRole === 'player1' ? true : gameState.setupP1Done;
    const p2Done = myRole === 'player2' ? true : gameState.setupP2Done;
    if (p1Done && p2Done) {
      await startBattle(gameId);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Place Your Pieces</Text>
      <Text style={styles.subtitle}>
        {isConfirmed
          ? 'Waiting for opponent to finish setup...'
          : `Select a piece below, then tap your zone (${myRole === 'player1' ? 'top 4 rows' : 'bottom 4 rows'})`}
      </Text>

      {/* Board grid */}
      <View style={styles.grid}>
        {localBoard.map((piece, index) => {
          const inZone = isMyZone(index);
          const water  = isWater(index);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.cell,
                water  && styles.water,
                inZone && !isConfirmed && styles.myZone,
                piece && piece.owner === myRole && styles.placedPiece,
              ]}
              onPress={() => handleCellPress(index)}
              disabled={isConfirmed || water || !inZone}
            >
              {piece && (
                <Text style={styles.cellText}>
                  {piece.rank.slice(0, 3).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Piece hand */}
      {!isConfirmed && (
        <>
          <Text style={styles.handTitle}>
            Hand ({hand.length} remaining) — tap to select
          </Text>
          <FlatList
            data={hand}
            keyExtractor={(item) => item.id}
            horizontal
            style={styles.hand}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.handPiece,
                  selectedPiece?.id === item.id && styles.handSelected,
                ]}
                onPress={() => setSelectedPiece(item)}
              >
                <Text style={styles.handText}>{item.rank}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Setup</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  grid: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '10%',
    aspectRatio: 1,
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  water: {
    backgroundColor: '#60A5FA',
    borderColor: '#3B82F6',
  },
  myZone: {
    backgroundColor: '#DBEAFE',
  },
  placedPiece: {
    backgroundColor: '#3B82F6',
  },
  cellText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  handTitle: {
    marginTop: 12,
    fontWeight: '600',
    fontSize: 14,
    alignSelf: 'flex-start',
    paddingLeft: 4,
  },
  hand: {
    marginTop: 6,
    flexGrow: 0,
  },
  handPiece: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
  },
  handSelected: {
    backgroundColor: '#FBBF24',
  },
  handText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  confirmButton: {
    marginTop: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
