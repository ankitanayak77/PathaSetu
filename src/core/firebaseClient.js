import { cloudLearnerId, mergeCloudAttempts, toCloudAttempt } from './cloudProgress.js';

const FIREBASE_SDK_VERSION = '13.0.0';
const FIREBASE_CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;

async function loadFirebaseSdk() {
  const [app, auth, firestore] = await Promise.all([
    import(`${FIREBASE_CDN}/firebase-app.js`),
    import(`${FIREBASE_CDN}/firebase-auth.js`),
    import(`${FIREBASE_CDN}/firebase-firestore.js`)
  ]);
  return { app, auth, firestore };
}

export async function createFirebaseClient(config, sdkLoader = loadFirebaseSdk) {
  if (!config?.enabled) return null;
  const { app: appSdk, auth: authSdk, firestore: firestoreSdk } = await sdkLoader();
  const app = appSdk.initializeApp(config.web);
  const auth = authSdk.getAuth(app);
  await authSdk.setPersistence(auth, authSdk.browserSessionPersistence);
  const db = firestoreSdk.getFirestore(app);

  if (config.emulators?.auth) authSdk.connectAuthEmulator(auth, config.emulators.auth, { disableWarnings: true });
  if (config.emulators?.firestore) {
    firestoreSdk.connectFirestoreEmulator(db, config.emulators.firestore.host, config.emulators.firestore.port);
  }

  async function signInWithGoogle() {
    const provider = new authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await authSdk.signInWithRedirect(auth, provider);
  }

  async function completeRedirect() { return authSdk.getRedirectResult(auth); }
  function watchUser(callback, onError = () => {}) { return authSdk.onAuthStateChanged(auth, callback, onError); }
  async function signOutGuardian() { return authSdk.signOut(auth); }

  async function syncLearnerProgress({ user, profileId, answers }) {
    if (!user?.uid) throw new Error('guardian_sign_in_required');
    const learnerId = cloudLearnerId(profileId);
    if (!learnerId) throw new Error('invalid_learner_profile');
    const attemptsRef = firestoreSdk.collection(db, 'guardians', user.uid, 'learners', learnerId, 'attempts');
    const snapshot = await firestoreSdk.getDocs(firestoreSdk.query(attemptsRef, firestoreSdk.orderBy('submittedAt', 'desc'), firestoreSdk.limit(500)));
    const cloudAnswers = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data(), mode: 'CLOUD_SYNCED_PROGRESS' }));
    const mergedAnswers = mergeCloudAttempts(answers, cloudAnswers, 500);
    const writes = mergedAnswers.map((answer) => ({ id: answer.id, data: toCloudAttempt(answer) })).filter((entry) => entry.data);
    for (let offset = 0; offset < writes.length; offset += 400) {
      const batch = firestoreSdk.writeBatch(db);
      for (const entry of writes.slice(offset, offset + 400)) batch.set(firestoreSdk.doc(attemptsRef, entry.id), entry.data);
      await batch.commit();
    }
    return { answers: mergedAnswers, count: writes.length };
  }

  async function deleteLearnerProgress({ user, profileId }) {
    if (!user?.uid) throw new Error('guardian_sign_in_required');
    const learnerId = cloudLearnerId(profileId);
    if (!learnerId) throw new Error('invalid_learner_profile');
    const attemptsRef = firestoreSdk.collection(db, 'guardians', user.uid, 'learners', learnerId, 'attempts');
    let deleted = 0;
    for (;;) {
      const snapshot = await firestoreSdk.getDocs(firestoreSdk.query(attemptsRef, firestoreSdk.limit(400)));
      if (snapshot.empty) break;
      const batch = firestoreSdk.writeBatch(db);
      snapshot.docs.forEach((entry) => batch.delete(entry.ref));
      await batch.commit();
      deleted += snapshot.size;
    }
    return deleted;
  }

  return { auth, db, completeRedirect, signInWithGoogle, watchUser, signOutGuardian, syncLearnerProgress, deleteLearnerProgress };
}
