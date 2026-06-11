// Strategia: app/game/[id].jsx
// Created By: Josha Chapman-Dodson
// Date Created: 6/4/26

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { client, DB_ID, GAMES_COL } from '../../lib/appwrite';
import { getGame } from '../../lib/game';
import Board from '../../components/Board';
import SetupPhase from '../../components/SetupPhase';

export default function GameScreen() {
  const { id } = useLocalSearchParams();
  const [gameState, setGameState] = useState(null);
  const unsubscribeRef = useRef(null);
  const retryRef      = useRef(null);

  // Initial load
  useEffect(() => {
    getGame(id).then(setGameState);
  }, [id]);

  // Realtime subscription with retry.
  //
  // The Appwrite SDK starts a heartbeat setInterval immediately when
  // subscribe() is called. If the WebSocket is still in CONNECTING state
  // when that interval first fires, it throws INVALID_STATE_ERR from
  // inside the SDK. We can't fix the SDK, so we catch the error and
  // retry after a short delay until the socket is ready.
  useEffect(() => {
    if (!id) return;

    const channel = `databases.${DB_ID}.collections.${GAMES_COL}.documents.${id}`;

    function subscribe() {
      try {
        unsubscribeRef.current = client.subscribe(channel, (response) => {
          if (
            response.events.includes(
              'databases.*.collections.*.documents.*.update'
            )
          ) {
            setGameState(response.payload);
          }
        });
      } catch (e) {
        // Socket not open yet — wait 1s and try again
        retryRef.current = setTimeout(subscribe, 1000);
      }
    }

    subscribe();

    // Cleanup: cancel subscription and any pending retry on unmount
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [id]);

  if (!gameState) {
    return (
      <View style={styles.center}>
        <Text>Loading game...</Text>
      </View>
    );
  }

  if (gameState.phase === 'setup') {
    return <SetupPhase gameState={gameState} gameId={id} />;
  }

  return <Board gameState={gameState} gameId={id} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
