// Strategia: app/lobby.jsx
// Created By: Josha Chapman-Dodson
// Date Created: 6/5/26

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { getCurrentUser, logout } from '../lib/auth';
import { createGame, joinGame } from '../lib/game';

export default function Lobby() {
  const [user,    setUser]    = useState(null);
  const [gameId,  setGameId]  = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  async function handleCreate() {
    if (!user) return;
    setLoading(true);
    try {
      const game = await createGame(user.$id);
      router.push(`/game/${game.$id}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!user || !gameId.trim()) {
      Alert.alert('Error', 'Please enter a Game ID.');
      return;
    }
    setLoading(true);
    try {
      await joinGame(gameId.trim(), user.$id);
      router.push(`/game/${gameId.trim()}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Strategia</Text>
      {user && <Text style={styles.welcome}>Welcome, {user.name}</Text>}

      <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : '+ Create New Game'}</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or join existing</Text>
        <View style={styles.line} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter Game ID"
        value={gameId}
        onChangeText={setGameId}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.secondaryButton} onPress={handleJoin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Joining...' : 'Join Game'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 2,
  },
  welcome: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#6B7280',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 13,
  },
  logoutButton: {
    marginTop: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
  },
});
