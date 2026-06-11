// Strategia: app/_layout.jsx
// Created By: Josha Chapman-Dodson
// Date Created: 6/4/26

import 'react-native-url-polyfill/auto';
import { Stack } from 'expo-router';

// Suppress the INVALID_STATE_ERR that the Appwrite SDK throws when its
// internal heartbeat interval fires before the WebSocket finishes opening.
// The retry logic in app/game/[id].jsx handles recovery — this just
// prevents the error from surfacing as an uncaught exception and
// crashing the app in the meantime.
const originalError = global.ErrorUtils?.getGlobalHandler?.();

if (global.ErrorUtils) {
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (error?.message?.includes('INVALID_STATE_ERR')) return;
    if (originalError) originalError(error, isFatal);
  });
}

export default function RootLayout() {
  return <Stack />;
}
