// Strategia: app/game/[id].jsx
// Created By: Josha Chapman-Dodson
// Date Created: 6/4/26

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { client, DB_ID, GAMES_COL } from '../../lib/appwrite';
import { getGame } from '../../lib/game';
import Board from '../../components/Board';
import SetupPhase from '../../components/SetupPhase';

export default function GameScreen() {
  const { id } = useLocalSearchParams();
  const [gameState, setGameState] = useState(null);

  // Initial load
  useEffect(() => {
    getGame(id).then(setGameState);
  }, [id]);

  // Realtime subscription — fires whenever another player updates the row
  useEffect(() => {
    if (!id) return;

    const channel = `databases.${DB_ID}.collections.${GAMES_COL}.documents.${id}`;

    const unsubscribe = client.subscribe(channel, (response) => {
      if (response.events.includes('databases.*.collections.*.documents.*.update')) {
        setGameState(response.payload); // payload IS the updated row
      }
    });

    return () => unsubscribe();
  }, [id]);

  if (!gameState) {
    return (
      <View style={styles.center}>
        <Text>Loading game...</Text>
      </View>
    );
  }

  // Show piece placement UI until both players are ready
  if (gameState.phase === 'setup') {
    return <SetupPhase gameState={gameState} gameId={id} />;
  }

  // Show the live game board once battle phase begins
  return <Board gameState={gameState} gameId={id} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
