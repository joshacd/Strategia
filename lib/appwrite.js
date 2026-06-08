import { Client, Account, Databases, Realtime } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your endpoint
  .setProject('YOUR_PROJECT_ID')               // Your project ID
  .setPlatform('com.yourname.stratego');        // Must match Appwrite platform setting

export const account = new Account(client);
export const databases = new Databases(client);
export const realtime = new Realtime(client);
export { client };

// IDs — keep these in one place
export const DB_ID     = 'stratego-db';
export const GAMES_COL = 'games';