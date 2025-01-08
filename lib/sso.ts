import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { signToken } from './jwt';

interface Client {
  clientId: string;
  clientSecret: string;
  name: string;
  redirectUrls: string[];
  allowedOrigins: string[];
}

interface Clients {
  clients: Client[];
}

// Read clients from JSON file
const getClients = (): Clients => {
  const filePath = path.join(process.cwd(), 'clients.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
};

// Validate client and origin
export const validateClient = (clientId: string, origin: string): boolean => {
  const { clients } = getClients();
  const client = clients.find(c => c.clientId === clientId);
  
  if (!client) return false;
  return client.allowedOrigins.includes(origin);
};

// Validate redirect URL
export const validateRedirectUrl = (clientId: string, redirectUrl: string): boolean => {
  const { clients } = getClients();
  const client = clients.find(c => c.clientId === clientId);
  
  if (!client) return false;
  return client.redirectUrls.includes(redirectUrl);
};

// Get client by ID
export const getClient = (clientId: string): Client | null => {
  const { clients } = getClients();
  return clients.find(c => c.clientId === clientId) || null;
};

// Generate SSO token
export const generateToken = async (userId: string, clientId: string): Promise<string> => {
  return await signToken({ 
    userId,
    clientId,
    iat: Math.floor(Date.now() / 1000),
  });
};

// Check if user is already authenticated
export const isAuthenticated = async (): Promise<string | null> => {
  const cookieStore = cookies();
  return (await cookieStore).get('userId')?.value || null;
};
