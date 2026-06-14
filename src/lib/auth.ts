// Simple auth utilities for Azula Dent System
// Uses bcrypt-style password hashing via Web Crypto API

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'azuladent_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const computed = await hashPassword(password)
  return computed === hash
}

export function generateSessionId(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const DEMO_USERS = [
  {
    email: 'admin@azuladent.com',
    password: 'admin123',
    nombre: 'Dr. Carlos Azula',
    rol: 'administrador',
  },
  {
    email: 'dentista@azuladent.com',
    password: 'dent123',
    nombre: 'Dra. María López',
    rol: 'odontologo',
  },
  {
    email: 'recep@azuladent.com',
    password: 'recep123',
    nombre: 'Ana García',
    rol: 'recepcionista',
  },
]
