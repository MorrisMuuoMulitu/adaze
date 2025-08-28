import fs from 'fs';
import path from 'path';
import { User } from '@/types';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Ensure the data directory exists
const dataDir = path.dirname(usersFilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, '[]');
}

export function getUsers(): User[] {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    // Handle the case where the file might be missing the opening bracket
    if (!data.trim().startsWith('[')) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

export function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users file:', error);
  }
}

export function findUserByEmail(email: string, role?: 'buyer' | 'trader' | 'transporter'): User | undefined {
  const users = getUsers();
  return users.find(user => {
    if (role) {
      return user.email === email && user.role === role;
    }
    return user.email === email;
  });
}

export function createUser(userData: User): void {
  const users = getUsers();
  const existingUser = findUserByEmail(userData.email, userData.role);
  if (existingUser) {
    throw new Error('User with this email and role already exists');
  }
  users.push(userData);
  saveUsers(users);
}
