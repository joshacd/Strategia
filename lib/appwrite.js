// Strategia: lib/appwrite.js
// Created By: Josha Chapman-Dodson
// Date Created: 6/4/26

import { Client, Account, Databases } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://sfo.cloud.appwrite.io/v1')
  .setProject('6a232103002e7f81aa32')          // ← Replace with your Appwrite Project ID
  .setPlatform('com.joshacd.strategia');  // ← Must match Appwrite Platform + app.json

export const account   = new Account(client);
export const databases = new Databases(client);
export { client };

// IDs — keep these in one place
export const DB_ID     = 'strategia-db';
export const GAMES_COL = 'games';
