import { google } from 'googleapis';

export async function getDriveAuth() {
  const jsonStr = process.env.CREDENTIAL_JSON || '{}';
  const credentials = JSON.parse(jsonStr);
  
  // Fix for private key newlines if they are literal \n
  const privateKey = credentials.private_key?.replace(/\\n/g, '\n');

  if (!credentials.client_email || !privateKey) {
    console.error("[Drive Auth] ❌ Faltan credenciales (email o private_key)");
  }

  return new google.auth.JWT({
    email: credentials.client_email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

export async function getGoogleDriveClient() {
  const auth = await getDriveAuth();
  return google.drive({ version: 'v3', auth });
}
