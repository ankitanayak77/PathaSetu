const PROJECT_ID_RE = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
const APP_ID_RE = /^1:\d+:web:[a-zA-Z0-9]+$/;

function localEmulator(raw, fallbackPort) {
  if (!raw) return null;
  const match = /^(localhost|127\.0\.0\.1):(\d{1,5})$/.exec(raw);
  if (!match) throw new Error('Firebase emulator hosts must use localhost or 127.0.0.1 with an explicit port.');
  const port = Number(match[2]);
  if (port < 1 || port > 65535) throw new Error('Firebase emulator port is invalid.');
  return { host: match[1], port, url: `http://${match[1]}:${port}`, fallbackPort };
}

export function firebaseWebConfig(env = process.env) {
  const projectId = String(env.FIREBASE_PROJECT_ID || '').trim();
  const apiKey = String(env.FIREBASE_WEB_API_KEY || '').trim();
  const appId = String(env.FIREBASE_WEB_APP_ID || '').trim();
  const authDomain = String(env.FIREBASE_AUTH_DOMAIN || (projectId ? `${projectId}.firebaseapp.com` : '')).trim();
  const anyConfig = Boolean(projectId || apiKey || appId || env.FIREBASE_AUTH_DOMAIN);
  if (!anyConfig) return { enabled: false };
  if (!projectId || !apiKey || !appId) return { enabled: false };
  if (!PROJECT_ID_RE.test(projectId)) throw new Error('FIREBASE_PROJECT_ID is missing or invalid.');
  if (apiKey.length < 10 || apiKey.length > 128) throw new Error('FIREBASE_WEB_API_KEY is missing or invalid.');
  if (!APP_ID_RE.test(appId)) throw new Error('FIREBASE_WEB_APP_ID is missing or invalid.');
  if (!/^[a-z0-9.-]+$/.test(authDomain) || authDomain.includes('..')) throw new Error('FIREBASE_AUTH_DOMAIN is invalid.');
  const authEmulator = localEmulator(env.FIREBASE_AUTH_EMULATOR_HOST, 9099);
  const firestoreEmulator = localEmulator(env.FIRESTORE_EMULATOR_HOST, 8080);
  return {
    enabled: true,
    web: { apiKey, authDomain, projectId, appId },
    emulators: {
      ...(authEmulator ? { auth: authEmulator.url } : {}),
      ...(firestoreEmulator ? { firestore: { host: firestoreEmulator.host, port: firestoreEmulator.port } } : {})
    }
  };
}

export function firebaseConnectSources(config) {
  if (!config?.enabled) return "'self'";
  const authDomain = `https://${config.web.authDomain}`;
  return `'self' ${authDomain} https://www.gstatic.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://www.googleapis.com${config.emulators?.auth ? ` ${config.emulators.auth}` : ''}${config.emulators?.firestore ? ` http://${config.emulators.firestore.host}:${config.emulators.firestore.port}` : ''}`;
}
