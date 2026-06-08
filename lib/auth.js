// Strategia: lib/auth.js
// Created By: Josha Chapman-Dodson
// Date Created: 6/4/26

import { ID } from 'react-native-appwrite';
import { account } from './appwrite';

export async function register(email, password, name) {
	await account.create(ID.unique(), email, password, name);
	return login(email, password);
}

export async function login(email, password) {
	return account.createEmailPasswordSession(email, password);
}

export async function logout() {
	return account.deleteSession('current');
}

export async function getCurrentUser() {
	try {
		return await account.get();
	} catch {
		return null;
	}
}