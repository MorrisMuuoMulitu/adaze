import bcrypt from 'bcryptjs';

// Simple in-memory store for demo purposes (replace with database in production)
export const users: any[] = [];

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function findUserByEmail(email: string): any {
  return users.find(user => user.email === email);
}

export function createUser(userData: any): void {
  users.push(userData);
}
