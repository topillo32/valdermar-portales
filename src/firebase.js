// Conexión con Firebase: inicio de sesión (correo y Google), partida guardada y récords.
// La configuración web de Firebase es pública por diseño; la seguridad la ponen las reglas de Firestore.
const VER = '10.12.2';
const firebaseConfig = {
  apiKey: 'AIzaSyBnh-NtMoeghEsG4ILKaiWK2CHh3EJjTls',
  authDomain: 'criptas-varnhal-7341.firebaseapp.com',
  projectId: 'criptas-varnhal-7341',
  storageBucket: 'criptas-varnhal-7341.firebasestorage.app',
  messagingSenderId: '53254611012',
  appId: '1:53254611012:web:cbfb28d5250b6ab75f5c11',
};

const ERRORS = {
  'auth/invalid-email': 'El correo no es válido.',
  'auth/missing-password': 'Escribe una contraseña.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Prueba a entrar.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No hay ninguna cuenta con ese correo.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento y vuelve a probar.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase todavía.',
  'auth/operation-not-allowed': 'Este método de acceso no está activado en Firebase todavía.',
  'auth/network-request-failed': 'Sin conexión con el servidor.',
  'auth/configuration-not-found': 'El inicio de sesión aún no está activado en Firebase.',
};
const nice = e => ERRORS[e && e.code] || (e && e.message) || 'Algo salió mal.';

async function boot() {
  const [appM, authM, fsM] = await Promise.all([
    import(/* @vite-ignore */ `https://www.gstatic.com/firebasejs/${VER}/firebase-app.js`),
    import(/* @vite-ignore */ `https://www.gstatic.com/firebasejs/${VER}/firebase-auth.js`),
    import(/* @vite-ignore */ `https://www.gstatic.com/firebasejs/${VER}/firebase-firestore.js`),
  ]);
  const app = appM.initializeApp(firebaseConfig);
  const auth = authM.getAuth(app);
  auth.languageCode = 'es';
  const db = fsM.getFirestore(app);
  const { doc, getDoc, setDoc, deleteDoc, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } = fsM;

  let user = null;
  const listeners = new Set();
  const displayName = u => (u && (u.displayName || (u.email || '').split('@')[0]) || 'Aventurero').slice(0, 24);
  authM.onAuthStateChanged(auth, u => {
    user = u;
    const info = u ? { uid: u.uid, name: displayName(u), email: u.email } : null;
    for (const fn of listeners) fn(info);
  });

  const wrap = fn => async (...a) => { try { return await fn(...a) } catch (e) { throw new Error(nice(e)) } };

  window.FB = {
    online: true,
    onUser(fn) { listeners.add(fn); fn(user ? { uid: user.uid, name: displayName(user), email: user.email } : null); return () => listeners.delete(fn) },
    signIn: wrap((email, pass) => authM.signInWithEmailAndPassword(auth, email, pass)),
    signUp: wrap(async (email, pass, name) => {
      const cred = await authM.createUserWithEmailAndPassword(auth, email, pass);
      const n = (name || '').trim().slice(0, 24);
      if (n) { await authM.updateProfile(cred.user, { displayName: n }); }
      // fuerza a los oyentes a ver el nombre nuevo
      for (const fn of listeners) fn({ uid: cred.user.uid, name: displayName(cred.user), email: cred.user.email });
    }),
    google: wrap(() => authM.signInWithPopup(auth, new authM.GoogleAuthProvider())),
    reset: wrap(email => authM.sendPasswordResetEmail(auth, email)),
    signOut: wrap(() => authM.signOut(auth)),
    loadSave: wrap(async () => { if (!user) return null; const s = await getDoc(doc(db, 'saves', user.uid)); return s.exists() ? s.data() : null }),
    writeSave: wrap(async data => { if (!user) throw { message: 'Inicia sesión para guardar en la nube.' }; await setDoc(doc(db, 'saves', user.uid), data) }),
    deleteSave: wrap(async () => { if (user) await deleteDoc(doc(db, 'saves', user.uid)) }),
    submitScore: wrap(async s => {
      if (!user) return;
      await addDoc(collection(db, 'scores'), { uid: user.uid, name: displayName(user), cls: String(s.cls), depth: s.depth | 0, lvl: s.lvl | 0, kills: s.kills | 0, gold: s.gold | 0, at: serverTimestamp() });
    }),
    topScores: wrap(async () => {
      const q = query(collection(db, 'scores'), orderBy('depth', 'desc'), limit(25));
      const rows = (await getDocs(q)).docs.map(d => d.data());
      rows.sort((a, b) => b.depth - a.depth || b.lvl - a.lvl || b.kills - a.kills);
      return rows.slice(0, 10);
    }),
  };
  window.dispatchEvent(new Event('fb-ready'));
}

boot().catch(err => {
  console.warn('Firebase no disponible, se usa el guardado local.', err);
  window.dispatchEvent(new Event('fb-failed'));
});
