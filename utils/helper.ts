import net from 'net';
import { getBaseHostname } from '../services/xui.service';

export function ClearRegExp(pattern: string, flags: string = ''): RegExp {
  const escapeRegExp = (string: string): string =>
    string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
  return new RegExp(`^${escapeRegExp(pattern)}$`, flags);
}

export function getExpireDate(durationDays: number = 180) {
  const currentDate = new Date();
  const futureDate = new Date(currentDate);

  if (durationDays === 0) {
    futureDate.setHours(currentDate.getHours() + 1);
  } else {
    futureDate.setDate(currentDate.getDate() + durationDays);
  }

  return futureDate;
}

// Function to generate the client URI
export function generateClientUri(response: any, baseUrl: string) {
  if (!response || !response.obj) {
    return '';
  }
  const { protocol, port, remark, settings, streamSettings } = response.obj;

  // Parse the settings and streamSettings
  const settingsObj = JSON.parse(settings);
  const streamSettingsObj = JSON.parse(streamSettings);

  // Extract the client UUID
  const clientId = settingsObj.clients[0].id;

  // Extract network and security settings
  const network = streamSettingsObj.network || 'tcp';
  const security = streamSettingsObj.security || 'none';

  // Define the host (replace with your server's IP or domain)
  const host = baseUrl;

  // Generate the URI
  const uri = `${protocol}://${clientId}@${host}:${port}?encryption=none&security=${security}&type=${network}&headerType=none#${remark}`;

  return uri;
}

// Function to check if a port is in use
export function isPortInUse(host: string, port: number) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    // If the connection succeeds, the port is in use
    socket.connect(port, host, () => {
      socket.destroy(); // Close the connection
      resolve(true); // Port is in use
    });

    // If the connection fails, the port is available
    socket.on('error', () => {
      resolve(false); // Port is not in use
    });

    // Set a timeout to avoid hanging if the server doesn't respond
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false); // Assume port is not in use if the connection times out
    });
  });
}

// Function to generate a unique random port
export async function generateUniquePort() {
  const minPort = 10000; // Minimum port number
  const maxPort = 65535; // Maximum port number

  while (true) {
    const port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
    const hostname = await getBaseHostname();
    if (!(await isPortInUse(hostname, port))) {
      return port; // Return the unique port
    }
  }
}

export const generateRandomString = (length: number): string => {
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
