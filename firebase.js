/**
 * firebase.js
 * Menginisialisasi Firebase secara async dan mengekspos
 * helper ke window.FB agar bisa dipakai app.js.
 *
 * CATATAN KEAMANAN:
 * - Untuk produksi, aktifkan Firebase Security Rules di Firestore Console
 *   agar hanya user yang terautentikasi yang bisa menulis data.
 * - Jangan simpan API key di sini jika repo bersifat publik;
 *   gunakan environment variable atau Firebase Hosting config.
 */

import { initializeApp }                        from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously,
         signInWithCustomToken }                from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc,
         setDoc, getDoc, onSnapshot, query }    from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

async function initFirebase() {
  // Jika tidak ada config (misal: buka langsung sebagai file lokal), skip.
  if (typeof __firebase_config === 'undefined') {
    console.warn("[Firebase] Config tidak ditemukan. Berjalan dalam mode lokal.");
    window.dispatchEvent(new CustomEvent('firebase-ready', { detail: { ok: false } }));
    return;
  }

  try {
    const config = JSON.parse(__firebase_config);
    const app    = initializeApp(config);
    const auth   = getAuth(app);
    const db     = getFirestore(app);
    const appId  = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // Auth: gunakan custom token jika tersedia, fallback ke anonim
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }

    // Ekspos API terbatas — hanya fungsi yang dibutuhkan app.js
    window.FB = {
      db, appId,
      collection, doc,
      setDoc, getDoc,
      onSnapshot, query,
    };

    window.dispatchEvent(new CustomEvent('firebase-ready', { detail: { ok: true } }));
    console.log("[Firebase] Siap.");

  } catch (err) {
    console.error("[Firebase] Gagal inisialisasi:", err);
    window.dispatchEvent(new CustomEvent('firebase-ready', { detail: { ok: false } }));
  }
}

initFirebase();
